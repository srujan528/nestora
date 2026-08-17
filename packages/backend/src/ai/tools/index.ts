import { prisma, calculateTrueMonthlyCost } from '@qrent/shared';
import { PGSearchService, PGSearchInput } from '@/services/PGSearchService';
import { GoogleRoutesService, LocationCoord } from '@/services/GoogleRoutesService';

export class AITools {
  /**
   * Search Tool calling the decoupled PGSearchService.
   */
  static async searchPGs(input: PGSearchInput) {
    return PGSearchService.searchPgs(input);
  }

  /**
   * Commute Tool calling GoogleRoutesService.
   */
  static async computeCommute(
    origin: LocationCoord,
    destination: LocationCoord,
    mode: 'WALKING' | 'DRIVING' | 'TRANSIT' = 'WALKING'
  ) {
    return GoogleRoutesService.computeDistanceAndCommute(origin, destination, mode);
  }

  /**
   * Cost Tool calling calculateTrueMonthlyCost.
   */
  static computeTrueCost(params: {
    minRent: number;
    foodIncludedInRent?: boolean;
    extraFoodCharges?: number;
    estElectricityMonthly?: number;
    estMaintenanceMonthly?: number;
    commuteCostEstMonthly?: number;
  }) {
    return calculateTrueMonthlyCost(params);
  }

  /**
   * Review Tool querying real DB reviews.
   */
  static async getReviewsForPG(pgId: number) {
    const reviews = await prisma.review.findMany({
      where: { pgId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return reviews;
  }

  /**
   * Menu Tool querying WeeklyMenu records.
   */
  static async getWeeklyMenuForPG(pgId: number) {
    const menu = await prisma.weeklyMenu.findUnique({
      where: { pgId },
    });
    return menu;
  }
}
