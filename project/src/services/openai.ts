import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export class OpenAIService {
  private static async makeRequest<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error('OpenAI API error:', error);
      if (error instanceof Error) {
        throw new Error(`OpenAI API Error: ${error.message}`);
      }
      throw new Error('An unexpected error occurred while calling OpenAI API');
    }
  }

  static async generateResponse(message: string): Promise<string> {
    return this.makeRequest(async () => {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a Meta Ads targeting expert. When suggesting interests, provide single words only, no brackets, numbers, or additional formatting. Each suggestion should be a valid Meta Ads interest."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
    });
  }

  static async generateInterestSuggestions(currentInterests: string[]): Promise<string[]> {
    return this.makeRequest(async () => {
      if (!currentInterests.length) {
        throw new Error('At least one interest is required');
      }

      const prompt = `Based on these Meta Ads interests: ${currentInterests.join(', ')}

Please suggest 5 additional highly relevant targeting interests. Provide ONLY single words, separated by commas. Each word must be a valid Meta Ads interest. No formatting, no numbers, no brackets.

Example good response: Fashion, Technology, Sports, Travel, Music
Example bad response: 1. [Fashion] 2. [Technology]`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a Meta Ads targeting expert. Provide only single-word interests, separated by commas. No formatting, no numbers, no brackets."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      });

      const suggestions = response.choices[0].message.content
        ?.split(',')
        .map(s => s.trim())
        .filter(s => s && !currentInterests.includes(s))
        .slice(0, 5) || [];

      if (!suggestions.length) {
        throw new Error('No valid suggestions could be generated');
      }

      return suggestions;
    });
  }

  static async analyzeBusinessDescription(description: string, options: { location: string }): Promise<any> {
    return this.makeRequest(async () => {
      if (!description.trim()) {
        throw new Error('Business description is required');
      }

      const prompt = `Analyze this business for Meta Ads targeting in ${options.location}:
      "${description}"
      
      Provide single-word interests only, no formatting. Focus on specific, targetable interests in Meta Ads.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a Meta Ads targeting expert. Provide only single-word interests that are valid in Meta Ads targeting. No formatting, no numbers, no brackets."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      if (!result.primaryInterests?.length) {
        throw new Error('Failed to generate meaningful analysis');
      }

      return result;
    });
  }
}