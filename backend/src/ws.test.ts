import type { AddressInfo } from 'node:net';
import { expect, it } from 'vitest';
import { WebSocket } from 'ws';
import { createApp } from './app.js';
import { Hub } from './hub.js';
import { attachWebSocket } from './ws.js';

function connect(port: number) {
  const socket = new WebSocket(`ws://127.0.0.1:${port}/api/ws`);
  const messages: any[] = [];
  socket.on('message', (d) => messages.push(JSON.parse(d.toString())));
  const opened = new Promise<void>((resolve) => socket.once('open', resolve));
  return { socket, messages, opened };
}

const until = async (cond: () => boolean) => {
  for (let i = 0; i < 100 && !cond(); i++) await new Promise((r) => setTimeout(r, 10));
  expect(cond()).toBe(true);
};

it('tracks joins and votes, and drops them on disconnect', async () => {
  const server = createApp({ isProd: false }).listen(0);
  const wss = attachWebSocket(server, new Hub());
  const port = (server.address() as AddressInfo).port;

  const a = connect(port);
  const b = connect(port);
  await Promise.all([a.opened, b.opened]);

  a.socket.send('not json'); // ignored
  a.socket.send(JSON.stringify({ type: 'join', team: 'white' }));
  await until(() => b.messages.at(-1)?.state.teams.white === 1);

  a.socket.send(JSON.stringify({ type: 'vote', option: 'e4' }));
  await until(() => b.messages.at(-1)?.state.votes.white.e4 === 1);

  a.socket.send(JSON.stringify({ type: 'vote', option: 'd4' }));
  await until(() => b.messages.at(-1)?.state.votes.white.d4 === 1);
  expect(b.messages.at(-1).state.votes.white.e4).toBeUndefined();

  a.socket.close();
  await until(() => b.messages.at(-1)?.state.teams.white === 0);

  b.socket.close();
  wss.close();
  server.close();
});
