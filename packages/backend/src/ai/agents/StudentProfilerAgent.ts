import { AgentState, StudentPreferences } from '../AgentState';
import { getLLMProvider } from '../LLMProviderWrapper';
import { prisma } from '@qrent/shared';

export class StudentProfilerAgent {
  /**
   * Fast deterministic keyword parser for fallback extraction.
   */
  static parsePreferencesFromPrompt(text: string): Partial<StudentPreferences> {
    const prompt = text.toLowerCase();
    const extracted: Partial<StudentPreferences> = {};

    // Budget extraction (e.g. "10k", "10,000", "₹12000", "under 15000")
    const budgetMatch =
      prompt.match(/\b(\d{1,2})\s*k\b/i) ||
      prompt.match(/(?:under|budget|max|around|₹|\$)\s*(\d{4,5})\b/i) ||
      prompt.match(/\b(\d{4,5})\b/);
    if (budgetMatch) {
      const val = parseInt(budgetMatch[1], 10);
      extracted.maxBudget = val < 100 ? val * 1000 : val;
    }

    // Sharing preference
    if (prompt.includes('single')) extracted.preferredRoomType = 'SINGLE';
    else if (prompt.includes('double')) extracted.preferredRoomType = 'DOUBLE_SHARING';
    else if (prompt.includes('triple')) extracted.preferredRoomType = 'TRIPLE_SHARING';
    else if (prompt.includes('four')) extracted.preferredRoomType = 'FOUR_SHARING';

    // Gender restriction
    if (prompt.includes('boys') || prompt.includes('boy')) extracted.genderRestriction = 'BOYS';
    else if (prompt.includes('girls') || prompt.includes('girl'))
      extracted.genderRestriction = 'GIRLS';
    else if (prompt.includes('co-ed') || prompt.includes('coed'))
      extracted.genderRestriction = 'CO_ED';

    // Food preference
    if (prompt.includes('veg') || prompt.includes('vegetarian'))
      extracted.foodPreference = 'VEG_ONLY';
    else if (prompt.includes('non-veg') || prompt.includes('non veg'))
      extracted.foodPreference = 'NON_VEG_ALLOWED';

    // AC requirement
    if (prompt.includes('ac') && !prompt.includes('non-ac') && !prompt.includes('non ac')) {
      extracted.acRequired = true;
    } else if (prompt.includes('non-ac') || prompt.includes('non ac')) {
      extracted.acRequired = false;
    }

    // Commute time (e.g. "20 min", "15 minutes")
    const commuteMatch = prompt.match(/(\d{1,2})\s*(?:min|minute|mins)/);
    if (commuteMatch) {
      extracted.maxCommuteMins = parseInt(commuteMatch[1], 10);
    }

    return extracted;
  }

