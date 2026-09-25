import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// ─── POST /api/reviews ─────────────────────────────────────
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviewerId = req.user!.userId;
    const { orderId, revieweeId, rating, comment } = req.body;

    if (!orderId || !revieweeId || !rating) {
      res.status(400).json({ error: 'orderId, revieweeId, and rating are required' });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    // Verify order is completed or delivered
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || !['DELIVERED', 'COMPLETED'].includes(order.status)) {
      res.status(400).json({ error: 'Reviews can only be given for completed orders' });
      return;
    }

    // Ensure they haven't already reviewed this person for this order
    const existingReview = await prisma.review.findUnique({
      where: {
        orderId_reviewerId: {
          orderId,
          reviewerId
        }
      }
    });

    if (existingReview) {
      res.status(400).json({ error: 'You have already submitted a review for this order' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        orderId,
        reviewerId,
        revieweeId,
        rating: parseInt(rating, 10),
        comment
      }
    });

    // In a production system, we would trigger an async job to recalculate the reviewee's Trust Score
    // For MVP, we simply log a trust score event placeholder
    await prisma.trustScoreEvent.create({
      data: {
        userId: revieweeId,
        eventType: 'review',
        scoreDelta: rating >= 4 ? 0.1 : (rating <= 2 ? -0.2 : 0),
        newScore: 0, // Placeholder, requires full recalc logic
        referenceId: review.id,
        reason: 'New user review submitted'
      }
    });

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/reviews/:userId ──────────────────────────────
router.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: { role: true } // Don't expose all user info
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ reviews });
  } catch (error) {
    next(error);
  }
});

export default router;
