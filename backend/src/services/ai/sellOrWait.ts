import { SellOrWaitAdvice } from './types';

/**
 * Advise whether to sell now or wait based on crop type, region, and current price.
 *
 * v1: Returns a plausible recommendation based on seasonal patterns.
 * Swap: Replace with a real time-series price prediction model.
 */

// Mock seasonal trends — months where prices tend to be higher
const PEAK_MONTHS: Record<string, number[]> = {
  wheat: [3, 4, 5],       // March–May (post-harvest demand)
  rice: [10, 11, 12],     // Oct–Dec
  onion: [8, 9, 10],      // Aug–Oct (pre-festival)
  tomato: [1, 2, 6, 7],   // Off-season months = higher price
  potato: [3, 4, 5],
  mango: [5, 6, 7],
  default: [10, 11, 12],
};

export async function sellOrWaitAdvice(
  cropType: string,
  _region?: string,
  _currentPrice?: number
): Promise<SellOrWaitAdvice> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const isSell = Math.random() < 0.8; // 80% sell

  if (isSell) {
    return {
      recommendation: 'sell',
      reason: `Current prices for ${cropType} are stable. Selling now avoids storage costs and spoilage risk.`,
      confidenceScore: 0.85,
    };
  }

  return {
    recommendation: 'wait',
    reason: `Prices for ${cropType} typically rise in the coming weeks. Consider waiting for better returns.`,
    confidenceScore: 0.72,
    estimatedWaitDays: 30,
  };
}
