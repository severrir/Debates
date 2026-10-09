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

/**
 * The two structures the club debates in, written out speech by speech —
 * because "3x3" means nothing to a student who has not debated yet, while
 * a running order they can read in twenty seconds does.
 *
 * `speakers` is the count the admin panel uses to fill a side from a team's
 * roster, so the format chosen when scheduling decides who speaks.
 */
export const FORMATS = [
  {
    id: "1v1",
    name: "ერთი ერთზე",
    short: "1x1",
    speakers: 1,
    minutes: 18,
    summary:
      "სწრაფი დუელი. ერთი სპიკერი მხარეს, საკუთარ პოზიციას თავად იცავს და თავადვე პასუხობს კითხვებს.",
    order: [
      { name: "მომხრის სიტყვა", minutes: 4, note: "პოზიცია და განსაზღვრებები" },
      { name: "მოწინააღმდეგის სიტყვა", minutes: 4, note: "საპასუხო პოზიცია" },
      { name: "ჯვარედინი კითხვები", minutes: 4, note: "ორივე მხარე, მონაცვლეობით" },
      { name: "დასკვნები", minutes: 6, note: "3 წუთი თითოეულ მხარეს" },
    ],
  },
  {
    id: "3v3",
    name: "გუნდური, სამი სამზე",
    short: "3x3",
    speakers: 3,
    minutes: 34,
    summary:
      "კლასიკური გუნდური ფორმატი. სამი სპიკერი მხარეს, თითოეულს თავისი როლი აქვს და მესამე უკვე არგუმენტს არ ამატებს.",
    order: [
      { name: "პირველი სპიკერები", minutes: 10, note: "პოზიცია, განსაზღვრებები, მტკიცებულებები" },
      { name: "მეორე სპიკერები", minutes: 10, note: "გაბათილება და გაძლიერება" },
      { name: "ჯვარედინი კითხვები", minutes: 6, note: "გუნდი გუნდს" },
      { name: "მესამე სპიკერები", minutes: 8, note: "დასკვნა, ახალი არგუმენტის გარეშე" },
    ],
  },
];

export const formatById = (id) => FORMATS.find((f) => f.id === id) ?? null;

/** How many speakers a side fields in a given format. */
export const speakersIn = (id) => formatById(id)?.speakers ?? 3;

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
