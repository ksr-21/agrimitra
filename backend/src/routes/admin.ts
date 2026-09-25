import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);
router.use(roleGuard('ADMIN'));

// ─── GET /api/admin/dashboard ──────────────────────────────
router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalFarmers = await prisma.user.count({ where: { role: 'FARMER' } });
    const totalBuyers = await prisma.user.count({ where: { role: 'BUYER' } });
    
    const pendingKYC = await prisma.buyerProfile.count({ where: { kycStatus: 'PENDING' } });
    const openDisputes = await prisma.dispute.count({ where: { status: 'OPEN' } });
    
    const activeOrders = await prisma.order.count({ 
      where: { status: { in: ['CONFIRMED', 'PICKUP_SCHEDULED', 'IN_TRANSIT'] } } 
    });

    res.json({
      stats: {
        totalFarmers,
        totalBuyers,
        pendingKYC,
        openDisputes,
        activeOrders
      }
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/admin/kyc ────────────────────────────────────
router.get('/kyc', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profiles = await prisma.buyerProfile.findMany({
      where: { kycStatus: 'PENDING' },
      include: { user: { select: { phone: true, email: true } } },
      orderBy: { updatedAt: 'asc' }
    });
    res.json({ profiles });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/admin/kyc/:id/resolve ───────────────────────
router.post('/kyc/:id/resolve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const profile = await prisma.buyerProfile.update({
      where: { id },
      data: {
        kycStatus: status,
        kycReviewNotes: notes,
        kycReviewedAt: new Date()
      }
    });

    res.json({ message: `KYC ${status.toLowerCase()}`, profile });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/admin/disputes ───────────────────────────────
router.get('/disputes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const disputes = await prisma.dispute.findMany({
      where: { status: 'OPEN' },
      include: {
        order: { include: { farmer: true, buyer: true } },
        raisedBy: { select: { phone: true, role: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ disputes });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/admin/disputes/:id/resolve ──────────────────
router.post('/disputes/:id/resolve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { resolution, adminNotes } = req.body;

    const dispute = await prisma.dispute.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolution,
        adminNotes,
        resolvedAt: new Date()
      }
    });

    // Also update order status if needed based on resolution
    // For MVP, we'll just mark order as COMPLETED if resolved
    await prisma.order.update({
      where: { id: dispute.orderId },
      data: { status: 'COMPLETED' }
    });

    res.json({ message: 'Dispute resolved', dispute });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/admin/buyers ─────────────────────────────────
router.get('/buyers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buyers = await prisma.user.findMany({
      where: { role: 'BUYER' },
      include: { buyerProfile: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ buyers });
  } catch (error) {
    next(error);
  }
});

export default router;
