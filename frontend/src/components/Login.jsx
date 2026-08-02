import { useState } from "react"

// Demo officer accounts
// In production: verified against PostgreSQL with bcrypt
const OFFICERS = [
  {
    id: "officer_001",
    badge: "KP-1847",
    name: "Sreeja Menon",
    department: "Cyber Crime Unit",
    rank: "Senior Inspector",
    role: "SENIOR",
    password: "senior123",
    canAccessLocked: true
  },
  {
    id: "officer_002",
    badge: "KP-2241",
    name: "Arjun Nair",
    department: "Cyber Crime Unit",
    rank: "Sub Inspector",
    role: "JUNIOR",
    password: "junior123",
    canAccessLocked: false
  }
]

export default function Login({ onLogin }) {
  const [badge, setBadge]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  function handleLogin() {
    if (!badge || !password) {
      setError("Please enter both Badge ID and password")
      return
    }

    setLoading(true)
    setError("")

    // Simulate authentication delay
    setTimeout(() => {
      const officer = OFFICERS.find(
        o => o.badge === badge.toUpperCase() &&
             o.password === password
      )

      if (officer) {
        // Log login to audit trail
        const auditEntry = {
          action:    "OFFICER_LOGIN",
          officer:   officer.id,
          badge:     officer.badge,
          name:      officer.name,
          role:      officer.role,
          timestamp: new Date().toISOString(),
          ip:        "192.168.1.45"
        }
        console.log("AUDIT:", auditEntry)

        onLogin(officer)
      } else {
        setError("Invalid Badge ID or password. Access denied.")
        setLoading(false)
      }
    }, 800)
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0b0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.2em",
            color: "#7c5cfc",
            textTransform: "uppercase",
            marginBottom: "12px"
          }}>
            Kerala Police · ACPIA
          </div>
          <h1 style={{
            fontSize: "36px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#e8eaf0",
            marginBottom: "8px"
          }}>
            Case<span style={{ color: "#7c5cfc" }}>Minds</span>
          </h1>
          <p style={{
            color: "#555d7a",
            fontSize: "13px"
          }}>
            Authorized personnel only
          </p>
        </div>

        {/* Login card */}
        <div style={{
          background: "#111318",
          border: "0.5px solid #232636",
          borderRadius: "12px",
          padding: "32px"
        }}>
          <div style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            color: "#555d7a",
            textTransform: "uppercase",
            marginBottom: "24px"
          }}>
            Officer authentication
          </div>

          {/* Badge ID */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#9aa0b8",
              marginBottom: "6px",
              letterSpacing: "0.05em"
            }}>
              Badge ID
            </label>
            <input
              type="text"
              value={badge}
              onChange={e => setBadge(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="KP-XXXX"
              style={{
                width: "100%",
                background: "#1a1d26",
                border: "0.5px solid #232636",
                borderRadius: "8px",
                padding: "12px 14px",
                color: "#e8eaf0",
                fontSize: "14px",
                outline: "none",
                fontFamily: "monospace",
                letterSpacing: "0.1em"
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#9aa0b8",
              marginBottom: "6px",
              letterSpacing: "0.05em"
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              style={{
                width: "100%",
                background: "#1a1d26",
                border: "0.5px solid #232636",
                borderRadius: "8px",
                padding: "12px 14px",
                color: "#e8eaf0",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "#2e1212",
              border: "0.5px solid #ff6b6b",
              borderRadius: "6px",
              padding: "10px 14px",
              fontSize: "12px",
              color: "#ff6b6b",
              marginBottom: "16px"
            }}>
              {error}
            </div>
          )}

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "#2d2250" : "#7c5cfc",
              border: "none",
              borderRadius: "8px",
              padding: "14px",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.02em"
            }}
          >
            {loading ? "Verifying..." : "Access Investigation System"}
          </button>
        </div>

        {/* Demo credentials */}
        <div style={{
          marginTop: "20px",
          background: "#0f0a1a",
          border: "0.5px solid #2d2250",
          borderRadius: "8px",
          padding: "16px"
        }}>
          <div style={{
            fontSize: "10px",
            fontWeight: 600,
            color: "#7c5cfc",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "10px"
          }}>
            Demo credentials
          </div>
          <div style={{
            fontSize: "12px",
            color: "#9aa0b8",
            lineHeight: 2,
            fontFamily: "monospace"
          }}>
            <div>
              <span style={{ color: "#4caf7d" }}>Senior:</span>
              {" "}KP-1847 / senior123
            </div>
            <div>
              <span style={{ color: "#f5a623" }}>Junior:</span>
              {" "}KP-2241 / junior123
            </div>
          </div>
        </div>

        {/* Security note */}
        <p style={{
          textAlign: "center",
          color: "#555d7a",
          fontSize: "11px",
          marginTop: "16px"
        }}>
          🔒 All access logged · Unauthorized use is a criminal offence
        </p>
      </div>
    </div>
  )
}