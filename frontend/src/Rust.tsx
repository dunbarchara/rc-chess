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

// The engine prints any error message first, then the 8 board rows.
function Board({ rows }: { rows: string[] }) {
  return (
    <pre className="font-mono">
      <div className="border-b pl-[2ch]">a b c d e f g h</div>
      {rows.map((row, i) => (
        <div key={i}>
          <span className="inline-block w-[2ch] border-r">{8 - i}</span>
          <Colored text={row} />
        </div>
      ))}
    </pre>
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

  const lines = output.trimEnd().split('\n');
  const hasBoard = lines.length >= 8;
  const rows = hasBoard ? lines.slice(-8) : [];
  const message = hasBoard ? lines.slice(0, -8).join('\n') : output;

  return (
    <main className="p-6">
      <Board rows={rows} />
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
