import { useState, useEffect } from "react"

export default function ApprovalQueue({ officer, onDone }) {
  const [requests, setRequests] = useState([])

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("access_requests") || "[]"
    )
    setRequests(stored.filter(r => r.status === "PENDING"))
  }, [])

  function handleDecision(requestId, decision) {
    const all = JSON.parse(
      localStorage.getItem("access_requests") || "[]"
    )
    const updated = all.map(r =>
      r.id === requestId ? {
        ...r,
        status:       decision,
        decided_by:   officer.badge,
        decided_at:   new Date().toISOString()
      } : r
    )
    localStorage.setItem("access_requests", JSON.stringify(updated))
    setRequests(prev => prev.filter(r => r.id !== requestId))
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 50px)",
      padding: "40px 24px",
      maxWidth: "700px",
      margin: "0 auto"
    }}>
      <div style={{ marginBottom: "28px" }}>
        <div style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.15em",
          color: "#555d7a",
          textTransform: "uppercase",
          marginBottom: "8px"
        }}>
          Senior Inspector dashboard
        </div>
        <h2 style={{
          fontSize: "24px",
          fontWeight: 700,
          color: "#e8eaf0"
        }}>
          Pending access requests
        </h2>
      </div>

      {requests.length === 0 ? (
        <div style={{
          background: "#111318",
          border: "0.5px solid #232636",
          borderRadius: "10px",
          padding: "40px",
          textAlign: "center"
        }}>
          <div style={{
            fontSize: "32px",
            marginBottom: "12px"
          }}>✅</div>
          <p style={{ color: "#9aa0b8", fontSize: "14px" }}>
            No pending access requests
          </p>
          <button
            onClick={onDone}
            style={{
              marginTop: "20px",
              background: "#7c5cfc",
              border: "none",
              borderRadius: "8px",
              padding: "10px 24px",
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Go to cases
          </button>
        </div>
      ) : (
        <>
          {requests.map(req => (
            <div key={req.id} style={{
              background: "#111318",
              border: "0.5px solid #232636",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "12px"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px"
              }}>
                <div>
                  <div style={{
                    fontWeight: 600,
                    fontSize: "15px",
                    color: "#e8eaf0",
                    marginBottom: "4px"
                  }}>
                    {req.officer_name}
                    <span style={{
                      fontFamily: "monospace",
                      fontSize: "11px",
                      color: "#555d7a",
                      fontWeight: 400,
                      marginLeft: "8px"
                    }}>
                      {req.badge}
                    </span>
                  </div>
                  <div style={{
                    fontSize: "12px",
                    color: "#555d7a",
                    fontFamily: "monospace"
                  }}>
                    {req.id} · {new Date(req.timestamp)
                      .toLocaleTimeString("en-IN")}
                  </div>
                </div>
                <span style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: "4px",
                  background: req.access_level === "LOCKED"
                    ? "#2e1212" : req.access_level === "WRITE"
                    ? "#2e2008" : "#0a2018",
                  color: req.access_level === "LOCKED"
                    ? "#ff6b6b" : req.access_level === "WRITE"
                    ? "#f5a623" : "#4caf7d"
                }}>
                  {req.access_level} ACCESS
                </span>
              </div>

              <div style={{
                background: "#1a1d26",
                borderRadius: "6px",
                padding: "12px 14px",
                marginBottom: "16px",
                fontSize: "13px",
                color: "#9aa0b8",
                lineHeight: 1.6
              }}>
                <strong style={{ color: "#e8eaf0" }}>Case:</strong>{" "}
                {req.case_id}
                <br />
                <strong style={{ color: "#e8eaf0" }}>Reason:</strong>{" "}
                {req.reason}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleDecision(req.id, "APPROVED")}
                  style={{
                    flex: 1,
                    background: "#0a2018",
                    border: "0.5px solid #4caf7d",
                    borderRadius: "8px",
                    padding: "10px",
                    color: "#4caf7d",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleDecision(req.id, "DENIED")}
                  style={{
                    flex: 1,
                    background: "#2e1212",
                    border: "0.5px solid #ff6b6b",
                    borderRadius: "8px",
                    padding: "10px",
                    color: "#ff6b6b",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  ✗ Deny
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={onDone}
            style={{
              width: "100%",
              marginTop: "8px",
              background: "transparent",
              border: "0.5px solid #232636",
              borderRadius: "8px",
              padding: "12px",
              color: "#9aa0b8",
              fontSize: "13px",
              cursor: "pointer"
            }}
          >
            Skip to cases →
          </button>
        </>
      )}
    </div>
  )
}