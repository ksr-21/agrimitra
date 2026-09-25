import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { upload } from '../middleware/upload';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);
router.use(roleGuard('BUYER'));

// ─── GET /api/buyer/dashboard ──────────────────────────────
router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId },
    });

    if (!buyerProfile) {
      res.status(404).json({ error: 'Buyer profile not found' });
      return;
    }

    const activeBidsCount = await prisma.bid.count({
      where: { buyerId: buyerProfile.id, status: 'PENDING' },
    });

    const pendingOrdersCount = await prisma.order.count({
      where: { buyerId: buyerProfile.id, status: { in: ['CONFIRMED', 'PICKUP_SCHEDULED', 'IN_TRANSIT'] } },
    });

    const recentBids = await prisma.bid.findMany({
      where: { buyerId: buyerProfile.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        listing: {
          include: { images: true }
        }
      }
    });

    res.json({
      profile: buyerProfile,
      stats: {
        activeBids: activeBidsCount,
        pendingOrders: pendingOrdersCount,
      },
      recentBids,
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/buyer/market ─────────────────────────────────
// Browse all active listings
router.get('/market', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cropType } = req.query;

    const listings = await prisma.listing.findMany({
      where: { 
        status: 'ACTIVE',
        ...(cropType && typeof cropType === 'string' ? { cropType: { contains: cropType } } : {})
      },
      orderBy: { createdAt: 'desc' },
      include: {
        farmer: true,
        images: {
          where: { isPrimary: true },
        },
        analysis: true,
      }
    });

    res.json({ listings });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/buyer/bids ──────────────────────────────────
router.post('/bids', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { listingId, bidPrice, quantity, message } = req.body;

    if (!listingId || !bidPrice || !quantity) {
      res.status(400).json({ error: 'Missing required bid fields' });
      return;
    }

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId },
    });

    if (!buyerProfile) {
      res.status(404).json({ error: 'Buyer profile not found' });
      return;
    }

    // Check KYC
    if (buyerProfile.kycStatus !== 'APPROVED') {
      res.status(403).json({ error: 'KYC must be approved to place a bid' });
      return;
    }

    const bid = await prisma.bid.create({
      data: {
        buyerId: buyerProfile.id,
        listingId,
        bidPrice: parseFloat(bidPrice),
        quantity: parseFloat(quantity),
        message: message || '',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days expiry
      }
    });

    // Note: Would typically trigger a notification to the farmer here.

    res.status(201).json({ message: 'Bid placed successfully', bid });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/buyer/kyc ───────────────────────────────────
router.post('/kyc', upload.array('documents', 3), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { businessName, gstNumber, contactPerson } = req.body;
    
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      res.status(400).json({ error: 'At least one KYC document is required' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    const documentUrls = files.map(file => `/uploads/${file.filename}`);

    const updatedProfile = await prisma.buyerProfile.update({
      where: { userId },
      data: {
        businessName,
        gstNumber,
        contactPerson,
        kycStatus: 'PENDING',
        kycDocuments: JSON.stringify(documentUrls),
      }
    });

    res.json({ message: 'KYC submitted successfully. Awaiting approval.', profile: updatedProfile });
  } catch (error) {
    next(error);
  }
});

export default router;
