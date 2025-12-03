import 'dotenv/config';

console.log('=================================');
console.log('🔥 ALL ENV VARS:');
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 30) + '...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('=================================');

import express from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import authRoutes from './routes/authRoutes'
import projectRoutes from './routes/projectRoutes'
import frameRoutes from './routes/frameRoutes'
import chatRoute from './routes/chatRoute'
import subscriptionRoutes from './routes/subscriptionRoutes'
import { prisma } from './utils/prisma'

const app = express();

const corsOrigin = process.env.CLIENT_URL || "http://localhost:3000";
const allowedOrigins = (process.env.ALLOWED_ORIGINS || corsOrigin)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
console.log('🔥 CORS ALLOWED ORIGINS:', allowedOrigins);

// Middlewares
app.use(express.json());
app.use(hpp());
app.use(helmet());

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        console.warn('❌ CORS blocked origin:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

console.log('✅ CORS middleware configured');

// Add this middleware to log EVERY request
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    const oldSend = res.send;
    res.send = function(data) {
        console.log('📤 Response headers:', res.getHeaders());
        return oldSend.call(this, data);
    };
    next();
});

// Routes
app.use('/health', (req, res) => {
    res.json({ status: "OK", message: "Server is working" });
});
app.get('/health', async (req, res) => {
    try {
        // Simple DB connectivity check
        // @ts-ignore
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', db: true });
    } catch (e: any) {
        console.error('❌ Healthz DB check failed:', e);
        res.status(500).json({ status: 'degraded', db: false, error: e?.message || 'db_error' });
    }
});
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/frames', frameRoutes)
app.use('/api/chat', chatRoute)
app.use('/api/subscriptions', subscriptionRoutes)

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = err?.status || 500;
  const message = err?.message || 'Internal Server Error';
  console.error('🔥 Unhandled error:', { status, message, stack: err?.stack });
  res.status(status).json({ success: false, message });
});

const PORT = process.env.PORT || 4000;
//@ts-ignore
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`✅ Server started on port ${PORT}`);
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  }
});