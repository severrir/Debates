/**
 * The league as a notebook you can keep.
 *
 * One self-contained HTML file: no network, no build, no app. It opens on
 * any phone, works with the Wi-Fi off, and prints onto A4 — which is the
 * point, because the person who most needs the formats and the points rule
 * is the student judging at the front of the hall, holding paper.
 *
 * The screen app argues in crimson and teal on slate. Paper keeps the two
 * sides but darkens them until a school printer can tell them apart, and
 * the ruled line under the text is the notebook it is named after.
 */

import {
  FORMATS,
  POINTS,
  formatById,
  sideName,
  voteSplit,
} from "./scoring.js";
import { ergative, formatDate, formatTime } from "./georgian.js";

const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const PAGE_CSS = `
:root {
  --paper: #f8f5ed;
  --paper-2: #fffefa;
  --ink: #1b1f26;
  --ink-2: #4b545f;
  --ink-3: #757e89;
  --rule: #d9d3c3;
  --rule-soft: #e7e2d4;
  --for: #9c3030;
  --against: #1f6f68;
  --gavel: #8a7312;
  --line: 26px;
  --serif: "Noto Serif Georgian", "BPG Nino Elite", Sylfaen, Georgia, serif;
  --sans: "Noto Sans Georgian", Sylfaen, system-ui, -apple-system, sans-serif;
}

* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  background: #e6e2d6;
  color: var(--ink);
  font-family: var(--serif);
  font-size: 15px;
  line-height: var(--line);
  font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased;
}

.sheet {
  max-width: 820px;
  margin: 0 auto;
  padding: 34px 26px 56px;
  background: var(--paper);
  background-image:
    repeating-linear-gradient(
      to bottom,
      transparent 0 calc(var(--line) - 1px),
      var(--rule-soft) calc(var(--line) - 1px) var(--line)
    );
  background-position: 0 12px;
  box-shadow: 0 1px 0 #fff inset, 0 18px 50px -24px rgb(0 0 0 / 0.42);
  min-height: 100vh;
}

/* The line between the two sides, faint, down the middle of the page. */
.sheet::before {
  content: "";
  position: fixed;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  z-index: -1;
  background: linear-gradient(to bottom, rgb(27 31 38 / 0.12), transparent 70%);
  pointer-events: none;
}

h1, h2, h3 { font-weight: 600; margin: 0; text-wrap: balance; }
h1 { font-size: 30px; line-height: 1.18; }
h2 { font-size: 20px; line-height: 1.3; }
h3 { font-size: 16px; line-height: 1.35; }
p { margin: 0; text-wrap: pretty; }
a { color: inherit; text-decoration: none; }

.eyebrow {
  font-family: var(--sans);
  font-size: 11.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-3);
}
.meta { font-family: var(--sans); font-size: 12px; color: var(--ink-3); }
.sub  { font-family: var(--sans); font-size: 13px; color: var(--ink-2); }
.note { margin-top: 6px; font-family: var(--sans); font-size: 12.5px; color: var(--ink-2); }

.plate {
  border-top: 3px double var(--ink);
  border-bottom: 1px solid var(--rule);
  padding: 14px 0 12px;
  margin-bottom: 22px;
}
.plate h1 { margin: 2px 0 6px; }
.tally { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-top: 10px; }
.tally div { font-family: var(--sans); font-size: 12px; color: var(--ink-3); }
.tally b { display: block; font-family: var(--serif); font-size: 19px; color: var(--ink); }

section { margin-top: 30px; }
section > h2 { padding-bottom: 5px; border-bottom: 1px solid var(--rule); break-after: avoid; }
section > h2 .n { font-family: var(--sans); font-size: 11px; color: var(--ink-3); margin-left: 8px; }

.contents ol { margin: 10px 0 0; padding: 0; list-style: none; columns: 2; column-gap: 26px; }
.contents li { font-family: var(--sans); font-size: 13px; padding: 3px 0; break-inside: avoid; }
.contents .dots { color: var(--rule); }

/* ---- The champion plate ---- */
.champion {
  margin-top: 12px;
  padding: 16px 18px;
  background: var(--paper-2);
  border: 1px solid var(--rule);
  border-left: 3px solid var(--gavel);
  break-inside: avoid;
}
.champion .name { font-size: 25px; line-height: 1.2; }
.champion .facts { display: flex; flex-wrap: wrap; gap: 4px 26px; margin-top: 12px; }
.champion .facts div { font-family: var(--sans); font-size: 12px; color: var(--ink-3); }
.champion .facts b { display: block; font-family: var(--serif); font-size: 20px; color: var(--gavel); }

/* ---- Tables ---- */
table { width: 100%; border-collapse: collapse; margin-top: 12px; }
thead { display: table-header-group; }
th {
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink-3);
  text-align: right;
  padding: 0 6px 6px;
  border-bottom: 1px solid var(--ink);
  white-space: nowrap;
}
th:first-child, th.l { text-align: left; }
td { padding: 5px 6px; border-bottom: 1px solid var(--rule-soft); text-align: right; vertical-align: baseline; }
td:first-child, td.l { text-align: left; }
tr { break-inside: avoid; }
.rk { width: 30px; color: var(--ink-3); font-size: 13px; }
tr.top .rk { color: var(--gavel); font-weight: 600; }
tr.top td.l { font-weight: 600; }
.dim { color: var(--ink-3); }
.nowrap { white-space: nowrap; }
caption { caption-side: bottom; margin-top: 8px; font-family: var(--sans); font-size: 11.5px; color: var(--ink-3); text-align: left; }

/* ---- One argued motion ---- */
.motion { padding: 12px 0 14px; border-bottom: 1px solid var(--rule-soft); break-inside: avoid; }
.motion .when { font-family: var(--sans); font-size: 11.5px; color: var(--ink-3); }
.motion h3 { margin-top: 2px; }
.sides { display: flex; flex-wrap: wrap; gap: 6px 24px; margin-top: 8px; }
.side { padding-left: 9px; border-left: 2px solid var(--rule); flex: 1 1 200px; }
.side.for { border-left-color: var(--for); }
.side.against { border-left-color: var(--against); }
.side .who { font-family: var(--sans); font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; }
.side.for .who { color: var(--for); }
.side.against .who { color: var(--against); }
.side .team { font-size: 15px; }
.side .roster { font-family: var(--sans); font-size: 11.5px; color: var(--ink-3); }
.verdict { margin-top: 8px; font-family: var(--sans); font-size: 12.5px; }
.verdict b { font-family: var(--serif); font-size: 15px; }

/* The audience vote, as two measured lengths rather than a chart. */
.votes { display: flex; height: 7px; margin-top: 7px; border: 1px solid var(--rule); }
.votes span { display: block; height: 100%; }
.votes .f { background: var(--for); }
.votes .a { background: var(--against); }

/* ---- Diary ---- */
.diary { margin: 12px 0 0; padding: 0; list-style: none; }
.diary li { padding: 9px 0 9px 14px; border-left: 2px solid var(--rule); border-bottom: 1px solid var(--rule-soft); break-inside: avoid; }
.diary li.next { border-left-color: var(--gavel); }
.diary .when { font-family: var(--sans); font-size: 11.5px; color: var(--ink-3); }

/* ---- Formats, for the judge at the front ---- */
.formats { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 12px; }
.card { flex: 1 1 280px; padding: 14px 16px; background: var(--paper-2); border: 1px solid var(--rule); break-inside: avoid; }
.card .short { font-family: var(--sans); font-size: 11px; color: var(--ink-3); border: 1px solid var(--rule); padding: 1px 6px; float: right; }
.order { margin: 10px 0 0; padding: 0; list-style: none; border-top: 1px solid var(--rule); }
.order li { display: flex; justify-content: space-between; gap: 12px; padding: 5px 0; border-bottom: 1px solid var(--rule-soft); }
.order .step { font-size: 14px; }
.order .hint { display: block; font-family: var(--sans); font-size: 11.5px; color: var(--ink-3); }
.order .mins { font-family: var(--sans); font-size: 12px; color: var(--gavel); white-space: nowrap; }

.rulebox { margin-top: 12px; padding: 12px 16px; border: 1px solid var(--rule); background: var(--paper-2); break-inside: avoid; }
.rulebox ul { margin: 6px 0 0; padding-left: 18px; font-family: var(--sans); font-size: 13px; color: var(--ink-2); }

.bar {
  position: sticky; top: 0; z-index: 2;
  display: flex; justify-content: flex-end; gap: 8px;
  max-width: 820px; margin: 0 auto; padding: 10px 26px 0;
}
.bar button {
  font: 600 13px var(--sans);
  color: var(--paper); background: var(--ink);
  border: 0; border-radius: 7px; padding: 9px 14px; min-height: 40px; cursor: pointer;
}

footer {
  margin-top: 36px; padding-top: 12px;
  border-top: 3px double var(--ink);
  font-family: var(--sans); font-size: 11.5px; color: var(--ink-3);
  display: flex; flex-wrap: wrap; gap: 4px 16px; justify-content: space-between;
}

@media (max-width: 560px) {
  .sheet { padding: 24px 16px 44px; }
  h1 { font-size: 25px; }
  .contents ol { columns: 1; }
  .bar { padding: 8px 16px 0; }
  table { font-size: 14px; }
  td, th { padding-left: 4px; padding-right: 4px; }
}

@page { size: A4; margin: 15mm 14mm; }

@media print {
  body { background: #fff; }
  .bar { display: none; }
  .sheet {
    max-width: none; margin: 0; padding: 0;
    box-shadow: none; background: #fff; min-height: 0;
  }
  .sheet::before { display: none; }
  .champion, .card, .rulebox { background: #fff; }
  .page-break { break-before: page; }
}
`;

