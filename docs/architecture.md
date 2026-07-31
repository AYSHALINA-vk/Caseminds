# CaseMinds — System Architecture
> Agentic Child Protection Investigation Assistant
> Hac'KP 2026 · Kerala Police

---

## The Core Problem This Solves

Investigators handling child protection cases face three 
simultaneous challenges:

1. **Volume** — thousands of messages, images, 
   and call records per case
2. **Cognitive overload** — manual analysis degrades 
   over time, connections get missed
3. **Wrong prioritization** — high evidence volume 
   creates illusion of high priority, burying 
   urgent real-time threats

CaseMinds solves all three through a five-layer 
agentic pipeline.

---

## System Architecture — Five Layers

LAYER 1 — INGESTION
Any file format → SHA-256 hashed → MIME routed
↓
LAYER 2 — PARALLEL AI PROCESSING
NLP Pipeline → entities, phones, locations
Hash Pipeline → known content detection
Metadata Pipeline → EXIF, GPS, device ID
Synthetic Pipeline→ deepfake detection
↓
LAYER 3 — INTELLIGENCE ENGINE
Knowledge Graph → who knows who
ChronoCase → full timeline + gap detection
LeadRank → dual risk scoring
↓
LAYER 4 — ADVERSARIAL AGENTS
Agent A → builds prosecution case
Agent B → challenges every claim
Synthesis → investigator sees both
↓
LAYER 5 — INVESTIGATOR DASHBOARD
Immediate Action Lane → Active Risk > 75
Case Triage Queue → Case Risk ranked
Evidence Copilot → plain language Q&A

LAYER 1 — INGESTION
Any file format → SHA-256 hashed → MIME routed
↓
LAYER 2 — PARALLEL AI PROCESSING
NLP Pipeline → entities, phones, locations
Hash Pipeline → known content detection
Metadata Pipeline → EXIF, GPS, device ID
Synthetic Pipeline→ deepfake detection
↓
LAYER 3 — INTELLIGENCE ENGINE
Knowledge Graph → who knows who
ChronoCase → full timeline + gap detection
LeadRank → dual risk scoring
↓
LAYER 4 — ADVERSARIAL AGENTS
Agent A → builds prosecution case
Agent B → challenges every claim
Synthesis → investigator sees both
↓
LAYER 5 — INVESTIGATOR DASHBOARD
Immediate Action Lane → Active Risk > 75
Case Triage Queue → Case Risk ranked
Evidence Copilot → plain language Q&A