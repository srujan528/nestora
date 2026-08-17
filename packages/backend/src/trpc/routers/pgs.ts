import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, ownerProcedure } from '../trpc';
import { prisma, ListingStatus, GenderRestriction, FoodType, MealOption, calculateTrueMonthlyCost } from '@qrent/shared';
import { GoogleRoutesService } from '@/services/GoogleRoutesService';
import { PGSearchService } from '@/services/PGSearchService';

const pgFilterSchema = z.object({
  collegeId: z.number().optional(),
  city: z.string().optional(),
  minRent: z.number().optional(),
  maxRent: z.number().optional(),
  genderRestriction: z.enum(['BOYS', 'GIRLS', 'CO_ED']).optional(),
  roomType: z.enum(['SINGLE', 'DOUBLE_SHARING', 'TRIPLE_SHARING', 'FOUR_SHARING', 'PRIVATE_ROOM', 'FULL_FLAT']).optional(),
  foodType: z.enum(['VEG_ONLY', 'NON_VEG_ALLOWED', 'JAIN_AVAILABLE', 'NO_FOOD']).optional(),
  acRequired: z.boolean().optional(),
  maxDistanceKm: z.number().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),
});

export const pgsRouter = {
  list: publicProcedure.input(pgFilterSchema).query(async ({ input, ctx }) => {
    return PGSearchService.searchPgs({
      ...input,
      userRole: ctx.user?.role,
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const pg = await prisma.pGListing.findUnique({
        where: { id: input.id },
        include: {
          college: true,
          owner: {
            select: { id: true, name: true, phone: true, email: true },
          },
          rooms: true,
          photos: {
            orderBy: { displayOrder: 'asc' },
          },
          amenities: true,
          weeklyMenu: true,
          reviews: {
            include: {
              user: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!pg) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'PG listing not found' });
      }

      let routeMetrics = {
        distanceMeters: pg.distanceMeters,
        distanceKm: parseFloat((pg.distanceMeters / 1000).toFixed(2)),
        commuteTimeMins: pg.commuteTimeMins,
        commuteMode: pg.commuteMode as any,
        commuteCostEstMonthly: pg.commuteCostEstMonthly,
        commuteFareFormula: pg.commuteFareFormula,
      };

      if (pg.college) {
        const calcResult = await GoogleRoutesService.computeDistanceAndCommute(
          { latitude: pg.college.latitude, longitude: pg.college.longitude },
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
        distanceMeters: routeMetrics.distanceMeters,
        distanceKm: routeMetrics.distanceKm,
        commuteTimeMins: routeMetrics.commuteTimeMins,
        commuteMode: routeMetrics.commuteMode,
        commuteCostEstMonthly: routeMetrics.commuteCostEstMonthly,
        commuteFareFormula: routeMetrics.commuteFareFormula,
        trueMonthlyCostBreakdown: costBreakdown,
        trueMonthlyCost: costBreakdown.totalMonthlyCost,
      };
    }),

  getOwnerListings: ownerProcedure.query(async ({ ctx }) => {
    const where = ctx.user.role === 'ADMIN' ? {} : { ownerId: ctx.userId };
    const pgs = await prisma.pGListing.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        college: true,
        rooms: true,
        photos: true,
        amenities: true,
        weeklyMenu: true,
        inquiries: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
      },
    });
    return pgs;
  }),

  create: ownerProcedure
    .input(
      z.object({
        title: z.string().min(3).max(200),
        collegeId: z.number(),
        address: z.string().min(5),
        locality: z.string().min(2),
        city: z.string().min(2),
        pincode: z.string().min(6).max(10),
        latitude: z.number().default(28.6139),
        longitude: z.number().default(77.2090),
        genderRestriction: z.enum(['BOYS', 'GIRLS', 'CO_ED']),
        curfewTime: z.string().optional(),
        noticePeriodDays: z.number().default(30),
        houseRules: z.string().optional(),
        minRent: z.number().positive(),
        maxRent: z.number().positive(),
        securityDeposit: z.number().nonnegative(),
        estElectricityMonthly: z.number().default(800),
        estMaintenanceMonthly: z.number().default(0),
        foodType: z.enum(['VEG_ONLY', 'NON_VEG_ALLOWED', 'JAIN_AVAILABLE', 'NO_FOOD']).default('VEG_ONLY'),
        mealOption: z.enum(['BREAKFAST_LUNCH_DINNER', 'BREAKFAST_DINNER_ONLY', 'LUNCH_DINNER_ONLY', 'OPTIONAL_MESS', 'SELF_COOKING']).default('BREAKFAST_LUNCH_DINNER'),
        foodIncludedInRent: z.boolean().default(true),
        extraFoodCharges: z.number().default(0),
        description: z.string().min(10),
        status: z.enum(['DRAFT', 'PUBLISHED', 'UNPUBLISHED']).default('DRAFT'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const pg = await prisma.pGListing.create({
        data: {
          title: input.title,
          collegeId: input.collegeId,
          address: input.address,
          locality: input.locality,
          city: input.city,
          pincode: input.pincode,
          latitude: input.latitude,
          longitude: input.longitude,
          genderRestriction: (GenderRestriction as any)[input.genderRestriction] || input.genderRestriction,
          curfewTime: input.curfewTime || null,
          noticePeriodDays: input.noticePeriodDays,
          houseRules: input.houseRules || null,
          minRent: input.minRent,
          maxRent: input.maxRent,
          securityDeposit: input.securityDeposit,
          estElectricityMonthly: input.estElectricityMonthly,
          estMaintenanceMonthly: input.estMaintenanceMonthly,
          foodType: (FoodType as any)[input.foodType] || input.foodType,
          mealOption: (MealOption as any)[input.mealOption] || input.mealOption,
          foodIncludedInRent: input.foodIncludedInRent,
          extraFoodCharges: input.extraFoodCharges,
          description: input.description,
          status: (ListingStatus as any)[input.status] || input.status,
          ownerId: ctx.userId,
          isDemoData: false,
          isVerified: false,
        },
        include: {
          college: true,
          rooms: true,
          photos: true,
        },
      });

      return pg;
    }),

  update: ownerProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(3).max(200).optional(),
        collegeId: z.number().optional(),
        address: z.string().min(5).optional(),
        locality: z.string().min(2).optional(),
        city: z.string().min(2).optional(),
        pincode: z.string().min(6).max(10).optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        genderRestriction: z.enum(['BOYS', 'GIRLS', 'CO_ED']).optional(),
        curfewTime: z.string().optional(),
        noticePeriodDays: z.number().optional(),
        houseRules: z.string().optional(),
        minRent: z.number().positive().optional(),
        maxRent: z.number().positive().optional(),
        securityDeposit: z.number().nonnegative().optional(),
        estElectricityMonthly: z.number().optional(),
        estMaintenanceMonthly: z.number().optional(),
        foodType: z.enum(['VEG_ONLY', 'NON_VEG_ALLOWED', 'JAIN_AVAILABLE', 'NO_FOOD']).optional(),
        mealOption: z.enum(['BREAKFAST_LUNCH_DINNER', 'BREAKFAST_DINNER_ONLY', 'LUNCH_DINNER_ONLY', 'OPTIONAL_MESS', 'SELF_COOKING']).optional(),
        foodIncludedInRent: z.boolean().optional(),
        extraFoodCharges: z.number().optional(),
        description: z.string().min(10).optional(),
        status: z.enum(['DRAFT', 'PUBLISHED', 'UNPUBLISHED']).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await prisma.pGListing.findUnique({ where: { id: input.id } });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'PG listing not found' });
      }

      if (existing.ownerId !== ctx.userId && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to edit this PG listing' });
      }

      const { id, ...data } = input;
      const updated = await prisma.pGListing.update({
        where: { id },
        data: data as any,
      });

      return updated;
    }),

  updateStatus: ownerProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(['DRAFT', 'PUBLISHED', 'UNPUBLISHED']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await prisma.pGListing.findUnique({
        where: { id: input.id },
        include: { rooms: true },
      });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'PG listing not found' });
      }

      if (existing.ownerId !== ctx.userId && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to modify this PG listing' });
      }

      if (input.status === 'PUBLISHED' && existing.rooms.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot publish PG without at least one room type configured' });
      }

      const updated = await prisma.pGListing.update({
        where: { id: input.id },
        data: {
          status: (ListingStatus as any)[input.status] || input.status,
          publishedAt: input.status === 'PUBLISHED' ? new Date() : existing.publishedAt,
        },
      });

      return updated;
    }),

  delete: ownerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const existing = await prisma.pGListing.findUnique({ where: { id: input.id } });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'PG listing not found' });
      }

      if (existing.ownerId !== ctx.userId && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to delete this PG listing' });
      }

      await prisma.pGListing.delete({ where: { id: input.id } });
      return { success: true };
    }),
};
