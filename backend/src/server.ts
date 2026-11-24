import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { Hub } from './hub.js';
import { RustEngine } from './rust.js';
import { attachWebSocket } from './ws.js';

const config = loadConfig();
const engine = new RustEngine(config.rustEngineBin);
const server = createApp({ isProd: config.isProd, engine }).listen(config.port, () => {
  console.log(`rc-chess listening on :${config.port} (${config.isProd ? 'production' : 'development'})`);
});
const wss = attachWebSocket(server, new Hub());

// Disco stops the old container with SIGTERM on every deploy.
function shutdown(signal: string): void {
  console.log(`${signal} received, shutting down`);
  // Websockets never go idle, so server.close() would wait forever without this.
  for (const client of wss.clients) client.terminate();
  wss.close();
  engine.close();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