/* ---------------------------------------------------------------- *
 * Sections
 * ---------------------------------------------------------------- */

function masthead(state, now) {
  const argued = state.debates.filter((d) => d.status === "finished").length;
  return `
<header class="plate">
  <p class="eyebrow">რუსთავის №4 საჯარო სკოლა</p>
  <h1>დებატების კლუბის რვეული</h1>
  <p class="sub">შედგენილია ${esc(formatDate(now, { year: true }))}, ${esc(
    formatTime(now),
  )}</p>
  <div class="tally">
    <div><b>${state.teams.length}</b>გუნდი</div>
    <div><b>${state.debaters.length}</b>სპიკერი</div>
    <div><b>${argued}</b>ჩატარებული დებატი</div>
    <div><b>${state.topics.length}</b>შემოთავაზებული თემა</div>
  </div>
</header>`;
}

function contents(items) {
  return `
<section class="contents">
  <h2>სარჩევი</h2>
  <ol>
    ${items
      .map(
        (it, i) =>
          `<li>${i + 1}. <a href="#${it.id}">${esc(it.title)}</a> <span class="dots">—</span> <span class="dim">${esc(it.hint)}</span></li>`,
      )
      .join("\n    ")}
  </ol>
</section>`;
}

function champion(state) {
  const c = state.champion;
  if (!c) return "";
  const best = state.debaters[0];
  return `
<section id="champion">
  <h2>ჩემპიონი გუნდი</h2>
  <div class="champion">
    <p class="eyebrow">ცხრილის სათავე</p>
    <h3 class="name">${esc(c.name)}</h3>
    <p class="sub">${esc(c.klass)}${c.motto ? ` — „${esc(c.motto)}“` : ""}</p>
    <div class="facts">
      <div><b>${c.points}</b>ქულა</div>
      <div><b>${c.wins} / ${c.draws} / ${c.losses}</b>მოგება, ფრე, წაგება</div>
      ${best ? `<div><b>${esc(best.name)}</b>საუკეთესო სპიკერი ლიგაში</div>` : ""}
    </div>
  </div>
</section>`;
}

