export interface DemographicData {
  type: string;
  percentage: number;
  value: string;
}

export interface BehaviorData {
  name: string;
  percentage: number;
  category: string;
}

export interface MetaAudience {
  id: string;
  name: string;
  description?: string;
  size: number;
  estimatedReach?: number;
  path?: string;
  targeting?: {
    age_min?: number;
    age_max?: number;
    genders?: string[];
    interests?: string[];
    behaviors?: string[];
    locations?: string[];
  };
  demographics?: DemographicData[];
  behaviors?: BehaviorData[];
}

export interface MetaAuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export interface ReachEstimation {
  reach: number;
  cpm: number;
  impressions: number;
}

export interface FilterSettings {
  gender: string;
  age: string;
  budget: string;
  objective: string;
  placement: string;
}