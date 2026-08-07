"""
CaseMinds — NLP Pipeline (spaCy Enhanced)
==========================================
Uses real spaCy NER instead of pure regex.
Extracts entities with context awareness.
Supports English, Malayalam, and Manglish.
"""

import re
import spacy
from datetime import datetime

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
    SPACY_AVAILABLE = True
except OSError:
    SPACY_AVAILABLE = False
    print("Warning: spaCy model not found, falling back to regex")


def extract_entities(text: str) -> dict:
    """
    Extract all investigatively relevant entities.
    Uses spaCy NER when available, regex as fallback.
    """
    return {
        "names":            extract_names(text),
        "phones":           extract_phones(text),
        "locations":        extract_locations(text),
        "dates":            extract_dates(text),
        "urls":             extract_urls(text),
        "account_ids":      extract_accounts(text),
        "grooming_signals": detect_grooming_signals(text),
        "language":         detect_language(text),
        "processed_at":     datetime.utcnow().isoformat(),
        "spacy_used":       SPACY_AVAILABLE
    }


def extract_names(text: str) -> list:
    """
    Extract person names using spaCy NER.
    Falls back to regex if spaCy unavailable.
    """
    names = []

    if SPACY_AVAILABLE:
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                name = ent.text.strip()
                if len(name) > 2:
                    names.append(name)
    else:
        # Regex fallback
        pattern = r'\b[A-Z][a-z]{2,15}(?:\s[A-Z][a-z]{2,15})?\b'
        candidates = re.findall(pattern, text)
        exclude = {
            "The", "This", "That", "When", "Where",
            "What", "How", "Why", "Please", "Sorry",
            "Yes", "No", "Meet", "Call", "Send",
            "Come", "Tell", "Know", "Don", "Let"
        }
        names = [c for c in candidates
                 if c not in exclude and len(c) > 3]

    return list(set(names))


def extract_locations(text: str) -> list:
    """
    Extract locations using spaCy GPE/LOC entities
    plus Kerala-specific location list.
    """
    locations = []

    if SPACY_AVAILABLE:
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ in ["GPE", "LOC", "FAC"]:
                locations.append(ent.text.strip())

    # Always add Kerala-specific locations
    # spaCy misses local names
    kerala_locations = [
        "Kochi", "Ernakulam", "Thiruvananthapuram",
        "Kozhikode", "Thrissur", "Kollam", "Palakkad",
        "Alappuzha", "Kannur", "Kottayam", "Malappuram",
        "Wayanad", "Kasaragod", "Lulu Mall", "MG Road",
        "Marine Drive", "Aluva", "Perumbavoor", "Kakkanad"
    ]
    text_lower = text.lower()
    for loc in kerala_locations:
        if loc.lower() in text_lower:
            locations.append(loc)

    return list(set(locations))


def extract_dates(text: str) -> list:
    """
    Extract dates using spaCy DATE/TIME entities
    plus regex for common formats.
    """
    dates = []

    if SPACY_AVAILABLE:
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ in ["DATE", "TIME"]:
                dates.append(ent.text.strip())

    # Regex for formats spaCy might miss
    patterns = [
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)'
        r'[a-z]* \d{1,2}\b',
        r'\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b',
        r'\b(?:today|tomorrow|yesterday|tonight|last night)\b',
        r'\b\d{1,2}\s*(?:AM|PM)\b'
    ]
    for pattern in patterns:
        found = re.findall(pattern, text, re.IGNORECASE)
        dates.extend(found)

    return list(set(dates))


def extract_phones(text: str) -> list:
    """Extract Indian phone numbers."""
    pattern = r'(\+91|91|0)?[6-9]\d{9}'
    phones = []
    for match in re.finditer(pattern, text):
        number = re.sub(r'^(\+91|91|0)', '', match.group())
        if len(number) == 10:
            phones.append(number)
    return list(set(phones))


def extract_urls(text: str) -> list:
    """Extract URLs."""
    pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    return list(set(re.findall(pattern, text)))


def extract_accounts(text: str) -> list:
    """Extract social media handles."""
    patterns = [
        r'@[\w.]{3,30}',
        r't\.me/[\w+]{3,30}',
        r'wa\.me/\d{10,13}',
    ]
    accounts = []
    for pattern in patterns:
        accounts.extend(re.findall(pattern, text))
    return list(set(accounts))


