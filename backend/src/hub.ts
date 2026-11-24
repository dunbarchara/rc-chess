export type Team = 'white' | 'black';
export const TEAMS: readonly Team[] = ['white', 'black'];

interface Connection {
  team: Team | null;
  vote: string | null;
}

export interface Snapshot {
  teams: Record<Team, number>;
  votes: Record<Team, Record<string, number>>;
}

/**
 * In-memory registry of anonymous connections, their team, and their current vote.
 * Pure (no sockets) so it can be unit-tested directly.
 *
 * Vote options are opaque strings: this layer counts them, it never interprets them.
 * A reconnect is a brand-new connection; the old one is dropped via leave() and its
 * vote stops counting.
 */
export class Hub {
  private nextId = 1;
  private readonly connections = new Map<number, Connection>();

  connect(): number {
    const id = this.nextId++;
    this.connections.set(id, { team: null, vote: null });
    return id;
  }

  leave(id: number): void {
    this.connections.delete(id);
  }

  /** Joining (or switching) a team clears any vote cast for the previous team. */
  join(id: number, team: Team): void {
    const conn = this.connections.get(id);
    if (!conn) return;
    if (conn.team !== team) conn.vote = null;
    conn.team = team;
  }

  /** Replaces this connection's previous vote. Ignored until the connection has joined a team. */
  vote(id: number, option: string): void {
    const conn = this.connections.get(id);
    if (!conn || !conn.team) return;
    conn.vote = option;
  }

  snapshot(): Snapshot {
    const snap: Snapshot = {
      teams: { white: 0, black: 0 },
      votes: { white: {}, black: {} },
    };
    for (const { team, vote } of this.connections.values()) {
      if (!team) continue;
      snap.teams[team]++;
      if (vote !== null) snap.votes[team][vote] = (snap.votes[team][vote] ?? 0) + 1;
    }
    return snap;
  }
}
