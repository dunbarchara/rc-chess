import { existsSync } from 'node:fs';
import { join } from 'node:path';
import express from 'express';

// Same depth from src/ (dev) and dist/ (built): backend/{src,dist} -> repo root.
const DEFAULT_FRONTEND_DIR = join(import.meta.dirname, '../../frontend/dist');

export function createApp({ isProd, frontendDir = DEFAULT_FRONTEND_DIR }: { isProd: boolean; frontendDir?: string }): express.Express {
  const app = express();
  app.disable('x-powered-by');
  if (isProd) app.set('trust proxy', 1); // behind Disco's reverse proxy

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Serve the built frontend, falling back to index.html so client-side routes work on reload.
  if (existsSync(frontendDir)) {
    app.use(express.static(frontendDir));
    app.get(/^(?!\/api(\/|$)).*/, (_req, res) => {
      res.sendFile(join(frontendDir, 'index.html'));
    });
  }
  return app;
}
