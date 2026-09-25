/**
 * Agrimitra AI Service — Type Definitions
 *
 * These interfaces define the contracts for all AI service functions.
 * For v1, all implementations return realistic mocked data.
 * When a real model/API is ready, just swap the implementation
 * files — calling code doesn't change.
 */

export type QualityGrade = 'A' | 'B' | 'C';

export interface ImageAnalysisResult {
  cropType: string;
  variety?: string;
  grade: QualityGrade;
  qualityScore: number;        // 1–5
  confidence: number;          // 0–1
  notes: string;               // Plain-language explanation
}

export interface PriceRecommendation {
  minPrice: number;
  maxPrice: number;
  recommendedPrice: number;
  currency: 'INR';
  basedOn: string;             // Explanation
}

export interface SellOrWaitAdvice {
  recommendation: 'sell' | 'wait';
  reason: string;
  confidenceScore: number;     // 0–1
  estimatedWaitDays?: number;
}

export interface NetProfitResult {
  grossRevenue: number;
  transportCost: number;
  platformFee: number;
  netProfit: number;
  currency: 'INR';
}

export interface BuyerMatch {
  buyerId: string;
  requirementId: string;
  matchScore: number;          // 0–100
  matchReasons: string[];
}

export interface TransportEstimate {
  estimatedCost: number;
  suggestedVehicleType: 'bike' | 'auto' | 'mini_truck' | 'truck';
  estimatedDistance: number;
  currency: 'INR';
}
