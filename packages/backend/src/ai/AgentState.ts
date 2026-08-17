import { z } from 'zod';

export interface PriorityWeights {
  budget: number; // Default 0.25
  distance: number; // Default 0.20
  roomSharing: number; // Default 0.15
  food: number; // Default 0.15
  amenities: number; // Default 0.10
  trueCost: number; // Default 0.10
  reviews: number; // Default 0.05
}

export interface StudentPreferences {
  targetCollegeId?: number;
  targetCollegeName?: string;
  minBudget?: number;
  maxBudget?: number;
  preferredRoomType?: 'SINGLE' | 'DOUBLE_SHARING' | 'TRIPLE_SHARING' | 'FOUR_SHARING';
  genderRestriction?: 'BOYS' | 'GIRLS' | 'CO_ED';
  foodPreference?: 'VEG_ONLY' | 'NON_VEG_ALLOWED';
  acRequired?: boolean;
  maxCommuteMins?: number;
  maxDistanceKm?: number;
  importantAmenities?: string[];
  priorityWeights?: PriorityWeights;
}

export interface CandidatePGScore {
  pgId: number;
  title: string;
  totalScore: number; // 0 - 100
  scoreBreakdown: {
    budgetScore: number;
    distanceScore: number;
    roomScore: number;
    foodScore: number;
    amenitiesScore: number;
    trueCostScore: number;
    reviewScore: number;
  };
  hardConstraintsPassed: boolean;
  failedConstraintReason?: string;
}

export interface AgentState {
  workflowId: string;
  studentId?: number;
  naturalLanguageRequest: string;
  studentPreferences: StudentPreferences;
  selectedCollege?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    hostelAnnualFee?: number;
  };
  candidatePGs: any[];
  deterministicScores: CandidatePGScore[];
  commuteResults?: Record<number, any>;
  foodAnalysis?: Record<number, any>;
  reviewAnalysis?: Record<number, any>;
  costAnalysis?: Record<number, any>;
  verificationResults?: Record<number, any>;
  finalRecommendations?: {
    rankedCandidates: Array<{
      pgId: number;
      title: string;
      matchScore: number;
      rank: number;
      reasons: string[];
      advantages: string[];
      tradeoffs: string[];
      warnings: string[];
      missingInfo?: string[];
      evidenceReferences?: {
        pgId: number;
        reviewIds?: number[];
        menuId?: number;
        roomIds?: number[];
      };
      trueMonthlyCost: number;
      costBreakdown: any;
      distanceKm: number;
      commuteMins: number;
      commuteMode: string;
      isDemoData: boolean;
      isVerified: boolean;
    }>;
    summaryExplanation: string;
  };
  requiredAgentsToRun: string[];
  warnings: string[];
  errors: string[];
  executionMetadata: {
    startTime: number;
    agentTimings: Record<string, number>;
  };
}

export function createInitialAgentState(requestText: string, studentId?: number): AgentState {
  return {
    workflowId: `wf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    studentId,
    naturalLanguageRequest: requestText,
    studentPreferences: {
      priorityWeights: {
        budget: 0.25,
        distance: 0.2,
        roomSharing: 0.15,
        food: 0.15,
        amenities: 0.1,
        trueCost: 0.1,
        reviews: 0.05,
      },
    },
    candidatePGs: [],
    deterministicScores: [],
    requiredAgentsToRun: ['PROFILER', 'MATCHER', 'DECISION'],
    warnings: [],
    errors: [],
    executionMetadata: {
      startTime: Date.now(),
      agentTimings: {},
    },
  };
}
