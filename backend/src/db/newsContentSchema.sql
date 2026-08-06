-- ============================================================
-- DreamNexa — Admin-Managed News & Vlogs Schema
-- ============================================================
-- Stores news articles and vlogs created by admins.
-- These appear on the user-facing news page.

CREATE TABLE IF NOT EXISTS news_articles (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT          NOT NULL,
  description   TEXT,
  content       TEXT,
  image_url     TEXT,
  category      TEXT          NOT NULL DEFAULT 'general',
  article_type  TEXT          NOT NULL DEFAULT 'news'
                              CHECK (article_type IN ('news', 'vlog')),
  vlog_url      TEXT,
  author_name   TEXT,
  is_published  BOOLEAN       NOT NULL DEFAULT true,
  is_featured   BOOLEAN       NOT NULL DEFAULT false,
  created_by    UUID          REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_articles_published
  ON news_articles(is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_articles_category
  ON news_articles(category, is_published);

CREATE INDEX IF NOT EXISTS idx_news_articles_featured
  ON news_articles(is_featured, is_published);

-- Full-text search index on title + description + content
CREATE INDEX IF NOT EXISTS idx_news_articles_search
  ON news_articles USING gin(
    to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(content, ''))
  );
