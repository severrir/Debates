import { useMemo, useState } from "react";
import { Check, Plus, ThumbsUp } from "lucide-react";
import { Empty, Pill } from "./bits.jsx";
import { Field, inputClass } from "./Sheet.jsx";
import { CATEGORIES } from "../lib/scoring.js";
import { addTopic, hasVoted, voteTopic } from "../lib/store.js";
import { ergative, relativeAgo } from "../lib/georgian.js";

/**
 * What the club argues next is decided here.
 *
 * Suggesting and voting are the same screen, because a student who has
 * just read six motions is exactly the person with a seventh — and the
 * form sits below the list so reading comes first.
 */
export default function TopicsView({ state, onToast }) {
  const [category, setCategory] = useState("all");
  const [, bump] = useState(0);

  const rows = useMemo(
    () =>
      state.topics.filter((t) => category === "all" || t.category === category),
    [state.topics, category],
  );

  const leader = state.topics[0];

  function cast(topic) {
    if (voteTopic(topic.id)) {
      onToast("ხმა ჩაითვალა");
    } else {
      onToast("ამ თემას უკვე მიეცი ხმა", { tone: "error" });
    }
    bump((n) => n + 1);
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-bone">
          თემები
        </h1>
        <p className="measure mt-1 text-sm text-bone-2">
          შემოგვთავაზე მოტივი და მიეცი ხმა იმას, რომლის მოსმენაც გინდა.
          ყველაზე მეტხმიანი გადადის შემდეგ დებატზე.
        </p>
      </div>

      {leader && (
        <div className="card px-4 py-3">
          <p className="text-meta text-bone-3">ამჟამად ლიდერობს</p>
          <p className="mt-0.5 font-serif text-lg text-bone">{leader.title}</p>
          <p className="tnum mt-0.5 text-meta text-gavel-soft">
            {leader.votes} ხმა
          </p>
        </div>
      )}

      <div className="rail -mx-4 flex gap-1 px-4 pb-1">
        <Pill active={category === "all"} onClick={() => setCategory("all")}>
          ყველა
        </Pill>
        {CATEGORIES.map((c) => (
          <Pill key={c} active={category === c} onClick={() => setCategory(c)}>
            {c}
          </Pill>
        ))}
      </div>

      {rows.length === 0 ? (
        <Empty
          title="ამ კატეგორიაში თემა არ არის"
          body="შემოგვთავაზე პირველი — ფორმა ქვემოთაა."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((t) => {
            const voted = hasVoted(`topic:${t.id}`);
            return (
              <li key={t.id} className="card flex items-start gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-meta text-bone-3">
                    {t.category}
                  </span>
                  <span className="mt-0.5 block font-serif text-base text-bone">
                    {t.title}
                  </span>
                  <span className="block text-meta text-bone-3">
                    შემოთავაზა {ergative(t.author)},{" "}
                    {relativeAgo(t.suggestedAt)}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => cast(t)}
                  disabled={voted}
                  aria-label={`${t.title} — ხმის მიცემა`}
                  className={`flex min-h-14 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border transition-colors ${
                    voted
                      ? "border-gavel/50 bg-gavel/15 text-gavel-soft"
                      : "border-hall-600 text-bone-2 hover:bg-hall-700"
                  }`}
                >
                  {voted ? (
                    <Check size={15} strokeWidth={2.5} />
                  ) : (
                    <ThumbsUp size={15} strokeWidth={1.75} />
                  )}
                  <span className="tnum text-sm">{t.votes}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <SuggestForm onToast={onToast} />
    </div>
  );
}

function SuggestForm({ onToast }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [author, setAuthor] = useState("");
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (title.trim().length < 8) {
      setError("მოტივი ცოტა უფრო გასაგები დაწერე.");
      return;
    }
    if (author.trim().length < 2) {
      setError("სახელი აუცილებელია — ვიცოდეთ ვის მადლობა გადავუხადოთ.");
      return;
    }
    try {
      await addTopic({
        title: title.trim(),
        category,
        author: author.trim(),
      });
      setTitle("");
      setError(null);
      onToast("თემა შემოთავაზებულია");
    } catch {
      setError("ვერ გაიგზავნა. შეამოწმე ინტერნეტი და სცადე ხელახლა.");
    }
  }

  return (
    <section className="border-t border-rule pt-5">
      <h2 className="font-serif text-xl font-semibold text-bone">
        შემოგვთავაზე თემა
      </h2>
      <form onSubmit={submit} className="mt-3 flex flex-col gap-4">
        <Field label="მოტივი" hint="დაწერე მტკიცების სახით, რომ ორივე მხარე არსებობდეს.">
          <textarea
            rows={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="სკოლის ფორმა უნდა გაუქმდეს"
            maxLength={160}
            className={`${inputClass} resize-y py-2.5`}
          />
        </Field>

        <Field label="კატეგორია">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-hall-700">
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="შენი სახელი">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="ნინო ხაჩიძე"
            maxLength={60}
            className={inputClass}
          />
        </Field>

        {error && (
          <p role="alert" className="text-sm text-for-soft">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-bone text-base font-semibold text-hall-900 transition-opacity hover:opacity-90"
        >
          <Plus size={17} strokeWidth={2.4} />
          შემოთავაზება
        </button>
      </form>
    </section>
  );
}
