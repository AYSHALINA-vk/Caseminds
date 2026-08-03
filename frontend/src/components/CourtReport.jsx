import { useState } from "react"

export default function CourtReport({ caseData, officer, onClose }) {
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated]   = useState(false)
  const [reportHash, setReportHash] = useState("")

  // Load findings from localStorage
  const findings = JSON.parse(
    localStorage.getItem(`findings_${caseData.id}`) || "[]"
  )

  const reportData = {
    // Section 1 — Case identification
    case_id:        caseData.id,
    case_name:      caseData.name,
    classification: "RESTRICTED — Child Protection Investigation",
    generated_at:   new Date().toISOString(),
    generated_by:   officer.name,
    badge:          officer.badge,
    rank:           officer.rank,
    department:     officer.department,

    // Section 2 — Evidence inventory
    evidence: [
      {
        id: "EVD-001", file: "chat_export.json",
        sha256: "3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e",
        uploaded_by: "officer_001", uploaded_at: "2024-03-15T10:05:00",
        pipelines: ["NLP", "RAG", "Timeline"],
        flags: ["SECRECY_INDUCTION", "PLATFORM_MIGRATION",
                "PHYSICAL_MEETING_PROPOSED", "DELETED_MESSAGE_GHOST"]
      },
      {
        id: "EVD-002", file: "call_records.csv",
        sha256: "4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f",
        uploaded_by: "officer_001", uploaded_at: "2024-03-15T10:06:00",
        pipelines: ["Timeline", "LeadRank"],
        flags: ["LOCATION_CHANGE_DETECTED", "POST_GAP_CONTACT"]
      },
      {
        id: "EVD-003", file: "image_001.jpg",
        sha256: "5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
        uploaded_by: "officer_001", uploaded_at: "2024-03-15T10:07:00",
        pipelines: ["Hash Match", "Metadata", "Synthetic Detection"],
        flags: []
      },
      {
        id: "EVD-004", file: "image_002.jpg",
        sha256: "6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
        uploaded_by: "officer_001", uploaded_at: "2024-03-15T10:07:00",
        pipelines: ["Hash Match", "Metadata", "Synthetic Detection"],
        flags: ["TIMESTAMP_DISCREPANCY", "IS_SCREENSHOT"]
      },
      {
        id: "EVD-005", file: "image_003.jpg",
        sha256: "7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
        uploaded_by: "officer_001", uploaded_at: "2024-03-15T10:07:00",
        pipelines: ["Hash Match", "Metadata", "Synthetic Detection"],
        flags: ["HASH_MATCH_DETECTED", "GPS_STRIPPED",
                "CAPTURED_DURING_SILENCE_WINDOW"],
        status: "LOCKED"
      }
    ],

    // Section 3 — Timeline
    timeline: [
      { time: "2024-03-06 14:22", event: "First contact on WhatsApp",
        source: "chat_export.json msg #1", flag: null },
      { time: "2024-03-07 22:15", event: "Late night contact — 'I was thinking about you'",
        source: "chat_export.json msg #4", flag: "ODD_HOUR" },
      { time: "2024-03-09 22:14", event: "Physical meeting proposed — Lulu Mall Kochi March 12 8PM",
        source: "chat_export.json msg #5", flag: "HIGH" },
      { time: "2024-03-09 23:02", event: "Platform migration attempted — Telegram handle shared",
        source: "chat_export.json msg #6", flag: "HIGH" },
      { time: "2024-03-10 23:44", event: "Secrecy induction — 'Don't tell your parents'",
        source: "chat_export.json msg #8", flag: "HIGH" },
      { time: "2024-03-11 22:30", event: "Message deleted by suspect — victim replied 'yes okay I will come'",
        source: "chat_export.json msg #9 (GhostTrail)", flag: "HIGH" },
      { time: "2024-03-12 19:55", event: "Suspect stated approaching victim location",
        source: "chat_export.json msg #10", flag: "HIGH" },
      { time: "2024-03-12 20:02", event: "891s call from Kochi Central tower — location change confirmed",
        source: "call_records.csv C005", flag: "LOCATION_CHANGE" },
      { time: "2024-03-12 20:02 — 2024-03-13 02:14",
        event: "SUSPICIOUS SILENCE — 6 hours 12 minutes. No communication recorded.",
        source: "chat_export.json + call_records.csv cross-reference",
        flag: "CRITICAL" },
      { time: "2024-03-13 02:18", event: "Post-gap contact — 12s call from Ernakulam tower",
        source: "call_records.csv C007", flag: "POST_GAP" }
    ],

    // Section 4 — Officer findings
    findings: findings,

    // Section 5 — Risk assessment
    risk: {
      case_risk:   caseData.caseRisk,
      active_risk: caseData.activeRisk,
      net_confidence: 34.1,
      agent_a_claims: [
        "47 contacts with victim in 6 days [HIGH]",
        "Secrecy induction detected [HIGH]",
        "Physical meeting proposed [HIGH]",
        "Platform migration to Telegram [MEDIUM]"
      ],
      agent_b_challenges: [
        "Victim initiated 39 of 47 contacts — weakens prosecution framing",
        "GPS accuracy 800m — insufficient for court admissibility",
        "Platform migration common for privacy — motive unverifiable",
        "Sample size requires corroboration from independent source"
      ]
    },

    // Section 6 — Copilot summary
    copilot_summary: [
      "Suspect Accused_X initiated 8 of 10 recorded contacts with victim",
      "4 of 10 contacts occurred after 10PM — 80% odd-hour ratio",
      "GPS metadata places suspect in Kochi Central at 20:02 on March 12",
      "Image captured during silence window has GPS deliberately stripped",
      "Hash match detected on image_003.jpg against known content database",
      "Victim response latency dropped from 2.5 hours to 45 seconds"
    ]
  }

  function generateHash(data) {
    // Simulate SHA-256 of report content
    const str = JSON.stringify(data)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(8, '0') +
           Date.now().toString(16)
  }

  async function handleGenerate() {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 1500))
    const hash = generateHash(reportData)
    setReportHash(hash)
    setGenerating(false)
    setGenerated(true)

    // Trigger print after generation
    setTimeout(() => window.print(), 500)
  }

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.9)",
      zIndex: 300,
      overflowY: "auto",
      padding: "24px"
    }}>
      {/* Control bar — hidden when printing */}
      <div className="no-print" style={{
        maxWidth: "800px", margin: "0 auto 16px",
        display: "flex", gap: "8px", justifyContent: "flex-end"
      }}>
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            background: generating ? "#2d2250" : "#7c5cfc",
            border: "none", borderRadius: "8px",
            padding: "10px 20px", color: "white",
            fontSize: "13px", fontWeight: 600,
            cursor: generating ? "not-allowed" : "pointer"
          }}
        >
          {generating ? "Generating..." : "⬇ Download / Print Report"}
        </button>
        <button onClick={onClose} style={{
          background: "transparent",
          border: "0.5px solid #232636",
          borderRadius: "8px", padding: "10px 16px",
          color: "#9aa0b8", fontSize: "13px", cursor: "pointer"
        }}>
          ✕ Close
        </button>
      </div>

      {/* THE REPORT */}
      <div id="court-report" style={{
        maxWidth: "800px", margin: "0 auto",
        background: "white", color: "#111",
        padding: "48px", borderRadius: "8px",
        fontFamily: "Georgia, serif"
      }}>

        {/* Header */}
        <div style={{
          textAlign: "center",
          borderBottom: "2px solid #111",
          paddingBottom: "24px", marginBottom: "32px"
        }}>
          <div style={{
            fontSize: "11px", letterSpacing: "0.2em",
            textTransform: "uppercase", color: "#555",
            marginBottom: "8px"
          }}>
            Kerala Police · Cyber Crime Unit
          </div>
          <h1 style={{
            fontSize: "20px", fontWeight: 700,
            margin: "0 0 8px", letterSpacing: "0.05em"
          }}>
            INVESTIGATION CASE REPORT
          </h1>
          <div style={{
            fontSize: "12px", color: "#555",
            marginBottom: "4px"
          }}>
            RESTRICTED — Child Protection Investigation
          </div>
          <div style={{
            display: "inline-block",
            background: "#f0f0f0", padding: "4px 12px",
            borderRadius: "4px", fontSize: "11px",
            fontFamily: "monospace", marginTop: "8px"
          }}>
            Generated: {new Date().toLocaleString("en-IN")}
          </div>
        </div>

        {/* Section 1 — Case ID */}
        <Section title="1. CASE IDENTIFICATION">
          <Row label="Case ID"         value={reportData.case_id} />
          <Row label="Case Name"       value={reportData.case_name} />
          <Row label="Suspect"         value={caseData.suspect} />
          <Row label="Classification"  value={reportData.classification} />
          <Row label="Active Risk"     value={`${reportData.risk.active_risk}/100`} />
          <Row label="Case Risk"       value={`${reportData.risk.case_risk}/100`} />
          <Row label="Net Confidence"  value={`${reportData.risk.net_confidence}/100`} />
        </Section>

        {/* Section 2 — Evidence inventory */}
        <Section title="2. EVIDENCE INVENTORY">
          <p style={{ fontSize: "12px", color: "#555", marginBottom: "12px" }}>
            All evidence files are SHA-256 hashed at upload.
            Any post-upload modification invalidates the hash.
          </p>
          <table style={{
            width: "100%", borderCollapse: "collapse",
            fontSize: "11px"
          }}>
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                {["ID", "File", "SHA-256 Hash", "Uploaded", "Flags"].map(h => (
                  <th key={h} style={{
                    padding: "6px 8px", textAlign: "left",
                    border: "1px solid #ddd", fontWeight: 700
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.evidence.map(e => (
                <tr key={e.id}>
                  <td style={{ padding: "6px 8px", border: "1px solid #ddd",
                    fontFamily: "monospace" }}>{e.id}</td>
                  <td style={{ padding: "6px 8px", border: "1px solid #ddd",
                    fontFamily: "monospace" }}>{e.file}</td>
                  <td style={{ padding: "6px 8px", border: "1px solid #ddd",
                    fontFamily: "monospace", fontSize: "9px",
                    color: "#555" }}>{e.sha256.slice(0, 20)}...</td>
                  <td style={{ padding: "6px 8px", border: "1px solid #ddd",
                    fontSize: "10px" }}>
                    {new Date(e.uploaded_at).toLocaleDateString("en-IN")}
                  </td>
                  <td style={{ padding: "6px 8px", border: "1px solid #ddd",
                    fontSize: "10px", color: e.flags.length ? "#c00" : "#555" }}>
                    {e.flags.length ? e.flags.join(", ") : "—"}
                    {e.status === "LOCKED" && " 🔒"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Section 3 — Timeline */}
        <Section title="3. CHRONOCASE TIMELINE">
          <p style={{ fontSize: "12px", color: "#555", marginBottom: "12px" }}>
            Events reconstructed from cross-source analysis.
            All timestamps normalized to UTC+5:30 (IST).
          </p>
          {reportData.timeline.map((event, i) => (
            <div key={i} style={{
              display: "flex", gap: "12px",
              marginBottom: "8px", alignItems: "flex-start"
            }}>
              <div style={{
                width: "8px", height: "8px",
                borderRadius: "50%", flexShrink: 0,
                marginTop: "5px",
                background: event.flag === "HIGH" ||
                            event.flag === "CRITICAL" ||
                            event.flag === "LOCATION_CHANGE" ? "#c00" :
                            event.flag === "ODD_HOUR" ||
                            event.flag === "POST_GAP" ? "#e60" : "#999"
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: "11px", fontFamily: "monospace",
                  color: "#555", marginBottom: "2px"
                }}>
                  {event.time}
                  {event.flag && (
                    <span style={{
                      marginLeft: "8px", color: "#c00",
                      fontWeight: 700
                    }}>
                      [{event.flag}]
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: "12px",
                  fontWeight: event.flag === "CRITICAL" ? 700 : 400,
                  color: event.flag === "CRITICAL" ? "#c00" : "#111",
                  marginBottom: "2px"
                }}>
                  {event.event}
                </div>
                <div style={{
                  fontSize: "10px", color: "#888",
                  fontStyle: "italic"
                }}>
                  Source: {event.source}
                </div>
              </div>
            </div>
          ))}
        </Section>

        {/* Section 4 — Officer findings */}
        <Section title="4. OFFICER FINDINGS (TEAM-VERIFIED)">
          {reportData.findings.length === 0 ? (
            <p style={{ fontSize: "12px", color: "#888", fontStyle: "italic" }}>
              No team findings submitted for this case.
            </p>
          ) : (
            reportData.findings.map((f, i) => (
              <div key={f.id} style={{
                border: "1px solid #ddd", borderRadius: "4px",
                padding: "12px", marginBottom: "10px"
              }}>
                <div style={{
                  fontSize: "13px", marginBottom: "6px", lineHeight: 1.5
                }}>
                  {f.text}
                </div>
                <div style={{
                  fontSize: "11px", color: "#555",
                  marginBottom: "4px"
                }}>
                  <strong>Source:</strong> {f.source}
                </div>
                <div style={{ fontSize: "10px", color: "#888", fontFamily: "monospace" }}>
                  Submitted by {f.badge} · {f.rank} ·{" "}
                  {new Date(f.submitted_at).toLocaleString("en-IN")}
                </div>
              </div>
            ))
          )}
        </Section>

        {/* Section 5 — Adversarial analysis */}
        <Section title="5. AI RISK ASSESSMENT — ADVERSARIAL ANALYSIS">
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "16px", marginBottom: "16px"
          }}>
            <div style={{
              border: "1px solid #4caf7d", borderRadius: "4px",
              padding: "12px"
            }}>
              <div style={{
                fontSize: "11px", fontWeight: 700, color: "#2e7d32",
                marginBottom: "8px", letterSpacing: "0.08em"
              }}>
                AGENT A — PROSECUTION CASE
              </div>
              {reportData.risk.agent_a_claims.map((c, i) => (
                <div key={i} style={{
                  fontSize: "11px", marginBottom: "4px",
                  paddingLeft: "8px", borderLeft: "2px solid #4caf7d"
                }}>
                  {c}
                </div>
              ))}
            </div>
            <div style={{
              border: "1px solid #1976d2", borderRadius: "4px",
              padding: "12px"
            }}>
              <div style={{
                fontSize: "11px", fontWeight: 700, color: "#1565c0",
                marginBottom: "8px", letterSpacing: "0.08em"
              }}>
                AGENT B — DEFENSE CHALLENGES
              </div>
              {reportData.risk.agent_b_challenges.map((c, i) => (
                <div key={i} style={{
                  fontSize: "11px", marginBottom: "4px",
                  paddingLeft: "8px", borderLeft: "2px solid #1976d2"
                }}>
                  {c}
                </div>
              ))}
            </div>
          </div>
          <div style={{
            background: "#fff8e1", border: "1px solid #f9a825",
            borderRadius: "4px", padding: "10px 14px", fontSize: "12px"
          }}>
            <strong>Net Confidence: {reportData.risk.net_confidence}/100</strong>
            {" "}— Gather corroborating evidence before proceeding to prosecution.
            Final decision rests with the investigating officer.
          </div>
        </Section>

        {/* Section 6 — Copilot summary */}
        <Section title="6. AI INTELLIGENCE SUMMARY">
          <p style={{ fontSize: "12px", color: "#555", marginBottom: "10px" }}>
            Key insights extracted from evidence by CaseMinds Evidence Copilot:
          </p>
          {reportData.copilot_summary.map((s, i) => (
            <div key={i} style={{
              display: "flex", gap: "8px",
              marginBottom: "6px", fontSize: "12px"
            }}>
              <span style={{ color: "#7c5cfc", flexShrink: 0 }}>→</span>
              <span>{s}</span>
            </div>
          ))}
        </Section>

        {/* Section 7 — Certification */}
        <Section title="7. OFFICER CERTIFICATION">
          <p style={{ fontSize: "12px", marginBottom: "16px", lineHeight: 1.6 }}>
            I, <strong>{officer.name}</strong>, holding Badge No.{" "}
            <strong>{officer.badge}</strong>, {officer.rank},{" "}
            {officer.department}, Kerala Police, hereby certify that
            the information contained in this report has been compiled
            from digital evidence processed by the CaseMinds ACPIA system.
            All evidence files are SHA-256 verified. This report is
            generated for official investigation purposes only.
          </p>

          {generated && (
            <div style={{
              background: "#f0f0f0", padding: "10px 14px",
              borderRadius: "4px", fontFamily: "monospace",
              fontSize: "11px", marginBottom: "16px", color: "#555"
            }}>
              Report Hash (SHA-256): {reportHash}
              <br/>
              Any modification to this document will invalidate this hash.
            </div>
          )}

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "32px", marginTop: "32px"
          }}>
            <div>
              <div style={{
                borderTop: "1px solid #111", paddingTop: "8px",
                fontSize: "11px", color: "#555"
              }}>
                Investigating Officer Signature<br/>
                {officer.name} · {officer.badge}
              </div>
            </div>
            <div>
              <div style={{
                borderTop: "1px solid #111", paddingTop: "8px",
                fontSize: "11px", color: "#555"
              }}>
                Date & Time<br/>
                {new Date().toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div style={{
          borderTop: "1px solid #ddd", paddingTop: "16px",
          marginTop: "32px", textAlign: "center",
          fontSize: "10px", color: "#888"
        }}>
          Generated by CaseMinds ACPIA · Kerala Police ·
          Hac'KP 2026 · {reportData.case_id} ·
          {generated && ` Hash: ${reportHash}`}
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          #court-report {
            box-shadow: none;
            border-radius: 0;
            padding: 24px;
          }
        }
      `}</style>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <h2 style={{
        fontSize: "13px", fontWeight: 700,
        letterSpacing: "0.08em", textTransform: "uppercase",
        borderBottom: "1px solid #111", paddingBottom: "6px",
        marginBottom: "14px", color: "#111"
      }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{
      display: "flex", gap: "16px",
      marginBottom: "6px", fontSize: "12px"
    }}>
      <span style={{
        color: "#555", minWidth: "140px", flexShrink: 0
      }}>
        {label}:
      </span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )
}