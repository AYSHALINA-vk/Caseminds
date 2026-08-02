"""
CaseMinds — FastAPI Backend Server
=====================================
Live backend connecting React dashboard to all pipelines.

Run with: uvicorn api_server:app --reload --port 8000

Endpoints:
  GET  /api/health          → server status
  GET  /api/cases           → all cases list
  GET  /api/cases/{id}      → single case detail
  POST /api/query           → Evidence Copilot Q&A
  POST /api/analyze         → run full pipeline on case
  GET  /api/timeline/{id}   → case timeline events
  GET  /api/leads/{id}      → ranked suspect list
"""

# from PIL.Image import msg
# from PIL.Image import msg
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import csv
import os
from datetime import datetime

from nlp_pipeline import extract_entities
from lead_ranker import compute_case_risk, explain_case_risk
from active_risk import compute_active_risk, explain_active_risk
from adversarial_agent import run_agent_a, run_agent_b, synthesize_outputs
from hash_pipeline import compute_phash, check_hash_database
from metadata_pipeline import parse_metadata

app = FastAPI(title="CaseMinds API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Data paths ────────────────────────────────────────────────────

BASE = os.path.dirname(os.path.abspath(__file__))
SAMPLE = os.path.join(BASE, "..", "sample_data")

def load_chat():
    with open(os.path.join(SAMPLE, "chat_export.json")) as f:
        return json.load(f)

def load_calls():
    rows = []
    with open(os.path.join(SAMPLE, "call_records.csv")) as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows

def load_metadata():
    with open(os.path.join(SAMPLE, "metadata_sample.json")) as f:
        return json.load(f)

def load_hashes():
    with open(os.path.join(SAMPLE, "hash_db.csv")) as f:
        return f.read()

def load_manifest():
    with open(os.path.join(SAMPLE, "evidence_manifest.json")) as f:
        return json.load(f)

# ── Static case registry ──────────────────────────────────────────
# In production: PostgreSQL
# In prototype: seeded from sample data

CASES = [
    {
        "id": "KL-DEMO-2024-001",
        "name": "Operation Shield",
        "status": "ACTIVE",
        "suspect": "Accused_X",
        "suspect_phone": "9876543210",
        "last_activity": "2024-03-13T02:18:00",
        "immediateAction": True,
        "signals": [
            "Live location signal near victim",
            "Contact frequency increased 4x",
            "Platform migration to Telegram"
        ]
    },
    {
        "id": "KL-DEMO-2024-002",
        "name": "Operation Anchor",
        "status": "ACTIVE",
        "suspect": "Accused_Y",
        "suspect_phone": "9812345679",
        "last_activity": "2024-03-09T14:22:00",
        "immediateAction": False,
        "signals": []
    },
    {
        "id": "KL-DEMO-2024-003",
        "name": "Operation Lighthouse",
        "status": "SOLVED",
        "suspect": "Accused_Z",
        "suspect_phone": "9823456780",
        "last_activity": "2024-02-20T10:00:00",
        "immediateAction": False,
        "signals": []
    }
]

# ── Pipeline signals for demo case ───────────────────────────────

DEMO_SIGNALS = {
    "contact_frequency":       47,
    "odd_hour_ratio":          0.80,
    "hash_match_flag":         1,
    "synthetic_flag":          0,
    "platform_migration_flag": 1,
    "metadata_anomaly_flag":   1,
    "last_activity":           datetime(2024, 3, 13, 2, 18, 0),
    "frequency_delta":         0.8,
    "live_location_signal":    0.9,
    "platform_escalation_speed": 0.7,
    "victim_latency_drop":     0.6
}

# ── Endpoints ─────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {
        "status": "CaseMinds backend running",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "pipelines": [
            "nlp", "hash", "metadata",
            "lead_ranker", "active_risk",
            "adversarial_agents"
        ]
    }


