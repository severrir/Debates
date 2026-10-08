/**
 * How a debater earns a place in the ranking.
 *
 * Winning carries the most, but a losing speaker who argued best still
 * takes something away — otherwise nobody volunteers for the hard side of
 * a motion, and the whole league drifts towards safe topics.
 */

export const POINTS = {
  win: 3,
  draw: 1,
  loss: 0,
  bestSpeaker: 2,
  appearance: 1,
};

export const SIDES = {
  for: { id: "for", name: "მომხრე", color: "var(--color-for)" },
  against: { id: "against", name: "მოწინააღმდეგე", color: "var(--color-against)" },
};

export const sideName = (id) => SIDES[id]?.name ?? id;

export const FORMATS = [
  { id: "1v1", name: "ერთი ერთზე", short: "1x1" },
  { id: "3v3", name: "გუნდური, სამი სამზე", short: "3x3" },
];

export const CATEGORIES = [
  "ფილოსოფია",
  "ისტორია",
  "ხელოვნური ინტელექტი",
  "პოლიტიკა",
  "ფეხბურთი",
  "კალათბურთი",
];

/** Total audience votes for a debate, and the share each side took. */
export function voteSplit(debate) {
  const f = debate.votes?.for ?? 0;
  const a = debate.votes?.against ?? 0;
  const total = f + a;
  if (total === 0) return { for: 0, against: 0, total: 0, forPct: 50, againstPct: 50 };
  return {
    for: f,
    against: a,
    total,
    forPct: Math.round((f / total) * 100),
    againstPct: 100 - Math.round((f / total) * 100),
  };
}
