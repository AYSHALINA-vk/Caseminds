import { useState, useEffect } from "react"
import Landing from "./components/Landing"
import CaseList from "./components/CaseList"
import CaseDetail from "./components/CaseDetail"

export default function App() {
  const [page, setPage] = useState("landing")
  const [selectedCase, setSelectedCase] = useState(null)
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("http://localhost:8000/api/cases")
      .then(res => res.json())
      .then(data => setCases(data.cases))
      .catch(err => console.error("Backend not running:", err))
  }, [])

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