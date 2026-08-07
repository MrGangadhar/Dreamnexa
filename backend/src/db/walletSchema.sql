-- ============================================================
-- DreamNexa — Wallet & Rewards Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS wallets (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  current_points    INT NOT NULL DEFAULT 0,
  available_prize   DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  lifetime_prize    DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS points_history (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id           UUID, -- optional, if points came from a quiz
  quiz_name         TEXT NOT NULL,
  points            INT NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'Completed',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reward_history (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_amount     DECIMAL(10, 2) NOT NULL,
  points_used       INT NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'Credited',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS withdrawal_history (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount            DECIMAL(10, 2) NOT NULL,
  method            VARCHAR(50) NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'Processing' CHECK (status IN ('Completed', 'Processing', 'Failed')),
  transaction_id    VARCHAR(100),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
