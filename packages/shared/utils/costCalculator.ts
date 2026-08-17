export interface PGCostFactors {
  minRent: number;
  foodIncludedInRent?: boolean;
  extraFoodCharges?: number;
  estElectricityMonthly?: number;
  estMaintenanceMonthly?: number;
  commuteCostEstMonthly?: number;
}

export interface TrueCostBreakdown {
  baseRent: number;
  foodCost: number;
  electricityCost: number;
  maintenanceCost: number;
  commuteCost: number;
  totalMonthlyCost: number;
}

export function calculateTrueMonthlyCost(pg: PGCostFactors): TrueCostBreakdown {
  const baseRent = pg.minRent || 0;
  const foodCost = pg.foodIncludedInRent ? 0 : (pg.extraFoodCharges || 0);
  const electricityCost = pg.estElectricityMonthly || 800;
  const maintenanceCost = pg.estMaintenanceMonthly || 0;
  const commuteCost = pg.commuteCostEstMonthly || 0;

  const totalMonthlyCost = baseRent + foodCost + electricityCost + maintenanceCost + commuteCost;

  return {
    baseRent,
    foodCost,
    electricityCost,
    maintenanceCost,
    commuteCost,
    totalMonthlyCost,
  };
}
