import { AgentState, CandidatePGScore } from '../AgentState';
import { PGSearchService } from '@/services/PGSearchService';
import { MatchScoringEngine } from '../MatchScoringEngine';

export class PGMatcherAgent {
  /**
   * Executes the PG Matcher Agent using PGSearchService and MatchScoringEngine.
   */
  static async execute(state: AgentState): Promise<AgentState> {
    const startTime = Date.now();
    const prefs = state.studentPreferences;

    // 1. Query candidates from PGSearchService
    const searchResult = await PGSearchService.searchPgs({
      collegeId: prefs.targetCollegeId || 1,
      genderRestriction: prefs.genderRestriction,
      roomType: prefs.preferredRoomType,
      foodType: prefs.foodPreference,
      acRequired: prefs.acRequired,
      maxRent: prefs.maxBudget,
      maxDistanceKm: prefs.maxDistanceKm || 15,
      page: 1,
      pageSize: 50,
    });

    state.selectedCollege = searchResult.selectedCollege;
    let rawCandidates = searchResult.pgs;

    // 2. Fallback: If no candidate passed strict search query filters, perform broad search to identify closest candidates
    if (rawCandidates.length === 0) {
      state.warnings.push(
        'No PGs matched all strict hard constraints. Retrieving closest available candidates with constraint violations.'
      );
      const fallbackSearchResult = await PGSearchService.searchPgs({
        collegeId: prefs.targetCollegeId || 1,
        page: 1,
        pageSize: 50,
      });
      rawCandidates = fallbackSearchResult.pgs;
    }

    // 3. Compute deterministic match scores for all retrieved candidates
    const scoredCandidates: Array<{ pg: any; scoreInfo: CandidatePGScore }> = rawCandidates.map(
      pg => {
        const scoreInfo = MatchScoringEngine.scoreCandidate(pg, prefs);
        return { pg, scoreInfo };
      }
    );

    // 4. Filter or sort candidates by total score descending
    scoredCandidates.sort((a, b) => b.scoreInfo.totalScore - a.scoreInfo.totalScore);

    // Attach candidates and scores to state
    state.candidatePGs = scoredCandidates.map(c => c.pg);
    state.deterministicScores = scoredCandidates.map(c => c.scoreInfo);

    state.executionMetadata.agentTimings['PGMatcherAgent'] = Date.now() - startTime;
    return state;
  }
}
