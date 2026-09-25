import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { upload } from '../middleware/upload';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);
router.use(roleGuard('DELIVERY'));

// ─── GET /api/delivery/dashboard ───────────────────────────
router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    
    const deliveryProfile = await prisma.deliveryProfile.findUnique({
      where: { userId },
    });

    if (!deliveryProfile) {
      res.status(404).json({ error: 'Delivery profile not found' });
      return;
    }

    // Orders currently assigned to this delivery partner (active)
    const activeOrders = await prisma.order.findMany({
      where: { 
        deliveryPartnerId: deliveryProfile.id,
        status: { in: ['PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT'] }
      },
      include: {
        farmer: true,
        buyer: true,
        listing: true,
      }
    });

    // Orders available to be picked up (CONFIRMED but no delivery partner yet)
    // In a real app, this would be filtered by radius/location
    const availableOrders = await prisma.order.findMany({
      where: {
        status: 'CONFIRMED',
        deliveryPartnerId: null
      },
      include: {
        farmer: true,
        buyer: true,
        listing: true,
      },
      take: 10, // Limit for MVP
    });

    res.json({
      profile: deliveryProfile,
      activeOrders,
      availableOrders,
    });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/delivery/orders/:orderId/accept ─────────────
router.post('/orders/:orderId/accept', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const userId = req.user!.userId;

    const deliveryProfile = await prisma.deliveryProfile.findUnique({ where: { userId } });
    if (!deliveryProfile) return res.status(404).json({ error: 'Delivery profile not found' });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.status !== 'CONFIRMED' || order.deliveryPartnerId) {
      return res.status(400).json({ error: 'Order is not available for delivery' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryPartnerId: deliveryProfile.id,
        status: 'PICKUP_SCHEDULED',
      }
    });

    res.json({ message: 'Delivery job accepted', order: updatedOrder });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/delivery/orders/:orderId/status ─────────────
// Requires multipart/form-data for photo uploads on checkpoints
router.post('/orders/:orderId/status', upload.single('photo'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const userId = req.user!.userId;
    const { status, condition, notes, latitude, longitude } = req.body;

    const deliveryProfile = await prisma.deliveryProfile.findUnique({ where: { userId } });
    if (!deliveryProfile) return res.status(404).json({ error: 'Delivery profile not found' });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.deliveryPartnerId !== deliveryProfile.id) {
      return res.status(403).json({ error: 'Unauthorized or order not found' });
    }

    const validStatuses = ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status update' });
    }

    // Require photo for PICKED_UP and DELIVERED
    let photoUrl = '';
    if ((status === 'PICKED_UP' || status === 'DELIVERED') && req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    } else if (status === 'PICKED_UP' || status === 'DELIVERED') {
      return res.status(400).json({ error: 'Photo verification is required for this status update' });
    }

    const transactionData = [];

    // 1. Update Order Status
    transactionData.push(
      prisma.order.update({
        where: { id: orderId },
        data: { 
          status,
          ...(status === 'DELIVERED' ? { completedAt: new Date() } : {})
        }
      })
    );

    // 2. Create Checkpoint if applicable
    if (status === 'PICKED_UP' || status === 'DELIVERED') {
      transactionData.push(
        prisma.deliveryCheckpoint.create({
          data: {
            orderId,
            type: status === 'PICKED_UP' ? 'PICKUP' : 'DELIVERY',
            photoUrl,
            condition: condition || 'good',
            notes: notes || '',
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
          }
        })
      );
    }

    await prisma.$transaction(transactionData);

    res.json({ message: `Order status updated to ${status}` });
  } catch (error) {
    next(error);
  }
});

export default router;
