import { useState } from "react"

export default function AccessRequest({ officer, cases, onApproved }) {
  const [reason, setReason]       = useState("")
  const [accessLevel, setAccessLevel] = useState("READ")
  const [caseId, setCaseId]       = useState("KL-DEMO-2024-001")
  const [submitted, setSubmitted] = useState(false)
  const [requestId] = useState(
    `REQ-${Date.now().toString().slice(-6)}`
  )

  function handleSubmit() {
    if (!reason.trim()) return

    const request = {
      id:          requestId,
      officer_id:  officer.id,
      officer_name: officer.name,
      badge:       officer.badge,
      case_id:     caseId,
      reason:      reason,
      access_level: accessLevel,
      timestamp:   new Date().toISOString(),
      status:      "PENDING"
    }

    // Store in localStorage for demo
    // In production: POST to /api/access-requests
    const existing = JSON.parse(
      localStorage.getItem("access_requests") || "[]"
    )
    existing.push(request)
    localStorage.setItem("access_requests", JSON.stringify(existing))

    console.log("ACCESS REQUEST SUBMITTED:", request)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: "calc(100vh - 50px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px"
      }}>
        <div style={{
          maxWidth: "480px",
          width: "100%",
          textAlign: "center"
        }}>
          <div style={{
            fontSize: "48px",
            marginBottom: "16px"
          }}>⏳</div>
          <h2 style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#e8eaf0",
            marginBottom: "8px"
          }}>
            Access Request Submitted
          </h2>
          <p style={{
            color: "#9aa0b8",
            fontSize: "14px",
            marginBottom: "24px",
            lineHeight: 1.6
          }}>
            Your request <span style={{
              fontFamily: "monospace",
              color: "#7c5cfc"
            }}>{requestId}</span> has been sent to the
            Senior Inspector for approval.
          </p>

          <div style={{
            background: "#111318",
            border: "0.5px solid #232636",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "left",
            marginBottom: "24px"
          }}>
            <div style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "#555d7a",
              textTransform: "uppercase",
              marginBottom: "12px"
            }}>
              Request summary
            </div>
            <div style={{
              fontSize: "13px",
              color: "#9aa0b8",
              lineHeight: 2
            }}>
              <div>Case: <span style={{ color: "#e8eaf0" }}>{caseId}</span></div>
              <div>Access: <span style={{
                color: accessLevel === "LOCKED" ? "#ff6b6b" :
                       accessLevel === "WRITE" ? "#f5a623" : "#4caf7d"
              }}>{accessLevel}</span></div>
              <div>Reason: <span style={{ color: "#e8eaf0" }}>{reason}</span></div>
              <div>Status: <span style={{ color: "#f5a623" }}>PENDING APPROVAL</span></div>
            </div>
          </div>

          <div style={{
            background: "#0f0a1a",
            border: "0.5px solid #2d2250",
            borderRadius: "8px",
            padding: "14px",
            fontSize: "12px",
            color: "#7c5cfc"
          }}>
            💡 For this demo: login as Senior (KP-1847 / senior123)
            to approve this request, then login as Junior again to
            access the case.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 50px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }}>
      <div style={{ maxWidth: "520px", width: "100%" }}>

        <div style={{ marginBottom: "28px" }}>
          <div style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            color: "#f5a623",
            textTransform: "uppercase",
            marginBottom: "8px"
          }}>
            Access required
          </div>
          <h2 style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#e8eaf0",
            marginBottom: "8px"
          }}>
            Request case access
          </h2>
          <p style={{
            color: "#9aa0b8",
            fontSize: "13px",
            lineHeight: 1.6
          }}>
            As a Junior Officer you need Senior Inspector approval
            before accessing investigation cases. Submit your
            request below.
          </p>
        </div>

        <div style={{
          background: "#111318",
          border: "0.5px solid #232636",
          borderRadius: "12px",
          padding: "28px"
        }}>

          {/* Case selection */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#9aa0b8",
              marginBottom: "6px",
              letterSpacing: "0.05em"
            }}>
              Case
            </label>
            <select
              value={caseId}
              onChange={e => setCaseId(e.target.value)}
              style={{
                width: "100%",
                background: "#1a1d26",
                border: "0.5px solid #232636",
                borderRadius: "8px",
                padding: "12px 14px",
                color: "#e8eaf0",
                fontSize: "13px",
                outline: "none"
              }}
            >
              <option value="KL-DEMO-2024-001">
                KL-DEMO-2024-001 — Operation Shield
              </option>
              <option value="KL-DEMO-2024-002">
                KL-DEMO-2024-002 — Operation Anchor
              </option>
            </select>
          </div>

          {/* Access level */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#9aa0b8",
              marginBottom: "10px",
              letterSpacing: "0.05em"
            }}>
              Access level required
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                {
                  level: "READ",
                  label: "Read only",
                  desc: "View timeline and evidence",
                  color: "#4caf7d",
                  bg: "#0a2018"
                },
                {
                  level: "WRITE",
                  label: "Read + Upload",
                  desc: "Add new evidence",
                  color: "#f5a623",
                  bg: "#2e2008"
                },
                {
                  level: "LOCKED",
                  label: "Full access",
                  desc: "Including locked files",
                  color: "#ff6b6b",
                  bg: "#2e1212"
                }
              ].map(opt => (
                <div
                  key={opt.level}
                  onClick={() => setAccessLevel(opt.level)}
                  style={{
                    flex: 1,
                    background: accessLevel === opt.level
                      ? opt.bg : "#1a1d26",
                    border: `0.5px solid ${accessLevel === opt.level
                      ? opt.color : "#232636"}`,
                    borderRadius: "8px",
                    padding: "12px",
                    cursor: "pointer",
                    textAlign: "center"
                  }}
                >
                  <div style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: accessLevel === opt.level
                      ? opt.color : "#9aa0b8",
                    marginBottom: "4px"
                  }}>
                    {opt.label}
                  </div>
                  <div style={{
                    fontSize: "10px",
                    color: "#555d7a"
                  }}>
                    {opt.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#9aa0b8",
              marginBottom: "6px",
              letterSpacing: "0.05em"
            }}>
              Reason for access
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Explain why you need access to this case..."
              rows={3}
              style={{
                width: "100%",
                background: "#1a1d26",
                border: "0.5px solid #232636",
                borderRadius: "8px",
                padding: "12px 14px",
                color: "#e8eaf0",
                fontSize: "13px",
                outline: "none",
                resize: "vertical",
                fontFamily: "Inter, sans-serif"
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!reason.trim()}
            style={{
              width: "100%",
              background: reason.trim() ? "#7c5cfc" : "#1a1d26",
              border: "none",
              borderRadius: "8px",
              padding: "14px",
              color: reason.trim() ? "white" : "#555d7a",
              fontSize: "14px",
              fontWeight: 600,
              cursor: reason.trim() ? "pointer" : "not-allowed"
            }}
          >
            Submit access request
          </button>
        </div>

        <p style={{
          textAlign: "center",
          color: "#555d7a",
          fontSize: "11px",
          marginTop: "16px"
        }}>
          Request ID: <span style={{
            fontFamily: "monospace",
            color: "#7c5cfc"
          }}>{requestId}</span> · All requests are logged
        </p>
      </div>
    </div>
  )
}