import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { upload } from '../middleware/upload';
import { env } from '../config/env';
import {
  analyzeProductImage,
  recommendPrice,
  sellOrWaitAdvice,
  calculateNetProfit,
  optimizeTransportCost,
} from '../services/ai';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// ─── POST /api/listings/analyze (FARMER ONLY) ───────────────────
// Step 1: Upload a photo, get AI analysis back
router.post(
  '/analyze',
  roleGuard('FARMER'),
  upload.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Image file is required' });
        return;
      }

      // Hardcoded mock location for now (in production, passed from frontend)
      const mockLocation = 'Pune';

      // 1. Analyze Image
      const imagePath = `/${env.UPLOAD_DIR}/${req.file.filename}`;
      const requestedCropType = req.body.cropType || 'tomato';
      const analysis = await analyzeProductImage(imagePath);
      analysis.cropType = requestedCropType.toLowerCase();

      // 2. Recommend Price
      const priceRec = await recommendPrice(analysis, analysis.cropType);

      // 3. Sell or Wait
      const advice = await sellOrWaitAdvice(analysis.cropType, priceRec.recommendedPrice);

      // 4. Estimate Transport (mock 50km)
      const transport = await optimizeTransportCost(mockLocation, 'Mumbai', 100);

      // 5. Net Profit (assuming 100kg for calculation)
      const profit = await calculateNetProfit(
        priceRec.recommendedPrice,
        100,
        transport.estimatedCost,
        0 // platform fee is 0 for v1
      );

      res.json({
        imageUrl: imagePath,
        cropType: analysis.cropType,
        variety: analysis.variety,
        analysis: {
          grade: analysis.grade,
          qualityScore: analysis.qualityScore,
          confidence: analysis.confidence,
          notes: analysis.notes,
        },
        pricing: priceRec,
        advice,
        transport,
        profit, // for 100kg baseline
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── POST /api/listings (FARMER ONLY) ───────────────────────────
// Step 2: Save the listing after user confirms
router.post(
  '/',
  roleGuard('FARMER'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      
      const farmerProfile = await prisma.farmerProfile.findUnique({
        where: { userId },
      });

      if (!farmerProfile) {
        res.status(404).json({ error: 'Farmer profile not found' });
        return;
      }

      const {
        cropType,
        variety,
        quantity,
        unit,
        description,
        finalPrice,
        location,
        deliveryAvailable,
        imageUrl,
        aiData, // Full AI payload from the analysis step
      } = req.body;

      if (!cropType || !quantity || !finalPrice || !imageUrl) {
        res.status(400).json({ error: 'Missing required listing fields' });
        return;
      }

      // Create Listing
      const listing = await prisma.listing.create({
        data: {
          farmerId: farmerProfile.id,
          cropType,
          variety: variety || '',
          quantity: parseFloat(quantity),
          unit: unit || 'kg',
          description: description || '',
          finalPrice: parseFloat(finalPrice),
          aiRecommendedPrice: aiData?.pricing?.recommendedPrice || parseFloat(finalPrice),
          status: 'ACTIVE',
          location: location || farmerProfile.location,
          deliveryAvailable: deliveryAvailable !== undefined ? deliveryAvailable : true,
          // Images
          images: {
            create: [
              { imageUrl, isPrimary: true }
            ],
          },
          // AI Result
          ...(aiData && {
            analysis: {
              create: {
                grade: aiData.analysis.grade,
                qualityScore: aiData.analysis.qualityScore,
                confidence: aiData.analysis.confidence,
                notes: aiData.analysis.notes,
                priceMin: aiData.pricing.minPrice,
                priceMax: aiData.pricing.maxPrice,
                recommendedPrice: aiData.pricing.recommendedPrice,
                currency: aiData.pricing.currency,
                sellOrWait: aiData.advice.recommendation,
                sellOrWaitReason: aiData.advice.reason,
                sellConfidence: aiData.advice.confidenceScore,
                estimatedWaitDays: aiData.advice.estimatedWaitDays,
              }
            }
          }),
        },
        include: {
          images: true,
          analysis: true,
        },
      });

      res.status(201).json({
        message: 'Listing created successfully',
        listing,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── PUT /api/listings/:id (FARMER ONLY) ────────────────────────
// Update listing details
router.put(
  '/:id',
  roleGuard('FARMER'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      
      const farmerProfile = await prisma.farmerProfile.findUnique({
        where: { userId },
      });

      if (!farmerProfile) {
        res.status(404).json({ error: 'Farmer profile not found' });
        return;
      }

      const listing = await prisma.listing.findUnique({
        where: { id },
      });

      if (!listing || listing.farmerId !== farmerProfile.id) {
        res.status(404).json({ error: 'Listing not found or unauthorized' });
        return;
      }

      const {
        cropType,
        variety,
        quantity,
        unit,
        description,
        finalPrice,
        location,
        deliveryAvailable,
        status,
      } = req.body;

      const updatedListing = await prisma.listing.update({
        where: { id },
        data: {
          ...(cropType && { cropType }),
          ...(variety !== undefined && { variety }),
          ...(quantity && { quantity: parseFloat(quantity) }),
          ...(unit && { unit }),
          ...(description !== undefined && { description }),
          ...(finalPrice && { finalPrice: parseFloat(finalPrice) }),
          ...(location !== undefined && { location }),
          ...(deliveryAvailable !== undefined && { deliveryAvailable }),
          ...(status && { status }),
        },
        include: {
          images: true,
          analysis: true,
        },
      });

      res.json({
        message: 'Listing updated successfully',
        listing: updatedListing,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
