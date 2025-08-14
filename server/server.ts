import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transaction';
import userRoutes from './routes/user';
import { authMiddleware } from './middleware/auth';

dotenv.config();
const app = express();

// Logger
app.use((req, res, next) => {
    console.log(`📩 ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.method !== 'GET') console.log('Body:', req.body);
    next();
});

// CORS
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET','POST','PUT','DELETE'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/user', authMiddleware, userRoutes);

// Optional: serve frontend (if you want)
// app.use(express.static(path.join(__dirname, '../public')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Backend running at http://localhost:${PORT}`);
});
