import { api } from '@/api/client';

// Connexion email + mot de passe. Si le compte exige une double authentification,
// le serveur renvoie { mfa_required: true, mfa_session_token, ... } et aucun jeton.
export async function loginWithMfa(email, password) {
  const result = await api.auth.login({ email, password });
  if (result.access_token) api.auth.setToken(result.access_token);
  return result;
}
