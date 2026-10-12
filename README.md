# DreamNexa

A free-to-play, points-based student quiz contest platform. Same live
"seats fill → contest locks → next one auto-opens" workflow you'd see on
fantasy-sports-style apps — but with **no wallet, no entry fee paid in
real money, and no cash prizes**, anywhere in the code.

## Rewards Policy (read this before extending the app)

India's **Promotion and Regulation of Online Gaming Act, 2025** bans
all "online money games" — any game, skill-based or not, that is
played after paying a fee or with an expectation of winning money or
stakes. This project is deliberately built to sit outside that
definition:

- There is **no payment gateway integration** anywhere in this repo.
- There is **no wallet** and **no deposit endpoint** — points cannot be
  purchased with real money.
- There is **no withdrawal endpoint** — points cannot be cashed out.
- Contest "entry cost" (`entry_points_cost` on a template) is always
  optional and, when set, can only be paid using points earned for
  free (signup bonus, daily login, referrals, past contest rewards) —
  never points bought with money.
- Prizes are non-monetary: in-app points, badges, and leaderboard
  rank. If you want to fulfill a real prize (a sponsor voucher,
  merchandise, etc.) for a top finisher, that has to happen manually,
  outside this application, funded by a sponsor — not pooled from
  other users' payments.

**Do not** add a payment gateway, wallet, or withdrawal flow to this
codebase without independent legal advice — doing so would likely
recreate the exact "online money game" mechanic the 2025 Act
prohibits, regardless of what the currency is called in the UI.

## Stack

- Backend: Node.js, Express, **SQLite** (via `better-sqlite3`, with a
  built-in `node:sqlite` fallback — no external database server to
  install or configure), JWT auth, node-cron, Socket.IO
- Frontend: React 18, Vite, React Router (no UI kit — custom design
  system in `frontend/src/styles`)
- AI Quiz Proctor: browser-side monitoring (tab-switch, copy/paste,
  fullscreen-exit, voice-activity, optional face-api.js face/gaze
  detection) reporting to a server-side risk-scoring engine — see
  "AI Quiz Proctor" section below.

## Project layout

```
dreamnexa/
├── backend/
│   ├── src/
│   │   ├── db/              schema.sql, proctoringSchema.sql, walletSchema.sql,
│   │   │                    newsSchema.sql, newsContentSchema.sql, couponSchema.sql,
│   │   │                    migrate.js, seed.js, pool.js (SQLite), sqliteDriver.js
│   │   ├── controllers/     auth, users, contests, quiz, admin, news, wallet,
│   │   │                    proctoring
│   │   ├── routes/
│   │   ├── middleware/      auth, error handling
│   │   ├── socket/          Socket.IO — live proctoring feed for admins
│   │   ├── utils/           tokens, pointsService, contestEngine,
│   │   │                    resultsEngine, scheduler, proctoringEngine
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/                  client.js (axios + token refresh), socket.js,
    │   │                         proctoringApi.js, newsApi.js, walletApi.js
    │   ├── context/AuthContext.jsx
    │   ├── components/           Navbar, SeatGrid, ContestCard, proctoring/
    │   │                         (ProctoringGate, ProctoringWarningBanner), ...
    │   ├── hooks/useProctoring.js
    │   ├── utils/faceDetection.js
    │   ├── pages/                Landing, Login, Register, Contests,
    │   │                         ContestDetail, QuizPlay, Leaderboard,
    │   │                         Dashboard, Admin (incl. AI Proctoring tab)
    │   └── styles/                tokens.css, global.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Local setup

### 1. Database

Nothing to install or provision — DreamNexa runs entirely on a local
SQLite file, created automatically the first time you run the
migration. There is no separate database server, connection string,
username, or password to configure.

Copy `backend/.env.example` to `backend/.env` and fill in a strong
`JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (the SQLite path already
has a sane default — `./data/dreamnexa.db` — and only needs changing
if you want the file somewhere else, e.g. a persistent disk mount on
your host).

### 2. Backend

```bash
cd backend
npm install         # installs better-sqlite3 (native binding) + everything else
npm run migrate      # creates data/dreamnexa.db and all tables
npm run seed          # creates an admin user + one sample quiz + template
npm run dev             # starts on http://localhost:5000
```

If `better-sqlite3`'s native binary can't be installed on your machine
for some reason, the app automatically falls back to Node's built-in
`node:sqlite` module (needs Node.js 22.5+) — you'll see a one-line
warning in the console, and everything still works.

