import { AgentState } from '../AgentState';
import { calculateTrueMonthlyCost, TrueCostBreakdown } from '@qrent/shared';

export interface CostAnalysisItem {
  pgId: number;
  baseRent: number;
  securityDeposit: number;
  costBreakdown: TrueCostBreakdown;
  totalMonthlyCost: number;
  estimatedAnnualCost: number;
  maxBudget: number;
  withinBudget: boolean;
  budgetDifference: number; // positive = under budget, negative = over budget
  knownCosts: string[];
  estimatedCosts: string[];
  missingCostFields: string[];
  statusMessage: string;
}

export class CostAgent {
  /**
   * Executes Budget & Cost Analyst Agent using calculateTrueMonthlyCost.
   */
  static async execute(state: AgentState): Promise<AgentState> {
    const startTime = Date.now();
    const candidates = state.candidatePGs || [];
    const maxBudget = state.studentPreferences.maxBudget || 20000;
    const costAnalysis: Record<number, CostAnalysisItem> = {};

    for (const pg of candidates) {
      try {
        const breakdown = calculateTrueMonthlyCost({
          minRent: pg.minRent,
          foodIncludedInRent: pg.foodIncludedInRent,
          extraFoodCharges: pg.extraFoodCharges,
          estElectricityMonthly: pg.estElectricityMonthly,
          estMaintenanceMonthly: pg.estMaintenanceMonthly,
          commuteCostEstMonthly: pg.commuteCostEstMonthly || 0,
        });

        const totalMonthly = breakdown.totalMonthlyCost;
        const annualCost = totalMonthly * 12 + (pg.securityDeposit || 0);
        const budgetDiff = maxBudget - totalMonthly;
        const withinBudget = totalMonthly <= maxBudget;

        const knownCosts: string[] = ['Base Rent', 'Security Deposit'];
        if (pg.foodIncludedInRent || pg.extraFoodCharges > 0) knownCosts.push('Food Charges');

        const estimatedCosts: string[] = ['Electricity Meter Est.', 'Commute Est.'];
        if (pg.estMaintenanceMonthly > 0) estimatedCosts.push('Maintenance Est.');

        const missingCostFields: string[] = [];
        if (pg.estElectricityMonthly === undefined || pg.estElectricityMonthly === null) {
          missingCostFields.push('Electricity meter details');
        }

        costAnalysis[pg.id] = {
          pgId: pg.id,
          baseRent: pg.minRent,
          securityDeposit: pg.securityDeposit,
          costBreakdown: breakdown,
          totalMonthlyCost: totalMonthly,
          estimatedAnnualCost: annualCost,
          maxBudget,
          withinBudget,
          budgetDifference: budgetDiff,
          knownCosts,
          estimatedCosts,
          missingCostFields,
          statusMessage: withinBudget
            ? `₹${budgetDiff.toLocaleString()} under your ₹${maxBudget.toLocaleString()} budget.`
            : `Exceeds your ₹${maxBudget.toLocaleString()} budget by ₹${Math.abs(budgetDiff).toLocaleString()}/month.`,
        };
      } catch (err) {
        costAnalysis[pg.id] = {
          pgId: pg.id,
          baseRent: pg.minRent || 0,
          securityDeposit: pg.securityDeposit || 0,
          costBreakdown: {
            baseRent: pg.minRent || 0,
            foodCost: 0,
            electricityCost: 800,
            maintenanceCost: 0,
            commuteCost: 0,
            totalMonthlyCost: pg.minRent || 0,
          },
          totalMonthlyCost: pg.minRent || 0,
          estimatedAnnualCost: (pg.minRent || 0) * 12,
          maxBudget,
          withinBudget: true,
          budgetDifference: 0,
          knownCosts: ['Base Rent'],
          estimatedCosts: [],
          missingCostFields: ['Detailed cost breakdown'],
          statusMessage: 'Cost details partially available.',
        };
      }
    }

    state.costAnalysis = costAnalysis;
    state.executionMetadata.agentTimings['CostAgent'] = Date.now() - startTime;
    return state;
  }
}
