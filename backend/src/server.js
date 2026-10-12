require('dotenv').config();
const http = require('http');
const app = require('./app');
const { startScheduler } = require('./utils/scheduler');
const { startScheduledBackups, performBackup } = require('./utils/autoBackup');
const { initSocket } = require('./socket');
const { runMigrations } = require('./db/migrate');
const { seedIfEmpty } = require('./db/seed');

const PORT = process.env.PORT || 5000;

// Every schema file uses CREATE TABLE IF NOT EXISTS, so running migrations
// on every boot is safe and guarantees the app never silently falls back
// to demo/mock data because a migration step was skipped (Cloud Run, Vercel,
// a fresh clone, `npm start` before `npm run migrate`, etc.).
async function bootstrapDatabase() {
  await runMigrations();
  if (process.env.SEED_ON_BOOT !== 'false') {
    try {
      await seedIfEmpty();
    } catch (err) {
      console.error('[seed] seedIfEmpty failed (continuing to boot anyway):', err.message);
    }
  }
}

if (require.main === module) {
  bootstrapDatabase()
    .catch((err) => {
      console.error('⚠ Database bootstrap warning (server will continue running):', err.message);
    })
    .finally(() => {
      const server = http.createServer(app);
      const io = initSocket(server);
      app.set('io', io);

      server.listen(PORT, () => {
        console.log(`🎓 DreamNexa backend running on http://localhost:${PORT}`);
        if (process.env.VERCEL !== '1') {
          startScheduler();
          startScheduledBackups();
          performBackup('Server Boot').catch((err) => {
            console.error('[AutoBackup] Server boot backup failed:', err.message);
          });
        }
      });
    });
}

module.exports = app;
