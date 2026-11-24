import { useEffect, useState, type FormEvent } from 'react';

// The Rust process colors white/black squares with ANSI green/red.
const COLORS: Record<string, string> = { '32': 'text-green-600', '31': 'text-red-600' };

function Colored({ text }: { text: string }) {
  // Each ESC[ starts a segment like "32m1": color code, then text.
  const [plain, ...segments] = text.split('\x1b[');
  return (
    <>
      {plain}
      {segments.map((segment, i) => {
        const m = segment.indexOf('m');
        return (
          <span key={i} className={COLORS[segment.slice(0, m)]}>
            {segment.slice(m + 1)}
          </span>
        );
      })}
    </>
  );
}

export default function Rust() {
  const [output, setOutput] = useState('');
  const [move, setMove] = useState('');

  useEffect(() => {
    fetch('/api/rust')
      .then((r) => r.text())
      .then(setOutput);
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/rust/move', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ move }),
    });
    setOutput(await res.text());
    setMove('');
  };

  // The engine prints any error message first, then the labelled board (starting at its header line).
  const boardStart = output.indexOf('   a b c d e f g h');
  const board = boardStart < 0 ? '' : output.slice(boardStart).trimEnd();
  const message = (boardStart < 0 ? output : output.slice(0, boardStart)).trim();

  return (
    <main className="p-6">
      <pre className="font-mono">
        <Colored text={board} />
      </pre>
      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          value={move}
          onChange={(e) => setMove(e.target.value)}
          placeholder="e2 e4"
          className="border px-2 py-1 font-mono"
        />
        <button className="bg-black px-3 py-1 text-white">Move</button>
      </form>
      {message && <pre className="mt-2 font-mono text-red-600">{message}</pre>}
    </main>
  );
}
