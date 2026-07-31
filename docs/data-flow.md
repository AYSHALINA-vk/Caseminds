# CaseMinds — Data Flow Documentation
> The complete journey of one piece of evidence
> from upload to investigator dashboard

---

## Why This Document Exists


> "What exactly happens between upload and output?"

This document traces one file — a WhatsApp chat
export — through the entire CaseMinds system.

---

## The Journey — Step By Step

### Step 1 — Upload

Investigator drags chat_export.json
into the dashboard
↓
POST /api/upload receives the file
↓
SHA-256 hash computed immediately
"3b4c5d6e7f8a9b0c..."
↓
Hash stored in evidence_manifest.json
Chain of custody is now sealed.
If this hash changes later — tampering detected.
↓
File saved to encrypted local storage

**Investigator benefit:**
They don't manage any of this.
One drag and drop. System handles the rest.

---

### Step 2 — MIME Detection

python-magic reads first 8 bytes of file
↓
Identifies true file type
(not based on filename — based on actual content)
↓
chat_export.json → "application/json"
↓
Router sends to: NLP Pipeline + RAG Indexer

**Why this matters:**
A suspect could rename malware.exe to photo.jpg
MIME detection catches this — filename is irrelevant.

---

### Step 3 — NLP Pipeline Runs

JSON parsed → messages extracted as text
↓
spaCy reads every message
↓
Entities extracted:
Names → ["Arun Kumar"]
Phones → ["9876543210"]
Locations → ["Lulu Mall", "Kochi"]
Dates → ["March 12", "8 PM"]
↓
Stored in entities table in PostgreSQL
↓
Feeds into Knowledge Graph as nodes

---

### Step 4 — RAG Indexer Runs

All messages split into 500-character chunks
↓
Each chunk converted to vector
using multilingual-e5-large
↓
Vectors stored in ChromaDB
with metadata: {case_id, file_name, timestamp}
↓
Evidence Copilot is now ready to answer
questions about this file

**What this enables:**
Investigator can now ask:
"Did the suspect ever mention a meeting location?"
And get a cited answer in seconds.

---

### Step 5 — Timeline Builder Runs

Every message timestamp extracted
↓
Normalized to UTC
↓
Added to unified event stream for this case
↓
ChronoCase checks for gaps > 4 hours
↓
March 12 gap detected:
Last message: 20:02
Next contact: 02:14 (next day)
Gap: 6 hours 12 minutes
Flag: SUSPICIOUS_SILENCE


**What this reveals:**
A 6 hour silence on the exact day a physical
meeting was proposed.
The investigator would never search for a silence.
ChronoCase finds it automatically.

---

### Step 6 — LeadRank Scores Update

New entities from this file feed into scoring:
contact_frequency → 47 contacts detected
odd_hour_ratio → 60% messages after 10PM
platform_migration → WhatsApp → Telegram detected
↓
Case Risk recalculated: 84/100
Active Risk recalculated: 91/100
↓
Suspect card updated in dashboard


---

### Step 7 — Adversarial Agents Run

Agent A receives all signals and claims:
"47 contacts, platform migration, GPS anomaly"
↓
Agent B receives Agent A's output:
"Victim initiated 39/47, GPS margin 800m"
↓
Synthesis layer merges both:
Net Confidence: 35.3/100
↓
Investigator card updated with both sides


---

### Step 8 — Dashboard Updates

Active Risk 91 > threshold 75
↓
Suspect moves to IMMEDIATE ACTION lane
Pinned at top of dashboard
Cannot be filtered or hidden
↓
Investigator opens dashboard and sees:

⚡ IMMEDIATE ACTION
Accused_X | Active: 91 | Case: 84
Last signal: 2 hours ago
→ [View Evidence] [Agent Analysis] [Generate Report]


---

### Step 9 — Audit Trail

Every single action logged:
{
action: "FILE_UPLOADED",
officer: "officer_001",
file: "chat_export.json",
sha256: "3b4c5d6e7f8a9b0c...",
timestamp: "2024-03-15T10:05:00Z",
ip: "192.168.1.45"
}

Immutable — cannot be edited or deleted
Court admissible
CCTNS compatible export


---

## Full Flow Summary

UPLOAD → file secured, hash sealed
MIME DETECTION → routed correctly
NLP PIPELINE → words become intelligence
RAG INDEXER → evidence becomes searchable
TIMELINE → timestamps become story
LEADRANK → story becomes priority
AGENTS → priority becomes verified
DASHBOARD → verified lead reaches human

Total time: under 60 seconds
Investigator effort: one drag and drop


---

## The One Line That Summarises This

> "The investigator's job is to make decisions.
>  CaseMinds does everything before that decision
>  so the investigator arrives at the decision
>  with full intelligence, not raw data."