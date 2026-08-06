# CaseMinds

**Agentic Child Protection Investigation Assistant — built for Hac'KP 2026 (Kerala Police, ACPIA problem statement)**

> *"CaseMinds ingests all your digital evidence, answers your questions in plain language, reconstructs the full case timeline automatically, and tells you who your top suspects are  in one screen, on your own servers, with every action legally logged.."*

---

## The Problem

Child protection investigators aren't short on evidence — they're drowning in it. A single case can involve thousands of chat messages, call records, images, and device dumps spread across a dozen file formats. Investigators spend the majority of their time manually organizing and cross-referencing this data instead of investigating. Meanwhile, two different clocks run in parallel and often get confused: the urgency of rescuing a victim, and the urgency of building a prosecutable case.

CaseMinds is built to compress that manual correlation work from days to minutes — without ever making the final call itself.

## What CaseMinds Does

CaseMinds ingests raw case evidence and runs it through four coordinated stages:

| Stage | What it does |
|---|---|
| **Ingest** | Accepts chats, call records, images, PDFs, and device dumps. Every file is hashed (SHA-256) on arrival for chain-of-custody integrity. |
| **Process** | Parallel pipelines extract metadata, timestamps, entities, and GPS/EXIF data from all uploaded evidence. |
| **Argue** | Two adversarial AI agents review the same evidence — Agent A builds the strongest case for suspicion, Agent B actively challenges every claim it makes. |
| **Surface** | The investigator sees both sides, a transparent risk score with plain-language reasoning, and makes every final decision. |

### Core Modules

- **Evidence Copilot** — a retrieval-based Q&A interface. Investigators ask questions in plain English or Malayalam and get answers grounded in the actual case evidence, with source citations.
- **ChronoCase** — automatically reconstructs a unified, filterable timeline from every timestamped source (messages, calls, EXIF data), surfacing patterns like communication spikes and suspicious silences.
- **LeadRank** — scores every person appearing in the evidence using weighted, explainable signals (contact frequency, location proximity, communication patterns) rather than a black-box output.
- **Adversarial Agents** — Agent A (prosecutor) and Agent B (defender) independently assess the evidence and produce a net confidence score, so no single AI claim reaches the investigator unchallenged.
- **Court Report Generator** — one-click export of a structured, evidence-cited case summary.

## Why This Approach

A wrong AI call in this domain isn't just inefficient — it costs time the real suspect uses to flee or destroy evidence, and it can leave a child in danger. Every design decision in CaseMinds follows from that:

- **No single AI verdict.** The adversarial agent design makes it structurally difficult for one AI claim to reach an investigator unexamined.
- **Explainable scoring, not black-box output.** Every score in LeadRank and the risk cards comes with the specific evidence signals behind it.
- **On-premise by design.** Evidence never needs to leave the police network — no cloud dependency for evidence handling.
- **Audit-logged.** Every AI inference and human action is tied to an officer ID, a timestamp, and an evidence hash.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| Frontend | React + Vite |
| Database | PostgreSQL |
| Vector search / retrieval | ChromaDB |
| Local LLM inference | Ollama |
| NLP | spaCy |
| Metadata / EXIF | ExifTool, Pillow |

All components are open-source and run locally — no external API costs, no cloud data egress.

## Project Structure

```
Caseminds/
├── backend/
│   ├── api_server.py          # Main API — evidence upload, Copilot query, report generation
│   ├── active_risk.py         # Active (rescue urgency) risk scoring
│   ├── lead_ranker.py         # LeadRank — suspect priority scoring
│   ├── adversarial_agent.py   # Agent A / Agent B logic
│   ├── nlp_pipeline.py        # Entity extraction from text evidence
│   ├── metadata_pipeline.py   # EXIF / GPS / timestamp extraction
│   ├── hash_pipeline.py       # SHA-256 chain-of-custody + hash matching
│   ├── rag_engine.py          # ChromaDB indexing + Ollama-backed Q&A
│   └── verification_layer.py
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── CaseDetail.jsx     # Main case view — risk, agents, Copilot, timeline
│       │   ├── CaseList.jsx       # Case dashboard
│       │   ├── EvidenceUpload.jsx
│       │   ├── CourtReport.jsx
│       │   ├── Annotations.jsx
│       │   └── Login.jsx
│       └── App.jsx
└── docs/
    ├── architecture.md
    ├── agent-logic.md
    └── data-flow.md
```

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- [Ollama](https://ollama.com/download) installed locally

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt

# Pull a local model for the Copilot (small model recommended for demo speed)
ollama pull llama3.2:1b

# Run the API server
python api_server.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Current Status

This is an active hackathon build. Not every module is at the same level of completeness — here's where things honestly stand:

**Working end-to-end:**
- Evidence upload with hash-based chain of custody
- Dual risk scoring (Active Risk / Case Risk)
- Adversarial agent claim/challenge display
- ChronoCase timeline reconstruction from evidence timestamps
- Court report generation

**In active development:**
- Evidence Copilot's retrieval-and-generation layer (ChromaDB + Ollama) — architecture is built, integration is being finalized
- Malayalam/Manglish NLP support — currently English-first, multilingual extraction is a work in progress
- Knowledge graph relationship mapping — currently handled via LeadRank scoring rather than a dedicated graph database

## Roadmap (Post-Hackathon)

- Full Malayalam/Manglish NLP pipeline
- Graph-based relationship mapping (Neo4j) for multi-entity case correlation
- Perceptual hash matching against law-enforcement hash-set databases for known harmful content
- Image/video triage pipeline (EXIF/GPS mapping, similarity clustering, relevance scoring)
- CCTNS integration
- Pilot deployment with Kerala Cyber Crime Unit

## Team

Built by Aysha Lina V K for Hac'KP 2026.


---

*CaseMinds doesn't replace investigators. It gives them an AI partner that never gets tired, never misses a connection, and puts every decision exactly where it belongs — with the human.*
