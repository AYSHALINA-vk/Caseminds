# Agent Communication Logic
> How Agent A and Agent B talk to each other
> and why both must speak before the investigator sees anything

---

## The Core Principle

A court of law never convicts on one side of the argument.
Prosecution speaks. Defense speaks. Judge decides.

CaseMinds works the same way.

Agent A speaks → builds the strongest case FOR a lead
Agent B speaks → challenges every single claim
Investigator → sees both and makes the final decision

No lead ever reaches the investigator as a single
confident AI verdict. Ever.

---

## Why This Architecture Exists

### The False Accusation Problem
An AI scoring system can be wrong.

If a wrong score reaches an investigator as a
confident verdict at 11pm after a long shift —
they may act on it.

Result:
- Wrong suspect investigated
- Real suspect has days to flee or destroy evidence  
- Child remains in danger
- Innocent person's life affected

### The Solution
Make the system argue against itself before
showing anything to a human.

---

## Agent A — The Prosecutor

### Role
Build the strongest possible case FOR a suspect
being a risk. Cite every piece of evidence.
Be specific. Be factual.

### System Prompt

### Example Output
```json
{
  "agent": "A",
  "role": "Prosecutor", 
  "suspect": "Accused_X",
  "case_risk_score": 84,
  "claims": [
    {
      "claim": "47 contacts with victim in 6 days",
      "evidence": "chat_export.json lines 234-891",
      "strength": "HIGH"
    },
    {
      "claim": "Communication moved to Telegram",
      "evidence": "message timestamps show platform shift",
      "strength": "MEDIUM"
    },
    {
      "claim": "GPS places suspect near victim March 12",
      "evidence": "image_004.jpg EXIF: 10.0261N 76.3083E",
      "strength": "MEDIUM"
    }
  ]
}
```

---

## Agent B — The Defender

### Role
Receive Agent A's full output.
Find holes. Find alternative explanations.
Find data reliability concerns.
Find logical gaps.

Challenge every single claim.
Do not let anything through unchallenged.

### System Prompt

### Example Output
```json
{
  "agent": "B",
  "role": "Defender",
  "suspect": "Accused_X", 
  "adversarial_confidence": 58,
  "challenges": [
    {
      "challenges_claim": "47 contacts with victim",
      "counter": "Victim initiated 39 of 47 contacts",
      "severity": "HIGH — weakens prosecution framing"
    },
    {
      "challenges_claim": "Moved to Telegram",
      "counter": "Platform migration common for privacy",
      "severity": "MEDIUM — needs corroboration"
    },
    {
      "challenges_claim": "GPS near victim March 12",
      "counter": "GPS accuracy 800m — not court admissible",
      "severity": "HIGH — inadmissible without corroboration"
    }
  ]
}
```

---

## The Synthesis Layer

After both agents complete, their outputs merge
into one structured card:

```python
Net Confidence = Case Risk × (1 − Adversarial / 100)

Example:
Case Risk    = 84
Adversarial  = 58
Net          = 84 × 0.42 = 35.3
```

Low net confidence = strong challenge = 
investigator should gather more evidence first.

High net confidence = weak challenge = 
strong lead worth acting on.

---

## What The Investigator Sees

The investigator sees the claim AND the challenge.
They make the call. Not the AI.

---

## The Key Line For Your Pitch

> "We didn't add safety on top of the system.
>  We built the system around safety.
>  CaseMinds is architecturally incapable of 
>  presenting a single false accusation as truth."