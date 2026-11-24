# RC Chess

Crowd chess for RC: teams propose moves and the most popular one is played.

- `frontend/` — Vite + React + TypeScript + Tailwind.
- `backend/` — Node + Express. Serves the built frontend and `GET /api/health`.

## Develop

```
npm install
npm run dev     # web on :3000 (proxies /api to :3001), api on :3001
npm test
```

## Deploy (Disco)

`Dockerfile` builds both workspaces into one image serving everything on port 3000; `disco.json` declares the `web` service. Env vars are in `.env.example`.
