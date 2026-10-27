import 'dotenv/config';
import express from 'express';
import authRoutes from './v1/routes/auth.route.js';
import mediaRoutes from './v1/routes/media.route.js';
import recommendations from './v1/routes/recommendations.js';
import cors from 'cors'

const app = express();

// Cors config
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

app.use('/api/v1', authRoutes);
app.use('/api/v1', recommendations);
app.use('/api/v1', mediaRoutes);


export { app };
