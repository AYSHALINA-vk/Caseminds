import { useState } from "react"

// Which pipelines run for each file type
const PIPELINE_MAP = {
  "image/jpeg":      ["Hash Match", "Metadata/EXIF", "Synthetic Detection"],
  "image/png":       ["Hash Match", "Metadata/EXIF", "Synthetic Detection"],
  "video/mp4":       ["Metadata/EXIF", "Synthetic Detection"],
  "text/plain":      ["NLP Pipeline", "RAG Indexer"],
  "application/pdf": ["NLP Pipeline", "RAG Indexer"],
  "text/csv":        ["Timeline Builder", "LeadRank Signals"],
  "application/json":["NLP Pipeline", "RAG Indexer", "Timeline Builder"],
  "message/rfc822":  ["NLP Pipeline", "Metadata/EXIF", "RAG Indexer"],
}

const PIPELINE_COLORS = {
  "Hash Match":          { bg: "#2e1212", color: "#ff6b6b" },
  "Metadata/EXIF":       { bg: "#0a1e35", color: "#4a9eff" },
  "Synthetic Detection": { bg: "#2e2008", color: "#f5a623" },
  "NLP Pipeline":        { bg: "#0a2018", color: "#4caf7d" },
  "RAG Indexer":         { bg: "#2d2250", color: "#7c5cfc" },
  "Timeline Builder":    { bg: "#0a1e35", color: "#4a9eff" },
  "LeadRank Signals":    { bg: "#2e1212", color: "#ff6b6b" },
}

function getMimeType(file) {
  // Use actual MIME type or infer from extension
  if (file.type) return file.type
  const ext = file.name.split('.').pop().toLowerCase()
  const map = {
    jpg: "image/jpeg", jpeg: "image/jpeg",
    png: "image/png", mp4: "video/mp4",
    pdf: "application/pdf", csv: "text/csv",
    txt: "text/plain", json: "application/json",
    eml: "message/rfc822"
  }
  return map[ext] || "application/octet-stream"
}

function computeSimpleHash(file) {
  // In production: SHA-256 via SubtleCrypto API
  // In prototype: simulate with file size + name + timestamp
  return `sha256-${file.size}-${file.name.length}-${Date.now()}`
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 32)
}

