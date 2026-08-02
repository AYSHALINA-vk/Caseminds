"""
CaseMinds — NLP Pipeline
Extracts structured entities from unstructured text evidence.
"""

import re
from datetime import datetime


def extract_entities(text: str) -> dict:
    return {
        "names":       extract_names(text),
        "phones":      extract_phones(text),
        "locations":   extract_locations(text),
        "dates":       extract_dates(text),
        "urls":        extract_urls(text),
        "account_ids": extract_accounts(text),
        "grooming_signals": detect_grooming_signals(text),
        "processed_at": datetime.utcnow().isoformat()
    }


def extract_phones(text: str) -> list:
    pattern = r'(\+91|91|0)?[6-9]\d{9}'
    phones = []
    for match in re.finditer(pattern, text):
        number = re.sub(r'^(\+91|91|0)', '', match.group())
        if len(number) == 10:
            phones.append(number)
    return list(set(phones))


def extract_urls(text: str) -> list:
    pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    return list(set(re.findall(pattern, text)))


def extract_accounts(text: str) -> list:
    patterns = [
        r'@[\w.]{3,30}',
        r't\.me/[\w+]{3,30}',
        r'wa\.me/\d{10,13}',
    ]
    accounts = []
    for pattern in patterns:
        accounts.extend(re.findall(pattern, text))
    return list(set(accounts))


def extract_names(text: str) -> list:
    name_pattern = r'\b[A-Z][a-z]{2,15}(?:\s[A-Z][a-z]{2,15})?\b'
    candidates = re.findall(name_pattern, text)
    exclude = {
        "The", "This", "That", "When", "Where", "What",
        "How", "Why", "Please", "Sorry", "Yes", "No",
        "Meet", "Call", "Send", "Come", "Tell", "Know",
        "Don", "Let", "You", "They", "Based", "Found"
    }
    return list(set(c for c in candidates
                    if c not in exclude and len(c) > 3))


def extract_locations(text: str) -> list:
    kerala_locations = [
        "Kochi", "Ernakulam", "Thiruvananthapuram", "Kozhikode",
        "Thrissur", "Kollam", "Palakkad", "Alappuzha", "Kannur",
        "Kottayam", "Malappuram", "Wayanad", "Kasaragod",
        "Lulu Mall", "MG Road", "Marine Drive"
    ]
    found = []
    text_lower = text.lower()
    for loc in kerala_locations:
        if loc.lower() in text_lower:
            found.append(loc)
    return found


def extract_dates(text: str) -> list:
    patterns = [
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)'
        r'[a-z]* \d{1,2}\b',
        r'\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b',
    ]
    dates = []
    for pattern in patterns:
        dates.extend(re.findall(pattern, text, re.IGNORECASE))
    return list(set(dates))


def detect_grooming_signals(text: str) -> list:
    signals = []
    secrecy = [
        "don't tell", "dont tell", "keep secret",
        "between us", "our secret", "don't tell your parents"
    ]
    for phrase in secrecy:
        if phrase.lower() in text.lower():
            signals.append({
                "type": "SECRECY_INDUCTION",
                "phrase": phrase,
                "severity": "HIGH"
            })

    platform = [
        "move to telegram", "more private",
        "switch to", "download signal"
    ]
    for phrase in platform:
        if phrase.lower() in text.lower():
            signals.append({
                "type": "PLATFORM_MIGRATION",
                "phrase": phrase,
                "severity": "MEDIUM"
            })

    meeting = ["meet", "come near", "let's meet", "come to"]
    for phrase in meeting:
        if phrase.lower() in text.lower():
            signals.append({
                "type": "PHYSICAL_MEETING_PROPOSED",
                "phrase": phrase,
                "severity": "HIGH"
            })

    return signals