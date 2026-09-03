"""
FlagForge AI Module - Utility Functions
Provides statistical calculations, threshold definitions, and input validation
for explainable feature flag decision-support.
"""

import math

# Realistic operational thresholds for software rollouts
THRESHOLDS = {
    "error_rate": {
        "normal": 1.0,     # <= 1% is considered healthy
        "warning": 3.0,    # 1.0% - 3.0% requires caution
        "critical": 5.0    # > 5.0% requires immediate pause/disable
    },
    "response_time": {
        "normal": 250,     # <= 250ms is normal
        "warning": 500,    # 250ms - 500ms warning
        "critical": 800    # > 800ms critical degradation
    },
    "api_failures": {
        "normal": 5,       # <= 5 failures per sample
        "warning": 20,     # 5 - 20 failures
        "critical": 50     # > 50 failures
    }
}


def clamp(value, min_value=0, max_value=100):
    """Clamps a numeric value between min_value and max_value."""
    return max(min_value, min(value, max_value))


def calculate_trend(current_val, baseline_val):
    """
    Calculates percentage change between current metric and baseline.
    Returns percentage change (positive indicates increase).
    """
    if baseline_val == 0:
        return 100.0 if current_val > 0 else 0.0
    return ((current_val - baseline_val) / baseline_val) * 100.0


def detect_anomaly(value, mean, std_dev, z_threshold=2.0):
    """
    Simple Z-score anomaly detection.
    Returns True if value deviates by more than z_threshold standard deviations.
    """
    if std_dev == 0:
        return False
    z_score = abs(value - mean) / std_dev
    return z_score > z_threshold


def validate_metrics_payload(metrics):
    """
    Validates that required metrics keys are present and numeric.
    Supports extended ML features (cpu_usage, memory_usage, rollout_percentage).
    """
    required_keys = ["error_rate", "api_failures", "response_time", "user_adoption"]
    validated = {}
    for key in required_keys:
        if key not in metrics:
            raise ValueError(f"Missing required metric: '{key}'")
        try:
            validated[key] = float(metrics[key])
        except (TypeError, ValueError):
            raise ValueError(f"Metric '{key}' must be a valid number, received: {metrics[key]}")

    # Optional features for Logistic Regression model
    optional_keys = ["cpu_usage", "memory_usage", "rollout_percentage"]
    for key in optional_keys:
        if key in metrics and metrics[key] is not None:
            try:
                validated[key] = float(metrics[key])
            except (TypeError, ValueError):
                pass

    return validated
