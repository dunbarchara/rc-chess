import Board from "./Board";
import Votes from "./Votes";
import { PieceKind } from "./types";
// const team = /^\/join\/(white|black)$/.exec(window.location.pathname)?.[1];
// return team ? <Join team={team} /> : <Home />;
export default function App() {

  const testVotes = [{ votes: 5, move: "E4" }, { votes: 7, move: "D4" },]

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

  return <>
    <Board boardState={boardState} />
    <Votes votes={testVotes} />
  </>
}