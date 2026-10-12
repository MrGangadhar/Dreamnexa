-- ============================================================
-- DreamNexa — Wallet & Rewards Schema (MySQL 8.0+)
-- ============================================================

CREATE TABLE IF NOT EXISTS wallets (
  id                CHAR(36)      PRIMARY KEY,
  user_id           CHAR(36)      NOT NULL UNIQUE,
  current_points    INT           NOT NULL DEFAULT 0,
  available_prize   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  lifetime_prize    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  updated_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS points_history (
  id                CHAR(36)      PRIMARY KEY,
  user_id           CHAR(36)      NOT NULL,
  quiz_id           CHAR(36), -- optional, if points came from a quiz
  quiz_name         VARCHAR(200)  NOT NULL,
  points            INT           NOT NULL,
  status            VARCHAR(20)   NOT NULL DEFAULT 'Completed',
  created_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reward_history (
  id                CHAR(36)      PRIMARY KEY,
  user_id           CHAR(36)      NOT NULL,
  reward_amount     DECIMAL(10,2) NOT NULL,
  points_used       INT           NOT NULL,
  status            VARCHAR(20)   NOT NULL DEFAULT 'Credited',
  created_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payout_details (
  id                CHAR(36)      PRIMARY KEY,
  user_id           CHAR(36)      NOT NULL UNIQUE,
  upi_id            VARCHAR(100)  DEFAULT NULL,
  account_holder    VARCHAR(150)  DEFAULT NULL,
  account_number    VARCHAR(30)   DEFAULT NULL,
  ifsc_code         VARCHAR(15)   DEFAULT NULL,
  bank_name         VARCHAR(100)  DEFAULT NULL,
  preferred_method  VARCHAR(10)   NOT NULL DEFAULT 'UPI',
  updated_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS withdrawal_history (
  id                CHAR(36)      PRIMARY KEY,
  user_id           CHAR(36)      NOT NULL,
  amount            DECIMAL(10,2) NOT NULL,
  method            VARCHAR(50)   NOT NULL,
  payout_snapshot   JSON          DEFAULT NULL,
  status            VARCHAR(20)   NOT NULL DEFAULT 'Processing' CHECK (status IN ('Completed', 'Processing', 'Failed')),
  transaction_id    VARCHAR(100),
  created_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

