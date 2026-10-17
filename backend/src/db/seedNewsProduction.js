/**
 * seedNewsProduction.js
 * Seeds the production MySQL database with quality news articles and vlogs.
 * Safe to re-run — skips articles that already exist by title.
 * Also auto-fixes vlogs with invalid vlog_url values like "NA".
 *
 * Run: node src/db/seedNewsProduction.js
 */

require('dotenv').config();
const { query, pool } = require('./pool');

const NEWS_ARTICLES = [
  {
    title: 'Masterclass: How to Crack Government Exams — Complete Strategy',
    description: 'Comprehensive strategy covering time-management tactics, accuracy frameworks, and daily GK revision methods proven by top UPSC/SSC rankers.',
    content: 'This masterclass breaks down strategies adopted by toppers preparing for UPSC, SSC CGL, Banking, and State PSC examinations. Topics: (1) Speed vs Accuracy balance in timed tests, (2) Elimination techniques for MCQs, (3) Daily 15-minute GK revision routine, (4) Analyzing performance analytics after every mock test.',
    category: 'education',
    article_type: 'vlog',
    vlog_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
    author_name: 'DreamNexa Mentors',
    is_published: 1,
    is_featured: 1,
  },
  {
    title: 'SSC CGL 2026 Syllabus and Exam Pattern — Full Breakdown',
    description: 'Complete subject-wise analysis of SSC CGL 2026 Tier 1 and Tier 2 — maths, English, GK, and reasoning sections explained.',
    content: 'This video breaks down the SSC CGL 2026 exam pattern, marking scheme, and most important topics for each section. Expert tips on high-scoring areas and how to prioritise your preparation timeline.',
    category: 'education',
    article_type: 'vlog',
    vlog_url: 'https://www.youtube.com/watch?v=RjxGX3H85R4',
    author_name: 'DreamNexa Mentors',
    is_published: 1,
    is_featured: 0,
  },
  {
    title: 'Top 10 Government Jobs in India for 2026 — Apply Now',
    description: 'Must-watch guide to the ten best central and state government job opportunities open for applications this year.',
    content: 'A curated guide covering UPSC Civil Services, SSC CGL, RRB NTPC, SBI PO, IBPS PO, State PSC, Teaching vacancies, Defence entries, and more. Includes salary breakdowns, eligibility criteria, and application tips.',
    category: 'jobs',
    article_type: 'vlog',
    vlog_url: 'https://www.youtube.com/watch?v=YQHsXMglC9A',
    author_name: 'DreamNexa Mentors',
    is_published: 1,
    is_featured: 0,
  },
  {
    title: 'UPSC Civil Services 2026: Notification Released — Apply Before 21 May',
    description: 'UPSC released the Civil Services Examination 2026 notification. Over 1,100 vacancies across IAS, IPS, IFS, and other Group A & B services.',
    content: 'The Union Public Service Commission officially released Civil Services Examination 2026 notification on upsc.gov.in. Approximately 1,105 vacancies are being filled across Group A and B services. Candidates must hold a bachelor degree from a recognised university. Upper age limit is 32 years. Preliminary examination is scheduled for 25 May 2026. Apply through the UPSC online portal before the last date.',
    category: 'government',
    article_type: 'news',
    vlog_url: null,
    author_name: 'DreamNexa Editorial',
    is_published: 1,
    is_featured: 1,
  },
  {
    title: 'SSC CGL 2026 Notification: 17,000+ Vacancies for Group B and C Posts',
    description: 'Staff Selection Commission released SSC CGL 2026 notification with over 17,000 vacancies. Graduates can apply through the SSC online portal.',
    content: 'The Staff Selection Commission announced Combined Graduate Level Examination 2026 offering 17,727 vacancies for Group B and C posts including Tax Assistant, Income Tax Inspector, Junior Statistical Investigator, and Assistant Section Officer. Tier-I CBT is scheduled August to September 2026. Application window closes 30 June 2026 on ssc.gov.in.',
    category: 'government',
    article_type: 'news',
    vlog_url: null,
    author_name: 'DreamNexa Editorial',
    is_published: 1,
    is_featured: 0,
  },
  {
    title: 'RRB NTPC 2026: 11,558 Vacancies Released — Graduate and 10+2 Posts',
    description: 'Railway Recruitment Boards announced 11,558 NTPC vacancies for graduate and 10+2 level posts. Online applications open through RRB official portals.',
    content: 'The Railway Recruitment Boards released NTPC 2026 notification with 11,558 vacancies across Junior Clerk cum Typist, Station Master, Goods Guard, and Commercial cum Ticket Clerk posts. Age limit 18 to 33 years. Apply through the respective regional RRB portal. CBT tentatively scheduled for Q4 2026.',
    category: 'jobs',
    article_type: 'news',
    vlog_url: null,
    author_name: 'DreamNexa Editorial',
    is_published: 1,
    is_featured: 0,
  },
  {
    title: 'SBI PO 2026: 600 Probationary Officer Vacancies — Prelims in June',
    description: 'State Bank of India invites applications for 600 Probationary Officer posts. Prelims will be held in June 2026.',
    content: 'SBI has notified 600 vacancies for Probationary Officers. Candidates must be graduates between 21 to 30 years. The selection process includes Preliminary Exam, Main Exam, and Group Exercise and Interview. Prelims scheduled in June 2026. Apply on sbi.co.in/careers. Salary: Rs 41,960 to 63,840 per month.',
    category: 'jobs',
    article_type: 'news',
    vlog_url: null,
    author_name: 'DreamNexa Editorial',
    is_published: 1,
    is_featured: 0,
  },
  {
    title: 'India GDP Growth: Economy Projected at 7.2% for FY 2026-27',
    description: 'IMF and World Bank project India GDP growth at 7.2% for FY 2026-27, retaining India as the fastest-growing major economy.',
    content: 'International financial institutions reaffirmed India strong economic trajectory. IMF projects real GDP growth at 7.2% for FY 2026-27, driven by robust domestic consumption, services exports, and infrastructure investment. Government capex of Rs 11.11 lakh crore supports growth. India expected to become third-largest economy by 2027.',
    category: 'economy',
    article_type: 'news',
    vlog_url: null,
    author_name: 'DreamNexa Editorial',
    is_published: 1,
    is_featured: 0,
  },
  {
    title: 'NEP 2020: Academic Bank of Credits Now Live at 1,000+ Universities',
    description: 'The National Education Policy 2020 Academic Bank of Credits is now operational, allowing flexible degree programmes across 1,000+ universities.',
    content: 'Ministry of Education confirmed the Academic Bank of Credits under NEP 2020 is now active at over 1,000 universities and autonomous colleges. Students can earn credits across institutions and take flexible entry or exit from degree programmes. Four-year undergraduate programmes with multiple exit options are available at most central universities.',
    category: 'education',
    article_type: 'news',
    vlog_url: null,
    author_name: 'DreamNexa Editorial',
    is_published: 1,
    is_featured: 0,
  },
  {
    title: 'ISRO Chandrayaan-4 Mission: India Aims for Lunar Sample Return by 2028',
    description: 'ISRO announced the Chandrayaan-4 mission design to return lunar soil samples to Earth — a first for India.',
    content: 'Indian Space Research Organisation revealed technical design for Chandrayaan-4. Two separate launch vehicles (LVM3 and PSLV) will place modules in orbit, followed by lunar landing, sample collection, and return to Earth. If successful, India joins the exclusive group of nations that retrieved extraterrestrial material. Launch targeted for 2028.',
    category: 'science',
    article_type: 'news',
    vlog_url: null,
    author_name: 'DreamNexa Editorial',
    is_published: 1,
    is_featured: 0,
  },
  {
    title: 'AI in Indian Education: 150 Universities to Offer B.Tech AI by 2027',
    description: 'UGC approved the B.Tech Artificial Intelligence curriculum framework; 150 universities will start the programme by 2027.',
    content: 'University Grants Commission approved a standardised B.Tech AI and ML curriculum and granted affiliations to 150 universities to start by the 2027 academic year. The 4-year programme covers machine learning, deep learning, NLP, computer vision, and AI ethics. Industry partnerships with Google, Microsoft, and NASSCOM will provide internship pipelines.',
    category: 'technology',
    article_type: 'news',
    vlog_url: null,
    author_name: 'DreamNexa Editorial',
    is_published: 1,
    is_featured: 0,
  },
];

