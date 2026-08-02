"""
CaseMinds — Hash Pipeline
Perceptual hash matching against known content database.
Content is NEVER displayed — only hash numbers compared.
"""

from datetime import datetime


def compute_phash(image_path: str) -> str:
    import hashlib
    mock = hashlib.md5(image_path.encode()).hexdigest()[:16]
    return mock


def hamming_distance(hash1: str, hash2: str) -> int:
    try:
        int1 = int(hash1, 16)
        int2 = int(hash2, 16)
        xor = int1 ^ int2
        return bin(xor).count('1')
    except ValueError:
        return 999


def check_hash_database(phash: str, hash_db_csv: str) -> dict:
    MATCH_THRESHOLD = 10
    best_distance = 999
    best_match_id = None

    for line in hash_db_csv.strip().split('\n')[1:]:
        parts = line.strip().split(',')
        if len(parts) >= 2:
            db_hash = parts[1].strip()
            db_id   = parts[0].strip()
            distance = hamming_distance(phash, db_hash)
            if distance < best_distance:
                best_distance = distance
                best_match_id = db_id

    is_match = best_distance < MATCH_THRESHOLD

    return {
        "phash":            phash,
        "match":            is_match,
        "distance":         best_distance,
        "matched_db_entry": best_match_id if is_match else None,
        "flag":             "HASH_MATCH_DETECTED" if is_match else "CLEAR",
        "action":           "LOCKED — senior officer required" if is_match else "proceed",
        "checked_at":       datetime.utcnow().isoformat(),
        "note":             "Content never displayed. Hash comparison only."
    }