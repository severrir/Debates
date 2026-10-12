# დებატების კლუბი — რუსთავის №4 საჯარო სკოლა

სასკოლო დებატების ლიგა: მოტივები, გუნდები, სპიკერების რეიტინგი და
აუდიტორიის ხმა. მთლიანად ქართულად, ტელეფონისთვის აგებული.

**ცოცხალი:** https://severrir.github.io/Debates/

---

## Start it

```bash
npm install
npm run dev
```

It runs immediately on a seeded season — five teams, fifteen debaters and
eight argued motions. Press the lock icon and sign in to see the admin
tools.

## The design

Every debate has two sides, so the palette has two: **crimson argues for,
teal argues against**, and the page itself is split by the line between
them. That is information, not decoration — the same two colours carry
through the matchup, the result and the audience vote.

Gold appears only on an award.

## How points work

Win 3, draw 1, best speaker 2, appearance 1. A losing speaker who argued
best still takes something away — otherwise nobody volunteers for the hard
side of a motion and the league drifts to safe topics.

Standings are **never stored**. Teams and debaters are recomputed from the
debate log every time it changes, so a mistyped result can be corrected and
the table re-derives itself.

## The screens

| | |
|---|---|
| `#/` | next motion, champion team, top speakers, last result |
| `#/debates` | every motion argued and scheduled, filtered by topic and format |
| `#/topics` | categories, student suggestions, the vote on what comes next |
| `#/teams` | the league table; `#/team/<id>` for a roster and its history |
| `#/speakers` | the debater ranking; `#/speaker/<id>` for one speaker |
| `#/events` | the calendar, past champions and both formats, speech by speech |
| `#/admin` | results, debates, teams, speakers, topics, events |

Each one is a hash route, so any screen can be sent to a classmate and the
back button behaves — and GitHub Pages needs no rewrite rules.

## The notebook you can download

The **რვეული** button in the header writes the whole league to a single
self-contained HTML file — `debates-rveuli-2026-10-09.html` — and hands it
to the browser. No network, no build, no app: it opens on any phone, works
with the Wi-Fi off, and prints onto A4.

That last part is the point. The person who most needs the formats and the
points rule is the student judging at the front of the hall, and they are
holding paper. Inside: the champion, the league table, the speaker
ranking, every motion with its result and audience split, the topics, the
roll of honour, the calendar, and both formats written out speech by
speech — with a contents page, because it is a notebook.

## Joining the club

At the foot of every screen there is **კლუბში გაწევრიანება**. A student
fills in სახელი, გვარი and კლასი — no account, no password — and the
request lands in a queue only an admin sees, under
**ადმინისტრირება → განაცხადები**.

Approving adds the debater **with no team**: which team someone debates
for is the club's decision, made in the გუნდი tab, not something an
applicant picks for themselves. They start on zero points, as every
debater does.

The approval is a single batched write — the debater is created and the
request marked decided together, or neither happens. A half-done approval
is the one outcome worth engineering against: a debater whose request
still looked pending would invite a second approval and a duplicate roster
row.

Neither crimson nor teal appears on the approve and reject buttons. In this
app those two colours mean "for" and "against" a motion and nothing else,
and an approval is not an argument.

### Why applications are unreadable

An application is a minor's full name next to their class, so
`applications` is readable by admins only — the whole collection would
otherwise be a roster of children readable by anyone holding the web API
key, which ships in the bundle by design.

The rule in [`firestore.rules`](firestore.rules) allows anyone to
`create` one, because a student who had to register before they could ask
to join would not ask, and it pins `status` to `'pending'` on create so an
applicant cannot file themselves as already approved. `get`, `list`,
`update` and `delete` all require an `admins` document.

`applications` is deliberately **not** in the `COLLECTIONS` list that
`load()` pulls, because that runs for every visitor and would meet a
permission error on the front page. The admin panel asks for it separately,
when there is someone signed in to ask.

> **The rules must be redeployed for this to work.** Until then
> `applications` falls through to the catch-all `allow read, write: if
> false`, and a student's application is denied. See step 4 below.

## Attach Firebase

Without credentials everything above runs on the seeded season in
localStorage, which is what makes the site demoable the moment it opens.
With them, the same app reads and writes Firestore, shared across every
phone in the school.

1. Firebase console → Project settings → Your apps → SDK setup → **Config**.
2. Paste the whole config object as **one line of JSON** into `.env`:

   ```
   VITE_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}
   ```

3. Add the same string as the GitHub Actions secret `VITE_FIREBASE_CONFIG`
   (Settings → Secrets and variables → Actions), or the deployed site will
   fall back to seed data.
4. Publish the rules in [`firestore.rules`](firestore.rules) — either paste
   them into Firestore → Rules, or:

   ```bash
   npx firebase deploy --only firestore:rules
   ```

5. Authentication → Sign-in method → enable **Email/Password**, then add
   the club's account under Users.
6. Firestore → create collection `admins` → a document whose **ID is that
   account's uid**, with any field you like (`label: "კლუბის ხელმძღვანელი"`).

Step 6 is the one that grants writes. An account without that row can sign
in and will be told it may not make changes, rather than meeting a panel
where every button fails.

Collections used: `teams`, `debaters`, `debates`, `topics`, `events`,
`champions`, `admins`. The seeded season stays on screen until Firestore
holds something real, so the site is never an empty page.

### What a student may write

The rules open exactly two doors, because the site offers exactly two:
suggesting a motion (`topics` create, with no votes of its own) and casting
one vote (`topics.votes`, `debates.votes`, +1 and nothing else). A vote is
an atomic increment, so two taps in the same second cannot overwrite each
other, and one vote per device is remembered locally.

## Deploy

Push to `main`. The included workflow builds with
`base=/Debates/` and publishes to GitHub Pages; set **Settings → Pages →
Source: GitHub Actions** once.

```bash
git add -A
git commit -m "..."
git push
```

---

Made By საბა ყურაშვილი
