import { PieceKind } from "./types";

type PieceProps = {
  piece: PieceKind
}

export default function Piece({piece}: PieceProps) {
  return <p>{pieceKindToString(piece)}</p>
}

function pieceKindToString(pieceKind: PieceKind): string {
  switch (pieceKind) {
    case PieceKind.BlackRook: return "\u265c";
    case PieceKind.BlackKnight: return "\u265e";
    case PieceKind.BlackBishop: return "\u265d";
    case PieceKind.BlackQueen: return "\u265b";
    case PieceKind.BlackKing: return "\u265a";
    case PieceKind.BlackPawn: return "\u265f";

    case PieceKind.WhitePawn: return "\u2659";
    case PieceKind.WhiteKing: return "\u2654";
    case PieceKind.WhiteQueen: return "\u2655";
    case PieceKind.WhiteBishop: return "\u2657";
    case PieceKind.WhiteKnight: return "\u2658";
    case PieceKind.WhiteRook: return "\u2656";
  }
}
