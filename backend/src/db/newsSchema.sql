-- ============================================================
-- DreamNexa — News Bookmarks Schema (MySQL 8.0+)
-- ============================================================
-- Stores articles bookmarked by users.
-- The UNIQUE(user_id, news_url) constraint prevents duplicates.

CREATE TABLE IF NOT EXISTS news_bookmarks (
  id            CHAR(36)      PRIMARY KEY,
  user_id       CHAR(36)      NOT NULL,
  news_url      VARCHAR(500)  NOT NULL,
  title         VARCHAR(300)  NOT NULL,
  image_url     TEXT,
  source_name   VARCHAR(150),
  author        VARCHAR(150),
  description   TEXT,
  category      VARCHAR(50),
  published_at  DATETIME(3),
  created_at    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_news_url (user_id, news_url)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_news_bookmarks_user_id ON news_bookmarks(user_id);
