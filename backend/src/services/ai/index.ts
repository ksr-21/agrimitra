/**
 * Agrimitra AI Service — Public API
 *
 * Re-exports all AI functions from a single entry point.
 * Calling code imports from here: `import { analyzeProductImage } from '@/services/ai'`
 */

export { analyzeProductImage } from './imageAnalysis';
export { recommendPrice } from './priceRecommendation';
export { sellOrWaitAdvice } from './sellOrWait';
export { calculateNetProfit } from './netProfit';
export { findBestBuyerMatch } from './buyerMatching';
export { optimizeTransportCost } from './transportCost';

// Re-export all types
export type {
  ImageAnalysisResult,
  PriceRecommendation,
  SellOrWaitAdvice,
  NetProfitResult,
  BuyerMatch,
  TransportEstimate,
  QualityGrade,
} from './types';
