"""
CaseMinds — Proof of Concept Demo
===================================
Demonstrates core logic running on sample data.
No external libraries required — pure Python.

Run with: python demo.py
"""

import re
import json
from datetime import datetime, timedelta

# ════════════════════════════════════════
# SAMPLE DATA
# This simulates a WhatsApp chat export
# ════════════════════════════════════════

SAMPLE_CHAT = [
    {
        "id": 1,
        "from": "Accused_X",
        "to": "Victim",
        "timestamp": "2024-03-06T14:22:00",
        "content": "Hey, how are you? I'm Arun.",
        "platform": "WhatsApp"
    },
    {
        "id": 2,
        "from": "Accused_X",
        "to": "Victim",
        "timestamp": "2024-03-09T22:15:00",
        "content": "Come near Lulu Mall Kochi on March 12 at 8 PM",
        "platform": "WhatsApp"
    },
    {
        "id": 3,
        "from": "Accused_X",
        "to": "Victim",
        "timestamp": "2024-03-09T22:16:00",
        "content": "Call me on 9876543210",
        "platform": "WhatsApp"
    },
    {
        "id": 4,
        "from": "Accused_X",
        "to": "Victim",
        "timestamp": "2024-03-10T23:44:00",
        "content": "Don't tell your parents about us",
        "platform": "WhatsApp"
    },
    {
        "id": 5,
        "from": "Accused_X",
        "to": "Victim",
        "timestamp": "2024-03-11T23:01:00",
        "content": "Let's move to Telegram, more private there",
        "platform": "WhatsApp"
    }
]


# ════════════════════════════════════════
# PIPELINE 1 — NLP EXTRACTION
# Extracts structured intelligence
# from unstructured text
# ════════════════════════════════════════

def extract_phones(text):
    """Extract Indian phone numbers."""
    pattern = r'(\+91|91|0)?[6-9]\d{9}'
    phones = []
    for match in re.finditer(pattern, text):
        number = re.sub(r'^(\+91|91|0)', '', match.group())
        if len(number) == 10:
            phones.append(number)
    return list(set(phones))


def extract_locations(text):
    """Extract Kerala location mentions."""
    kerala_locations = [
        "Kochi", "Ernakulam", "Thiruvananthapuram",
        "Kozhikode", "Thrissur", "Kollam", "Kottayam",
        "Lulu Mall", "MG Road", "Marine Drive"
    ]
    found = []
    for loc in kerala_locations:
        if loc.lower() in text.lower():
            found.append(loc)
    return found


def extract_dates(text):
    """Extract date and time mentions."""
    patterns = [
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}\b',
        r'\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b',
        r'\b\d{1,2}\s*(?:AM|PM)\b'
    ]
    dates = []
    for pattern in patterns:
        dates.extend(re.findall(pattern, text, re.IGNORECASE))
    return list(set(dates))


def detect_grooming_signals(text):
    """
    Detect grooming behaviour patterns.
    These are the signals keyword search misses
    but semantic understanding catches.
    """
    signals = []

    secrecy_phrases = [
        "don't tell", "dont tell", "keep secret",
        "between us", "our secret", "no one should know",
        "don't tell your parents", "tell no one"
    ]
    for phrase in secrecy_phrases:
        if phrase.lower() in text.lower():
            signals.append({
                "type": "SECRECY_INDUCTION",
                "phrase": phrase,
                "severity": "HIGH",
                "explanation": "Attempting to isolate victim from trusted adults"
            })

    platform_phrases = [
        "move to telegram", "use telegram", "more private",
        "switch to", "download signal", "use whatsapp"
    ]
    for phrase in platform_phrases:
        if phrase.lower() in text.lower():
            signals.append({
                "type": "PLATFORM_MIGRATION",
                "phrase": phrase,
                "severity": "MEDIUM",
                "explanation": "Moving communication to less monitored platform"
            })

    meeting_phrases = [
        "meet", "come near", "let's meet",
        "come to", "i'll come", "where are you"
    ]
    for phrase in meeting_phrases:
        if phrase.lower() in text.lower():
            signals.append({
                "type": "PHYSICAL_MEETING_PROPOSED",
                "phrase": phrase,
                "severity": "HIGH",
                "explanation": "Suspect proposing offline contact with victim"
            })

    return signals


