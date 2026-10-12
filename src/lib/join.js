/**
 * Joining the club.
 *
 * A student fills in სახელი, გვარი and კლასი; the request lands in a queue
 * only an admin sees, and approving it is what creates the debater.
 *
 * The privacy rule is the point of the design: an application is a minor's
 * full name next to their class, so `applications` is readable by admins
 * only. Anyone may file one — a student who had to register before they
 * could ask to join would not ask — but the collection is never listed to
 * a visitor, and the web API key in the bundle does not change that. See
 * firestore.rules.
 *
 * An approved debater is created with no team. Which team they debate for
 * is the club's decision, made in the გუნდი tab, not something an
 * applicant chooses for themselves.
 */

import {
  approveApplication,
  isRemote,
  listCollection,
  putDoc,
} from "./backend.js";

const MESSAGES = {
  bad_first: "სახელი 2-დან 40 სიმბოლომდე უნდა იყოს.",
  bad_last: "გვარი 2-დან 40 სიმბოლომდე უნდა იყოს.",
  bad_klass: "კლასი ჩაწერე — მაგალითად IX-ბ.",
  already_pending: "განაცხადი უკვე გაგზავნილია — დაელოდე პასუხს.",
  already_decided: "ამ განაცხადზე პასუხი უკვე გაცემულია.",
};

/* ---------------------------------------------------------------- *
 * Local mode — no backend attached
 *
 * In memory for the page, so the whole flow including approval can be
 * reviewed before Firebase exists.
 * ---------------------------------------------------------------- */

let localRequests = [];
const id = () =>
  globalThis.crypto?.randomUUID?.() ?? `req-${Date.now()}-${Math.random()}`;

const fail = (token) => {
  throw new Error(MESSAGES[token]);
};

/** Shared by both drivers, so the two cannot disagree on what is valid. */
function clean({ first, last, klass, note }) {
  const f = first.trim();
  const l = last.trim();
  const k = klass.trim();
  if (f.length < 2 || f.length > 40) fail("bad_first");
  if (l.length < 2 || l.length > 40) fail("bad_last");
  if (k.length < 1 || k.length > 10) fail("bad_klass");
  return { f, l, k, n: note?.trim() || null };
}

/* ---------------------------------------------------------------- *
 * The interface the components call
 * ---------------------------------------------------------------- */

/** Apply. Open to anyone — students never sign in. */
export async function submitJoinRequest(input) {
  const { f, l, k, n } = clean(input);

  if (!isRemote) {
    if (
      localRequests.some(
        (r) =>
          r.status === "pending" &&
          r.firstName.toLowerCase() === f.toLowerCase() &&
          r.lastName.toLowerCase() === l.toLowerCase(),
      )
    ) {
      fail("already_pending");
    }
    localRequests = [
      ...localRequests,
      {
        id: id(),
        firstName: f,
        lastName: l,
        klass: k,
        note: n,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ];
    return;
  }

  // No duplicate check against the server here, and that is deliberate:
  // the applicant may not read the collection, so there is nothing to
  // check against. A second application is a duplicate row in the admin's
  // queue, which is a far smaller problem than a readable roster.
  await putDoc("applications", null, {
    firstName: f,
    lastName: l,
    klass: k,
    note: n,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
}

/** The queue. Admins only — the rules are what enforce that. */
export async function listJoinRequests() {
  const rows = isRemote
    ? await listCollection("applications")
    : [...localRequests];

  // Pending first, oldest first within that: a queue, not a feed.
  return rows.sort(
    (a, b) =>
      (b.status === "pending") - (a.status === "pending") ||
      (a.status === "pending"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.decidedAt ?? 0) - new Date(a.decidedAt ?? 0)),
  );
}

/**
 * Approve or reject.
 *
 * Approving adds the debater in the same atomic batch that marks the
 * request decided, so there is never a debater whose request still looks
 * pending — which would invite a second approval and a duplicate.
 */
export async function decideJoinRequest(request, approve) {
  if (request.status !== "pending") fail("already_decided");

  if (!isRemote) {
    const req = localRequests.find((r) => r.id === request.id);
    if (!req) fail("already_decided");
    req.status = approve ? "approved" : "rejected";
    req.decidedAt = new Date().toISOString();
    return;
  }

  if (approve) {
    await approveApplication(request.id, {
      name: `${request.firstName} ${request.lastName}`,
      klass: request.klass,
      teamId: null,
    });
    return;
  }

  await putDoc("applications", request.id, {
    status: "rejected",
    decidedAt: new Date().toISOString(),
  });
}

export const pendingCount = (requests) =>
  requests.filter((r) => r.status === "pending").length;

export const fullName = (r) => `${r.firstName} ${r.lastName}`;
