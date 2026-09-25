import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';

const router = express.Router();
const prisma = new PrismaClient();

// Use auth and roleGuard for all routes in this file
router.use(authMiddleware);
router.use(roleGuard('FARMER'));

// ─── GET /api/farmer/dashboard ─────────────────────────────
// Returns key stats for the farmer dashboard
router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    
    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId },
    });

    if (!farmerProfile) {
      res.status(404).json({ error: 'Farmer profile not found' });
      return;
    }

    const activeListingsCount = await prisma.listing.count({
      where: { farmerId: farmerProfile.id, status: 'ACTIVE' },
    });

    const pendingOrdersCount = await prisma.order.count({
      where: { farmerId: farmerProfile.id, status: { in: ['CONFIRMED', 'PICKUP_SCHEDULED'] } },
    });

    const recentListings = await prisma.listing.findMany({
      where: { farmerId: farmerProfile.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        images: {
          where: { isPrimary: true },
        },
      }
    });

    res.json({
      profile: farmerProfile,
      stats: {
        activeListings: activeListingsCount,
        pendingOrders: pendingOrdersCount,
      },
      recentListings,
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/farmer/listings ──────────────────────────────
// Returns all listings for the farmer
router.get('/listings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    
    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId },
    });

    if (!farmerProfile) {
      res.status(404).json({ error: 'Farmer profile not found' });
      return;
    }

    const listings = await prisma.listing.findMany({
      where: { farmerId: farmerProfile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
        analysis: true,
      }
    });

    res.json({ listings });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/farmer/bids ──────────────────────────────────
// View bids placed on the farmer's listings
router.get('/bids', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    
    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId },
    });

    if (!farmerProfile) {
      res.status(404).json({ error: 'Farmer profile not found' });
      return;
    }

    const bids = await prisma.bid.findMany({
      where: {
        listing: { farmerId: farmerProfile.id }
      },
      include: {
        buyer: true,
        listing: {
          include: { images: true, analysis: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ bids });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/farmer/bids/:bidId/accept ───────────────────
router.post('/bids/:bidId/accept', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bidId } = req.params;
    const userId = req.user!.userId;

    const farmerProfile = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmerProfile) {
      res.status(404).json({ error: 'Farmer profile not found' });
      return;
    }

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { listing: true }
    });

    if (!bid || bid.listing.farmerId !== farmerProfile.id) {
      res.status(404).json({ error: 'Bid not found or unauthorized' });
      return;
    }

    if (bid.status !== 'PENDING') {
      res.status(400).json({ error: 'Only pending bids can be accepted' });
      return;
    }

    // Accept bid and create order in a transaction
    const [updatedBid, order] = await prisma.$transaction([
      prisma.bid.update({
        where: { id: bidId },
        data: { status: 'ACCEPTED' }
      }),
      prisma.order.create({
        data: {
          listingId: bid.listingId,
          bidId: bid.id,
          buyerId: bid.buyerId, // The bid has buyerId
          farmerId: bid.listing.farmerId,
          totalAmount: bid.bidPrice * bid.quantity,
          status: 'CONFIRMED'
        }
      }),
      // Optionally update listing status
      prisma.listing.update({
        where: { id: bid.listingId },
        data: { status: 'SOLD' } // For v1, assuming entire listing is sold
      })
    ]);

    res.json({ message: 'Bid accepted and order created', order });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/farmer/bids/:bidId/reject ───────────────────
router.post('/bids/:bidId/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bidId } = req.params;
    const userId = req.user!.userId;

    const farmerProfile = await prisma.farmerProfile.findUnique({ where: { userId } });
    
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { listing: true }
    });

    if (!farmerProfile || !bid || bid.listing.farmerId !== farmerProfile.id) {
      res.status(404).json({ error: 'Bid not found or unauthorized' });
      return;
    }

    const updatedBid = await prisma.bid.update({
      where: { id: bidId },
      data: { status: 'REJECTED' }
    });

    res.json({ message: 'Bid rejected', bid: updatedBid });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/farmer/buyers ────────────────────────────────
// List buyer requirements so farmers can connect with them / send quotes
router.get('/buyers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requirements = await prisma.buyerRequirement.findMany({
      where: { isActive: true },
      include: { buyer: { include: { user: { select: { phone: true, email: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ buyers: requirements }); // keeping key as 'buyers' to avoid breaking frontend immediately
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/farmer/requirements/:id/bid ─────────────────
// Farmer sends a quote (bid) for a buyer's requirement
router.post('/requirements/:id/bid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: requirementId } = req.params;
    const { bidPrice, quantity, message } = req.body;
    const userId = req.user!.userId;

    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId }
    });

    if (!farmerProfile) {
      res.status(404).json({ error: 'Farmer profile not found' });
      return;
    }

    const requirement = await prisma.buyerRequirement.findUnique({
      where: { id: requirementId }
    });

    if (!requirement) {
      res.status(404).json({ error: 'Requirement not found' });
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    const bid = await prisma.bid.create({
      data: {
        buyerId: requirement.buyerId,
        requirementId: requirement.id,
        farmerId: farmerProfile.id,
        bidPrice: parseFloat(bidPrice),
        quantity: parseFloat(quantity),
        message,
        expiresAt
      }
    });

    res.json({ message: 'Quote sent successfully', bid });
  } catch (error) {
    next(error);
  }
});

export default router;
