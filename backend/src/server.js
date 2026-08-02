require('dotenv').config();
const app = require('./app');
const { startScheduler } = require('./utils/scheduler');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🎓 QuizArena backend running on http://localhost:${PORT}`);
  startScheduler();
});
