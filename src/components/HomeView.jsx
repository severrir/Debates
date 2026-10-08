import { ChevronRight, Mic, Trophy } from "lucide-react";
import { Empty, Rank, SideTag } from "./bits.jsx";
import VoteBar from "./VoteBar.jsx";
import { sideName } from "../lib/scoring.js";
import { describeWhen, formatDate, formatTime } from "../lib/georgian.js";

/**
 * The hall before the debate starts: what is being argued next, who holds
 * the title, who is speaking best, and how the last motion landed.
 *
 * The next motion is set large and split by the same centre line the page
 * is built on, so the two sides read as opposed before a word is read.
 */
export default function HomeView({ state, onView }) {
  const upcoming = state.debates
    .filter((d) => d.status === "upcoming")
    .sort((a, b) => new Date(a.heldAt) - new Date(b.heldAt));
  const next = upcoming[0];
  const latest = state.debates.find((d) => d.status === "finished");
  const topSpeakers = state.debaters.slice(0, 5);

  return (
    <div className="flex flex-col gap-7">
      {/* ---- Next motion ---- */}
      {next ? (
        <section className="animate-settle px-4 pt-6">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm text-bone-3">შემდეგი დებატი</p>
            <span className="shrink-0 text-sm font-semibold text-gavel-soft">
              {describeWhen(next.heldAt).label}
            </span>
          </div>

          <h2 className="measure mt-1 font-serif text-xl font-semibold text-bone sm:text-2xl">
            {next.topic}
          </h2>

          <p className="tnum mt-2 text-sm text-bone-2">
            {formatDate(next.heldAt)}, {formatTime(next.heldAt)}, {next.location}
          </p>

          <Matchup state={state} debate={next} className="animate-split mt-4" />
        </section>
      ) : (
        <section className="px-4 pt-6">
          <Empty
            title="დაგეგმილი დებატი არ არის"
            body="შემდეგი მოტივი მალე გამოცხადდება."
          />
        </section>
      )}

      {/* ---- Champion ---- */}
      {state.champion && (
        <section className="px-4">
          <Head title="ჩემპიონი გუნდი" onMore={() => onView("teams")} />
          <a
            href={`#/team/${state.champion.id}`}
            className="card mt-2 flex items-center gap-3 px-4 py-3.5 no-underline transition-colors hover:bg-hall-700/50"
          >
            <Trophy
              size={26}
              strokeWidth={1.5}
              aria-hidden="true"
              className="shrink-0 text-gavel"
            />
            <span className="min-w-0 flex-1">
              <span className="block font-serif text-xl text-bone">
                {state.champion.name}
              </span>
              <span className="tnum block text-meta text-bone-3">
                {state.champion.points} ქულა, {state.champion.wins} მოგება
              </span>
            </span>
            <ChevronRight
              size={18}
              strokeWidth={2}
              aria-hidden="true"
              className="shrink-0 text-bone-3"
            />
          </a>
        </section>
      )}

      {/* ---- Top debaters ---- */}
      <section className="px-4">
        <Head title="საუკეთესო სპიკერები" onMore={() => onView("speakers")} />
        <ol className="card mt-2 divide-y divide-rule">
          {topSpeakers.map((d) => (
            <li key={d.id}>
              <a
                href={`#/speaker/${d.id}`}
                className="flex min-h-12 items-center gap-3 px-3 py-2 no-underline transition-colors hover:bg-hall-700/50"
              >
                <Rank rank={d.rank} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base text-bone">
                    {d.name}
                  </span>
                  <span className="block text-meta text-bone-3">
                    {state.teamsById[d.teamId]?.name ?? d.klass}
                  </span>
                </span>
                {d.bestSpeaker > 0 && (
                  <span className="tnum inline-flex shrink-0 items-center gap-1 text-meta text-gavel-soft">
                    <Mic size={12} strokeWidth={2} aria-hidden="true" />
                    {d.bestSpeaker}
                  </span>
                )}
                <span className="tnum shrink-0 font-serif text-lg text-bone">
                  {d.points}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      {/* ---- Latest result ---- */}
      {latest && (
        <section className="px-4">
          <Head title="ბოლო შედეგი" onMore={() => onView("debates")} />
          <a
            href={`#/debate/${latest.id}`}
            className="card mt-2 block px-4 py-3.5 no-underline"
          >
            <h3 className="font-serif text-lg text-bone">{latest.topic}</h3>
            <p className="tnum mt-1 text-sm text-bone-2">
              {latest.winner === "draw"
                ? "ფრე"
                : `გაიმარჯვა: ${sideName(latest.winner)}`}
              , {latest.score}
            </p>
            <div className="mt-3">
              <VoteBar debate={latest} animate={false} />
            </div>
          </a>
        </section>
      )}
    </div>
  );
}

/** The two sides of a motion, split by the page's own centre line. */
export function Matchup({ state, debate, className = "" }) {
  const forTeam = state.teamsById[debate.for.teamId];
  const againstTeam = state.teamsById[debate.against.teamId];

  return (
    <div className={`grid grid-cols-[1fr_auto_1fr] items-stretch gap-3 ${className}`}>
      <SideCard side="for" team={forTeam} ids={debate.for.speakerIds} state={state} />
      {/* The rule itself says they are opposed; no label needed. */}
      <div aria-hidden="true" className="w-px justify-self-center bg-rule" />
      <SideCard
        side="against"
        team={againstTeam}
        ids={debate.against.speakerIds}
        state={state}
        align="right"
      />
    </div>
  );
}

function SideCard({ side, team, ids, state, align = "left" }) {
  const right = align === "right";
  return (
    <div className={right ? "text-right" : ""}>
      <SideTag side={side} className={right ? "flex-row-reverse" : ""} />
      <a
        href={team ? `#/team/${team.id}` : undefined}
        className={`mt-0.5 flex min-h-11 items-center font-serif text-lg text-bone no-underline ${
          right ? "justify-end" : ""
        }`}
      >
        {team?.name ?? "—"}
      </a>
      <ul className="mt-1 space-y-0.5">
        {(ids ?? []).map((id) => (
          <li key={id} className="truncate text-meta text-bone-3">
            {state.debatersById[id]?.name ?? "—"}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Head({ title, onMore }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="font-serif text-xl font-semibold text-bone">{title}</h2>
      {onMore && (
        <button
          type="button"
          onClick={onMore}
          className="inline-flex min-h-11 items-center gap-0.5 text-sm text-gavel-soft"
        >
          ყველა
          <ChevronRight size={15} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