function teamTable(state) {
  if (state.teams.length === 0) return "";
  const rows = state.teams
    .map(
      (t) => `
      <tr class="${t.rank <= 3 ? "top" : ""}">
        <td class="rk">${t.rank}</td>
        <td class="l">${esc(t.name)}</td>
        <td class="l dim nowrap">${esc(t.klass)}</td>
        <td class="dim">${t.played}</td>
        <td>${t.wins}</td>
        <td>${t.draws}</td>
        <td>${t.losses}</td>
        <td>${t.points}</td>
      </tr>`,
    )
    .join("");

  return `
<section id="teams">
  <h2>ლიგის ცხრილი<span class="n">${state.teams.length} გუნდი</span></h2>
  <p class="note">ქულები არ ინახება — ცხრილი ყოველ ჯერზე დებატების სრული
  ჟურნალიდან გადაითვლება.</p>
  <table>
    <thead>
      <tr>
        <th>#</th><th class="l">გუნდი</th><th class="l">კლასი</th>
        <th>თამაში</th><th>მოგ.</th><th>ფრე</th><th>წაგ.</th><th>ქულა</th>
      </tr>
    </thead>
    <tbody>${rows}
    </tbody>
  </table>
</section>`;
}

function speakerTable(state) {
  if (state.debaters.length === 0) return "";
  const rows = state.debaters
    .map(
      (d) => `
      <tr class="${d.rank <= 3 ? "top" : ""}">
        <td class="rk">${d.rank}</td>
        <td class="l">${esc(d.name)}</td>
        <td class="l dim">${esc(state.teamsById[d.teamId]?.name ?? d.klass)}</td>
        <td class="dim">${d.appearances}</td>
        <td>${d.wins}</td>
        <td>${d.bestSpeaker}</td>
        <td>${d.points}</td>
      </tr>`,
    )
    .join("");

  return `
<section id="speakers">
  <h2>სპიკერების რეიტინგი<span class="n">${state.debaters.length} სპიკერი</span></h2>
  <table>
    <thead>
      <tr>
        <th>#</th><th class="l">სპიკერი</th><th class="l">გუნდი</th>
        <th>გამოსვლა</th><th>მოგება</th><th>საუკ.</th><th>ქულა</th>
      </tr>
    </thead>
    <tbody>${rows}
    </tbody>
    <caption>„საუკ.“ — რამდენჯერ გამოცხადდა საუკეთესო სპიკერად.</caption>
  </table>
  <div class="rulebox">
    <p class="eyebrow">ქულების წესი</p>
    <ul>
      <li>მოგება — ${POINTS.win} ქულა, ფრე — ${POINTS.draw}, გამოსვლა — ${POINTS.appearance}.</li>
      <li>საუკეთესო სპიკერი — დამატებით ${POINTS.bestSpeaker} ქულა, მოგებისგან დამოუკიდებლად.</li>
    </ul>
  </div>
</section>`;
}

