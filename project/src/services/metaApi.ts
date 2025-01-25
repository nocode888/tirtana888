import { MetaAudience } from '../types/meta';

export class MetaApiService {
  private accessToken: string;
  private baseUrl = 'https://graph.facebook.com/v18.0';
  private adsToken = 'EAAWrZB71ZBz5kBO9ZBgEZCvGmTqfsYEjBRsR4g2oVZBYChMxoZChav0VRBBfL7V3t8tZA1kIGfLVI4AFHWhdFOvkkdlQomWiQ7hcRsNMwuUMoPkyTFUaf7LsmiDfeduZBf5EChoW3b2yaZCOx5WMmZCp8ZA9TqfAjpfcHgjH7cNEicNO7iAEn62pxFK72aUTTOG9wLYQuZBKvAa4Rg5Mr2tN';

  constructor(accessToken: string) {
    this.accessToken = this.adsToken;
  }

  async searchAudiences(query: string, filters: Record<string, any> = {}): Promise<MetaAudience[]> {
    try {
      if (!query.trim()) {
        throw new Error('Search query cannot be empty');
      }

      const encodedQuery = encodeURIComponent(query);
      const fields = [
        'id',
        'name',
        'path',
        'topic',
        'audience_size_lower_bound',
        'audience_size_upper_bound',
        'description',
        'delivery_status',
        'targeting',
        'demographic_distribution',
        'behavior_distribution'
      ].join(',');
      
      const url = new URL(`${this.baseUrl}/search`);
      url.searchParams.append('type', 'adinterest');
      url.searchParams.append('q', encodedQuery);
      url.searchParams.append('limit', '25');
      url.searchParams.append('locale', 'en_US');
      url.searchParams.append('fields', fields);
      url.searchParams.append('access_token', this.accessToken);
      
      // Build targeting specification based on filters
      const targeting_spec: any = {
        geo_locations: {
          countries: ['ID'] // Always target Indonesia
        },
        publisher_platforms: [],
        facebook_positions: [],
        instagram_positions: [],
        messenger_positions: [],
        whatsapp_positions: []
      };
      
      // Add gender targeting
      if (filters?.gender && filters.gender !== 'all') {
        targeting_spec.genders = [filters.gender === 'female' ? 1 : 2];
      }
      
      // Add age targeting
      if (filters?.age) {
        const [min, max] = filters.age.split('-').map(Number);
        targeting_spec.age_min = min;
        targeting_spec.age_max = max || (min === 65 ? 99 : min);
      }

      // Add objective-specific targeting
      if (filters?.objective) {
        switch (filters.objective.toUpperCase()) {
          case 'AWARENESS':
            targeting_spec.optimization_goal = 'REACH';
            targeting_spec.objective = 'BRAND_AWARENESS';
            break;
          case 'CONVERSIONS':
            targeting_spec.optimization_goal = 'OFFSITE_CONVERSIONS';
            targeting_spec.objective = 'CONVERSIONS';
            break;
          case 'TRAFFIC':
            targeting_spec.optimization_goal = 'LINK_CLICKS';
            targeting_spec.objective = 'TRAFFIC';
            break;
          case 'ENGAGEMENT':
            targeting_spec.optimization_goal = 'POST_ENGAGEMENT';
            targeting_spec.objective = 'ENGAGEMENT';
            break;
          case 'APP_PROMOTION':
            targeting_spec.optimization_goal = 'APP_INSTALLS';
            targeting_spec.objective = 'APP_PROMOTION';
            break;
          case 'LEAD_GENERATION':
            targeting_spec.optimization_goal = 'LEAD_GENERATION';
            targeting_spec.objective = 'LEAD_GENERATION';
            break;
        }
      }

      // Add placement targeting
      if (filters?.placement) {
        switch (filters.placement) {
          case 'facebook':
            targeting_spec.publisher_platforms.push('facebook');
            targeting_spec.facebook_positions = ['feed', 'right_hand_column', 'instant_article', 'marketplace'];
            break;
          case 'instagram':
            targeting_spec.publisher_platforms.push('instagram');
            targeting_spec.instagram_positions = ['stream', 'story', 'explore', 'reels'];
            break;
          case 'messenger':
            targeting_spec.publisher_platforms.push('messenger');
            targeting_spec.messenger_positions = ['messenger_home', 'sponsored_messages'];
            break;
          case 'whatsapp':
            targeting_spec.publisher_platforms.push('whatsapp');
            targeting_spec.whatsapp_positions = ['status'];
            break;
          case 'automatic':
          default:
            targeting_spec.publisher_platforms = ['facebook', 'instagram', 'messenger', 'whatsapp'];
            targeting_spec.facebook_positions = ['feed', 'right_hand_column', 'instant_article', 'marketplace'];
            targeting_spec.instagram_positions = ['stream', 'story', 'explore', 'reels'];
            targeting_spec.messenger_positions = ['messenger_home', 'sponsored_messages'];
            targeting_spec.whatsapp_positions = ['status'];
        }
      }

      // Clean up empty arrays
      Object.keys(targeting_spec).forEach(key => {
        if (Array.isArray(targeting_spec[key]) && targeting_spec[key].length === 0) {
          delete targeting_spec[key];
        }
      });

      url.searchParams.append('targeting_spec', JSON.stringify(targeting_spec));
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Meta API Error:', data);
        throw new Error(data.error?.message || `API Error: ${response.status}`);
      }

      if (!data.data || !Array.isArray(data.data)) {
        console.warn('Empty or invalid response:', data);
        return [];
      }

      // Transform and filter results based on campaign objective
      let results = data.data.map((item: any) => this.transformApiResponse(item, filters));

      // Apply objective-based filtering
      if (filters?.objective) {
        results = this.filterByObjective(results, filters.objective);
      }

      return results;
    } catch (error) {
      console.error('Meta API search error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to search interests');
    }
  }

  private filterByObjective(audiences: MetaAudience[], objective: string): MetaAudience[] {
    // Apply objective-specific filtering logic
    switch (objective.toUpperCase()) {
      case 'AWARENESS':
        // Prioritize larger audiences with broader reach
        return audiences.filter(a => a.size > 500000);
      
      case 'CONVERSIONS':
        // Focus on audiences with higher purchase intent
        return audiences.filter(a => 
          a.behaviors?.some(b => 
            b.category.toLowerCase().includes('purchase') || 
            b.category.toLowerCase().includes('shopping')
          ) || true
        );
      
      case 'TRAFFIC':
        // Prioritize engaged audiences
        return audiences.filter(a => 
          a.behaviors?.some(b => 
            b.category.toLowerCase().includes('online') || 
            b.category.toLowerCase().includes('mobile')
          ) || true
        );
      
      case 'ENGAGEMENT':
        // Focus on socially active audiences
        return audiences.filter(a => 
          a.behaviors?.some(b => 
            b.category.toLowerCase().includes('social') || 
            b.category.toLowerCase().includes('media')
          ) || true
        );
      
      case 'APP_PROMOTION':
        // Target mobile-savvy audiences
        return audiences.filter(a => 
          a.behaviors?.some(b => 
            b.category.toLowerCase().includes('mobile') || 
            b.category.toLowerCase().includes('app')
          ) || true
        );
      
      case 'LEAD_GENERATION':
        // Focus on business-oriented audiences
        return audiences.filter(a => 
          a.behaviors?.some(b => 
            b.category.toLowerCase().includes('business') || 
            b.category.toLowerCase().includes('professional')
          ) || true
        );
      
      default:
        return audiences;
    }
  }

  private transformApiResponse(item: any, filters: Record<string, any> = {}): MetaAudience {
    let audienceSize = 0;
    
    if (item.audience_size_lower_bound && item.audience_size_upper_bound) {
      audienceSize = Math.floor((item.audience_size_lower_bound + item.audience_size_upper_bound) / 2);
    } else {
      audienceSize = 10000; // Default fallback
    }

    // Apply targeting modifiers to audience size
    const targetingModifiers = this.calculateTargetingModifiers(filters);
    audienceSize = Math.floor(audienceSize * targetingModifiers.sizeModifier);

    // Calculate estimated reach based on budget and targeting
    const budget = parseInt(filters?.budget || '10', 10);
    const estimatedReach = this.calculateEstimatedReach(audienceSize, budget, targetingModifiers);

    // Transform demographic data
    const demographics = item.demographic_distribution?.map((d: any) => ({
      type: d.type || 'Unknown',
      percentage: d.percentage || 0,
      value: d.value || 'Unknown'
    })) || [];

    // Transform behavior data
    const behaviors = item.behavior_distribution?.map((b: any) => ({
      name: b.name || 'Unknown',
      percentage: b.percentage || 0,
      category: b.category || 'General'
    })) || [];

    return {
      id: item.id,
      name: item.name,
      description: item.description || item.topic || 'No description available',
      size: audienceSize,
      estimatedReach,
      path: Array.isArray(item.path) ? item.path.join(' > ') : item.path || 'General',
      targeting: {
        interests: [item.name],
        locations: ['ID'],
        ...(item.targeting || {})
      },
      demographics,
      behaviors
    };
  }

  private calculateTargetingModifiers(filters: Record<string, any>): {
    sizeModifier: number;
    cpmModifier: number;
  } {
    let sizeModifier = 1.0;
    let cpmModifier = 1.0;

    // Gender targeting impact
    if (filters?.gender && filters.gender !== 'all') {
      sizeModifier *= 0.5; // Roughly half the audience when targeting specific gender
    }

    // Age targeting impact
    if (filters?.age) {
      const [min, max] = filters.age.split('-').map(Number);
      const ageRange = (max || 99) - min;
      sizeModifier *= Math.min(1, ageRange / 50); // Normalize by typical age range
    }

    // Placement impact
    if (filters?.placement && filters.placement !== 'automatic') {
      switch (filters.placement) {
        case 'facebook':
          sizeModifier *= 0.7;
          cpmModifier *= 1.2;
          break;
        case 'instagram':
          sizeModifier *= 0.5;
          cpmModifier *= 1.4;
          break;
        case 'messenger':
          sizeModifier *= 0.3;
          cpmModifier *= 0.9;
          break;
        case 'whatsapp':
          sizeModifier *= 0.4;
          cpmModifier *= 1.1;
          break;
      }
    }

    // Objective impact
    if (filters?.objective) {
      switch (filters.objective.toUpperCase()) {
        case 'AWARENESS':
          cpmModifier *= 0.8;
          break;
        case 'CONVERSIONS':
          cpmModifier *= 1.4;
          sizeModifier *= 0.8;
          break;
        case 'TRAFFIC':
          cpmModifier *= 1.1;
          break;
        case 'ENGAGEMENT':
          cpmModifier *= 1.2;
          break;
        case 'APP_PROMOTION':
          cpmModifier *= 1.3;
          sizeModifier *= 0.7;
          break;
        case 'LEAD_GENERATION':
          cpmModifier *= 1.5;
          sizeModifier *= 0.6;
          break;
      }
    }

    return {
      sizeModifier: Math.max(0.1, sizeModifier), // Ensure minimum 10% of original size
      cpmModifier: Math.max(0.5, cpmModifier) // Ensure minimum 50% of base CPM
    };
  }

  private calculateEstimatedReach(audienceSize: number, dailyBudget: number, modifiers: { cpmModifier: number }): number {
    // Base CPM for Indonesia
    const baseCPM = 2.0;
    
    // Adjust CPM based on audience size and targeting
    const audienceSizeMultiplier = Math.min(1, Math.log10(audienceSize) / 7);
    const adjustedCPM = baseCPM * (1 + audienceSizeMultiplier) * modifiers.cpmModifier;
    
    // Calculate daily impressions based on budget
    const dailyImpressions = (dailyBudget / adjustedCPM) * 1000;
    
    // Average frequency (views per person)
    const avgFrequency = 2;
    
    // Calculate estimated daily reach
    let estimatedDailyReach = Math.floor(dailyImpressions / avgFrequency);
    
    // Cap reach based on audience size (typically 5-15% of total audience)
    const maxDailyReach = Math.floor(audienceSize * 0.15);
    estimatedDailyReach = Math.min(estimatedDailyReach, maxDailyReach);
    
    // Apply minimum reach threshold
    return Math.max(estimatedDailyReach, 1000);
  }

  async getInterestDetails(interestId: string): Promise<any> {
    try {
      const url = new URL(`${this.baseUrl}/${interestId}`);
      url.searchParams.append('fields', [
        'id',
        'name',
        'audience_size',
        'path',
        'description',
        'topic',
        'related_interests{id,name,audience_size,path}',
        'audience_distribution',
        'demographic_stats',
        'behavior_stats'
      ].join(','));
      url.searchParams.append('access_token', this.accessToken);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `API Error: ${response.status}`);
      }

      return this.transformInterestDetails(data);
    } catch (error) {
      console.error('Meta API interest details error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch interest details');
    }
  }

  private transformInterestDetails(data: any) {
    return {
      id: data.id,
      name: data.name,
      size: data.audience_size,
      path: data.path,
      description: data.description || data.topic || 'No description available',
      relatedInterests: (data.related_interests?.data || []).map((interest: any) => ({
        id: interest.id,
        name: interest.name,
        size: interest.audience_size,
        path: interest.path
      })),
      demographics: this.transformDemographicStats(data.demographic_stats),
      behaviors: this.transformBehaviorStats(data.behavior_stats),
      distribution: data.audience_distribution || {}
    };
  }

  private transformDemographicStats(stats: any = {}) {
    const categories = ['age', 'gender', 'education', 'relationship', 'income'];
    return categories.reduce((acc: any, category) => {
      if (stats[category]) {
        acc[category] = Object.entries(stats[category]).map(([key, value]: [string, any]) => ({
          value: key,
          percentage: value,
          label: this.formatDemographicLabel(category, key)
        }));
      }
      return acc;
    }, {});
  }

  private transformBehaviorStats(stats: any = {}) {
    return Object.entries(stats || {}).map(([category, data]: [string, any]) => ({
      category,
      behaviors: Object.entries(data).map(([name, percentage]: [string, any]) => ({
        name,
        percentage,
        category
      }))
    }));
  }

  private formatDemographicLabel(category: string, value: string): string {
    switch (category) {
      case 'age':
        return value.includes('-') ? value : `${value}+`;
      case 'gender':
        return value.charAt(0).toUpperCase() + value.slice(1);
      case 'education':
        return value.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      default:
        return value;
    }
  }
}