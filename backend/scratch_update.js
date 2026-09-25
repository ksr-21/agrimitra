const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tomatoListing = await prisma.listing.findFirst({
    where: { cropType: 'tomato' },
    include: { analysis: true }
  });

  if (tomatoListing && tomatoListing.analysis) {
    await prisma.aiAnalysisResult.update({
      where: { id: tomatoListing.analysis.id },
      data: {
        sellOrWait: 'wait',
        sellOrWaitReason: 'Prices for tomato typically rise in the coming weeks. Consider waiting for better returns.',
      }
    });
    console.log('Updated tomato to wait!');
  }

  const onionListing = await prisma.listing.findFirst({
    where: { cropType: 'onion' },
    include: { analysis: true }
  });

  if (onionListing && onionListing.analysis) {
    await prisma.aiAnalysisResult.update({
      where: { id: onionListing.analysis.id },
      data: {
        sellOrWait: 'wait',
        sellOrWaitReason: 'Wait for better prices in the festival season.',
      }
    });
    console.log('Updated onion to wait!');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
