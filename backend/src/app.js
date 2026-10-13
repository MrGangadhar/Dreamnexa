const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const contestRoutes = require('./routes/contestRoutes');
const quizRoutes = require('./routes/quizRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const newsRoutes = require('./routes/newsRoutes');
const govtJobsRoutes  = require('./routes/govtJobsRoutes');
const walletRoutes = require('./routes/walletRoutes');
const proctoringRoutes = require('./routes/proctoringRoutes');
const uploadRoutes    = require('./routes/uploadRoutes');
const backupRoutes    = require('./routes/backupRoutes');
const currentAffairsRoutes = require('./routes/currentAffairsRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://dreamnexa-flame.vercel.app',
  'https://dreamnexa.vercel.app',
  'https://www.dreamnexa.vercel.app',
  'https://dreamnexa.in',
  'https://www.dreamnexa.in',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
  ...(process.env.CLIENT_URL_2 ? [process.env.CLIENT_URL_2] : []),
].filter(Boolean);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin) and known client origins only
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    // Allow any Vercel preview deployment for this specific project only
    // (preview URLs follow the pattern dreamnexa-*-*.vercel.app)
    if (origin.match(/^https:\/\/dreamnexa-[a-z0-9-]+-[a-z0-9-]+\.vercel\.app$/)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, '../uploads')));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

const globalLimiter = rateLimit({ windowMs: 60 * 1000, max: 1200 });
app.use('/api', globalLimiter);

app.get('/', (req, res) => res.json({ status: 'ok', service: 'dreamnexa-backend' }));
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'dreamnexa-backend' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'dreamnexa-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', (req, res, next) => {
  // Shorthand: POST /api/contact → userController.submitContactForm
  if (req.method === 'POST') {
    return require('./controllers/userController').submitContactForm(req, res, next);
  }
  res.status(405).json({ error: 'Method not allowed' });
});
app.use('/api/contests', contestRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/jobs',      govtJobsRoutes);
app.use('/jobs',          govtJobsRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/proctoring', proctoringRoutes);
app.use('/api/upload',    uploadRoutes);
app.use('/api/admin/backup', backupRoutes);
app.use('/api/current-affairs', currentAffairsRoutes);


app.use(notFound);
app.use(errorHandler);

module.exports = app;