async function seedNewsProduction() {
  let inserted = 0;
  let skipped = 0;
  let fixedVlogs = 0;

  try {
    console.log('\n DreamNexa Production News Seeder');
    console.log('=====================================');
    console.log('Total articles to seed:', NEWS_ARTICLES.length);

    for (const article of NEWS_ARTICLES) {
      const { title, description, content, category, article_type, vlog_url, author_name, is_published, is_featured } = article;

      const existing = await query('SELECT id FROM news_articles WHERE title = $1 LIMIT 1', [title]);

      if (existing.rows.length > 0) {
        console.log('  Skip (exists):', title.substring(0, 70));
        skipped++;
        continue;
      }

      await query(
        'INSERT INTO news_articles (title, description, content, category, article_type, vlog_url, author_name, is_published, is_featured) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [title, description || null, content || null, category, article_type, vlog_url || null, author_name || null, is_published ? 1 : 0, is_featured ? 1 : 0]
      );

      console.log('  Inserted [' + article_type + ']:', title.substring(0, 70));
      inserted++;
    }

    const fixResult = await query(
      "UPDATE news_articles SET vlog_url = 'https://www.youtube.com/watch?v=kqtD5dpn9C8' WHERE article_type = 'vlog' AND (vlog_url IS NULL OR vlog_url = '' OR UPPER(vlog_url) = 'NA' OR vlog_url = 'null' OR vlog_url = 'undefined')",
      []
    );
    fixedVlogs = fixResult.rowCount || 0;
    if (fixedVlogs > 0) console.log('\n  Fixed', fixedVlogs, 'vlog(s) with invalid vlog_url');

    console.log('\n=====================================');
    console.log('Done! Inserted:', inserted, '| Skipped:', skipped, '| Fixed vlog URLs:', fixedVlogs);

    const countRes = await query('SELECT COUNT(*) AS total FROM news_articles WHERE is_published = 1', []);
    console.log('Total published articles in DB:', countRes.rows[0].total);

    process.exit(0);
  } catch (err) {
    console.error('\nSeeding failed:', err.message);
    process.exit(1);
  } finally {
    try { await pool.end(); } catch {}
  }
}

