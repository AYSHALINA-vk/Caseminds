from datetime import datetime


def parse_metadata(file_meta: dict) -> dict:
    result = {
        "file": file_meta.get("file", "unknown"),
        "processed_at": datetime.utcnow().isoformat()
    }

    if "gps_lat" in file_meta and "gps_lng" in file_meta:
        result["gps"] = {
            "lat": file_meta["gps_lat"],
            "lng": file_meta["gps_lng"],
            "accuracy_m": file_meta.get("gps_accuracy", "unknown"),
            "maps_link": f"https://maps.google.com/?q={file_meta['gps_lat']},{file_meta['gps_lng']}"
        }

    if "datetime_original" in file_meta:
        result["captured_at"] = file_meta["datetime_original"]

    if "file_modified" in file_meta:
        result["file_modified"] = file_meta["file_modified"]
        if "datetime_original" in file_meta:
            result["timestamp_discrepancy"] = (
                file_meta["datetime_original"] != file_meta["file_modified"]
            )

    if "make" in file_meta or "model" in file_meta:
        result["device"] = {
            "make": file_meta.get("make"),
            "model": file_meta.get("model"),
            "id": file_meta.get("device_id"),
        }

    software = file_meta.get("software", "")
    result["is_screenshot"] = any(
        kw in software.lower()
        for kw in ["instagram", "screenshot", "screen", "snip"]
    )

    return result


def detect_timestamp_anomalies(metadata_list: list) -> list:
    anomalies = []
    for meta in metadata_list:
        if meta.get("timestamp_discrepancy"):
            anomalies.append({
                "file": meta["file"],
                "flag": "TIMESTAMP_DISCREPANCY",
                "detail": "File modified date differs from capture date"
            })
    return anomalies