@app.get("/api/cases")
def get_cases():
    """Return all cases with risk scores."""
    enriched = []
    for case in CASES:
        signals = DEMO_SIGNALS if case["id"] == "KL-DEMO-2024-001" else {
            "contact_frequency": 30,
            "odd_hour_ratio": 0.3,
            "hash_match_flag": 0,
            "synthetic_flag": 0,
            "platform_migration_flag": 0,
            "metadata_anomaly_flag": 0,
            "last_activity": datetime(2024, 3, 9, 14, 22, 0),
            "frequency_delta": 0.2,
            "live_location_signal": 0.1,
            "platform_escalation_speed": 0.1,
            "victim_latency_drop": 0.1
        }
        enriched.append({
            **case,
            "activeRisk": compute_active_risk(signals),
            "caseRisk":   compute_case_risk(signals),
        })
    return {"cases": enriched}


@app.get("/api/cases/{case_id}")
def get_case(case_id: str):
    """Return single case with full analysis."""
    case = next((c for c in CASES if c["id"] == case_id), None)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    signals = DEMO_SIGNALS if case_id == "KL-DEMO-2024-001" else {}

    case_risk   = compute_case_risk(signals)
    active_risk = compute_active_risk(signals)
    case_reasons   = explain_case_risk(signals)
    active_reasons = explain_active_risk(signals)

    agent_a = run_agent_a({}, signals, case_risk)
    agent_b = run_agent_b(agent_a)
    synthesis = synthesize_outputs(agent_a, agent_b, active_risk)

    return {
        **case,
        "caseRisk":    case_risk,
        "activeRisk":  active_risk,
        "caseReasons": case_reasons,
        "activeReasons": active_reasons,
        "agentA":      agent_a,
        "agentB":      agent_b,
        "synthesis":   synthesis
    }


@app.get("/api/timeline/{case_id}")
def get_timeline(case_id: str):
    """Return case timeline built from evidence files."""
    if case_id != "KL-DEMO-2024-001":
        return {"events": [], "gaps": []}

    chat = load_chat()
    calls = load_calls()

    events = []

# Add chat events
    # Add chat events
    for msg in chat.get("messages", []):
        ts_str = msg.get("timestamp", "")
        if not ts_str:
            continue
        events.append({
            "id":        f"chat_{msg['id']}",
            "timestamp": ts_str,
            "source":    "chat_export.json",
            "type":      "MESSAGE",
            "content":   msg.get("content", ""),
            "from":      msg.get("from", ""),
            "deleted":   msg.get("deleted", False),
            "flag":      _flag_message(msg)
        })

    # Add call events
    for call in calls:
        ts_str = call.get("timestamp_start", "")
        if not ts_str:
            continue
        events.append({
            "id":        call.get("call_id", ""),
            "timestamp": ts_str,
            "source":    "call_records.csv",
            "type":      "CALL",
            "content":   f"{call.get('duration_sec','?')}s call from {call.get('cell_tower','?')}",
            "tower":     call.get("tower_location", ""),
            "flag":      call.get("flag", "")
        })

    # Sort by timestamp
    events.sort(key=lambda x: x["timestamp"])

    # Detect gaps
    gaps = []
    for i in range(1, len(events)):
        t1 = datetime.fromisoformat(events[i-1]["timestamp"])
        t2 = datetime.fromisoformat(events[i]["timestamp"])
        gap_hours = (t2 - t1).total_seconds() / 3600
        if gap_hours > 4:
            gaps.append({
                "start":         events[i-1]["timestamp"],
                "end":           events[i]["timestamp"],
                "duration_hours": round(gap_hours, 1),
                "flag":          "SUSPICIOUS_SILENCE"
            })

    return {
        "case_id": case_id,
        "events":  events,
        "gaps":    gaps,
        "total":   len(events)
    }


@app.get("/api/leads/{case_id}")
def get_leads(case_id: str):
    """Return ranked suspect list for a case."""
    if case_id != "KL-DEMO-2024-001":
        return {"leads": []}

    manifest = load_manifest()
    flags = []
    for item in manifest.get("evidence_items", []):
        flags.extend(item.get("flags", []))

    case_risk   = compute_case_risk(DEMO_SIGNALS)
    active_risk = compute_active_risk(DEMO_SIGNALS)
    agent_a = run_agent_a({}, DEMO_SIGNALS, case_risk)
    agent_b = run_agent_b(agent_a)
    synthesis = synthesize_outputs(agent_a, agent_b, active_risk)

    return {
        "leads": [
            {
                "suspect":    "Accused_X",
                "phone":      "9876543210",
                "caseRisk":   case_risk,
                "activeRisk": active_risk,
                "netConfidence": synthesis["net_confidence"],
                "flags":      list(set(flags)),
                "immediateAction": active_risk > 75
            }
        ]
    }


