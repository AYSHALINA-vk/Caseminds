# CaseMinds — Processing Pipeline Documentation

> This document explains what happens to every piece 
> of evidence from the moment it is uploaded to the 
> moment it reaches the investigator dashboard.

---

## The Golden Rule

> Every file is processed automatically.
> The investigator uploads evidence and walks away.
> By the time they return, the system has already
> extracted every piece of intelligence from every file.

---

## Pipeline Overview
UPLOAD
↓
SHA-256 hash computed (chain of custody sealed)
↓
MIME type detected (true file type identified)
↓
PARALLEL PROCESSING (all four run simultaneously)
↓
├── NLP Pipeline
├── Hash Pipeline
├── Metadata Pipeline
└── Synthetic Pipeline
↓
INTELLIGENCE ENGINE
↓
INVESTIGATOR DASHBOARD

---

## Why Parallel Processing Matters

If pipelines ran one after another:
- 4 pipelines × 10 seconds each = 40 seconds per file
- 100 files = 66 minutes waiting

Running in parallel:
- All 4 pipelines simultaneously = 10 seconds per file
- 100 files = under 20 minutes
- Investigator gets insights faster

---

## Pipeline 1 — NLP Pipeline
**Reads WORDS**

### What It Does
Reads every piece of text evidence and extracts
structured intelligence from unstructured language.

### What It Extracts
| Entity | Example | Investigative Value |
|---|---|---|
| Names | "Arun Kumar" | Suspect identification |
| Phone numbers | "9876543210" | Contact tracing |
| Locations | "Lulu Mall Kochi" | Movement tracking |
| Dates | "March 12 at 8 PM" | Timeline building |
| URLs | "t.me/privatechat" | Platform tracking |
| Account IDs | "@username_tg" | Cross-platform identity |

### Why Malayalam Support Is Critical
Suspects communicate most naturally in Malayalam
and Manglish — their most unguarded conversations
happen in their native language.

An English-only system is blind to the majority
of real Kerala investigation evidence.

CaseMinds uses multilingual-e5-large embeddings
which understand English, Malayalam, and Manglish
in the same processing pipeline.

### Input → Output

Input: "ningal evide aanu? Come near Lulu Mall
Kochi at 8. Call me 9876543210"

Output: {
locations: ["Lulu Mall", "Kochi"],
phones: ["9876543210"],
dates: ["8 PM"],
language: "Manglish detected"
}

---

## Pipeline 2 — Hash Pipeline
**Identifies HARMFUL CONTENT**

### What It Does
Compares a mathematical fingerprint of every 
uploaded image against a database of known 
harmful content fingerprints.

### The Critical Design Principle

No human. No AI. No log file. Ever sees the content.
Only numbers are compared against numbers.

### How Perceptual Hashing Works

### Why Not Regular Hashing?
Regular hash: change 1 pixel → completely different hash
Perceptual hash: resize, crop, recompress → same hash

Criminals edit images slightly to evade detection.
Perceptual hashing catches edited versions too.

---

## Pipeline 3 — Metadata Pipeline
**Reads HIDDEN FILE DATA**

### What It Does
Every file has invisible data embedded inside it.
Most people don't know it exists.
Suspects share files thinking only the content is visible.
The metadata tells a completely different story.

### What Gets Extracted

**From Images:**

GPS coordinates → exact location where photo was taken
Capture time → when shutter was pressed (≠ file date)
Device model → "Samsung Galaxy A52"
Device ID → unique identifier linking multiple photos
Software → "Instagram 289.0" = this is a screenshot

**From Documents:**

Author name → real identity behind anonymous documents
Last modified by → who edited it and when
Creation date → when it was first made

**From Emails:**

Originating IP → sender's real IP address
Server routing → full path the email traveled

### The Timestamp Trap
Every file has three timestamps:

DateCreated → when file was made
DateModified → when file was last saved
DateTimeOriginal → when camera actually clicked

If DateModified ≠ DateTimeOriginal → file was edited
after capture. CaseMinds flags this automatically.

---

## Pipeline 4 — Synthetic Detection Pipeline
**Detects FAKE CONTENT**

### What It Does
Scores every image and video for probability of
being AI-generated, deepfaked, or manipulated.

### Why This Matters Now
Suspects increasingly use:
- AI-generated images to fabricate evidence
- Deepfakes to create false alibis
- Edited images to tamper with proof

### How It Works

Image/Video arrives
↓
Resized to 224×224, normalized
↓
EfficientNet-B4 neural network analyzes:

Facial boundary artifacts
Unnatural frequency patterns
Compression inconsistencies
↓
Score: 0.0 (definitely real) → 1.0 (definitely fake)
↓
Score > 0.75 → FLAGGED for investigator review

### Output Example
```json
{
  "file": "suspect_photo.jpg",
  "synthetic_score": 0.89,
  "flag": "HIGH_PROBABILITY_SYNTHETIC",
  "reason": "facial boundary artifacts detected",
  "action": "flagged for senior officer review"
}
```

---

## Processing Time

| File Type | Pipelines | Time |
|---|---|---|
| Chat export | NLP + RAG | 3-8 seconds |
| Image | Hash + Metadata + Synthetic | 5-12 seconds |
| PDF | NLP + RAG | 4-10 seconds |
| Call records CSV | Timeline builder | 1-3 seconds |
| Video (1 min) | Metadata + Synthetic | 15-30 seconds |

**Total for typical evidence package: under 60 seconds**

---

## What The Investigator Sees

Nothing from the pipelines directly.

Everything flows into the Intelligence Engine first,
which builds the knowledge graph, timeline, and
risk scores — then the dashboard surfaces only
what the investigator needs to act on.

The investigator never manages pipelines.
They just see results.
