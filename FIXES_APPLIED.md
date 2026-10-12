# Fixes applied

## 1. AI Proctoring — face not detected / always shows PASSED
**Root cause:** `frontend/public/models` (the face-api.js AI model weights)
was empty. `loadFaceModels()` was designed to fail silently (so an optional
check never crashes the quiz), which meant face/gaze detection never ran at
all — every session reported 0 events and PASSED regardless of what the
camera saw.

**Fix:** `frontend/src/utils/faceDetection.js` now loads the weights from a
public CDN by default (jsDelivr mirror of the face-api.js weights repo) —
nothing to download or configure. To self-host instead (recommended for
production so an exam doesn't depend on a third-party CDN), see
`frontend/public/models/README.md`.

## 2. AI Proctoring — playing a song near the mic wasn't detected
**Root cause:** the mic was opened with default browser audio constraints,
which include `echoCancellation: true`. That's built for voice calls — it
actively cancels sound coming from the device's *own speaker* out of the
mic signal, which is exactly what suppressed the test audio.

**Fix:** `frontend/src/components/proctoring/ProctoringGate.jsx` now
requests `echoCancellation/noiseSuppression/autoGainControl: false` so the
voice-activity detector sees the real signal.

## 3. Admin — no way to see a student's actual answers
Added `GET /admin/attempts/:id` (`backend/src/controllers/adminController.js`,
wired in `backend/src/routes/adminRoutes.js`) returning the full
question-by-question breakdown (question text, options, correct answer,
what the student selected, marks obtained) plus that attempt's proctoring
verdict. Wired into the Users → Quizzes tab in `frontend/src/pages/Admin.jsx`
— click any quiz-history row to open it.

## 4. No explanation when a student scores low or fails
`backend/src/controllers/quizController.js` now computes a `remarks` string
on submit (e.g. *"You scored 2 — 3 answers were incorrect and 2 were
skipped. Try another contest to improve your rank!"*), returned alongside
the score. Shown on the result screen in `frontend/src/pages/QuizPlay.jsx`
with a "Try Another Contest" button when the student didn't pass.

## 5. Prize-money target / withdrawal flow was silent
This flow already existed (auto-credit at the points target, withdrawal
requests, admin Complete/Fail actions) but never notified the user:
- `backend/src/controllers/walletController.js` — notifies the user the
  moment they cross the points target and a reward is credited.
- `backend/src/controllers/adminController.js` (`updateWithdrawalStatus`) —
  notifies the user when admin marks their withdrawal Completed ("Payment
  sent!") or Failed (refunded, explains why).

**Flag for you:** this project's `.env.example` explicitly documents that
real cash payouts were deliberately left out (points/badges/vouchers only)
to avoid the legal complexity of handling real money in a contest app in
India (RBI/payment-aggregator rules, gambling-adjacent regulation). I did
not build an actual bank/UPI payout integration — that needs a licensed
payment gateway and your own compliance review. What's here now is the
"admin manually confirms payment was sent outside the app" workflow the
codebase already had, with the missing notifications filled in.

## 6. Admin dashboard cards did nothing when clicked
`frontend/src/pages/Admin.jsx` — the 4 overview stat cards, the pending-
withdrawals banner, "Contest Status Breakdown", "Top Colleges", and the
4 "Quick Stats" tiles now navigate to the relevant tab with live data
instead of being static/dead.

## 7. Admin panel showed the public site nav on top of it
Every admin screenshot showed the QuizArena public navbar/points-badge and
bottom tab bar layered above the Admin panel's own sidebar — because
`App.jsx` renders `<Navbar/>` and `<BottomNav/>` unconditionally on every
route including `/admin`. Both now return `null` on `/admin/*` routes
(`frontend/src/components/Navbar.jsx`, `frontend/src/components/BottomNav.jsx`),
so the admin panel is now a clean, self-contained shell.

## 8. Admin → Quizzes tab silent failures
Couldn't reproduce "quiz page not opening" statically — schema, routes,
and queries all check out, and it mirrors the working Contests tab. Found
and fixed a real gap on the way: the tab's data load had no error handling,
so a failed request just left a blank panel with zero feedback. It now
surfaces the real error via toast — if it happens again, that message will
say why.

---

All backend edits pass `node --check`. All frontend edits pass an `esbuild`
JSX compile check. I do not have network access in this environment, so I
could not `npm install` and actually run the app end-to-end — please treat
this as reviewed-and-compiles, not run-and-verified, and let me know what
you see when you test it.

---

## 9. Admin → AI Proctoring enable/disable toggle broken on quizzes

**Root cause:** `PATCH /api/admin/quizzes/:id` used a COALESCE pattern with
`null` as a parameter for MySQL `TINYINT(1)` boolean columns:
```sql
UPDATE quizzes SET
  proctoring_enabled = COALESCE($1, proctoring_enabled),
  is_published       = COALESCE($2, is_published)
WHERE id = $3
```
When only `proctoringEnabled` was sent (no `isPublished`), the layer passed
`null` for `$2`. MySQL's binary prepared-statement protocol rejects `null` for
a `TINYINT` column inside `COALESCE`, throwing
`ER_INCORRECT_TYPE / Incorrect arguments to COM_STMT_EXECUTE`.

**Fix:** `backend/src/controllers/adminController.js` → `updateQuiz()` now
builds the `SET` clause dynamically — only columns explicitly present in the
request body are included. Same pattern applied to `updateTemplate()` for the
Contests tab, `updateCoupon()` for the Coupons tab, and
`newsController.js → updateArticle()` for the News tab.

No schema or frontend changes needed.

## 10. Government Job Notifications — expanded with active Karnataka-first listings

**Added 13 new active notifications** seeded via
`backend/src/db/seedGovtJobs.js` (idempotent script, safe to re-run):

**Karnataka (5 new):**
- KPSC FDA (First Division Assistant) 2026 — 1,455 posts
- DPAR Group C & D 2026 — 3,200 posts
- BBMP Bengaluru Recruitment 2026 — 720 posts
- RDPR (Rural Development) 2026 — 2,340 posts
- KGID Karnataka Insurance Dept. 2026 — 380 posts

**All India (5 new):**
- SSC CHSL 2026 — 3,712 posts
- NABARD Grade A & B Officers 2026 — 102 posts
- Indian Coast Guard Navik & Yantrik 2026 — 320 posts
- FCI Watchman / JE / MTS 2026 — 5,043 posts
- LIC AAO & AO 2026 — 500 posts

**Other States (3 new):** MPSC Maharashtra, RPSC Rajasthan, BPSC Bihar.

**Sort order** — Karnataka jobs always appear first in the public feed,
followed by All India, then other states. Featured jobs are pinned within
each group. This is enforced via the `CASE WHEN` expression in
`govtJobsController.js → listPublished()`.

**DB total:** 27 active published job notifications (all with last_date in
the future as of the time of seeding).

**Admin management:** All jobs can be added, edited, published/unpublished,
featured/unfeatured, and deleted from Admin → Govt Jobs tab
(`GovtJobsManager` component).

