import { createApp } from './app.js';
import { loadConfig } from './config.js';

const config = loadConfig();
const server = createApp({ isProd: config.isProd }).listen(config.port, () => {
  console.log(`rc-chess listening on :${config.port} (${config.isProd ? 'production' : 'development'})`);
});

// Disco stops the old container with SIGTERM on every deploy.
function shutdown(signal: string): void {
  console.log(`${signal} received, shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
