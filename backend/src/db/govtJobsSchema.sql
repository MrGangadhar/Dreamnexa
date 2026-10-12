-- ============================================================
-- DreamNexa — Government Jobs Schema (MySQL 8.0+)
-- ============================================================
-- Stores recruitment notifications published by admins.
-- These appear on the user-facing /jobs page.

CREATE TABLE IF NOT EXISTS govt_jobs (
  id            CHAR(36)      PRIMARY KEY,
  post_name     VARCHAR(300)  NOT NULL,
  department    VARCHAR(200)  NOT NULL,
  state         VARCHAR(100)  NOT NULL DEFAULT 'All India',
  district      VARCHAR(150)  DEFAULT NULL,
  total_posts   INT           NOT NULL DEFAULT 1,
  open_date     DATE          DEFAULT NULL,
  last_date     DATE          DEFAULT NULL,
  eligibility   TEXT,
  age_limit     VARCHAR(150)  DEFAULT NULL,
  salary        VARCHAR(150)  DEFAULT NULL,
  salary_scale  VARCHAR(150)  DEFAULT NULL,
  application_fee TEXT        DEFAULT NULL,
  selection_process TEXT      DEFAULT NULL,
  official_notification_url TEXT DEFAULT NULL,
  apply_link    TEXT,
  apply_online_url TEXT       DEFAULT NULL,
  vlog_url      TEXT,
  image_url     TEXT,
  description   TEXT          DEFAULT NULL,
  is_published  TINYINT(1)    NOT NULL DEFAULT 0,
  is_featured   TINYINT(1)    NOT NULL DEFAULT 0,
  created_by    CHAR(36)      DEFAULT NULL,
  created_at    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_govt_jobs_published
  ON govt_jobs(is_published, last_date);

CREATE INDEX idx_govt_jobs_state
  ON govt_jobs(state, is_published);

CREATE INDEX idx_govt_jobs_featured
  ON govt_jobs(is_featured, is_published);

CREATE INDEX idx_govt_jobs_last_date
  ON govt_jobs(last_date, is_published);

-- Idempotent column migrations for existing databases (handled via ER_DUP_FIELDNAME in migrate.js)
ALTER TABLE govt_jobs ADD COLUMN age_limit VARCHAR(150) DEFAULT NULL;
ALTER TABLE govt_jobs ADD COLUMN salary_scale VARCHAR(150) DEFAULT NULL;
ALTER TABLE govt_jobs ADD COLUMN application_fee TEXT DEFAULT NULL;
ALTER TABLE govt_jobs ADD COLUMN selection_process TEXT DEFAULT NULL;
ALTER TABLE govt_jobs ADD COLUMN official_notification_url TEXT DEFAULT NULL;
ALTER TABLE govt_jobs ADD COLUMN apply_online_url TEXT DEFAULT NULL;
ALTER TABLE govt_jobs ADD COLUMN description TEXT DEFAULT NULL;

