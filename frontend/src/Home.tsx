import { QRCodeSVG } from 'qrcode.react';
import Board from './Board';

const TEAMS = ['white', 'black'];

export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-8 p-6">
      <h1 className="text-3xl font-bold">RC Chess</h1>
      <div className="flex flex-wrap justify-center gap-8">
        {TEAMS.map((team) => (
          <div key={team} className="flex flex-col items-center gap-3">
            <QRCodeSVG value={`${window.location.origin}/join/${team}`} size={176} marginSize={2} />
            <a href={`/join/${team}`} className="w-full rounded bg-black px-4 py-2 text-center text-white capitalize">
              Join {team}
            </a>
          </div>
        ))}
      </div>
      <Board />
    </main>
  );
}
