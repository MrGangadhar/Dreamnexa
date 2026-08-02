-- =====================================================================
-- QuizArena Database Schema
-- Free-to-play, points-based student quiz contest platform.
-- There is NO wallet, NO payment, NO cash-prize table anywhere here —
-- this is a deliberate design boundary, not an oversight. See README.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- USERS & PROFILES
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username          VARCHAR(30) UNIQUE NOT NULL,
  email             VARCHAR(255) UNIQUE NOT NULL,
  mobile            VARCHAR(15) UNIQUE,
  password_hash     TEXT NOT NULL,
  role              VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  status            VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  email_verified    BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
  user_id           UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name         VARCHAR(120) NOT NULL,
  college           VARCHAR(150),
  university        VARCHAR(150),
  state             VARCHAR(80),
  city              VARCHAR(80),
  avatar_url        TEXT,
  referral_code     VARCHAR(12) UNIQUE NOT NULL,
  referred_by       UUID REFERENCES users(id),
  total_points      BIGINT NOT NULL DEFAULT 0,
  total_contests     INT NOT NULL DEFAULT 0,
  total_quizzes_played INT NOT NULL DEFAULT 0,
  contests_won      INT NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash        TEXT NOT NULL,
  expires_at        TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked           BOOLEAN NOT NULL DEFAULT false
);

-- ---------------------------------------------------------------------
-- POINTS LEDGER  (replaces a money wallet — units have no cash value,
-- cannot be purchased, and cannot be withdrawn or cashed out)
-- ---------------------------------------------------------------------
CREATE TABLE points_transactions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount            INT NOT NULL,              -- can be negative for entry cost
  type              VARCHAR(30) NOT NULL CHECK (type IN
                      ('signup_bonus','daily_login','referral_bonus',
                       'contest_entry','contest_refund','quiz_reward',
                       'rank_bonus','admin_adjustment','badge_bonus')),
  reference_id      UUID,                      -- e.g. contest_participant id
  description       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_points_tx_user ON points_transactions(user_id);

-- ---------------------------------------------------------------------
-- CONTEST TEMPLATES  (admin-defined blueprint that auto-regenerates
-- new contest instances once one fills up — Dream11-style workflow,
-- but entry_points here is a FREE points cost, never purchasable,
-- and reward is non-monetary)
-- ---------------------------------------------------------------------
CREATE TABLE contest_templates (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              VARCHAR(150) NOT NULL,
  description       TEXT,
  quiz_id           UUID,                      -- FK added after quizzes table
  entry_points_cost INT NOT NULL DEFAULT 0,     -- points required to join (0 = fully free)
  max_participants  INT NOT NULL,
  duration_minutes  INT NOT NULL DEFAULT 15,
  reward_structure  JSONB NOT NULL DEFAULT '[]', -- e.g. [{"rank":1,"badge":"Gold Scholar","points":200}, ...]
  auto_regenerate   BOOLEAN NOT NULL DEFAULT true,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contests (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id       UUID REFERENCES contest_templates(id) ON DELETE SET NULL,
  sequence_number   INT NOT NULL DEFAULT 1,     -- e.g. Contest #101, #102...
  name              VARCHAR(150) NOT NULL,
  quiz_id           UUID,
  entry_points_cost INT NOT NULL DEFAULT 0,
  max_participants  INT NOT NULL,
  current_participants INT NOT NULL DEFAULT 0,
  reward_structure  JSONB NOT NULL DEFAULT '[]',
  status            VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN
                      ('upcoming','live','locked','completed','cancelled')),
  starts_at         TIMESTAMPTZ,
  ends_at           TIMESTAMPTZ,
  locked_at         TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contests_status ON contests(status);
CREATE INDEX idx_contests_template ON contests(template_id);

CREATE TABLE contest_participants (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contest_id        UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  score             INT,
  correct_count     INT,
  wrong_count       INT,
  time_taken_seconds INT,
  rank              INT,
  points_awarded    INT DEFAULT 0,
  badge_awarded     VARCHAR(100),
  UNIQUE (contest_id, user_id)                  -- one entry per user per contest
);

CREATE INDEX idx_participants_contest ON contest_participants(contest_id);
CREATE INDEX idx_participants_user ON contest_participants(user_id);

-- ---------------------------------------------------------------------
-- QUIZ MODULE
-- ---------------------------------------------------------------------
CREATE TABLE quizzes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             VARCHAR(150) NOT NULL,
  description       TEXT,
  instructions       TEXT,
  duration_minutes  INT NOT NULL DEFAULT 15,
  negative_marking  NUMERIC(4,2) NOT NULL DEFAULT 0,   -- e.g. 0.25 per wrong answer
  passing_marks     INT DEFAULT 0,
  is_published      BOOLEAN NOT NULL DEFAULT false,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE contest_templates ADD CONSTRAINT fk_template_quiz
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL;
ALTER TABLE contests ADD CONSTRAINT fk_contest_quiz
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL;

CREATE TABLE questions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id           UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text     TEXT NOT NULL,
  question_type     VARCHAR(20) NOT NULL DEFAULT 'mcq' CHECK (question_type IN
                      ('mcq','true_false','multi_correct')),
  options           JSONB NOT NULL DEFAULT '[]',   -- [{"id":"A","text":"..."}, ...]
  correct_options   JSONB NOT NULL DEFAULT '[]',   -- ["A"] or ["A","C"]
  marks             INT NOT NULL DEFAULT 1,
  negative_marks    NUMERIC(4,2) NOT NULL DEFAULT 0,
  difficulty        VARCHAR(10) DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  explanation       TEXT,
  order_index       INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_questions_quiz ON questions(quiz_id);

CREATE TABLE quiz_attempts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contest_id        UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id           UUID NOT NULL REFERENCES quizzes(id),
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at      TIMESTAMPTZ,
  auto_submitted    BOOLEAN NOT NULL DEFAULT false,
  score             NUMERIC(6,2) DEFAULT 0,
  UNIQUE (contest_id, user_id)
);

CREATE TABLE quiz_answers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id        UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id       UUID NOT NULL REFERENCES questions(id),
  selected_options  JSONB NOT NULL DEFAULT '[]',
  is_correct        BOOLEAN,
  marks_obtained    NUMERIC(5,2) DEFAULT 0,
  answered_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, question_id)
);

-- ---------------------------------------------------------------------
-- BADGES / ACHIEVEMENTS  (non-monetary rewards)
-- ---------------------------------------------------------------------
CREATE TABLE badges (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code              VARCHAR(50) UNIQUE NOT NULL,
  name              VARCHAR(100) NOT NULL,
  description       TEXT,
  icon              VARCHAR(50)
);

CREATE TABLE user_badges (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id          UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  contest_id        UUID REFERENCES contests(id),
  UNIQUE (user_id, badge_id, contest_id)
);

-- ---------------------------------------------------------------------
-- NOTIFICATIONS & ANNOUNCEMENTS
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type              VARCHAR(40) NOT NULL,
  title             VARCHAR(150) NOT NULL,
  message           TEXT,
  is_read           BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

CREATE TABLE announcements (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             VARCHAR(150) NOT NULL,
  body              TEXT NOT NULL,
  banner_url        TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- ADMIN AUDIT LOG
-- ---------------------------------------------------------------------
CREATE TABLE admin_logs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id          UUID NOT NULL REFERENCES users(id),
  action            VARCHAR(100) NOT NULL,
  target_type       VARCHAR(50),
  target_id         UUID,
  details           JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- VIEW: global leaderboard (all-time points)
-- ---------------------------------------------------------------------
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
