import type { MetaAudience, DemographicData, BehaviorData } from '../types/meta';

interface AnalysisResult {
  primaryInterests: string[];
  secondaryInterests: string[];
  demographics: {
    age: string[];
    gender: string[];
    education: string[];
    income: string[];
  };
  behaviors: {
    category: string;
    items: string[];
  }[];
  rationale: string;
  marketSize: number;
  recommendations: string[];
}

export class AudienceAnalyzer {
  static analyzeBusinessType(description: string, audiences: MetaAudience[]): AnalysisResult {
    // Extract primary interests based on audience size and relevance
    const sortedAudiences = [...audiences].sort((a, b) => b.size - a.size);
    
    const primaryInterests = sortedAudiences
      .slice(0, 3)
      .map(a => a.name);

    const secondaryInterests = sortedAudiences
      .slice(3, 8)
      .map(a => a.name);

    // Aggregate demographic data
    const demographics = this.aggregateDemographics(audiences);

    // Analyze behavioral patterns
    const behaviors = this.analyzeBehaviors(audiences);

    // Calculate total market size
    const marketSize = audiences.reduce((sum, audience) => sum + audience.size, 0);

    // Generate targeting rationale
    const rationale = this.generateRationale(description, demographics, behaviors);

    // Generate strategic recommendations
    const recommendations = this.generateRecommendations(audiences, demographics);

    return {
      primaryInterests,
      secondaryInterests,
      demographics,
      behaviors,
      rationale,
      marketSize,
      recommendations
    };
  }

  private static aggregateDemographics(audiences: MetaAudience[]): {
    age: string[];
    gender: string[];
    education: string[];
    income: string[];
  } {
    const aggregated = {
      age: [] as string[],
      gender: [] as string[],
      education: [] as string[],
      income: [] as string[]
    };

    audiences.forEach(audience => {
      audience.demographics?.forEach(demo => {
        switch (demo.type.toLowerCase()) {
          case 'age':
            if (demo.percentage > 0.15 && !aggregated.age.includes(demo.value)) {
              aggregated.age.push(demo.value);
            }
            break;
          case 'gender':
            if (demo.percentage > 0.3 && !aggregated.gender.includes(demo.value)) {
              aggregated.gender.push(demo.value);
            }
            break;
          case 'education':
            if (demo.percentage > 0.2 && !aggregated.education.includes(demo.value)) {
              aggregated.education.push(demo.value);
            }
            break;
          case 'income':
            if (demo.percentage > 0.15 && !aggregated.income.includes(demo.value)) {
              aggregated.income.push(demo.value);
            }
            break;
        }
      });
    });

    return aggregated;
  }

  private static analyzeBehaviors(audiences: MetaAudience[]): {
    category: string;
    items: string[];
  }[] {
    const behaviorMap = new Map<string, Set<string>>();

    audiences.forEach(audience => {
      audience.behaviors?.forEach(behavior => {
        if (behavior.percentage > 0.1) {
          if (!behaviorMap.has(behavior.category)) {
            behaviorMap.set(behavior.category, new Set());
          }
          behaviorMap.get(behavior.category)?.add(behavior.name);
        }
      });
    });

    return Array.from(behaviorMap.entries()).map(([category, items]) => ({
      category,
      items: Array.from(items)
    }));
  }

  private static generateRationale(
    description: string,
    demographics: { age: string[]; gender: string[]; education: string[]; income: string[] },
    behaviors: { category: string; items: string[] }[]
  ): string {
    const parts = [
      "This audience selection is optimal because:",
      "",
      "1. Demographic Alignment:",
      demographics.age.length > 0 ? `   • Age Groups: ${demographics.age.join(', ')}` : null,
      demographics.gender.length > 0 ? `   • Gender: ${demographics.gender.join(', ')}` : null,
      demographics.education.length > 0 ? `   • Education: ${demographics.education.join(', ')}` : null,
      "",
      "2. Behavioral Indicators:",
      ...behaviors.map(b => `   • ${b.category}: ${b.items.join(', ')}`),
      "",
      "3. Market Potential:",
      "   • High engagement probability based on interest overlap",
      "   • Strong behavioral alignment with business objectives"
    ];

    return parts.filter(Boolean).join('\n');
  }

  private static generateRecommendations(
    audiences: MetaAudience[],
    demographics: { age: string[]; gender: string[]; education: string[]; income: string[] }
  ): string[] {
    const recommendations = [
      `Focus on ${demographics.age[0] || 'primary age groups'} as they show highest engagement potential`,
      'Test different ad formats across placements for optimal performance',
      'Implement progressive bidding strategy based on audience response',
      'Consider seasonal adjustments for targeting parameters'
    ];

    if (audiences.length > 5) {
      recommendations.push('Start with top 3-5 interests and expand based on performance');
    }

    return recommendations;
  }
}