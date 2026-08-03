import { useState } from "react"
import AccessRequest from "./AccessRequest"

export default function CaseList({ cases, officer, onSelectCase, onBack }) {
  const [showRequestModal, setShowRequestModal] = useState(false)

  const immediateCases = cases.filter(c => c.immediateAction)
  const activeCases    = cases.filter(c => !c.immediateAction && c.status === "ACTIVE")
  const solvedCases    = cases.filter(c => c.status === "SOLVED")
  const [searchQuery, setSearchQuery] = useState("")
  const filtered        = searchCases(cases, searchQuery)

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>

      {/* Request modal — shows on top when triggered */}
      {showRequestModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px"
        }}>
          <div style={{
            background: "#0a0b0f",
            border: "0.5px solid #232636",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "520px",
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative"
          }}>
            {/* Close button */}
            <button
              onClick={() => setShowRequestModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "transparent",
                border: "0.5px solid #232636",
                borderRadius: "6px",
                color: "#555d7a",
                padding: "4px 10px",
                fontSize: "13px",
                cursor: "pointer",
                zIndex: 10
              }}
            >
              ✕
            </button>
            <AccessRequest
              officer={officer}
              cases={cases}
              onApproved={() => setShowRequestModal(false)}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "28px"
      }}>
        <div>
          <span style={{
            fontSize: "11px", fontWeight: 600,
            letterSpacing: "0.15em", color: "#555d7a",
            textTransform: "uppercase", display: "block",
            marginBottom: "6px"
          }}>
            CaseMinds dashboard
          </span>
          <h2 style={{
            fontSize: "28px", fontWeight: 700,
            letterSpacing: "-0.02em"
          }}>
            Active investigations
          </h2>
          {/* Search bar */}
<div style={{
  position: "relative",
  marginBottom: "24px"
}}>
  <input
    type="text"
    value={searchQuery}
    onChange={e => setSearchQuery(e.target.value)}
    placeholder="Search by case name, suspect, location, or case number..."
    style={{
      width: "100%",
      background: "#111318",
      border: `0.5px solid ${searchQuery ? "#7c5cfc" : "#232636"}`,
      borderRadius: "8px",
      padding: "12px 16px 12px 40px",
      color: "#e8eaf0",
      fontSize: "13px",
      outline: "none",
      transition: "border-color 0.2s"
    }}
  />
  {/* Search icon */}
  <span style={{
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: searchQuery ? "#7c5cfc" : "#555d7a",
    fontSize: "14px"
  }}>
    🔍
  </span>
  {/* Clear button */}
  {searchQuery && (
    <button
      onClick={() => setSearchQuery("")}
      style={{
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "transparent",
        border: "none",
        color: "#555d7a",
        cursor: "pointer",
        fontSize: "16px",
        padding: "0"
      }}
    >
      ×
    </button>
  )}
</div>

{/* Search results count */}
{searchQuery && (
  <div style={{
    fontSize: "12px",
    color: "#555d7a",
    marginBottom: "16px",
    marginTop: "-16px"
  }}>
    {filtered.length === 0
      ? `No cases match "${searchQuery}"`
      : `${filtered.length} case${filtered.length !== 1 ? "s" : ""} match "${searchQuery}"`
    }
  </div>
)}

