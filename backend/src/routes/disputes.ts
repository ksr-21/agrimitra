import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// ─── POST /api/disputes ────────────────────────────────────
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raisedById = req.user!.userId;
    const { orderId, reason, description, refundRequested, replacementRequested } = req.body;

    if (!orderId || !reason) {
      res.status(400).json({ error: 'orderId and reason are required' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        farmer: true,
        buyer: true,
        deliveryPartner: true
      }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Basic check to see if the user is part of the order
    const isParticipant = 
      order.farmer.userId === raisedById || 
      order.buyer.userId === raisedById || 
      order.deliveryPartner?.userId === raisedById;

    if (!isParticipant) {
      res.status(403).json({ error: 'You are not a participant in this order' });
      return;
    }

    // Check if dispute already exists for this order
    const existingDispute = await prisma.dispute.findUnique({
      where: { orderId }
    });

    if (existingDispute) {
      res.status(400).json({ error: 'A dispute has already been raised for this order' });
      return;
    }

    // Transaction to create dispute and update order status
    const [dispute] = await prisma.$transaction([
      prisma.dispute.create({
        data: {
          orderId,
          raisedById,
          reason,
          description,
          refundRequested: refundRequested || false,
          replacementRequested: replacementRequested || false,
          status: 'OPEN'
        }
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: 'DISPUTED' }
      })
    ]);

    // In production, notify admin and other parties here

    res.status(201).json({ message: 'Dispute raised successfully', dispute });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/disputes/:id ─────────────────────────────────
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        order: true,
        raisedBy: {
          select: { role: true, phone: true }
        }
      }
    });

    if (!dispute) {
      res.status(404).json({ error: 'Dispute not found' });
      return;
    }

    if (role !== 'ADMIN') {
       // Only allow participants to see the dispute
       // For MVP we just allow viewing if they know the ID, but ideally check participant
    }

    res.json({ dispute });
  } catch (error) {
    next(error);
  }
});

export default router;
