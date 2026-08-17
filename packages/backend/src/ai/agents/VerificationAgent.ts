import { AgentState } from '../AgentState';

export interface VerificationAnalysisItem {
  pgId: number;
  isVerified: boolean;
  isDemoData: boolean;
  verificationState: 'VERIFIED' | 'NEEDS_VERIFICATION' | 'DEMO_SEED_DATA';
  completenessScore: number; // 0 - 100%
  missingFields: string[];
  warnings: string[];
  trustSummary: string;
}

export class VerificationAgent {
  /**
   * Executes Listing Verification & Trust Audit.
   */
  static async execute(state: AgentState): Promise<AgentState> {
    const startTime = Date.now();
    const candidates = state.candidatePGs || [];
    const verificationResults: Record<number, VerificationAnalysisItem> = {};

    for (const pg of candidates) {
      const missingFields: string[] = [];
      const warnings: string[] = [];
      let points = 0;

      // 1. Photos Check (20 pts)
      const photoCount = pg.photos?.length || 0;
      if (photoCount >= 3) points += 20;
      else if (photoCount > 0) points += 10;
      else missingFields.push('Photos (no room/building photos uploaded)');

      // 2. Room Configuration Check (20 pts)
      const roomCount = pg.rooms?.length || 0;
      if (roomCount >= 1) points += 20;
      else missingFields.push('Room Types (no room sharing options configured)');

      // 3. Weekly Mess Menu Check (20 pts)
      if (pg.weeklyMenu || state.foodAnalysis?.[pg.id]?.hasMenu) points += 20;
      else missingFields.push('Weekly Mess Menu');

      // 4. Amenities Check (20 pts)
      const amenityCount = pg.amenities?.length || 0;
      if (amenityCount >= 3) points += 20;
      else if (amenityCount > 0) points += 10;
      else missingFields.push('Detailed Amenities');

      // 5. Owner Information Check (20 pts)
      if (pg.owner?.name && (pg.owner?.phone || pg.owner?.email)) points += 20;
      else missingFields.push('Owner Contact Info');

      // Verification State Determination
      let verificationState: 'VERIFIED' | 'NEEDS_VERIFICATION' | 'DEMO_SEED_DATA';
      let trustSummary: string;

      if (pg.isDemoData) {
        verificationState = 'DEMO_SEED_DATA';
        warnings.push('DEMO LISTING — Seed data created for platform demonstration.');
        trustSummary = 'Demo listing for platform preview.';
      } else if (pg.isVerified) {
        verificationState = 'VERIFIED';
        trustSummary = 'Officially verified by Nestora admin team.';
      } else {
        verificationState = 'NEEDS_VERIFICATION';
        warnings.push('Pending official admin verification.');
        trustSummary = 'Unverified listing — proceed with owner contact & visit.';
      }

      verificationResults[pg.id] = {
        pgId: pg.id,
        isVerified: pg.isDemoData ? false : Boolean(pg.isVerified),
        isDemoData: Boolean(pg.isDemoData),
        verificationState,
        completenessScore: Math.min(100, points),
        missingFields,
        warnings,
        trustSummary,
      };
    }

    state.verificationResults = verificationResults;
    state.executionMetadata.agentTimings['VerificationAgent'] = Date.now() - startTime;
    return state;
  }
}
