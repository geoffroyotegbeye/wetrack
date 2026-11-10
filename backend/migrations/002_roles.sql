-- Rôles métier + activation des comptes
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
UPDATE users SET role = 'lecteur' WHERE role = 'user';
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'lecteur';
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'gestionnaire', 'agent_chine', 'agent_agence', 'lecteur'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS actif boolean NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login timestamptz;
