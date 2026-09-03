-- =============================================================================
-- FlagForge Seed Data (MySQL)
-- Realistic mock dataset for development, testing, and interview demonstration
-- =============================================================================

USE flagforge_db;

-- 1. Insert Initial Developers (Password: "password123" hashed with bcrypt)
INSERT INTO users (id, name, email, password, role, created_at) VALUES
(1, 'Project Admin', 'admin@flagforge.local', '$2a$10$abcdefghijklmnopqrstuuSampleHashedBcryptPassword12345', 'Admin', '2026-08-01 09:00:00'),
(2, 'Developer', 'developer@flagforge.local', '$2a$10$abcdefghijklmnopqrstuuSampleHashedBcryptPassword12345', 'Developer', '2026-08-02 10:15:00'),
(3, 'Viewer', 'viewer@flagforge.local', '$2a$10$abcdefghijklmnopqrstuuSampleHashedBcryptPassword12345', 'Viewer', '2026-08-02 11:00:00');

-- 2. Insert Feature Flags
INSERT INTO feature_flags (id, user_id, name, description, status, rollout_percentage, environment, created_at, updated_at) VALUES
(1, 1, 'ab-test-hero-cta', 'Evaluating conversion rate on indigo primary CTA versus emerald CTA on landing page.', 'Active', 50, 'Production', '2026-08-10 10:00:00', '2026-08-15 14:30:00'),
(2, 2, 'ai-code-generation', 'Assisted code generation backend endpoint powered by contextual models.', 'Active', 75, 'Staging', '2026-08-12 11:30:00', '2026-08-16 09:15:00'),
(3, 3, 'stripe-billing-v3', 'Migration to multi-currency Stripe Billing API v3 webhooks.', 'Paused', 10, 'Production', '2026-08-14 14:00:00', '2026-08-17 16:45:00'),
(4, 1, 'dashboard-analytics-v2', 'High-throughput Recharts visualization for edge latency monitoring.', 'Active', 100, 'Development', '2026-08-15 16:00:00', '2026-08-18 11:20:00'),
(5, 2, 'realtime-websocket-bus', 'Low latency bidirectional event streaming layer for instant flag invalidation.', 'Draft', 0, 'Development', '2026-08-18 08:30:00', '2026-08-18 08:30:00');

-- 3. Insert Rollout Metrics (Telemetry time-series)
INSERT INTO rollout_metrics (id, flag_id, error_rate, response_time, api_failures, user_adoption, timestamp) VALUES
-- Flag 1: ab-test-hero-cta (Healthy metrics)
(1, 1, 0.45, 120, 2, 45, '2026-08-18 10:00:00'),
(2, 1, 0.52, 118, 3, 50, '2026-08-18 11:00:00'),
(3, 1, 0.48, 125, 1, 52, '2026-08-18 12:00:00'),

-- Flag 2: ai-code-generation (Healthy metrics)
(4, 2, 1.10, 310, 8, 70, '2026-08-18 10:00:00'),
(5, 2, 1.25, 305, 9, 75, '2026-08-18 11:00:00'),

-- Flag 3: stripe-billing-v3 (Degraded metrics -> triggered Pause recommendation)
(6, 3, 4.80, 480, 34, 10, '2026-08-18 09:00:00'),
(7, 3, 8.20, 750, 89, 10, '2026-08-18 10:00:00'),

-- Flag 4: dashboard-analytics-v2 (Stable)
(8, 4, 0.15, 85, 0, 100, '2026-08-18 12:00:00');

-- 4. Insert AI Recommendations (Decision-Support Records)
INSERT INTO ai_recommendations (id, flag_id, risk_score, confidence_score, recommendation, reason, created_at) VALUES
(1, 1, 18, 92, 'Continue', 'Error rate is stable at 0.48% with average response time of 125ms. Rollout can safely proceed to next tier.', '2026-08-18 12:05:00'),
(2, 2, 28, 88, 'Continue', 'Metrics within acceptable bounds for Staging environment. Monitor API failures if scaling above 80%.', '2026-08-18 11:05:00'),
(3, 3, 82, 91, 'Pause', 'Error rate has reached 8.2%, so disabling this feature is recommended until stability improves.', '2026-08-18 10:15:00');

-- 5. Insert Audit Logs
INSERT INTO audit_logs (id, flag_id, user_id, action, timestamp) VALUES
(1, 1, 1, 'Created feature flag ab-test-hero-cta in Production at 0% rollout', '2026-08-10 10:00:00'),
(2, 1, 1, 'Updated rollout percentage to 50% for ab-test-hero-cta', '2026-08-15 14:30:00'),
(3, 2, 2, 'Created feature flag ai-code-generation in Staging at 75% rollout', '2026-08-12 11:30:00'),
(4, 3, 2, 'Created feature flag stripe-billing-v3 in Production at 10% rollout', '2026-08-14 14:00:00'),
(5, 3, 3, 'Paused flag stripe-billing-v3 following AI risk alert of 82/100', '2026-08-17 16:45:00');
