import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { WebSocket } from 'ws';
import { createApp } from './app.js';
import { Hub } from './hub.js';
import { attachWebSocket, WS_PATH } from './ws.js';

const open: WebSocket[] = [];
let closeServer: (() => void) | undefined;

afterEach(() => {
  for (const s of open.splice(0)) s.terminate();
  closeServer?.();
  closeServer = undefined;
});

function start(): number {
  const server = createApp({ isProd: false }).listen(0);
  const wss = attachWebSocket(server, new Hub());
  closeServer = () => {
    wss.close();
    server.close();
  };
  return (server.address() as AddressInfo).port;
}

interface Client {
  socket: WebSocket;
  next: () => Promise<any>;
}

async function connect(port: number): Promise<Client> {
  const socket = new WebSocket(`ws://127.0.0.1:${port}${WS_PATH}`);
  open.push(socket);
  // Queue messages from the moment of creation so none are missed.
  const queue: any[] = [];
  const waiters: Array<(m: any) => void> = [];
  socket.on('message', (d) => {
    const m = JSON.parse(d.toString());
    const w = waiters.shift();
    if (w) w(m);
    else queue.push(m);
  });
  await new Promise<void>((resolve, reject) => {
    socket.once('open', resolve);
    socket.once('error', reject);
  });
  return {
    socket,
    next: () => (queue.length ? Promise.resolve(queue.shift()) : new Promise((r) => waiters.push(r))),
  };
}

describe('websocket', () => {
  it('sends a welcome with a connection id and empty state', async () => {
    const c = await connect(start());
    const msg = await c.next();
    expect(msg.type).toBe('welcome');
    expect(typeof msg.connId).toBe('number');
    expect(msg.state.teams).toEqual({ white: 0, black: 0 });
  });

  it('broadcasts team joins and vote changes to every client', async () => {
    const port = start();
    const a = await connect(port);
    const b = await connect(port);
    await a.next(); // welcome
    await b.next();

    a.socket.send(JSON.stringify({ type: 'join', team: 'white' }));
    expect((await a.next()).state.teams.white).toBe(1);
    expect((await b.next()).state.teams.white).toBe(1);

    a.socket.send(JSON.stringify({ type: 'vote', option: 'e4' }));
    expect((await b.next()).state.votes.white).toEqual({ e4: 1 });

    a.socket.send(JSON.stringify({ type: 'vote', option: 'd4' }));
    expect((await b.next()).state.votes.white).toEqual({ d4: 1 });
  });

  it('removes a connection and its vote when it disconnects', async () => {
    const port = start();
    const a = await connect(port);
    const b = await connect(port);
    await a.next();
    await b.next();

    a.socket.send(JSON.stringify({ type: 'join', team: 'black' }));
    await b.next();
    a.socket.send(JSON.stringify({ type: 'vote', option: 'e5' }));
    await b.next();

    a.socket.close();
    const after = await b.next();
    expect(after.state.teams.black).toBe(0);
    expect(after.state.votes.black).toEqual({});
  });

  it('ignores malformed or invalid messages', async () => {
    const port = start();
    const a = await connect(port);
    await a.next();

    a.socket.send('not json');
    a.socket.send(JSON.stringify({ type: 'join', team: 'purple' }));
    a.socket.send(JSON.stringify({ type: 'vote', option: 42 }));
    // A valid message afterwards is the first thing broadcast.
    a.socket.send(JSON.stringify({ type: 'join', team: 'black' }));
    expect((await a.next()).state.teams).toEqual({ white: 0, black: 1 });
  });
});
