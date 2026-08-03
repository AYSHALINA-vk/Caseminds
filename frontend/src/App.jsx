import { useState, useEffect } from "react"
import Login from "./components/Login"
import Landing from "./components/Landing"
import CaseList from "./components/CaseList"
import CaseDetail from "./components/CaseDetail"
import AccessRequest from "./components/AccessRequest"
import ApprovalQueue from "./components/ApprovalQueue"

function getJuniorApprovedCases(officerId) {
  const requests = JSON.parse(
    localStorage.getItem("access_requests") || "[]"
  )
  // Return list of approved case IDs for this officer
  return requests
    .filter(r => r.officer_id === officerId && r.status === "APPROVED")
    .map(r => r.case_id)
}

function juniorHasApproval(officerId) {
  return getJuniorApprovedCases(officerId).length > 0
}

function GlobalHeader({ officer, onLogout }) {
  const now = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  })

  return (
    <div style={{
      background: "#0d0e14",
      borderBottom: "0.5px solid #232636",
      padding: "10px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#e8eaf0" }}>
        Case<span style={{ color: "#7c5cfc" }}>Minds</span>
        <span style={{
          fontSize: "10px", color: "#555d7a",
          fontWeight: 400, marginLeft: "8px", letterSpacing: "0.1em"
        }}>
          KERALA POLICE · ACPIA
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{
          fontSize: "10px", fontWeight: 600,
          padding: "2px 8px", borderRadius: "4px",
          background: officer.role === "SENIOR" ? "#0a2018" : "#2e2008",
          color: officer.role === "SENIOR" ? "#4caf7d" : "#f5a623",
          letterSpacing: "0.08em"
        }}>
          {officer.rank}
        </span>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#e8eaf0" }}>
            {officer.name}
          </div>
          <div style={{ fontSize: "10px", color: "#555d7a", fontFamily: "monospace" }}>
            {officer.badge} · {officer.department}
          </div>
        </div>
        <div style={{
          fontSize: "10px", fontFamily: "monospace",
          color: "#555d7a", background: "#1a1d26",
          padding: "4px 8px", borderRadius: "4px"
        }}>
          {now}
        </div>
        <button onClick={onLogout} style={{
          background: "transparent", border: "0.5px solid #232636",
          borderRadius: "6px", color: "#555d7a",
          padding: "4px 10px", fontSize: "11px", cursor: "pointer"
        }}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [page, setPage]                 = useState("landing")
  const [selectedCase, setSelectedCase] = useState(null)
  const [cases, setCases]               = useState([])
  const [officer, setOfficer]           = useState(null)

  useEffect(() => {
    fetch("http://localhost:8000/api/cases")
      .then(res => res.json())
      .then(data => setCases(data.cases))
      .catch(err => console.error("Backend not running:", err))
  }, [])

  // Not logged in
  if (!officer) {
    return (
      <div style={{
        background: "#0a0b0f",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif"
      }}>
        <Login onLogin={(o) => {
          setOfficer(o)
          setPage("landing")
        }} />
      </div>
    )
  }

  // Junior without approval
  if (officer.role === "JUNIOR" && !juniorHasApproval(officer.id)) {
    return (
      <div style={{
        background: "#0a0b0f",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif"
      }}>
        <GlobalHeader officer={officer} onLogout={() => setOfficer(null)} />
        <AccessRequest
          officer={officer}
          cases={cases}
          onApproved={() => setPage("cases")}
        />
      </div>
    )
  }

  // Senior on landing — show approval queue first
  if (officer.role === "SENIOR" && page === "landing") {
    return (
      <div style={{
        background: "#0a0b0f",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif"
      }}>
        <GlobalHeader
          officer={officer}
          onLogout={() => { setOfficer(null) }}
        />
        <ApprovalQueue
          officer={officer}
          onDone={() => setPage("cases")}
        />
      </div>
    )
  }

  // Main app
  return (
    <div style={{
      background: "#0a0b0f",
      minHeight: "100vh",
      color: "#e8eaf0",
      fontFamily: "Inter, sans-serif"
    }}>
      <GlobalHeader
        officer={officer}
        onLogout={() => {
          setOfficer(null)
          setPage("landing")
          setSelectedCase(null)
        }}
      />
      {page === "landing" && (
        <Landing onEnter={() => setPage("cases")} />
      )}
      {page === "cases" && (
  <CaseList
    cases={
      officer.role === "JUNIOR"
        ? cases.filter(c =>
            getJuniorApprovedCases(officer.id).includes(c.id)
          )
        : cases
    }
    officer={officer}
    onSelectCase={(c) => {
      setSelectedCase(c)
      setPage("detail")
    }}
    onBack={() => setPage("landing")}
  />
)}
      {page === "detail" && selectedCase && (
        <CaseDetail
          caseData={selectedCase}
          officer={officer}
          onBack={() => setPage("cases")}
        />
      )}
    </div>
  )
}