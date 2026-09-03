/**
 * Types & State Model for FlagForge (JavaScript/React)
 */

export const DEFAULT_ENVIRONMENTS = [
  { id: 1, name: 'Development', env_key: 'development' },
  { id: 2, name: 'Testing', env_key: 'testing' },
  { id: 3, name: 'Staging', env_key: 'staging' },
  { id: 4, name: 'Production', env_key: 'production' }
];

export const INITIAL_FLAGS = [
  {
    id: 1,
    project_id: 1,
    flag_key: 'ab-test-hero-cta-button',
    name: 'A/B Hero CTA Button Color',
    description: 'Surgically tests dynamic indigo vs emerald conversion CTA',
    flag_type: 'boolean',
    is_enabled: true,
    created_at: '2026-08-01 10:00:00',
    environments: {
      development: { is_enabled: true, rollout_percentage: 100 },
      testing: { is_enabled: true, rollout_percentage: 100 },
      staging: { is_enabled: true, rollout_percentage: 50 },
      production: { is_enabled: true, rollout_percentage: 25 }
    }
  },
  {
    id: 2,
    project_id: 1,
    flag_key: 'ai-code-generation-v2',
    name: 'AI Code Generator v2 Engine',
    description: 'Gemini 2.5 Flash assisted rollout engine for intelligent targeting',
    flag_type: 'boolean',
    is_enabled: true,
    created_at: '2026-08-02 11:30:00',
    environments: {
      development: { is_enabled: true, rollout_percentage: 100 },
      testing: { is_enabled: true, rollout_percentage: 100 },
      staging: { is_enabled: true, rollout_percentage: 75 },
      production: { is_enabled: true, rollout_percentage: 50 }
    }
  },
  {
    id: 3,
    project_id: 1,
    flag_key: 'billing-engine-v3-stripe',
    name: 'Stripe Billing Engine Migration',
    description: 'New automated payment provider integration',
    flag_type: 'boolean',
    is_enabled: false,
    created_at: '2026-08-03 14:15:00',
    environments: {
      development: { is_enabled: true, rollout_percentage: 100 },
      testing: { is_enabled: true, rollout_percentage: 50 },
      staging: { is_enabled: false, rollout_percentage: 0 },
      production: { is_enabled: false, rollout_percentage: 0 }
    }
  },
  {
    id: 4,
    project_id: 1,
    flag_key: 'custom-dashboard-widgets',
    name: 'Customizable User Analytics Widgets',
    description: 'Allows end-users to drag and order custom workspace widgets',
    flag_type: 'boolean',
    is_enabled: true,
    created_at: '2026-08-03 16:45:00',
    environments: {
      development: { is_enabled: true, rollout_percentage: 100 },
      testing: { is_enabled: true, rollout_percentage: 100 },
      staging: { is_enabled: true, rollout_percentage: 100 },
      production: { is_enabled: true, rollout_percentage: 100 }
    }
  },
  {
    id: 5,
    project_id: 1,
    flag_key: 'realtime-notification-stream',
    name: 'Realtime WebSocket Notification Bus',
    description: 'Sub-10ms flag propagation notification bus',
    flag_type: 'boolean',
    is_enabled: true,
    created_at: '2026-08-04 09:20:00',
    environments: {
      development: { is_enabled: true, rollout_percentage: 100 },
      testing: { is_enabled: true, rollout_percentage: 100 },
      staging: { is_enabled: true, rollout_percentage: 80 },
      production: { is_enabled: false, rollout_percentage: 0 }
    }
  }
];

export const INITIAL_PROJECTS = [
  {
    id: 1,
    name: 'FlagForge Core',
    project_key: 'flagforge-core',
    description: 'Main application feature flag configurations',
    created_by: 1,
    created_at: '2026-08-01 00:00:00'
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 1,
    user_name: 'Mishthi Chaurasia',
    user_email: 'mishthi@flagforge.dev',
    action: 'CREATE_FLAG',
    entity_type: 'feature_flag',
    entity_id: 1,
    details: 'Created feature flag ab-test-hero-cta-button',
    created_at: '2026-08-04T12:00:00'
  },
  {
    id: 2,
    user_name: 'Mishthi Chaurasia',
    user_email: 'mishthi@flagforge.dev',
    action: 'UPDATE_ROLLOUT',
    entity_type: 'flag_rule',
    entity_id: 1,
    details: 'Updated Production rollout percentage to 25%',
    created_at: '2026-08-04T12:30:00'
  },
  {
    id: 3,
    user_name: 'Dev Lead',
    user_email: 'lead@flagforge.dev',
    action: 'TOGGLE_FLAG',
    entity_type: 'feature_flag',
    entity_id: 3,
    details: 'Disabled billing-engine-v3-stripe in Production environment',
    created_at: '2026-08-04T13:10:00'
  }
];
