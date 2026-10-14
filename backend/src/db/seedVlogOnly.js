/**
 * seedVlogOnly.js
 * Removes all current news and vlog articles, inserts a single featured educational vlog post,
 * and ensures meetmrgangadhar@gmail.com has admin role in local MySQL.
 */
const { query } = require('./pool');

async function run() {
  try {
    console.log('[seedVlogOnly] Deleting all existing news and vlog posts...');
    await query('DELETE FROM news_articles');

    console.log('[seedVlogOnly] Inserting single educational vlog post...');
    await query(
      `INSERT INTO news_articles (
        title, description, content, category, article_type, vlog_url, author_name, is_published, is_featured
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, 1, 1
      )`,
      [
        '🎥 DreamNexa Masterclass: How to Score High in Government & Campus Quizzes',
        'Watch this comprehensive strategy vlog covering proven time-management tactics, accuracy frameworks, and daily GK revision methods for competitive exams.',
        'In this video masterclass, we break down key strategies adopted by top rankers preparing for UPSC, SSC, Banking, and State PSC examinations. Key highlights include: 1. Speed vs Accuracy balance in timed tests, 2. Elimination techniques for multiple-choice questions, 3. Daily 15-minute GK revision routines, and 4. Analyzing performance analytics after every mock test session.',
        'education',
        'vlog',
        'https://www.youtube.com/watch?v=kqtD5dpn9C8',
        'Gangadhar'
      ]
    );

    console.log('[seedVlogOnly] Ensuring meetmrgangadhar@gmail.com has admin role...');
    await query(
      `UPDATE users SET role = 'admin' WHERE email = 'meetmrgangadhar@gmail.com' OR username = 'itzgangadhar'`
    );

    console.log('✔ Successfully cleaned all news/vlogs, inserted 1 vlog post, and updated admin user.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to run seedVlogOnly:', err);
    process.exit(1);
  }
}

run();
