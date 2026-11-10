# Wetrack

Suivi logistique et gestion de colis Chine → Afrique (Webdadd).

- `frontend/` : React + Vite + Tailwind
- `backend/` : Node.js (Express) + PostgreSQL 16, dans Docker

## Démarrer

```bash
cp .env.example .env              # première fois uniquement, puis renseigner les secrets
docker compose up -d              # base de données (port 5434) + API (port 4000)
cd frontend && npm install && npm run dev   # interface sur http://localhost:5173
```

En développement, le code du backend est monté dans le conteneur (`docker-compose.override.yml`) :
l'API redémarre seule à chaque modification. Pour une exécution type production :
`docker compose -f docker-compose.yml up -d --build`.

## Données de démonstration

```bash
docker compose exec api npm run seed          # remplit la base si elle est vide
docker compose exec api npm run seed:reset    # vide les données métier et les recrée
```

## Rôles

| Rôle | Accès |
|---|---|
| Administrateur | Tout, y compris la gestion des utilisateurs |
| Gestionnaire | Toutes les opérations, sans la gestion des utilisateurs |
| Agent Chine | Colis (statuts jusqu'à « En transit »), scission, cargaisons |
| Agent agence | Colis (du dédouanement au retrait), notifications, clients |
| Lecture seule | Consultation ; rôle attribué aux inscriptions libres |

Les règles sont définies dans `backend/src/permissions.js` et appliquées par l'API ;
l'interface se contente de masquer ce qui n'est pas autorisé.

Comptes de démonstration (mot de passe `Demo-2026!`) : `operations@`, `logistique.chine@`,
`agent.cotonou@`, `consultation@` (domaine `wetrack.local`). L'administrateur est défini dans `.env`.

## Déploiement (Render + Neon)

1. **Neon** : créer un projet (même région que l'API Render, ici Ohio / us-east-2) et copier la chaîne de connexion **directe**
   (sans `-pooler`), en remplaçant `sslmode=require` par `sslmode=verify-full`.
2. **Render** : New → **Blueprint** → choisir ce dépôt. `render.yaml` crée `wetrack-api` et `wetrack-web`.
   Renseigner `DATABASE_URL`, `ADMIN_EMAIL` et `ADMIN_PASSWORD` ; le reste est automatique
   (secret JWT généré, URL de l'API et CORS reliés entre les deux services).
3. Les tables sont créées au premier démarrage de l'API.
4. Données de démo (facultatif) depuis son poste :
   `cd backend && DATABASE_URL="<neon>" JWT_SECRET=x SEED_PASSWORD="<mot de passe fort>" npm run seed`