def detect_language(text: str) -> str:
    """
    Detect if text is English, Malayalam script,
    or Manglish (Malayalam in English script).
    """
    # Malayalam Unicode range
    malayalam_chars = sum(
        1 for c in text
        if '\u0D00' <= c <= '\u0D7F'
    )
    if malayalam_chars > 3:
        return "MALAYALAM"

    # Manglish detection — common Malayalam words
    # written in English script
    manglish_words = [
        "ningal", "evidea", "aanu", "ippol", "parayoo",
        "undoo", "ente", "njan", "nee", "athu", "ithu",
        "paranju", "vannu", "pokum", "varoo", "cheythu",
        "aayirnnu", "eppozhanu", "enthanu", "evide"
    ]
    text_lower = text.lower()
    manglish_count = sum(
        1 for word in manglish_words
        if word in text_lower
    )
    if manglish_count >= 2:
        return "MANGLISH"

    return "ENGLISH"


def detect_grooming_signals(text: str) -> list:
    """
    Detect grooming behaviour patterns with context scoring.
    Uses both keyword matching and contextual analysis.
    """
    signals = []
    text_lower = text.lower()

    # Secrecy induction patterns
    secrecy_phrases = [
        ("don't tell", "HIGH", "Direct secrecy instruction"),
        ("dont tell", "HIGH", "Direct secrecy instruction"),
        ("keep it between us", "HIGH", "Isolation language"),
        ("our secret", "HIGH", "Secrecy establishment"),
        ("don't tell your parents", "CRITICAL", "Parental isolation"),
        ("dont tell your parents", "CRITICAL", "Parental isolation"),
        ("they won't understand", "HIGH", "Trust manipulation"),
        ("no one should know", "HIGH", "Isolation pattern"),
        ("just between us", "HIGH", "Secrecy establishment"),
    ]
    for phrase, severity, explanation in secrecy_phrases:
        if phrase in text_lower:
            signals.append({
                "type":        "SECRECY_INDUCTION",
                "phrase":      phrase,
                "severity":    severity,
                "explanation": explanation
            })

    # Platform migration patterns
    platform_phrases = [
        ("move to telegram", "HIGH", "Encrypted platform migration"),
        ("use telegram", "MEDIUM", "Platform suggestion"),
        ("more private", "MEDIUM", "Privacy-seeking language"),
        ("download signal", "HIGH", "Encrypted platform migration"),
        ("switch to", "MEDIUM", "Platform migration attempt"),
        ("less monitored", "HIGH", "Evasion language"),
        ("they can't see", "HIGH", "Surveillance evasion"),
    ]
    for phrase, severity, explanation in platform_phrases:
        if phrase in text_lower:
            signals.append({
                "type":        "PLATFORM_MIGRATION",
                "phrase":      phrase,
                "severity":    severity,
                "explanation": explanation
            })

    # Physical meeting patterns
    meeting_phrases = [
        ("come near", "HIGH", "Physical meeting proposed"),
        ("let's meet", "HIGH", "Physical meeting proposed"),
        ("meet me at", "HIGH", "Physical meeting proposed"),
        ("come to", "MEDIUM", "Location-based meeting"),
        ("i'll come", "MEDIUM", "Suspect approaching victim"),
        ("where are you", "MEDIUM", "Location solicitation"),
        ("coming to meet", "HIGH", "Suspect approaching victim"),
    ]
    for phrase, severity, explanation in meeting_phrases:
        if phrase in text_lower:
            signals.append({
                "type":        "PHYSICAL_MEETING_PROPOSED",
                "phrase":      phrase,
                "severity":    severity,
                "explanation": explanation
            })

    # Age solicitation
    age_phrases = [
        ("how old are you", "HIGH", "Age solicitation"),
        ("what's your age", "HIGH", "Age solicitation"),
        ("how old", "MEDIUM", "Possible age solicitation"),
    ]
    for phrase, severity, explanation in age_phrases:
        if phrase in text_lower:
            signals.append({
                "type":        "AGE_SOLICITATION",
                "phrase":      phrase,
                "severity":    severity,
                "explanation": explanation
            })

    # Trust building / grooming language
    trust_phrases = [
        ("i was thinking about you", "HIGH", "Emotional manipulation"),
        ("you're special", "HIGH", "Flattery-based grooming"),
        ("i care about you", "MEDIUM", "Emotional investment language"),
        ("you can trust me", "HIGH", "Trust solicitation"),
        ("i understand you", "MEDIUM", "Empathy manipulation"),
        ("they don't understand", "HIGH", "Parental alienation"),
    ]
    for phrase, severity, explanation in trust_phrases:
        if phrase in text_lower:
            signals.append({
                "type":        "TRUST_BUILDING",
                "phrase":      phrase,
                "severity":    severity,
                "explanation": explanation
            })

    return signals


