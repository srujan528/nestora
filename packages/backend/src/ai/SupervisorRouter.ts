import { AgentState } from './AgentState';

export interface SupervisorRoutingDecision {
  intent:
    | 'RECOMMENDATION'
    | 'FOOD_QUERY'
    | 'COMMUTE_QUERY'
    | 'COST_QUERY'
    | 'VERIFICATION_QUERY'
    | 'COMPREHENSIVE_QUERY';
  requiredAgents: string[];
  reason: string;
}

export class SupervisorRouter {
  /**
   * Analyzes user prompt intent and dispatches execution ONLY to necessary specialized agents.
   */
  static async route(state: AgentState): Promise<SupervisorRoutingDecision> {
    const promptText = state.naturalLanguageRequest.toLowerCase();

    if (
      promptText.includes('best pg for me') ||
      promptText.includes('all details') ||
      promptText.includes('everything') ||
      promptText.includes('full report')
    ) {
      return {
        intent: 'COMPREHENSIVE_QUERY',
        requiredAgents: [
          'PROFILER',
          'MATCHER',
          'COST',
          'COMMUTE',
          'FOOD',
          'REVIEW',
          'VERIFICATION',
          'DECISION',
        ],
        reason: 'Comprehensive PG analysis intent detected.',
      };
    }

    if (
      promptText.includes('food') ||
      promptText.includes('mess') ||
      promptText.includes('menu') ||
      promptText.includes('veg') ||
      promptText.includes('breakfast')
    ) {
      return {
        intent: 'FOOD_QUERY',
        requiredAgents: ['PROFILER', 'MATCHER', 'FOOD', 'REVIEW', 'DECISION'],
        reason: 'Food & mess menu inquiry detected.',
      };
    }

    if (
      promptText.includes('commute') ||
      promptText.includes('distance') ||
      promptText.includes('walk') ||
      promptText.includes('drive') ||
      promptText.includes('metro') ||
      promptText.includes('shortest')
    ) {
      return {
        intent: 'COMMUTE_QUERY',
        requiredAgents: ['PROFILER', 'MATCHER', 'COMMUTE', 'DECISION'],
        reason: 'Commute & location inquiry detected.',
      };
    }

    if (
      promptText.includes('cost') ||
      promptText.includes('budget') ||
      promptText.includes('electricity') ||
      promptText.includes('cheap') ||
      promptText.includes('true cost')
    ) {
      return {
        intent: 'COST_QUERY',
        requiredAgents: ['PROFILER', 'MATCHER', 'COST', 'DECISION'],
        reason: 'Budget & true cost analyst inquiry detected.',
      };
    }

    if (
      promptText.includes('verify') ||
      promptText.includes('trust') ||
      promptText.includes('safe') ||
      promptText.includes('demo')
    ) {
      return {
        intent: 'VERIFICATION_QUERY',
        requiredAgents: ['PROFILER', 'MATCHER', 'VERIFICATION', 'REVIEW', 'DECISION'],
        reason: 'Verification & trust audit intent detected.',
      };
    }

    // Default recommendation intent
    return {
      intent: 'RECOMMENDATION',
      requiredAgents: ['PROFILER', 'MATCHER', 'COST', 'COMMUTE', 'DECISION'],
      reason: 'General PG accommodation search intent.',
    };
  }
}
