-- =============================================================================
-- FlagForge Essential SQL Queries
-- Reference queries used in backend services and interview demonstrations
-- =============================================================================

USE flagforge_db;

-- 1. Fetch all flags with latest metrics & AI recommendations for an environment
SELECT 
    f.id,
    f.name,
    f.description,
    f.status,
    f.rollout_percentage,
    f.environment,
    f.created_at,
    f.updated_at,
    u.name AS author_name,
    m.error_rate AS latest_error_rate,
    m.response_time AS latest_response_time,
    r.risk_score,
    r.recommendation,
    r.reason
FROM feature_flags f
JOIN users u ON f.user_id = u.id
LEFT JOIN (
    SELECT flag_id, error_rate, response_time
    FROM rollout_metrics
    WHERE (flag_id, timestamp) IN (
        SELECT flag_id, MAX(timestamp)
        FROM rollout_metrics
        GROUP BY flag_id
    )
) m ON f.id = m.flag_id
LEFT JOIN (
    SELECT flag_id, risk_score, recommendation, reason
    FROM ai_recommendations
    WHERE (flag_id, created_at) IN (
        SELECT flag_id, MAX(created_at)
        FROM ai_recommendations
        GROUP BY flag_id
    )
) r ON f.id = r.flag_id
WHERE f.environment = 'Production'
ORDER BY f.updated_at DESC;

-- 2. Fetch metrics time-series history for a specific flag (for charts/trends)
SELECT 
    id,
    flag_id,
    error_rate,
    response_time,
    api_failures,
    user_adoption,
    timestamp
FROM rollout_metrics
WHERE flag_id = 1
ORDER BY timestamp ASC
LIMIT 50;

-- 3. Update flag status and rollout percentage atomically
UPDATE feature_flags 
SET 
    status = 'Active',
    rollout_percentage = 75,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- 4. Insert an audit log record
INSERT INTO audit_logs (flag_id, user_id, action, timestamp)
VALUES (1, 1, 'Updated rollout_percentage to 75% for flag ab-test-hero-cta', CURRENT_TIMESTAMP);

-- 5. Fetch audit logs with user names
SELECT 
    a.id,
    a.action,
    a.timestamp,
    u.name AS user_name,
    u.email AS user_email,
    f.name AS flag_name
FROM audit_logs a
JOIN users u ON a.user_id = u.id
LEFT JOIN feature_flags f ON a.flag_id = f.id
ORDER BY a.timestamp DESC
LIMIT 100;
