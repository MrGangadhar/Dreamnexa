-- ============================================================
-- DreamNexa — AI Quiz Proctor Schema (MySQL 8.0+)
-- ============================================================
-- Adds an integrity-monitoring layer on top of the EXISTING contest/quiz
-- flow (quiz_attempts). One proctoring_session tracks one quiz_attempt;
-- proctoring_events are the individual signals (tab switch, face not
-- detected, copy attempt, ...) reported by the client during that attempt.
--
-- Risk scoring itself lives in app code (utils/proctoringEngine.js).
-- This schema only stores the raw signals and the resulting decision,
-- never a video/audio recording — no camera frames or microphone audio
-- ever reach the server, only derived events.

CREATE TABLE IF NOT EXISTS proctoring_sessions (
  id                    CHAR(36)      PRIMARY KEY,
  attempt_id            CHAR(36)      NOT NULL UNIQUE,
  user_id               CHAR(36)      NOT NULL,
  contest_id            CHAR(36)      NOT NULL,

  camera_granted              TINYINT(1) NOT NULL DEFAULT 0,
  microphone_granted          TINYINT(1) NOT NULL DEFAULT 0,
  privacy_notice_acknowledged TINYINT(1) NOT NULL DEFAULT 0,
  consented_at                 DATETIME(3),

  camera_ok               TINYINT(1) NOT NULL DEFAULT 0,
  microphone_ok           TINYINT(1) NOT NULL DEFAULT 0,
  face_detected_ok        TINYINT(1) NOT NULL DEFAULT 0,
  browser_compatible_ok   TINYINT(1) NOT NULL DEFAULT 0,
  fullscreen_ok            TINYINT(1) NOT NULL DEFAULT 0,
  system_check_completed_at DATETIME(3),

  risk_score            DOUBLE       NOT NULL DEFAULT 0,
  total_events           INT         NOT NULL DEFAULT 0,
  low_count              INT         NOT NULL DEFAULT 0,
  medium_count           INT         NOT NULL DEFAULT 0,
  high_count             INT         NOT NULL DEFAULT 0,
  critical_count         INT         NOT NULL DEFAULT 0,

  status                 VARCHAR(16) NOT NULL DEFAULT 'in_progress' CHECK (status IN
                            ('in_progress', 'completed', 'terminated')),
  final_status           VARCHAR(20) CHECK (final_status IN
                            ('PASSED', 'REVIEW_REQUIRED', 'REJECTED')),
  final_reason           VARCHAR(255),

  reviewed_by             CHAR(36),
  reviewer_decision       VARCHAR(16) CHECK (reviewer_decision IN ('confirmed', 'dismissed')),
  reviewed_at              DATETIME(3),

  started_at             DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ended_at                DATETIME(3),

  FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_proctoring_sessions_contest ON proctoring_sessions(contest_id);
CREATE INDEX idx_proctoring_sessions_user ON proctoring_sessions(user_id);
CREATE INDEX idx_proctoring_sessions_flagged ON proctoring_sessions(final_status);

CREATE TABLE IF NOT EXISTS proctoring_events (
  id                    CHAR(36)      PRIMARY KEY,
  session_id            CHAR(36)      NOT NULL,
  attempt_id            CHAR(36)      NOT NULL,
  user_id               CHAR(36)      NOT NULL,

  event_type            VARCHAR(40) NOT NULL CHECK (event_type IN (
                            'tab_switch','fullscreen_exit','copy_attempt','paste_attempt',
                            'cut_attempt','select_all_attempt','context_menu_attempt',
                            'print_screen_attempt','visibility_change','face_not_detected',
                            'multiple_faces_detected','gaze_deviation','camera_frame_absence',
                            'camera_permission_removed','microphone_permission_removed',
                            'suspicious_voice_activity','window_blur','devtools_suspected','other'
                          )),
  severity               VARCHAR(10) NOT NULL DEFAULT 'low' CHECK (severity IN ('low','medium','high','critical')),
  confidence             DOUBLE      NOT NULL DEFAULT 1,
  occurrences            INT         NOT NULL DEFAULT 1,
  metadata               TEXT,

  reviewed               TINYINT(1)  NOT NULL DEFAULT 0,
  reviewer_decision      VARCHAR(16) CHECK (reviewer_decision IN ('confirmed', 'dismissed')),

  created_at             DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  FOREIGN KEY (session_id) REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_proctoring_events_session ON proctoring_events(session_id);
CREATE INDEX idx_proctoring_events_attempt ON proctoring_events(attempt_id);

-- Ensure proctoring_enabled column exists on quizzes table (idempotent in migrate.js via ER_DUP_FIELDNAME)
ALTER TABLE quizzes ADD COLUMN proctoring_enabled TINYINT(1) NOT NULL DEFAULT 1;

