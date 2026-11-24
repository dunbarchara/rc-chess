import { QRCodeSVG } from 'qrcode.react';
import Board from './Board';
import { useGameSocket, type Team } from './useGameSocket';

const TEAMS: Team[] = ['white', 'black'];

export default function Home() {
  const { state, connected } = useGameSocket();
  // window.location.origin resolves to https://chess.recurse.com in prod, localhost in dev.
  const origin = window.location.origin;

  return (
    <main className="mx-auto flex max-w-4xl flex-col items-center gap-8 p-6">
      <h1 className="text-3xl font-bold">RC Chess</h1>

      <section className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
        {TEAMS.map((team) => {
          const url = `${origin}/join/${team}`;
          return (
            <div key={team} className="flex flex-col items-center gap-3 rounded border border-neutral-300 p-4">
              <h2 className="text-xl font-semibold capitalize">{team} team</h2>
              <QRCodeSVG value={url} size={176} marginSize={2} />
              <p className="text-sm text-neutral-600">{state.teams[team]} playing</p>
              <a
                href={`/join/${team}`}
                className="w-full rounded bg-neutral-900 px-4 py-2 text-center font-medium text-white hover:bg-neutral-700"
              >
                Join {team}
              </a>
            </div>
          );
        })}
      </section>

      <Board />

      {!connected && <p className="text-sm text-neutral-500">Connecting…</p>}
    </main>
  );
}
