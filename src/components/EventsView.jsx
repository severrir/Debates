import { useMemo } from "react";
import { Clock, MapPin, Mic, Trophy } from "lucide-react";
import { Empty } from "./bits.jsx";
import { FORMATS } from "../lib/scoring.js";
import {
  describeWhen,
  formatDate,
  formatTime,
  genitive,
} from "../lib/georgian.js";

/**
 * The calendar, the roll of honour and the rules of the room.
 *
 * Scheduled events and scheduled debates are one list here, because a
 * student looking for "when is the next one" does not care which table the
 * row came from. The list hangs off a single vertical rule — the same
 * centre line the rest of the site is built on, pulled to the left so the
 * dates read as a spine.
 */
export default function EventsView({ state, onDebate }) {
  const items = useMemo(() => {
    const fromEvents = state.events.map((e) => ({
      key: `ev:${e.id}`,
      at: e.startsAt,
      title: e.title,
      location: e.location,
      note: e.note,
      kind: e.kind ?? "ღონისძიება",
      debateId: null,
    }));

    const fromDebates = state.debates
      .filter((d) => d.status === "upcoming")
      .map((d) => ({
        key: `db:${d.id}`,
        at: d.heldAt,
        title: d.topic,
        location: d.location,
        // "ლოგოსი ანტითეზისის წინააღმდეგ" — the second team inflects.
        note: `${state.teamsById[d.for.teamId]?.name ?? "—"} ${genitive(
          state.teamsById[d.against.teamId]?.name,
        )} წინააღმდეგ`,
        kind: "დებატი",
        debateId: d.id,
      }));

    return [...fromEvents, ...fromDebates].sort(
      (a, b) => new Date(a.at) - new Date(b.at),
    );
  }, [state.events, state.debates, state.teamsById]);

  const now = Date.now();
  const ahead = items.filter((i) => new Date(i.at).getTime() >= now - 36e5);
  const behind = items
    .filter((i) => new Date(i.at).getTime() < now - 36e5)
    .reverse();

  return (
    <div className="flex flex-col gap-8 px-4 pt-6">
      <section className="animate-settle">
        <h1 className="font-serif text-2xl font-semibold text-bone">
          დარბაზის კალენდარი
        </h1>
        <p className="measure mt-1 text-sm text-bone-2">
          დებატების საღამოები, ფინალები და სკოლათაშორისი მატჩები — თარიღითა და
          ადგილით.
        </p>

        {ahead.length === 0 ? (
          <div className="mt-4">
            <Empty
              title="დაგეგმილი არაფერია"
              body="შემდეგი დებატების დღე მალე გამოცხადდება."
            />
          </div>
        ) : (
          <Timeline items={ahead} onDebate={onDebate} />
        )}
      </section>

      {behind.length > 0 && (
        <section>
          <h2 className="font-serif text-xl font-semibold text-bone">
            ჩატარებული
          </h2>
          <Timeline items={behind.slice(0, 6)} onDebate={onDebate} past />
        </section>
      )}

      {state.champions.length > 0 && (
        <section>
          <h2 className="font-serif text-xl font-semibold text-bone">
            ჩემპიონები
          </h2>
          <p className="measure mt-1 text-sm text-bone-2">
            სეზონს ფინალი წყვეტს, ცხრილი არა — ამიტომ ეს სია ცალკე ინახება.
          </p>

          <ul className="mt-3 flex flex-col gap-2">
            {state.champions.map((c) => {
              const team = state.teamsById[c.teamId];
              const second = state.teamsById[c.runnerUpId];
              const best = state.debatersById[c.bestSpeakerId];
              return (
                <li key={c.id} className="card px-4 py-3.5">
                  <p className="tnum text-meta text-bone-3">{c.season}</p>

                  <div className="mt-1 flex items-center gap-3">
                    <Trophy
                      size={24}
                      strokeWidth={1.5}
                      aria-hidden="true"
                      className="shrink-0 text-gavel"
                    />
                    <a
                      href={team ? `#/team/${team.id}` : undefined}
                      className="flex min-h-11 min-w-0 flex-1 items-center font-serif text-xl text-bone no-underline"
                    >
                      {team?.name ?? "—"}
                    </a>
                  </div>

                  {c.final && (
                    <p className="measure mt-1.5 text-sm text-bone-2">
                      ფინალი: „{c.final}“
                      {c.score && <span className="tnum"> — {c.score}</span>}
                    </p>
                  )}

                  <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-meta text-bone-3">
                    {second && (
                      <div className="flex gap-1.5">
                        <dt>მეორე ადგილი</dt>
                        <dd className="text-bone-2">{second.name}</dd>
                      </div>
                    )}
                    {best && (
                      <div className="flex items-center gap-1.5">
                        <dt className="inline-flex items-center gap-1">
                          <Mic size={12} strokeWidth={2} aria-hidden="true" />
                          საუკეთესო სპიკერი
                        </dt>
                        <dd>
                          <a
                            href={`#/speaker/${best.id}`}
                            className="text-gavel-soft no-underline"
                          >
                            {best.name}
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-serif text-xl font-semibold text-bone">
          ფორმატები
        </h2>
        <p className="measure mt-1 text-sm text-bone-2">
          კლუბი ორ ფორმატში მუშაობს. რეგლამენტი ორივესთვის ერთია: ახალი
          არგუმენტი დასკვნაში არ ითვლება.
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {FORMATS.map((f) => (
            <article key={f.id} className="card flex flex-col px-4 py-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-serif text-lg text-bone">{f.name}</h3>
                <span className="tnum shrink-0 rounded-md border border-hall-600 px-2 py-0.5 text-meta text-bone-3">
                  {f.short}
                </span>
              </div>

              <p className="mt-1 text-sm text-bone-2">{f.summary}</p>

              <ol className="mt-3 flex flex-col divide-y divide-rule border-t border-rule">
                {f.order.map((step) => (
                  <li
                    key={step.name}
                    className="flex items-baseline gap-3 py-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-bone">
                        {step.name}
                      </span>
                      <span className="block text-meta text-bone-3">
                        {step.note}
                      </span>
                    </span>
                    <span className="tnum shrink-0 text-meta text-gavel-soft">
                      {step.minutes} წთ
                    </span>
                  </li>
                ))}
              </ol>

              <p className="tnum mt-2.5 inline-flex items-center gap-1.5 text-meta text-bone-3">
                <Clock size={12} strokeWidth={2} aria-hidden="true" />
                სულ {f.minutes} წუთი, {f.speakers === 1
                  ? "თითო სპიკერი მხარეს"
                  : `${f.speakers} სპიკერი მხარეს`}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

/** The spine: one rule down the left, a marker and a card per date. */
function Timeline({ items, onDebate, past = false }) {
  return (
    <ol
      className={`relative mt-3 flex flex-col gap-3 border-l border-rule pl-4 ${
        past ? "opacity-70" : ""
      }`}
    >
      {items.map((it, i) => {
        const when = describeWhen(it.at);
        const next = !past && i === 0;
        return (
          <li key={it.key} className="relative">
            <span
              aria-hidden="true"
              className={`absolute -left-[21px] top-4 size-2.5 rounded-full border-2 border-hall-900 ${
                next ? "bg-gavel" : "bg-hall-600"
              }`}
            />

            <article
              className={`card px-4 py-3.5 ${
                next ? "border-gavel/40" : ""
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-meta text-bone-3">{it.kind}</span>
                <span
                  className={`tnum shrink-0 text-meta ${
                    next ? "font-semibold text-gavel-soft" : "text-bone-3"
                  }`}
                >
                  {/* "ჩატარდა" on every past row says nothing; a date does. */}
                  {past ? formatDate(it.at, { short: true }) : when.label}
                </span>
              </div>

              {it.debateId ? (
                <button
                  type="button"
                  onClick={() => onDebate(it.debateId)}
                  className="mt-0.5 block w-full text-left font-serif text-lg text-bone"
                >
                  {it.title}
                </button>
              ) : (
                <h3 className="mt-0.5 font-serif text-lg text-bone">
                  {it.title}
                </h3>
              )}

              <p className="tnum mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-bone-2">
                <span>
                  {formatDate(it.at, { year: Math.abs(when.delta) > 180 })},{" "}
                  {formatTime(it.at)}
                </span>
                {it.location && (
                  <span className="inline-flex items-center gap-1 text-bone-3">
                    <MapPin size={12} strokeWidth={2} aria-hidden="true" />
                    {it.location}
                  </span>
                )}
              </p>

              {it.note && (
                <p className="measure mt-1.5 text-meta text-bone-3">
                  {it.note}
                </p>
              )}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