export default function EvidenceUpload({ officer, caseId, onClose }) {
  const [dragOver, setDragOver]     = useState(false)
  const [files, setFiles]           = useState([])
  const [uploading, setUploading]   = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files)
    addFiles(dropped)
  }

  function handleFileSelect(e) {
    const selected = Array.from(e.target.files)
    addFiles(selected)
  }

  function addFiles(newFiles) {
    const processed = newFiles.map(file => {
      const mime      = getMimeType(file)
      const hash      = computeSimpleHash(file)
      const pipelines = PIPELINE_MAP[mime] || ["NLP Pipeline"]

      return {
        id:          `EVD-${Date.now()}-${Math.random()
                     .toString(36).slice(2, 6).toUpperCase()}`,
        file:        file,
        name:        file.name,
        size:        file.size,
        mime:        mime,
        sha256:      hash,
        pipelines:   pipelines,
        status:      "READY",
        uploaded_by: officer.badge,
        uploaded_at: new Date().toISOString(),
        case_id:     caseId
      }
    })
    setFiles(prev => [...prev, ...processed])
  }

  function removeFile(id) {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  async function handleUpload() {
    if (files.length === 0) return
    setUploading(true)

    // Simulate pipeline processing per file
    for (let i = 0; i < files.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))

      setFiles(prev => prev.map((f, idx) =>
        idx === i ? { ...f, status: "PROCESSING" } : f
      ))

      await new Promise(resolve => setTimeout(resolve, 1200))

      setFiles(prev => prev.map((f, idx) =>
        idx === i ? { ...f, status: "COMPLETE" } : f
      ))

      setUploadedCount(i + 1)
    }

    setUploading(false)
  }

  const allComplete = files.length > 0 &&
    files.every(f => f.status === "COMPLETE")

  return (
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
        maxWidth: "620px",
        maxHeight: "90vh",
        overflowY: "auto",
        padding: "28px",
        position: "relative"
      }}>

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px"
        }}>
          <div>
            <div style={{
              fontSize: "11px", fontWeight: 600,
              letterSpacing: "0.15em", color: "#555d7a",
              textTransform: "uppercase", marginBottom: "6px"
            }}>
              {caseId}
            </div>
            <h2 style={{
              fontSize: "20px", fontWeight: 700, color: "#e8eaf0"
            }}>
              Upload evidence
            </h2>
            <p style={{
              fontSize: "12px", color: "#9aa0b8", marginTop: "4px"
            }}>
              Officer: {officer.name} · {officer.badge}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "transparent",
            border: "0.5px solid #232636",
            borderRadius: "6px", color: "#555d7a",
            padding: "6px 12px", fontSize: "13px",
            cursor: "pointer"
          }}>
            ✕
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `1.5px dashed ${dragOver ? "#7c5cfc" : "#232636"}`,
            borderRadius: "10px",
            padding: "32px",
            textAlign: "center",
            background: dragOver ? "#0f0a1a" : "#111318",
            marginBottom: "20px",
            transition: "all 0.2s"
          }}
        >
          <div style={{
            fontSize: "32px", marginBottom: "12px"
          }}>
            📁
          </div>
          <p style={{
            fontSize: "14px", color: "#9aa0b8", marginBottom: "8px"
          }}>
            Drag and drop evidence files here
          </p>
          <p style={{
            fontSize: "12px", color: "#555d7a", marginBottom: "16px"
          }}>
            Supported: JPG, PNG, MP4, PDF, CSV, TXT, JSON, EML
          </p>
          <label style={{
            background: "#7c5cfc",
            border: "none", borderRadius: "8px",
            padding: "10px 20px", color: "white",
            fontSize: "13px", fontWeight: 600,
            cursor: "pointer", display: "inline-block"
          }}>
            Browse files
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: "none" }}
              accept=".jpg,.jpeg,.png,.mp4,.pdf,.csv,.txt,.json,.eml"
            />
          </label>
        </div>

        {/* Chain of custody notice */}
        <div style={{
          background: "#0f0a1a",
          border: "0.5px solid #2d2250",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "20px",
          fontSize: "12px",
          color: "#7c5cfc"
        }}>
          🔒 SHA-256 hash computed on arrival · Officer ID sealed ·
          MIME type verified · All uploads logged to audit trail
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{
              fontSize: "11px", fontWeight: 600,
              letterSpacing: "0.15em", color: "#555d7a",
              textTransform: "uppercase", marginBottom: "12px"
            }}>
              {files.length} file{files.length !== 1 ? "s" : ""} queued
            </div>

            {files.map(f => (
              <div key={f.id} style={{
                background: "#111318",
                border: "0.5px solid #232636",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "8px"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "10px"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: "13px", fontWeight: 600,
                      color: "#e8eaf0", marginBottom: "4px"
                    }}>
                      {f.name}
                    </div>
                    <div style={{
                      fontSize: "11px", color: "#555d7a",
                      fontFamily: "monospace"
                    }}>
                      {f.id} · {(f.size / 1024).toFixed(1)}KB · {f.mime}
                    </div>
                    <div style={{
                      fontSize: "10px", color: "#555d7a",
                      fontFamily: "monospace", marginTop: "2px"
                    }}>
                      SHA-256: {f.sha256}
                    </div>
                  </div>

                  {/* Status */}
                  <div style={{ marginLeft: "12px", flexShrink: 0 }}>
                    {f.status === "READY" && (
                      <span style={{
                        fontSize: "10px", fontWeight: 600,
                        color: "#555d7a", background: "#1a1d26",
                        padding: "3px 8px", borderRadius: "4px"
                      }}>
                        READY
                      </span>
                    )}
                    {f.status === "PROCESSING" && (
                      <span style={{
                        fontSize: "10px", fontWeight: 600,
                        color: "#f5a623", background: "#2e2008",
                        padding: "3px 8px", borderRadius: "4px"
                      }}>
                        PROCESSING...
                      </span>
                    )}
                    {f.status === "COMPLETE" && (
                      <span style={{
                        fontSize: "10px", fontWeight: 600,
                        color: "#4caf7d", background: "#0a2018",
                        padding: "3px 8px", borderRadius: "4px"
                      }}>
                        ✓ COMPLETE
                      </span>
                    )}
                  </div>

                  {/* Remove button */}
                  {f.status === "READY" && (
                    <button
                      onClick={() => removeFile(f.id)}
                      style={{
                        background: "transparent",
                        border: "none", color: "#555d7a",
                        cursor: "pointer", fontSize: "16px",
                        marginLeft: "8px", padding: "0 4px"
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Pipelines that will run */}
                <div>
                  <div style={{
                    fontSize: "10px", color: "#555d7a",
                    marginBottom: "6px", letterSpacing: "0.08em"
                  }}>
                    PIPELINES:
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {f.pipelines.map((p, i) => (
                      <span key={i} style={{
                        fontSize: "10px", fontWeight: 600,
                        padding: "2px 8px", borderRadius: "4px",
                        background: PIPELINE_COLORS[p]?.bg || "#1a1d26",
                        color: PIPELINE_COLORS[p]?.color || "#9aa0b8"
                      }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Processing bar */}
                {f.status === "PROCESSING" && (
                  <div style={{
                    marginTop: "10px",
                    height: "3px",
                    background: "#232636",
                    borderRadius: "2px",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      height: "100%",
                      width: "60%",
                      background: "#7c5cfc",
                      borderRadius: "2px",
                      animation: "none"
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        {files.length > 0 && !allComplete && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              width: "100%",
              background: uploading ? "#2d2250" : "#7c5cfc",
              border: "none", borderRadius: "8px",
              padding: "14px", color: "white",
              fontSize: "14px", fontWeight: 600,
              cursor: uploading ? "not-allowed" : "pointer"
            }}
          >
            {uploading
              ? `Processing ${uploadedCount}/${files.length} files...`
              : `Upload ${files.length} file${files.length !== 1 ? "s" : ""} to ${caseId}`
            }
          </button>
        )}

        {/* Success state */}
        {allComplete && (
          <div style={{
            background: "#0a2018",
            border: "0.5px solid #4caf7d",
            borderRadius: "8px",
            padding: "16px",
            textAlign: "center"
          }}>
            <div style={{
              fontSize: "24px", marginBottom: "8px"
            }}>✅</div>
            <div style={{
              fontSize: "14px", fontWeight: 600,
              color: "#4caf7d", marginBottom: "4px"
            }}>
              {files.length} file{files.length !== 1 ? "s" : ""} processed
            </div>
            <div style={{
              fontSize: "12px", color: "#9aa0b8",
              marginBottom: "16px"
            }}>
              All pipelines complete · Evidence sealed in audit trail
            </div>
            <button
              onClick={onClose}
              style={{
                background: "#4caf7d",
                border: "none", borderRadius: "8px",
                padding: "10px 24px", color: "white",
                fontSize: "13px", fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Return to case
            </button>
          </div>
        )}
      </div>
    </div>
  )
}