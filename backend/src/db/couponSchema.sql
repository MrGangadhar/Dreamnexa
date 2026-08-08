-- ============================================================
-- DreamNexa — Coupons & Coupon Redemptions Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS coupons (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code              VARCHAR(50) UNIQUE NOT NULL,
  points            INT NOT NULL DEFAULT 0,
  reward_amount     DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  max_redemptions   INT, -- NULL for unlimited
  redemptions_count INT NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id         UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points_awarded    INT NOT NULL DEFAULT 0,
  reward_awarded    DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  redeemed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, coupon_id)
);
