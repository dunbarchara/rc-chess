import type { AddressInfo } from 'node:net';
import { afterEach, expect, it } from 'vitest';
import { createApp } from './app.js';
import { RustEngine } from './rust.js';

// Stand-in for the Rust binary: same stdin/stdout protocol (output, then a "> " prompt).
const FAKE = `
  process.stdout.write('start\\n> ');
  require('readline').createInterface({ input: process.stdin }).on('line', (l) => {
    if (l === 'crash') process.exit(101);
    process.stdout.write('got ' + l + '\\nboard\\n\\n\\n> ');
  });
`;
const fake = () => new RustEngine(process.execPath, ['-e', FAKE]);

const engines: RustEngine[] = [];
afterEach(() => engines.splice(0).forEach((e) => e.close()));
const make = () => {
  const e = fake();
  engines.push(e);
  return e;
};

it('returns the starting board, then the output of each move', async () => {
  const e = make();
  expect(await e.board()).toBe('start\n');
  expect(await e.move('e2 e4')).toBe('got e2 e4\nboard\n\n\n');
  expect(await e.board()).toBe('got e2 e4\nboard\n\n\n');
});

it('keeps concurrent moves in order', async () => {
  const e = make();
  const outs = await Promise.all([e.move('a'), e.move('b'), e.move('c')]);
  expect(outs.map((o) => o.split('\n')[0])).toEqual(['got a', 'got b', 'got c']);
});

it('starts a fresh process after a crash', async () => {
  const e = make();
  await expect(e.move('crash')).rejects.toThrow(/exited/);
  expect(await e.board()).toBe('start\n');
});

it('reports a missing binary instead of crashing', async () => {
  const e = new RustEngine('/nonexistent/chess');
  await expect(e.board()).rejects.toThrow(/ENOENT/);
});

it('serves the engine over HTTP', async () => {
  const e = make();
  const server = createApp({ isProd: false, engine: e }).listen(0);
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/rust`;

  expect(await (await fetch(base)).text()).toBe('start\n');
  const res = await fetch(`${base}/move`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ move: 'e2 e4' }),
  });
  expect(await res.text()).toBe('got e2 e4\nboard\n\n\n');
  expect((await fetch(`${base}/move`, { method: 'POST' })).status).toBe(400);
  server.close();
});
