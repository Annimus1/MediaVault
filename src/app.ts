import express from 'express';
import authRoutes from './v1/routes/auth.route.js';
import mediaRoutes from './v1/routes/media.route.js';
import cors from 'cors'

const app = express();

// Cors config
app.use(cors({
    origin: 'https://media-vault-ui.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

app.use('/api/v1', authRoutes);
app.use('/api/v1', mediaRoutes);

export { app };
