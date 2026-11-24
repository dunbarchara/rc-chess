import { useEffect } from 'react';

export default function Join({ team }: { team: string }) {
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    let socket: WebSocket;
    let retry: ReturnType<typeof setTimeout>;
    let closed = false;

    const connect = () => {
      socket = new WebSocket(`${protocol}://${window.location.host}/api/ws`);
      // A reconnect is a new connection server-side, so join again each time.
      socket.onopen = () => socket.send(JSON.stringify({ type: 'join', team }));
      socket.onclose = () => {
        if (!closed) retry = setTimeout(connect, 2000);
      };
    };
    connect();

    return () => {
      closed = true;
      clearTimeout(retry);
      socket.close();
    };
  }, [team]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold capitalize">You're on the {team} team</h1>
    </main>
  );
}
