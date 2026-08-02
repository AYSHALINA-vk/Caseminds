from datetime import datetime, timedelta

def compute_active_risk(signals: dict) -> float:
    score = (
        _recency_score(signals.get("last_activity"))     * 0.35 +
        min(signals.get("frequency_delta", 0), 1.0)     * 0.25 +
        signals.get("live_location_signal", 0)          * 0.20 +
        signals.get("platform_escalation_speed", 0)     * 0.10 +
        signals.get("victim_latency_drop", 0)           * 0.10
    ) * 100
    return round(score, 1)

def _recency_score(last_activity) -> float:
    if last_activity is None:
        return 0.0
    hours_ago = (datetime.utcnow() - last_activity).total_seconds() / 3600
    if hours_ago < 6:    return 1.00
    if hours_ago < 24:   return 0.75
    if hours_ago < 72:   return 0.40
    if hours_ago < 168:  return 0.15
    return 0.0

def explain_active_risk(signals: dict) -> list:
    explanations = []
    last = signals.get("last_activity")
    if last:
        hours_ago = (datetime.utcnow() - last).total_seconds() / 3600
        if hours_ago < 24:
            explanations.append(f"Last activity {int(hours_ago)} hours ago")
    if signals.get("frequency_delta", 0) > 0.5:
        explanations.append("Contact frequency accelerating")
    if signals.get("live_location_signal", 0) > 0.5:
        explanations.append("Live GPS signal detected")
    return explanations