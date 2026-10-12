import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, RefreshCw, X } from "lucide-react";
import { Empty } from "./bits.jsx";
import { decideJoinRequest, fullName, listJoinRequests } from "../lib/join.js";
import { relativeAgo } from "../lib/georgian.js";

/**
 * The join queue.
 *
 * A queue, not a feed: pending requests sit at the top, oldest first,
 * because the student who applied on Monday should not be behind the one
 * who applied this morning. Decided ones stay below as a record, which
 * matters when a student asks why they were not let in.
 *
 * Neither crimson nor teal appears on the buttons. In this app those two
 * colours mean "for" and "against" a motion and nothing else, and an
 * approval is not an argument — so the approve button is the same bone the
 * rest of the app uses for a primary action.
 */
export default function JoinRequests({ onToast }) {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setRequests(await listJoinRequests());
      setStatus("ready");
      setError(null);
    } catch (err) {
      setStatus("error");
      setError(
        err?.code === "permission-denied"
          ? "განაცხადების ნახვის უფლება ამ ანგარიშს არ აქვს."
          : "განაცხადები ვერ ჩაიტვირთა.",
      );
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(request, approve) {
    setBusyId(request.id);
    setError(null);
    try {
      await decideJoinRequest(request, approve);
      onToast(
        approve ? `${fullName(request)} კლუბშია` : `${fullName(request)} — უარი`,
      );
      await load();
    } catch (err) {
      setError(err.message ?? "ვერ შევასრულე. სცადე ხელახლა.");
    } finally {
      setBusyId(null);
    }
  }

  const pending = requests.filter((r) => r.status === "pending");
  const decided = requests.filter((r) => r.status !== "pending");

  if (status === "loading") {
    return (
      <p className="flex items-center gap-2 py-6 text-sm text-bone-3">
        <Loader2 size={15} className="animate-spin" />
        იტვირთება
      </p>
    );
  }

  if (status === "error") {
    return (
      <div className="py-4">
        <p role="alert" className="text-sm text-for-soft">
          {error}
        </p>
        <button
          type="button"
          onClick={load}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-hall-600 px-3.5 text-sm text-bone-2 transition-colors hover:bg-hall-700"
        >
          <RefreshCw size={15} strokeWidth={1.75} />
          ხელახლა
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-bone-2">
          {pending.length === 0
            ? "ახალი განაცხადი არ არის."
            : `${pending.length} ახალი განაცხადი.`}
        </p>
        <button
          type="button"
          onClick={load}
          aria-label="განახლება"
          className="grid size-11 place-items-center rounded-lg text-bone-3 transition-colors hover:bg-hall-700 hover:text-bone"
        >
          <RefreshCw size={15} strokeWidth={1.75} />
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-for-soft">
          {error}
        </p>
      )}

      {pending.length === 0 && decided.length === 0 ? (
        <Empty
          title="განაცხადები არ არის"
          body="როცა მოსწავლე შეავსებს ფორმას, აქ გამოჩნდება."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {pending.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-hall-600 bg-hall-800 p-3"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="min-w-0 font-serif text-base font-semibold text-bone">
                  {fullName(r)}
                </p>
                <span className="shrink-0 text-meta text-bone-3">
                  {relativeAgo(r.createdAt)}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-bone-2">{r.klass}</p>
              {r.note && <p className="mt-1.5 text-sm text-bone-3">{r.note}</p>}

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => decide(r, true)}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-bone text-sm font-semibold text-hall-900 transition-opacity disabled:opacity-60"
                >
                  {busyId === r.id ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Check size={15} strokeWidth={2.5} />
                  )}
                  დამტკიცება
                </button>
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => decide(r, false)}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-hall-600 px-3.5 text-sm text-bone-2 transition-colors hover:bg-hall-700 hover:text-for-soft disabled:opacity-60"
                >
                  <X size={15} strokeWidth={2.5} />
                  უარი
                </button>
              </div>
            </li>
          ))}

          {decided.length > 0 && (
            <li className="pt-2">
              <h3 className="mb-2 font-serif text-base text-bone-2">
                განხილული
              </h3>
              <ul className="flex flex-col gap-1">
                {decided.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-baseline justify-between gap-2 rounded-lg border border-rule px-3 py-2"
                  >
                    <span className="min-w-0 truncate text-sm text-bone-2">
                      {fullName(r)}
                      <span className="text-bone-3"> · {r.klass}</span>
                    </span>
                    <span
                      className={`shrink-0 text-meta ${
                        r.status === "approved" ? "text-against-soft" : "text-bone-3"
                      }`}
                    >
                      {r.status === "approved" ? "დამტკიცდა" : "უარი"}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          )}
        </ul>
      )}

      <p className="measure border-t border-rule pt-3 text-meta text-bone-3">
        დამტკიცებული მოსწავლე სპიკერების სიაში გუნდის გარეშე ჩაემატება —
        გუნდს გუნდის ტაბიდან მიუთითებ.
      </p>
    </div>
  );
}
