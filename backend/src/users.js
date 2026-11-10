import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from './db.js';
import { HttpError, ah } from './http.js';
import { EMAIL_RE, MIN_PASSWORD, publicUser, requireRole } from './auth.js';
import { ROLES, ROLE_KEYS, PAGES, ENTITY_PERMS, COLIS_STATUTS } from './permissions.js';

// Gestion des utilisateurs — réservée à l'administrateur.
export const usersRouter = Router();
usersRouter.use(requireRole('admin'));

const checkRole = (role) => {
  if (!ROLE_KEYS.includes(role)) throw new HttpError(400, 'Rôle invalide.');
  return role;
};

// Référentiel des rôles (libellés, pages, droits) pour l'écran d'administration.
usersRouter.get('/roles', (_req, res) => {
  res.json({
    roles: ROLE_KEYS.map((key) => ({
      key,
      ...ROLES[key],
      pages: Object.keys(PAGES).filter((p) => PAGES[p].includes(key)),
      write: Object.keys(ENTITY_PERMS).filter((e) => ENTITY_PERMS[e].write.includes(key)),
      statuts_colis: COLIS_STATUTS[key],
    })),
  });
});

usersRouter.get('/', ah(async (_req, res) => {
  const { rows } = await query('SELECT * FROM users ORDER BY actif DESC, role, full_name NULLS LAST, email');
  res.json({ items: rows.map(publicUser) });
}));

usersRouter.post('/', ah(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const fullName = req.body?.full_name ? String(req.body.full_name).trim() : null;
  const role = checkRole(req.body?.role || 'lecteur');
  if (!EMAIL_RE.test(email)) throw new HttpError(400, 'Adresse email invalide.');
  if (password.length < MIN_PASSWORD) throw new HttpError(400, `Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.`);
  const { rows } = await query(
    `INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING RETURNING *`,
    [email, await bcrypt.hash(password, 12), fullName, role],
  );
  if (!rows[0]) throw new HttpError(409, 'Un compte existe déjà avec cet email.');
  res.status(201).json(publicUser(rows[0]));
}));

usersRouter.patch('/:id', ah(async (req, res) => {
  const isSelf = req.params.id === req.user.id;
  const sets = [];
  const params = [];
  const add = (col, value) => { params.push(value); sets.push(`${col} = $${params.length}`); };

  if (req.body.full_name !== undefined) add('full_name', String(req.body.full_name).trim() || null);
  if (req.body.role !== undefined) {
    const role = checkRole(req.body.role);
    if (isSelf && role !== 'admin') throw new HttpError(400, 'Vous ne pouvez pas retirer votre propre rôle administrateur.');
    add('role', role);
  }
  if (req.body.actif !== undefined) {
    if (isSelf && !req.body.actif) throw new HttpError(400, 'Vous ne pouvez pas désactiver votre propre compte.');
    add('actif', Boolean(req.body.actif));
  }
  if (req.body.password !== undefined) {
    const password = String(req.body.password);
    if (password.length < MIN_PASSWORD) throw new HttpError(400, `Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.`);
    add('password_hash', await bcrypt.hash(password, 12));
  }
  if (!sets.length) throw new HttpError(400, 'Aucune modification.');

  // Toujours au moins un administrateur actif : vérifié avant d'enregistrer.
  const retireAdmin = (req.body.role !== undefined && req.body.role !== 'admin') || req.body.actif === false;
  if (retireAdmin) {
    const { rows: autres } = await query(
      `SELECT count(*)::int AS n FROM users WHERE role = 'admin' AND actif AND id <> $1`,
      [req.params.id],
    );
    if (autres[0].n === 0) throw new HttpError(400, 'Il doit rester au moins un administrateur actif.');
  }

  params.push(req.params.id);
  const { rows } = await query(
    `UPDATE users SET ${sets.join(', ')}, updated_date = now() WHERE id = $${params.length} RETURNING *`,
    params,
  );
  if (!rows[0]) throw new HttpError(404, 'Utilisateur introuvable.');
  res.json(publicUser(rows[0]));
}));