def run_nlp_pipeline(messages):
    """
    Run full NLP pipeline on all messages.
    Returns structured intelligence extracted
    from the raw chat data.
    """
    all_phones    = []
    all_locations = []
    all_dates     = []
    all_signals   = []
    odd_hour_count = 0

    for msg in messages:
        text = msg["content"]
        ts   = datetime.fromisoformat(msg["timestamp"])

        # Extract entities
        all_phones.extend(extract_phones(text))
        all_locations.extend(extract_locations(text))
        all_dates.extend(extract_dates(text))

        # Detect grooming signals
        signals = detect_grooming_signals(text)
        for s in signals:
            s["message_id"] = msg["id"]
            s["timestamp"]  = msg["timestamp"]
        all_signals.extend(signals)

        # Count odd hour messages (10PM - 6AM)
        if ts.hour >= 22 or ts.hour < 6:
            odd_hour_count += 1

    return {
        "phones":         list(set(all_phones)),
        "locations":      list(set(all_locations)),
        "dates":          list(set(all_dates)),
        "grooming_signals": all_signals,
        "total_messages": len(messages),
        "odd_hour_messages": odd_hour_count,
        "odd_hour_ratio": round(odd_hour_count / len(messages), 2)
    }


# ════════════════════════════════════════
# PIPELINE 2 — RISK SCORING
# Dual scoring: Case Risk + Active Risk
# ════════════════════════════════════════

def compute_case_risk(nlp_results, messages):
    """
    Case Risk — prosecution evidence strength.
    Answers: how strong is the case?
    """
    score = 0
    reasons = []

    # Contact frequency signal
    freq_score = min(len(messages) / 20, 1.0) * 25
    score += freq_score
    if len(messages) >= 5:
        reasons.append(f"{len(messages)} messages with victim detected")

    # Odd hour contact signal
    odd_score = nlp_results["odd_hour_ratio"] * 20
    score += odd_score
    if nlp_results["odd_hour_ratio"] > 0.3:
        pct = int(nlp_results["odd_hour_ratio"] * 100)
        reasons.append(f"{pct}% of contacts after 10PM")

    # Grooming signals
    high_signals = [
        s for s in nlp_results["grooming_signals"]
        if s["severity"] == "HIGH"
    ]
    signal_score = min(len(high_signals) * 20, 40)
    score += signal_score
    for s in high_signals:
        reasons.append(f"{s['type']}: {s['explanation']}")

    # Platform migration
    has_migration = any(
        s["type"] == "PLATFORM_MIGRATION"
        for s in nlp_results["grooming_signals"]
    )
    if has_migration:
        score += 15
        reasons.append("Attempted platform migration to evade monitoring")

    return {
        "score": round(min(score, 100), 1),
        "reasons": reasons
    }


def compute_active_risk(messages):
    """
    Active Risk — is something happening RIGHT NOW?
    Only looks at last 72 hours.
    """
    score = 0
    reasons = []
    now = datetime(2024, 3, 12, 20, 0, 0)

    # Find most recent message
    timestamps = [
        datetime.fromisoformat(m["timestamp"])
        for m in messages
    ]
    latest = max(timestamps)
    hours_ago = (now - latest).total_seconds() / 3600

    # Recency scoring
    if hours_ago < 6:
        score += 35
        reasons.append(f"Last contact {int(hours_ago)} hours ago — VERY RECENT")
    elif hours_ago < 24:
        score += 25
        reasons.append(f"Last contact {int(hours_ago)} hours ago — TODAY")
    elif hours_ago < 72:
        score += 15
        reasons.append(f"Last contact {int(hours_ago)} hours ago — THIS WEEK")

    # Meeting proposed recently
    recent_msgs = [
        m for m in messages
        if (now - datetime.fromisoformat(m["timestamp"])).total_seconds()
        / 3600 < 48
    ]
    for m in recent_msgs:
        if any(p in m["content"].lower()
               for p in ["meet", "come near", "come to"]):
            score += 35
            reasons.append("Physical meeting proposed within last 48 hours")
            break

    # Platform escalation
    platforms = [m["platform"] for m in messages]
    if len(set(platforms)) > 1:
        score += 20
        reasons.append("Communication escalating across platforms")

    return {
        "score": round(min(score, 100), 1),
        "reasons": reasons,
        "immediate_action": score > 75
    }


# ════════════════════════════════════════
# PIPELINE 3 — ADVERSARIAL AGENTS
# Agent A builds case
# Agent B challenges it
# ════════════════════════════════════════

def run_agent_a(nlp_results, case_risk):
    """Agent A — The Prosecutor."""
    claims = []

    for reason in case_risk["reasons"]:
        claims.append({
            "claim": reason,
            "strength": "HIGH" if any(
                kw in reason.lower()
                for kw in ["secrecy", "meeting", "parents"]
            ) else "MEDIUM"
        })

    return {
        "agent": "A — Prosecutor",
        "case_risk": case_risk["score"],
        "claims": claims,
        "summary": f"Evidence supports {len(claims)} risk indicators"
    }


