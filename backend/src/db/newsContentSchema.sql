-- ============================================================
-- DreamNexa — Admin-Managed News & Vlogs Schema (MySQL 8.0+)
-- ============================================================
-- Stores news articles and vlogs created by admins.
-- These appear on the user-facing news page.

CREATE TABLE IF NOT EXISTS news_articles (
  id            CHAR(36)      PRIMARY KEY,
  title         VARCHAR(300)  NOT NULL,
  description   TEXT,
  content       LONGTEXT,
  image_url     TEXT,
  category      VARCHAR(50)   NOT NULL DEFAULT 'general',
  article_type  VARCHAR(10)   NOT NULL DEFAULT 'news'
                              CHECK (article_type IN ('news', 'vlog')),
  vlog_url      TEXT,
  author_name   VARCHAR(150),
  is_published  TINYINT(1)    NOT NULL DEFAULT 1,
  is_featured   TINYINT(1)    NOT NULL DEFAULT 0,
  created_by    CHAR(36),
  created_at    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_news_articles_published
  ON news_articles(is_published, created_at);

CREATE INDEX idx_news_articles_category
  ON news_articles(category, is_published);

CREATE INDEX idx_news_articles_featured
  ON news_articles(is_featured, is_published);

CREATE FULLTEXT INDEX idx_news_articles_fulltext
  ON news_articles(title, description, content);

-- NOTE: search (newsController.searchNews) uses a simple LIKE '%term%'
-- fallback for portability; the FULLTEXT index above is available if the
-- search query is upgraded to MySQL's `MATCH ... AGAINST` in future.
