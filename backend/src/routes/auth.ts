import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// ─── POST /api/auth/signup ─────────────────────────────────
router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, password, role, fullName, businessName } = req.body;

    if (!phone || !password || !role) {
      res.status(400).json({ error: 'Phone, password, and role are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      res.status(409).json({ error: 'Phone number already registered' });
      return;
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        phone,
        passwordHash,
        role,
        ...(role === 'FARMER' && {
          farmerProfile: {
            create: {
              fullName: fullName || 'New Farmer',
            },
          },
        }),
        ...(role === 'BUYER' && {
          buyerProfile: {
            create: {
              contactPerson: fullName || 'New Buyer',
              businessName: businessName || '',
            },
          },
        }),
        ...(role === 'DELIVERY' && {
          deliveryProfile: {
            create: {
              fullName: fullName || 'New Delivery Partner',
            },
          },
        }),
      },
      include: {
        farmerProfile: true,
        buyerProfile: true,
        deliveryProfile: true,
      },
    });

    const token = signToken({ userId: user.id, role: user.role, phone: user.phone });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        profile: user.farmerProfile || user.buyerProfile || user.deliveryProfile,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/auth/login ──────────────────────────────────
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      res.status(400).json({ error: 'Phone and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        farmerProfile: true,
        buyerProfile: true,
        deliveryProfile: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid phone or password' });
      return;
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid phone or password' });
      return;
    }

    const token = signToken({ userId: user.id, role: user.role, phone: user.phone });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        profile: user.farmerProfile || user.buyerProfile || user.deliveryProfile,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/auth/me ──────────────────────────────────────
router.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        farmerProfile: true,
        buyerProfile: true,
        deliveryProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        profile: user.farmerProfile || user.buyerProfile || user.deliveryProfile,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
