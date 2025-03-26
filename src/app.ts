import express from "express";
import authRoutes from './routes/auth.route.js'

const app = express();
app.use(express.json());

app.use('/api/v1', authRoutes);

export { app };