import { useState } from "react";
import { CalendarPlus, Gavel, Plus, RotateCcw, Trash2, UserPlus } from "lucide-react";
import { Field, inputClass } from "./Sheet.jsx";
import { Pill } from "./bits.jsx";
import JoinRequests from "./JoinRequests.jsx";
import { CATEGORIES, FORMATS, sideName, speakersIn } from "../lib/scoring.js";
import {
  addDebate,
  addDebater,
  addEvent,
  addTeam,
  addTopic,
  isRemote,
  removeDebate,
  removeDebater,
  removeEvent,
  removeTeam,
  removeTopic,
  resetAll,
  updateDebate,
} from "../lib/store.js";
import { formatDate, fromLocalInputValue, toLocalInputValue } from "../lib/georgian.js";

/**
 * The admin panel, built for a phone at the back of the hall: four tabs,
 * large targets, and results enterable the moment a debate ends.
 *
 * Points are never typed. Recording a winner and a best speaker recomputes
 * the whole table from the debate log.
 */
export default function AdminView({ state, onToast }) {
  const [tab, setTab] = useState("result");

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-bone">
          ადმინისტრირება
        </h1>
        <p className="mt-1 text-sm text-bone-2">
          ქულები ავტომატურად გადაითვლება ყოველი შედეგის შემდეგ.
        </p>
      </div>

      <div className="rail -mx-4 flex gap-1 px-4 pb-1">
        <Pill active={tab === "result"} onClick={() => setTab("result")}>შედეგი</Pill>
        <Pill active={tab === "debate"} onClick={() => setTab("debate")}>დებატი</Pill>
        <Pill active={tab === "team"} onClick={() => setTab("team")}>გუნდი</Pill>
        <Pill active={tab === "topic"} onClick={() => setTab("topic")}>თემა</Pill>
        <Pill active={tab === "event"} onClick={() => setTab("event")}>ღონისძიება</Pill>
        <Pill active={tab === "join"} onClick={() => setTab("join")}>განაცხადები</Pill>
      </div>

      {tab === "result" && <ResultForm state={state} onToast={onToast} />}
      {tab === "debate" && <DebateForm state={state} onToast={onToast} />}
      {tab === "team" && <TeamForm state={state} onToast={onToast} />}
      {tab === "topic" && <TopicForm state={state} onToast={onToast} />}
      {tab === "event" && <EventForm state={state} onToast={onToast} />}
      {tab === "join" && <JoinRequests onToast={onToast} />}

      <section className="mt-2 border-t border-rule pt-4">
        <h2 className="font-serif text-base text-bone-2">საშიში ზონა</h2>
        <p className="measure mt-1 text-meta text-bone-3">
          {isRemote
            ? "ბაზას არ ეხება — მხოლოდ ამ ტელეფონის ასლს აბრუნებს საწყის მდგომარეობაში."
            : "ყველა შეტანილი შედეგი ამ ტელეფონიდან წაიშლება."}
        </p>
        <button
          type="button"
          onClick={() => {
            resetAll();
            onToast("ყველაფერი დაბრუნდა საწყის მდგომარეობაში");
          }}
          className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg border border-hall-600 px-3.5 text-sm text-for-soft transition-colors hover:bg-hall-700"
        >
          <RotateCcw size={15} strokeWidth={1.75} />
          საწყის მდგომარეობაზე დაბრუნება
        </button>
      </section>
    </div>
  );
}

/* ---- Record a result on an upcoming debate ---- */

