import express from "express";
import authRoutes from './v1/routes/auth.route.js';
import mediaRoutes from './v1/routes/media.route.js';

const app = express();
app.use(express.json());

app.use('/api/v1', authRoutes);
app.use('/api/v1', mediaRoutes);

export { app };