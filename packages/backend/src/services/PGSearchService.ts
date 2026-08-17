import { prisma, calculateTrueMonthlyCost } from '@qrent/shared';
import { GoogleRoutesService } from './GoogleRoutesService';

export interface PGSearchInput {
  collegeId?: number;
  city?: string;
  minRent?: number;
  maxRent?: number;
  genderRestriction?: 'BOYS' | 'GIRLS' | 'CO_ED';
  roomType?:
    | 'SINGLE'
    | 'DOUBLE_SHARING'
    | 'TRIPLE_SHARING'
    | 'FOUR_SHARING'
    | 'PRIVATE_ROOM'
    | 'FULL_FLAT';
  foodType?: 'VEG_ONLY' | 'NON_VEG_ALLOWED' | 'JAIN_AVAILABLE' | 'NO_FOOD';
  acRequired?: boolean;
  maxDistanceKm?: number;
  search?: string;
  page?: number;
  pageSize?: number;
  userRole?: string;
}

export interface EnrichedPGResult {
  id: number;
  title: string;
  collegeId: number;
  address: string;
  locality: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  genderRestriction: string;
  curfewTime?: string | null;
  noticePeriodDays: number;
  houseRules?: string | null;
  minRent: number;
  maxRent: number;
  securityDeposit: number;
  estElectricityMonthly: number;
  estMaintenanceMonthly: number;
  foodType: string;
  mealOption: string;
  foodIncludedInRent: boolean;
  extraFoodCharges: number;
  averageRating: number;
  reviewCount: number;
  status: string;
  isVerified: boolean;
  isDemoData: boolean;
  description: string;
  distanceMeters: number;
  distanceKm: number;
  commuteTimeMins: number;
  commuteMode: 'WALKING' | 'DRIVING' | 'TRANSIT';
  commuteCostEstMonthly: number;
  commuteFareFormula: string;
  trueMonthlyCost: number;
  trueMonthlyCostBreakdown: {
    baseRent: number;
    foodCost: number;
    electricityCost: number;
    maintenanceCost: number;
    commuteCost: number;
    totalMonthlyCost: number;
  };
  matchScore: number;
  college?: any;
  rooms?: any[];
  photos?: any[];
  amenities?: any[];
  reviews?: any[];
}

export interface PGSearchOutput {
  pgs: EnrichedPGResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  selectedCollege?: any;
}

export class PGSearchService {
  /**
   * Decoupled search service used by both tRPC pgsRouter and AI SearchTool.
   */
  static async searchPgs(input: PGSearchInput): Promise<PGSearchOutput> {
    const page = input.page || 1;
    const pageSize = input.pageSize || 50;
    const where: any = {};
    const andConditions: any[] = [];

    if (input.collegeId) {
      andConditions.push({ collegeId: input.collegeId });
    }
    if (input.city) {
      andConditions.push({ city: { contains: input.city, mode: 'insensitive' } });
    }
    if (input.genderRestriction) {
      andConditions.push({ genderRestriction: input.genderRestriction });
    }
    if (input.foodType) {
      andConditions.push({ foodType: input.foodType });
    }
    if (input.minRent !== undefined || input.maxRent !== undefined) {
      const rentCond: any = {};
      if (input.minRent !== undefined) rentCond.gte = input.minRent;
      if (input.maxRent !== undefined) rentCond.lte = input.maxRent;
      andConditions.push({ minRent: rentCond });
    }
    if (input.acRequired) {
      andConditions.push({ rooms: { some: { isAc: true } } });
    }
    if (input.roomType) {
      andConditions.push({ rooms: { some: { roomType: input.roomType } } });
    }
    if (input.search) {
      andConditions.push({
        OR: [
          { title: { contains: input.search, mode: 'insensitive' } },
          { locality: { contains: input.search, mode: 'insensitive' } },
          { address: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } },
        ],
      });
    }

    if (!input.userRole || (input.userRole !== 'OWNER' && input.userRole !== 'ADMIN')) {
      andConditions.push({
        OR: [{ status: 'PUBLISHED' }, { status: 'VERIFIED' }, { isDemoData: true }],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    let selectedCollege: any = null;
    if (input.collegeId) {
      selectedCollege = await prisma.college.findUnique({ where: { id: input.collegeId } });
    }

    const allMatchingPgs = await prisma.pGListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        college: true,
        rooms: true,
        photos: {
          take: 3,
          orderBy: { displayOrder: 'asc' },
        },
        amenities: true,
        reviews: {
          select: { id: true, rating: true },
        },
      },
    });

    const enrichedPgs: EnrichedPGResult[] = await Promise.all(
      allMatchingPgs.map(async pg => {
        const referenceCollege = selectedCollege || pg.college;
        let routeMetrics = {
          distanceMeters: pg.distanceMeters,
          distanceKm: parseFloat((pg.distanceMeters / 1000).toFixed(2)),
          commuteTimeMins: pg.commuteTimeMins,
          commuteMode: (pg.commuteMode as any) || 'WALKING',
          commuteCostEstMonthly: pg.commuteCostEstMonthly,
          commuteFareFormula: pg.commuteFareFormula,
        };

        if (referenceCollege) {
          const calcResult = await GoogleRoutesService.computeDistanceAndCommute(
            { latitude: referenceCollege.latitude, longitude: referenceCollege.longitude },
            { latitude: pg.latitude, longitude: pg.longitude }
          );

          routeMetrics = {
            distanceMeters: calcResult.distanceMeters,
            distanceKm: calcResult.distanceKm,
            commuteTimeMins: calcResult.commuteTimeMins,
            commuteMode: calcResult.commuteMode,
            commuteCostEstMonthly: calcResult.commuteCostEstMonthly,
            commuteFareFormula: calcResult.commuteFareFormula,
          };
        }

        const avgRating =
          pg.reviews.length > 0
            ? pg.reviews.reduce((sum, r) => sum + r.rating, 0) / pg.reviews.length
            : pg.averageRating || 4.5;

        const costBreakdown = calculateTrueMonthlyCost({
          minRent: pg.minRent,
          foodIncludedInRent: pg.foodIncludedInRent,
          extraFoodCharges: pg.extraFoodCharges,
          estElectricityMonthly: pg.estElectricityMonthly,
          estMaintenanceMonthly: pg.estMaintenanceMonthly,
          commuteCostEstMonthly: routeMetrics.commuteCostEstMonthly,
        });

        return {
          ...pg,
          isVerified: pg.isDemoData ? false : Boolean(pg.isVerified),
          averageRating: avgRating,
          reviewCount: pg.reviews.length || pg.reviewCount || 1,
          distanceMeters: routeMetrics.distanceMeters,
          distanceKm: routeMetrics.distanceKm,
          commuteTimeMins: routeMetrics.commuteTimeMins,
          commuteMode: routeMetrics.commuteMode,
          commuteCostEstMonthly: routeMetrics.commuteCostEstMonthly,
          commuteFareFormula: routeMetrics.commuteFareFormula,
          trueMonthlyCostBreakdown: costBreakdown,
          trueMonthlyCost: costBreakdown.totalMonthlyCost,
          matchScore: Math.min(99, Math.max(75, Math.round(98 - routeMetrics.distanceKm * 3))),
        };
      })
    );

    const filteredByDistance = input.maxDistanceKm
      ? enrichedPgs.filter(p => p.distanceKm <= input.maxDistanceKm!)
      : enrichedPgs;

    const total = filteredByDistance.length;
    const paginatedPgs = filteredByDistance.slice((page - 1) * pageSize, page * pageSize);

    return {
      pgs: paginatedPgs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      selectedCollege,
    };
  }
}
