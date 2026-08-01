export default function Landing({ onEnter }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "40px"
    }}>
      {/* Logo area */}
      <div style={{
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.2em",
        color: "#7c5cfc",
        textTransform: "uppercase",
        marginBottom: "16px"
      }}>
        Hac'KP 2026 · Kerala Police · ACPIA
      </div>

      <h1 style={{
        fontSize: "48px",
        fontWeight: 700,
        letterSpacing: "-0.03em",
        marginBottom: "8px",
        textAlign: "center"
      }}>
        Case<span style={{ color: "#7c5cfc" }}>Minds</span>
      </h1>

      <p style={{
        color: "#9aa0b8",
        fontSize: "18px",
        textAlign: "center",
        maxWidth: "500px",
        lineHeight: 1.6,
        marginBottom: "48px"
      }}>
        Agentic AI investigation platform for child protection.
        Every lead ranked. Every connection found.
        Every decision yours.
      </p>

      {/* Stats row */}
      <div style={{
        display: "flex",
        gap: "32px",
        marginBottom: "48px"
      }}>
        {[
          { number: "12", label: "ACPIA Capabilities" },
          { number: "< 60s", label: "Evidence Processing" },
          { number: "2", label: "Adversarial Agents" },
          { number: "100%", label: "On-Premise" }
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#7c5cfc",
              marginBottom: "4px"
            }}>
              {stat.number}
            </div>
            <div style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "#555d7a",
              textTransform: "uppercase"
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Enter button */}
      <button
        onClick={onEnter}
        style={{
          background: "#7c5cfc",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "16px 48px",
          fontSize: "15px",
          fontWeight: 600,
          cursor: "pointer",
          letterSpacing: "0.02em"
        }}
      >
        Open Investigation Dashboard
      </button>

      {/* Security note */}
      <p style={{
        color: "#555d7a",
        fontSize: "12px",
        marginTop: "24px"
      }}>
        🔒 On-premise deployment · No evidence leaves this network
      </p>
    </div>
  )
}