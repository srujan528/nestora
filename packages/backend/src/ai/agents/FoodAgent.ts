import { AgentState } from '../AgentState';
import { AITools } from '../tools';

export interface FoodAnalysisItem {
  pgId: number;
  foodType: string;
  mealOption: string;
  foodIncludedInRent: boolean;
  extraFoodCharges: number;
  hasMenu: boolean;
  menuId?: number;
  breakfastAvailable: boolean;
  lunchAvailable: boolean;
  dinnerAvailable: boolean;
  menuSummary: string;
}

export class FoodAgent {
  /**
   * Executes Food Intelligence Analysis querying WeeklyMenu records and food options.
   */
  static async execute(state: AgentState): Promise<AgentState> {
    const startTime = Date.now();
    const candidates = state.candidatePGs || [];
    const foodAnalysis: Record<number, FoodAnalysisItem> = {};

    for (const pg of candidates) {
      try {
        const menu = await AITools.getWeeklyMenuForPG(pg.id);

        const mealOpt = pg.mealOption || 'BREAKFAST_LUNCH_DINNER';
        const breakfastAvailable = mealOpt.includes('BREAKFAST');
        const lunchAvailable = mealOpt.includes('LUNCH') || mealOpt.includes('BREAKFAST_LUNCH_DINNER');
        const dinnerAvailable = mealOpt.includes('DINNER');

        if (menu) {
          foodAnalysis[pg.id] = {
            pgId: pg.id,
            foodType: pg.foodType || 'VEG_ONLY',
            mealOption: mealOpt,
            foodIncludedInRent: pg.foodIncludedInRent ?? true,
            extraFoodCharges: pg.extraFoodCharges || 0,
            hasMenu: true,
            menuId: menu.id,
            breakfastAvailable,
            lunchAvailable,
            dinnerAvailable,
            menuSummary: `Weekly mess menu available (Monday: ${menu.monday.slice(0, 40)}...)`,
          };
        } else {
          foodAnalysis[pg.id] = {
            pgId: pg.id,
            foodType: pg.foodType || 'VEG_ONLY',
            mealOption: mealOpt,
            foodIncludedInRent: pg.foodIncludedInRent ?? true,
            extraFoodCharges: pg.extraFoodCharges || 0,
            hasMenu: false,
            breakfastAvailable,
            lunchAvailable,
            dinnerAvailable,
            menuSummary: 'Food menu not provided.',
          };
        }
      } catch (err) {
        foodAnalysis[pg.id] = {
          pgId: pg.id,
          foodType: pg.foodType || 'VEG_ONLY',
          mealOption: 'UNKNOWN',
          foodIncludedInRent: true,
          extraFoodCharges: 0,
          hasMenu: false,
          breakfastAvailable: false,
          lunchAvailable: false,
          dinnerAvailable: false,
          menuSummary: 'Food menu not provided.',
        };
      }
    }

    state.foodAnalysis = foodAnalysis;
    state.executionMetadata.agentTimings['FoodAgent'] = Date.now() - startTime;
    return state;
  }
}
