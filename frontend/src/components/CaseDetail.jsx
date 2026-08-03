import { useState } from "react"
import { useState } from "react"
import EvidenceUpload from "./EvidenceUpload"

export default function CaseDetail({ caseData, onBack }) {
  const [copilotMessages, setCopilotMessages] = useState([
    {
      role: "system",
      content: `Based on chat_export.json message #10, Accused_X contacted the victim at 19:55 saying they were near Ernakulam and coming to meet. Call record C005 shows a 14-minute call from Kochi Central tower at 20:02. [Source: chat_export.json, call_records.csv]`
    }
  ])
  const [question, setQuestion] = useState("")
  const [showUpload, setShowUpload] = useState(false)

  const timelineEvents = [
    { date: "Mar 6  14:22", event: "First contact on WhatsApp", flag: null },
    { date: "Mar 7  22:15", event: "Late night contact", flag: "ODD_HOUR" },
    { date: "Mar 9  22:14", event: "Physical meeting proposed — Lulu Mall Kochi", flag: "HIGH" },
    { date: "Mar 10 23:44", event: "Secrecy induction: don't tell your parents", flag: "HIGH" },
    { date: "Mar 11 23:01", event: "Platform migration attempt to Telegram", flag: "MEDIUM" },
    { date: "Mar 12 20:02", event: "Call from Kochi Central tower — LOCATION CHANGE", flag: "HIGH" },
    { date: "GAP", event: "SUSPICIOUS SILENCE — 6 hours 12 minutes", flag: "GAP" },
    { date: "Mar 13 02:18", event: "Post-gap contact from Ernakulam tower", flag: "MEDIUM" },
  ]

  const agentAClaims = [
    { claim: "47 contacts with victim in 6 days", strength: "HIGH" },
    { claim: "Secrecy induction detected", strength: "HIGH" },
    { claim: "Physical meeting proposed", strength: "HIGH" },
    { claim: "Platform migration to Telegram", strength: "MEDIUM" },
  ]

  const agentBChallenges = [
    "Victim initiated 39 of 47 contacts",
    "GPS accuracy 800m — not court admissible",
    "Platform migration common for privacy",
    "Small sample needs corroboration",
  ]

  {/* Upload modal */}
{showUpload && (
  <EvidenceUpload
    officer={officer}
    caseId={caseData.id}
    onClose={() => setShowUpload(false)}
  />
)}

async function handleAsk() {
    if (!question.trim()) return
    const userQuestion = question
    setQuestion("")

    setCopilotMessages(prev => [
      ...prev,
      { role: "user", content: userQuestion }
    ])

    const loadDiv = { role: "system", content: "Analyzing evidence..." }
    setCopilotMessages(prev => [...prev, loadDiv])

    try {
      const res = await fetch("http://localhost:8000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userQuestion,
          case_id: "KL-DEMO-2024-001"
        })
      })
      const data = await res.json()
      setCopilotMessages(prev => [
        ...prev.slice(0, -1),
        { role: "system", content: data.answer }
      ])
    } catch(e) {
      setCopilotMessages(prev => [
        ...prev.slice(0, -1),
        { role: "system", content: "Backend connection error. Make sure api_server is running on port 8000." }
      ])
    }
  }

  return (
    <div style={{
      maxWidth: "900px",
      margin: "0 auto",
      padding: "40px 24px"
    }}>

      {/* ── HEADER ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "40px"
      }}>
        <div>
          <div style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            color: "#7c5cfc",
            textTransform: "uppercase",
            marginBottom: "6px"
          }}>
            {caseData.id}
          </div>
          <h1 style={{
            fontSize: "28px",
            fontWeight: 700,
            letterSpacing: "-0.02em"
          }}>
            {caseData.name}
          </h1>
        </div>
        <button onClick={onBack} style={{
          background: "transparent",
          border: "1px solid #232636",
          borderRadius: "6px",
          color: "#9aa0b8",
          padding: "8px 16px",
          cursor: "pointer",
          fontSize: "13px"
        }}>
          ← Back to Cases
        </button>
      </div>
      <button
  onClick={() => setShowUpload(true)}
  style={{
    background: "#7c5cfc",
    border: "none",
    borderRadius: "6px",
    color: "white",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    marginRight: "8px"
  }}
>
  + Upload evidence
</button>

      {/* ── SECTION A: DUAL RISK SCORES ── */}
      <SectionLabel label="⚡ Risk Assessment" />
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
        marginBottom: "32px"
      }}>
        {/* Active Risk */}
        <div style={{
          background: "#1a0a0a",
          border: "1px solid #ff6b6b",
          borderRadius: "10px",
          padding: "24px"
        }}>
          <div style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            color: "#ff6b6b",
            textTransform: "uppercase",
            marginBottom: "12px"
          }}>
            ⚡ Rescue Urgency
          </div>
          <div style={{
            fontSize: "52px",
            fontWeight: 700,
            color: "#ff6b6b",
            lineHeight: 1,
            marginBottom: "16px"
          }}>
            {caseData.activeRisk}
            <span style={{
              fontSize: "20px",
              color: "#555d7a"
            }}>/100</span>
          </div>
          <div style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#ff6b6b",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "12px"
          }}>
            Active Risk Score
          </div>
          {[
            "Last contact 2 hours ago",
            "Live GPS near victim location",
            "Contact frequency +400%"
          ].map((s, i) => (
            <div key={i} style={{
              fontSize: "12px",
              color: "#9aa0b8",
              padding: "4px 0",
              borderBottom: "1px solid #1a0000"
            }}>
              → {s}
            </div>
          ))}
        </div>

        {/* Case Risk */}
        <div style={{
          background: "#0f0a1a",
          border: "1px solid #7c5cfc",
          borderRadius: "10px",
          padding: "24px"
        }}>
          <div style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            color: "#7c5cfc",
            textTransform: "uppercase",
            marginBottom: "12px"
          }}>
            📁 Prosecution Strength
          </div>
          <div style={{
            fontSize: "52px",
            fontWeight: 700,
            color: "#7c5cfc",
            lineHeight: 1,
            marginBottom: "16px"
          }}>
            {caseData.caseRisk}
            <span style={{
              fontSize: "20px",
              color: "#555d7a"
            }}>/100</span>
          </div>
          <div style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#7c5cfc",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "12px"
          }}>
            Case Risk Score
          </div>
          {[
            "47 contacts in 6 days",
            "80% messages after 10PM",
            "Secrecy induction detected",
            "Platform migration confirmed"
          ].map((s, i) => (
            <div key={i} style={{
              fontSize: "12px",
              color: "#9aa0b8",
              padding: "4px 0",
              borderBottom: "1px solid #0a0020"
            }}>
              → {s}
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION B: ADVERSARIAL AGENTS ── */}
      <SectionLabel label="⚖ Adversarial Agent Analysis" />
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
        marginBottom: "16px"
      }}>
        {/* Agent A */}
        <div style={{
          background: "#111318",
          border: "1px solid #4caf7d",
          borderRadius: "10px",
          padding: "20px"
        }}>
          <div style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#4caf7d",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "16px"
          }}>
            Agent A — Prosecutor
          </div>
          {agentAClaims.map((c, i) => (
            <div key={i} style={{
              display: "flex",
              gap: "8px",
              alignItems: "flex-start",
              marginBottom: "10px"
            }}>
              <span style={{ color: "#4caf7d", flexShrink: 0 }}>✓</span>
              <div>
                <span style={{
                  fontSize: "13px",
                  color: "#e8eaf0"
                }}>
                  {c.claim}
                </span>
                <span style={{
                  fontSize: "10px",
                  color: c.strength === "HIGH" ? "#ff6b6b" : "#f5a623",
                  marginLeft: "8px",
                  fontWeight: 600
                }}>
                  [{c.strength}]
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Agent B */}
        <div style={{
          background: "#111318",
          border: "1px solid #4a9eff",
          borderRadius: "10px",
          padding: "20px"
        }}>
          <div style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#4a9eff",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "16px"
          }}>
            Agent B — Defender
          </div>
          {agentBChallenges.map((c, i) => (
            <div key={i} style={{
              display: "flex",
              gap: "8px",
              alignItems: "flex-start",
              marginBottom: "10px"
            }}>
              <span style={{ color: "#4a9eff", flexShrink: 0 }}>✗</span>
              <span style={{
                fontSize: "13px",
                color: "#9aa0b8"
              }}>
                {c}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Net Confidence */}
      <div style={{
        background: "#111318",
        border: "1px solid #232636",
        borderRadius: "10px",
        padding: "16px 20px",
        marginBottom: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div>
          <span style={{
            fontSize: "13px",
            color: "#9aa0b8"
          }}>
            Net Confidence:
          </span>
          <span style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#f5a623",
            marginLeft: "12px"
          }}>
            34.1/100
          </span>
          <span style={{
            fontSize: "13px",
            color: "#9aa0b8",
            marginLeft: "12px"
          }}>
            — Gather more evidence before acting
          </span>
        </div>
        <div style={{
          fontSize: "11px",
          color: "#555d7a"
        }}>
          Final decision: Investigator only
        </div>
      </div>

      {/* ── SECTION C: EVIDENCE COPILOT ── */}
      <SectionLabel label="💬 Evidence Copilot" />
      <div style={{
        background: "#111318",
        border: "1px solid #232636",
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "32px"
      }}>
        <div style={{
          fontSize: "12px",
          color: "#555d7a",
          marginBottom: "16px"
        }}>
          Ask questions about this case in Malayalam or English
        </div>

        {/* Messages */}
        <div style={{
          marginBottom: "16px",
          maxHeight: "200px",
          overflowY: "auto"
        }}>
          <div style={{
            background: "#1a1d26",
            borderRadius: "6px",
            padding: "10px 14px",
            marginBottom: "8px",
            fontSize: "13px",
            color: "#9aa0b8"
          }}>
            <span style={{
              fontSize: "10px",
              color: "#7c5cfc",
              fontWeight: 600,
              display: "block",
              marginBottom: "4px"
            }}>
              INVESTIGATOR
            </span>
            Who did the suspect contact on March 12?
          </div>
          {copilotMessages.map((m, i) => (
            <div key={i} style={{
              background: m.role === "user" ? "#1a1d26" : "#0f0a1a",
              border: m.role === "system"
                ? "1px solid #2d2250" : "none",
              borderRadius: "6px",
              padding: "10px 14px",
              marginBottom: "8px",
              fontSize: "13px",
              color: m.role === "user" ? "#9aa0b8" : "#e8eaf0"
            }}>
              <span style={{
                fontSize: "10px",
                color: m.role === "user" ? "#555d7a" : "#7c5cfc",
                fontWeight: 600,
                display: "block",
                marginBottom: "4px"
              }}>
                {m.role === "user" ? "INVESTIGATOR" : "CASEMINDS COPILOT"}
              </span>
              {m.content}
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAsk()}
            placeholder="Ask about this case in Malayalam or English..."
            style={{
              flex: 1,
              background: "#1a1d26",
              border: "1px solid #232636",
              borderRadius: "6px",
              padding: "10px 14px",
              color: "#e8eaf0",
              fontSize: "13px",
              outline: "none"
            }}
          />
          <button
            onClick={handleAsk}
            style={{
              background: "#7c5cfc",
              border: "none",
              borderRadius: "6px",
              padding: "10px 20px",
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Ask
          </button>
        </div>
      </div>

      {/* ── SECTION D: CHRONOCASE TIMELINE ── */}
      <SectionLabel label="📅 ChronoCase — Case Timeline" />
      <div style={{
        background: "#111318",
        border: "1px solid #232636",
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "32px",
        position: "relative"
      }}>
        <div style={{
          position: "absolute",
          left: "44px",
          top: "20px",
          bottom: "20px",
          width: "1px",
          background: "#232636"
        }} />

        {timelineEvents.map((event, i) => (
          <div key={i} style={{
            display: "flex",
            gap: "16px",
            alignItems: "flex-start",
            marginBottom: "16px",
            position: "relative"
          }}>
            {/* Dot */}
            {event.flag !== "GAP" && (
              <div style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: event.flag === "HIGH" ? "#ff6b6b"
                  : event.flag === "MEDIUM" ? "#f5a623"
                  : event.flag === "ODD_HOUR" ? "#f5a623"
                  : "#232636",
                border: "2px solid",
                borderColor: event.flag === "HIGH" ? "#ff6b6b"
                  : event.flag === "MEDIUM" ? "#f5a623"
                  : "#232636",
                flexShrink: 0,
                marginTop: "4px",
                marginLeft: "29px",
                zIndex: 1
              }} />
            )}

            {/* GAP box */}
            {event.flag === "GAP" && (
              <div style={{
                width: "100%",
                background: "#1a0a0a",
                border: "1px dashed #ff6b6b",
                borderRadius: "6px",
                padding: "10px 16px",
                marginLeft: "44px",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <span style={{ fontSize: "16px" }}>⚠</span>
                <span style={{
                  fontSize: "13px",
                  color: "#ff6b6b",
                  fontWeight: 600
                }}>
                  {event.event}
                </span>
              </div>
            )}

            {/* Normal event */}
            {event.flag !== "GAP" && (
              <div>
                <span style={{
                  fontFamily: "monospace",
                  fontSize: "12px",
                  color: "#555d7a",
                  marginRight: "12px"
                }}>
                  {event.date}
                </span>
                <span style={{
                  fontSize: "13px",
                  color: event.flag === "HIGH" ? "#ff6b6b"
                    : event.flag === "MEDIUM" ? "#f5a623"
                    : "#9aa0b8"
                }}>
                  {event.event}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── SECTION E: LEADRANK ── */}
      <SectionLabel label="👥 LeadRank — Suspect Priority" />
      <div style={{
        background: "#111318",
        border: "1px solid #232636",
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "32px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px"
        }}>
          <div>
            <div style={{
              fontWeight: 600,
              fontSize: "15px",
              marginBottom: "4px"
            }}>
              {caseData.suspect}
            </div>
            <div style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap"
            }}>
              {[
                "HASH_MATCH",
                "SECRECY_INDUCTION",
                "PLATFORM_MIGRATION",
                "GPS_STRIPPED"
              ].map((tag, i) => (
                <span key={i} style={{
                  fontSize: "10px",
                  background: "#1a1d26",
                  color: "#7c5cfc",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontWeight: 600
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div style={{
            display: "flex",
            gap: "16px",
            alignItems: "center"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#ff6b6b"
              }}>
                {caseData.activeRisk}
              </div>
              <div style={{
                fontSize: "9px",
                color: "#555d7a",
                textTransform: "uppercase"
              }}>
                Active
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#7c5cfc"
              }}>
                {caseData.caseRisk}
              </div>
              <div style={{
                fontSize: "9px",
                color: "#555d7a",
                textTransform: "uppercase"
              }}>
                Case
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#f5a623"
              }}>
                34.1
              </div>
              <div style={{
                fontSize: "9px",
                color: "#555d7a",
                textTransform: "uppercase"
              }}>
                Net
              </div>
            </div>
          </div>
        </div>
        <button style={{
          background: "#7c5cfc",
          border: "none",
          borderRadius: "6px",
          padding: "10px 20px",
          color: "white",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          width: "100%"
        }}>
          Generate Court Report
        </button>
      </div>

    </div>
  )
}

function SectionLabel({ label }) {
  return (
    <div style={{
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.15em",
      color: "#555d7a",
      textTransform: "uppercase",
      marginBottom: "16px",
      paddingBottom: "8px",
      borderBottom: "1px solid #232636"
    }}>
      {label}
    </div>
  )
}