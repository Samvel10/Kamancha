require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const {
  helmetMiddleware,
  globalLimiter,
  mongoSanitize,
  httpsRedirect,
} = require('./middleware/security');

const menuRoutes = require('./routes/menu');
const reservationRoutes = require('./routes/reservations');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const galleryRoutes = require('./routes/gallery');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const staffRoutes = require('./routes/staff');
const feedbackRoutes = require('./routes/feedback');

const app = express();

app.set('trust proxy', 1);

app.use(httpsRedirect);
app.use(helmetMiddleware);
app.use(globalLimiter);
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/menu', menuRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(status).json({ error: message });
});

module.exports = app;
