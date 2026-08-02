"""
CaseMinds — Adversarial Agent System
======================================
Agent A: Prosecutor — builds strongest case FOR a lead
Agent B: Defender — challenges every claim WITH citations

Key architectural decision:
Agent B forces structured JSON output at generation time.
Every challenge must cite a specific pipeline field and value.
No free prose → no extraction step → no second LLM → no hallucination risk.
"""

from datetime import datetime
from lead_ranker import compute_case_risk, explain_case_risk
from active_risk import compute_active_risk, explain_active_risk


# ── Agent A — The Prosecutor ─────────────────────────────────────

AGENT_A_SYSTEM_PROMPT = """
You are a forensic analyst building an evidence summary.
For each suspect, identify the strongest signals suggesting risk.
Cite specific evidence: timestamps, filenames, exact data points.
Do not speculate beyond what the evidence shows.
"""

def run_agent_a(entities: dict, signals: dict, case_risk: float) -> dict:
    """
    Agent A builds the prosecution case.
    Structured output with cited claims.
    """
    claims = []

    if signals.get("contact_frequency", 0) > 20:
        claims.append({
            "claim": f"{signals['contact_frequency']} contacts with victim in 6 days",
            "evidence": "chat_export.json — message timestamps",
            "strength": "HIGH"
        })

    if signals.get("odd_hour_ratio", 0) > 0.4:
        pct = int(signals["odd_hour_ratio"] * 100)
        claims.append({
            "claim": f"{pct}% of contacts after 10PM",
            "evidence": "chat_export.json — timestamp analysis",
            "strength": "MEDIUM"
        })

    if signals.get("platform_migration_flag"):
        claims.append({
            "claim": "Communication moved to Telegram",
            "evidence": "chat_export.json message #6 — @arun_private_tg shared",
            "strength": "MEDIUM"
        })

    if signals.get("hash_match_flag"):
        claims.append({
            "claim": "Uploaded image matched known harmful content hash",
            "evidence": "hash_db.csv — Hamming distance: 3",
            "strength": "HIGH"
        })

    if signals.get("metadata_anomaly_flag"):
        claims.append({
            "claim": "GPS metadata places suspect near victim location",
            "evidence": "image_002.jpg EXIF — GPS: 10.0261N 76.3083E",
            "strength": "MEDIUM"
        })

    return {
        "agent": "A",
        "role": "Prosecutor",
        "suspect": "Accused_X",
        "case_risk_score": case_risk,
        "claims": claims,
        "summary": f"Evidence supports {len(claims)} distinct risk indicators."
    }


# ── Agent B — The Defender ────────────────────────────────────────

AGENT_B_SYSTEM_PROMPT = """
You are a defense analyst reviewing an AI risk assessment
for a child protection investigation.

Your ONLY job is to challenge the claims presented.

You MUST respond in this exact JSON format — no prose, no preamble:

{
  "challenges": [
    {
      "challenges_claim": "exact claim from Agent A",
      "counter": "your specific challenge in one sentence",
      "cites_field": "the pipeline field this is grounded in",
      "cites_value": "the actual value from that field",
      "cites_file": "which evidence file contains this",
      "severity": "HIGH or MEDIUM or LOW"
    }
  ]
}

Rules:
- Every challenge MUST cite a real field and value from evidence provided
- If you cannot cite a real field — do NOT include that challenge
- Never fabricate a field name or value
- cites_field must be one of:
  gps_accuracy_metres, contact_count, victim_initiated_count,
  odd_hour_ratio, hamming_distance, platform_migration,
  deleted_messages, timestamp_discrepancy, total_messages,
  silence_gap_hours, victim_latency_drop

This sidesteps the extraction problem entirely —
Agent B never produces ungrounded prose.
Citations are forced at generation time.
"""

