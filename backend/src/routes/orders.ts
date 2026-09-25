import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// ─── GET /api/orders ───────────────────────────────────────
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    let orders;

    if (role === 'FARMER') {
      const farmerProfile = await prisma.farmerProfile.findUnique({ where: { userId } });
      if (!farmerProfile) return res.status(404).json({ error: 'Farmer profile not found' });

      orders = await prisma.order.findMany({
        where: { farmerId: farmerProfile.id },
        include: {
          buyer: true,
          listing: { include: { images: true } },
          deliveryPartner: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (role === 'BUYER') {
      const buyerProfile = await prisma.buyerProfile.findUnique({ where: { userId } });
      if (!buyerProfile) return res.status(404).json({ error: 'Buyer profile not found' });

      orders = await prisma.order.findMany({
        where: { buyerId: buyerProfile.id },
        include: {
          farmer: true,
          listing: { include: { images: true } },
          deliveryPartner: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/orders/:orderId ──────────────────────────────
router.get('/:orderId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        farmer: true,
        buyer: true,
        listing: { include: { images: true, analysis: true } },
        deliveryPartner: true,
        checkpoints: { orderBy: { timestamp: 'desc' } }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization
    if (role === 'FARMER') {
      const farmerProfile = await prisma.farmerProfile.findUnique({ where: { userId } });
      if (order.farmerId !== farmerProfile?.id) return res.status(403).json({ error: 'Unauthorized' });
    } else if (role === 'BUYER') {
      const buyerProfile = await prisma.buyerProfile.findUnique({ where: { userId } });
      if (order.buyerId !== buyerProfile?.id) return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

export default router;