function ResultForm({ state, onToast }) {
  const open = state.debates.filter((d) => d.status === "upcoming");
  const [debateId, setDebateId] = useState(open[0]?.id ?? "");
  const [winner, setWinner] = useState("for");
  const [score, setScore] = useState("3–2");
  const [bestSpeakerId, setBest] = useState("");
  const [error, setError] = useState(null);

  const debate = state.debatesById[debateId];
  const speakers = debate
    ? [...(debate.for.speakerIds ?? []), ...(debate.against.speakerIds ?? [])]
        .map((id) => state.debatersById[id])
        .filter(Boolean)
    : [];

  async function submit(e) {
    e.preventDefault();
    if (!debate) {
      setError("აირჩიე დებატი.");
      return;
    }
    try {
      await updateDebate(debate.id, {
        status: "finished",
        winner,
        score: score.trim() || null,
        bestSpeakerId: bestSpeakerId || null,
      });
      setError(null);
      onToast("შედეგი ჩაიწერა, ცხრილი განახლდა");
    } catch {
      setError(WRITE_FAILED);
    }
  }

  if (open.length === 0) {
    return (
      <p className="card px-4 py-6 text-center text-sm text-bone-2">
        დასამატებელი შედეგი არ არის — ჯერ დაამატე მომავალი დებატი.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="დებატი">
        <select value={debateId} onChange={(e) => setDebateId(e.target.value)} className={inputClass}>
          {open.map((d) => (
            <option key={d.id} value={d.id} className="bg-hall-700">
              {d.topic.slice(0, 48)}
            </option>
          ))}
        </select>
      </Field>

      <fieldset>
        <legend className="mb-1.5 text-sm text-bone-2">ვინ გაიმარჯვა</legend>
        <div className="grid grid-cols-3 gap-2">
          {["for", "against", "draw"].map((w) => (
            <button
              key={w}
              type="button"
              aria-pressed={winner === w}
              onClick={() => setWinner(w)}
              className={`min-h-12 rounded-lg border px-2 text-sm transition-colors ${
                winner === w
                  ? w === "for"
                    ? "border-for bg-for/15 text-for-soft"
                    : w === "against"
                      ? "border-against bg-against/15 text-against-soft"
                      : "border-gavel bg-gavel/15 text-bone"
                  : "border-hall-600 text-bone-2 hover:bg-hall-700"
              }`}
            >
              {w === "draw" ? "ფრე" : sideName(w)}
            </button>
          ))}
        </div>
      </fieldset>

      <Field label="ანგარიში" hint="მაგალითად 3–2">
        <input type="text" value={score} onChange={(e) => setScore(e.target.value)} maxLength={12} className={inputClass} />
      </Field>

      <Field label="საუკეთესო სპიკერი" optional>
        <select value={bestSpeakerId} onChange={(e) => setBest(e.target.value)} className={inputClass}>
          <option value="" className="bg-hall-700">არ აირჩევა</option>
          {speakers.map((s) => (
            <option key={s.id} value={s.id} className="bg-hall-700">{s.name}</option>
          ))}
        </select>
      </Field>

      {error && <p role="alert" className="text-sm text-for-soft">{error}</p>}
      <Submit icon={Gavel}>შედეგის ჩაწერა</Submit>
    </form>
  );
}

/* ---- Schedule a debate ---- */

function DebateForm({ state, onToast }) {
  const teams = state.teams;
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [format, setFormat] = useState("3v3");
  const [forTeam, setForTeam] = useState(teams[0]?.id ?? "");
  const [againstTeam, setAgainst] = useState(teams[1]?.id ?? "");
  const [heldAt, setHeldAt] = useState(toLocalInputValue(new Date()));
  const [location, setLocation] = useState("სააქტო დარბაზი");
  const [error, setError] = useState(null);

  // The format decides how many of a team's roster actually speak.
  const membersOf = (id) =>
    (state.teamsById[id]?.memberIds ?? []).slice(0, speakersIn(format));

  async function submit(e) {
    e.preventDefault();
    if (topic.trim().length < 8) { setError("მოტივი აუცილებელია."); return; }
    if (!forTeam || !againstTeam || forTeam === againstTeam) {
      setError("აირჩიე ორი სხვადასხვა გუნდი."); return;
    }
    const at = fromLocalInputValue(heldAt);
    if (!at || Number.isNaN(at.getTime())) { setError("თარიღი არასწორია."); return; }

    try {
      await addDebate({
        topic: topic.trim(),
        category,
        format,
        heldAt: at.toISOString(),
        location: location.trim() || "სკოლა",
        for: { teamId: forTeam, speakerIds: membersOf(forTeam) },
        against: { teamId: againstTeam, speakerIds: membersOf(againstTeam) },
      });
      setTopic("");
      setError(null);
      onToast("დებატი დაემატა");
    } catch {
      setError(WRITE_FAILED);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="მოტივი">
        <textarea rows={2} value={topic} onChange={(e) => setTopic(e.target.value)}
          placeholder="სკოლის ფორმა უნდა გაუქმდეს" maxLength={160}
          className={`${inputClass} resize-y py-2.5`} />
      </Field>
      <Field label="კატეგორია">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
          {CATEGORIES.map((c) => <option key={c} value={c} className="bg-hall-700">{c}</option>)}
        </select>
      </Field>
      <Field label="ფორმატი">
        <select value={format} onChange={(e) => setFormat(e.target.value)} className={inputClass}>
          {FORMATS.map((f) => <option key={f.id} value={f.id} className="bg-hall-700">{f.name}</option>)}
        </select>
      </Field>
      <Field label="მომხრე გუნდი">
        <select value={forTeam} onChange={(e) => setForTeam(e.target.value)} className={inputClass}>
          {teams.map((t) => <option key={t.id} value={t.id} className="bg-hall-700">{t.name}</option>)}
        </select>
      </Field>
      <Field label="მოწინააღმდეგე გუნდი">
        <select value={againstTeam} onChange={(e) => setAgainst(e.target.value)} className={inputClass}>
          {teams.map((t) => <option key={t.id} value={t.id} className="bg-hall-700">{t.name}</option>)}
        </select>
      </Field>
      <Field label="როდის">
        <input type="datetime-local" value={heldAt} onChange={(e) => setHeldAt(e.target.value)} className={inputClass} />
      </Field>
      <Field label="ადგილი">
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={60} className={inputClass} />
      </Field>

      {error && <p role="alert" className="text-sm text-for-soft">{error}</p>}
      <Submit icon={CalendarPlus}>დებატის დამატება</Submit>

      <Recent title="დებატები" items={state.debates.slice(0, 6).map((d) => ({
        id: d.id,
        main: d.topic,
        meta: `${formatDate(d.heldAt, { short: true })}, ${d.status === "finished" ? "ჩატარდა" : "მომავალი"}`,
        onRemove: () => remove(removeDebate(d.id), "დებატი წაიშალა", onToast),
      }))} />
    </form>
  );
}

/* ---- Teams and debaters ---- */

function TeamForm({ state, onToast }) {
  const [name, setName] = useState("");
  const [klass, setKlass] = useState("");
  const [motto, setMotto] = useState("");
  const [dName, setDName] = useState("");
  const [dTeam, setDTeam] = useState(state.teams[0]?.id ?? "");
  const [error, setError] = useState(null);

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (name.trim().length < 2) { setError("გუნდის სახელი აუცილებელია."); return; }
          try {
            await addTeam({
              name: name.trim(),
              klass: klass.trim() || "—",
              motto: motto.trim() || null,
            });
            setName(""); setKlass(""); setMotto(""); setError(null);
            onToast("გუნდი დაემატა");
          } catch {
            setError(WRITE_FAILED);
          }
        }}
        className="flex flex-col gap-4"
      >
        <Field label="გუნდის სახელი">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="ლოგოსი" maxLength={40} className={inputClass} />
        </Field>
        <Field label="კლასი">
          <input type="text" value={klass} onChange={(e) => setKlass(e.target.value)}
            placeholder="XI-ა" maxLength={10} className={inputClass} />
        </Field>
        <Field label="დევიზი" optional>
          <input type="text" value={motto} onChange={(e) => setMotto(e.target.value)} maxLength={80} className={inputClass} />
        </Field>
        {error && <p role="alert" className="text-sm text-for-soft">{error}</p>}
        <Submit icon={Plus}>გუნდის დამატება</Submit>
      </form>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (dName.trim().length < 2) { onToast("სპიკერის სახელი აუცილებელია", { tone: "error" }); return; }
          try {
            await addDebater({
              name: dName.trim(),
              teamId: dTeam,
              klass: state.teamsById[dTeam]?.klass ?? "—",
            });
            setDName("");
            onToast("სპიკერი დაემატა");
          } catch {
            onToast(WRITE_FAILED, { tone: "error" });
          }
        }}
        className="flex flex-col gap-4 border-t border-rule pt-5"
      >
        <h2 className="font-serif text-base text-bone-2">სპიკერის დამატება</h2>
        <Field label="სახელი და გვარი">
          <input type="text" value={dName} onChange={(e) => setDName(e.target.value)}
            placeholder="ნინო ხაჩიძე" maxLength={60} className={inputClass} />
        </Field>
        <Field label="გუნდი">
          <select value={dTeam} onChange={(e) => setDTeam(e.target.value)} className={inputClass}>
            {state.teams.map((t) => <option key={t.id} value={t.id} className="bg-hall-700">{t.name}</option>)}
          </select>
        </Field>
        <Submit icon={UserPlus}>სპიკერის დამატება</Submit>
      </form>

      <Recent title="გუნდები" items={state.teams.map((t) => ({
        id: t.id, main: t.name, meta: `${t.klass}, ${t.points} ქულა`,
        onRemove: () => remove(removeTeam(t.id), "გუნდი წაიშალა", onToast),
      }))} />

      <Recent title="სპიკერები" items={state.debaters.map((d) => ({
        id: d.id, main: d.name,
        meta: `${state.teamsById[d.teamId]?.name ?? "—"}, ${d.points} ქულა`,
        onRemove: () => remove(removeDebater(d.id), "სპიკერი წაიშალა", onToast),
      }))} />
    </div>
  );
}