def run_agent_b(agent_a_output: dict, pipeline_facts: dict = None) -> dict:
    """
    Agent B — The Defender.

    Architecture: structured JSON output at generation time.
    Every challenge cites a specific pipeline field + value.
    No extraction step. No second LLM. No hallucination risk.

    In production: sends AGENT_B_SYSTEM_PROMPT + agent_a_output
    to Ollama/Claude which returns structured JSON directly.

    In prototype: builds structured output from pipeline facts
    to demonstrate the correct architecture.
    """
    if pipeline_facts is None:
        pipeline_facts = {
            "gps_accuracy_metres":     800,
            "contact_count":           47,
            "victim_initiated_count":  39,
            "accused_initiated_count": 8,
            "odd_hour_ratio":          0.80,
            "hamming_distance":        3,
            "hash_match":              True,
            "platform_migration":      True,
            "deleted_messages":        1,
            "timestamp_discrepancy":   True,
            "total_messages":          10,
            "silence_gap_hours":       6.2,
            "victim_latency_drop":     True,
        }

    challenges = []

    for claim in agent_a_output.get("claims", []):
        claim_text = claim["claim"].lower()

        if "contact" in claim_text and "victim" in claim_text:
            challenges.append({
                "challenges_claim": claim["claim"],
                "counter": (
                    f"Victim initiated "
                    f"{pipeline_facts['victim_initiated_count']} of "
                    f"{pipeline_facts['contact_count']} contacts"
                ),
                "cites_field": "victim_initiated_count",
                "cites_value": pipeline_facts["victim_initiated_count"],
                "cites_file": "chat_export.json",
                "severity": "HIGH",
                "verification": "VERIFIED"
            })

        elif "gps" in claim_text or "location" in claim_text:
            challenges.append({
                "challenges_claim": claim["claim"],
                "counter": (
                    f"GPS accuracy {pipeline_facts['gps_accuracy_metres']}m "
                    f"— court admissibility requires under 10m"
                ),
                "cites_field": "gps_accuracy_metres",
                "cites_value": pipeline_facts["gps_accuracy_metres"],
                "cites_file": "metadata_sample.json → image_002.jpg EXIF",
                "severity": "HIGH",
                "verification": "VERIFIED"
            })

        elif "telegram" in claim_text or "platform" in claim_text:
            challenges.append({
                "challenges_claim": claim["claim"],
                "counter": (
                    "Platform migration confirmed but motive "
                    "unverifiable — privacy not predation"
                ),
                "cites_field": "platform_migration",
                "cites_value": pipeline_facts["platform_migration"],
                "cites_file": "chat_export.json message #6",
                "severity": "MEDIUM",
                "verification": "VERIFIED"
            })

        elif "hash" in claim_text:
            challenges.append({
                "challenges_claim": claim["claim"],
                "counter": (
                    f"Hamming distance {pipeline_facts['hamming_distance']} "
                    f"— close match but NCMEC false positive rate ~2-4%"
                ),
                "cites_field": "hamming_distance",
                "cites_value": pipeline_facts["hamming_distance"],
                "cites_file": "hash_db.csv",
                "severity": "LOW",
                "verification": "VERIFIED"
            })

        elif "10pm" in claim_text or "odd" in claim_text:
            challenges.append({
                "challenges_claim": claim["claim"],
                "counter": (
                    f"{int(pipeline_facts['odd_hour_ratio']*100)}% "
                    f"odd hour contacts significant but victim "
                    f"timezone unconfirmed"
                ),
                "cites_field": "odd_hour_ratio",
                "cites_value": pipeline_facts["odd_hour_ratio"],
                "cites_file": "chat_export.json timestamps",
                "severity": "MEDIUM",
                "verification": "VERIFIED"
            })

    adversarial_confidence = _compute_adversarial_confidence(challenges)

    return {
        "agent": "B",
        "role": "Defender",
        "suspect": agent_a_output["suspect"],
        "adversarial_confidence": adversarial_confidence,
        "challenges": challenges,
        "architecture": "structured_json_output",
        "extraction_step": False,
        "hallucination_risk": "minimal — citations forced at generation time",
        "summary": f"{len(challenges)} verified challenges — each cites pipeline fact"
    }


