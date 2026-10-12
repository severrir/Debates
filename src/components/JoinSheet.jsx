import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import Sheet, { Field, inputClass } from "./Sheet.jsx";
import { submitJoinRequest } from "../lib/join.js";

/**
 * Applying to the club.
 *
 * Three fields and no account. A student who has to register before they
 * can ask to join will not ask, so the form takes the three things the
 * club actually needs to find them in a school of several hundred —
 * სახელი, გვარი, კლასი — and nothing else.
 *
 * It never shows the queue back. What happens next is a sentence, not a
 * status page: applications are private to the club's admins, and telling
 * an applicant "you are third in line" would mean publishing the other
 * two.
 */
export default function JoinSheet({ open, onClose }) {
  const [form, setForm] = useState({
    first: "",
    last: "",
    klass: "",
    note: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSent(false);
    setForm({ first: "", last: "", klass: "", note: "" });
  }, [open]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await submitJoinRequest(form);
      setSent(true);
    } catch (err) {
      setError(err.message ?? "ვერ გაიგზავნა. სცადე ხელახლა.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="კლუბში გაწევრიანება"
      description={sent ? undefined : "შეავსე და გაგზავნე — კლუბი განიხილავს."}
    >
      {sent ? (
        <div className="flex flex-col items-start gap-3 pb-2">
          <CheckCircle2
            size={30}
            strokeWidth={1.5}
            aria-hidden="true"
            className="text-gavel"
          />
          <h3 className="font-serif text-xl font-semibold text-bone">
            განაცხადი გაიგზავნა
          </h3>
          <p className="text-sm text-bone-2">
            კლუბი ნახავს და გადაწყვეტს. როცა დაგამტკიცებენ, სპიკერების სიაში
            გამოჩნდები — გუნდს კი კლუბი შეარჩევს.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-1 min-h-12 w-full rounded-lg bg-bone text-base font-semibold text-hall-900"
          >
            კარგი
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="სახელი">
            <input
              type="text"
              required
              maxLength={40}
              autoComplete="given-name"
              value={form.first}
              onChange={(e) => set({ first: e.target.value })}
              placeholder="ანა"
              className={inputClass}
            />
          </Field>

          <Field label="გვარი">
            <input
              type="text"
              required
              maxLength={40}
              autoComplete="family-name"
              value={form.last}
              onChange={(e) => set({ last: e.target.value })}
              placeholder="ჩიქოვანი"
              className={inputClass}
            />
          </Field>

          <Field label="კლასი" hint="მაგალითად IX-ბ ან X-ა.">
            <input
              type="text"
              required
              maxLength={10}
              value={form.klass}
              onChange={(e) => set({ klass: e.target.value })}
              placeholder="IX-ბ"
              className={inputClass}
            />
          </Field>

          <Field
            label="რატომ გინდა დებატები"
            optional
            hint="თუ გინდა, მიწერე — სავალდებულო არ არის."
          >
            <textarea
              rows={3}
              maxLength={300}
              value={form.note}
              onChange={(e) => set({ note: e.target.value })}
              placeholder="სკოლის ოლიმპიადაში მიმიღია მონაწილეობა, საჯარო გამოსვლა მომწონს."
              className={`${inputClass} resize-y py-2.5 leading-relaxed`}
            />
          </Field>

          {error && (
            <p role="alert" className="text-sm text-for-soft">
              {error}
            </p>
          )}

          <p className="text-meta text-bone-3">
            შენს სახელსა და კლასს მხოლოდ კლუბის ხელმძღვანელობა ხედავს.
          </p>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-12 flex-1 rounded-lg border border-hall-600 text-base text-bone-2 transition-colors hover:bg-hall-700 hover:text-bone"
            >
              გაუქმება
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-bone text-base font-semibold text-hall-900 transition-opacity disabled:opacity-60"
            >
              {busy && <Loader2 size={17} className="animate-spin" />}
              გაგზავნა
            </button>
          </div>
        </form>
      )}
    </Sheet>
  );
}
