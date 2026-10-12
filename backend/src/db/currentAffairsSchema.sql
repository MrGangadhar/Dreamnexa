-- ============================================================
-- DreamNexa — Current Affairs Schema (MySQL 8.0+)
-- ============================================================
-- Stores admin-managed current affairs articles with
-- structured key_points for easy student reading.

CREATE TABLE IF NOT EXISTS current_affairs (
  id              CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
  title           VARCHAR(400)  NOT NULL,
  summary         TEXT          NOT NULL,
  key_points      JSON          NOT NULL DEFAULT (JSON_ARRAY()),
  content         LONGTEXT,
  why_it_matters  TEXT,
  image_url       TEXT,
  category        VARCHAR(80)   NOT NULL DEFAULT 'general',
  exam_tags       JSON          NOT NULL DEFAULT (JSON_ARRAY()),
  tags            JSON          NOT NULL DEFAULT (JSON_ARRAY()),
  source_url      TEXT,
  published_date  DATE          NOT NULL DEFAULT (CURDATE()),
  is_published    TINYINT(1)    NOT NULL DEFAULT 1,
  is_featured     TINYINT(1)    NOT NULL DEFAULT 0,
  created_by      CHAR(36)      DEFAULT NULL,
  created_at      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_ca_published
  ON current_affairs(is_published, published_date);

CREATE INDEX idx_ca_category
  ON current_affairs(category, is_published);

CREATE INDEX idx_ca_featured
  ON current_affairs(is_featured, is_published);

CREATE INDEX idx_ca_date
  ON current_affairs(published_date DESC);
