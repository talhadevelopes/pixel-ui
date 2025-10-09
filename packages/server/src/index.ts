import dotenv from 'dotenv';

import express from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import authRoutes from './routes/authRoutes'
import projectRoutes from './routes/projectRoutes'

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});