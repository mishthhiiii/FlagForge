import type { Request } from 'express';

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export interface TargetingCondition {
  attribute: string;      // e.g., 'email', 'userId', 'country', 'tier'
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'NOT_CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'IN' | 'NOT_IN';
  value: string;          // value to compare against (comma-separated for IN/NOT_IN)
}

export interface RolloutRule {
  bucketBy: string;       // e.g. 'userId', 'email'
  percentage: number;     // 0 to 100
}

export interface TargetingRule {
  id: string;
  name: string;
  conditions?: TargetingCondition[];
  rollout?: RolloutRule;
  serveValue: string;     // The value returned if this rule evaluates to true
}

export type EvaluationContext = Record<string, string | number | boolean>;
