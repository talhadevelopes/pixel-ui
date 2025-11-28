import dotenv from 'dotenv';
dotenv.config();
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

// Middlewares
app.use(express.json());
app.use(hpp());
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));

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
  console.log(`Server started on port ${PORT}`);
  try {
    await prisma.$connect();
    console.log('Database connected');
  } catch (err) {
    console.error('Database connection failed:', err);
  }
});