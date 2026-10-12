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
const COLLECTIONS = [
  "teams",
  "debaters",
  "debates",
  "topics",
  "events",
  "champions",
];

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

/**
 * Read one collection on demand.
 *
 * `load()` deliberately does not include `applications`: the rules let
 * only an admin read them, so pulling it for every visitor would mean a
 * permission error on the front page. The admin panel asks for it here
 * instead, when there is someone signed in to ask.
 */
export async function listCollection(name) {
  const ctx = await firestore();
  if (!ctx) return [];
  const snap = await ctx.fs.getDocs(ctx.fs.collection(ctx.db, name));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Approving an application has to add the debater *and* mark the request
 * decided, and a half-done approval is the one outcome worth engineering
 * against: a debater with a still-pending request invites a second
 * approval and a duplicate roster row. A batch makes both writes land or
 * neither.
 */
export async function approveApplication(applicationId, debater) {
  const ctx = await firestore();
  if (!ctx) return null;

  const batch = ctx.fs.writeBatch(ctx.db);
  const debaterRef = ctx.fs.doc(ctx.fs.collection(ctx.db, "debaters"));
  batch.set(debaterRef, debater);
  batch.update(ctx.fs.doc(ctx.db, "applications", applicationId), {
    status: "approved",
    decidedAt: new Date().toISOString(),
    debaterId: debaterRef.id,
  });
  await batch.commit();
  return debaterRef.id;
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

/**
 * Having an account is not enough: a document in `admins` keyed by the
 * account's uid is what grants writes, and the rules say so too. The check
 * is repeated here only so a teacher without that row is told why, instead
 * of meeting a panel where every button fails.
 */
export async function signInRemote(email, password) {
  if (!isRemote) throw new Error("ბაზა მიერთებული არ არის.");
  const { getAuth, signInWithEmailAndPassword } = await import("firebase/auth");
  const auth = getAuth((await firestore()).db.app);

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch {
    throw new Error("ელფოსტა ან პაროლი არ ემთხვევა.");
  }

  const ctx = await firestore();
  const row = await ctx.fs.getDoc(
    ctx.fs.doc(ctx.db, "admins", auth.currentUser.uid),
  );
  if (!row.exists()) {
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
    throw new Error("ამ ანგარიშს ცვლილებების შეტანა არ შეუძლია.");
  }
  return true;
}

export async function signOutRemote() {
  if (!isRemote) return;
  const { getAuth, signOut } = await import("firebase/auth");
  const { getApps } = await import("firebase/app");
  const instance = getApps()[0];
  if (instance) await signOut(getAuth(instance));
}

/** True while a real Firebase account is signed in on this device. */
export async function remoteUser() {
  if (!isRemote) return null;
  const { getAuth } = await import("firebase/auth");
  const { getApps } = await import("firebase/app");
  const instance = getApps()[0];
  return instance ? (getAuth(instance).currentUser ?? null) : null;
}
