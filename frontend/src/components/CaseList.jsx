export default function CaseList({ cases, onSelectCase, onBack }) {
  const immediateCases = cases.filter(c => c.immediateAction)
  const activeCases = cases.filter(c => !c.immediateAction && c.status === "ACTIVE")
  const solvedCases = cases.filter(c => c.status === "SOLVED")

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
      
      {/* Header */}
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
            CaseMinds Dashboard
          </div>
          <h1 style={{
            fontSize: "28px",
            fontWeight: 700,
            letterSpacing: "-0.02em"
          }}>
            Active Investigations
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
          ← Back
        </button>
      </div>

      {/* IMMEDIATE ACTION LANE */}
      {immediateCases.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px"
          }}>
            <span style={{ fontSize: "16px" }}>⚡</span>
            <span style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              color: "#ff6b6b",
              textTransform: "uppercase"
            }}>
              Immediate Action Required
            </span>
            <span style={{
              fontSize: "10px",
              background: "#2e1212",
              color: "#ff6b6b",
              padding: "2px 8px",
              borderRadius: "4px",
              fontWeight: 600
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
      <div style={{ marginBottom: "40px" }}>
        <div style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.15em",
          color: "#555d7a",
          textTransform: "uppercase",
          marginBottom: "12px"
        }}>
          📁 Active Cases
        </div>
        {activeCases.map(c => (
          <CaseCard
            key={c.id}
            caseData={c}
            onClick={() => onSelectCase(c)}
            urgent={false}
          />
        ))}
      </div>

      {/* SOLVED CASES */}
      <div>
        <div style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.15em",
          color: "#555d7a",
          textTransform: "uppercase",
          marginBottom: "12px"
        }}>
          ✅ Solved Cases
        </div>
        {solvedCases.map(c => (
          <CaseCard
            key={c.id}
            caseData={c}
            onClick={() => onSelectCase(c)}
            urgent={false}
          />
        ))}
      </div>
    </div>
  )
}

function CaseCard({ caseData, onClick, urgent }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: urgent ? "#1a0a0a" : "#111318",
        border: `1px solid ${urgent ? "#ff6b6b" : "#232636"}`,
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
          fontWeight: 600,
          fontSize: "15px",
          marginBottom: "4px"
        }}>
          {caseData.name}
          <span style={{
            fontSize: "11px",
            color: "#555d7a",
            fontWeight: 400,
            marginLeft: "8px"
          }}>
            {caseData.id}
          </span>
        </div>
        <div style={{
          fontSize: "13px",
          color: "#9aa0b8"
        }}>
          Suspect: {caseData.suspect} · Last activity: {caseData.lastActivity}
        </div>
        {urgent && (
          <div style={{
            marginTop: "8px",
            display: "flex",
            gap: "8px",
            flexWrap: "wrap"
          }}>
            {caseData.signals.map((s, i) => (
              <span key={i} style={{
                fontSize: "11px",
                background: "#2e1212",
                color: "#ff6b6b",
                padding: "2px 8px",
                borderRadius: "4px"
              }}>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Risk scores */}
      <div style={{
        display: "flex",
        gap: "16px",
        alignItems: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "22px",
            fontWeight: 700,
            color: caseData.activeRisk > 75 ? "#ff6b6b" : "#9aa0b8"
          }}>
            {caseData.activeRisk}
          </div>
          <div style={{
            fontSize: "9px",
            color: "#555d7a",
            textTransform: "uppercase",
            letterSpacing: "0.1em"
          }}>
            Active Risk
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
            textTransform: "uppercase",
            letterSpacing: "0.1em"
          }}>
            Case Risk
          </div>
        </div>
        <div style={{
          color: "#555d7a",
          fontSize: "18px"
        }}>
          →
        </div>
      </div>
    </div>
  )
}