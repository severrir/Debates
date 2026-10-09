/**
 * The league as it stands when the site is first opened.
 *
 * Real motions, written so both sides are genuinely arguable — a one-sided
 * motion makes for a bad debate and an even worse demo.
 */

const DAY = 86_400_000;

/** A date `daysAgo` days back, at a given Tbilisi hour (UTC+4). */
function at(daysAgo, hour = 15, minute = 0) {
  const d = new Date(Date.now() - daysAgo * DAY);
  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      hour - 4,
      minute,
    ),
  ).toISOString();
}

const TEAMS = [
  { id: "t-logos", name: "ლოგოსი", klass: "XI-ა", motto: "ჯერ არგუმენტი, მერე ემოცია." },
  { id: "t-tribuna", name: "ტრიბუნა", klass: "X-ბ", motto: "ხმა, რომელიც ისმის." },
  { id: "t-antithesis", name: "ანტითეზისი", klass: "XII-ა", motto: "ყველა დებულებას აქვს მეორე მხარე." },
  { id: "t-rhetor", name: "რიტორიკა", klass: "IX-ბ", motto: "სიტყვა ზუსტად, არა ხმამაღლა." },
  { id: "t-verdict", name: "ვერდიქტი", klass: "X-ა", motto: "მტკიცებულება წყვეტს." },
];

const DEBATERS = [
  { id: "d-saba", name: "საბა ყურაშვილი", klass: "IX-ბ", teamId: "t-rhetor" },
  { id: "d-nino", name: "ნინო ხაჩიძე", klass: "X-ბ", teamId: "t-tribuna" },
  { id: "d-irakli", name: "ირაკლი ნოზაძე", klass: "XII-ა", teamId: "t-antithesis" },
  { id: "d-mariam", name: "მარიამ გოგოლაძე", klass: "XI-ა", teamId: "t-logos" },
  { id: "d-giorgi", name: "გიორგი მაისურაძე", klass: "X-ა", teamId: "t-verdict" },
  { id: "d-elene", name: "ელენე კვარაცხელია", klass: "IX-ბ", teamId: "t-rhetor" },
  { id: "d-luka", name: "ლუკა ჯაფარიძე", klass: "XI-ა", teamId: "t-logos" },
  { id: "d-ana", name: "ანა ჩიქოვანი", klass: "X-ბ", teamId: "t-tribuna" },
  { id: "d-tornike", name: "თორნიკე ასლანიშვილი", klass: "XII-ა", teamId: "t-antithesis" },
  { id: "d-salome", name: "სალომე მჭედლიშვილი", klass: "X-ა", teamId: "t-verdict" },
  { id: "d-dato", name: "დათო წიკლაური", klass: "XI-ა", teamId: "t-logos" },
  { id: "d-tekla", name: "თეკლა ბოლქვაძე", klass: "IX-ბ", teamId: "t-rhetor" },
  { id: "d-vakho", name: "ვახო შენგელია", klass: "XII-ა", teamId: "t-antithesis" },
  { id: "d-gvantsa", name: "გვანცა ლომიძე", klass: "X-ბ", teamId: "t-tribuna" },
  { id: "d-natia", name: "ნათია ფხაკაძე", klass: "X-ა", teamId: "t-verdict" },
];

const members = (teamId) =>
  DEBATERS.filter((d) => d.teamId === teamId).map((d) => d.id);

