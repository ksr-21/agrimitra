import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Agrimitra database...\n');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.trustScoreEvent.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.review.deleteMany();
  await prisma.deliveryCheckpoint.deleteMany();
  await prisma.order.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.aiAnalysisResult.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.buyerRequirement.deleteMany();
  await prisma.deliveryProfile.deleteMany();
  await prisma.buyerProfile.deleteMany();
  await prisma.farmerProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // ─── Create Users ──────────────────────────────────────

  // Farmers
  const farmer1 = await prisma.user.create({
    data: {
      phone: '9876543210',
      email: 'ramesh@example.com',
      passwordHash,
      role: 'FARMER',
      preferredLanguage: 'hi',
      isVerified: true,
      farmerProfile: {
        create: {
          fullName: 'Ramesh Patil',
          location: 'Nashik',
          district: 'Nashik',
          state: 'Maharashtra',
          pincode: '422001',
          landSize: 5.5,
          aadhaarVerified: true,
          trustScore: 4.2,
          totalTransactions: 12,
          avgRating: 4.2,
          farmPhotos: JSON.stringify([]),
        },
      },
    },
    include: { farmerProfile: true },
  });

  const farmer2 = await prisma.user.create({
    data: {
      phone: '9876543211',
      email: 'suresh@example.com',
      passwordHash,
      role: 'FARMER',
      preferredLanguage: 'kn',
      isVerified: true,
      farmerProfile: {
        create: {
          fullName: 'Suresh Kumar',
          location: 'Mysuru',
          district: 'Mysuru',
          state: 'Karnataka',
          pincode: '570001',
          landSize: 3.0,
          aadhaarVerified: false,
          trustScore: 3.8,
          totalTransactions: 7,
          avgRating: 3.8,
          farmPhotos: JSON.stringify([]),
        },
      },
    },
    include: { farmerProfile: true },
  });

  const farmer3 = await prisma.user.create({
    data: {
      phone: '9876543212',
      passwordHash,
      role: 'FARMER',
      preferredLanguage: 'ta',
      isVerified: true,
      farmerProfile: {
        create: {
          fullName: 'Murugan Selvam',
          location: 'Coimbatore',
          district: 'Coimbatore',
          state: 'Tamil Nadu',
          pincode: '641001',
          landSize: 8.0,
          aadhaarVerified: true,
          trustScore: 4.5,
          totalTransactions: 20,
          avgRating: 4.5,
          farmPhotos: JSON.stringify([]),
        },
      },
    },
    include: { farmerProfile: true },
  });

  // Buyers
  const buyer1 = await prisma.user.create({
    data: {
      phone: '9876543220',
      email: 'freshmart@example.com',
      passwordHash,
      role: 'BUYER',
      preferredLanguage: 'en',
      isVerified: true,
      buyerProfile: {
        create: {
          contactPerson: 'Vikram Shah',
          businessName: 'FreshMart Wholesale',
          gstNumber: '27AABCU9603R1ZM',
          kycStatus: 'APPROVED',
          trustScore: 4.0,
          totalTransactions: 15,
          avgRating: 4.0,
          location: 'Mumbai',
          district: 'Mumbai',
          state: 'Maharashtra',
          kycDocuments: JSON.stringify([]),
        },
      },
    },
    include: { buyerProfile: true },
  });

  const buyer2 = await prisma.user.create({
    data: {
      phone: '9876543221',
      email: 'greengrocer@example.com',
      passwordHash,
      role: 'BUYER',
      preferredLanguage: 'hi',
      isVerified: true,
      buyerProfile: {
        create: {
          contactPerson: 'Priya Gupta',
          businessName: 'Green Grocer Pvt. Ltd.',
          kycStatus: 'PENDING',
          trustScore: 3.5,
          totalTransactions: 5,
          avgRating: 3.5,
          location: 'Pune',
          district: 'Pune',
          state: 'Maharashtra',
          kycDocuments: JSON.stringify([]),
        },
      },
    },
    include: { buyerProfile: true },
  });

  // Delivery Partner
  const delivery1 = await prisma.user.create({
    data: {
      phone: '9876543230',
      passwordHash,
      role: 'DELIVERY',
      preferredLanguage: 'mr',
      isVerified: true,
      deliveryProfile: {
        create: {
          fullName: 'Ajay Jadhav',
          vehicleType: 'MINI_TRUCK',
          vehicleNumber: 'MH-14-AB-1234',
          currentLocation: 'Pune',
          latitude: 18.5204,
          longitude: 73.8567,
          isAvailable: true,
          totalDeliveries: 45,
          avgRating: 4.3,
        },
      },
    },
    include: { deliveryProfile: true },
  });

  // Admin
  const admin = await prisma.user.create({
    data: {
      phone: '9876543200',
      email: 'admin@agrimitra.com',
      passwordHash,
      role: 'ADMIN',
      preferredLanguage: 'en',
      isVerified: true,
    },
  });

  // ─── Create Listings ───────────────────────────────────

  const listing1 = await prisma.listing.create({
    data: {
      farmerId: farmer1.farmerProfile!.id,
      cropType: 'onion',
      variety: 'Red Nashik',
      quantity: 500,
      unit: 'kg',
      description: 'Fresh red onions from Nashik region, harvested this week.',
      aiRecommendedPrice: 22.50,
      finalPrice: 23.00,
      status: 'ACTIVE',
      location: 'Nashik',
      district: 'Nashik',
      state: 'Maharashtra',
      deliveryAvailable: true,
      deliveryRadius: 100,
      images: {
        create: [
          { imageUrl: '/uploads/sample-onion-1.jpg', isPrimary: true },
        ],
      },
      analysis: {
        create: {
          grade: 'A',
          qualityScore: 4.5,
          confidence: 0.92,
          notes: 'Excellent quality. Produce appears fresh, well-formed, and free of blemishes.',
          priceMin: 19.12,
          priceMax: 25.88,
          recommendedPrice: 22.50,
          sellOrWait: 'sell',
          sellOrWaitReason: 'Current market prices for onion are at seasonal peak.',
          sellConfidence: 0.85,
          grossRevenue: 11500,
          transportCost: 800,
          platformFee: 0,
          netProfit: 10700,
        },
      },
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      farmerId: farmer2.farmerProfile!.id,
      cropType: 'tomato',
      variety: 'Hybrid',
      quantity: 300,
      unit: 'kg',
      description: 'Farm-fresh tomatoes, sorted and graded.',
      aiRecommendedPrice: 28.00,
      finalPrice: 30.00,
      status: 'ACTIVE',
      location: 'Mysuru',
      district: 'Mysuru',
      state: 'Karnataka',
      deliveryAvailable: true,
      deliveryRadius: 75,
      images: {
        create: [
          { imageUrl: '/uploads/sample-tomato-1.jpg', isPrimary: true },
        ],
      },
      analysis: {
        create: {
          grade: 'B',
          qualityScore: 3.2,
          confidence: 0.78,
          notes: 'Good quality. Minor imperfections detected but overall acceptable.',
          priceMin: 23.80,
          priceMax: 32.20,
          recommendedPrice: 28.00,
          sellOrWait: 'sell',
          sellOrWaitReason: 'Current prices for tomato are stable. Selling now avoids spoilage.',
          sellConfidence: 0.68,
          grossRevenue: 9000,
          transportCost: 600,
          platformFee: 0,
          netProfit: 8400,
        },
      },
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      farmerId: farmer3.farmerProfile!.id,
      cropType: 'banana',
      variety: 'Cavendish',
      quantity: 1000,
      unit: 'kg',
      description: 'Premium Cavendish bananas, export quality.',
      aiRecommendedPrice: 35.00,
      finalPrice: 37.50,
      status: 'ACTIVE',
      location: 'Coimbatore',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      deliveryAvailable: true,
      deliveryRadius: 150,
      images: {
        create: [
          { imageUrl: '/uploads/sample-banana-1.jpg', isPrimary: true },
        ],
      },
      analysis: {
        create: {
          grade: 'A',
          qualityScore: 4.8,
          confidence: 0.95,
          notes: 'Excellent quality. Premium export-grade produce.',
          priceMin: 29.75,
          priceMax: 40.25,
          recommendedPrice: 35.00,
          sellOrWait: 'sell',
          sellOrWaitReason: 'Strong demand for Cavendish bananas. Sell now to capitalize.',
          sellConfidence: 0.88,
          grossRevenue: 37500,
          transportCost: 2500,
          platformFee: 0,
          netProfit: 35000,
        },
      },
    },
  });

  // ─── Create Buyer Requirements ─────────────────────────

  await prisma.buyerRequirement.create({
    data: {
      buyerId: buyer1.buyerProfile!.id,
      cropType: 'onion',
      quantityNeeded: 1000,
      unit: 'kg',
      maxBudgetPerUnit: 25,
      qualityPreference: 'A',
      isRecurring: true,
      recurringInterval: 'weekly',
      location: 'Mumbai',
      district: 'Mumbai',
      state: 'Maharashtra',
    },
  });

  await prisma.buyerRequirement.create({
    data: {
      buyerId: buyer1.buyerProfile!.id,
      cropType: 'tomato',
      quantityNeeded: 500,
      unit: 'kg',
      maxBudgetPerUnit: 35,
      qualityPreference: 'any',
      isRecurring: true,
      recurringInterval: 'weekly',
      state: 'Maharashtra',
    },
  });

  await prisma.buyerRequirement.create({
    data: {
      buyerId: buyer2.buyerProfile!.id,
      cropType: 'banana',
      quantityNeeded: 2000,
      unit: 'kg',
      maxBudgetPerUnit: 40,
      qualityPreference: 'A',
      isRecurring: false,
      state: 'Maharashtra',
    },
  });

  // ─── Create sample bids ────────────────────────────────

  const now = new Date();
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  await prisma.bid.create({
    data: {
      buyerId: buyer1.buyerProfile!.id,
      listingId: listing1.id,
      bidPrice: 22.00,
      quantity: 500,
      message: 'We need weekly supply of this quality. Interested in long-term partnership.',
      expiresAt: threeDaysLater,
    },
  });

  await prisma.bid.create({
    data: {
      buyerId: buyer2.buyerProfile!.id,
      listingId: listing2.id,
      bidPrice: 28.00,
      quantity: 200,
      message: 'Can pickup from farm if delivery not available.',
      expiresAt: threeDaysLater,
    },
  });

  // ─── Notifications ─────────────────────────────────────

  await prisma.notification.createMany({
    data: [
      {
        userId: farmer1.id,
        type: 'BID_RECEIVED',
        title: 'New bid on your onions!',
        message: 'FreshMart Wholesale has placed a bid of ₹22/kg for 500kg of onions.',
        isRead: false,
      },
      {
        userId: buyer1.id,
        type: 'PLATFORM',
        title: 'Welcome to Agrimitra!',
        message: 'Your account has been verified. Start browsing farm-fresh produce now.',
        isRead: true,
      },
    ],
  });

  console.log('✅ Seed data created successfully!\n');
  console.log('   Demo accounts (password: password123):');
  console.log('   ─────────────────────────────────────');
  console.log(`   Farmer 1:   ${farmer1.phone} (Ramesh Patil, Nashik)`);
  console.log(`   Farmer 2:   ${farmer2.phone} (Suresh Kumar, Mysuru)`);
  console.log(`   Farmer 3:   ${farmer3.phone} (Murugan Selvam, Coimbatore)`);
  console.log(`   Buyer 1:    ${buyer1.phone} (FreshMart Wholesale, Mumbai)`);
  console.log(`   Buyer 2:    ${buyer2.phone} (Green Grocer, Pune)`);
  console.log(`   Delivery:   ${delivery1.phone} (Ajay Jadhav, Pune)`);
  console.log(`   Admin:      ${admin.phone} (admin@agrimitra.com)`);
  console.log('');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
