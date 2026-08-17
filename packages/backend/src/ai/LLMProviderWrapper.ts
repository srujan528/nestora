export interface ILLMProvider {
  name: string;
  generateCompletion(prompt: string, options?: any): Promise<string>;
  generateStructuredJSON<T>(prompt: string, schemaDescription: string): Promise<T>;
}

export class MockLLMProvider implements ILLMProvider {
  name = 'MockLLMProvider';

  async generateCompletion(prompt: string): Promise<string> {
    if (prompt.toLowerCase().includes('intent') || prompt.toLowerCase().includes('routing')) {
      return JSON.stringify({
        intent: 'RECOMMENDATION',
        requiredAgents: ['PROFILER', 'MATCHER', 'DECISION'],
      });
    }
    return `[Mock Response] Simulated LLM response for prompt: "${prompt.slice(0, 60)}..."`;
  }

  async generateStructuredJSON<T>(prompt: string, schemaDescription: string): Promise<T> {
    // Return structured mock outputs for prompt intents
    if (schemaDescription.includes('StudentPreferences')) {
      const promptLower = prompt.toLowerCase();
      const budgetMatch =
        promptLower.match(/\b(\d{1,2})\s*k\b/i) ||
        promptLower.match(/(?:under|budget|max|around|₹|\$)\s*(\d{4,5})\b/i);
      const budgetVal = budgetMatch
        ? parseInt(budgetMatch[1], 10) < 100
          ? parseInt(budgetMatch[1], 10) * 1000
          : parseInt(budgetMatch[1], 10)
        : undefined;

      return {
        minBudget: 5000,
        maxBudget: budgetVal || (promptLower.includes('sparse') ? undefined : 15000),
        preferredRoomType: promptLower.includes('single') ? 'SINGLE' : 'DOUBLE_SHARING',
        genderRestriction: promptLower.includes('boy')
          ? 'BOYS'
          : promptLower.includes('girl')
            ? 'GIRLS'
            : promptLower.includes('co-ed')
              ? 'CO_ED'
              : undefined,
        foodPreference: promptLower.includes('veg') ? 'VEG_ONLY' : undefined,
        acRequired: promptLower.includes('ac') && !promptLower.includes('non-ac'),
        maxCommuteMins: 20,
        importantAmenities: ['Wi-Fi', 'Power Backup'],
      } as unknown as T;
    }

    if (schemaDescription.includes('SupervisorRouting')) {
      return {
        intent: 'RECOMMENDATION',
        requiredAgents: ['PROFILER', 'MATCHER', 'DECISION'],
        reason: 'General PG accommodation search intent detected.',
      } as unknown as T;
    }

    return {
      status: 'success',
      mockData: true,
      promptSnippet: prompt.slice(0, 40),
    } as unknown as T;
  }
}

export class GeminiLLMProvider implements ILLMProvider {
  name = 'GeminiLLMProvider';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateCompletion(prompt: string): Promise<string> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );
      if (response.ok) {
        const data: any = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    } catch (err) {
      console.warn('[GeminiLLMProvider] Failed, falling back to MockLLMProvider:', err);
    }
    return new MockLLMProvider().generateCompletion(prompt);
  }

  async generateStructuredJSON<T>(prompt: string, schemaDescription: string): Promise<T> {
    const jsonPrompt = `${prompt}\n\nReturn ONLY a valid JSON object matching this schema description:\n${schemaDescription}\nDo NOT include markdown formatting or backticks.`;
    const text = await this.generateCompletion(jsonPrompt);
    try {
      const cleanJson = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(cleanJson);
    } catch {
      return new MockLLMProvider().generateStructuredJSON<T>(prompt, schemaDescription);
    }
  }
}

export function getLLMProvider(): ILLMProvider {
  const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey !== 'YOUR_GEMINI_API_KEY' && geminiKey.length > 10) {
    return new GeminiLLMProvider(geminiKey);
  }
  return new MockLLMProvider();
}
