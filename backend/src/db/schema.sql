-- =====================================================================
-- DreamNexa Database Schema — MySQL 8.0+
-- Free-to-play, points-based student quiz contest platform.
-- There is NO wallet in the cash sense, NO payment gateway anywhere here
-- for entry fees — this is a deliberate design boundary, not an oversight.
-- (Wallet/points/reward tables live in walletSchema.sql — non-cash by
-- default, see README "Rewards Policy".)
--
-- NOTE ON TYPES: id/foreign-key columns are CHAR(36) UUIDs, always
-- generated in the app layer (see db/pool.js, which mints one with
-- crypto.randomUUID() for every INSERT that doesn't supply its own id).
-- Boolean flags are TINYINT(1). JSON-shaped columns (options,
-- reward_structure, ...) are plain TEXT, JSON-encoded/decoded by the app
-- layer for portability across MySQL versions.
-- =====================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- USERS & PROFILES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                CHAR(36)      PRIMARY KEY,
  username          VARCHAR(64)   UNIQUE NOT NULL,
  email             VARCHAR(191)  UNIQUE NOT NULL,
  mobile            VARCHAR(20)   UNIQUE,
  password_hash     VARCHAR(255)  NOT NULL,
  role              VARCHAR(16)   NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  status            VARCHAR(16)   NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  email_verified    TINYINT(1)    NOT NULL DEFAULT 0,
  created_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS profiles (
  user_id           CHAR(36)      PRIMARY KEY,
  full_name         VARCHAR(150)  NOT NULL,
  college           VARCHAR(200),
  university        VARCHAR(200),
  state             VARCHAR(100),
  city              VARCHAR(100),
  avatar_url        TEXT,
  referral_code     VARCHAR(32)   UNIQUE NOT NULL,
  referred_by       CHAR(36),
  total_points      INT           NOT NULL DEFAULT 0,
  total_contests    INT           NOT NULL DEFAULT 0,
  total_quizzes_played INT        NOT NULL DEFAULT 0,
  contests_won      INT           NOT NULL DEFAULT 0,
  updated_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id                CHAR(36)      PRIMARY KEY,
  user_id           CHAR(36)      NOT NULL,
  token_hash        VARCHAR(255)  NOT NULL,
  expires_at        DATETIME(3)   NOT NULL,
  created_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  revoked           TINYINT(1)    NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- POINTS LEDGER  (replaces a money wallet — units have no cash value,
-- cannot be purchased, and cannot be withdrawn or cashed out)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS points_transactions (
  id                CHAR(36)      PRIMARY KEY,
  user_id           CHAR(36)      NOT NULL,
  amount            INT           NOT NULL,              -- can be negative for entry cost
  type              VARCHAR(32)   NOT NULL CHECK (type IN
                      ('signup_bonus','daily_login','referral_bonus',
                       'contest_entry','contest_refund','quiz_reward',
                       'rank_bonus','admin_adjustment','badge_bonus')),
  reference_id      CHAR(36),                      -- e.g. contest_participant id
  description       VARCHAR(255),
  created_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_points_tx_user ON points_transactions(user_id);

-- ---------------------------------------------------------------------
-- QUIZ MODULE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quizzes (
  id                CHAR(36)      PRIMARY KEY,
  title             VARCHAR(200)  NOT NULL,
  description       TEXT,
  instructions      TEXT,
  duration_minutes  INT           NOT NULL DEFAULT 15,
  negative_marking  DOUBLE        NOT NULL DEFAULT 0,   -- e.g. 0.25 per wrong answer
  passing_marks     INT           DEFAULT 0,
  is_published      TINYINT(1)    NOT NULL DEFAULT 0,
  proctoring_enabled TINYINT(1)   NOT NULL DEFAULT 1, -- AI proctoring toggle per quiz
  created_by        CHAR(36),
  created_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS questions (
  id                CHAR(36)      PRIMARY KEY,
  quiz_id           CHAR(36)      NOT NULL,
  question_text     TEXT          NOT NULL,
  question_type     VARCHAR(20)   NOT NULL DEFAULT 'mcq' CHECK (question_type IN
                      ('mcq','true_false','multi_correct')),
  options           TEXT          NOT NULL,   -- [{"id":"A","text":"..."}, ...]
  correct_options   TEXT          NOT NULL,   -- ["A"] or ["A","C"]
  marks             INT           NOT NULL DEFAULT 1,
  negative_marks    DOUBLE        NOT NULL DEFAULT 0,
  difficulty        VARCHAR(10)   DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  explanation       TEXT,
  order_index       INT           NOT NULL DEFAULT 0,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_questions_quiz ON questions(quiz_id);

-- ---------------------------------------------------------------------
-- CONTEST TEMPLATES  (admin-defined blueprint that auto-regenerates
-- new contest instances once one fills up — entry_points here is a FREE
-- points cost, never purchasable, and reward is non-monetary)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contest_templates (
  id                CHAR(36)      PRIMARY KEY,
  name              VARCHAR(200)  NOT NULL,
  description       TEXT,
  quiz_id           CHAR(36),
  entry_points_cost INT           NOT NULL DEFAULT 0,     -- points required to join (0 = fully free)
  max_participants  INT           NOT NULL,
  duration_minutes  INT           NOT NULL DEFAULT 15,
  reward_structure  TEXT          NOT NULL, -- e.g. [{"rank":1,"badge":"Gold Scholar","points":200}, ...]
  auto_regenerate   TINYINT(1)    NOT NULL DEFAULT 1,
  is_active         TINYINT(1)    NOT NULL DEFAULT 1,
  created_by        CHAR(36),
  created_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contests (
  id                CHAR(36)      PRIMARY KEY,
  template_id       CHAR(36),
  sequence_number   INT           NOT NULL DEFAULT 1,     -- e.g. Contest #101, #102...
  name              VARCHAR(200)  NOT NULL,
  quiz_id           CHAR(36),
  entry_points_cost INT           NOT NULL DEFAULT 0,
  max_participants  INT           NOT NULL,
  current_participants INT        NOT NULL DEFAULT 0,
  reward_structure  TEXT          NOT NULL,
  status            VARCHAR(16)   NOT NULL DEFAULT 'upcoming' CHECK (status IN
                      ('upcoming','live','locked','completed','cancelled')),
  starts_at         DATETIME(3),
  ends_at           DATETIME(3),
  locked_at         DATETIME(3),
  completed_at      DATETIME(3),
  created_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (template_id) REFERENCES contest_templates(id) ON DELETE SET NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_contests_status ON contests(status);
CREATE INDEX idx_contests_template ON contests(template_id);

CREATE TABLE IF NOT EXISTS contest_participants (
  id                CHAR(36)      PRIMARY KEY,
  contest_id        CHAR(36)      NOT NULL,
  user_id           CHAR(36)      NOT NULL,
  joined_at         DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  score             INT,
  correct_count     INT,
  wrong_count       INT,
  time_taken_seconds INT,
  `rank`            INT,
  points_awarded    INT DEFAULT 0,
  badge_awarded     VARCHAR(64),
  FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_contest_participant (contest_id, user_id)  -- one entry per user per contest
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_participants_contest ON contest_participants(contest_id);
CREATE INDEX idx_participants_user ON contest_participants(user_id);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id                CHAR(36)      PRIMARY KEY,
  contest_id        CHAR(36)      NOT NULL,
  user_id           CHAR(36)      NOT NULL,
  quiz_id           CHAR(36)      NOT NULL,
  started_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  submitted_at      DATETIME(3),
  auto_submitted    TINYINT(1)    NOT NULL DEFAULT 0,
  score             DOUBLE        DEFAULT 0,
  FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
  UNIQUE KEY uq_contest_attempt (contest_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS quiz_answers (
  id                CHAR(36)      PRIMARY KEY,
  attempt_id        CHAR(36)      NOT NULL,
  question_id       CHAR(36)      NOT NULL,
  selected_options  TEXT          NOT NULL,
  is_correct        TINYINT(1),
  marks_obtained    DOUBLE        DEFAULT 0,
  answered_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id),
  UNIQUE KEY uq_attempt_question (attempt_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- BADGES / ACHIEVEMENTS  (non-monetary rewards)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS badges (
  id                CHAR(36)      PRIMARY KEY,
  code              VARCHAR(64)   UNIQUE NOT NULL,
  name              VARCHAR(100)  NOT NULL,
  description       VARCHAR(255),
  icon              VARCHAR(64)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_badges (
  id                CHAR(36)      PRIMARY KEY,
  user_id           CHAR(36)      NOT NULL,
  badge_id          CHAR(36)      NOT NULL,
  awarded_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  contest_id        CHAR(36),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE SET NULL,
  UNIQUE KEY uq_user_badge_contest (user_id, badge_id, contest_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- NOTIFICATIONS & ANNOUNCEMENTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id                CHAR(36)      PRIMARY KEY,
  user_id           CHAR(36)      NOT NULL,
  type              VARCHAR(32)   NOT NULL,
  title             VARCHAR(200)  NOT NULL,
  message           TEXT,
  is_read           TINYINT(1)    NOT NULL DEFAULT 0,
  created_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

CREATE TABLE IF NOT EXISTS announcements (
  id                CHAR(36)      PRIMARY KEY,
  title             VARCHAR(200)  NOT NULL,
  body              TEXT          NOT NULL,
  banner_url        TEXT,
  is_active         TINYINT(1)    NOT NULL DEFAULT 1,
  created_by        CHAR(36),
  created_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- ADMIN AUDIT LOG
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_logs (
  id                CHAR(36)      PRIMARY KEY,
  admin_id          CHAR(36)      NOT NULL,
  action            VARCHAR(100)  NOT NULL,
  target_type       VARCHAR(50),
  target_id         CHAR(36),
  details           TEXT,
  created_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (admin_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- VIEW: global leaderboard (all-time points)
-- ---------------------------------------------------------------------
DROP VIEW IF EXISTS global_leaderboard;
CREATE VIEW global_leaderboard AS
SELECT
  u.id AS user_id,
  p.full_name,
  u.username,
  p.college,
  p.total_points,
  p.contests_won,
  p.total_contests,
  RANK() OVER (ORDER BY p.total_points DESC) AS global_rank
FROM users u
JOIN profiles p ON p.user_id = u.id
WHERE u.status = 'active' AND u.role = 'student';
