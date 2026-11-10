-- Schéma initial Wetrack
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name     text,
  role          text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_date  timestamptz NOT NULL DEFAULT now(),
  updated_date  timestamptz NOT NULL DEFAULT now()
);

-- Les entités métier partagent la même structure : colonnes système + document JSONB.
-- Cela suit exactement le modèle attendu par le frontend (champs libres par entité).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['clients', 'commandes', 'colis', 'cargaisons', 'tracking_logs', 'notification_logs']
  LOOP
    EXECUTE format($f$
      CREATE TABLE IF NOT EXISTS %I (
        id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        data         jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_by   uuid REFERENCES users(id) ON DELETE SET NULL,
        created_date timestamptz NOT NULL DEFAULT now(),
        updated_date timestamptz NOT NULL DEFAULT now()
      )$f$, t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I USING gin (data jsonb_path_ops)', t || '_data_gin', t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (created_date DESC)', t || '_created_idx', t);
  END LOOP;
END $$;

-- Unicité des références (anti-doublons, CDC §2.2)
CREATE UNIQUE INDEX IF NOT EXISTS commandes_reference_uniq ON commandes ((data->>'reference')) WHERE data ? 'reference';
CREATE UNIQUE INDEX IF NOT EXISTS colis_reference_uniq     ON colis     ((data->>'reference')) WHERE data ? 'reference';

-- Accès fréquents
CREATE INDEX IF NOT EXISTS colis_statut_idx          ON colis ((data->>'statut'));
CREATE INDEX IF NOT EXISTS colis_commande_idx        ON colis ((data->>'commande_id'));
CREATE INDEX IF NOT EXISTS commandes_statut_idx      ON commandes ((data->>'statut'));
CREATE INDEX IF NOT EXISTS tracking_logs_colis_idx   ON tracking_logs ((data->>'colis_id'));
CREATE INDEX IF NOT EXISTS notification_statut_idx   ON notification_logs ((data->>'statut'));
