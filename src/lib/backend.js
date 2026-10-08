/**
 * Where the league's data actually lives.
 *
 * With no credentials the site runs entirely on localStorage and the
 * seeded season, which is what makes it demoable the moment it is opened.
 * Paste a Firebase config and the same app reads and writes Firestore
 * instead, shared across every phone in the school.
 *
 * Nothing above this file knows which is in use: `store.js` calls `load`
 * and the write helpers, and both drivers answer with the same shape.
 *
 * The whole config arrives as one JSON string in VITE_FIREBASE_CONFIG, so
 * adding a backend is one environment variable rather than six.
 */

const raw = import.meta.env.VITE_FIREBASE_CONFIG;

function parseConfig() {
  if (!raw) return null;
  try {
    const c = typeof raw === "string" ? JSON.parse(raw) : raw;
    return c?.projectId && c?.apiKey ? c : null;
  } catch {
    console.error(
      "[დებატები] VITE_FIREBASE_CONFIG is not valid JSON — running on local data.",
    );
    return null;
  }
}

const config = parseConfig();
export const isRemote = Boolean(config);

let app = null;
let db = null;
let fs = null;

/**
 * Loaded on demand. A school phone on mobile data should not download the
 * Firebase SDK at all when the site is running on seed data.
 */
async function firestore() {
  if (!isRemote) return null;
  if (db) return { db, fs };

  const { initializeApp } = await import("firebase/app");
  fs = await import("firebase/firestore");
  app = initializeApp(config);
  db = fs.getFirestore(app);
  return { db, fs };
}

/** The collections the league is stored in, one document per record. */
const COLLECTIONS = ["teams", "debaters", "debates", "topics", "events"];

export async function load() {
  const ctx = await firestore();
  if (!ctx) return null;

  const out = {};
  await Promise.all(
    COLLECTIONS.map(async (name) => {
      const snap = await ctx.fs.getDocs(ctx.fs.collection(ctx.db, name));
      out[name] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }),
  );
  return out;
}

/** Live updates, so a result entered in the hall reaches every phone. */
export async function watch(onChange) {
  const ctx = await firestore();
  if (!ctx) return () => {};
  const stops = COLLECTIONS.map((name) =>
    ctx.fs.onSnapshot(ctx.fs.collection(ctx.db, name), () => onChange()),
  );
  return () => stops.forEach((stop) => stop());
}

/* ---------------------------------------------------------------- *
 * Writes. Firestore security rules are the real check; these only
 * carry the request. See README for the rules to paste.
 * ---------------------------------------------------------------- */

export async function putDoc(collection, id, data) {
  const ctx = await firestore();
  if (!ctx) return;
  const ref = id
    ? ctx.fs.doc(ctx.db, collection, id)
    : ctx.fs.doc(ctx.fs.collection(ctx.db, collection));
  await ctx.fs.setDoc(ref, data, { merge: true });
  return ref.id;
}

export async function deleteDoc(collection, id) {
  const ctx = await firestore();
  if (!ctx) return;
  await ctx.fs.deleteDoc(ctx.fs.doc(ctx.db, collection, id));
}

/** A vote is an increment, not a read-then-write, so two taps cannot race. */
export async function bumpField(collection, id, field, by = 1) {
  const ctx = await firestore();
  if (!ctx) return;
  await ctx.fs.updateDoc(ctx.fs.doc(ctx.db, collection, id), {
    [field]: ctx.fs.increment(by),
  });
}

/* ---------------------------------------------------------------- *
 * Admin sign-in, when a backend is attached.
 * ---------------------------------------------------------------- */

export async function signInRemote(email, password) {
  if (!isRemote) throw new Error("ბაზა მიერთებული არ არის.");
  const { getAuth, signInWithEmailAndPassword } = await import("firebase/auth");
  const { initializeApp, getApps } = await import("firebase/app");
  const instance = getApps()[0] ?? initializeApp(config);
  try {
    await signInWithEmailAndPassword(getAuth(instance), email, password);
    return true;
  } catch {
    throw new Error("ელფოსტა ან პაროლი არ ემთხვევა.");
  }
}

export async function signOutRemote() {
  if (!isRemote) return;
  const { getAuth, signOut } = await import("firebase/auth");
  const { getApps } = await import("firebase/app");
  const instance = getApps()[0];
  if (instance) await signOut(getAuth(instance));
}
