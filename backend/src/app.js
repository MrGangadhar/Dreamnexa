const express = require('express');
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
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://dreamnexa.vercel.app',
  'https://www.dreamnexa.vercel.app',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])
].filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

const globalLimiter = rateLimit({ windowMs: 60 * 1000, max: 300 });
app.use('/api', globalLimiter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'quizarena-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/news', newsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

