import { useState } from 'react';
import { useGameSocket, type Team } from './useGameSocket';

// Stand-in options to exercise the vote-counting path. Replace with the real
// proposal UI; the server treats options as opaque strings.
const DEMO_OPTIONS = ['option-a', 'option-b', 'option-c'];

export default function Join({ team }: { team: Team }) {
  // Re-join on every (re)connect: a reconnect is a new server-side connection.
  const { state, connected, send } = useGameSocket((s) => s({ type: 'join', team }));
  const [myVote, setMyVote] = useState<string | null>(null);

  const vote = (option: string) => {
    setMyVote(option);
    send({ type: 'vote', option });
  };

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold capitalize">You're on the {team} team</h1>
      <p className="text-sm text-neutral-600">
        {connected ? `${state.teams[team]} on your team` : 'Reconnecting… your vote resets if the connection drops.'}
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">Demo vote (placeholder)</h2>
        {DEMO_OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => vote(option)}
            disabled={!connected}
            className={`flex justify-between rounded border px-4 py-2 ${
              myVote === option ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300'
            }`}
          >
            <span>{option}</span>
            <span>{state.votes[team][option] ?? 0}</span>
          </button>
        ))}
      </section>

      <a href="/" className="text-sm underline">
        Back to home
      </a>
    </main>
  );
}