function motion(state, d) {
  const forTeam = state.teamsById[d.for.teamId];
  const againstTeam = state.teamsById[d.against.teamId];
  const roster = (ids) =>
    (ids ?? [])
      .map((id) => state.debatersById[id]?.name)
      .filter(Boolean)
      .map(esc)
      .join(", ");
  const v = voteSplit(d);
  const best = state.debatersById[d.bestSpeakerId];

  return `
  <article class="motion">
    <p class="when">${esc(formatDate(d.heldAt, { year: true }))}, ${esc(
      formatTime(d.heldAt),
    )} · ${esc(d.category)} · ${esc(
      formatById(d.format)?.short ?? d.format,
    )} · ${esc(d.location ?? "სკოლა")}</p>
    <h3>${esc(d.topic)}</h3>
    <div class="sides">
      <div class="side for">
        <p class="who">მომხრე</p>
        <p class="team">${esc(forTeam?.name ?? "—")}</p>
        <p class="roster">${roster(d.for.speakerIds)}</p>
      </div>
      <div class="side against">
        <p class="who">მოწინააღმდეგე</p>
        <p class="team">${esc(againstTeam?.name ?? "—")}</p>
        <p class="roster">${roster(d.against.speakerIds)}</p>
      </div>
    </div>
    ${
      d.status === "finished"
        ? `<p class="verdict">${
            d.winner === "draw"
              ? "<b>ფრე</b>"
              : `გაიმარჯვა: <b>${esc(sideName(d.winner))}</b>`
          }${d.score ? `, ანგარიში ${esc(d.score)}` : ""}${
            best ? ` · საუკეთესო სპიკერი — ${esc(best.name)}` : ""
          }</p>
          ${
            v.total > 0
              ? `<div class="votes" role="img" aria-label="აუდიტორიის ხმები">
                   <span class="f" style="width:${v.forPct}%"></span>
                   <span class="a" style="width:${v.againstPct}%"></span>
                 </div>
                 <p class="meta">აუდიტორია: მომხრე ${v.forPct}%, მოწინააღმდეგე ${v.againstPct}% (${v.total} ხმა)</p>`
              : ""
          }`
        : `<p class="verdict dim">ჯერ არ ჩატარებულა</p>`
    }
  </article>`;
}

