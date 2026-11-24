import type { Server } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import { TEAMS, type Hub, type Team } from './hub.js';

export const WS_PATH = '/api/ws';
const MAX_PAYLOAD_BYTES = 1024;
const MAX_OPTION_LENGTH = 200;
const HEARTBEAT_MS = 30_000;

function isTeam(value: unknown): value is Team {
  return typeof value === 'string' && (TEAMS as readonly string[]).includes(value);
}

export function attachWebSocket(server: Server, hub: Hub): WebSocketServer {
  const wss = new WebSocketServer({ server, path: WS_PATH, maxPayload: MAX_PAYLOAD_BYTES });
  const alive = new WeakSet<WebSocket>();

  const broadcast = (): void => {
    const msg = JSON.stringify({ type: 'state', state: hub.snapshot() });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) client.send(msg);
    }
  };

  wss.on('connection', (socket) => {
    const id = hub.connect();
    alive.add(socket);
    socket.on('pong', () => alive.add(socket));

    socket.send(JSON.stringify({ type: 'welcome', connId: id, state: hub.snapshot() }));

    socket.on('message', (data) => {
      let msg: unknown;
      try {
        msg = JSON.parse(data.toString());
      } catch {
        return;
      }
      if (typeof msg !== 'object' || msg === null) return;
      const { type, team, option } = msg as Record<string, unknown>;

      if (type === 'join' && isTeam(team)) {
        hub.join(id, team);
      } else if (type === 'vote' && typeof option === 'string' && option.length > 0 && option.length <= MAX_OPTION_LENGTH) {
        hub.vote(id, option);
      } else {
        return;
      }
      broadcast();
    });

    socket.on('close', () => {
      hub.leave(id);
      broadcast();
    });
    socket.on('error', () => socket.terminate());
  });

  // Drop dead sockets, and keep idle ones from being timed out by the proxy.
  const heartbeat = setInterval(() => {
    for (const client of wss.clients) {
      if (!alive.has(client)) {
        client.terminate();
        continue;
      }
      alive.delete(client);
      client.ping();
    }
  }, HEARTBEAT_MS);
  heartbeat.unref();
  wss.on('close', () => clearInterval(heartbeat));

  return wss;
}
