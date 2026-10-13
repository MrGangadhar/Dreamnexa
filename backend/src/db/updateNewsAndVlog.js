/**
 * updateNewsAndVlog.js
 * Removes all sample/dummy news articles and inserts clean educational articles
 * and a real educational vlog post into localhost MySQL.
 */

const { pool, query } = require('./pool');

async function main() {
  try {
    console.log('[updateNewsAndVlog] Removing old dummy/sample news...');
    await query('DELETE FROM news_articles');

    console.log('[updateNewsAndVlog] Inserting fresh educational news & vlog post...');

    // 1. Featured Educational Vlog Post
    await query(
      `INSERT INTO news_articles (
        title, description, content, category, article_type, vlog_url, author_name, is_published, is_featured
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, 1, 1
      )`,
      [
        '🎥 Expert Masterclass: How to Score High in Government & Campus Quizzes',
        'Watch this comprehensive strategy vlog covering proven time-management tactics, accuracy frameworks, and daily GK revision methods for competitive exams.',
        'In this video masterclass, we break down key strategies adopted by top rankers preparing for UPSC, SSC, Banking, and State PSC examinations. Key highlights include: 1. Speed vs Accuracy balance in timed tests, 2. Elimination techniques for multiple-choice questions, 3. Daily 15-minute GK revision routines, and 4. Analyzing performance analytics after every mock test session.',
        'education',
        'vlog',
        'https://www.youtube.com/watch?v=kqtD5dpn9C8',
        'DreamNexa Mentors'
      ]
    );

    // 2. High-value Educational News Articles
    await query(
      `INSERT INTO news_articles (
        title, description, content, category, article_type, vlog_url, author_name, is_published, is_featured
      ) VALUES (
        $1, $2, $3, $4, $5, NULL, $6, 1, 1
      )`,
      [
        'UPSC Civil Services 2026: Preliminary Examination Syllabus & Preparation Strategy',
        'A complete analysis of the General Studies Paper I and CSAT structure, recommended standard reference books, and monthly milestone targets for aspirants.',
        'The Union Public Service Commission (UPSC) Civil Services Examination demands disciplined conceptual clarity across Indian Polity, Modern History, Geography, Economics, and Environment. Candidates are advised to build daily newspaper reading habits, maintain topical notes, and attempt regular sectional quizzes to reinforce static and dynamic syllabus components.',
        'education',
        'news',
        'Editorial Board'
      ]
    );

    await query(
      `INSERT INTO news_articles (
        title, description, content, category, article_type, vlog_url, author_name, is_published, is_featured
      ) VALUES (
        $1, $2, $3, $4, $5, NULL, $6, 1, 0
      )`,
      [
        'SSC CGL 2026 Recruitment Drive: Tier-I & Tier-II Pattern Breakdown',
        'Staff Selection Commission announces upcoming schedule. Understand the exam pattern, section-wise weightage, and negative marking rules.',
        'The Staff Selection Commission Combined Graduate Level (SSC CGL) exam tests Quantitative Aptitude, Reasoning, English Comprehension, and General Awareness. Aspirants should prioritize high-scoring topics, memorize standard formulas, and practice timed computer-based mock tests regularly.',
        'jobs',
        'news',
        'Recruitment Desk'
      ]
    );

    await query(
      `INSERT INTO news_articles (
        title, description, content, category, article_type, vlog_url, author_name, is_published, is_featured
      ) VALUES (
        $1, $2, $3, $4, $5, NULL, $6, 1, 0
      )`,
      [
        'Monthly Current Affairs & GK Digest: Key National and Global Milestones',
        'Essential policy updates, science & technology breakthroughs, international summits, and economic indicators curated for exam revision.',
        'This monthly review compiles crucial developments across governance, environmental summits, bilateral agreements, defense exercises, and economic indices. Review each section carefully and test your retention with our daily current affairs quiz sprints.',
        'current-affairs',
        'news',
        'GK Research Team'
      ]
    );

    console.log('✔ Successfully cleaned and seeded fresh news and vlog post.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating news:', err);
    process.exit(1);
  }
}

main();
