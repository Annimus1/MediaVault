import express from "express";
import authRoutes from './routes/auth.route.js';
import mediaRoutes from './routes/media.route.js';

const app = express();
app.use(express.json());

app.use('/api/v1', authRoutes);
app.use('/api/v1', mediaRoutes);

export { app };