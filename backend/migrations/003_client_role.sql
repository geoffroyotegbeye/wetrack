-- Rôle « client » : un compte relié à une fiche client, qui ne voit que ses propres données.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'gestionnaire', 'agent_chine', 'agent_agence', 'lecteur', 'client'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS users_client_idx ON users (client_id);
CREATE INDEX IF NOT EXISTS colis_client_idx ON colis ((data->>'client_id'));
CREATE INDEX IF NOT EXISTS commandes_client_idx ON commandes ((data->>'client_id'));
