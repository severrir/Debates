/**
 * The league's data.
 *
 * Everything lives in localStorage behind one small reactive store, so the
 * site runs with no backend at all. `backend.js` can swap persistence for
 * Firestore without any component changing — the shape of the state and
 * the actions below are the whole contract.
 *
 * Standings and debater points are never stored: they are recomputed from
 * the debate log every time it changes, so a mistyped result can be fixed
 * and the table simply re-derives itself.
 */

import { POINTS } from "./scoring.js";
import { SEED } from "../data/seed.js";
import * as backend from "./backend.js";

export const isRemote = backend.isRemote;

const KEY = "debates.league.v1";

let state = null;
let snapshot = null;
const listeners = new Set();

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(SEED);
    return { ...structuredClone(SEED), ...JSON.parse(raw) };
  } catch {
    return structuredClone(SEED);
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Out of quota or blocked storage: the session still works.
  }
}

function emit() {
  snapshot = null;
  for (const fn of listeners) fn();
}

/* ---------------------------------------------------------------- *
 * Derivation
 * ---------------------------------------------------------------- */

export function derive(raw) {
  const teams = new Map(
    raw.teams.map((t) => [
      t.id,
      {
        ...t,
        // Derived, never stored: a speaker's teamId is the single truth,
        // so adding one cannot leave a stale roster behind.
        memberIds: raw.debaters
          .filter((d) => d.teamId === t.id)
          .map((d) => d.id),
        played: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
      },
    ]),
  );

  const debaters = new Map(
    raw.debaters.map((d) => [
      d.id,
      { ...d, appearances: 0, wins: 0, bestSpeaker: 0, points: 0 },
    ]),
  );

  const finished = raw.debates
    .filter((d) => d.status === "finished")
    .sort((a, b) => new Date(a.heldAt) - new Date(b.heldAt));

  for (const d of finished) {
    const sides = ["for", "against"];
    for (const side of sides) {
      const teamId = d[side].teamId;
      const team = teams.get(teamId);
      const won = d.winner === side;
      const drew = d.winner === "draw";

      if (team) {
        team.played += 1;
        if (drew) {
          team.draws += 1;
          team.points += POINTS.draw;
        } else if (won) {
          team.wins += 1;
          team.points += POINTS.win;
        } else {
          team.losses += 1;
        }
      }

      for (const id of d[side].speakerIds ?? []) {
        const p = debaters.get(id);
        if (!p) continue;
        p.appearances += 1;
        p.points += POINTS.appearance;
        if (won) {
          p.wins += 1;
          p.points += POINTS.win;
        } else if (drew) {
          p.points += POINTS.draw;
        }
      }
    }

    const best = debaters.get(d.bestSpeakerId);
    if (best) {
      best.bestSpeaker += 1;
      best.points += POINTS.bestSpeaker;
    }
  }

  const teamTable = [...teams.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.wins - a.wins ||
      a.name.localeCompare(b.name, "ka"),
  );
  teamTable.forEach((t, i) => {
    t.rank = i + 1;
  });

  const speakerTable = [...debaters.values()]
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.bestSpeaker - a.bestSpeaker ||
        a.name.localeCompare(b.name, "ka"),
    )
    .map((d, i) => ({ ...d, rank: i + 1 }));

  // Topic suggestions ranked by student votes, open ones first.
  const topics = [...raw.topics].sort(
    (a, b) => (b.votes ?? 0) - (a.votes ?? 0),
  );

  return {
    ...raw,
    teams: teamTable,
    teamsById: Object.fromEntries(teamTable.map((t) => [t.id, t])),
    debaters: speakerTable,
    debatersById: Object.fromEntries(speakerTable.map((d) => [d.id, d])),
    debates: [...raw.debates].sort(
      (a, b) => new Date(b.heldAt) - new Date(a.heldAt),
    ),
    debatesById: Object.fromEntries(raw.debates.map((d) => [d.id, d])),
    topics,
    champion: teamTable[0] ?? null,
  };
}

/* ---------------------------------------------------------------- *
 * Reading
 * ---------------------------------------------------------------- */

