"""
CaseMinds LeadRank scoring engine
Computes Active Risk, Case Risk, and Net Confidence from real evidence data.
"""

import json
from datetime import datetime

def load_case_evidence(case_id="KL-DEMO-2024-001"):
    base = "C:/Users/ACER/Caseminds/sample_data"
    with open(f"{base}/chat_export.json") as f:
        messages = json.load(f).get("messages", [])
    with open(f"{base}/call_records.csv") as f:
        import csv
        calls = list(csv.DictReader(f))
    return messages, calls


def compute_active_risk(messages, calls):
    """Rescue urgency — how dangerous is the situation RIGHT NOW."""
    score = 0
    reasons = []

    high_flag_msgs = [m for m in messages if m.get("flag") == "HIGH"]
    if len(high_flag_msgs) >= 3:
        score += 30
        reasons.append(f"{len(high_flag_msgs)} high-severity messages detected")

    location_change_calls = [c for c in calls if c.get("flag") == "LOCATION_CHANGE"]
    if location_change_calls:
        score += 35
        reasons.append("Physical location change detected near contact time")

    physical_meeting = any("meet" in m.get("content", "").lower() for m in messages)
    if physical_meeting:
        score += 25
        reasons.append("Physical meeting proposed in evidence")

    return min(score, 100), reasons


def compute_case_risk(messages, calls):
    """Prosecution strength — how strong is the evidence trail."""
    score = 0
    reasons = []

    total_msgs = len(messages)
    if total_msgs >= 8:
        score += 25
        reasons.append(f"{total_msgs} messages establish contact pattern")

    odd_hour = [m for m in messages if m.get("flag") == "ODD_HOUR"]
    if len(odd_hour) / max(total_msgs, 1) > 0.2:
        score += 20
        reasons.append("Significant odd-hour communication pattern")

    secrecy = any("don't tell" in m.get("content", "").lower()
                  or "parents" in m.get("content", "").lower() for m in messages)
    if secrecy:
        score += 25
        reasons.append("Secrecy induction language detected")

    platform_migration = any("telegram" in m.get("content", "").lower() for m in messages)
    if platform_migration:
        score += 15
        reasons.append("Platform migration to less-monitored channel")

    deleted = [m for m in messages if m.get("deleted")]
    if deleted:
        score += 15
        reasons.append(f"{len(deleted)} deleted message(s) recovered")

    return min(score, 100), reasons


def compute_net_confidence(case_risk_reasons, active_risk_reasons):
    """
    Simplified adversarial confidence: strong claims discounted by
    known evidentiary weaknesses (GPS accuracy, victim-initiated contact, etc).
    This mirrors Agent A / Agent B logic — replace with live Agent B output
    once that pipeline is wired to real evidence instead of hardcoded claims.
    """
    raw_strength = min(len(case_risk_reasons) * 20 + len(active_risk_reasons) * 15, 100)
    # Static discount for known evidentiary caveats — same numbers as your Agent B UI
    discount_factor = 0.62  # reflects GPS admissibility + victim-initiated-contact caveats
    net = round(raw_strength * (1 - discount_factor), 1)
    return net


def get_tags(messages, calls):
    tags = []
    if any(m.get("deleted") for m in messages):
        tags.append("GHOST_TRAIL")
    if any("don't tell" in m.get("content", "").lower() for m in messages):
        tags.append("SECRECY_INDUCTION")
    if any("telegram" in m.get("content", "").lower() for m in messages):
        tags.append("PLATFORM_MIGRATION")
    if any(c.get("flag") == "LOCATION_CHANGE" for c in calls):
        tags.append("LOCATION_CHANGE")
    return tags


def get_leadrank(case_id="KL-DEMO-2024-001"):
    messages, calls = load_case_evidence(case_id)
    active_score, active_reasons = compute_active_risk(messages, calls)
    case_score, case_reasons = compute_case_risk(messages, calls)
    net = compute_net_confidence(case_reasons, active_reasons)

    return {
        "case_id": case_id,
        "active_risk": active_score,
        "active_reasons": active_reasons,
        "case_risk": case_score,
        "case_reasons": case_reasons,
        "net_confidence": net,
        "tags": get_tags(messages, calls),
    }