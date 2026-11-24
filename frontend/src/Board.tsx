// // Placeholder until the real game state is rendered.
// export default function Board() {
//   return (
//     <div className="grid aspect-square w-full max-w-md grid-cols-8">
//       {Array.from({ length: 64 }, (_, i) => (
//         <div key={i} className={(Math.floor(i / 8) + i) % 2 ? 'bg-emerald-800' : 'bg-emerald-100'} />
//       ))}
//     </div>
//   );
import { PieceKind } from "./types";
import Piece from "./Piece";

type BoardProps = {
  boardState: (PieceKind | undefined)[][]
  containerStyles?: string;
};

export default function Board({ boardState, containerStyles }: BoardProps) {
  return <table className={`${containerStyles}`}>
    {boardState.map(boardRow)}
  </table>;
}

function boardRow(row: (PieceKind | undefined)[]) {
  return <tr>
    {row.map(boardPiece)}
  </tr>
}

function boardPiece(piece: (PieceKind | undefined)) {
  return <td>
    {piece !== undefined ? <Piece piece={piece}></Piece> : undefined}
  </td>;
}
