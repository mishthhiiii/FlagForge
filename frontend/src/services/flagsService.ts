import { FeatureFlag, AuditLog, AnalyticsSummary, ProjectEnvironment, Variation } from '../types';

const INITIAL_ENVIRONMENTS: ProjectEnvironment[] = [
  {
    id: 'development',
    name: 'Development',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    sdkKey: 'ff_sdk_dev_9f83a8b27c104860b2cf1bc79a7bc012',
    clientKey: 'ff_client_dev_2c8b8a5',
  },
  {
    id: 'staging',
    name: 'Staging',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    sdkKey: 'ff_sdk_stg_1e0a2b8471c045b8af0a8c2b7d90a789',
    clientKey: 'ff_client_stg_5b9d2e1',
  },
  {
    id: 'production',
    name: 'Production',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    sdkKey: 'ff_sdk_prod_a7e283b9cf0a11eab1180242ac130004',
    clientKey: 'ff_client_prod_8c3b90a',
  },
];

const INITIAL_FLAGS: FeatureFlag[] = [
  {
    id: 'flag-1',
    key: 'ai-code-generation-v2',
    name: 'AI Code Generation V2',
    description: 'Enables the upgraded neural reasoning model for multi-file visual code generation.',
    type: 'boolean',
    status: 'active',
    tags: ['AI', 'Editor', 'Q3-Release'],
    createdAt: '2026-05-12T08:30:00Z',
    updatedAt: '2026-07-15T14:22:00Z',
    creator: {
      name: 'Sarah Connor',
      email: 'sarah@flagforge.co',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    environments: {
      development: {
        isEnabled: true,
        rules: [
          {
            id: 'rule-1',
            attribute: 'email',
            operator: 'contains',
            values: ['@flagforge.co', '@beta-tester.com'],
            serveVariationId: 'var-true',
          }
        ],
        defaultServeVariationId: 'var-true',
        offVariationId: 'var-false',
      },
      staging: {
        isEnabled: true,
        rules: [
          {
            id: 'rule-2',
            attribute: 'email',
            operator: 'contains',
            values: ['@flagforge.co'],
            serveVariationId: 'var-true',
          }
        ],
        defaultServeVariationId: 'var-false',
        offVariationId: 'var-false',
      },
      production: {
        isEnabled: false,
        rules: [],
        defaultServeVariationId: 'var-false',
        offVariationId: 'var-false',
      },
    },
  },
  {
    id: 'flag-2',
    key: 'billing-engine-v3-migration',
    name: 'Stripe Billing Engine v3',
    description: 'Reroutes Stripe account queries through our optimized parallelized transaction layer.',
    type: 'boolean',
    status: 'active',
    tags: ['Infrastructure', 'Billing', 'Stripe'],
    createdAt: '2026-06-01T10:15:00Z',
    updatedAt: '2026-07-10T09:05:00Z',
    creator: {
      name: 'Sarah Connor',
      email: 'sarah@flagforge.co',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    environments: {
      development: {
        isEnabled: true,
        rules: [],
        defaultServeVariationId: 'var-true',
        offVariationId: 'var-false',
      },
      staging: {
        isEnabled: true,
        rules: [],
        defaultServeVariationId: 'var-true',
        offVariationId: 'var-false',
      },
      production: {
        isEnabled: true,
        rules: [
          {
            id: 'rule-billing-prod-1',
            attribute: 'company',
            operator: 'is_one_of',
            values: ['acme-corp', 'globex'],
            serveVariationId: 'var-true',
          }
        ],
        defaultServeVariationId: 'var-false',
        offVariationId: 'var-false',
      },
    },
  },
  {
    id: 'flag-3',
    key: 'ab-test-hero-cta-button',
    name: 'Hero CTA Button Variant',
    description: 'A/B test variations of landing page call to action to boost organic signups.',
    type: 'multivariate',
    status: 'active',
    tags: ['A/B-Testing', 'Marketing'],
    createdAt: '2026-07-02T16:00:00Z',
    updatedAt: '2026-07-16T01:45:00Z',
    creator: {
      name: 'Alex Rivera',
      email: 'alex@flagforge.co',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    environments: {
      development: {
        isEnabled: true,
        rules: [],
        defaultServeVariationId: 'var-cta-b',
        offVariationId: 'var-cta-control',
      },
      staging: {
        isEnabled: true,
        rules: [],
        defaultServeVariationId: 'var-cta-c',
        offVariationId: 'var-cta-control',
      },
      production: {
        isEnabled: true,
        rules: [],
        defaultServeVariationId: 'var-cta-control',
        offVariationId: 'var-cta-control',
      },
    },
  },
  {
    id: 'flag-4',
    key: 'custom-dashboard-layout-config',
    name: 'Dashboard Widget Configuration JSON',
    description: 'Configures default dashboard module layout coordinates and visual widgets grid.',
    type: 'json',
    status: 'active',
    tags: ['UI', 'Dashboard', 'Config'],
    createdAt: '2026-06-25T11:40:00Z',
    updatedAt: '2026-07-14T10:30:00Z',
    creator: {
      name: 'Sarah Connor',
      email: 'sarah@flagforge.co',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    environments: {
      development: {
        isEnabled: true,
        rules: [],
        defaultServeVariationId: 'var-json-expanded',
        offVariationId: 'var-json-minimal',
      },
      staging: {
        isEnabled: true,
        rules: [],
        defaultServeVariationId: 'var-json-minimal',
        offVariationId: 'var-json-minimal',
      },
      production: {
        isEnabled: false,
        rules: [],
        defaultServeVariationId: 'var-json-minimal',
        offVariationId: 'var-json-minimal',
      },
    },
  },
  {
    id: 'flag-5',
    key: 'dark-mode-sunset-schedule',
    name: 'Sunset Theming Auto-Trigger',
    description: 'Allows users to match their platform theme to sunset hours based on client coordinates.',
    type: 'boolean',
    status: 'draft',
    tags: ['Theming', 'UI'],
    createdAt: '2026-07-15T18:00:00Z',
    updatedAt: '2026-07-15T18:00:00Z',
    creator: {
      name: 'Alex Rivera',
      email: 'alex@flagforge.co',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    environments: {
      development: {
        isEnabled: false,
        rules: [],
        defaultServeVariationId: 'var-false',
        offVariationId: 'var-false',
      },
      staging: {
        isEnabled: false,
        rules: [],
        defaultServeVariationId: 'var-false',
        offVariationId: 'var-false',
      },
      production: {
        isEnabled: false,
        rules: [],
        defaultServeVariationId: 'var-false',
        offVariationId: 'var-false',
      },
    },
  }
];

const INITIAL_VARIATIONS_STORE: Record<string, any[]> = {
  'flag-1': [
    { id: 'var-true', value: 'true', name: 'Enabled' },
    { id: 'var-false', value: 'false', name: 'Disabled' }
  ],
  'flag-2': [
    { id: 'var-true', value: 'true', name: 'Enabled' },
    { id: 'var-false', value: 'false', name: 'Disabled' }
  ],
  'flag-3': [
    { id: 'var-cta-control', value: '{"text":"Sign Up Now","color":"zinc","size":"md"}', name: 'Control (Base)' },
    { id: 'var-cta-b', value: '{"text":"Start Free Trial","color":"indigo","size":"lg"}', name: 'Variant B (High Contrast)' },
    { id: 'var-cta-c', value: '{"text":"Get 14 Days Free","color":"emerald","size":"lg"}', name: 'Variant C (Benefits Focused)' }
  ],
  'flag-4': [
    { id: 'var-json-minimal', value: '{"widgets":["metrics","flags"],"compact":true}', name: 'Minimal Grid' },
    { id: 'var-json-expanded', value: '{"widgets":["metrics","flags","activity","analytics","alerts"],"compact":false}', name: 'Expanded Enterprise Grid' }
  ],
  'flag-5': [
    { id: 'var-true', value: 'true', name: 'Enabled' },
    { id: 'var-false', value: 'false', name: 'Disabled' }
  ]
};

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-07-16T02:15:00Z',
    actor: { name: 'Alex Rivera', email: 'alex@flagforge.co' },
    action: 'toggle',
    flagKey: 'ab-test-hero-cta-button',
    flagName: 'Hero CTA Button Variant',
    environment: 'production',
    details: 'Enabled A/B testing flag on Production environment.'
  },
  {
    id: 'log-2',
    timestamp: '2026-07-15T18:00:00Z',
    actor: { name: 'Alex Rivera', email: 'alex@flagforge.co' },
    action: 'create',
    flagKey: 'dark-mode-sunset-schedule',
    flagName: 'Sunset Theming Auto-Trigger',
    environment: 'all',
    details: 'Created draft flag.'
  },
  {
    id: 'log-3',
    timestamp: '2026-07-15T14:22:00Z',
    actor: { name: 'Sarah Connor', email: 'sarah@flagforge.co' },
    action: 'update',
    flagKey: 'ai-code-generation-v2',
    flagName: 'AI Code Generation V2',
    environment: 'staging',
    details: 'Updated targeting rule for staging email lists.'
  },
  {
    id: 'log-4',
    timestamp: '2026-07-14T10:30:00Z',
    actor: { name: 'Sarah Connor', email: 'sarah@flagforge.co' },
    action: 'toggle',
    flagKey: 'custom-dashboard-layout-config',
    flagName: 'Dashboard Widget Configuration JSON',
    environment: 'development',
    details: 'Enabled layout configuration flag in development.'
  },
  {
    id: 'log-5',
    timestamp: '2026-07-10T09:05:00Z',
    actor: { name: 'Sarah Connor', email: 'sarah@flagforge.co' },
    action: 'update',
    flagKey: 'billing-engine-v3-migration',
    flagName: 'Stripe Billing Engine v3',
    environment: 'production',
    details: 'Added custom enterprise company rules for Stripe rerouting targeting.'
  }
];

const INITIAL_ANALYTICS: AnalyticsSummary = {
  totalEvaluations: 485900,
  activeEvaluations: 394200,
  errorCount: 12,
  avgLatencyMs: 4.8,
  evaluationsOverTime: [
    { time: '00:00', development: 4000, staging: 12000, production: 85000 },
    { time: '04:00', development: 4500, staging: 14000, production: 92000 },
    { time: '08:00', development: 6200, staging: 21000, production: 125000 },
    { time: '12:00', development: 7100, staging: 24500, production: 154000 },
    { time: '16:00', development: 5800, staging: 19800, production: 142000 },
    { time: '20:00', development: 4200, staging: 13500, production: 98000 },
  ],
  flagDistribution: [
    { name: 'ai-code-generation-v2', value: 45 },
    { name: 'billing-engine-v3-migration', value: 30 },
    { name: 'ab-test-hero-cta-button', value: 18 },
    { name: 'custom-dashboard-layout-config', value: 7 },
  ],
  clientSdkUsage: [
    { name: 'React SDK', value: 42 },
    { name: 'Node.js SDK', value: 25 },
    { name: 'Python SDK', value: 15 },
    { name: 'Go SDK', value: 10 },
    { name: 'Ruby SDK', value: 8 },
  ],
};

const DEFAULT_USER = {
  name: 'Sarah Connor',
  email: 'sarah@flagforge.co',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  role: 'Owner'
};

export const flagsService = {
  getEnvironments(): ProjectEnvironment[] {
    return INITIAL_ENVIRONMENTS;
  },

  getFlags(): FeatureFlag[] {
    const cached = localStorage.getItem('ff_flags');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback below
      }
    }
    return INITIAL_FLAGS;
  },

  saveFlags(flags: FeatureFlag[]): void {
    localStorage.setItem('ff_flags', JSON.stringify(flags));
  },

  getVariationsStore(): Record<string, any[]> {
    const cached = localStorage.getItem('ff_variations');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback below
      }
    }
    return INITIAL_VARIATIONS_STORE;
  },

  saveVariationsStore(variationsStore: Record<string, any[]>): void {
    localStorage.setItem('ff_variations', JSON.stringify(variationsStore));
  },

  getAuditLogs(): AuditLog[] {
    const cached = localStorage.getItem('ff_audit_logs');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback below
      }
    }
    return INITIAL_AUDIT_LOGS;
  },

  saveAuditLogs(auditLogs: AuditLog[]): void {
    localStorage.setItem('ff_audit_logs', JSON.stringify(auditLogs));
  },

  getCurrentUser(): any {
    const cached = localStorage.getItem('ff_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback below
      }
    }
    return DEFAULT_USER;
  },

  saveCurrentUser(user: any): void {
    if (user) {
      localStorage.setItem('ff_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ff_user');
    }
  },

  getAnalyticsSummary(): AnalyticsSummary {
    return INITIAL_ANALYTICS;
  }
};