  /**
   * Executes the Student Profiler Agent, combining DB profile data with prompt overrides.
   */
  static async execute(state: AgentState): Promise<AgentState> {
    const startTime = Date.now();
    const prefs: StudentPreferences = { ...state.studentPreferences };

    // 1. Fetch existing StudentProfile from DB if studentId is provided
    if (state.studentId) {
      try {
        const storedProfile = await prisma.studentProfile.findUnique({
          where: { userId: state.studentId },
          include: { college: true },
        });

        if (storedProfile) {
          prefs.targetCollegeId = storedProfile.collegeId || prefs.targetCollegeId;
          prefs.targetCollegeName = storedProfile.college?.name || prefs.targetCollegeName;
          prefs.minBudget = storedProfile.minBudget || prefs.minBudget;
          prefs.maxBudget = storedProfile.maxBudget || prefs.maxBudget;
          prefs.preferredRoomType =
            (storedProfile.preferredSharing as any) || prefs.preferredRoomType;
          prefs.foodPreference = (storedProfile.foodPreference as any) || prefs.foodPreference;
          prefs.acRequired = storedProfile.acRequired ?? prefs.acRequired;
          prefs.maxCommuteMins = storedProfile.maxCommuteTimeMins || prefs.maxCommuteMins;
        }
      } catch (err) {
        state.warnings.push(`Could not fetch stored profile for student #${state.studentId}`);
      }
    }

    // 2. Attempt LLM extraction for prompt context
    const llm = getLLMProvider();
    try {
      const llmExtracted = await llm.generateStructuredJSON<Partial<StudentPreferences>>(
        `Analyze this student accommodation request: "${state.naturalLanguageRequest}". Extract budget, room sharing, gender, food preference, AC requirement, and max commute minutes. Represent unmentioned fields as null.`,
        'StudentPreferences Schema: { maxBudget?: number, preferredRoomType?: string, genderRestriction?: string, foodPreference?: string, acRequired?: boolean, maxCommuteMins?: number }'
      );

      if (llmExtracted.maxBudget) prefs.maxBudget = llmExtracted.maxBudget;
      if (llmExtracted.preferredRoomType) prefs.preferredRoomType = llmExtracted.preferredRoomType;
      if (llmExtracted.genderRestriction) prefs.genderRestriction = llmExtracted.genderRestriction;
      if (llmExtracted.foodPreference) prefs.foodPreference = llmExtracted.foodPreference;
      if (llmExtracted.acRequired !== undefined) prefs.acRequired = llmExtracted.acRequired;
      if (llmExtracted.maxCommuteMins) prefs.maxCommuteMins = llmExtracted.maxCommuteMins;
    } catch {
      // 3. Fallback to deterministic regex parser
      const parsed = this.parsePreferencesFromPrompt(state.naturalLanguageRequest);
      if (parsed.maxBudget) prefs.maxBudget = parsed.maxBudget;
      if (parsed.preferredRoomType) prefs.preferredRoomType = parsed.preferredRoomType;
      if (parsed.genderRestriction) prefs.genderRestriction = parsed.genderRestriction;
      if (parsed.foodPreference) prefs.foodPreference = parsed.foodPreference;
      if (parsed.acRequired !== undefined) prefs.acRequired = parsed.acRequired;
      if (parsed.maxCommuteMins) prefs.maxCommuteMins = parsed.maxCommuteMins;
    }

    // Always re-apply deterministic parse to guarantee prompt overrides stored profile
    const promptOverrides = this.parsePreferencesFromPrompt(state.naturalLanguageRequest);
    if (promptOverrides.maxBudget) prefs.maxBudget = promptOverrides.maxBudget;
    if (promptOverrides.preferredRoomType)
      prefs.preferredRoomType = promptOverrides.preferredRoomType;
    if (promptOverrides.genderRestriction)
      prefs.genderRestriction = promptOverrides.genderRestriction;
    if (promptOverrides.foodPreference) prefs.foodPreference = promptOverrides.foodPreference;
    if (promptOverrides.acRequired !== undefined) prefs.acRequired = promptOverrides.acRequired;
    if (promptOverrides.maxCommuteMins) prefs.maxCommuteMins = promptOverrides.maxCommuteMins;

    // Resolve target college from prompt if collegeId not set
    if (!prefs.targetCollegeId) {
      const colleges = await prisma.college.findMany();
      const promptLower = state.naturalLanguageRequest.toLowerCase();
      const matched = colleges.find(
        c =>
          promptLower.includes(c.name.toLowerCase()) ||
          (c.shortName && promptLower.includes(c.shortName.toLowerCase())) ||
          promptLower.includes(c.city.toLowerCase())
      );
      if (matched) {
        prefs.targetCollegeId = matched.id;
        prefs.targetCollegeName = matched.name;
      } else if (colleges.length > 0) {
        // Default to first college (e.g. DU North Campus) if unmentioned
        prefs.targetCollegeId = colleges[0].id;
        prefs.targetCollegeName = colleges[0].name;
      }
    }

    state.studentPreferences = prefs;
    state.executionMetadata.agentTimings['StudentProfilerAgent'] = Date.now() - startTime;
    return state;
  }
}
