USE flagforge_db;

-- Seed default user (password: "password123")
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'Mishthi Chaurasia', 'mishthi@flagforge.dev', 'scrypt:32768:8:1$yXy0Z...$hashplaceholder', 'admin'),
(2, 'Dev Lead', 'lead@flagforge.dev', 'scrypt:32768:8:1$yXy0Z...$hashplaceholder', 'developer');

-- Seed default project
INSERT INTO projects (id, name, project_key, description, created_by) VALUES
(1, 'FlagForge Core', 'flagforge-core', 'Main application feature flag configurations', 1);

-- Seed default environments
INSERT INTO environments (id, project_id, name, env_key) VALUES
(1, 1, 'Development', 'development'),
(2, 1, 'Testing', 'testing'),
(3, 1, 'Staging', 'staging'),
(4, 1, 'Production', 'production');

-- Seed feature flags
INSERT INTO feature_flags (id, project_id, flag_key, name, description, flag_type, is_enabled) VALUES
(1, 1, 'ab-test-hero-cta-button', 'A/B Hero CTA Button Color', 'Tests dynamic indigo vs emerald conversion CTA', 'boolean', 1),
(2, 1, 'ai-code-generation-v2', 'AI Code Generator v2 Engine', 'Gemini 2.5 Flash assisted rollout engine for intelligent targeting', 'boolean', 1),
(3, 1, 'billing-engine-v3-stripe', 'Stripe Billing Engine Migration', 'New automated payment provider integration', 'boolean', 0),
(4, 1, 'custom-dashboard-widgets', 'Customizable User Analytics Widgets', 'Allows end-users to drag and order custom workspace widgets', 'boolean', 1),
(5, 1, 'realtime-notification-stream', 'Realtime WebSocket Notification Bus', 'Sub-10ms flag propagation notification bus', 'boolean', 1);

-- Seed flag rules across environments
INSERT INTO flag_rules (flag_id, environment_id, is_enabled, rollout_percentage) VALUES
(1, 1, 1, 100), (1, 2, 1, 100), (1, 3, 1, 50), (1, 4, 1, 25),
(2, 1, 1, 100), (2, 2, 1, 100), (2, 3, 1, 75), (2, 4, 1, 50),
(3, 1, 1, 100), (3, 2, 1, 50), (3, 3, 0, 0), (3, 4, 0, 0),
(4, 1, 1, 100), (4, 2, 1, 100), (4, 3, 1, 100), (4, 4, 1, 100),
(5, 1, 1, 100), (5, 2, 1, 100), (5, 3, 1, 80), (5, 4, 0, 0);

-- Seed audit logs
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES
(1, 'CREATE_FLAG', 'feature_flag', 1, 'Created feature flag ab-test-hero-cta-button'),
(1, 'UPDATE_ROLLOUT', 'flag_rule', 1, 'Updated Production rollout percentage to 25%'),
(2, 'TOGGLE_FLAG', 'feature_flag', 3, 'Disabled billing-engine-v3-stripe in Production');
