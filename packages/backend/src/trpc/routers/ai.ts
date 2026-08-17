import { z } from 'zod';
import { publicProcedure } from '../trpc';
import { LangGraphRunner } from '@/ai/LangGraphRunner';

const recommendationInputSchema = z.object({
  prompt: z.string().min(2, 'Prompt must be at least 2 characters'),
  collegeId: z.number().optional(),
});

export const aiRouter = {
  getRecommendation: publicProcedure
    .input(recommendationInputSchema)
    .query(async ({ input, ctx }) => {
      const studentId = ctx.user?.role === 'STUDENT' ? ctx.user.id : undefined;
      const state = await LangGraphRunner.runRecommendationPipeline(
        input.prompt,
        studentId,
        input.collegeId
      );

      return {
        workflowId: state.workflowId,
        naturalLanguageRequest: state.naturalLanguageRequest,
        selectedCollege: state.selectedCollege,
        studentPreferences: state.studentPreferences,
        requiredAgentsToRun: state.requiredAgentsToRun,
        recommendations: state.finalRecommendations,
        warnings: state.warnings,
        errors: state.errors,
        executionMetadata: state.executionMetadata,
      };
    }),
};
