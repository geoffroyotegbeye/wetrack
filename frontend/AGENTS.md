# AGENTS.md

## Project

WeTrack frontend (React + Vite + Tailwind). Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

## Key files

- `src/api/client.js`: frontend API client (auth, public settings), configured with `VITE_API_URL`.
- `vite.config.js`: Vite config.

## Development

- `npm run dev` to start the frontend.
- Reuse the existing API client before adding new integration paths.