def run_agent_b(agent_a_output):
    """Agent B — The Defender."""
    challenges = []

    challenge_map = {
        "messages with victim":
            "Small sample size — 5 messages insufficient for pattern conclusion",
        "after 10pm":
            "Timestamp reflects sender timezone — may not indicate intent",
        "secrecy_induction":
            "Phrase could reflect relationship privacy, not predatory isolation",
        "physical meeting":
            "Meeting proposal alone does not confirm harmful intent",
        "platform migration":
            "Telegram use is common for privacy — not exclusively predatory"
    }

    for claim in agent_a_output["claims"]:
        for keyword, counter in challenge_map.items():
            if keyword.lower() in claim["claim"].lower():
                challenges.append({
                    "challenges": claim["claim"],
                    "counter": counter,
                    "severity": "MEDIUM"
                })
                break
        else:
            challenges.append({
                "challenges": claim["claim"],
                "counter": "Insufficient corroborating evidence from independent source",
                "severity": "MEDIUM"
            })

    adversarial_score = min(len(challenges) * 15, 60)

    return {
        "agent": "B — Defender",
        "adversarial_confidence": adversarial_score,
        "challenges": challenges,
        "summary": f"Found {len(challenges)} challenges to Agent A's case"
    }


def synthesize(agent_a, agent_b, active_risk):
    """Merge both agents into investigator card."""
    net = round(
        agent_a["case_risk"] * (1 - agent_b["adversarial_confidence"] / 100),
        1
    )
    return {
        "suspect": "Accused_X",
        "case_risk":  agent_a["case_risk"],
        "active_risk": active_risk["score"],
        "adversarial_confidence": agent_b["adversarial_confidence"],
        "net_confidence": net,
        "immediate_action": active_risk["immediate_action"]
    }


# ════════════════════════════════════════
# DEMO RUNNER
# Runs everything and prints output
# ════════════════════════════════════════

def print_section(title):
    print(f"\n{'═' * 55}")
    print(f"  {title}")
    print(f"{'═' * 55}")

def print_step(n, title):
    print(f"\n[STEP {n}] {title}")
    print("─" * 40)


def run_demo():
    print_section("CASEMINDS — PROOF OF CONCEPT DEMO")
    print(f"  Running on {len(SAMPLE_CHAT)} sample messages")
    print(f"  No external libraries — pure Python logic")

    # STEP 1 — NLP
    print_step(1, "NLP Pipeline — Entity Extraction")
    nlp = run_nlp_pipeline(SAMPLE_CHAT)
    print(f"  Phones found:      {nlp['phones']}")
    print(f"  Locations found:   {nlp['locations']}")
    print(f"  Dates found:       {nlp['dates']}")
    print(f"  Odd hour messages: {nlp['odd_hour_messages']}/{nlp['total_messages']}")
    print(f"\n  Grooming Signals Detected:")
    for s in nlp["grooming_signals"]:
        print(f"    ⚠ [{s['severity']}] {s['type']}")
        print(f"      → {s['explanation']}")
        print(f"      → Found in message {s['message_id']}: \"{s['phrase']}\"")

    # STEP 2 — RISK SCORING
    print_step(2, "Dual Risk Scoring")
    case_risk   = compute_case_risk(nlp, SAMPLE_CHAT)
    active_risk = compute_active_risk(SAMPLE_CHAT)
    print(f"  Case Risk:   {case_risk['score']}/100")
    for r in case_risk["reasons"]:
        print(f"    → {r}")
    print(f"\n  Active Risk: {active_risk['score']}/100")
    for r in active_risk["reasons"]:
        print(f"    → {r}")
    if active_risk["immediate_action"]:
        print(f"\n  ⚡ IMMEDIATE ACTION REQUIRED")

    # STEP 3 — ADVERSARIAL AGENTS
    print_step(3, "Adversarial Agents")
    agent_a = run_agent_a(nlp, case_risk)
    agent_b = run_agent_b(agent_a)
    result  = synthesize(agent_a, agent_b, active_risk)

    print(f"\n  AGENT A — {agent_a['agent']}")
    for c in agent_a["claims"]:
        print(f"    ✓ {c['claim']} [{c['strength']}]")

    print(f"\n  AGENT B — {agent_b['agent']}")
    for c in agent_b["challenges"]:
        print(f"    ✗ {c['counter']}")

    # STEP 4 — FINAL OUTPUT
    print_step(4, "Synthesized Investigator Card")
    action = "⚡ IMMEDIATE ACTION LANE" if result["immediate_action"] \
             else "📁 Case Triage Queue"
    print(f"""
  ┌──────────────────────────────────────────────────┐
  │  SUSPECT: {result['suspect']:<41}│
  │  Case Risk:   {result['case_risk']}/100                               │
  │  Active Risk: {result['active_risk']}/100  {action:<20}│
  │  Adversarial: {result['adversarial_confidence']}/100                               │
  │  Net Conf:    {result['net_confidence']}/100                               │
  ├──────────────────────────────────────────────────┤
  │  Final decision: INVESTIGATOR                    │
  │  System cannot act autonomously                  │
  └──────────────────────────────────────────────────┘
    """)

    print("  Demo complete. All core logic demonstrated.")
    print("  Evidence never left this machine.\n")


if __name__ == "__main__":
    run_demo()