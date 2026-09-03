"""
FlagForge AI Module - Recommendation Engine
Evaluates rollout risk and maps metrics to decision-support recommendations:
- Continue: Safe to proceed or scale rollout
- Pause: Hold current rollout percentage and investigate
- Disable: High operational risk; feature should be toggled off

Can be imported as a module or executed via CLI with JSON stdin/argument.
"""

import sys
import json
try:
    from utils import validate_metrics_payload
    from analyzer import RolloutAnalyzer
except ImportError:
    from ai.utils import validate_metrics_payload
    from ai.analyzer import RolloutAnalyzer


def generate_recommendation(metrics, baseline=None):
    """
    Core function to process telemetry metrics and return decision support.
    
    :param metrics: dict with error_rate, api_failures, response_time, user_adoption
                    (optionally cpu_usage, memory_usage, rollout_percentage)
    :param baseline: optional historical baseline metrics dict
    :return: dict with riskScore, reliabilityScore, recommendation, reason
    """
    validated_metrics = validate_metrics_payload(metrics)
    analyzer = RolloutAnalyzer(validated_metrics, baseline)
    analysis = analyzer.analyze()

    risk = int(analysis.get("riskScore", analysis.get("risk_score", 20)))
    reliability = int(analysis.get("reliabilityScore", analysis.get("confidenceScore", analysis.get("confidence_score", 85))))
    reason = analysis.get("reason", analysis.get("primary_reason", "Telemetry within nominal SLA parameters."))
    recommendation = analysis.get("recommendation")

    if not recommendation:
        if risk >= 75:
            recommendation = "Disable"
        elif risk >= 45:
            recommendation = "Pause"
        else:
            recommendation = "Continue"

    return {
        "riskScore": risk,
        "reliabilityScore": reliability,
        "recommendation": recommendation,
        "reason": reason
    }


def main():
    """CLI Entry point for integration with backend process spawn."""
    try:
        # Check if payload is passed as CLI argument or piped via stdin
        if len(sys.argv) > 1:
            raw_input = sys.argv[1]
        else:
            raw_input = sys.stdin.read()

        if not raw_input.strip():
            # Fallback default test payload for standalone verification
            raw_input = json.dumps({
                "error_rate": 8.2,
                "api_failures": 89,
                "response_time": 750,
                "user_adoption": 10
            })

        payload = json.loads(raw_input)
        metrics = payload.get("metrics", payload)
        baseline = payload.get("baseline", None)

        result = generate_recommendation(metrics, baseline)
        print(json.dumps(result, indent=2))
        sys.exit(0)

    except Exception as e:
        error_output = {
            "error": str(e),
            "riskScore": 50,
            "reliabilityScore": 50,
            "recommendation": "Pause",
            "reason": f"Analysis halted due to input error: {str(e)}"
        }
        print(json.dumps(error_output))
        sys.exit(1)


if __name__ == "__main__":
    main()
