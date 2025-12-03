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
console.log('🔥 CORS ORIGIN BEING USED:', corsOrigin);

// Middlewares
app.use(express.json());
app.use(hpp());
app.use(helmet());

app.use(cors({
    origin: corsOrigin,
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
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/frames', frameRoutes)
app.use('/api/chat', chatRoute)
app.use('/api/subscriptions', subscriptionRoutes)

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