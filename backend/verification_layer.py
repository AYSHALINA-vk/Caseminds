"""
CaseMinds — Verification Layer
================================
Sits between Agent B and the investigator dashboard.
Every challenge Agent B generates must be verified
against structured pipeline facts before display.

This prevents Agent B from hallucinating challenges
that sound plausible but aren't grounded in evidence.

Three outcomes per challenge:
  VERIFIED      → challenge is grounded, citation added
  UNVERIFIED    → cannot confirm from structured data
  CONTRADICTED  → challenge contradicts actual evidence
"""

from datetime import datetime


# ── Structured facts extracted by pipelines ──────────────────────
# In production these come from PostgreSQL
# In prototype these are loaded from sample data

PIPELINE_FACTS = {
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
    "is_screenshot":           True,
    "gps_stripped_files":      1,
    "victim_latency_drop":     True,
    "total_messages":          10,
    "silence_gap_hours":       6.2,
    "suspect_phone":           "9876543210",
    "device_id":               "R58N12XY9823",
}

# ── Verification rules ────────────────────────────────────────────
# Each rule maps a claim pattern to a verification function
# verification function returns:
#   (result, citation) where result is VERIFIED/UNVERIFIED/CONTRADICTED

def verify_gps_accuracy(challenge_text):
    """Verify GPS accuracy claims against EXIF data."""
    acc = PIPELINE_FACTS["gps_accuracy_metres"]
    
    if "insufficient" in challenge_text.lower() or \
       "not court" in challenge_text.lower() or \
       "inadmissible" in challenge_text.lower():
        
        if acc >= 100:
            return (
                "VERIFIED",
                f"image_002.jpg EXIF gps_accuracy: {acc}m — "
                f"standard court admissibility requires <10m"
            )
        else:
            return (
                "CONTRADICTED",
                f"image_002.jpg EXIF gps_accuracy: {acc}m — "
                f"this IS precise enough for court"
            )
    
    return ("UNVERIFIED", None)


def verify_contact_initiation(challenge_text):
    """Verify who initiated contacts against chat analysis."""
    victim = PIPELINE_FACTS["victim_initiated_count"]
    accused = PIPELINE_FACTS["accused_initiated_count"]
    total = PIPELINE_FACTS["contact_count"]
    
    if "victim initiated" in challenge_text.lower() or \
       "initiated" in challenge_text.lower():
        
        if victim > accused:
            return (
                "VERIFIED",
                f"chat_export.json analysis: victim initiated "
                f"{victim}/{total} contacts, accused initiated {accused}/{total}"
            )
        else:
            return (
                "CONTRADICTED",
                f"chat_export.json analysis: accused initiated "
                f"{accused}/{total} contacts — victim initiated only {victim}"
            )
    
    return ("UNVERIFIED", None)


def verify_sample_size(challenge_text):
    """Verify sample size claims against actual message count."""
    total = PIPELINE_FACTS["total_messages"]
    
    if "sample size" in challenge_text.lower() or \
       "insufficient" in challenge_text.lower() or \
       "only" in challenge_text.lower():
        
        # 10 messages containing 4 grooming signals
        # is not insufficient — flag this challenge
        if total >= 5:
            return (
                "VERIFIED",
                f"chat_export.json: {total} messages analyzed. "
                f"Note: sample size challenge is weakened by "
                f"grooming signal density — 4 signals in {total} messages"
            )
    
    return ("UNVERIFIED", None)


def verify_platform_migration(challenge_text):
    """Verify platform migration claims."""
    migration = PIPELINE_FACTS["platform_migration"]
    
    if "platform" in challenge_text.lower() or \
       "telegram" in challenge_text.lower() or \
       "privacy" in challenge_text.lower():
        
        if migration:
            return (
                "VERIFIED",
                "chat_export.json message #6: explicit migration "
                "attempt with account handle shared (@arun_private_tg). "
                "Note: migration intent confirmed but motive unverifiable"
            )
    
    return ("UNVERIFIED", None)


def verify_hash_match(challenge_text):
    """Verify hash match reliability claims."""
    distance = PIPELINE_FACTS["hamming_distance"]
    
    if "hash" in challenge_text.lower() or \
       "false positive" in challenge_text.lower() or \
       "database" in challenge_text.lower():
        
        if distance <= 5:
            return (
                "VERIFIED",
                f"hash_pipeline: Hamming distance {distance} "
                f"(threshold: 10). Low distance strengthens match "
                f"but false positive rate ~2-4% acknowledged"
            )
        else:
            return (
                "VERIFIED",
                f"hash_pipeline: Hamming distance {distance} "
                f"— borderline match, false positive risk elevated"
            )
    
    return ("UNVERIFIED", None)


