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

## Attach Firebase

1. Firebase console → Project settings → Your apps → SDK setup → **Config**.
2. Paste the whole config object as **one line of JSON** into `.env`:

   ```
   VITE_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}
   ```

3. Add the same string as the GitHub Actions secret `VITE_FIREBASE_CONFIG`.
4. Firestore → Rules, paste:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{db}/documents {
       // Anyone reads the league.
       match /{col}/{doc} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

5. Authentication → Sign-in method → enable **Email/Password**, then add
   yourself under Users.

Collections used: `teams`, `debaters`, `debates`, `topics`, `events`.
The seeded season stays on screen until Firestore has a real debate, so the
site is never an empty page.

## Deploy

Push to `main`. The included workflow builds and publishes to GitHub Pages;
set **Settings → Pages → Source: GitHub Actions** once.

---

Made By საბა ყურაშვილი
