/**
 * seedGovtJobs.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeds active government job notifications. Idempotent — skips any job
 * whose post_name already exists in the DB (case-insensitive match).
 *
 * Run: node src/db/seedGovtJobs.js
 */
'use strict';

require('dotenv').config();
const { query, rawPool } = require('./pool');
const ALL_GOVT_JOBS = require('./allGovtJobsData');

const JOBS = ALL_GOVT_JOBS;

async function seed() {
  console.log('🌱  Seeding Government Jobs Recruitment Data...\n');

  // Fetch existing post names to avoid duplicates
  let existingNames = new Set();
  try {
    const existing = await query('SELECT post_name FROM govt_jobs');
    existingNames = new Set(
      (existing.rows || []).map((r) => (r.post_name || '').toLowerCase().trim())
    );
  } catch (dbErr) {
    console.warn('Could not query existing jobs table:', dbErr.message);
  }

  let inserted = 0;
  let skipped = 0;

  for (const job of JOBS) {
    const key = job.post_name.toLowerCase().trim();
    if (existingNames.has(key)) {
      console.log(`  ⏭  SKIP  [already exists] ${job.post_name}`);
      skipped++;
      continue;
    }

    try {
      await query(
        `INSERT INTO govt_jobs
           (post_name, department, state, district, total_posts, open_date, last_date,
            eligibility, age_limit, salary_scale, application_fee, selection_process,
            official_notification_url, apply_online_url, vlog_url, image_url,
            is_published, is_featured, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         RETURNING id`,
        [
          job.post_name, job.department, job.state, job.district || '',
          job.total_posts || 0, job.open_date, job.last_date,
          job.eligibility || '', job.age_limit || '', job.salary_scale || '',
          job.application_fee || '', job.selection_process || '',
          job.official_notification_url || '', job.apply_online_url || '',
          job.vlog_url || null, job.image_url || '',
          job.is_published ? 1 : 0, job.is_featured ? 1 : 0, job.description || '',
        ]
      );
      console.log(`  ✅  INSERTED  [${job.state}] ${job.post_name}`);
      inserted++;
      existingNames.add(key);
    } catch (err) {
      console.error(`  ❌  ERROR inserting ${job.post_name}: ${err.message}`);
    }
  }

  console.log(`\n✅ Done! ${inserted} inserted, ${skipped} skipped.`);
  try {
    await rawPool.end();
  } catch (_) {}
}

seed().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
