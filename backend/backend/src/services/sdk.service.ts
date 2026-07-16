import { prisma } from '../config/database';
import { EvaluationContext, TargetingRule, TargetingCondition } from '../types/index';

export class SdkService {
  /**
   * Fetches all flag states for an environment by its SDK key.
   */
  static async getFlagsBySdkKey(sdkKey: string) {
    const env = await prisma.environment.findUnique({
      where: { sdkKey },
      include: {
        project: true,
        flagStates: {
          include: {
            flag: true,
          },
        },
      },
    });

    if (!env) {
      throw { statusCode: 401, message: 'Invalid SDK Key' };
    }

    return {
      environment: { name: env.name, key: env.key },
      project: { name: env.project.name, key: env.project.key },
      flags: env.flagStates.map((fs) => {
        let parsedRules = [];
        try {
          parsedRules = typeof fs.rules === 'string' ? JSON.parse(fs.rules) : fs.rules;
        } catch {
          parsedRules = [];
        }

        return {
          key: fs.flag.key,
          type: fs.flag.type,
          enabled: fs.enabled,
          defaultValue: fs.defaultValue,
          rules: parsedRules,
        };
      }),
    };
  }

  /**
   * Evaluates a single feature flag for a specific SDK key and evaluation context.
   */
  static async evaluateFlag(sdkKey: string, flagKey: string, context: EvaluationContext) {
    const env = await prisma.environment.findUnique({
      where: { sdkKey },
      include: {
        flagStates: {
          where: {
            flag: { key: flagKey },
          },
          include: {
            flag: true,
          },
        },
      },
    });

    if (!env) {
      throw { statusCode: 401, message: 'Invalid SDK Key' };
    }

    const state = env.flagStates[0];
    if (!state) {
      throw { statusCode: 404, message: `Feature flag "${flagKey}" not found in this environment` };
    }

    // If flag is disabled, return default value immediately
    if (!state.enabled) {
      return {
        key: flagKey,
        value: this.castValue(state.defaultValue, state.flag.type),
        reason: 'FLAG_DISABLED',
      };
    }

    let parsedRules: TargetingRule[] = [];
    try {
      parsedRules = typeof state.rules === 'string' ? JSON.parse(state.rules) : (state.rules as any);
    } catch {
      parsedRules = [];
    }

    // Evaluate rules sequentially (First Match Wins)
    for (const rule of parsedRules) {
      if (this.evaluateRule(rule, context)) {
        return {
          key: flagKey,
          value: this.castValue(rule.serveValue, state.flag.type),
          reason: `RULE_MATCH: ${rule.name}`,
          ruleId: rule.id,
        };
      }
    }

    // No rules matched, return environment default value
    return {
      key: flagKey,
      value: this.castValue(state.defaultValue, state.flag.type),
      reason: 'DEFAULT_VALUE',
    };
  }

  /**
   * Helper to cast the string-based database representation to target type.
   */
  private static castValue(value: string, type: string) {
    if (type === 'BOOLEAN') {
      return value === 'true';
    }
    if (type === 'JSON') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value; // MULTIVARIATE returns raw string
  }

  /**
   * Evaluates a single rule's conditions and percentage rollout against context.
   */
  private static evaluateRule(rule: TargetingRule, context: EvaluationContext): boolean {
    // 1. Evaluate conditions if any
    if (rule.conditions && rule.conditions.length > 0) {
      const conditionsMatch = rule.conditions.every((cond) => this.evaluateCondition(cond, context));
      if (!conditionsMatch) {
        return false;
      }
    }

    // 2. Evaluate percentage rollout if any
    if (rule.rollout) {
      const { bucketBy, percentage } = rule.rollout;
      const bucketVal = context[bucketBy];

      if (!bucketVal) {
        return false; // Cannot bucket without bucketing attribute
      }

      // Consistent deterministic hashing modulo 100
      const hash = this.getDeterministicHash(String(bucketVal));
      if (hash >= percentage) {
        return false; // Rolled out to a smaller bucket than hash
      }
    }

    return true; // All conditions met and passed rollout check
  }

  /**
   * Evaluates a single condition against the context.
   */
  private static evaluateCondition(cond: TargetingCondition, context: EvaluationContext): boolean {
    const userValRaw = context[cond.attribute];
    if (userValRaw === undefined || userValRaw === null) {
      return false; // Context does not possess this attribute
    }

    const userVal = String(userValRaw).toLowerCase();
    const condVal = cond.value.toLowerCase();

    switch (cond.operator) {
      case 'EQUALS':
        return userVal === condVal;
      case 'NOT_EQUALS':
        return userVal !== condVal;
      case 'CONTAINS':
        return userVal.includes(condVal);
      case 'NOT_CONTAINS':
        return !userVal.includes(condVal);
      case 'STARTS_WITH':
        return userVal.startsWith(condVal);
      case 'ENDS_WITH':
        return userVal.endsWith(condVal);
      case 'IN': {
        const allowedVals = condVal.split(',').map((v) => v.trim());
        return allowedVals.includes(userVal);
      }
      case 'NOT_IN': {
        const disallowedVals = condVal.split(',').map((v) => v.trim());
        return !disallowedVals.includes(userVal);
      }
      default:
        return false;
    }
  }

  /**
   * Deterministic hash from 0 to 99 for bucketing rollouts consistently.
   */
  private static getDeterministicHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash) % 100;
  }
}