@app.get("/api/nlp/{case_id}")
def get_nlp(case_id: str):
    """Return NLP extraction results."""
    if case_id != "KL-DEMO-2024-001":
        return {"entities": {}}

    chat = load_chat()
    full_text = " ".join([
        m["content"] for m in chat.get("messages", [])
        if not m.get("deleted")
    ])
    entities = extract_entities(full_text)
    return {
        "case_id":  case_id,
        "entities": entities,
        "source":   "chat_export.json"
    }


class QueryRequest(BaseModel):
    question: str
    case_id:  str = "KL-DEMO-2024-001"


@app.post("/api/query")
def query_copilot(req: QueryRequest):
    """
    Evidence Copilot endpoint.
    In prototype: returns context-aware response from evidence.
    In production: ChromaDB retrieval + Ollama generation.
    """
    chat     = load_chat()
    calls    = load_calls()
    metadata = load_metadata()

    # Build evidence summary
    messages_text = "\n".join([
        f"[{m['timestamp']}] {m['from']}: {m['content']}"
        for m in chat.get("messages", [])
    ])

    calls_text = "\n".join([
        f"{c['timestamp_start']}: {c['duration_sec']}s from {c['tower_location']}"
        for c in calls
    ])

    # Simple keyword-based retrieval for prototype
    q_lower = req.question.lower()
    relevant_chunks = []

    for msg in chat.get("messages", []):
        content = msg["content"].lower()
        if any(kw in q_lower for kw in
               ["march 12", "meet", "location", "gps", "where",
                "evide", "aayirnnu", "enga", "contact"]):
            relevant_chunks.append(
                f"[chat_export.json msg #{msg['id']} "
                f"at {msg['timestamp']}]: {msg['content']}"
            )

    for call in calls:
        if "march 12" in q_lower or "location" in q_lower or \
           "evide" in q_lower or "tower" in q_lower:
            relevant_chunks.append(
                f"[call_records.csv {call['call_id']} "
                f"at {call['timestamp_start']}]: "
                f"{call['duration_sec']}s call from "
                f"{call['tower_location']} tower"
            )

    if not relevant_chunks:
        relevant_chunks = [
            f"[chat_export.json]: {len(chat['messages'])} messages analyzed",
            f"[call_records.csv]: {len(calls)} call records loaded",
            "Key signals: SECRECY_INDUCTION, PLATFORM_MIGRATION, "
            "PHYSICAL_MEETING_PROPOSED, GPS_STRIPPED"
        ]

    answer = (
        f"Based on evidence analysis:\n\n" +
        "\n".join(f"→ {chunk}" for chunk in relevant_chunks[:5]) +
        "\n\n[Full RAG response requires Ollama backend. "
        "Connect Mistral 7B via Ollama for semantic retrieval.]"
    )

    return {
        "answer":   answer,
        "sources":  ["chat_export.json", "call_records.csv",
                     "metadata_sample.json"],
        "chunks":   len(relevant_chunks),
        "case_id":  req.case_id,
        "status":   "prototype_retrieval"
    }


# ── Helper functions ──────────────────────────────────────────────

def _flag_message(msg: dict) -> str:
    content = msg.get("content", "").lower()
    if msg.get("deleted"):
        return "DELETED_MESSAGE"
    if "don't tell" in content or "dont tell" in content:
        return "SECRECY_INDUCTION"
    if "telegram" in content or "private" in content:
        return "PLATFORM_MIGRATION"
    if "meet" in content or "come near" in content:
        return "PHYSICAL_MEETING"
   # NEW — handles both chat and call record formats
    ts_str = msg.get("timestamp") or msg.get("timestamp_start", "")
    if not ts_str:
        return ""
    ts = datetime.fromisoformat(ts_str)
    if ts.hour >= 22 or ts.hour < 6:
        return "ODD_HOUR"
    return ""


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)