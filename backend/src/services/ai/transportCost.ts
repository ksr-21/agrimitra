import { TransportEstimate } from './types';

/**
 * Estimate transport cost between two locations.
 *
 * v1: Simple distance-based estimate using quantity-to-vehicle mapping.
 * Swap: Replace with a real logistics API (e.g., Google Distance Matrix + rate cards).
 */

// Base rate per km by vehicle type (INR)
const RATES_PER_KM: Record<string, number> = {
  bike: 5,
  auto: 8,
  mini_truck: 12,
  truck: 18,
};

// Quantity thresholds for vehicle type suggestion (in kg)
const VEHICLE_THRESHOLDS = [
  { maxKg: 20, type: 'bike' as const },
  { maxKg: 200, type: 'auto' as const },
  { maxKg: 2000, type: 'mini_truck' as const },
  { maxKg: Infinity, type: 'truck' as const },
];

export async function optimizeTransportCost(
  _pickupLocation: string,
  _deliveryLocation: string,
  quantity: number
): Promise<TransportEstimate> {
  await new Promise(resolve => setTimeout(resolve, 200));

  // Mock distance (in a real system, this would come from a geocoding/distance API)
  const estimatedDistance = 15 + Math.random() * 85; // 15–100 km

  // Pick vehicle type based on quantity
  const vehicle = VEHICLE_THRESHOLDS.find(v => quantity <= v.maxKg) || VEHICLE_THRESHOLDS[3];
  const ratePerKm = RATES_PER_KM[vehicle.type];
  const estimatedCost = Math.round(ratePerKm * estimatedDistance);

  return {
    estimatedCost,
    suggestedVehicleType: vehicle.type,
    estimatedDistance: Math.round(estimatedDistance * 10) / 10,
    currency: 'INR',
  };
}