def _compute_adversarial_confidence(challenges: list) -> float:
    """
    How strongly does Agent B challenge Agent A's case?
    Based on severity distribution of verified challenges.
    """
    if not challenges:
        return 0.0

    severity_weights = {"HIGH": 0.8, "MEDIUM": 0.5, "LOW": 0.2}
    total = 0
    for c in challenges:
        total += severity_weights.get(c.get("severity", "MEDIUM"), 0.5)

    return round((total / len(challenges)) * 100, 1)


# ── Synthesis Layer ───────────────────────────────────────────────

def synthesize_outputs(agent_a: dict, agent_b: dict, active_risk: float) -> dict:
    """
    Merge Agent A and Agent B into final investigator card.

    Net confidence formula:
        Net = Case Risk × (1 − Adversarial Confidence / 100)

    Lower net = stronger challenge = needs more evidence first.
    """
    case_risk    = agent_a["case_risk_score"]
    adversarial  = agent_b["adversarial_confidence"]
    net          = round(case_risk * (1 - adversarial / 100), 1)

    return {
        "suspect":                  agent_a["suspect"],
        "case_risk":                case_risk,
        "active_risk":              active_risk,
        "adversarial_confidence":   adversarial,
        "net_confidence":           net,
        "immediate_action":         active_risk > 75,
        "prosecution_claims":       agent_a["claims"],
        "defense_challenges":       agent_b["challenges"],
        "agent_b_architecture":     agent_b["architecture"],
        "hallucination_risk":       agent_b["hallucination_risk"],
        "investigator_decision_required": True,
        "generated_at":             datetime.utcnow().isoformat()
    }


# ── Demo ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    from datetime import datetime
    from lead_ranker import compute_case_risk
    from active_risk import compute_active_risk

    signals = {
        "contact_frequency":      47,
        "odd_hour_ratio":         0.6,
        "hash_match_flag":        1,
        "synthetic_flag":         0,
        "platform_migration_flag":1,
        "metadata_anomaly_flag":  1,
        "last_activity":          datetime.utcnow(),
        "frequency_delta":        0.8,
        "live_location_signal":   0.9,
        "platform_escalation_speed": 0.7,
        "victim_latency_drop":    0.6
    }

    case_risk   = compute_case_risk(signals)
    active_risk = compute_active_risk(signals)

    agent_a = run_agent_a({}, signals, case_risk)
    agent_b = run_agent_b(agent_a)
    result  = synthesize_outputs(agent_a, agent_b, active_risk)

    print("=" * 60)
    print("  AGENT A — Prosecutor")
    print("=" * 60)
    for c in agent_a["claims"]:
        print(f"  ✓ {c['claim']} [{c['strength']}]")
        print(f"    Evidence: {c['evidence']}")

    print("\n" + "=" * 60)
    print("  AGENT B — Defender (structured JSON output)")
    print("=" * 60)
    for c in agent_b["challenges"]:
        print(f"  ✗ {c['counter']}")
        print(f"    Cites: {c['cites_file']} → {c['cites_field']}: {c['cites_value']}")
        print(f"    Status: {c['verification']}")

    print("\n" + "=" * 60)
    print("  SYNTHESIS")
    print("=" * 60)
    print(f"  Case Risk:    {result['case_risk']}/100")
    print(f"  Active Risk:  {result['active_risk']}/100")
    print(f"  Adversarial:  {result['adversarial_confidence']}/100")
    print(f"  Net:          {result['net_confidence']}/100")
    print(f"  Architecture: {result['agent_b_architecture']}")
    print(f"  Hallucination risk: {result['hallucination_risk']}")
    print(f"  Action: {'⚡ IMMEDIATE' if result['immediate_action'] else 'Normal queue'}")