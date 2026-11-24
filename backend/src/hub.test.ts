import { describe, expect, it } from 'vitest';
import { Hub } from './hub.js';

describe('Hub', () => {
  it('counts team members', () => {
    const hub = new Hub();
    hub.join(hub.connect(), 'white');
    hub.join(hub.connect(), 'white');
    hub.join(hub.connect(), 'black');
    expect(hub.snapshot().teams).toEqual({ white: 2, black: 1 });
  });

  it('does not count connections that have not joined', () => {
    const hub = new Hub();
    hub.connect();
    expect(hub.snapshot().teams).toEqual({ white: 0, black: 0 });
  });

  it('tallies votes per team', () => {
    const hub = new Hub();
    const a = hub.connect();
    const b = hub.connect();
    const c = hub.connect();
    hub.join(a, 'white');
    hub.join(b, 'white');
    hub.join(c, 'black');
    hub.vote(a, 'e4');
    hub.vote(b, 'e4');
    hub.vote(c, 'e5');
    expect(hub.snapshot().votes).toEqual({ white: { e4: 2 }, black: { e5: 1 } });
  });

  it('moves a vote when the connection changes its mind', () => {
    const hub = new Hub();
    const a = hub.connect();
    hub.join(a, 'white');
    hub.vote(a, 'e4');
    hub.vote(a, 'd4');
    expect(hub.snapshot().votes.white).toEqual({ d4: 1 });
  });

  it('drops a vote when its connection leaves', () => {
    const hub = new Hub();
    const a = hub.connect();
    hub.join(a, 'white');
    hub.vote(a, 'e4');
    hub.leave(a);
    expect(hub.snapshot()).toEqual({ teams: { white: 0, black: 0 }, votes: { white: {}, black: {} } });
  });

  it('counts a reconnect as a separate connection', () => {
    const hub = new Hub();
    const first = hub.connect();
    hub.join(first, 'white');
    hub.vote(first, 'e4');
    const second = hub.connect();
    hub.join(second, 'white');
    hub.vote(second, 'e4');
    // Old connection has not been cleaned up yet: both count until leave() fires.
    expect(hub.snapshot().votes.white).toEqual({ e4: 2 });
    hub.leave(first);
    expect(hub.snapshot().votes.white).toEqual({ e4: 1 });
  });

  it('ignores votes before joining a team', () => {
    const hub = new Hub();
    const a = hub.connect();
    hub.vote(a, 'e4');
    hub.join(a, 'white');
    expect(hub.snapshot().votes.white).toEqual({});
  });

  it('clears the vote when switching teams', () => {
    const hub = new Hub();
    const a = hub.connect();
    hub.join(a, 'white');
    hub.vote(a, 'e4');
    hub.join(a, 'black');
    expect(hub.snapshot().votes).toEqual({ white: {}, black: {} });
  });
});
