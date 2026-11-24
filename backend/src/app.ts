import { existsSync } from 'node:fs';
import { join } from 'node:path';
import express from 'express';
import type { RustEngine } from './rust.js';

// Same depth from src/ (dev) and dist/ (built): backend/{src,dist} -> repo root.
const DEFAULT_FRONTEND_DIR = join(import.meta.dirname, '../../frontend/dist');

export function createApp({
  isProd,
  frontendDir = DEFAULT_FRONTEND_DIR,
  engine,
}: {
  isProd: boolean;
  frontendDir?: string;
  engine?: RustEngine;
}): express.Express {
  const app = express();
  app.disable('x-powered-by');
  if (isProd) app.set('trust proxy', 1); // behind Disco's reverse proxy

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  if (engine) {
    const reply = (res: express.Response, output: Promise<string>) =>
      output.then(
        (text) => res.type('text').send(text),
        (err: Error) => res.status(500).type('text').send(err.message),
      );
    app.get('/api/rust', (_req, res) => reply(res, engine.board()));
    app.post('/api/rust/move', express.json(), (req, res) => {
      if (typeof req.body?.move !== 'string') return void res.status(400).type('text').send('expected {"move": string}');
      return reply(res, engine.move(req.body.move));
    });
  }

  // Serve the built frontend, falling back to index.html so client-side routes work on reload.
  if (existsSync(frontendDir)) {
    app.use(express.static(frontendDir));
    app.get(/^(?!\/api(\/|$)).*/, (_req, res) => {
      res.sendFile(join(frontendDir, 'index.html'));
    });
  }
  return app;
}
