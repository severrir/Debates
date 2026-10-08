import { ArrowLeft, Mic } from "lucide-react";
import { Empty, Rank, SideTag } from "./bits.jsx";
import { formatDate } from "../lib/georgian.js";

/** The league table: three points for a win, one for a draw. */
export default function TeamsView({ state }) {
  if (state.teams.length === 0) {
    return (
      <div className="px-4 pt-6">
        <Empty title="გუნდი ჯერ არ არის" body="ადმინისტრატორს შეუძლია დაამატოს." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="font-serif text-2xl font-semibold text-bone">
        ლიგის ტურნირული ცხრილი
      </h1>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <caption className="sr-only">გუნდების ცხრილი</caption>
          <thead>
            <tr className="border-b border-rule text-left text-meta text-bone-3">
              <th scope="col" className="py-2 pl-3 pr-1 font-normal">#</th>
              <th scope="col" className="px-1 py-2 font-normal">გუნდი</th>
              <th scope="col" className="px-1 py-2 text-right font-normal">თ</th>
              <th scope="col" className="px-1 py-2 text-right font-normal">მ</th>
              <th scope="col" className="px-1 py-2 text-right font-normal">ფ</th>
              <th scope="col" className="px-1 py-2 text-right font-normal">წ</th>
              <th scope="col" className="py-2 pl-1 pr-3 text-right font-normal">ქულა</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {state.teams.map((t) => (
              <tr key={t.id} className="transition-colors hover:bg-hall-700/50">
                <td className="py-2 pl-3 pr-1"><Rank rank={t.rank} /></td>
                <td className="max-w-0 px-1 py-2">
                  <a
                    href={`#/team/${t.id}`}
                    className="flex min-h-11 flex-col justify-center no-underline"
                  >
                    <span className="block truncate text-bone">{t.name}</span>
                    <span className="block text-meta text-bone-3">{t.klass}</span>
                  </a>
                </td>
                <td className="px-1 py-2 text-right text-bone-2">{t.played}</td>
                <td className="px-1 py-2 text-right text-bone-2">{t.wins}</td>
                <td className="px-1 py-2 text-right text-bone-2">{t.draws}</td>
                <td className="px-1 py-2 text-right text-bone-2">{t.losses}</td>
                <td className="py-2 pl-1 pr-3 text-right font-serif text-base text-bone">
                  {t.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t border-rule px-3 py-2 text-meta text-bone-3">
          თ — თამაში, მ — მოგება, ფ — ფრე, წ — წაგება. მოგება 3 ქულა, ფრე 1.
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- *
 * One team
 * ---------------------------------------------------------------- */

export function TeamView({ state, teamId, onBack }) {
  const team = state.teamsById[teamId];
  if (!team) {
    return (
      <div className="px-4 pt-4">
        <Back onBack={onBack} />
        <Empty title="გუნდი ვერ ვიპოვე" body="შესაძლოა ჩანაწერი წაშლილია." />
      </div>
    );
  }

  const members = (team.memberIds ?? [])
    .map((id) => state.debatersById[id])
    .filter(Boolean);

  const history = state.debates.filter(
    (d) =>
      d.status === "finished" &&
      (d.for.teamId === team.id || d.against.teamId === team.id),
  );

  return (
    <div className="flex flex-col gap-6 px-4 pt-4">
      <Back onBack={onBack} />

      <header className="animate-settle">
        <div className="flex items-start gap-3">
          <Rank rank={team.rank} />
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-semibold text-bone">
              {team.name}
            </h1>
            <p className="text-sm text-bone-2">{team.klass}</p>
          </div>
        </div>
        {team.motto && (
          <p className="measure mt-2 border-l-2 border-hall-600 pl-3 text-sm italic text-bone-2">
            {team.motto}
          </p>
        )}

        <dl className="tnum mt-4 grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-rule bg-hall-600/40">
          <Stat label="ქულა" value={team.points} accent />
          <Stat label="მოგება" value={team.wins} />
          <Stat label="ფრე" value={team.draws} />
          <Stat label="წაგება" value={team.losses} />
        </dl>
      </header>

      <section>
        <h2 className="font-serif text-xl font-semibold text-bone">
          შემადგენლობა
        </h2>
        <ul className="card mt-2 divide-y divide-rule">
          {members.map((m) => (
            <li key={m.id}>
              <a
                href={`#/speaker/${m.id}`}
                className="flex min-h-12 items-center gap-3 px-3 py-2 no-underline transition-colors hover:bg-hall-700/50"
              >
                <span className="min-w-0 flex-1 truncate text-base text-bone">
                  {m.name}
                </span>
                {m.bestSpeaker > 0 && (
                  <span className="tnum inline-flex items-center gap-1 text-meta text-gavel-soft">
                    <Mic size={12} strokeWidth={2} aria-hidden="true" />
                    {m.bestSpeaker}
                  </span>
                )}
                <span className="tnum shrink-0 font-serif text-base text-bone">
                  {m.points}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold text-bone">ისტორია</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-bone-2">ჯერ არ უდებატია.</p>
        ) : (
          <ul className="card mt-2 divide-y divide-rule">
            {history.map((d) => {
              const side = d.for.teamId === team.id ? "for" : "against";
              const won = d.winner === side;
              const drew = d.winner === "draw";
              return (
                <li key={d.id}>
                  <a
                    href={`#/debate/${d.id}`}
                    className="block px-3 py-2.5 no-underline transition-colors hover:bg-hall-700/50"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 flex-1 truncate text-sm text-bone">
                        {d.topic}
                      </span>
                      <span
                        className={`tnum shrink-0 text-sm font-semibold ${
                          drew ? "text-bone-2" : won ? "text-gavel-soft" : "text-bone-3"
                        }`}
                      >
                        {drew ? "ფრე" : won ? "მოგება" : "წაგება"}
                      </span>
                    </div>
                    <p className="mt-0.5 flex items-center gap-2">
                      <SideTag side={side} />
                      <span className="tnum text-meta text-bone-3">
                        {d.score}, {formatDate(d.heldAt, { short: true })}
                      </span>
                    </p>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- *
 * Debater rankings and one debater
 * ---------------------------------------------------------------- */

export function SpeakersView({ state }) {
  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-bone">
          სპიკერების რეიტინგი
        </h1>
        <p className="measure mt-1 text-sm text-bone-2">
          მოგება 3 ქულა, ფრე 1, საუკეთესო სპიკერის ჯილდო 2, მონაწილეობა 1.
        </p>
      </div>

      <ol className="card divide-y divide-rule">
        {state.debaters.map((d) => (
          <li key={d.id}>
            <a
              href={`#/speaker/${d.id}`}
              className="flex min-h-14 items-center gap-3 px-3 py-2 no-underline transition-colors hover:bg-hall-700/50"
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
    </div>
  );
}

export function SpeakerView({ state, speakerId, onBack }) {
  const s = state.debatersById[speakerId];
  if (!s) {
    return (
      <div className="px-4 pt-4">
        <Back onBack={onBack} />
        <Empty title="სპიკერი ვერ ვიპოვე" body="შესაძლოა ჩანაწერი წაშლილია." />
      </div>
    );
  }

  const team = state.teamsById[s.teamId];
  const appearances = state.debates.filter(
    (d) =>
      d.status === "finished" &&
      [...(d.for.speakerIds ?? []), ...(d.against.speakerIds ?? [])].includes(s.id),
  );

  return (
    <div className="flex flex-col gap-6 px-4 pt-4">
      <Back onBack={onBack} />

      <header className="animate-settle">
        <div className="flex items-start gap-3">
          <Rank rank={s.rank} />
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-semibold text-bone">
              {s.name}
            </h1>
            <p className="text-sm text-bone-2">
              {team ? (
                <a href={`#/team/${team.id}`} className="text-gavel-soft">
                  {team.name}
                </a>
              ) : (
                s.klass
              )}
            </p>
          </div>
        </div>

        <dl className="tnum mt-4 grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-rule bg-hall-600/40">
          <Stat label="ქულა" value={s.points} accent />
          <Stat label="დებატი" value={s.appearances} />
          <Stat label="მოგება" value={s.wins} />
          <Stat label="საუკეთესო" value={s.bestSpeaker} />
        </dl>
      </header>

      <section>
        <h2 className="font-serif text-xl font-semibold text-bone">
          გამოსვლები
        </h2>
        {appearances.length === 0 ? (
          <p className="mt-2 text-sm text-bone-2">ჯერ არ გამოსულა.</p>
        ) : (
          <ul className="card mt-2 divide-y divide-rule">
            {appearances.map((d) => {
              const side = (d.for.speakerIds ?? []).includes(s.id)
                ? "for"
                : "against";
              const best = d.bestSpeakerId === s.id;
              return (
                <li key={d.id}>
                  <a
                    href={`#/debate/${d.id}`}
                    className="block px-3 py-2.5 no-underline transition-colors hover:bg-hall-700/50"
                  >
                    <span className="block truncate text-sm text-bone">
                      {d.topic}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <SideTag side={side} />
                      <span className="tnum text-meta text-bone-3">
                        {d.winner === "draw"
                          ? "ფრე"
                          : d.winner === side
                            ? "მოგება"
                            : "წაგება"}
                        , {formatDate(d.heldAt, { short: true })}
                      </span>
                      {best && (
                        <span className="inline-flex items-center gap-1 text-meta text-gavel-soft">
                          <Mic size={11} strokeWidth={2} aria-hidden="true" />
                          საუკეთესო სპიკერი
                        </span>
                      )}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, accent = false }) {
  return (
    <div className="bg-hall-800 px-2 py-3 text-center">
      <dt className="text-meta text-bone-3">{label}</dt>
      <dd className={`font-serif text-xl ${accent ? "text-gavel" : "text-bone"}`}>
        {value}
      </dd>
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
