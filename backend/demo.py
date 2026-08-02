"""
CaseMinds — Demo Runner
Run with: python demo.py
"""

import json
from datetime import datetime
from nlp_pipeline import extract_entities
from lead_ranker import compute_case_risk
from active_risk import compute_active_risk
from adversarial_agent import run_agent_a, run_agent_b, synthesize_outputs

SAMPLE_PATH = "../sample_data"

def run_demo():
    print("\n" + "="*55)
    print("  CASEMINDS — PROOF OF CONCEPT DEMO")
    print("="*55)

    with open(f"{SAMPLE_PATH}/chat_export.json") as f:
        chat = json.load(f)

    full_text = " ".join([
        m["content"] for m in chat["messages"]
        if not m.get("deleted")
    ])

    print("\n[STEP 1] NLP Pipeline")
    print("-"*40)
    entities = extract_entities(full_text)
    print(f"  Phones:    {entities['phones']}")
    print(f"  Locations: {entities['locations']}")
    print(f"  Dates:     {entities['dates']}")
    print(f"  Grooming signals: {len(entities['grooming_signals'])}")
    for s in entities["grooming_signals"]:
        print(f"    ⚠ [{s['severity']}] {s['type']}: {s['phrase']}")

    print("\n[STEP 2] Dual Risk Scoring")
    print("-"*40)
    signals = {
        "contact_frequency": 47,
        "odd_hour_ratio": 0.80,
        "hash_match_flag": 1,
        "synthetic_flag": 0,
        "platform_migration_flag": 1,
        "metadata_anomaly_flag": 1,
        "last_activity": datetime.utcnow(),
        "frequency_delta": 0.8,
        "live_location_signal": 0.9,
        "platform_escalation_speed": 0.7,
        "victim_latency_drop": 0.6
    }
    case_risk   = compute_case_risk(signals)
    active_risk = compute_active_risk(signals)
    print(f"  Case Risk:   {case_risk}/100")
    print(f"  Active Risk: {active_risk}/100")
    if active_risk > 75:
        print(f"  ⚡ IMMEDIATE ACTION REQUIRED")

    print("\n[STEP 3] Adversarial Agents")
    print("-"*40)
    agent_a = run_agent_a(entities, signals, case_risk)
    agent_b = run_agent_b(agent_a)
    result  = synthesize_outputs(agent_a, agent_b, active_risk)

    print("\n  AGENT A — Prosecutor:")
    for c in agent_a["claims"]:
        print(f"    ✓ {c['claim']} [{c['strength']}]")

    print("\n  AGENT B — Defender (structured JSON):")
    for c in agent_b["challenges"]:
        print(f"    ✗ {c['counter']}")
        print(f"      → {c['cites_file']}: {c['cites_field']}={c['cites_value']}")

    print(f"\n  Net Confidence: {result['net_confidence']}/100")
    print(f"  Action: {'⚡ IMMEDIATE' if result['immediate_action'] else 'Case queue'}")
    print("\n  Demo complete. Evidence never left this machine.\n")

if __name__ == "__main__":
    run_demo()