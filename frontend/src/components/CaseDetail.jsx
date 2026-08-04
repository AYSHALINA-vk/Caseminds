import { useState } from "react"
import EvidenceUpload from "./EvidenceUpload"
import Annotations from "./Annotations"
import CourtReport from "./CourtReport"

export default function CaseDetail({ caseData, onBack, officer }) {
  const [showUpload, setShowUpload] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [question, setQuestion]     = useState("")
  const [copilotMessages, setCopilotMessages] = useState([
    {
      role: "system",
      content: `Based on chat_export.json message #10, Accused_X contacted the victim at 19:55 saying they were near Ernakulam and coming to meet. Call record C005 shows a 14-minute call from Kochi Central tower at 20:02. [Source: chat_export.json, call_records.csv]`
    }
  ])

  const agentAClaims = [
    { claim: "47 contacts with victim in 6 days", strength: "HIGH" },
    { claim: "Secrecy induction detected",        strength: "HIGH" },
    { claim: "Physical meeting proposed",          strength: "HIGH" },
    { claim: "Platform migration to Telegram",    strength: "MEDIUM" },
  ]

  const agentBChallenges = [
    "Victim initiated 39 of 47 contacts",
    "GPS accuracy 800m — not court admissible",
    "Platform migration common for privacy",
    "Small sample needs corroboration",
  ]

  async function handleAsk() {
    if (!question.trim()) return
    const userQuestion = question
    setQuestion("")

    setCopilotMessages(prev => [...prev, { role: "user", content: userQuestion }])
    setCopilotMessages(prev => [...prev, { role: "system", content: "Analyzing evidence..." }])

    try {
      const res = await fetch("http://localhost:8000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQuestion, case_id: "KL-DEMO-2024-001" })
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
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>

      {/* ── MODALS ── */}
      {showUpload && officer && (
        <EvidenceUpload
          officer={officer}
          caseId={caseData?.id || "KL-DEMO-2024-001"}
          onClose={() => setShowUpload(false)}
        />
      )}
      {showReport && (
        <CourtReport
          caseData={caseData}
          officer={officer}
          onClose={() => setShowReport(false)}
        />
      )}

      {/* ── HEADER ── */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: "40px"
      }}>
        <div>
          <div style={{
            fontSize: "11px", fontWeight: 600,
            letterSpacing: "0.15em", color: "#7c5cfc",
            textTransform: "uppercase", marginBottom: "6px"
          }}>
            {caseData.id}
          </div>
          <h1 style={{
            fontSize: "28px", fontWeight: 700, letterSpacing: "-0.02em"
          }}>
            {caseData.name}
          </h1>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setShowUpload(true)}
            style={{
              background: "#7c5cfc", border: "none", borderRadius: "6px",
              color: "white", padding: "8px 16px", cursor: "pointer",
              fontSize: "13px", fontWeight: 600
            }}
          >
            + Upload evidence
          </button>
          <button onClick={onBack} style={{
            background: "transparent", border: "1px solid #232636",
            borderRadius: "6px", color: "#9aa0b8",
            padding: "8px 16px", cursor: "pointer", fontSize: "13px"
          }}>
            ← Back to Cases
          </button>
        </div>
      </div>

      {/* ── SECTION A: RISK SCORES ── */}
      <SectionLabel label="⚡ Risk Assessment" />
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "16px", marginBottom: "32px"
      }}>
        <div style={{
          background: "#1a0a0a", border: "1px solid #ff6b6b",
          borderRadius: "10px", padding: "24px"
        }}>
          <div style={{
            fontSize: "11px", fontWeight: 600, letterSpacing: "0.15em",
            color: "#ff6b6b", textTransform: "uppercase", marginBottom: "12px"
          }}>
            ⚡ Rescue Urgency
          </div>
          <div style={{
            fontSize: "52px", fontWeight: 700,
            color: "#ff6b6b", lineHeight: 1, marginBottom: "16px"
          }}>
            {caseData.activeRisk}
            <span style={{ fontSize: "20px", color: "#555d7a" }}>/100</span>
          </div>
          <div style={{
            fontSize: "11px", fontWeight: 600, color: "#ff6b6b",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px"
          }}>
            Active Risk Score
          </div>
          {["Last contact 2 hours ago", "Live GPS near victim location", "Contact frequency +400%"].map((s, i) => (
            <div key={i} style={{
              fontSize: "12px", color: "#9aa0b8",
              padding: "4px 0", borderBottom: "1px solid #1a0000"
            }}>→ {s}</div>
          ))}
        </div>

        <div style={{
          background: "#0f0a1a", border: "1px solid #7c5cfc",
          borderRadius: "10px", padding: "24px"
        }}>
          <div style={{
            fontSize: "11px", fontWeight: 600, letterSpacing: "0.15em",
            color: "#7c5cfc", textTransform: "uppercase", marginBottom: "12px"
          }}>
            📁 Prosecution Strength
          </div>
          <div style={{
            fontSize: "52px", fontWeight: 700,
            color: "#7c5cfc", lineHeight: 1, marginBottom: "16px"
          }}>
            {caseData.caseRisk}
            <span style={{ fontSize: "20px", color: "#555d7a" }}>/100</span>
          </div>
          <div style={{
            fontSize: "11px", fontWeight: 600, color: "#7c5cfc",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px"
          }}>
            Case Risk Score
          </div>
          {["47 contacts in 6 days", "80% messages after 10PM", "Secrecy induction detected", "Platform migration confirmed"].map((s, i) => (
            <div key={i} style={{
              fontSize: "12px", color: "#9aa0b8",
              padding: "4px 0", borderBottom: "1px solid #0a0020"
            }}>→ {s}</div>
          ))}
        </div>
      </div>

      {/* ── SECTION B: ADVERSARIAL AGENTS ── */}
      <SectionLabel label="⚖ Adversarial Agent Analysis" />
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "16px", marginBottom: "16px"
      }}>
        <div style={{
          background: "#111318", border: "1px solid #4caf7d",
          borderRadius: "10px", padding: "20px"
        }}>
          <div style={{
            fontSize: "11px", fontWeight: 600, color: "#4caf7d",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px"
          }}>
            Agent A — Prosecutor
          </div>
          {agentAClaims.map((c, i) => (
            <div key={i} style={{
              display: "flex", gap: "8px",
              alignItems: "flex-start", marginBottom: "10px"
            }}>
              <span style={{ color: "#4caf7d", flexShrink: 0 }}>✓</span>
              <div>
                <span style={{ fontSize: "13px", color: "#e8eaf0" }}>{c.claim}</span>
                <span style={{
                  fontSize: "10px",
                  color: c.strength === "HIGH" ? "#ff6b6b" : "#f5a623",
                  marginLeft: "8px", fontWeight: 600
                }}>
                  [{c.strength}]
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: "#111318", border: "1px solid #4a9eff",
          borderRadius: "10px", padding: "20px"
        }}>
          <div style={{
            fontSize: "11px", fontWeight: 600, color: "#4a9eff",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px"
          }}>
            Agent B — Defender
          </div>
          {agentBChallenges.map((c, i) => (
            <div key={i} style={{
              display: "flex", gap: "8px",
              alignItems: "flex-start", marginBottom: "10px"
            }}>
              <span style={{ color: "#4a9eff", flexShrink: 0 }}>✗</span>
              <span style={{ fontSize: "13px", color: "#9aa0b8" }}>{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Net Confidence */}
      <div style={{
        background: "#111318", border: "1px solid #232636",
        borderRadius: "10px", padding: "16px 20px",
        marginBottom: "32px", display: "flex",
        alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <span style={{ fontSize: "13px", color: "#9aa0b8" }}>Net Confidence:</span>
          <span style={{
            fontSize: "20px", fontWeight: 700, color: "#f5a623", marginLeft: "12px"
          }}>
            34.1/100
          </span>
          <span style={{ fontSize: "13px", color: "#9aa0b8", marginLeft: "12px" }}>
            — Gather more evidence before acting
          </span>
        </div>
        <div style={{ fontSize: "11px", color: "#555d7a" }}>
          Final decision: Investigator only
        </div>
      </div>

      {/* ── SECTION C: EVIDENCE COPILOT ── */}
      <SectionLabel label="💬 Evidence Copilot" />
      <div style={{
        background: "#111318", border: "1px solid #232636",
        borderRadius: "10px", padding: "20px", marginBottom: "32px"
      }}>
        <div style={{ fontSize: "12px", color: "#555d7a", marginBottom: "16px" }}>
          Ask questions about this case in Malayalam or English
        </div>
        <div style={{ marginBottom: "16px", maxHeight: "200px", overflowY: "auto" }}>
          <div style={{
            background: "#1a1d26", borderRadius: "6px",
            padding: "10px 14px", marginBottom: "8px",
            fontSize: "13px", color: "#9aa0b8"
          }}>
            <span style={{
              fontSize: "10px", color: "#7c5cfc",
              fontWeight: 600, display: "block", marginBottom: "4px"
            }}>
              INVESTIGATOR
            </span>
            Who did the suspect contact on March 12?
          </div>
          {copilotMessages.map((m, i) => (
            <div key={i} style={{
              background: m.role === "user" ? "#1a1d26" : "#0f0a1a",
              border: m.role === "system" ? "1px solid #2d2250" : "none",
              borderRadius: "6px", padding: "10px 14px",
              marginBottom: "8px", fontSize: "13px",
              color: m.role === "user" ? "#9aa0b8" : "#e8eaf0"
            }}>
              <span style={{
                fontSize: "10px",
                color: m.role === "user" ? "#555d7a" : "#7c5cfc",
                fontWeight: 600, display: "block", marginBottom: "4px"
              }}>
                {m.role === "user" ? "INVESTIGATOR" : "CASEMINDS COPILOT"}
              </span>
              {m.content}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAsk()}
            placeholder="Ask about this case in Malayalam or English..."
            style={{
              flex: 1, background: "#1a1d26",
              border: "1px solid #232636", borderRadius: "6px",
              padding: "10px 14px", color: "#e8eaf0",
              fontSize: "13px", outline: "none"
            }}
          />
          <button onClick={handleAsk} style={{
            background: "#7c5cfc", border: "none", borderRadius: "6px",
            padding: "10px 20px", color: "white",
            fontSize: "13px", fontWeight: 600, cursor: "pointer"
          }}>
            Ask
          </button>
        </div>
      </div>

      {/* ── SECTION D: CHRONOCASE ── */}
      <SectionLabel label="📅 ChronoCase — Case Timeline" />
      <ChronoCase />

      {/* ── SECTION E: LEADRANK ── */}
      <SectionLabel label="👥 LeadRank — Suspect Priority" />
      <div style={{
        background: "#111318", border: "1px solid #232636",
        borderRadius: "10px", padding: "20px", marginBottom: "32px"
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "16px"
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "4px" }}>
              {caseData.suspect}
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["HASH_MATCH", "SECRECY_INDUCTION", "PLATFORM_MIGRATION", "GPS_STRIPPED"].map((tag, i) => (
                <span key={i} style={{
                  fontSize: "10px", background: "#1a1d26",
                  color: "#7c5cfc", padding: "2px 8px",
                  borderRadius: "4px", fontWeight: 600
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            {[
              { val: caseData.activeRisk, label: "Active", color: "#ff6b6b" },
              { val: caseData.caseRisk,   label: "Case",   color: "#7c5cfc" },
              { val: "34.1",              label: "Net",    color: "#f5a623" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: 700, color: s.color }}>
                  {s.val}
                </div>
                <div style={{
                  fontSize: "9px", color: "#555d7a", textTransform: "uppercase"
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowReport(true)}
          style={{
            background: "#7c5cfc", border: "none", borderRadius: "6px",
            padding: "10px 20px", color: "white", fontSize: "13px",
            fontWeight: 600, cursor: "pointer", width: "100%"
          }}
        >
          Generate Court Report
        </button>
      </div>

      {/* ── SECTION F: ANNOTATIONS ── */}
      <SectionLabel label="📝 Case Annotations" />
      <Annotations
        caseId={caseData.id}
        officer={officer}
      />

    </div>
  )
}

function ChronoCase() {
  const [activeView, setActiveView] = useState("all")

  const chatEvents = [
    { id: "msg_1",  time: "Mar 6  14:22", type: "MESSAGE", from: "Accused_X", to: "Victim", content: "Hey, how are you? I'm Arun. Saw your profile.", flag: null, platform: "WhatsApp" },
    { id: "msg_2",  time: "Mar 6  16:45", type: "MESSAGE", from: "Victim", to: "Accused_X", content: "Hi, I'm okay. Do I know you?", flag: null, platform: "WhatsApp" },
    { id: "msg_3",  time: "Mar 6  16:47", type: "MESSAGE", from: "Accused_X", to: "Victim", content: "No but I'd like to get to know you. How old are you?", flag: "MEDIUM", platform: "WhatsApp" },
    { id: "msg_4",  time: "Mar 7  22:15", type: "MESSAGE", from: "Accused_X", to: "Victim", content: "You awake? I was thinking about you.", flag: "ODD_HOUR", platform: "WhatsApp" },
    { id: "msg_5",  time: "Mar 9  22:14", type: "MESSAGE", from: "Accused_X", to: "Victim", content: "Come near Lulu Mall Kochi on March 12 at 8 PM", flag: "HIGH", platform: "WhatsApp" },
    { id: "msg_6",  time: "Mar 9  23:02", type: "MESSAGE", from: "Accused_X", to: "Victim", content: "Let's move to Telegram, more private. @arun_private_tg", flag: "HIGH", platform: "WhatsApp" },
    { id: "msg_7",  time: "Mar 10 08:14", type: "MESSAGE", from: "Victim", to: "Accused_X", content: "Why telegram?", flag: null, platform: "WhatsApp" },
    { id: "msg_8",  time: "Mar 10 23:44", type: "MESSAGE", from: "Accused_X", to: "Victim", content: "Don't tell your parents about us okay? They won't understand.", flag: "HIGH", platform: "WhatsApp" },
    { id: "msg_9",  time: "Mar 11 22:30", type: "MESSAGE", from: "Accused_X", to: "Victim", content: "[DELETED MESSAGE]", flag: "HIGH", platform: "WhatsApp", deleted: true, ghost: "Victim replied: 'yes okay I will come'" },
    { id: "msg_10", time: "Mar 12 19:55", type: "MESSAGE", from: "Accused_X", to: "Victim", content: "I'm near Ernakulam, coming to meet you. Call me 9876543210", flag: "HIGH", platform: "WhatsApp" },
  ]

  const callEvents = [
    { id: "C001", time: "Mar 6  14:18", type: "CALL", duration: 42,  tower: "Ernakulam",    flag: null },
    { id: "C002", time: "Mar 7  22:10", type: "CALL", duration: 187, tower: "Ernakulam",    flag: "ODD_HOUR" },
    { id: "C003", time: "Mar 9  22:55", type: "CALL", duration: 324, tower: "Ernakulam",    flag: "ODD_HOUR" },
    { id: "C004", time: "Mar 10 23:41", type: "CALL", duration: 156, tower: "Ernakulam",    flag: "ODD_HOUR" },
    { id: "C005", time: "Mar 12 20:02", type: "CALL", duration: 891, tower: "Kochi Central", flag: "LOCATION_CHANGE" },
    { id: "C006", time: "Mar 12 20:58", type: "CALL", duration: 44,  tower: "Kochi Central", flag: "UNKNOWN_CONTACT" },
    { id: "C007", time: "Mar 13 02:18", type: "CALL", duration: 12,  tower: "Ernakulam",    flag: "POST_GAP" },
  ]

  const flagColor = f => {
    if (f === "HIGH" || f === "LOCATION_CHANGE") return "#ff6b6b"
    if (f === "MEDIUM" || f === "ODD_HOUR" || f === "POST_GAP" || f === "UNKNOWN_CONTACT") return "#f5a623"
    return "#555d7a"
  }

  const flagBg = f => {
    if (f === "HIGH" || f === "LOCATION_CHANGE") return "#2e1212"
    if (f === "MEDIUM" || f === "ODD_HOUR" || f === "POST_GAP" || f === "UNKNOWN_CONTACT") return "#2e2008"
    return "#1a1d26"
  }

  return (
    <div style={{
      background: "#111318", border: "0.5px solid #232636",
      borderRadius: "10px", overflow: "hidden", marginBottom: "32px"
    }}>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "0.5px solid #232636" }}>
        {[
          { key: "all",      label: "🕐 Full Timeline" },
          { key: "messages", label: `💬 Messages (${chatEvents.length})` },
          { key: "calls",    label: `📞 Calls (${callEvents.length})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveView(tab.key)} style={{
            flex: 1, padding: "12px", background: activeView === tab.key ? "#1a1d26" : "transparent",
            border: "none",
            borderBottom: activeView === tab.key ? "2px solid #7c5cfc" : "2px solid transparent",
            color: activeView === tab.key ? "#e8eaf0" : "#555d7a",
            fontSize: "12px", fontWeight: 600, cursor: "pointer", letterSpacing: "0.06em"
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px" }}>

        {/* Messages view */}
        {activeView === "messages" && (
          <div>
            <div style={{
              background: "#0f0a1a", border: "0.5px solid #2d2250",
              borderRadius: "8px", padding: "10px 14px",
              marginBottom: "16px", fontSize: "12px", color: "#7c5cfc"
            }}>
              💬 {chatEvents.length} messages · Platform: WhatsApp ·
              Victim response time dropped from 2.5hrs → 45sec
            </div>
            {chatEvents.map(msg => (
              <div key={msg.id} style={{
                display: "flex",
                justifyContent: msg.from === "Victim" ? "flex-end" : "flex-start",
                marginBottom: "10px"
              }}>
                <div style={{
                  maxWidth: "75%",
                  background: msg.deleted ? "#1a0a0a" : msg.from === "Victim" ? "#0f0a1a" : "#1a1d26",
                  border: `0.5px solid ${msg.flag ? flagColor(msg.flag) : "#232636"}`,
                  borderRadius: "8px", padding: "10px 14px"
                }}>
                  <div style={{
                    fontSize: "10px", fontWeight: 600,
                    color: msg.from === "Victim" ? "#7c5cfc" : "#4a9eff",
                    marginBottom: "4px", letterSpacing: "0.06em"
                  }}>
                    {msg.from.toUpperCase()}
                  </div>
                  <div style={{
                    fontSize: "13px",
                    color: msg.deleted ? "#ff6b6b" : "#e8eaf0",
                    fontStyle: msg.deleted ? "italic" : "normal",
                    marginBottom: "6px", lineHeight: 1.5
                  }}>
                    {msg.content}
                  </div>
                  {msg.ghost && (
                    <div style={{
                      background: "#2e1212", border: "0.5px solid #ff6b6b",
                      borderRadius: "4px", padding: "6px 10px",
                      fontSize: "11px", color: "#ff6b6b", marginBottom: "6px"
                    }}>
                      👻 GhostTrail: {msg.ghost}
                    </div>
                  )}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <span style={{ fontSize: "10px", color: "#555d7a", fontFamily: "monospace" }}>
                      {msg.time}
                    </span>
                    {msg.flag && (
                      <span style={{
                        fontSize: "9px", fontWeight: 600,
                        padding: "2px 6px", borderRadius: "3px",
                        background: flagBg(msg.flag), color: flagColor(msg.flag)
                      }}>
                        {msg.flag}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calls view */}
        {activeView === "calls" && (
          <div>
            <div style={{
              background: "#0a2018", border: "0.5px solid #4caf7d",
              borderRadius: "8px", padding: "10px 14px",
              marginBottom: "16px", fontSize: "12px", color: "#4caf7d"
            }}>
              📞 Call duration pattern: 42s → 187s → 324s → 156s →
              <span style={{ color: "#ff6b6b", fontWeight: 700 }}> 891s ← spike</span>
              → 12s ← post-gap drop
            </div>
            <div style={{
              background: "#1a1d26", borderRadius: "8px",
              padding: "16px", marginBottom: "16px"
            }}>
              <div style={{
                fontSize: "10px", color: "#555d7a",
                letterSpacing: "0.1em", marginBottom: "12px"
              }}>
                CALL DURATION PATTERN
              </div>
              {callEvents.map(call => (
                <div key={call.id} style={{
                  display: "flex", alignItems: "center",
                  gap: "12px", marginBottom: "8px"
                }}>
                  <span style={{
                    fontSize: "10px", color: "#555d7a",
                    fontFamily: "monospace", minWidth: "80px"
                  }}>
                    {call.time.slice(0, 6)}
                  </span>
                  <div style={{
                    flex: 1, height: "20px",
                    background: "#111318", borderRadius: "4px", overflow: "hidden"
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${(call.duration / 891) * 100}%`,
                      background: call.flag === "LOCATION_CHANGE" ? "#ff6b6b"
                        : call.flag === "ODD_HOUR" ? "#f5a623" : "#7c5cfc",
                      borderRadius: "4px"
                    }} />
                  </div>
                  <span style={{
                    fontSize: "11px", fontWeight: 600,
                    color: call.flag === "LOCATION_CHANGE" ? "#ff6b6b" : "#9aa0b8",
                    minWidth: "40px", textAlign: "right", fontFamily: "monospace"
                  }}>
                    {call.duration}s
                  </span>
                  <span style={{ fontSize: "10px", color: "#555d7a", minWidth: "80px" }}>
                    {call.tower}
                  </span>
                </div>
              ))}
            </div>
            {callEvents.map(call => (
              <div key={call.id} style={{
                background: "#1a1d26",
                border: `0.5px solid ${call.flag ? flagColor(call.flag) : "#232636"}`,
                borderRadius: "8px", padding: "12px 16px",
                marginBottom: "8px", display: "flex",
                justifyContent: "space-between", alignItems: "center"
              }}>
                <div>
                  <div style={{
                    fontSize: "13px", color: "#e8eaf0",
                    fontWeight: 600, marginBottom: "4px"
                  }}>
                    📞 {call.duration}s call
                  </div>
                  <div style={{ fontSize: "11px", color: "#555d7a", fontFamily: "monospace" }}>
                    {call.time} · Tower: {call.tower}
                  </div>
                </div>
                {call.flag && (
                  <span style={{
                    fontSize: "10px", fontWeight: 600,
                    padding: "3px 8px", borderRadius: "4px",
                    background: flagBg(call.flag), color: flagColor(call.flag)
                  }}>
                    {call.flag}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Full timeline view */}
        {activeView === "all" && (
          <div>
            <div style={{
              background: "#111318", borderRadius: "8px",
              padding: "10px 14px", marginBottom: "16px",
              fontSize: "12px", color: "#555d7a", border: "0.5px solid #232636"
            }}>
              All events in chronological order · 💬 messages + 📞 calls + ⚠ gaps
            </div>
            {[...chatEvents, ...callEvents]
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((event, i, arr) => (
              <div key={event.id}>
                {i > 0 &&
                 event.time.startsWith("Mar 13") &&
                 arr[i-1].time.startsWith("Mar 12") && (
                  <div style={{
                    background: "#1a0a0a", border: "1px dashed #ff6b6b",
                    borderRadius: "6px", padding: "10px 16px",
                    margin: "8px 0", display: "flex", alignItems: "center", gap: "10px"
                  }}>
                    <span>⚠</span>
                    <span style={{ fontSize: "13px", color: "#ff6b6b", fontWeight: 600 }}>
                      SUSPICIOUS SILENCE — 6 hours 12 minutes
                    </span>
                  </div>
                )}
                <div style={{
                  display: "flex", gap: "12px",
                  alignItems: "flex-start", marginBottom: "8px"
                }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    flexShrink: 0, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "12px",
                    background: event.type === "MESSAGE" ? "#0f0a1a" : "#0a2018",
                    border: `0.5px solid ${event.flag ? flagColor(event.flag) : "#232636"}`
                  }}>
                    {event.type === "MESSAGE" ? "💬" : "📞"}
                  </div>
                  <div style={{
                    flex: 1, background: "#1a1d26",
                    border: `0.5px solid ${event.flag ? flagColor(event.flag) : "#232636"}`,
                    borderRadius: "8px", padding: "10px 14px"
                  }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "flex-start", marginBottom: "4px"
                    }}>
                      <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#555d7a" }}>
                        {event.time}
                      </span>
                      {event.flag && (
                        <span style={{
                          fontSize: "9px", fontWeight: 600,
                          padding: "2px 6px", borderRadius: "3px",
                          background: flagBg(event.flag), color: flagColor(event.flag)
                        }}>
                          {event.flag}
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: "13px",
                      color: event.deleted ? "#ff6b6b" : "#e8eaf0",
                      fontStyle: event.deleted ? "italic" : "normal"
                    }}>
                      {event.type === "MESSAGE"
                        ? `${event.from}: "${event.content}"`
                        : `📞 ${event.duration}s call · ${event.tower} tower`
                      }
                    </div>
                    {event.ghost && (
                      <div style={{
                        marginTop: "6px", fontSize: "11px",
                        color: "#ff6b6b", fontStyle: "italic"
                      }}>
                        👻 {event.ghost}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionLabel({ label }) {
  return (
    <div style={{
      fontSize: "11px", fontWeight: 600,
      letterSpacing: "0.15em", color: "#555d7a",
      textTransform: "uppercase", marginBottom: "16px",
      paddingBottom: "8px", borderBottom: "1px solid #232636"
    }}>
      {label}
    </div>
  )
}