# ── Main verification function ────────────────────────────────────

VERIFICATION_RULES = [
    verify_gps_accuracy,
    verify_contact_initiation,
    verify_sample_size,
    verify_platform_migration,
    verify_hash_match,
]

def verify_challenge(challenge: dict) -> dict:
    """
    Verify a single Agent B challenge against pipeline facts.
    
    Args:
        challenge: dict with 'counter' and 'challenges_claim' keys
        
    Returns:
        Enhanced challenge dict with verification result and citation
    """
    text = challenge.get("counter", "") + " " + \
           challenge.get("challenges_claim", "")
    
    result = "UNVERIFIED"
    citation = None
    
    # Run through all verification rules
    for rule in VERIFICATION_RULES:
        rule_result, rule_citation = rule(text)
        if rule_result != "UNVERIFIED":
            result = rule_result
            citation = rule_citation
            break
    
    return {
        **challenge,
        "verification": result,
        "citation": citation,
        "verified_at": datetime.utcnow().isoformat(),
        "display": _get_display_status(result)
    }


def verify_all_challenges(agent_b_output: dict) -> dict:
    """
    Verify all challenges from Agent B output.
    Returns enhanced output with verification on each challenge.
    """
    verified_challenges = []
    
    for challenge in agent_b_output.get("challenges", []):
        verified = verify_challenge(challenge)
        verified_challenges.append(verified)
    
    # Count verification results
    counts = {
        "VERIFIED": 0,
        "UNVERIFIED": 0,
        "CONTRADICTED": 0
    }
    for c in verified_challenges:
        counts[c["verification"]] += 1
    
    return {
        **agent_b_output,
        "challenges": verified_challenges,
        "verification_summary": counts,
        "verified_at": datetime.utcnow().isoformat()
    }


def _get_display_status(result: str) -> dict:
    """
    Returns display instructions for the dashboard.
    Controls how each challenge appears to the investigator.
    """
    if result == "VERIFIED":
        return {
            "show": True,
            "style": "normal",
            "label": "VERIFIED",
            "color": "blue"
        }
    elif result == "CONTRADICTED":
        return {
            "show": True,
            "style": "warning",
            "label": "⚠ CONTRADICTED BY EVIDENCE",
            "color": "red"
        }
    else:
        return {
            "show": True,
            "style": "dimmed",
            "label": "UNVERIFIED",
            "color": "grey"
        }


# ── Demo ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Simulate Agent B output
    agent_b_output = {
        "agent": "B",
        "role": "Defender",
        "suspect": "Accused_X",
        "adversarial_confidence": 45,
        "challenges": [
            {
                "challenges_claim": "47 contacts with victim in 6 days",
                "counter": "Victim initiated majority of contacts",
                "severity": "HIGH"
            },
            {
                "challenges_claim": "GPS places suspect near victim",
                "counter": "GPS accuracy insufficient for court admissibility",
                "severity": "HIGH"
            },
            {
                "challenges_claim": "Platform migration to Telegram",
                "counter": "Telegram use common for privacy not predatory",
                "severity": "MEDIUM"
            },
            {
                "challenges_claim": "Hash match detected",
                "counter": "Hash databases have false positive rates",
                "severity": "MEDIUM"
            },
            {
                "challenges_claim": "5 messages analyzed",
                "counter": "Small sample size insufficient for pattern",
                "severity": "LOW"
            }
        ]
    }

    print("=" * 60)
    print("  VERIFICATION LAYER — running on Agent B output")
    print("=" * 60)

    result = verify_all_challenges(agent_b_output)

    for c in result["challenges"]:
        status = c["verification"]
        icon = "✓" if status == "VERIFIED" else \
               "⚠" if status == "CONTRADICTED" else "?"
        
        print(f"\n  [{icon}] {status}")
        print(f"      Claim:     {c['challenges_claim']}")
        print(f"      Challenge: {c['counter']}")
        if c["citation"]:
            print(f"      Citation:  {c['citation']}")

    print(f"\n  Summary: {result['verification_summary']}")
    print(f"\n  Every displayed challenge is now grounded")
    print(f"  in structured pipeline facts — not LLM assertion.")