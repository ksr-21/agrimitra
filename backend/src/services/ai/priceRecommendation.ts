import { PriceRecommendation, ImageAnalysisResult } from './types';

/**
 * Recommend a price range based on AI analysis, crop type, and region.
 *
 * v1: Returns crop-specific mocked prices adjusted by quality grade.
 * Swap: Replace with a real pricing model / market data API.
 */

// Baseline prices per kg in INR for common crops
const CROP_BASE_PRICES: Record<string, number> = {
  wheat: 25, rice: 35, maize: 20, bajra: 22, jowar: 28,
  sugarcane: 3.5, cotton: 65, soybean: 45, groundnut: 55, mustard: 52,
  potato: 15, onion: 20, tomato: 25, chilli: 80, turmeric: 90,
  banana: 30, mango: 60, grapes: 50, pomegranate: 100, orange: 35,
};

const GRADE_MULTIPLIERS: Record<string, number> = {
  A: 1.25,
  B: 1.0,
  C: 0.75,
};

export async function recommendPrice(
  imageAnalysis: ImageAnalysisResult,
  cropType: string,
  _region?: string
): Promise<PriceRecommendation> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const basePrice = CROP_BASE_PRICES[cropType.toLowerCase()] || 30;
  const multiplier = GRADE_MULTIPLIERS[imageAnalysis.grade] || 1.0;
  const recommended = Math.round(basePrice * multiplier * 100) / 100;

  return {
    minPrice: Math.round(recommended * 0.85 * 100) / 100,
    maxPrice: Math.round(recommended * 1.15 * 100) / 100,
    recommendedPrice: recommended,
    currency: 'INR',
    basedOn: `Market average for ${cropType} (Grade ${imageAnalysis.grade}) in your region. Price adjusted for quality score of ${imageAnalysis.qualityScore.toFixed(1)}/5.`,
  };
}