function TopicForm({ state, onToast }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (title.trim().length < 8) { onToast("მოტივი აუცილებელია", { tone: "error" }); return; }
        try {
          await addTopic({ title: title.trim(), category, author: "ადმინისტრაცია" });
          setTitle("");
          onToast("თემა დაემატა");
        } catch {
          onToast(WRITE_FAILED, { tone: "error" });
        }
      }}
      className="flex flex-col gap-4"
    >
      <Field label="მოტივი">
        <textarea rows={2} value={title} onChange={(e) => setTitle(e.target.value)}
          maxLength={160} className={`${inputClass} resize-y py-2.5`} />
      </Field>
      <Field label="კატეგორია">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
          {CATEGORIES.map((c) => <option key={c} value={c} className="bg-hall-700">{c}</option>)}
        </select>
      </Field>
      <Submit icon={Plus}>თემის დამატება</Submit>

      <Recent title="თემები" items={state.topics.map((t) => ({
        id: t.id, main: t.title, meta: `${t.category}, ${t.votes} ხმა`,
        onRemove: () => remove(removeTopic(t.id), "თემა წაიშალა", onToast),
      }))} />
    </form>
  );
}

/* ---- Debate days, finals and school matches ---- */

function EventForm({ state, onToast }) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("დებატების საღამო");
  const [location, setLocation] = useState("სააქტო დარბაზი");
  const [note, setNote] = useState("");
  const [startsAt, setStartsAt] = useState(toLocalInputValue(new Date()));
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (title.trim().length < 2) { setError("დასახელება აუცილებელია."); return; }
    const at = fromLocalInputValue(startsAt);
    if (!at || Number.isNaN(at.getTime())) { setError("თარიღი არასწორია."); return; }

    try {
      await addEvent({
        title: title.trim(),
        kind,
        location: location.trim() || "სკოლა",
        note: note.trim() || null,
        startsAt: at.toISOString(),
      });
      setTitle("");
      setNote("");
      setError(null);
      onToast("ღონისძიება დაემატა");
    } catch {
      setError(WRITE_FAILED);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="დასახელება">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="დებატების საღამო — ნახევარფინალი" maxLength={80} className={inputClass} />
      </Field>

      <Field label="ტიპი">
        <select value={kind} onChange={(e) => setKind(e.target.value)} className={inputClass}>
          {["დებატების საღამო", "ფინალი", "სკოლათაშორისი მატჩი", "ვარჯიში", "შერჩევა"].map((k) => (
            <option key={k} value={k} className="bg-hall-700">{k}</option>
          ))}
        </select>
      </Field>

      <Field label="ადგილი">
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
          maxLength={60} className={inputClass} />
      </Field>

      <Field label="როდის">
        <input type="datetime-local" value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)} className={inputClass} />
      </Field>

      <Field label="შენიშვნა" optional>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="ფორმატი, ვინ მსაჯობს, ვის შეუძლია დასწრება…"
          maxLength={300} className={`${inputClass} resize-y py-2.5`} />
      </Field>

      {error && <p role="alert" className="text-sm text-for-soft">{error}</p>}
      <Submit icon={CalendarPlus}>ღონისძიების დამატება</Submit>

      <Recent title="ღონისძიებები" items={state.events.map((e) => ({
        id: e.id, main: e.title,
        meta: `${formatDate(e.startsAt, { short: true })}, ${e.location ?? "სკოლა"}`,
        onRemove: () => remove(removeEvent(e.id), "ღონისძიება წაიშალა", onToast),
      }))} />
    </form>
  );
}

