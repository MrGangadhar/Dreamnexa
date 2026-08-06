-- ============================================================
-- DreamNexa — News Bookmarks Schema
-- ============================================================
-- Stores articles bookmarked by users.
-- The UNIQUE(user_id, news_url) constraint prevents duplicates.

CREATE TABLE IF NOT EXISTS news_bookmarks (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  news_url      TEXT          NOT NULL,
  title         TEXT          NOT NULL,
  image_url     TEXT,
  source_name   TEXT,
  author        TEXT,
  description   TEXT,
  category      TEXT,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, news_url)
);

CREATE INDEX IF NOT EXISTS idx_news_bookmarks_user_id ON news_bookmarks(user_id);
