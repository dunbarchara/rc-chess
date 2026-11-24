import { QRCodeSVG } from 'qrcode.react';
import Board from './Board';
import { PieceKind } from "./types";

const TEAMS = ['white', 'black'];

export default function Home() {
  const boardState = [
    [PieceKind.BlackRook, PieceKind.BlackKnight, PieceKind.BlackBishop, PieceKind.BlackQueen, PieceKind.BlackKing, PieceKind.BlackBishop, PieceKind.BlackKnight, PieceKind.BlackRook],
    [PieceKind.BlackPawn, PieceKind.BlackPawn, PieceKind.BlackPawn, PieceKind.BlackPawn, PieceKind.BlackPawn, PieceKind.BlackPawn, PieceKind.BlackPawn, PieceKind.BlackPawn],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [PieceKind.WhitePawn, PieceKind.WhitePawn, PieceKind.WhitePawn, PieceKind.WhitePawn, PieceKind.WhitePawn, PieceKind.WhitePawn, PieceKind.WhitePawn, PieceKind.WhitePawn],
    [PieceKind.WhiteRook, PieceKind.WhiteKnight, PieceKind.WhiteBishop, PieceKind.WhiteQueen, PieceKind.WhiteKing, PieceKind.WhiteBishop, PieceKind.WhiteKnight, PieceKind.WhiteRook],
  ];

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
      <Board boardState={boardState} />
    </main>
  );
}