function debates(state) {
  const upcoming = state.debates
    .filter((d) => d.status === "upcoming")
    .sort((a, b) => new Date(a.heldAt) - new Date(b.heldAt));
  const argued = state.debates.filter((d) => d.status === "finished");

  return `
${
  upcoming.length > 0
    ? `<section id="upcoming">
  <h2>მომავალი დებატები</h2>
  ${upcoming.map((d) => motion(state, d)).join("")}
</section>`
    : ""
}
${
  argued.length > 0
    ? `<section id="argued" class="page-break">
  <h2>ჩატარებული დებატები<span class="n">${argued.length} მოტივი</span></h2>
  ${argued.map((d) => motion(state, d)).join("")}
</section>`
    : ""
}`;
}

function topics(state) {
  if (state.topics.length === 0) return "";
  const rows = state.topics
    .map(
      (t, i) => `
      <tr class="${i === 0 ? "top" : ""}">
        <td class="rk">${i + 1}</td>
        <td class="l">${esc(t.title)}</td>
        <td class="l dim">${esc(t.category)}</td>
        <td class="l dim">${esc(ergative(t.author))}</td>
        <td>${t.votes ?? 0}</td>
      </tr>`,
    )
    .join("");

  return `
<section id="topics">
  <h2>თემები<span class="n">ხმების მიხედვით</span></h2>
  <p class="note">ყველაზე მეტხმიანი მოტივი გადადის შემდეგ დებატზე.</p>
  <table>
    <thead>
      <tr><th>#</th><th class="l">მოტივი</th><th class="l">კატეგორია</th><th class="l">შემოთავაზა</th><th>ხმა</th></tr>
    </thead>
    <tbody>${rows}
    </tbody>
  </table>
</section>`;
}

function champions(state) {
  if (state.champions.length === 0) return "";
  const name = (id) => esc(state.teamsById[id]?.name ?? "—");
  const rows = state.champions
    .map(
      (c) => `
      <tr>
        <td class="l nowrap">${esc(c.season)}</td>
        <td class="l">${name(c.teamId)}</td>
        <td class="l dim">${name(c.runnerUpId)}</td>
        <td class="l dim">${esc(state.debatersById[c.bestSpeakerId]?.name ?? "—")}</td>
        <td class="l dim">${esc(c.final ?? "—")}${c.score ? ` (${esc(c.score)})` : ""}</td>
      </tr>`,
    )
    .join("");

  return `
<section id="champions">
  <h2>ჩემპიონები</h2>
  <p class="note">სეზონს ფინალი წყვეტს, ცხრილი არა — ამიტომ ეს სია ცალკე ინახება.</p>
  <table>
    <thead>
      <tr><th class="l">სეზონი</th><th class="l">ჩემპიონი</th><th class="l">მეორე</th><th class="l">საუკეთესო სპიკერი</th><th class="l">ფინალის მოტივი</th></tr>
    </thead>
    <tbody>${rows}
    </tbody>
  </table>
</section>`;
}

function calendar(state, now) {
  if (state.events.length === 0) return "";
  const sorted = [...state.events].sort(
    (a, b) => new Date(a.startsAt) - new Date(b.startsAt),
  );
  const ahead = sorted.filter((e) => new Date(e.startsAt) >= now);
  const behind = sorted.filter((e) => new Date(e.startsAt) < now).reverse();

  const li = (e, i, future) => `
    <li class="${future && i === 0 ? "next" : ""}">
      <p class="when">${esc(formatDate(e.startsAt, { year: true }))}, ${esc(
        formatTime(e.startsAt),
      )} · ${esc(e.kind ?? "ღონისძიება")} · ${esc(e.location ?? "სკოლა")}</p>
      <h3>${esc(e.title)}</h3>
      ${e.note ? `<p class="note">${esc(e.note)}</p>` : ""}
    </li>`;

  return `
<section id="calendar">
  <h2>კალენდარი</h2>
  ${
    ahead.length > 0
      ? `<ul class="diary">${ahead.map((e, i) => li(e, i, true)).join("")}</ul>`
      : `<p class="note">დაგეგმილი ღონისძიება არ არის.</p>`
  }
  ${
    behind.length > 0
      ? `<h3 style="margin-top:18px">ჩატარებული</h3>
         <ul class="diary">${behind.slice(0, 8).map((e, i) => li(e, i, false)).join("")}</ul>`
      : ""
  }
</section>`;
}

