import { Router } from 'express';
import { query } from './db.js';
import { HttpError, ah } from './http.js';
import { can } from './permissions.js';
import { syncCommande } from './syncCommande.js';

// Nom d'entité côté frontend -> table PostgreSQL (liste blanche).
export const ENTITIES = {
  Client: 'clients',
  Commande: 'commandes',
  Colis: 'colis',
  Cargaison: 'cargaisons',
  TrackingLog: 'tracking_logs',
  NotificationLog: 'notification_logs',
};

const SYSTEM_COLUMNS = new Set(['id', 'created_date', 'updated_date', 'created_by']);

// Champs couverts par la recherche texte (?search=...) pour chaque entité.
const SEARCH_FIELDS = {
  Client: ['nom', 'code_client', 'telephone', 'email', 'ville', 'pays'],
  Commande: ['reference', 'client_nom', 'description'],
  Colis: ['reference', 'client_nom', 'commande_reference', 'description', 'cargo_code'],
  Cargaison: ['code', 'transporteur', 'origine', 'destination'],
  TrackingLog: ['colis_reference', 'lieu', 'note'],
  NotificationLog: ['colis_reference', 'client_nom', 'message', 'destinataire'],
};

// Échappe les jokers LIKE (% _ et l'antislash) pour une recherche littérale.
const escapeLike = (term) => term.replace(/[\\%_]/g, (c) => '\\' + c);

// Ajoute une condition « contient le texte » (insensible à la casse) sur les champs de recherche.
function addSearch(entity, search, params, where) {
  const term = String(search || '').trim();
  if (!term) return where;
  params.push(`%${escapeLike(term)}%`);
  const cond = SEARCH_FIELDS[entity].map((f) => `data->>'${f}' ILIKE $${params.length}`).join(' OR ');
  return where ? `${where} AND (${cond})` : `WHERE (${cond})`;
}
const FIELD_RE = /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/;
const MAX_LIMIT = 1000;

const tableFor = (name) => {
  const table = ENTITIES[name];
  if (!table) throw new HttpError(404, `Entité inconnue : ${name}`);
  return table;
};

const FORBIDDEN = "Vous n'avez pas les droits pour cette action.";

// Vérifie le droit demandé ('read' | 'write' | 'delete') et renvoie la table.
const authorize = (req, action) => {
  const name = req.params.entity;
  const table = tableFor(name);
  const role = req.user.role;
  const ok = action === 'delete' ? can.delete(role) : can[action](role, name);
  if (!ok) throw new HttpError(403, FORBIDDEN);
  return table;
};

// Périmètre « ses propres données » pour un client : renvoie une condition SQL (ou null).
// Le compte client est relié à une fiche Client via users.client_id.
function clientScope(req, params) {
  if (req.user.role !== 'client') return null;
  const clientId = req.user.client_id;
  if (!clientId) return 'FALSE';
  params.push(String(clientId));
  const p = '$' + params.length;
  switch (req.params.entity) {
    case 'Client':
      return 'id::text = ' + p;
    case 'Commande':
    case 'Colis':
      return "data->>'client_id' = " + p;
    case 'TrackingLog':
    case 'NotificationLog':
      return "data->>'colis_id' IN (SELECT id::text FROM colis WHERE data->>'client_id' = " + p + ')';
    default:
      return 'FALSE';
  }
}

const andWhere = (where, cond) => {
  if (!cond) return where;
  return where ? where + ' AND (' + cond + ')' : 'WHERE (' + cond + ')';
};

// Filtre exact + recherche texte + périmètre client.
const whereFor = (req, params) =>
  andWhere(
    addSearch(req.params.entity, req.query.search, params, buildWhere(parseJson(req.query.q, 'q'), params)),
    clientScope(req, params),
  );

// Un rôle ne peut appliquer que les statuts de colis qui le concernent.
const checkStatutColis = (req, data) => {
  if (req.params.entity !== 'Colis' || data.statut === undefined) return;
  if (!can.statutColis(req.user.role, data.statut)) {
    throw new HttpError(403, `Votre rôle ne permet pas d'appliquer le statut « ${data.statut} ».`);
  }
};

const field = (name) => {
  if (!FIELD_RE.test(name)) throw new HttpError(400, `Champ invalide : ${name}`);
  return name;
};

// Expression SQL d'un champ : colonne système ou clé du document JSONB.
const fieldExpr = (name) => (SYSTEM_COLUMNS.has(field(name)) ? name : `data->>'${name}'`);

// Retire les champs système d'un corps de requête.
const cleanData = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Objet JSON attendu.');
  const data = {};
  for (const [k, v] of Object.entries(body)) {
    if (!SYSTEM_COLUMNS.has(k)) data[field(k)] = v;
  }
  return data;
};

const toRecord = (row) => ({
  ...row.data,
  id: row.id,
  created_by: row.created_by,
  created_date: row.created_date,
  updated_date: row.updated_date,
});

const parseJson = (raw, label) => {
  if (raw === undefined || raw === '') return {};
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch {
    throw new HttpError(400, `Paramètre ${label} invalide.`);
  }
};

