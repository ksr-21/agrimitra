import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { ensureUploadDir } from './utils/storage';
import authRoutes from './routes/auth';
import farmerRoutes from './routes/farmer';
import buyerRoutes from './routes/buyer';
import listingRoutes from './routes/listings';
import orderRoutes from './routes/orders';
import deliveryRoutes from './routes/delivery';
import reviewRoutes from './routes/reviews';
import disputeRoutes from './routes/disputes';
import adminRoutes from './routes/admin';

// Ensure upload directory exists
ensureUploadDir();

const app = express();

// ─── Middleware ──────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

// ─── Health Check ───────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'agrimitra-backend',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ─── Routes (will be added in Phase 2+) ─────────────────
app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/disputes', disputeRoutes);
// app.use('/api/notifications', notificationRoutes);

// ─── Error Handler ──────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`\n🌾 Agrimitra Backend running on http://localhost:${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Health check: http://localhost:${env.PORT}/api/health\n`);
});

export default app;
