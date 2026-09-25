import { NetProfitResult } from './types';
import { PLATFORM_COMMISSION_RATE } from '../../config/constants';

/**
 * Calculate net profit for a listing.
 *
 * v1: Simple arithmetic using provided values + platform commission rate.
 * Swap: Could integrate real logistics cost APIs and dynamic commission tiers.
 */
export async function calculateNetProfit(
  recommendedPrice: number,
  quantity: number,
  transportCost: number,
  platformFeeOverride?: number
): Promise<NetProfitResult> {
  const grossRevenue = recommendedPrice * quantity;
  const platformFee = platformFeeOverride ?? (grossRevenue * PLATFORM_COMMISSION_RATE);
  const netProfit = grossRevenue - transportCost - platformFee;

  return {
    grossRevenue: Math.round(grossRevenue * 100) / 100,
    transportCost: Math.round(transportCost * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    currency: 'INR',
  };
}
