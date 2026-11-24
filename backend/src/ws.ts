import type { Server } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import { TEAMS, type Hub, type Team } from './hub.js';

export function attachWebSocket(server: Server, hub: Hub): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/api/ws' });

  const broadcast = () => {
    const msg = JSON.stringify({ type: 'state', state: hub.snapshot() });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) client.send(msg);
    }
  };

  wss.on('connection', (socket) => {
    const id = hub.connect();

    socket.on('message', (data) => {
      let msg;
      try {
        msg = JSON.parse(data.toString());
      } catch {
        return;
      }
      if (msg?.type === 'join' && TEAMS.includes(msg.team as Team)) hub.join(id, msg.team);
      else if (msg?.type === 'vote' && typeof msg.option === 'string') hub.vote(id, msg.option);
      else return;
      broadcast();
    });

    socket.on('close', () => {
      hub.leave(id);
      broadcast();
    });
  });

  return wss;
}
