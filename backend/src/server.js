require('dotenv').config();
const app = require('./app');
const { startScheduler } = require('./utils/scheduler');

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🎓 QuizArena backend running on http://localhost:${PORT}`);
    if (process.env.VERCEL !== '1') {
      startScheduler();
    }
  });
}

module.exports = app;