/** finished debates, oldest first; ids are stable for linking. */
const RESULTS = [
  {
    topic: "ხელოვნური ინტელექტი სკოლაში ესეების წერას უნდა ჩაანაცვლოს",
    category: "ხელოვნური ინტელექტი",
    format: "3v3",
    forTeam: "t-logos",
    againstTeam: "t-antithesis",
    winner: "against",
    score: "3–2",
    best: "d-tornike",
    votes: { for: 31, against: 44 },
    days: 54,
  },
  {
    topic: "ხმის მიცემის ასაკი 16 წლამდე უნდა დაიწიოს",
    category: "პოლიტიკა",
    format: "3v3",
    forTeam: "t-tribuna",
    againstTeam: "t-verdict",
    winner: "for",
    score: "4–1",
    best: "d-nino",
    votes: { for: 52, against: 19 },
    days: 47,
  },
  {
    topic: "VAR-მა ფეხბურთი გააუარესა",
    category: "ფეხბურთი",
    format: "1v1",
    forTeam: "t-rhetor",
    againstTeam: "t-logos",
    winner: "for",
    score: "3–2",
    best: "d-saba",
    votes: { for: 48, against: 35 },
    days: 40,
  },
  {
    topic: "თავისუფალი ნება ილუზიაა",
    category: "ფილოსოფია",
    format: "3v3",
    forTeam: "t-antithesis",
    againstTeam: "t-rhetor",
    winner: "against",
    score: "3–2",
    best: "d-elene",
    votes: { for: 29, against: 38 },
    days: 33,
  },
  {
    topic: "დავით აღმაშენებლის რეფორმები უფრო მნიშვნელოვანი იყო, ვიდრე მისი სამხედრო გამარჯვებები",
    category: "ისტორია",
    format: "3v3",
    forTeam: "t-verdict",
    againstTeam: "t-tribuna",
    winner: "for",
    score: "4–1",
    best: "d-giorgi",
    votes: { for: 57, against: 24 },
    days: 26,
  },
  {
    topic: "ევროპული კალათბურთი უკეთეს მწვრთნელებს ზრდის, ვიდრე NBA",
    category: "კალათბურთი",
    format: "1v1",
    forTeam: "t-logos",
    againstTeam: "t-verdict",
    winner: "draw",
    score: "2–2",
    best: "d-mariam",
    votes: { for: 40, against: 41 },
    days: 19,
  },
  {
    topic: "სოციალური ქსელები 16 წლამდე უნდა აიკრძალოს",
    category: "პოლიტიკა",
    format: "3v3",
    forTeam: "t-antithesis",
    againstTeam: "t-logos",
    winner: "for",
    score: "3–2",
    best: "d-vakho",
    votes: { for: 46, against: 39 },
    days: 12,
  },
  {
    topic: "ისტორიის სწავლება ფაქტებზე მეტად ინტერპრეტაციას უნდა ასწავლიდეს",
    category: "ისტორია",
    format: "1v1",
    forTeam: "t-rhetor",
    againstTeam: "t-tribuna",
    winner: "against",
    score: "3–2",
    best: "d-ana",
    votes: { for: 33, against: 37 },
    days: 5,
  },
];

const finished = RESULTS.map((r, i) => ({
  id: `db-${i + 1}`,
  topic: r.topic,
  category: r.category,
  format: r.format,
  status: "finished",
  heldAt: at(r.days, 15, 0),
  location: "სააქტო დარბაზი",
  for: {
    teamId: r.forTeam,
    speakerIds: members(r.forTeam).slice(0, r.format === "1v1" ? 1 : 3),
  },
  against: {
    teamId: r.againstTeam,
    speakerIds: members(r.againstTeam).slice(0, r.format === "1v1" ? 1 : 3),
  },
  winner: r.winner,
  score: r.score,
  bestSpeakerId: r.best,
  votes: r.votes,
}));

const upcoming = [
  {
    id: "db-next",
    topic: "ხელოვნური ინტელექტით დაწერილი ნამუშევარი ავტორის ნამუშევრად უნდა ჩაითვალოს",
    category: "ხელოვნური ინტელექტი",
    format: "3v3",
    status: "upcoming",
    heldAt: at(-3, 15, 0),
    location: "სააქტო დარბაზი",
    for: { teamId: "t-logos", speakerIds: members("t-logos").slice(0, 3) },
    against: {
      teamId: "t-antithesis",
      speakerIds: members("t-antithesis").slice(0, 3),
    },
    winner: null,
    score: null,
    bestSpeakerId: null,
    votes: { for: 0, against: 0 },
  },
  {
    id: "db-next-2",
    topic: "სკოლის ფორმა უნდა გაუქმდეს",
    category: "პოლიტიკა",
    format: "1v1",
    status: "upcoming",
    heldAt: at(-10, 15, 0),
    location: "ბიბლიოთეკა",
    for: { teamId: "t-tribuna", speakerIds: members("t-tribuna").slice(0, 1) },
    against: { teamId: "t-rhetor", speakerIds: members("t-rhetor").slice(0, 1) },
    winner: null,
    score: null,
    bestSpeakerId: null,
    votes: { for: 0, against: 0 },
  },
];

