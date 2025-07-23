import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import transactionRoutes from './routes/transaction';
import userRoutes from './routes/user';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

app.use('/auth', authRoutes);
app.use('/transaction', authMiddleware, transactionRoutes);
app.use('/user', authMiddleware, userRoutes);

// Start server
app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});