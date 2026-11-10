// Client de l'API Wetrack (backend Node.js / PostgreSQL).
// En développement, Vite redirige /api vers le backend (voir vite.config.js).
// En production, définir VITE_API_URL si l'API est sur un autre domaine.

const RAW_API_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
const API_URL = RAW_API_URL && !/^https?:\/\//.test(RAW_API_URL) ? `https://${RAW_API_URL}` : RAW_API_URL;
const TOKEN_KEY = 'wetrack_token';

export const getAccessToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const setAccessToken = (token) => {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // stockage indisponible (navigation privée stricte)
  }
};

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const token = getAccessToken();
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Serveur injoignable. Vérifiez que le backend est démarré.', 0);
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // Jeton expiré ou invalide : on le retire pour revenir à l'écran de connexion.
    if (response.status === 401 && token) setAccessToken(null);
    throw new ApiError(data.message || 'Une erreur est survenue.', response.status, data);
  }
  return data;
}

const toQuery = (params) => {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'object' && Object.keys(value).length === 0) continue;
    qs.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
};

// CRUD générique : api.entities.<Entité>.list / filter / get / create / update / delete / count / aggregate
const entity = (name) => {
  const base = `/api/entities/${name}`;
  return {
    list: (opts, limit) => {
      const { sort, limit: l } = typeof opts === 'object' && opts !== null ? opts : { sort: opts, limit };
      return request(`${base}${toQuery({ sort, limit: l })}`);
    },
    filter: (q, { sort, limit, skip, search } = {}) => request(`${base}${toQuery({ q, sort, limit, skip, search })}`),
    get: (id) => request(`${base}/${encodeURIComponent(id)}`),
    create: (data) => request(base, { method: 'POST', body: data }),
    update: (id, data) => request(`${base}/${encodeURIComponent(id)}`, { method: 'PATCH', body: data }),
    delete: (id) => request(`${base}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    count: async (q) => (await request(`${base}/count${toQuery({ q })}`)).count,
    aggregate: ({ groupBy, sum, query } = {}) =>
      request(`${base}/aggregate${toQuery({ group_by: groupBy, sum, q: query })}`),
  };
};

const entities = new Proxy({}, { get: (cache, name) => (cache[name] ||= entity(String(name))) });

export const api = {
  entities,
  functions: {
    invoke: (name, payload) =>
      request(`/api/functions/${encodeURIComponent(name)}`, { method: 'POST', body: payload }),
  },
  users: {
    list: () => request('/api/users'),
    roles: () => request('/api/users/roles'),
    create: (data) => request('/api/users', { method: 'POST', body: data }),
    update: (id, data) => request(`/api/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: data }),
  },
  auth: {
    hasToken: () => Boolean(getAccessToken()),
    changePassword: (current_password, new_password) =>
      request('/api/auth/password', { method: 'POST', body: { current_password, new_password } }),
    setToken: setAccessToken,
    me: () => request('/api/auth/me'),
    login: async ({ email, password }) => {
      const result = await request('/api/auth/login', { method: 'POST', body: { email, password } });
      setAccessToken(result.access_token);
      return result;
    },
    register: async ({ email, password, full_name }) => {
      const result = await request('/api/auth/register', { method: 'POST', body: { email, password, full_name } });
      setAccessToken(result.access_token);
      return result;
    },
    logout: () => {
      setAccessToken(null);
      window.location.href = '/login';
    },
  },
};
