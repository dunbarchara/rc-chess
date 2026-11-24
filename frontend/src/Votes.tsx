type Vote = {
  votes: number;
  move: string;
}

type VotesProps = {
  votes: Vote[];
  containerStyles?: string;
}


export default function Votes({ votes, containerStyles }: VotesProps) {
  return <table className={`table-auto ${containerStyles}`}>
    <th>Move</th>
    <th>Votes</th>
    {[...votes].sort((a, b) => b.votes - a.votes).map((vote) => (
      <tr key={vote.move}>
        <td>{vote.move}</td>
        <td>{vote.votes}</td>
      </tr>))}
  </table>
}