{filtered.length === 0 && searchQuery && (
  <div style={{
    textAlign: "center",
    padding: "48px 24px",
    color: "#555d7a"
  }}>
    <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
    <p style={{ fontSize: "15px", color: "#9aa0b8", marginBottom: "8px" }}>
      No cases found for "{searchQuery}"
    </p>
    <p style={{ fontSize: "13px", marginBottom: "20px" }}>
      Try searching by case number, suspect name, or location
    </p>
    <button
      onClick={() => setSearchQuery("")}
      style={{
        background: "#7c5cfc", border: "none",
        borderRadius: "8px", padding: "10px 20px",
        color: "white", fontSize: "13px",
        fontWeight: 600, cursor: "pointer"
      }}
    >
      Clear search
    </button>
  </div>
)}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {officer?.role === "JUNIOR" && (
            <button
              onClick={() => setShowRequestModal(true)}
              style={{
                background: "#0f0a1a",
                border: "0.5px solid #7c5cfc",
                borderRadius: "6px",
                color: "#7c5cfc",
                padding: "8px 14px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              + Request case access
            </button>
          )}
          <button onClick={onBack} style={{
            background: "transparent",
            border: "0.5px solid #232636",
            borderRadius: "6px",
            color: "#9aa0b8",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: "13px"
          }}>
            ← Back
          </button>
        </div>
      </div>

      {/* Junior access notice */}
      {officer?.role === "JUNIOR" && (
        <div style={{
          background: "#0f0a1a",
          border: "0.5px solid #2d2250",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "20px",
          fontSize: "12px",
          color: "#7c5cfc",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>
            Showing {cases.length} approved case{cases.length !== 1 ? "s" : ""}.
            Other cases require Senior Inspector approval.
          </span>
        </div>
      )}

      {/* IMMEDIATE ACTION */}
      {immediateCases.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <div style={{
            display: "flex", alignItems: "center",
            gap: "8px", marginBottom: "10px"
          }}>
            <span style={{ color: "#ff6b6b", fontSize: "16px" }}>⚡</span>
            <span style={{
              fontSize: "11px", fontWeight: 600,
              letterSpacing: "0.15em", color: "#ff6b6b",
              textTransform: "uppercase"
            }}>
              Immediate action required
            </span>
            <span style={{
              fontSize: "10px", background: "#2e1212",
              color: "#ff6b6b", padding: "2px 8px",
              borderRadius: "4px", fontWeight: 600
            }}>
              Active Risk &gt; 75
            </span>
          </div>
          {immediateCases.map(c => (
            <CaseCard
              key={c.id}
              caseData={c}
              onClick={() => onSelectCase(c)}
              urgent={true}
            />
          ))}
        </div>
      )}

      {/* ACTIVE CASES */}
      {activeCases.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <span style={{
            fontSize: "11px", fontWeight: 600,
            letterSpacing: "0.15em", color: "#555d7a",
            textTransform: "uppercase", display: "block",
            marginBottom: "10px"
          }}>
            📁 Active cases
          </span>
          {activeCases.map(c => (
            <CaseCard
              key={c.id}
              caseData={c}
              onClick={() => onSelectCase(c)}
              urgent={false}
            />
          ))}
        </div>
      )}

      {/* SOLVED */}
      {solvedCases.length > 0 && (
        <div>
          <span style={{
            fontSize: "11px", fontWeight: 600,
            letterSpacing: "0.15em", color: "#555d7a",
            textTransform: "uppercase", display: "block",
            marginBottom: "10px"
          }}>
            ✅ Solved cases
          </span>
          {solvedCases.map(c => (
            <CaseCard
              key={c.id}
              caseData={c}
              onClick={() => onSelectCase(c)}
              urgent={false}
            />
          ))}
        </div>
      )}

      {/* Empty state for junior */}
      {cases.length === 0 && officer?.role === "JUNIOR" && (
        <div style={{
          textAlign: "center",
          padding: "60px 24px",
          color: "#555d7a"
        }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔒</div>
          <p style={{ fontSize: "15px", marginBottom: "8px", color: "#9aa0b8" }}>
            No approved cases yet
          </p>
          <p style={{ fontSize: "13px", marginBottom: "24px" }}>
            Request access from your Senior Inspector
          </p>
          <button
            onClick={() => setShowRequestModal(true)}
            style={{
              background: "#7c5cfc",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            + Request case access
          </button>
        </div>
      )}
    </div>
  )
}
function searchCases(cases, query) {
  if (!query.trim()) return cases
  const q = query.toLowerCase()
  return cases.filter(c => {
    const inName    = c.name?.toLowerCase().includes(q)
    const inId      = c.id?.toLowerCase().includes(q)
    const inSuspect = c.suspect?.toLowerCase().includes(q)
    const inSignals = c.signals?.some(s =>
      s.toLowerCase().includes(q)
    )
    return inName || inId || inSuspect || inSignals
  })
}



function CaseCard({ caseData, onClick, urgent }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: urgent ? "#1a0a0a" : "#111318",
        border: `0.5px solid ${urgent ? "#ff6b6b" : "#232636"}`,
        borderRadius: "10px",
        padding: "20px 24px",
        marginBottom: "12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <div>
        <div style={{
          fontWeight: 700, fontSize: "15px", marginBottom: "4px"
        }}>
          {caseData.name}
          <span style={{
            fontSize: "11px", color: "#555d7a",
            fontWeight: 400, marginLeft: "8px"
          }}>
            {caseData.id}
          </span>
        </div>
        <div style={{
          fontSize: "13px", color: "#9aa0b8", marginBottom: urgent ? "10px" : 0
        }}>
          Suspect: {caseData.suspect} · Last activity: {caseData.lastActivity || "—"}
        </div>
        {urgent && caseData.signals && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {caseData.signals.map((s, i) => (
              <span key={i} style={{
                fontSize: "11px", background: "#2e1212",
                color: "#ff6b6b", padding: "2px 8px",
                borderRadius: "4px", fontWeight: 600
              }}>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
      <div style={{
        display: "flex", gap: "20px",
        alignItems: "center", flexShrink: 0, marginLeft: "16px"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "24px", fontWeight: 700,
            color: caseData.activeRisk > 75 ? "#ff6b6b" : "#9aa0b8"
          }}>
            {caseData.activeRisk}
          </div>
          <div style={{
            fontSize: "9px", color: "#555d7a",
            textTransform: "uppercase", letterSpacing: "0.1em"
          }}>
            Active
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "24px", fontWeight: 700, color: "#7c5cfc"
          }}>
            {caseData.caseRisk}
          </div>
          <div style={{
            fontSize: "9px", color: "#555d7a",
            textTransform: "uppercase", letterSpacing: "0.1em"
          }}>
            Case
          </div>
        </div>
        <span style={{ color: "#555d7a", fontSize: "18px" }}>→</span>
      </div>
    </div>
  )
}