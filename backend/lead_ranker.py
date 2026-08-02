from datetime import datetime

def compute_case_risk(signals: dict) -> float:
    score = (
        min(signals.get("contact_frequency", 0) / 50, 1.0) * 0.30 +
        signals.get("odd_hour_ratio", 0)                   * 0.20 +
        signals.get("hash_match_flag", 0)                  * 0.25 +
        signals.get("synthetic_flag", 0)                   * 0.10 +
        signals.get("platform_migration_flag", 0)          * 0.10 +
        signals.get("metadata_anomaly_flag", 0)            * 0.05
    ) * 100
    return round(score, 1)

def explain_case_risk(signals: dict) -> list:
    explanations = []
    if signals.get("contact_frequency", 0) > 20:
        explanations.append(f"{signals['contact_frequency']} contacts with victim")
    if signals.get("odd_hour_ratio", 0) > 0.4:
        explanations.append(f"{int(signals['odd_hour_ratio']*100)}% contacts after 10PM")
    if signals.get("hash_match_flag"):
        explanations.append("Hash matched known harmful content")
    if signals.get("platform_migration_flag"):
        explanations.append("Platform migration detected")
    if signals.get("metadata_anomaly_flag"):
        explanations.append("Metadata anomaly detected")
    return explanations