/**
 * When Firebase is configured the league is loaded from Firestore once at
 * startup and kept live by a snapshot listener. Until that lands — or if
 * the project is empty — the seeded season stays on screen, so the site is
 * never a void.
 */
let hydrated = false;

export function hydrate() {
  if (!backend.isRemote || hydrated) return;
  hydrated = true;

  const pull = async () => {
    try {
      const remote = await backend.load();
      if (remote && (remote.debates?.length ?? 0) > 0) {
        state = remote;
        persist();
        emit();
      }
    } catch (err) {
      console.error("[დებატები] ბაზა ვერ ჩაიტვირთა", err);
    }
  };

  pull();
  backend.watch(pull);
}

export function getState() {
  if (!state) state = read();
  if (!snapshot) snapshot = derive(state);
  return snapshot;
}

export function subscribe(fn) {
  listeners.add(fn);
  const onStorage = (e) => {
    if (e.key === KEY) {
      state = read();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

/* ---------------------------------------------------------------- *
 * Writing
 * ---------------------------------------------------------------- */

const id = () =>
  globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`;

function mutate(fn) {
  if (!state) state = read();
  fn(state);
  persist();
  emit();
}

export const addDebate = (debate) =>
  mutate((s) => {
    s.debates.push({
      id: id(),
      votes: { for: 0, against: 0 },
      status: "upcoming",
      winner: null,
      bestSpeakerId: null,
      ...debate,
    });
  });

export const updateDebate = (debateId, patch) =>
  mutate((s) => {
    const d = s.debates.find((x) => x.id === debateId);
    if (d) Object.assign(d, patch);
  });

export const removeDebate = (debateId) =>
  mutate((s) => {
    s.debates = s.debates.filter((d) => d.id !== debateId);
  });

export const addTeam = (team) =>
  mutate((s) => {
    s.teams.push({ id: id(), memberIds: [], ...team });
  });

export const removeTeam = (teamId) =>
  mutate((s) => {
    s.teams = s.teams.filter((t) => t.id !== teamId);
  });

export const addDebater = (debater) =>
  mutate((s) => {
    s.debaters.push({ id: id(), ...debater });
  });

export const removeDebater = (debaterId) =>
  mutate((s) => {
    s.debaters = s.debaters.filter((d) => d.id !== debaterId);
  });

export const addTopic = (topic) =>
  mutate((s) => {
    s.topics.push({
      id: id(),
      votes: 0,
      status: "suggested",
      suggestedAt: new Date().toISOString(),
      ...topic,
    });
  });

export const removeTopic = (topicId) =>
  mutate((s) => {
    s.topics = s.topics.filter((t) => t.id !== topicId);
  });

/* ---------------------------------------------------------------- *
 * One vote per device, for topics and for the audience vote.
 * There is no account to tie a vote to, so this is an honesty rail,
 * not ballot security — it stops accidental double-tapping, which is
 * what actually skews a class vote.
 * ---------------------------------------------------------------- */

const VOTED_KEY = "debates.voted.v1";

function votedSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(VOTED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

function rememberVote(key) {
  const set = votedSet();
  set.add(key);
  try {
    localStorage.setItem(VOTED_KEY, JSON.stringify([...set]));
  } catch {
    // The vote still counts this session.
  }
}

export const hasVoted = (key) => votedSet().has(key);

export function voteTopic(topicId) {
  if (hasVoted(`topic:${topicId}`)) return false;
  mutate((s) => {
    const t = s.topics.find((x) => x.id === topicId);
    if (t) t.votes = (t.votes ?? 0) + 1;
  });
  rememberVote(`topic:${topicId}`);
  return true;
}

export function voteAudience(debateId, side) {
  if (hasVoted(`debate:${debateId}`)) return false;
  mutate((s) => {
    const d = s.debates.find((x) => x.id === debateId);
    if (!d) return;
    d.votes = d.votes ?? { for: 0, against: 0 };
    d.votes[side] = (d.votes[side] ?? 0) + 1;
  });
  rememberVote(`debate:${debateId}`);
  return true;
}

export const resetAll = () =>
  mutate((s) => {
    const fresh = structuredClone(SEED);
    Object.keys(s).forEach((k) => delete s[k]);
    Object.assign(s, fresh);
  });
