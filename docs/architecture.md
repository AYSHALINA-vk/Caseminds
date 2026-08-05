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

---

## The Two Core Innovations

### Innovation 1 — Dual Risk Scoring
Every suspect scored on two independent axes:

| Score | Question It Answers | Timescale |
|---|---|---|
| Case Risk | How strong is the prosecution evidence? | Weeks/months |
| Active Risk | Is something happening RIGHT NOW? | Last 24-72 hours |

These never mix. A suspect with Active Risk > 75 
surfaces in the Immediate Action lane regardless 
of their Case Risk score.

### Innovation 2 — Adversarial Agent Architecture
No lead reaches the investigator as a single 
confident verdict.

Agent A builds the strongest case FOR a suspect.
Agent B's only job is to find holes in that case.
The investigator sees both — always.

This makes CaseMinds architecturally incapable 
of presenting a single false accusation as truth.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Backend API | FastAPI (Python) | Fast, typed, async |
| Frontend | React + Vite | Component-based UI |
| Vector DB | ChromaDB | Local semantic search |
| Graph DB | Neo4j | Relationship mapping |
| Relational DB | PostgreSQL | Cases, audit logs |
| Local LLM | Ollama + Mistral | On-premise, no cloud |
| NLP | spaCy + multilingual-e5 | Malayalam support |
| Task Queue | Celery + Redis | Parallel pipelines |
| Deployment | Docker Compose | One-command setup |

---

## Security Principles

- Everything runs on-premise
- No evidence leaves the police network
- Every action logged in immutable audit trail
- SHA-256 hash on every file at ingestion
- Harmful content never displayed — hash only
- JWT authentication with role-based access

---

## Covers All 12 ACPIA Requirements

| # | Requirement | Module |
|---|---|---|
| 01 | Content Analysis | NLP Pipeline |
| 02 | Threat Identification | Hash Pipeline |
| 03 | Source Correlation | Knowledge Graph |
| 04 | Contextual Extraction | Evidence Copilot |
| 05 | Activity Pattern Analysis | Active Risk Scorer |
| 06 | Metadata Mapping | Metadata Pipeline |
| 07 | Synthetic Detection | EfficientNet |
| 08 | Timeline Reconstruction | ChronoCase |
| 09 | Intelligent Retrieval | RAG Retriever |
| 10 | Automated Reporting | Report Generator |
| 11 | Risk Assessment | LeadRank |
| 12 | Intelligence Fusion | Agentic Orchestrator |