Seeded admin login: `admin` / `Admin@12345` — **change this password
immediately in a real deployment.**

### 3. Frontend

```bash
cd frontend
npm install
npm run dev   # starts on http://localhost:5173, proxies /api to :5000
```

Visit `http://localhost:5173`. Register a student account, or log in
as the seeded admin to create contest templates and quizzes from
`/admin`.

## AI Quiz Proctor

Every quiz has a `proctoring_enabled` flag (on by default; toggle it
per-quiz from the admin Quizzes tab, or platform-wide with
`PROCTORING_ENABLED=false` in `backend/.env`). When enabled:

1. **Before the quiz starts** — the student sees a consent screen
   (what is/isn't monitored — no video or audio is ever recorded or
   uploaded, only derived signals) followed by a live camera/microphone
   system check.
2. **During the quiz** — the client watches for and reports: tab
   switches, exiting fullscreen, copy/paste/cut/select-all, right-click,
   devtools shortcuts, window blur, and (via the Web Audio API,
   entirely in-browser) sustained voice activity. Optionally, if you
   drop face-api.js's model weight files into `frontend/public/models`
   (see `frontend/src/utils/faceDetection.js` for the two files needed
   and where to get them), it also detects zero/multiple faces and
   sustained gaze deviation.
3. **Server-side scoring** — `backend/src/utils/proctoringEngine.js`
   combines every reported signal into a single 0–100 risk score, with
   diminishing returns on repeated identical signals (so 50 small blur
   events don't outweigh a handful of independent violations) and a
   confidence/severity weighting per event type.
4. **At submission** — the session gets a final verdict: `PASSED`,
   `REVIEW_REQUIRED`, or `REJECTED`. Nothing is *ever* auto-rejected
   from a single weak signal — rejection requires multiple
   high/critical-severity events across at least two different
   violation categories; anything short of that lands in
   `REVIEW_REQUIRED` for a human to decide.
5. **Admin review** — the `/admin` "AI Proctoring" tab lists flagged
   sessions (live-updated via Socket.IO as new events land), shows the
   full event timeline for any session, and lets an admin **Confirm**
   (zeroes that student's score for that contest only — never touches
   other contests or their points balance) or **Dismiss** the flag.

The proctoring layer sits entirely on top of the existing
contest/quiz flow — it doesn't replace or gate contest entry, scoring,
or the leaderboard in any way when disabled.



## How the contest engine works

1. An admin creates a **contest template** (quiz + seat count + reward
   tiers + optional points entry cost). Creating a template
   immediately spawns contest **#1** with `0/N` seats, status
   `upcoming`.
2. Students join for free (or by spending previously-earned points, if
   the template set a cost). Each join increments the seat count.
3. The moment the seat count hits capacity, the contest **locks**,
   flips to `live`, and — if the template still has auto-regenerate
   on — contest **#2** is spawned immediately so the next group of
   students always has somewhere to join.
4. Participants play the quiz within the time window. A cron job
   (`utils/scheduler.js`) auto-submits anyone who runs out of time.
5. Once every participant has submitted (or the window closes), the
   **results engine** ranks everyone by score (ties broken by time
   taken), credits points and awards badges per the template's
   `reward_structure`, and marks the contest `completed`.

Admins can pause a template (`isActive: false`) or turn off
auto-regeneration at any time from `/admin`.

## Deployment note: SQLite needs a persistent filesystem

`backend/vercel.json` is still in this repo from the original setup,
but **serverless platforms like Vercel give each function invocation
an ephemeral, often-isolated filesystem** — a local SQLite file will
not reliably persist or stay consistent across requests there. For
DreamNexa's SQLite-only setup, deploy the backend to something with a
persistent disk instead: a container host like Google Cloud Run with Cloud SQL,
a small VM, or a managed MySQL database.

## What's intentionally not included

- Payment gateway (Razorpay etc.) — see Rewards Policy above.
- Deposit or withdrawal endpoints tied to real money (the existing
  `wallet`/points system is entirely non-monetary — see Rewards Policy).
- OTP/SMS verification (stubbed as an `email_verified` flag; wire up a
  provider like MSG91 or Twilio if you need it).
- Push notifications (in-app notifications table exists; wire up FCM
  if you want native push).
- File/image upload for avatars and banners (currently just a URL
  field — add Cloudinary or S3 if needed).
- Video/audio recording or storage for proctoring — by design, only
  small derived signals (e.g. "face not visible", "tab switched") are
  ever sent to the server, never raw camera/microphone data.
