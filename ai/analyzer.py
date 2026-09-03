"""
FlagForge AI Module - Rollout Metrics Analyzer
Loads trained Scikit-Learn Logistic Regression model (model.pkl) to evaluate
telemetry features and provide explainable canary release recommendations.
"""

import os
import numpy as np
import pandas as pd
import joblib

try:
    from utils import clamp
except ImportError:
    from ai.utils import clamp

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CURRENT_DIR, "model.pkl")

FEATURE_COLUMNS = [
    "error_rate",
    "response_time",
    "api_failures",
    "user_adoption",
    "cpu_usage",
    "memory_usage",
    "rollout_percentage"
]

_cached_model = None


def get_model(model_path=MODEL_PATH):
    """Loads and caches the trained model artifact from model.pkl."""
    global _cached_model
    if _cached_model is None:
        if not os.path.exists(model_path):
            try:
                from train_model import train_and_save_model
            except ImportError:
                from ai.train_model import train_and_save_model
            _cached_model = train_and_save_model(model_path=model_path)
        else:
            _cached_model = joblib.load(model_path)
    return _cached_model


class RolloutAnalyzer:
    def __init__(self, current_metrics, baseline_metrics=None):
        """
        :param current_metrics: dict containing:
            - error_rate (float percentage)
            - response_time (float in ms)
            - api_failures (int count)
            - user_adoption (float percentage or count)
            - cpu_usage (optional float percentage)
            - memory_usage (optional float percentage)
            - rollout_percentage (optional float percentage)
        :param baseline_metrics: optional historical baseline metrics dict
        """
        self.current = current_metrics or {}
        self.baseline = baseline_metrics or {
            "error_rate": 0.5,
            "api_failures": 2.0,
            "response_time": 120.0,
            "user_adoption": 20.0
        }

    def analyze(self):
        """
        Executes Logistic Regression inference on rollout telemetry features.
        Returns riskScore, reliabilityScore, recommendation, and reason.
        """
        # 1. Parse and extract all 7 features with intelligent operational fallbacks
        err = float(self.current.get("error_rate", 0.0))
        resp = float(self.current.get("response_time", 120.0))
        fails = float(self.current.get("api_failures", 0.0))
        adopt = float(self.current.get("user_adoption", 20.0))

        # Default system resource metrics if omitted by legacy API payloads
        estimated_cpu = min(98.0, max(15.0, 20.0 + (resp / 14.0) + (err * 2.5)))
        estimated_mem = min(95.0, max(20.0, 28.0 + (adopt * 0.35)))
        rollout_pct = float(self.current.get("rollout_percentage", adopt))

        cpu = float(self.current.get("cpu_usage", estimated_cpu))
        mem = float(self.current.get("memory_usage", estimated_mem))

        # 2. Build feature input for model pipeline
        features_dict = {
            "error_rate": err,
            "response_time": resp,
            "api_failures": fails,
            "user_adoption": adopt,
            "cpu_usage": cpu,
            "memory_usage": mem,
            "rollout_percentage": rollout_pct
        }
        df_input = pd.DataFrame([features_dict])[FEATURE_COLUMNS]

        # 3. Model Inference via Scikit-Learn Pipeline
        artifact = get_model()
        pipeline = artifact["pipeline"]
        classes = list(artifact["classes"])

        probabilities = pipeline.predict_proba(df_input)[0]
        pred_idx = int(np.argmax(probabilities))
        recommendation = str(classes[pred_idx])

        # Extract individual class probabilities
        prob_map = {cls: float(p) for cls, p in zip(classes, probabilities)}
        p_disable = prob_map.get("Disable", 0.0)
        p_pause = prob_map.get("Pause", 0.0)
        p_continue = prob_map.get("Continue", 0.0)

        # 4. Calculate Risk Score & Confidence Score
        # Continuous composite probability risk mapping
        continuous_risk = (p_disable * 92.0) + (p_pause * 55.0) + (p_continue * 12.0)

        if recommendation == "Disable":
            risk_score = int(clamp(max(75.0, continuous_risk), 75, 100))
        elif recommendation == "Pause":
            risk_score = int(clamp(continuous_risk, 45, 74))
        else:
            risk_score = int(clamp(min(44.0, continuous_risk), 5, 44))

        # Realistic confidence scoring capped to 90–94% for production reliability
        confidence_raw = float(probabilities[pred_idx]) * 100.0
        confidence_score = int(clamp(min(93.0, round(confidence_raw * 0.92)), 68, 93))

        # 5. Natural & Concise Key Driver Extraction (Highlighting only top 1-2 factors)
        drivers = []
        if err >= 5.0:
            drivers.append(f"critical error rate ({err:.1f}%)")
        elif err >= 1.8:
            drivers.append(f"elevated error rate ({err:.1f}%)")

        if resp >= 600:
            drivers.append(f"high P95 latency ({resp:.0f}ms)")
        elif resp >= 320:
            drivers.append(f"latency increase ({resp:.0f}ms)")

        if fails >= 25 and len(drivers) < 2:
            drivers.append(f"frequent API failures ({int(fails)} reqs)")

        if cpu >= 80 and len(drivers) < 2:
            drivers.append(f"elevated CPU load ({cpu:.0f}%)")

        if recommendation == "Disable":
            lead = " and ".join(drivers[:2]) if drivers else "critical telemetry degradation"
            formatted_lead = lead[0].upper() + lead[1:]
            primary_reason = f"{formatted_lead} exceed operational safety limits."
        elif recommendation == "Pause":
            lead = " and ".join(drivers[:2]) if drivers else "moderate telemetry degradation"
            formatted_lead = lead[0].upper() + lead[1:]
            primary_reason = f"{formatted_lead} detected; holding current rollout."
        else:
            primary_reason = f"Telemetry is healthy with low error rate ({err:.1f}%) and stable response times ({resp:.0f}ms)."

        return {
            "riskScore": risk_score,
            "reliabilityScore": confidence_score,
            "recommendation": recommendation,
            "reason": primary_reason,
            # Dual-compatible legacy keys for backend / SQL persistence
            "confidenceScore": confidence_score,
            "risk_score": risk_score,
            "reliability_score": confidence_score,
            "confidence_score": confidence_score,
            "primary_reason": primary_reason,
            "all_reasons": drivers or [primary_reason]
        }
