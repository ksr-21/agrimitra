/**
 * Agrimitra — Platform Constants
 *
 * All tunable values live here so they're easy to find and adjust.
 * Nothing in this file should be hardcoded elsewhere.
 */

export const MATCHING_WEIGHTS = {
  /**
   * Price weight (0–1): How much the bid price / listing price
   * alignment matters. Higher = strongly prefer close-priced matches.
   */
  price: 0.33,

  /**
   * Location weight (0–1): How much geographic proximity matters.
   * Higher = strongly prefer nearby buyer-farmer pairs (reduces transport cost).
   */
  location: 0.33,

  /**
   * Quality weight (0–1): How much the quality grade match matters.
   * Higher = strongly prefer buyers whose quality requirements match the listing grade.
   */
  quality: 0.34, // Sum = 1.0
} as const;

/** Maximum delivery radius in kilometers for auto-assignment of delivery partners. */
export const DELIVERY_RADIUS_KM = 50;

/** Maximum number of photos allowed per listing. */
export const MAX_LISTING_PHOTOS = 5;

/** Bid expiry duration in days. Perishable produce shouldn't have open-ended bids. */
export const BID_EXPIRY_DAYS = 3;

/** Platform commission rate (0–1). ₹0 for v1 — tracked but not charged. */
export const PLATFORM_COMMISSION_RATE = 0;

/** Currency used across the platform. */
export const CURRENCY = 'INR' as const;

/** Supported languages */
export const SUPPORTED_LANGUAGES = ['en', 'hi', 'mr', 'kn', 'ta'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/** Default language for new users */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/** Seeded crop types for listings and requirements */
export const CROP_TYPES = [
  'wheat', 'rice', 'maize', 'bajra', 'jowar',
  'sugarcane', 'cotton', 'soybean', 'groundnut', 'mustard',
  'potato', 'onion', 'tomato', 'chilli', 'turmeric',
  'banana', 'mango', 'grapes', 'pomegranate', 'orange',
] as const;

/** Indian states for location filters */
export const INDIAN_STATES = [
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Madhya Pradesh',
  'Uttar Pradesh', 'Rajasthan', 'Gujarat', 'Punjab',
  'Haryana', 'Andhra Pradesh', 'Telangana', 'West Bengal',
  'Bihar', 'Kerala', 'Odisha',
] as const;
