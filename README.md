# RC Chess

Crowd chess for RC: teams propose moves and the most popular one is played.

- `frontend/` — Vite + React + TypeScript + Tailwind.
- `backend/` — Node + Express. Serves the built frontend and `GET /api/health`.

## Realtime

Single global game over a websocket at `/api/ws`. Connections are anonymous; each gets an incrementing id, and a reconnect is a new connection (the old one's vote stops counting).

- Client → server: `{type:'join', team:'white'|'black'}`, `{type:'vote', option:string}` (one live vote per connection; voting again replaces it).
- Server → client: `{type:'welcome', connId, state}` on connect, then `{type:'state', state}` on every change. `state` is `{teams:{white,black}, votes:{white:{option:count}, black:{...}}}`.
- `/` shows join QR codes and buttons; `/join/white` and `/join/black` are the player pages.
- Vote options are opaque strings. Game rules and proposal logic live elsewhere.

## Develop

```
npm install
npm run dev     # web on :3000 (proxies /api to :3001), api on :3001
npm test
```

## Deploy (Disco)

`Dockerfile` builds both workspaces into one image serving everything on port 3000; `disco.json` declares the `web` service. Env vars are in `.env.example`.
