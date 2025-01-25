import { MetaAudience } from '../types/meta';

export class MetaApiService {
  private accessToken: string;
  private baseUrl = 'https://graph.facebook.com/v18.0';
  private adsToken = 'EAAWrZB71ZBz5kBO9ZBgEZCvGmTqfsYEjBRsR4g2oVZBYChMxoZChav0VRBBfL7V3t8tZA1kIGfLVI4AFHWhdFOvkkdlQomWiQ7hcRsNMwuUMoPkyTFUaf7LsmiDfeduZBf5EChoW3b2yaZCOx5WMmZCp8ZA9TqfAjpfcHgjH7cNEicNO7iAEn62pxFK72aUTTOG9wLYQuZBKvAa4Rg5Mr2tN';

  constructor() {
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

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Meta API Error:', errorData);
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        console.warn('Empty or invalid response:', data);
        return [];
      }

      return data.data.map((item: any) => this.transformApiResponse(item, filters));
    } catch (error) {
      console.error('Meta API search error:', error);
      throw error; // Re-throw to handle in component
    }
  }

  // ... rest of the code ...
} 