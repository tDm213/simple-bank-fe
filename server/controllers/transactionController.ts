// controllers/transactionController.ts
import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const sendMoney = async (req: AuthRequest, res: Response) => {
  const senderId = req.userId;
  let { recipientUsername, amount } = req.body;

  amount = parseFloat(amount); // ✅ Convert to float
  if (!recipientUsername || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  amount = Math.round(amount * 100) / 100; // ✅ Round to 2 decimals

  try {
    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    const recipient = await prisma.user.findUnique({ where: { username: recipientUsername } });

    if (!sender || !recipient) {
      return res.status(404).json({ error: 'Sender or recipient not found' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: sender.id },
        data: { balance: { decrement: amount } },
      }),
      prisma.user.update({
        where: { id: recipient.id },
        data: { balance: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          fromUserId: sender.id,
          toUserId: recipient.id,
          amount,
          status: 'completed',
          type: 'send',
        },
      }),
    ]);

    res.json({ message: `Sent $${amount} to ${recipient.username}` });
  } catch (err) {
    console.error('Send money error:', err);
    res.status(500).json({ error: 'Failed to send money' });
  }
};

export const requestMoney = async (req: AuthRequest, res: Response) => {
  const fromUserId = req.userId;
  let { recipientUsername, amount } = req.body;

  amount = parseFloat(amount); // ✅ Convert to float
  if (!recipientUsername || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  amount = Math.round(amount * 100) / 100; // ✅ Round to 2 decimals

  const toUser = await prisma.user.findUnique({ where: { username: recipientUsername } });
  if (!toUser) return res.status(404).json({ error: 'User not found' });

  await prisma.transaction.create({
    data: {
      fromUserId,
      toUserId: toUser.id,
      amount,
      status: 'pending',
      type: 'request',
    },
  });

  res.json({ message: `Request of $${amount} sent to ${recipientUsername}` });
};


export const getPendingRequests = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  const requests = await prisma.transaction.findMany({
    where: {
      toUserId: userId,
      type: 'request',
      status: 'pending',
    },
    include: {
      fromUser: true,
    },
  });

  res.json(requests);
};

export const approveRequest = async (req: AuthRequest, res: Response) => {
  const toUserId = req.userId;
  const { requestId } = req.body;

  const request = await prisma.transaction.findUnique({ where: { id: requestId } });
  if (!request || request.toUserId !== toUserId || request.status !== 'pending') {
    return res.status(400).json({ error: 'Invalid or unauthorized request' });
  }

  const fromUser = await prisma.user.findUnique({ where: { id: request.fromUserId! } });
  const toUser = await prisma.user.findUnique({ where: { id: request.toUserId! } });

  if (!toUser || !fromUser || toUser.balance < request.amount) {
    return res.status(400).json({ error: 'Insufficient balance or users not found' });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: toUser.id },
      data: { balance: { decrement: request.amount } },
    }),
    prisma.user.update({
      where: { id: fromUser.id },
      data: { balance: { increment: request.amount } },
    }),
    prisma.transaction.update({
      where: { id: request.id },
      data: { status: 'completed' },
    }),
  ]);

  res.json({ message: 'Request approved and money transferred' });
};

export const rejectRequest = async (req: AuthRequest, res: Response) => {
  const toUserId = req.userId;
  const { requestId } = req.body;

  const request = await prisma.transaction.findUnique({ where: { id: requestId } });
  if (!request || request.toUserId !== toUserId || request.status !== 'pending') {
    return res.status(400).json({ error: 'Invalid or unauthorized request' });
  }

  await prisma.transaction.update({
    where: { id: request.id },
    data: { status: 'rejected' },
  });

  res.json({ message: 'Request rejected' });
};

export const getTransactionHistory = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { fromUserId: userId },
        { toUserId: userId },
      ],
    },
    include: {
      fromUser: true,
      toUser: true,
    },
    orderBy: {
      timestamp: 'desc',
    },
  });

  const history = transactions.map((tx : any) => ({
    id: tx.id,
    type: tx.type,
    status: tx.status,
    amount: tx.amount,
    timestamp: tx.timestamp,
    from: tx.fromUser?.username || 'N/A',
    to: tx.toUser?.username || 'N/A',
  }));

  res.json(history);
};