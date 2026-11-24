/** Static placeholder. Replace with the real game-state render. */
export default function Board() {
  return (
    <div className="grid aspect-square w-full max-w-md grid-cols-8 overflow-hidden rounded border border-neutral-700">
      {Array.from({ length: 64 }, (_, i) => {
        const dark = (Math.floor(i / 8) + (i % 8)) % 2 === 1;
        return <div key={i} className={dark ? 'bg-emerald-800' : 'bg-emerald-100'} />;
      })}
    </div>
  );
}