def analyze_conversation_pattern(messages: list) -> dict:
    """
    Analyze a full conversation for grooming patterns.
    Looks at the arc of the conversation, not just individual messages.

    This is the key upgrade — context across messages,
    not just keyword matching in one message.
    """
    if not messages:
        return {}

    total = len(messages)
    accused_msgs = [
        m for m in messages
        if m.get("from") == "Accused_X"
    ]
    victim_msgs = [
        m for m in messages
        if m.get("from") == "Victim"
    ]

    # Response latency analysis
    response_times = []
    for i in range(1, len(messages)):
        if (messages[i].get("from") == "Victim" and
                messages[i-1].get("from") == "Accused_X"):
            try:
                t1 = datetime.fromisoformat(
                    messages[i-1]["timestamp"]
                )
                t2 = datetime.fromisoformat(
                    messages[i]["timestamp"]
                )
                diff = (t2 - t1).total_seconds() / 60
                response_times.append(diff)
            except:
                pass

    early_avg = (
        sum(response_times[:3]) / len(response_times[:3])
        if len(response_times) >= 3 else None
    )
    late_avg = (
        sum(response_times[-3:]) / len(response_times[-3:])
        if len(response_times) >= 3 else None
    )

    latency_drop = False
    if early_avg and late_avg:
        latency_drop = late_avg < (early_avg * 0.3)

    # Count grooming signals across all messages
    all_signals = []
    for msg in messages:
        signals = detect_grooming_signals(
            msg.get("content", "")
        )
        all_signals.extend(signals)

    critical_signals = [
        s for s in all_signals
        if s["severity"] == "CRITICAL"
    ]
    high_signals = [
        s for s in all_signals
        if s["severity"] == "HIGH"
    ]

    return {
        "total_messages":        total,
        "accused_initiated":     len(accused_msgs),
        "victim_initiated":      len(victim_msgs),
        "initiation_ratio":      round(
            len(accused_msgs) / total, 2
        ) if total > 0 else 0,
        "response_latency_drop": latency_drop,
        "early_avg_response_min": round(early_avg, 1) if early_avg else None,
        "late_avg_response_min":  round(late_avg, 1) if late_avg else None,
        "total_grooming_signals": len(all_signals),
        "critical_signals":      len(critical_signals),
        "high_signals":          len(high_signals),
        "grooming_arc_detected": len(high_signals) >= 3,
        "signals_by_type": {
            "SECRECY_INDUCTION":       len([s for s in all_signals if s["type"] == "SECRECY_INDUCTION"]),
            "PLATFORM_MIGRATION":      len([s for s in all_signals if s["type"] == "PLATFORM_MIGRATION"]),
            "PHYSICAL_MEETING":        len([s for s in all_signals if s["type"] == "PHYSICAL_MEETING_PROPOSED"]),
            "AGE_SOLICITATION":        len([s for s in all_signals if s["type"] == "AGE_SOLICITATION"]),
            "TRUST_BUILDING":          len([s for s in all_signals if s["type"] == "TRUST_BUILDING"]),
        }
    }


# ── Demo ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    sample = """
    Hey Priya, Arun here. How old are you?
    Come near Lulu Mall Kochi on March 12 at 8 PM.
    Call me on 9876543210. Don't tell your parents about us.
    Let's move to Telegram, more private there. @arun_tg
    I was thinking about you. You're special.
    """

    print("=" * 55)
    print("  NLP PIPELINE — ENHANCED WITH SPACY")
    print("=" * 55)

    result = extract_entities(sample)

    print(f"\n  spaCy active: {result['spacy_used']}")
    print(f"  Language:     {result['language']}")
    print(f"  Names:        {result['names']}")
    print(f"  Phones:       {result['phones']}")
    print(f"  Locations:    {result['locations']}")
    print(f"  Dates:        {result['dates']}")
    print(f"  Accounts:     {result['account_ids']}")
    print(f"\n  Grooming Signals ({len(result['grooming_signals'])}):")
    for s in result["grooming_signals"]:
        print(f"    [{s['severity']}] {s['type']}: {s['explanation']}")