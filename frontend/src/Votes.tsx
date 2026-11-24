type Vote = {
  votes: number;
  move: string;
}

type VotesProps = {
  votes: Vote[]
}

export default function Votes({ votes }: VotesProps) {
  return <table className="table-auto">
    <th>Move</th>
    <th>Votes</th>
    {votes.sort((a, b) => a.votes - b.votes).map((vote) => (
      <tr>
        <td>{vote.move}</td>
        <td>{vote.votes}</td>
      </tr>))}
  </table>
}
