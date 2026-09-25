import { ImageAnalysisResult, QualityGrade } from './types';

/**
 * Analyze a product photo and return quality grading.
 *
 * v1: Returns realistic mocked data based on a simple hash of the imageUrl.
 * Swap: Replace with a real vision model call (e.g., Google Cloud Vision, custom model).
 */
export async function analyzeProductImage(imageUrl: string): Promise<ImageAnalysisResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Deterministic-ish mock based on imageUrl hash
  const hash = simpleHash(imageUrl);
  const gradeIndex = hash % 3;
  const grades: QualityGrade[] = ['A', 'B', 'C'];
  const grade = grades[gradeIndex];

  const qualityScores: Record<QualityGrade, number> = { A: 4.5, B: 3.2, C: 2.1 };
  const confidences: Record<QualityGrade, number> = { A: 0.92, B: 0.78, C: 0.65 };
  const notes: Record<QualityGrade, string> = {
    A: 'Excellent quality. Produce appears fresh, well-formed, and free of blemishes. Suitable for premium markets.',
    B: 'Good quality. Minor imperfections detected but overall acceptable for wholesale. Some variation in size noted.',
    C: 'Average quality. Noticeable blemishes and size inconsistency. Best suited for local markets or processing.',
  };

  return {
    cropType: 'tomato',
    variety: 'Roma',
    grade,
    qualityScore: qualityScores[grade] + (hash % 5) * 0.1,
    confidence: confidences[grade],
    notes: notes[grade],
  };
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
