require('dotenv').config();
const { query, rawPool } = require('./pool');
const ALL_GOVT_JOBS = require('./allGovtJobsData');

const LATEST_JOBS = ALL_GOVT_JOBS;

async function run() {
  console.log('Starting govt jobs update...');
  let res;
  let existing = new Set();
  try {
    res = await query('SELECT post_name FROM govt_jobs');
    existing = new Set((res.rows || []).map(r => (r.post_name || '').toLowerCase().trim()));
  } catch (dbErr) {
    console.warn('Could not query govt_jobs:', dbErr.message);
  }

  let ins = 0, skip = 0, err = 0;
  for (const j of LATEST_JOBS) {
    const k = j.post_name.toLowerCase().trim();
    if (existing.has(k)) { console.log('  SKIP: ' + j.post_name); skip++; continue; }
    try {
      await query(
        'INSERT INTO govt_jobs (post_name,department,state,district,total_posts,open_date,last_date,eligibility,age_limit,salary_scale,application_fee,selection_process,official_notification_url,apply_online_url,vlog_url,image_url,is_published,is_featured,description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)',
        [j.post_name, j.department, j.state, j.district || '', j.total_posts || 0, j.open_date, j.last_date, j.eligibility || '', j.age_limit || '', j.salary_scale || '', j.application_fee || '', j.selection_process || '', j.official_notification_url || '', j.apply_online_url || '', j.vlog_url || null, j.image_url || '', j.is_published ? 1 : 0, j.is_featured ? 1 : 0, j.description || '']
      );
      console.log('  INSERTED: ' + j.post_name); ins++;
    } catch (e) { console.error('  ERROR: ' + j.post_name + ' — ' + e.message); err++; }
  }
  console.log('Done! ' + ins + ' inserted, ' + skip + ' skipped, ' + err + ' errors.');
  try { await rawPool.end(); } catch (_) {}
}
run().catch(e => { console.error(e); process.exit(1); });
