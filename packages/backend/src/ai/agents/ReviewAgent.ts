import { AgentState } from '../AgentState';
import { AITools } from '../tools';

export interface ReviewAnalysisItem {
  pgId: number;
  reviewCount: number;
  averageRating: number;
  categoryScores?: {
    cleanliness: number;
    food: number;
    wifi: number;
    security: number;
  };
  positiveThemes: string[];
  negativeThemes: string[];
  supportingReviewIds: number[];
  summaryNote: string;
}

export class ReviewAgent {
  /**
   * Executes Review Intelligence Analysis querying real DB Review models.
   */
  static async execute(state: AgentState): Promise<AgentState> {
    const startTime = Date.now();
    const candidates = state.candidatePGs || [];
    const reviewAnalysis: Record<number, ReviewAnalysisItem> = {};

    for (const pg of candidates) {
      try {
        const reviews = await AITools.getReviewsForPG(pg.id);

        if (reviews.length > 0) {
          const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          const avgClean =
            reviews.reduce((sum, r) => sum + r.cleanlinessRating, 0) / reviews.length;
          const avgFood = reviews.reduce((sum, r) => sum + r.foodRating, 0) / reviews.length;
          const avgWifi = reviews.reduce((sum, r) => sum + r.wifiRating, 0) / reviews.length;
          const avgSec = reviews.reduce((sum, r) => sum + r.securityRating, 0) / reviews.length;

          const positiveThemes: string[] = [];
          const negativeThemes: string[] = [];

          if (avgClean >= 4.0) positiveThemes.push('Clean and well-maintained rooms');
          if (avgWifi >= 4.0) positiveThemes.push('Reliable high-speed Wi-Fi');
          if (avgFood < 3.5) negativeThemes.push('Mixed feedback on food quality');
          if (avgSec >= 4.0) positiveThemes.push('Strong security and CCTV coverage');

          reviewAnalysis[pg.id] = {
            pgId: pg.id,
            reviewCount: reviews.length,
            averageRating: parseFloat(avgRating.toFixed(1)),
            categoryScores: {
              cleanliness: parseFloat(avgClean.toFixed(1)),
              food: parseFloat(avgFood.toFixed(1)),
              wifi: parseFloat(avgWifi.toFixed(1)),
              security: parseFloat(avgSec.toFixed(1)),
            },
            positiveThemes,
            negativeThemes,
            supportingReviewIds: reviews.map(r => r.id),
            summaryNote: `${reviews.length} student reviews found with ${avgRating.toFixed(1)}/5.0 average rating.`,
          };
        } else {
          reviewAnalysis[pg.id] = {
            pgId: pg.id,
            reviewCount: 0,
            averageRating: pg.averageRating || 4.5,
            positiveThemes: ['Recently listed accommodation'],
            negativeThemes: [],
            supportingReviewIds: [],
            summaryNote: 'No student reviews written yet for this listing.',
          };
        }
      } catch (err) {
        reviewAnalysis[pg.id] = {
          pgId: pg.id,
          reviewCount: 0,
          averageRating: 0,
          positiveThemes: [],
          negativeThemes: [],
          supportingReviewIds: [],
          summaryNote: 'Review information unavailable.',
        };
      }
    }

    state.reviewAnalysis = reviewAnalysis;
    state.executionMetadata.agentTimings['ReviewAgent'] = Date.now() - startTime;
    return state;
  }
}
