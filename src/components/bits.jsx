import { SIDES } from "../lib/scoring.js";

/** Rank chip. First place carries the gavel's gold; the rest are plain. */
export function Rank({ rank }) {
  return (
    <span className={`tnum grid size-8 shrink-0 place-items-center rounded-full border text-sm ${
      rank === 1 ? "border-gavel text-gavel" : "border-hall-600 text-bone-3"}`}>
      {rank}
    </span>
  );
}

export function Pill({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`min-h-11 shrink-0 scroll-ml-4 whitespace-nowrap rounded-lg border px-3.5 text-sm transition-colors [scroll-snap-align:start] ${
        active ? "border-gavel bg-gavel/15 text-bone" : "border-hall-600 text-bone-3 hover:text-bone-2"}`}>
      {children}
    </button>
  );
}

export function Empty({ title, body }) {
  return (
    <div className="card px-4 py-10 text-center">
      <h3 className="font-serif text-lg text-bone">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-xs text-sm text-bone-2">{body}</p>
    </div>
  );
}

/** A side's name, carrying its own colour wherever it appears. */
export function SideTag({ side, className = "" }) {
  const s = SIDES[side];
  if (!s) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 text-meta ${className}`}>
      <span aria-hidden="true" className="h-3 w-[2px] rounded-full"
        style={{ background: s.color }} />
      <span style={{ color: s.color }}>{s.name}</span>
    </span>
  );
}