export const SEED = {
  teams: TEAMS.map((t) => ({ ...t, memberIds: members(t.id) })),
  debaters: DEBATERS,
  debates: [...finished, ...upcoming],

  topics: [
    {
      id: "tp-1",
      title: "ეროვნული გამოცდები უნდა გაუქმდეს",
      category: "პოლიტიკა",
      author: "ლუკა ჯაფარიძე",
      votes: 23,
      status: "suggested",
      suggestedAt: at(14),
    },
    {
      id: "tp-2",
      title: "ხელოვნური ინტელექტი მასწავლებელს ვერასდროს ჩაანაცვლებს",
      category: "ხელოვნური ინტელექტი",
      author: "ნათია ფხაკაძე",
      votes: 19,
      status: "suggested",
      suggestedAt: at(11),
    },
    {
      id: "tp-3",
      title: "ბედნიერება ობიექტურად გაზომვადია",
      category: "ფილოსოფია",
      author: "თეკლა ბოლქვაძე",
      votes: 16,
      status: "suggested",
      suggestedAt: at(9),
    },
    {
      id: "tp-4",
      title: "მსოფლიო ჩემპიონატი ორ წელიწადში ერთხელ უნდა ტარდებოდეს",
      category: "ფეხბურთი",
      author: "დათო წიკლაური",
      votes: 12,
      status: "suggested",
      suggestedAt: at(7),
    },
    {
      id: "tp-5",
      title: "ისტორიას მხოლოდ გამარჯვებულები წერენ",
      category: "ისტორია",
      author: "გვანცა ლომიძე",
      votes: 9,
      status: "suggested",
      suggestedAt: at(5),
    },
    {
      id: "tp-6",
      title: "კალათბურთში სამქულიანი ხაზი უფრო შორს უნდა გაიწიოს",
      category: "კალათბურთი",
      author: "სალომე მჭედლიშვილი",
      votes: 6,
      status: "suggested",
      suggestedAt: at(3),
    },
  ],

  /**
   * The roll of honour. A season's winner is settled in a final, not by
   * the table, so it is recorded rather than derived — the live table
   * ranks this season, this list remembers the ones before it.
   */
  champions: [
    {
      id: "ch-1",
      season: "2025–2026, შემოდგომა",
      teamId: "t-logos",
      runnerUpId: "t-antithesis",
      bestSpeakerId: "d-mariam",
      final: "სკოლის ბიუჯეტს მოსწავლეთა საბჭო უნდა ანაწილებდეს",
      score: "3–2",
      decidedAt: at(26),
    },
    {
      id: "ch-2",
      season: "2024–2025, გაზაფხული",
      teamId: "t-antithesis",
      runnerUpId: "t-tribuna",
      bestSpeakerId: "d-irakli",
      final: "ისტორიის სახელმძღვანელოს სახელმწიფო არ უნდა წერდეს",
      score: "4–1",
      decidedAt: at(168),
    },
    {
      id: "ch-3",
      season: "2024–2025, შემოდგომა",
      teamId: "t-tribuna",
      runnerUpId: "t-verdict",
      bestSpeakerId: "d-nino",
      final: "სკოლაში ტელეფონის გამოყენება უნდა აიკრძალოს",
      score: "3–2",
      decidedAt: at(288),
    },
  ],

  events: [
    {
      id: "ev-1",
      title: "დებატების საღამო — ნახევარფინალი",
      kind: "დებატების საღამო",
      startsAt: at(-3, 15, 0),
      location: "სააქტო დარბაზი",
      note: "ორი გუნდი, სამი სპიკერი თითოში. მსაჯობს მოსწავლეთა საბჭო.",
    },
    {
      id: "ev-2",
      title: "სკოლათაშორისი დებატები — №7 სკოლა",
      kind: "სკოლათაშორისი მატჩი",
      startsAt: at(-17, 13, 0),
      location: "№7 საჯარო სკოლა, რუსთავი",
      note: "შერჩეული შემადგენლობა გამოცხადდება ნახევარფინალის შემდეგ.",
    },
    {
      id: "ev-3",
      title: "სეზონის ფინალი",
      kind: "ფინალი",
      startsAt: at(-31, 14, 0),
      location: "სააქტო დარბაზი",
      note: null,
    },
  ],
};
