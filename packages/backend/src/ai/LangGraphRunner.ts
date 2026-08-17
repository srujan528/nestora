import { AgentState, createInitialAgentState } from './AgentState';
import { SupervisorRouter } from './SupervisorRouter';
import { StudentProfilerAgent } from './agents/StudentProfilerAgent';
import { PGMatcherAgent } from './agents/PGMatcherAgent';
import { CommuteAgent } from './agents/CommuteAgent';
import { FoodAgent } from './agents/FoodAgent';
import { ReviewAgent } from './agents/ReviewAgent';
import { CostAgent } from './agents/CostAgent';
import { VerificationAgent } from './agents/VerificationAgent';
import { DecisionAgent } from './agents/DecisionAgent';

export class LangGraphRunner {
  /**
   * Runs the Supervisor pass.
   */
  static async runInitialSupervisorPass(requestText: string, studentId?: number): Promise<AgentState> {
    const state = createInitialAgentState(requestText, studentId);
    const routingDecision = await SupervisorRouter.route(state);

    state.requiredAgentsToRun = routingDecision.requiredAgents;
    state.executionMetadata.agentTimings['SUPERVISOR'] = Date.now() - state.executionMetadata.startTime;

    return state;
  }

  /**
   * Executes the Stage 4C Multi-Agent Workflow with Failure Isolation & Conditional Routing.
   */
  static async runRecommendationPipeline(requestText: string, studentId?: number, collegeId?: number): Promise<AgentState> {
    // 1. Initialize State & Supervisor Pass
    let state = await this.runInitialSupervisorPass(requestText, studentId);

    if (collegeId) {
      state.studentPreferences.targetCollegeId = collegeId;
    }

    // 2. Student Profiler Agent
    try {
      state = await StudentProfilerAgent.execute(state);
    } catch (err) {
      state.warnings.push('Student profiler agent failed, using fallback prompt parser.');
    }

    // 3. PG Matcher Agent
    try {
      state = await PGMatcherAgent.execute(state);
    } catch (err) {
      state.errors.push('PG Matcher Agent failed to retrieve candidates.');
    }

    // 4. Specialized Intelligence Agents with Failure Isolation
    const agents = state.requiredAgentsToRun;

    if (agents.includes('COMMUTE')) {
      try {
        state = await CommuteAgent.execute(state);
      } catch (err) {
        state.warnings.push('Commute analysis unavailable.');
      }
    }

    if (agents.includes('FOOD')) {
      try {
        state = await FoodAgent.execute(state);
      } catch (err) {
        state.warnings.push('Food analysis unavailable.');
      }
    }

    if (agents.includes('REVIEW')) {
      try {
        state = await ReviewAgent.execute(state);
      } catch (err) {
        state.warnings.push('Review analysis unavailable.');
      }
    }

    if (agents.includes('COST')) {
      try {
        state = await CostAgent.execute(state);
      } catch (err) {
        state.warnings.push('Cost analysis unavailable.');
      }
    }

    if (agents.includes('VERIFICATION')) {
      try {
        state = await VerificationAgent.execute(state);
      } catch (err) {
        state.warnings.push('Verification analysis unavailable.');
      }
    }

    // 5. Decision & Recommendation Agent
    try {
      state = await DecisionAgent.execute(state);
    } catch (err) {
      state.errors.push('Decision agent synthesis failed.');
    }

    return state;
  }
}
