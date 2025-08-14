import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

export const signup = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log('Signup request:', { username, passwordLength: password?.length });

  if (!username || !password) {
    console.log('Signup failed: missing username or password');
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      console.log('Signup failed: username taken');
      return res.status(400).json({ error: 'Username taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, balance: 100 },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    console.log('Signup success:', { userId: user.id });
    res.json({ token });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed', details: err });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log('Login request:', { username, passwordLength: password?.length });

  if (!username || !password) {
    console.log('Login failed: missing username or password');
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      console.log('Login failed: user not found');
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: wrong password');
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    console.log('Login success:', { userId: user.id });
    res.json({ token });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err });
  }
};