function formats() {
  return `
<section id="formats">
  <h2>ფორმატები</h2>
  <p class="note">რეგლამენტი ორივესთვის ერთია: ახალი არგუმენტი დასკვნაში არ ითვლება.</p>
  <div class="formats">
    ${FORMATS.map(
      (f) => `
    <div class="card">
      <span class="short">${esc(f.short)}</span>
      <h3>${esc(f.name)}</h3>
      <p class="note">${esc(f.summary)}</p>
      <ol class="order">
        ${f.order
          .map(
            (s) => `
        <li>
          <span class="step">${esc(s.name)}<span class="hint">${esc(s.note)}</span></span>
          <span class="mins">${s.minutes} წთ</span>
        </li>`,
          )
          .join("")}
      </ol>
      <p class="meta">სულ ${f.minutes} წუთი, ${
        f.speakers === 1 ? "თითო სპიკერი მხარეს" : `${f.speakers} სპიკერი მხარეს`
      }</p>
    </div>`,
    ).join("")}
  </div>
</section>`;
}

/* ---------------------------------------------------------------- *
 * The file
 * ---------------------------------------------------------------- */

export function buildNotebook(state, now = new Date()) {
  const argued = state.debates.filter((d) => d.status === "finished").length;
  const upcoming = state.debates.length - argued;

  const index = [
    state.champion && {
      id: "champion",
      title: "ჩემპიონი გუნდი",
      hint: "ცხრილის სათავე",
    },
    state.teams.length && {
      id: "teams",
      title: "ლიგის ცხრილი",
      hint: `${state.teams.length} გუნდი`,
    },
    state.debaters.length && {
      id: "speakers",
      title: "სპიკერების რეიტინგი",
      hint: "ქულების წესით",
    },
    upcoming > 0 && {
      id: "upcoming",
      title: "მომავალი დებატები",
      hint: `${upcoming} მოტივი`,
    },
    argued > 0 && {
      id: "argued",
      title: "ჩატარებული დებატები",
      hint: `${argued} მოტივი`,
    },
    state.topics.length && {
      id: "topics",
      title: "თემები",
      hint: "ხმების მიხედვით",
    },
    state.champions.length && {
      id: "champions",
      title: "ჩემპიონები",
      hint: "წინა სეზონები",
    },
    state.events.length && { id: "calendar", title: "კალენდარი", hint: "დარბაზი" },
    { id: "formats", title: "ფორმატები", hint: "სიტყვა სიტყვის მიყოლებით" },
  ].filter(Boolean);

  return `<!doctype html>
<html lang="ka">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>დებატების რვეული — ${esc(formatDate(now, { year: true }))}</title>
<style>${PAGE_CSS}</style>
</head>
<body>
<div class="bar"><button type="button" onclick="window.print()">დაბეჭდე</button></div>
<main class="sheet">
${masthead(state, now)}
${contents(index)}
${champion(state)}
${teamTable(state)}
${speakerTable(state)}
${debates(state)}
${topics(state)}
${champions(state)}
${calendar(state, now)}
${formats()}
<footer>
  <span>დებატების კლუბი · რუსთავის №4 საჯარო სკოლა</span>
  <span>ეს ფაილი ინტერნეტის გარეშე მუშაობს</span>
  <span>Made By საბა ყურაშვილი</span>
</footer>
</main>
</body>
</html>`;
}

/** Hand the file to the browser. Returns the name it was saved under. */
export function downloadNotebook(state, now = new Date()) {
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const filename = `debates-rveuli-${stamp}.html`;

  const blob = new Blob([buildNotebook(state, now)], {
    type: "text/html;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return filename;
}
