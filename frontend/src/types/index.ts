export type FlagType = 'boolean' | 'multivariate' | 'json';
export type FlagStatus = 'active' | 'disabled' | 'draft';

export interface Variation {
  id: string;
  value: string;
  name: string;
  rolloutPercentage?: number; // Sum of variations rollout should equal 100 for multivariate
}

export interface TargetingRule {
  id: string;
  attribute: string; // e.g., 'email', 'country', 'company', 'role'
  operator: 'is_one_of' | 'is_not_one_of' | 'contains' | 'does_not_contain' | 'matches_regex';
  values: string[];
  serveVariationId: string; // Variation ID to serve if rule matches
}

export interface EnvironmentConfig {
  isEnabled: boolean;
  rules: TargetingRule[];
  defaultServeVariationId: string; // variation to serve if no rules match and flag is enabled
  offVariationId: string; // variation to serve if flag is disabled
}

export interface FeatureFlag {
  id: string;
  key: string; // e.g., 'new-checkout-flow'
  name: string;
  description: string;
  type: FlagType;
  status: FlagStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  creator: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  environments: {
    development: EnvironmentConfig;
    staging: EnvironmentConfig;
    production: EnvironmentConfig;
  };
}

export interface ProjectEnvironment {
  id: string;
  name: string; // e.g., 'Development'
  color: string; // tailwind color class
  sdkKey: string;
  clientKey: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: {
    name: string;
    email: string;
  };
  action: 'create' | 'update' | 'delete' | 'toggle';
  flagKey: string;
  flagName: string;
  environment: 'development' | 'staging' | 'production' | 'all';
  details: string;
}

export interface AnalyticsSummary {
  totalEvaluations: number;
  activeEvaluations: number;
  errorCount: number;
  avgLatencyMs: number;
  evaluationsOverTime: {
    time: string;
    development: number;
    staging: number;
    production: number;
  }[];
  flagDistribution: {
    name: string;
    value: number;
  }[];
  clientSdkUsage: {
    name: string;
    value: number;
  }[];
}

export interface UserSession {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
    role: string;
  } | null;
  isAuthenticated: boolean;
}
