import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { query } from './db.js';
import { HttpError, ah } from './http.js';
import { DEFAULT_ROLE, permissionsFor } from './permissions.js';

export const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  full_name: u.full_name,
  role: u.role,
  actif: u.actif,
  last_login: u.last_login,
  created_date: u.created_date,
});

const sign = (user) => jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD = 8;

// Hash factice : la vérification prend le même temps qu'un compte existe ou non.
const DUMMY_HASH = bcrypt.hashSync('wetrack-dummy-password', 12);

// Middleware : exige un jeton Bearer valide et un compte actif. Le rôle est relu en base
// à chaque requête, donc un changement de rôle ou une désactivation s'applique immédiatement.
export const requireAuth = ah(async (req, _res, next) => {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Authentification requise.');
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    throw new HttpError(401, 'Session expirée. Veuillez vous reconnecter.');
  }
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [payload.sub]);
  if (!rows[0]) throw new HttpError(401, 'Utilisateur introuvable.');
  if (!rows[0].actif) throw new HttpError(401, 'Ce compte est désactivé.');
  req.user = rows[0];
  next();
});

// Middleware : restreint une route à certains rôles.
export const requireRole = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.role)) return next(new HttpError(403, "Vous n'avez pas les droits pour cette action."));
  next();
};

export const authRouter = Router();

authRouter.post('/login', ah(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) throw new HttpError(400, 'Email et mot de passe requis.');
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  const ok = await bcrypt.compare(password, user?.password_hash || DUMMY_HASH);
  if (!user || !ok) throw new HttpError(401, 'Email ou mot de passe incorrect.');
  if (!user.actif) throw new HttpError(403, 'Ce compte est désactivé. Contactez un administrateur.');
  await query('UPDATE users SET last_login = now() WHERE id = $1', [user.id]);
  res.json({ access_token: sign(user), user: { ...publicUser(user), permissions: permissionsFor(user.role) } });
}));

authRouter.post('/register', ah(async (req, res) => {
  if (!config.allowRegistration) throw new HttpError(403, 'Les inscriptions sont désactivées.');
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const fullName = req.body?.full_name ? String(req.body.full_name).trim() : null;
  if (!EMAIL_RE.test(email)) throw new HttpError(400, 'Adresse email invalide.');
  if (password.length < MIN_PASSWORD) throw new HttpError(400, `Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.`);
  const hash = await bcrypt.hash(password, 12);
  // Une inscription libre reçoit toujours le rôle « lecture seule » ; un administrateur l'élève ensuite.
  const { rows } = await query(
    `INSERT INTO users (email, password_hash, full_name, role, last_login) VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (email) DO NOTHING RETURNING *`,
    [email, hash, fullName, DEFAULT_ROLE],
  );
  if (!rows[0]) throw new HttpError(409, 'Un compte existe déjà avec cet email.');
  res.status(201).json({ access_token: sign(rows[0]), user: { ...publicUser(rows[0]), permissions: permissionsFor(rows[0].role) } });
}));

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ ...publicUser(req.user), permissions: permissionsFor(req.user.role) });
});

// Changement de son propre mot de passe.
authRouter.post('/password', requireAuth, ah(async (req, res) => {
  const current = String(req.body?.current_password || '');
  const next = String(req.body?.new_password || '');
  if (!(await bcrypt.compare(current, req.user.password_hash))) throw new HttpError(400, 'Mot de passe actuel incorrect.');
  if (next.length < MIN_PASSWORD) throw new HttpError(400, `Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.`);
  await query('UPDATE users SET password_hash = $1, updated_date = now() WHERE id = $2', [await bcrypt.hash(next, 12), req.user.id]);
  res.json({ ok: true });
}));
