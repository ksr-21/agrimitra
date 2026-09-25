import { BuyerMatch } from './types';

/**
 * Find the best matching buyers for a given listing.
 *
 * v1: Queries buyer requirements and scores them using equal weights.
 * Swap: Replace with a real recommendation engine / ML ranking model.
 */

interface ListingData {
  cropType: string;
  quantity: number;
  finalPrice: number;
  grade: string;
  state?: string;
}

interface RequirementData {
  id: string;
  buyerId: string;
  cropType: string;
  quantityNeeded: number;
  maxBudgetPerUnit: number | null;
  qualityPreference: string | null;
  state?: string | null;
}

export async function findBestBuyerMatch(
  listing: ListingData,
  requirements: RequirementData[]
): Promise<BuyerMatch[]> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const matches: BuyerMatch[] = requirements
    .filter(req => req.cropType.toLowerCase() === listing.cropType.toLowerCase())
    .map(req => {
      const reasons: string[] = [];
      let score = 0;

      // Price match (33%)
      if (req.maxBudgetPerUnit === null || req.maxBudgetPerUnit >= listing.finalPrice) {
        score += 33;
        reasons.push('Price within budget');
      } else {
        const priceDiff = (req.maxBudgetPerUnit / listing.finalPrice);
        score += Math.round(33 * Math.min(priceDiff, 1));
        if (priceDiff > 0.8) reasons.push('Price slightly above budget');
      }

      // Location match (33%)
      if (req.state && listing.state && req.state === listing.state) {
        score += 33;
        reasons.push('Same state — lower transport cost');
      } else if (req.state && listing.state) {
        score += 15;
        reasons.push('Different state — moderate transport cost');
      } else {
        score += 20; // Unknown location, give partial score
      }

      // Quality match (34%)
      if (!req.qualityPreference || req.qualityPreference === 'any' || req.qualityPreference === listing.grade) {
        score += 34;
        reasons.push(`Quality grade ${listing.grade} matches requirement`);
      } else if (listing.grade === 'A' && req.qualityPreference === 'B') {
        score += 28;
        reasons.push('Listing quality exceeds requirement');
      } else {
        score += 10;
        reasons.push('Quality grade below preference');
      }

      return {
        buyerId: req.buyerId,
        requirementId: req.id,
        matchScore: Math.min(score, 100),
        matchReasons: reasons,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return matches;
}