/* ---- Shared ---- */

/** One sentence for every refused write: a rule, a role or the network. */
const WRITE_FAILED = "ვერ შევინახე. შეამოწმე კავშირი და უფლებები.";

/** Deletes report the same way wherever they are triggered from. */
function remove(promise, done, onToast) {
  Promise.resolve(promise)
    .then(() => onToast(done))
    .catch(() => onToast("ვერ წავშალე", { tone: "error" }));
}

function Submit({ icon: Icon, children }) {
  return (
    <button type="submit"
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-bone text-base font-semibold text-hall-900 transition-opacity hover:opacity-90">
      <Icon size={17} strokeWidth={2.2} />
      {children}
    </button>
  );
}

function Recent({ title, items }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-2">
      <h2 className="mb-2 font-serif text-base text-bone-2">{title}</h2>
      <ul className="card divide-y divide-rule">
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-2 py-1.5 pl-3 pr-1.5">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-bone">{it.main}</span>
              <span className="tnum block text-meta text-bone-3">{it.meta}</span>
            </span>
            <button type="button" onClick={it.onRemove} aria-label={`${it.main} — წაშლა`}
              className="grid size-11 shrink-0 place-items-center rounded-lg text-bone-3 transition-colors hover:text-for-soft">
              <Trash2 size={16} strokeWidth={1.75} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
