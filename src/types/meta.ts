export interface MetaAudience {
  id: string;
  name: string;
  description: string;
  size: number;
  estimatedReach: number;
  path: string;
  targeting: {
    interests: string[];
    locations: string[];
    [key: string]: any;
  };
  demographics: Array<{
    type: string;
    percentage: number;
    value: string;
  }>;
  behaviors: Array<{
    name: string;
    percentage: number;
    category: string;
  }>;
} 