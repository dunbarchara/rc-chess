import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';

describe('app', () => {
  it('answers the health check', async () => {
    const server = createApp({ isProd: false }).listen(0);
    const { port } = server.address() as import('node:net').AddressInfo;
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    expect(await res.json()).toEqual({ status: 'ok' });
    server.close();
  });
});
