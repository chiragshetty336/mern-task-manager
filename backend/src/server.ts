import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');

import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response): void => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err: Error) => console.error('MongoDB connection error:', err));

const PORT: number = parseInt(process.env.PORT as string) || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});