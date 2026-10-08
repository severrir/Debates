import { voteSplit } from "../lib/scoring.js";

/**
 * The audience vote, drawn as the room itself: one bar split between the
 * two sides, meeting where the room was evenly persuaded.
 *
 * This is the signature moment of the site, so it is the one place that
 * animates on arrival — the two halves grow out from their own edges to
 * meet in the middle, which is exactly what the number means.
 */
export default function VoteBar({ debate, animate = true }) {
  const v = voteSplit(debate);

  if (v.total === 0) {
    return (
      <p className="text-meta text-bone-3">
        აუდიტორიას ჯერ არ მიუცია ხმა.
      </p>
    );
  }

  return (
    <div>
      <div
        className="flex h-2.5 overflow-hidden rounded-full bg-hall-700"
        role="img"
        aria-label={`აუდიტორიის ხმები: მომხრე ${v.forPct}%, მოწინააღმდეგე ${v.againstPct}%`}
      >
        <span
          className={`h-full bg-for ${animate ? "animate-bar" : ""}`}
          style={{ width: `${v.forPct}%` }}
        />
        <span
          className={`h-full bg-against ${animate ? "animate-bar" : ""}`}
          style={{ width: `${v.againstPct}%`, transformOrigin: "right" }}
        />
      </div>

      <div className="tnum mt-1.5 flex justify-between text-meta">
        <span className="text-for-soft">
          {v.forPct}% ({v.for})
        </span>
        <span className="text-bone-3">{v.total} ხმა</span>
        <span className="text-against-soft">
          ({v.against}) {v.againstPct}%
        </span>
      </div>
    </div>
  );
}