// Construit la clause WHERE à partir d'un filtre { champ: valeur | { $in: [...] } }.
function buildWhere(filter, params) {
  const clauses = [];
  for (const [key, value] of Object.entries(filter)) {
    const expr = fieldExpr(key);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (!Array.isArray(value.$in)) throw new HttpError(400, `Opérateur non pris en charge pour ${key}.`);
      params.push(value.$in.map(String));
      clauses.push(`${expr}::text = ANY($${params.length}::text[])`);
    } else if (value === null) {
      clauses.push(`${expr} IS NULL`);
    } else {
      params.push(String(value));
      clauses.push(`${expr}::text = $${params.length}`);
    }
  }
  return clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
}

function buildOrder(sort) {
  if (!sort) return 'ORDER BY created_date DESC';
  const desc = sort.startsWith('-');
  const name = desc ? sort.slice(1) : sort;
  return `ORDER BY ${fieldExpr(name)} ${desc ? 'DESC' : 'ASC'} NULLS LAST, created_date DESC`;
}

const parseLimit = (raw) => Math.min(Math.max(Number(raw) || 100, 1), MAX_LIMIT);

export const entitiesRouter = Router();

// Liste / filtre : GET /api/entities/:entity?q={...}&search=texte&sort=-champ&limit=10&skip=0
// Réponse : { items, total } — total = nombre d'éléments correspondant au filtre (pour la pagination).
entitiesRouter.get('/:entity', ah(async (req, res) => {
  const table = authorize(req, 'read');
  const params = [];
  const where = whereFor(req, params);
  const limit = parseLimit(req.query.limit);
  const skip = Math.max(Number(req.query.skip) || 0, 0);
  const [{ rows }, total] = await Promise.all([
    query(`SELECT * FROM ${table} ${where} ${buildOrder(req.query.sort)} LIMIT ${limit} OFFSET ${skip}`, params),
    query(`SELECT count(*)::int AS n FROM ${table} ${where}`, params),
  ]);
  res.json({ items: rows.map(toRecord), total: total.rows[0].n });
}));

// Comptage : GET /api/entities/:entity/count?q={...}
entitiesRouter.get('/:entity/count', ah(async (req, res) => {
  const table = authorize(req, 'read');
  const params = [];
  const where = whereFor(req, params);
  const { rows } = await query(`SELECT count(*)::int AS count FROM ${table} ${where}`, params);
  res.json({ count: rows[0].count });
}));

// Agrégation : GET /api/entities/:entity/aggregate?group_by=statut&sum=["cout_fret"]
entitiesRouter.get('/:entity/aggregate', ah(async (req, res) => {
  const table = authorize(req, 'read');
  const groupBy = field(String(req.query.group_by || ''));
  let sums = [];
  if (req.query.sum) {
    try { sums = [].concat(JSON.parse(req.query.sum)); } catch { sums = String(req.query.sum).split(','); }
  }
  const params = [];
  const where = whereFor(req, params);
  const sumCols = sums.map((s) => {
    const f = field(String(s).trim());
    return `, COALESCE(SUM(NULLIF(data->>'${f}', '')::numeric), 0)::float8 AS "sum_${f}"`;
  }).join('');
  const { rows } = await query(
    `SELECT ${fieldExpr(groupBy)} AS "${groupBy}", count(*)::int AS count${sumCols}
     FROM ${table} ${where} GROUP BY 1 ORDER BY count DESC`,
    params,
  );
  res.json({ rows });
}));

entitiesRouter.get('/:entity/:id', ah(async (req, res) => {
  const table = authorize(req, 'read');
  const params = [req.params.id];
  const scope = clientScope(req, params);
  const { rows } = await query(`SELECT * FROM ${table} WHERE id = $1` + (scope ? ' AND (' + scope + ')' : ''), params);
  if (!rows[0]) throw new HttpError(404, 'Enregistrement introuvable.');
  res.json(toRecord(rows[0]));
}));

entitiesRouter.post('/:entity', ah(async (req, res) => {
  const table = authorize(req, 'write');
  const data = cleanData(req.body);
  checkStatutColis(req, data);
  const { rows } = await query(
    `INSERT INTO ${table} (data, created_by) VALUES ($1, $2) RETURNING *`,
    [data, req.user.id],
  );
  if (req.params.entity === 'Colis') await syncCommande(rows[0].data.commande_id);
  res.status(201).json(toRecord(rows[0]));
}));

entitiesRouter.patch('/:entity/:id', ah(async (req, res) => {
  const table = authorize(req, 'write');
  const data = cleanData(req.body);
  checkStatutColis(req, data);
  const { rows } = await query(
    `UPDATE ${table} SET data = data || $1::jsonb, updated_date = now() WHERE id = $2 RETURNING *`,
    [data, req.params.id],
  );
  if (!rows[0]) throw new HttpError(404, 'Enregistrement introuvable.');
  if (req.params.entity === 'Colis') await syncCommande(rows[0].data.commande_id);
  res.json(toRecord(rows[0]));
}));

entitiesRouter.delete('/:entity/:id', ah(async (req, res) => {
  const table = authorize(req, 'delete');
  const { rows } = await query(`DELETE FROM ${table} WHERE id = $1 RETURNING data`, [req.params.id]);
  if (!rows[0]) throw new HttpError(404, 'Enregistrement introuvable.');
  if (req.params.entity === 'Colis') await syncCommande(rows[0].data.commande_id);
  res.status(204).end();
}));
