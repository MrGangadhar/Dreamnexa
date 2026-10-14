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

    console.log('✔ Successfully cleaned and seeded single fresh vlog post.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating news:', err);
    process.exit(1);
  }
}

main();
