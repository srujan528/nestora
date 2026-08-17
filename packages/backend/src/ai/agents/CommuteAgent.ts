import { AgentState } from '../AgentState';
import { GoogleRoutesService } from '../../services/GoogleRoutesService';

export interface CommuteAnalysisItem {
  pgId: number;
  distanceKm: number;
  commuteTimeMins: number;
  commuteMode: 'WALKING' | 'DRIVING' | 'TRANSIT';
  commuteCostEstMonthly: number;
  commuteFareFormula: string;
  satisfiesCommuteRequirement: boolean;
  statusMessage: string;
}

export class CommuteAgent {
  /**
   * Executes Commute & Location Intelligence Analysis.
   */
  static async execute(state: AgentState): Promise<AgentState> {
    const startTime = Date.now();
    const college = state.selectedCollege;
    const candidates = state.candidatePGs || [];
    const maxMins = state.studentPreferences.maxCommuteMins || 30;

    const commuteResults: Record<number, CommuteAnalysisItem> = {};

    for (const pg of candidates) {
      try {
        let routeData = {
          distanceKm: pg.distanceKm,
          commuteTimeMins: pg.commuteTimeMins,
          commuteMode: pg.commuteMode || 'WALKING',
          commuteCostEstMonthly: pg.commuteCostEstMonthly || 0,
          commuteFareFormula: pg.commuteFareFormula || 'Walking (₹0)',
        };

        if (college && (pg.distanceKm === undefined || pg.distanceKm === null)) {
          const calc = await GoogleRoutesService.computeDistanceAndCommute(
            { latitude: college.latitude, longitude: college.longitude },
            { latitude: pg.latitude, longitude: pg.longitude }
          );
          routeData = {
            distanceKm: calc.distanceKm,
            commuteTimeMins: calc.commuteTimeMins,
            commuteMode: calc.commuteMode,
            commuteCostEstMonthly: calc.commuteCostEstMonthly,
            commuteFareFormula: calc.commuteFareFormula,
          };
        }

        const satisfies = routeData.commuteTimeMins <= maxMins;
        commuteResults[pg.id] = {
          pgId: pg.id,
          distanceKm: routeData.distanceKm,
          commuteTimeMins: routeData.commuteTimeMins,
          commuteMode: routeData.commuteMode as any,
          commuteCostEstMonthly: routeData.commuteCostEstMonthly,
          commuteFareFormula: routeData.commuteFareFormula,
          satisfiesCommuteRequirement: satisfies,
          statusMessage: satisfies
            ? `Within your ${maxMins}-min commute limit (${routeData.commuteTimeMins} min ${routeData.commuteMode.toLowerCase()})`
            : `Exceeds your ${maxMins}-min commute limit (${routeData.commuteTimeMins} min ${routeData.commuteMode.toLowerCase()})`,
        };
      } catch (err) {
        commuteResults[pg.id] = {
          pgId: pg.id,
          distanceKm: 0,
          commuteTimeMins: 0,
          commuteMode: 'WALKING',
          commuteCostEstMonthly: 0,
          commuteFareFormula: 'Unavailable',
          satisfiesCommuteRequirement: true,
          statusMessage: 'Commute information unavailable.',
        };
      }
    }

    state.commuteResults = commuteResults;
    state.executionMetadata.agentTimings['CommuteAgent'] = Date.now() - startTime;
    return state;
  }
}