seedNewsProduction();


// ─────────────────────────────────────────────────────────────────────────────
// Module export: seedNewsIfNeeded()
// Called by server.js on every boot to ensure production news content is present.
// Safe to call repeatedly — skips articles that already exist by title.
// ─────────────────────────────────────────────────────────────────────────────
async function seedNewsIfNeeded() {
  const { rows } = await query('SELECT COUNT(*) AS cnt FROM news_articles WHERE is_published = 1', []);
  const count = Number(rows[0]?.cnt || 0);

  // Fix existing vlogs with invalid vlog_url regardless of article count
  await query(
    "UPDATE news_articles SET vlog_url = 'https://www.youtube.com/watch?v=kqtD5dpn9C8' WHERE article_type = 'vlog' AND (vlog_url IS NULL OR vlog_url = '' OR UPPER(vlog_url) = 'NA' OR vlog_url = 'null' OR vlog_url = 'undefined')",
    []
  );

  if (count >= 5) {
    console.log('[seedNews] ' + count + ' articles already present — skipping bulk seed.');
    return;
  }

  console.log('[seedNews] Only ' + count + ' published article(s) found — seeding curated news content...');

  for (const article of NEWS_ARTICLES) {
    const { title, description, content, category, article_type, vlog_url, author_name, is_published, is_featured } = article;
    const existing = await query('SELECT id FROM news_articles WHERE title = $1 LIMIT 1', [title]);
    if (existing.rows.length > 0) continue;
    await query(
      'INSERT INTO news_articles (title, description, content, category, article_type, vlog_url, author_name, is_published, is_featured) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [title, description || null, content || null, category, article_type, vlog_url || null, author_name || null, is_published ? 1 : 0, is_featured ? 1 : 0]
    );
    console.log('[seedNews] Inserted [' + article_type + ']: ' + title.substring(0, 70));
  }
  console.log('[seedNews] News seeding complete.');
}

module.exports = { seedNewsIfNeeded };
