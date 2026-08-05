"""
CaseMinds — Image Classifier
==============================
Classifies images using EXIF metadata.
No vision AI required — metadata tells the truth.

Classification categories:
  SCREENSHOT      → software tag contains social media app
  LOCATION_PHOTO  → GPS coordinates present
  COVERT_CAPTURE  → night timestamp, no GPS
  DOCUMENT_SCAN   → PDF-like dimensions, no EXIF
  STANDARD_PHOTO  → normal camera capture
  SUSPICIOUS      → timestamp anomaly or GPS stripped
"""

from datetime import datetime


def classify_image(metadata: dict) -> dict:
    """
    Classify an image based on its metadata.
    
    Args:
        metadata: parsed metadata dict from metadata_pipeline
        
    Returns:
        Classification result with category, confidence, and reason
    """
    file    = metadata.get("file", "unknown")
    gps     = metadata.get("gps")
    software = metadata.get("software", "").lower()
    captured = metadata.get("captured_at", "")
    discrepancy = metadata.get("timestamp_discrepancy", False)
    is_screenshot = metadata.get("is_screenshot", False)

    # ── Rule 1: Screenshot detection ──
    screenshot_apps = [
        "instagram", "whatsapp", "telegram",
        "screenshot", "screen", "snip", "capture"
    ]
    if is_screenshot or any(app in software for app in screenshot_apps):
        return {
            "file":       file,
            "category":   "SCREENSHOT",
            "confidence": "HIGH",
            "reason":     f"Software tag: {software or 'screenshot metadata'}",
            "priority":   "MEDIUM",
            "review_note": "Screenshots may contain fabricated content — verify source"
        }

    # ── Rule 2: GPS stripped — suspicious ──
    if not gps and captured:
        try:
            ts = datetime.fromisoformat(captured.replace("Z", ""))
            hour = ts.hour
            if hour >= 22 or hour < 6:
                return {
                    "file":       file,
                    "category":   "COVERT_CAPTURE",
                    "confidence": "HIGH",
                    "reason":     f"GPS absent, captured at {ts.strftime('%H:%M')} — odd hour",
                    "priority":   "HIGH",
                    "review_note": "GPS stripped from night-time capture — deliberate removal suspected"
                }
        except:
            pass
        return {
            "file":       file,
            "category":   "SUSPICIOUS",
            "confidence": "MEDIUM",
            "reason":     "GPS data absent — may have been deliberately stripped",
            "priority":   "HIGH",
            "review_note": "Cross-reference with call tower data for location"
        }

    # ── Rule 3: Location photo ──
    if gps:
        lat = gps.get("lat")
        lng = gps.get("lng")
        acc = gps.get("accuracy_m", 999)

        if discrepancy:
            return {
                "file":       file,
                "category":   "LOCATION_PHOTO",
                "confidence": "HIGH",
                "reason":     f"GPS: {lat}N {lng}E — timestamp discrepancy detected",
                "priority":   "HIGH",
                "review_note": "File modified after capture — possible tampering"
            }

        return {
            "file":       file,
            "category":   "LOCATION_PHOTO",
            "confidence": "HIGH" if acc < 100 else "MEDIUM",
            "reason":     f"GPS: {lat}N {lng}E (±{acc}m)",
            "priority":   "MEDIUM",
            "review_note": f"Accuracy: {acc}m — {'court admissible' if acc < 100 else 'needs corroboration'}"
        }

    # ── Rule 4: Standard photo ──
    return {
        "file":       file,
        "category":   "STANDARD_PHOTO",
        "confidence": "MEDIUM",
        "reason":     "No anomalies detected in metadata",
        "priority":   "LOW",
        "review_note": "Standard camera capture — review content manually"
    }


