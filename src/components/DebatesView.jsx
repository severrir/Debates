import { useMemo, useState } from "react";
import { ArrowLeft, Mic, Trophy } from "lucide-react";
import { Empty, Pill, SideTag } from "./bits.jsx";
import VoteBar from "./VoteBar.jsx";
import { Matchup } from "./HomeView.jsx";
import { CATEGORIES, FORMATS, sideName } from "../lib/scoring.js";
import { hasVoted, voteAudience } from "../lib/store.js";
import { describeWhen, formatDate, formatTime } from "../lib/georgian.js";

/** Every motion the club has argued, and the ones still to come. */
export default function DebatesView({ state }) {
  const [category, setCategory] = useState("all");
  const [format, setFormat] = useState("all");

  const rows = useMemo(
    () =>
      state.debates.filter(
        (d) =>
          (category === "all" || d.category === category) &&
          (format === "all" || d.format === format),
      ),
    [state.debates, category, format],
  );

  const upcoming = rows.filter((d) => d.status === "upcoming");
  const finished = rows.filter((d) => d.status === "finished");

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <div className="rail -mx-4 flex gap-1 px-4 pb-1">
        <Pill active={category === "all"} onClick={() => setCategory("all")}>
          ყველა თემა
        </Pill>
        {CATEGORIES.map((c) => (
          <Pill key={c} active={category === c} onClick={() => setCategory(c)}>
            {c}
          </Pill>
        ))}
      </div>

      <div className="flex gap-1">
        <Pill active={format === "all"} onClick={() => setFormat("all")}>
          ყველა ფორმატი
        </Pill>
        {FORMATS.map((f) => (
          <Pill key={f.id} active={format === f.id} onClick={() => setFormat(f.id)}>
            {f.short}
          </Pill>
        ))}
      </div>

      {rows.length === 0 && (
        <Empty title="ვერაფერი ვიპოვე" body="სცადე სხვა თემა ან ფორმატი." />
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-2 font-serif text-xl font-semibold text-bone">
            მომავალი
          </h2>
          <ul className="flex flex-col gap-2">
            {upcoming.map((d) => (
              <DebateCard key={d.id} debate={d} state={state} />
            ))}
          </ul>
        </section>
      )}

      {finished.length > 0 && (
        <section>
          <h2 className="mb-2 font-serif text-xl font-semibold text-bone">
            ჩატარებული
          </h2>
          <ul className="flex flex-col gap-2">
            {finished.map((d) => (
              <DebateCard key={d.id} debate={d} state={state} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function DebateCard({ debate, state }) {
  const forTeam = state.teamsById[debate.for.teamId];
  const againstTeam = state.teamsById[debate.against.teamId];
  const done = debate.status === "finished";

  return (
    <li>
      <a href={`#/debate/${debate.id}`} className="card block px-4 py-3.5 no-underline transition-colors hover:bg-hall-700/40">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-meta text-bone-3">{debate.category}</span>
          <span className="shrink-0 text-meta text-bone-3">
            {done ? formatDate(debate.heldAt, { short: true }) : describeWhen(debate.heldAt).label}
          </span>
        </div>

        <h3 className="mt-1 font-serif text-lg text-bone">{debate.topic}</h3>

        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className={done && debate.winner === "for" ? "text-bone" : "text-bone-2"}>
            {forTeam?.name ?? "—"}
          </span>
          <span className="text-bone-3">—</span>
          <span className={done && debate.winner === "against" ? "text-bone" : "text-bone-2"}>
            {againstTeam?.name ?? "—"}
          </span>
          {done && (
            <span className="tnum ml-auto shrink-0 font-serif text-base text-bone">
              {debate.score}
            </span>
          )}
        </div>

        {done && (
          <>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              {debate.winner === "draw" ? (
                <span className="text-meta text-bone-3">ფრე</span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-meta">
                  <Trophy size={12} strokeWidth={2} aria-hidden="true" className="text-gavel" />
                  <SideTag side={debate.winner} />
                </span>
              )}
              {debate.bestSpeakerId && (
                <span className="inline-flex items-center gap-1.5 text-meta text-bone-3">
                  <Mic size={12} strokeWidth={2} aria-hidden="true" />
                  {state.debatersById[debate.bestSpeakerId]?.name}
                </span>
              )}
            </p>
            <div className="mt-2.5">
              <VoteBar debate={debate} animate={false} />
            </div>
          </>
        )}
      </a>
    </li>
  );
}

/* ---------------------------------------------------------------- *
 * One debate, with the audience vote
 * ---------------------------------------------------------------- */

export function DebateView({ state, debateId, onBack, onToast }) {
  const d = state.debatesById[debateId];
  const [voted, setVoted] = useState(() => hasVoted(`debate:${debateId}`));

  if (!d) {
    return (
      <div className="px-4 pt-4">
        <Back onBack={onBack} />
        <Empty title="დებატი ვერ ვიპოვე" body="შესაძლოა ჩანაწერი წაშლილია." />
      </div>
    );
  }

  const done = d.status === "finished";

  function cast(side) {
    if (voteAudience(d.id, side)) {
      setVoted(true);
      onToast(`ხმა მიეცა: ${sideName(side)}`);
    } else {
      onToast("ამ დებატში უკვე მიეცი ხმა", { tone: "error" });
      setVoted(true);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-4">
      <Back onBack={onBack} />

      <header className="animate-settle">
        <p className="text-sm text-bone-3">{d.category}</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-bone">
          {d.topic}
        </h1>
        <p className="tnum mt-2 text-sm text-bone-2">
          {formatDate(d.heldAt)}, {formatTime(d.heldAt)}, {d.location}
        </p>
        <p className="mt-0.5 text-meta text-bone-3">
          ფორმატი {FORMATS.find((f) => f.id === d.format)?.name ?? d.format}
        </p>
      </header>

      <Matchup state={state} debate={d} className="animate-split" />

      {done && (
        <section className="card px-4 py-3.5">
          <h2 className="font-serif text-base text-bone-2">შედეგი</h2>
          <p className="tnum mt-1 text-lg text-bone">
            {d.winner === "draw" ? "ფრე" : `გაიმარჯვა ${sideName(d.winner)}`}
            {d.score ? `, ${d.score}` : ""}
          </p>
          {d.bestSpeakerId && (
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-bone-2">
              <Mic size={14} strokeWidth={1.75} aria-hidden="true" className="text-gavel" />
              საუკეთესო სპიკერი:{" "}
              <a
                href={`#/speaker/${d.bestSpeakerId}`}
                className="inline-flex min-h-11 items-center text-gavel-soft"
              >
                {state.debatersById[d.bestSpeakerId]?.name}
              </a>
            </p>
          )}
        </section>
      )}

      {/* ---- Audience vote ---- */}
      <section>
        <h2 className="font-serif text-xl font-semibold text-bone">
          აუდიტორიის ხმა
        </h2>
        <p className="measure mt-1 text-sm text-bone-2">
          რომელმა მხარემ დაგარწმუნა? ერთი ხმა თითო მოწყობილობიდან.
        </p>

        <div className="card mt-3 px-4 py-4">
          <VoteBar debate={d} />

          {!voted ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => cast("for")}
                className="min-h-12 rounded-lg border border-for/60 bg-for/10 text-sm font-semibold text-for-soft transition-colors hover:bg-for/20"
              >
                მომხრე
              </button>
              <button
                type="button"
                onClick={() => cast("against")}
                className="min-h-12 rounded-lg border border-against/60 bg-against/10 text-sm font-semibold text-against-soft transition-colors hover:bg-against/20"
              >
                მოწინააღმდეგე
              </button>
            </div>
          ) : (
            <p className="mt-3 text-meta text-bone-3">
              შენი ხმა ჩაითვალა. მადლობა.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Back({ onBack }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm text-bone-2 transition-colors hover:text-bone"
    >
      <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
      უკან
    </button>
  );
}
