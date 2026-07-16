export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  environments: Environment[];
  flagsCount: number;
}

export interface Environment {
  id: string;
  name: string;
  key: string;
  sdkKey: string;
}

export type FlagType = 'BOOLEAN' | 'MULTIVARIATE' | 'JSON';

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  type: FlagType;
  projectId: string;
  flagStates: {
    [envKey: string]: {
      enabled: boolean;
      defaultValue: string;
      rules: TargetingRule[];
    };
  };
}

export interface TargetingCondition {
  attribute: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'NOT_CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'IN' | 'NOT_IN';
  value: string;
}

export interface RolloutRule {
  bucketBy: string;
  percentage: number;
}

export interface TargetingRule {
  id: string;
  name: string;
  conditions?: TargetingCondition[];
  rollout?: RolloutRule;
  serveValue: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface BackendFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children?: BackendFile[];
}
