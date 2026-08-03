import { useState, useEffect } from "react"

export default function Annotations({ caseId, officer }) {
  const [observations, setObservations] = useState([])
  const [findings, setFindings]         = useState([])
  const [newObsText, setNewObsText]     = useState("")
  const [editingId, setEditingId]       = useState(null)
  const [editText, setEditText]         = useState("")
  const [promotingId, setPromotingId]   = useState(null)
  const [sourceText, setSourceText]     = useState("")
  const [activeTab, setActiveTab]       = useState("observations")

  // Storage keys per officer and case
  const OBS_KEY = `obs_${caseId}_${officer.id}`
  const FINDINGS_KEY = `findings_${caseId}`

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(OBS_KEY) || "[]")
    setObservations(stored)
    const storedFindings = JSON.parse(
      localStorage.getItem(FINDINGS_KEY) || "[]"
    )
    setFindings(storedFindings)
  }, [caseId, officer.id])

  function saveObservations(updated) {
    setObservations(updated)
    localStorage.setItem(OBS_KEY, JSON.stringify(updated))
  }

  function saveFindings(updated) {
    setFindings(updated)
    localStorage.setItem(FINDINGS_KEY, JSON.stringify(updated))
  }

  // ── OBSERVATION functions ──────────────────────────

  function addObservation() {
    if (!newObsText.trim()) return
    const obs = {
      id:         `OBS-${Date.now()}`,
      text:       newObsText.trim(),
      author:     officer.name,
      author_id:  officer.id,
      badge:      officer.badge,
      created_at: new Date().toISOString(),
      edited_at:  null
    }
    saveObservations([...observations, obs])
    setNewObsText("")
  }

  function editObservation(id) {
    const obs = observations.find(o => o.id === id)
    setEditingId(id)
    setEditText(obs.text)
  }

  function saveEdit(id) {
    if (!editText.trim()) return
    const updated = observations.map(o =>
      o.id === id ? {
        ...o,
        text:      editText.trim(),
        edited_at: new Date().toISOString()
      } : o
    )
    saveObservations(updated)
    setEditingId(null)
    setEditText("")
  }

  function deleteObservation(id) {
    const updated = observations.filter(o => o.id !== id)
    saveObservations(updated)
  }

  // ── PROMOTE to Finding ─────────────────────────────

  function startPromotion(id) {
    setPromotingId(id)
    setSourceText("")
  }

  function submitFinding(obsId) {
    if (!sourceText.trim()) return

    const obs = observations.find(o => o.id === obsId)
    const finding = {
      id:           `FIND-${Date.now()}`,
      text:         obs.text,
      source:       sourceText.trim(),
      author:       officer.name,
      author_id:    officer.id,
      badge:        officer.badge,
      rank:         officer.rank,
      submitted_at: new Date().toISOString(),
      case_id:      caseId,
      immutable:    true,
      audit_entry:  `Submitted by ${officer.badge} at ${new Date().toISOString()}`
    }

    // Add to findings
    saveFindings([...findings, finding])

    // Remove from observations
    const updatedObs = observations.filter(o => o.id !== obsId)
    saveObservations(updatedObs)

    setPromotingId(null)
    setSourceText("")
    setActiveTab("findings")
  }

  // ── Render ─────────────────────────────────────────

  return (
    <div style={{
      background: "#111318",
      border: "0.5px solid #232636",
      borderRadius: "10px",
      overflow: "hidden",
      marginBottom: "32px"
    }}>

      {/* Tabs */}
      <div style={{
        display: "flex",
        borderBottom: "0.5px solid #232636"
      }}>
        <button
          onClick={() => setActiveTab("observations")}
          style={{
            flex: 1,
            padding: "14px",
            background: activeTab === "observations" ? "#1a1d26" : "transparent",
            border: "none",
            borderBottom: activeTab === "observations"
              ? "2px solid #7c5cfc" : "2px solid transparent",
            color: activeTab === "observations" ? "#e8eaf0" : "#555d7a",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.08em"
          }}
        >
          🔒 MY OBSERVATIONS ({observations.length})
        </button>
        <button
          onClick={() => setActiveTab("findings")}
          style={{
            flex: 1,
            padding: "14px",
            background: activeTab === "findings" ? "#1a1d26" : "transparent",
            border: "none",
            borderBottom: activeTab === "findings"
              ? "2px solid #4caf7d" : "2px solid transparent",
            color: activeTab === "findings" ? "#e8eaf0" : "#555d7a",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.08em"
          }}
        >
          📋 TEAM FINDINGS ({findings.length})
        </button>
      </div>

      <div style={{ padding: "20px" }}>

        {/* ── OBSERVATIONS TAB ── */}
        {activeTab === "observations" && (
          <div>
            <div style={{
              background: "#0f0a1a",
              border: "0.5px solid #2d2250",
              borderRadius: "8px",
              padding: "12px 14px",
              marginBottom: "16px",
              fontSize: "12px",
              color: "#7c5cfc"
            }}>
              🔒 Only you can see these. Personal thinking,
              hunches, and unverified leads. Edit or delete freely.
              Promote to a Team Finding when verified.
            </div>

            {/* Add observation */}
            <div style={{ marginBottom: "20px" }}>
              <textarea
                value={newObsText}
                onChange={e => setNewObsText(e.target.value)}
                placeholder="Add a personal observation about this case..."
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
                  fontFamily: "Inter, sans-serif",
                  marginBottom: "8px"
                }}
              />
              <button
                onClick={addObservation}
                disabled={!newObsText.trim()}
                style={{
                  background: newObsText.trim() ? "#7c5cfc" : "#1a1d26",
                  border: "none", borderRadius: "6px",
                  padding: "8px 16px", color: "white",
                  fontSize: "12px", fontWeight: 600,
                  cursor: newObsText.trim() ? "pointer" : "not-allowed"
                }}
              >
                + Add observation
              </button>
            </div>

            {/* Observation list */}
            {observations.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "24px",
                color: "#555d7a", fontSize: "13px"
              }}>
                No observations yet. Add your first one above.
              </div>
            ) : (
              observations.map(obs => (
                <div key={obs.id} style={{
                  background: "#1a1d26",
                  border: "0.5px solid #232636",
                  borderRadius: "8px",
                  padding: "14px",
                  marginBottom: "10px"
                }}>
                  {/* Editing mode */}
                  {editingId === obs.id ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        rows={3}
                        style={{
                          width: "100%",
                          background: "#111318",
                          border: "0.5px solid #7c5cfc",
                          borderRadius: "6px",
                          padding: "10px",
                          color: "#e8eaf0",
                          fontSize: "13px",
                          outline: "none",
                          resize: "vertical",
                          fontFamily: "Inter, sans-serif",
                          marginBottom: "8px"
                        }}
                      />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => saveEdit(obs.id)}
                          style={{
                            background: "#7c5cfc", border: "none",
                            borderRadius: "6px", padding: "6px 14px",
                            color: "white", fontSize: "12px",
                            fontWeight: 600, cursor: "pointer"
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            background: "transparent",
                            border: "0.5px solid #232636",
                            borderRadius: "6px", padding: "6px 14px",
                            color: "#9aa0b8", fontSize: "12px",
                            cursor: "pointer"
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : promotingId === obs.id ? (
                    /* Promotion mode */
                    <div>
                      <div style={{
                        fontSize: "13px", color: "#e8eaf0",
                        marginBottom: "12px", lineHeight: 1.5
                      }}>
                        {obs.text}
                      </div>
                      <div style={{
                        background: "#0a2018",
                        border: "0.5px solid #4caf7d",
                        borderRadius: "6px",
                        padding: "12px",
                        marginBottom: "10px"
                      }}>
                        <div style={{
                          fontSize: "11px", fontWeight: 600,
                          color: "#4caf7d", marginBottom: "8px",
                          letterSpacing: "0.08em"
                        }}>
                          PROMOTE TO TEAM FINDING
                        </div>
                        <p style={{
                          fontSize: "12px", color: "#9aa0b8",
                          marginBottom: "10px", lineHeight: 1.5
                        }}>
                          This will become visible to all officers
                          and cannot be deleted. Cite your source:
                        </p>
                        <input
                          type="text"
                          value={sourceText}
                          onChange={e => setSourceText(e.target.value)}
                          placeholder="Source: e.g. call_records.csv C005, victim interview 02-Aug-2026..."
                          style={{
                            width: "100%",
                            background: "#111318",
                            border: "0.5px solid #4caf7d",
                            borderRadius: "6px",
                            padding: "8px 12px",
                            color: "#e8eaf0",
                            fontSize: "12px",
                            outline: "none",
                            marginBottom: "10px"
                          }}
                        />
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => submitFinding(obs.id)}
                            disabled={!sourceText.trim()}
                            style={{
                              background: sourceText.trim()
                                ? "#4caf7d" : "#1a1d26",
                              border: "none", borderRadius: "6px",
                              padding: "8px 16px", color: "white",
                              fontSize: "12px", fontWeight: 600,
                              cursor: sourceText.trim()
                                ? "pointer" : "not-allowed"
                            }}
                          >
                            ✓ Submit as team finding
                          </button>
                          <button
                            onClick={() => setPromotingId(null)}
                            style={{
                              background: "transparent",
                              border: "0.5px solid #232636",
                              borderRadius: "6px", padding: "8px 14px",
                              color: "#9aa0b8", fontSize: "12px",
                              cursor: "pointer"
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Normal view */
                    <div>
                      <div style={{
                        fontSize: "13px", color: "#e8eaf0",
                        lineHeight: 1.6, marginBottom: "10px"
                      }}>
                        {obs.text}
                      </div>
                      {obs.edited_at && (
                        <div style={{
                          fontSize: "10px", color: "#555d7a",
                          marginBottom: "8px"
                        }}>
                          Edited {new Date(obs.edited_at)
                            .toLocaleString("en-IN")}
                        </div>
                      )}
                      <div style={{
                        fontSize: "10px", color: "#555d7a",
                        marginBottom: "10px", fontFamily: "monospace"
                      }}>
                        {new Date(obs.created_at)
                          .toLocaleString("en-IN")} · {obs.badge}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => editObservation(obs.id)}
                          style={{
                            background: "transparent",
                            border: "0.5px solid #232636",
                            borderRadius: "6px", padding: "5px 12px",
                            color: "#9aa0b8", fontSize: "11px",
                            cursor: "pointer", fontWeight: 600
                          }}
                        >
                          ✏ Edit
                        </button>
                        <button
                          onClick={() => startPromotion(obs.id)}
                          style={{
                            background: "#0a2018",
                            border: "0.5px solid #4caf7d",
                            borderRadius: "6px", padding: "5px 12px",
                            color: "#4caf7d", fontSize: "11px",
                            cursor: "pointer", fontWeight: 600
                          }}
                        >
                          ↑ Promote to finding
                        </button>
                        <button
                          onClick={() => deleteObservation(obs.id)}
                          style={{
                            background: "transparent",
                            border: "0.5px solid #2e1212",
                            borderRadius: "6px", padding: "5px 12px",
                            color: "#ff6b6b", fontSize: "11px",
                            cursor: "pointer", fontWeight: 600
                          }}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── FINDINGS TAB ── */}
        {activeTab === "findings" && (
          <div>
            <div style={{
              background: "#0a2018",
              border: "0.5px solid #4caf7d",
              borderRadius: "8px",
              padding: "12px 14px",
              marginBottom: "16px",
              fontSize: "12px",
              color: "#4caf7d"
            }}>
              📋 Verified findings visible to all officers.
              Immutable once submitted — deletion not permitted.
              Each finding is logged in the audit trail.
            </div>

            {findings.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "24px",
                color: "#555d7a", fontSize: "13px"
              }}>
                No team findings yet. Promote a verified
                observation to add the first one.
              </div>
            ) : (
              findings.map(f => (
                <div key={f.id} style={{
                  background: "#0a2018",
                  border: "0.5px solid #4caf7d",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "10px"
                }}>
                  <div style={{
                    fontSize: "13px", color: "#e8eaf0",
                    lineHeight: 1.6, marginBottom: "10px"
                  }}>
                    {f.text}
                  </div>
                  <div style={{
                    background: "#111318",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    marginBottom: "10px",
                    fontSize: "12px",
                    color: "#9aa0b8"
                  }}>
                    <span style={{ color: "#4caf7d", fontWeight: 600 }}>
                      Source:
                    </span> {f.source}
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div style={{
                      fontSize: "10px", color: "#555d7a",
                      fontFamily: "monospace"
                    }}>
                      {f.badge} · {f.rank} ·{" "}
                      {new Date(f.submitted_at).toLocaleString("en-IN")}
                    </div>
                    <span style={{
                      fontSize: "10px", fontWeight: 600,
                      background: "#0a2018",
                      border: "0.5px solid #4caf7d",
                      color: "#4caf7d", padding: "2px 8px",
                      borderRadius: "4px"
                    }}>
                      IMMUTABLE
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}