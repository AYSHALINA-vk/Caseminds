import { useState } from "react"
import Landing from "./components/Landing"
import CaseList from "./components/CaseList"
import CaseDetail from "./components/CaseDetail"

export default function App() {
  const [page, setPage] = useState("landing")
  const [selectedCase, setSelectedCase] = useState(null)

  const cases = [
    {
      id: "KL-DEMO-2024-001",
      name: "Operation Shield",
      status: "ACTIVE",
      activeRisk: 91,
      caseRisk: 77,
      suspect: "Accused_X",
      lastActivity: "2 hours ago",
      immediateAction: true,
      signals: [
        "Live location signal near victim",
        "Contact frequency increased 4x",
        "Platform migration to Signal detected"
      ]
    },
    {
      id: "KL-DEMO-2024-002",
      name: "Operation Anchor",
      status: "ACTIVE",
      activeRisk: 28,
      caseRisk: 84,
      suspect: "Accused_Y",
      lastActivity: "3 days ago",
      immediateAction: false,
      signals: []
    },
    {
      id: "KL-DEMO-2024-003",
      name: "Operation Lighthouse",
      status: "SOLVED",
      activeRisk: 0,
      caseRisk: 95,
      suspect: "Accused_Z",
      lastActivity: "2 weeks ago",
      immediateAction: false,
      signals: []
    }
  ]

  return (
    <div style={{
      background: "#0a0b0f",
      minHeight: "100vh",
      color: "#e8eaf0",
      fontFamily: "Inter, sans-serif"
    }}>
      {page === "landing" && (
        <Landing onEnter={() => setPage("cases")} />
      )}
      {page === "cases" && (
        <CaseList
          cases={cases}
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
          onBack={() => setPage("cases")}
        />
      )}
    </div>
  )
}