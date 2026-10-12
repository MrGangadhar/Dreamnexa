-- ============================================================
-- DreamNexa — Coupons & Coupon Redemptions Schema (MySQL 8.0+)
-- ============================================================

CREATE TABLE IF NOT EXISTS coupons (
  id                CHAR(36)      PRIMARY KEY,
  code              VARCHAR(32)   UNIQUE NOT NULL,
  points            INT           NOT NULL DEFAULT 0,
  reward_amount     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  max_redemptions   INT, -- NULL for unlimited
  redemptions_count INT           NOT NULL DEFAULT 0,
  is_active         TINYINT(1)    NOT NULL DEFAULT 1,
  expires_at        DATETIME(3),
  created_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id                CHAR(36)      PRIMARY KEY,
  coupon_id         CHAR(36)      NOT NULL,
  user_id           CHAR(36)      NOT NULL,
  points_awarded    INT           NOT NULL DEFAULT 0,
  reward_awarded    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  redeemed_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_coupon (user_id, coupon_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