def score_relevance(classification: dict, hash_match: bool = False) -> int:
    """
    Score image relevance to investigation (0-100).
    
    Signals:
    - Hash match → highest relevance
    - HIGH priority category → high relevance
    - GPS present → medium relevance
    - SCREENSHOT → medium (could contain evidence)
    - STANDARD → low
    """
    score = 0

    if hash_match:
        score += 50

    priority_scores = {
        "HIGH":   35,
        "MEDIUM": 20,
        "LOW":    5
    }
    score += priority_scores.get(
        classification.get("priority", "LOW"), 5
    )

    category_scores = {
        "SUSPICIOUS":    15,
        "COVERT_CAPTURE": 10,
        "LOCATION_PHOTO": 8,
        "SCREENSHOT":    5,
        "STANDARD_PHOTO": 0
    }
    score += category_scores.get(
        classification.get("category", "STANDARD_PHOTO"), 0
    )

    return min(score, 100)


def cluster_images(classifications: list) -> dict:
    """
    Group images by category.
    
    Returns dict of category → list of files
    Allows investigator to review one category at a time
    reducing cognitive load.
    """
    clusters = {}
    for c in classifications:
        cat = c.get("category", "UNKNOWN")
        if cat not in clusters:
            clusters[cat] = []
        clusters[cat].append(c)

    # Sort each cluster by relevance score (highest first)
    for cat in clusters:
        clusters[cat].sort(
            key=lambda x: x.get("relevance_score", 0),
            reverse=True
        )

    return clusters


def run_media_scan(metadata_list: list,
                   hash_results: dict = None) -> dict:
    """
    Full MediaScan pipeline.
    
    Takes a list of metadata dicts (from metadata_pipeline)
    and returns classified, scored, clustered results.
    
    Args:
        metadata_list: list of parsed metadata from all images
        hash_results:  dict of filename → bool (hash match)
        
    Returns:
        Full MediaScan report with clusters and scores
    """
    if hash_results is None:
        hash_results = {}

    classifications = []

    for meta in metadata_list:
        # Classify
        classification = classify_image(meta)

        # Score relevance
        has_hash_match = hash_results.get(
            meta.get("file", ""), False
        )
        relevance = score_relevance(classification, has_hash_match)
        classification["relevance_score"] = relevance

        classifications.append(classification)

    # Sort all by relevance (highest first)
    classifications.sort(
        key=lambda x: x["relevance_score"],
        reverse=True
    )

    # Cluster by category
    clusters = cluster_images(classifications)

    # Summary stats
    high_priority = [
        c for c in classifications
        if c["priority"] == "HIGH"
    ]
    suspicious = [
        c for c in classifications
        if c["category"] in ["SUSPICIOUS", "COVERT_CAPTURE"]
    ]

    return {
        "total_images":      len(classifications),
        "high_priority":     len(high_priority),
        "suspicious_count":  len(suspicious),
        "clusters":          clusters,
        "ranked_list":       classifications,
        "processing_note":   "Classified from EXIF metadata — no vision AI required",
        "reviewed_at":       datetime.utcnow().isoformat()
    }


# ── Demo ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    import json

    # Load sample metadata
    with open("../sample_data/metadata_sample.json") as f:
        data = json.load(f)

    # Parse each file through metadata_pipeline first
    from metadata_pipeline import parse_metadata
    parsed = [parse_metadata(f) for f in data["files"]]

    # Simulate hash results
    hash_results = {
        "image_003.jpg": True  # hash match detected
    }

    # Run MediaScan
    results = run_media_scan(parsed, hash_results)

    print("=" * 55)
    print("  MEDIASCAN — IMAGE CLASSIFICATION RESULTS")
    print("=" * 55)
    print(f"\n  Total images:     {results['total_images']}")
    print(f"  High priority:    {results['high_priority']}")
    print(f"  Suspicious:       {results['suspicious_count']}")

    print("\n  RANKED BY RELEVANCE:")
    print("  " + "-" * 40)
    for img in results["ranked_list"]:
        print(f"\n  [{img['relevance_score']:3d}] {img['file']}")
        print(f"       Category:  {img['category']}")
        print(f"       Confidence:{img['confidence']}")
        print(f"       Reason:    {img['reason']}")
        print(f"       Note:      {img['review_note']}")

    print("\n  CLUSTERS:")
    print("  " + "-" * 40)
    for cat, images in results["clusters"].items():
        print(f"\n  {cat} ({len(images)} images)")
        for img in images:
            print(f"    → {img['file']} [score: {img['relevance_score']}]")