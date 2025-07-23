import express from 'express';
import {
  sendMoney,
  requestMoney,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getTransactionHistory,
} from '../controllers/transactionController';

const router = express.Router();

router.post('/send', sendMoney);
router.post('/request', requestMoney);
router.get('/requests', getPendingRequests);
router.post('/request/approve', approveRequest);
router.post('/request/reject', rejectRequest);
router.get('/history', getTransactionHistory);

export default router;