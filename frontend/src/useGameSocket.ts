import { useCallback, useEffect, useRef, useState } from 'react';

export type Team = 'white' | 'black';

export interface GameState {
  teams: Record<Team, number>;
  votes: Record<Team, Record<string, number>>;
}

export type ClientMessage = { type: 'join'; team: Team } | { type: 'vote'; option: string };

const EMPTY_STATE: GameState = { teams: { white: 0, black: 0 }, votes: { white: {}, black: {} } };

export function socketUrl(loc: Pick<Location, 'protocol' | 'host'> = window.location): string {
  return `${loc.protocol === 'https:' ? 'wss' : 'ws'}://${loc.host}/api/ws`;
}

/**
 * Keeps one websocket open to the server, reconnecting with backoff.
 * `onOpen` runs on every (re)connect: a reconnect is a brand-new server-side
 * connection, so callers must re-send anything (e.g. `join`) they need.
 */
export function useGameSocket(onOpen?: (send: (msg: ClientMessage) => void) => void) {
  const [state, setState] = useState<GameState>(EMPTY_STATE);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const onOpenRef = useRef(onOpen);
  useEffect(() => {
    onOpenRef.current = onOpen;
  });

  const send = useCallback((msg: ClientMessage) => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(msg));
  }, []);

  useEffect(() => {
    let stopped = false;
    let attempt = 0;
    let retry: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      const socket = new WebSocket(socketUrl());
      socketRef.current = socket;
      socket.onopen = () => {
        attempt = 0;
        setConnected(true);
        onOpenRef.current?.(send);
      };
      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data as string);
        if (msg.type === 'welcome' || msg.type === 'state') setState(msg.state);
      };
      socket.onclose = () => {
        setConnected(false);
        if (stopped) return;
        retry = setTimeout(connect, Math.min(1000 * 2 ** attempt++, 15_000));
      };
    };
    connect();

    return () => {
      stopped = true;
      clearTimeout(retry);
      socketRef.current?.close();
    };
  }, [send]);

  return { state, connected, send };
}
