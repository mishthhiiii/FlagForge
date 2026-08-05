-- Useful MySQL queries for FlagForge

-- 1. Fetch all feature flags with project details
SELECT f.id, f.flag_key, f.name, f.is_enabled, p.name AS project_name
FROM feature_flags f
JOIN projects p ON f.project_id = p.id;

-- 2. Fetch flag rollout status for a specific environment
SELECT f.flag_key, f.name, r.is_enabled, r.rollout_percentage, e.env_key
FROM feature_flags f
JOIN flag_rules r ON f.id = r.flag_id
JOIN environments e ON r.environment_id = e.id
WHERE e.env_key = 'production';

-- 3. Fetch audit logs with user information
SELECT a.id, u.name AS user_name, u.email, a.action, a.entity_type, a.details, a.created_at
FROM audit_logs a
LEFT JOIN users u ON a.user_id = u.id
ORDER BY a.created_at DESC;
