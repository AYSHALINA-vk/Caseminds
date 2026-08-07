import { useState, useEffect } from "react"

export default function Landing({ onEnter }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="landing-page">
      <style>{`
        .landing-page * { box-sizing: border-box; margin: 0; padding: 0; }
        .landing-page {
          font-family: 'Inter', -apple-system, sans-serif;
          background: #0a0b0f;
          color: #e8eaf0;
          line-height: 1.6;
        }
        .landing-page nav {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 100;
          background: rgba(10,11,15,0.95);
          border-bottom: 0.5px solid ${scrolled ? "#2d2250" : "#232636"};
          padding: 16px 40px;
          display: flex; align-items: center; justify-content: space-between;
          backdrop-filter: blur(10px);
          transition: border-color 0.2s;
        }
        .landing-page .nav-logo { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
        .landing-page .nav-logo span { color: #7c5cfc; }
        .landing-page .nav-links { display: flex; gap: 32px; list-style: none; align-items: center; }
        .landing-page .nav-links a {
          color: #9aa0b8; text-decoration: none; font-size: 13px;
          font-weight: 500; transition: color 0.2s; cursor: pointer;
        }
        .landing-page .nav-links a:hover { color: #e8eaf0; }
        .landing-page .nav-cta {
          background: #7c5cfc; color: white !important;
          padding: 8px 20px; border-radius: 8px; font-weight: 600 !important;
        }
        .landing-page .nav-cta:hover { background: #6a4de8; color: white !important; }
        .landing-page .hero {
          min-height: 100vh; display: flex; align-items: center;
          justify-content: center; text-align: center;
          padding: 120px 24px 80px; position: relative; overflow: hidden;
        }
        .landing-page .hero::before {
          content: ''; position: absolute; top: 20%; left: 50%;
          transform: translateX(-50%); width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(124,92,252,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .landing-page .hero-badge {
          display: inline-block; background: #0f0a1a; border: 0.5px solid #2d2250;
          border-radius: 20px; padding: 6px 16px; font-size: 12px; font-weight: 600;
          color: #7c5cfc; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px;
        }
        .landing-page .hero h1 {
          font-size: 64px; font-weight: 700; letter-spacing: -0.03em;
          line-height: 1.1; margin-bottom: 16px; max-width: 800px;
        }
        .landing-page .hero h1 span { color: #7c5cfc; }
        .landing-page .hero-subtitle {
          font-size: 20px; color: #9aa0b8; max-width: 600px;
          margin: 0 auto 16px; line-height: 1.6;
        }
        .landing-page .hero-tagline {
          font-size: 16px; color: #7c5cfc; font-style: italic; margin-bottom: 40px;
        }
        .landing-page .hero-buttons {
          display: flex; gap: 12px; justify-content: center;
          flex-wrap: wrap; margin-bottom: 60px;
        }
        .landing-page .btn-primary {
          background: #7c5cfc; color: white; padding: 14px 32px;
          border-radius: 8px; font-size: 15px; font-weight: 600;
          text-decoration: none; cursor: pointer; border: none; transition: background 0.2s;
        }
        .landing-page .btn-primary:hover { background: #6a4de8; }
        .landing-page .btn-secondary {
          background: transparent; color: #e8eaf0; padding: 14px 32px;
          border-radius: 8px; font-size: 15px; font-weight: 600;
          text-decoration: none; border: 0.5px solid #232636;
          cursor: pointer; transition: border-color 0.2s;
        }
        .landing-page .btn-secondary:hover { border-color: #7c5cfc; color: #7c5cfc; }
        .landing-page .stats {
          display: flex; justify-content: center; gap: 48px; flex-wrap: wrap;
        }
        .landing-page .stat-item { text-align: center; }
        .landing-page .security-bar {
          background: #0f0a1a; border: 0.5px solid #2d2250; border-radius: 8px;
          padding: 12px 20px; display: flex; align-items: center; justify-content: center;
          gap: 24px; flex-wrap: wrap; margin: 0 40px 48px; max-width: 1020px;
          margin-left: auto; margin-right: auto;
        }
        .landing-page .security-item {
          font-size: 12px; color: #7c5cfc; font-weight: 600;
          display: flex; align-items: center; gap: 6px;
        }
        .landing-page .section { padding: 80px 40px; max-width: 1100px; margin: 0 auto; }
        .landing-page .section-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.15em;
          text-transform: uppercase; color: #7c5cfc; margin-bottom: 12px;
        }
        .landing-page .section-title {
          font-size: 40px; font-weight: 700; letter-spacing: -0.02em;
          margin-bottom: 16px; line-height: 1.2;
        }
        .landing-page .section-subtitle {
          font-size: 16px; color: #9aa0b8; max-width: 560px;
          margin-bottom: 48px; line-height: 1.7;
        }
        .landing-page .problem-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px; margin-bottom: 48px;
        }
        .landing-page .problem-card {
          background: #111318; border: 0.5px solid #232636; border-radius: 12px; padding: 24px;
        }
        .landing-page .problem-number {
          font-size: 32px; font-weight: 700; color: #ff6b6b;
          margin-bottom: 8px; font-family: monospace;
        }
        .landing-page .problem-title { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
        .landing-page .problem-desc { font-size: 13px; color: #9aa0b8; line-height: 1.6; }
        .landing-page .features-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;
        }
        .landing-page .feature-card {
          background: #111318; border: 0.5px solid #232636; border-radius: 12px;
          padding: 28px; transition: border-color 0.2s;
        }
        .landing-page .feature-card:hover { border-color: #7c5cfc; }
        .landing-page .feature-icon { font-size: 28px; margin-bottom: 16px; }
        .landing-page .feature-title { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
        .landing-page .feature-desc { font-size: 13px; color: #9aa0b8; line-height: 1.7; }
        .landing-page .feature-tag {
          display: inline-block; margin-top: 12px; font-size: 10px; font-weight: 600;
          padding: 3px 10px; border-radius: 4px; background: #0f0a1a; color: #7c5cfc;
          border: 0.5px solid #2d2250; letter-spacing: 0.08em;
        }
        .landing-page .diff-section {
          background: #111318; border: 0.5px solid #232636; border-radius: 16px;
          padding: 48px; margin: 80px auto; max-width: 1100px;
        }
        .landing-page .agents-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 32px;
        }
        .landing-page .agent-card { border-radius: 10px; padding: 24px; }
        .landing-page .agent-a { background: #0a2018; border: 0.5px solid #4caf7d; }
        .landing-page .agent-b { background: #0a1e35; border: 0.5px solid #4a9eff; }
        .landing-page .agent-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; margin-bottom: 16px;
        }
        .landing-page .agent-a .agent-label { color: #4caf7d; }
        .landing-page .agent-b .agent-label { color: #4a9eff; }
        .landing-page .agent-claim {
          display: flex; gap: 8px; margin-bottom: 10px; font-size: 13px; align-items: flex-start;
        }
        .landing-page .check { color: #4caf7d; flex-shrink: 0; }
        .landing-page .cross { color: #4a9eff; flex-shrink: 0; }
        .landing-page .net-bar {
          margin-top: 24px; background: #1a1d26; border: 0.5px solid #232636;
          border-radius: 8px; padding: 16px 20px; display: flex;
          justify-content: space-between; align-items: center; grid-column: 1 / -1;
        }
        .landing-page .net-score { font-size: 24px; font-weight: 700; color: #f5a623; }
        .landing-page .capabilities-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;
        }
        .landing-page .cap-item {
          background: #111318; border: 0.5px solid #232636; border-radius: 8px;
          padding: 16px; display: flex; gap: 12px; align-items: flex-start;
        }
        .landing-page .cap-number {
          font-size: 11px; font-family: monospace; color: #555d7a;
          min-width: 24px; margin-top: 2px;
        }
        .landing-page .cap-text { font-size: 13px; font-weight: 600; }
        .landing-page .cap-desc { font-size: 11px; color: #9aa0b8; margin-top: 2px; }
        .landing-page .tech-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px;
        }
        .landing-page .tech-item {
          background: #111318; border: 0.5px solid #232636; border-radius: 8px;
          padding: 16px; text-align: center;
        }
        .landing-page .tech-name {
          font-size: 14px; font-weight: 700; font-family: monospace;
          color: #7c5cfc; margin-bottom: 4px;
        }
        .landing-page .tech-role { font-size: 11px; color: #555d7a; }
        .landing-page .cta-section {
          text-align: center; padding: 100px 40px; background: #111318;
          border-top: 0.5px solid #232636;
        }
        .landing-page .cta-section h2 {
          font-size: 40px; font-weight: 700; letter-spacing: -0.02em;
          margin-bottom: 16px; max-width: 700px; margin-left: auto; margin-right: auto;
        }
        .landing-page .cta-section p { font-size: 16px; color: #9aa0b8; margin-bottom: 40px; }
        .landing-page footer {
          background: #0a0b0f; border-top: 0.5px solid #232636; padding: 32px 40px;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 16px;
        }
        .landing-page .footer-logo { font-size: 16px; font-weight: 700; }
        .landing-page .footer-logo span { color: #7c5cfc; }
        .landing-page .footer-text { font-size: 12px; color: #555d7a; }
        .landing-page .footer-links { display: flex; gap: 24px; }
        .landing-page .footer-links a { font-size: 12px; color: #555d7a; text-decoration: none; }
        .landing-page .footer-links a:hover { color: #7c5cfc; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav>
        <div className="nav-logo">Case<span>Minds</span></div>
        <ul className="nav-links">
          <li><a onClick={() => scrollToSection("problem")}>Problem</a></li>
          <li><a onClick={() => scrollToSection("features")}>Features</a></li>
          <li><a onClick={() => scrollToSection("capabilities")}>Capabilities</a></li>
          <li><a onClick={() => scrollToSection("tech")}>Tech Stack</a></li>
          <li><a className="nav-cta" onClick={onEnter}>Enter Dashboard</a></li>
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div>
          <div className="hero-badge">Hac'KP 2026 · Kerala Police · ACPIA</div>
          <h1>Case<span>Minds</span></h1>
          <p className="hero-subtitle">
            Agentic AI investigation platform for child protection.
            Built for Kerala Police.
          </p>
          <p className="hero-tagline">
            "AI that finds the connections. You make the call."
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={onEnter}>
              Enter Investigation Dashboard
            </button>
            <a href="https://github.com/AYSHALINA-vk/Caseminds"
               target="_blank" rel="noreferrer" className="btn-secondary">
              View on GitHub →
            </a>
          </div>
          <div className="stats">
            <div className="stat-item">
              <div style={{ fontSize: "28px", fontWeight: 700, color: "#7c5cfc" }}>12</div>
              <div style={{ fontSize: "11px", color: "#555d7a", textTransform: "uppercase", letterSpacing: "0.1em" }}>ACPIA Capabilities</div>
            </div>
            <div className="stat-item">
              <div style={{ fontSize: "28px", fontWeight: 700, color: "#7c5cfc" }}>&lt;60s</div>
              <div style={{ fontSize: "11px", color: "#555d7a", textTransform: "uppercase", letterSpacing: "0.1em" }}>Evidence Processing</div>
            </div>
            <div className="stat-item">
              <div style={{ fontSize: "28px", fontWeight: 700, color: "#7c5cfc" }}>2</div>
              <div style={{ fontSize: "11px", color: "#555d7a", textTransform: "uppercase", letterSpacing: "0.1em" }}>Adversarial Agents</div>
            </div>
            <div className="stat-item">
              <div style={{ fontSize: "28px", fontWeight: 700, color: "#7c5cfc" }}>100%</div>
              <div style={{ fontSize: "11px", color: "#555d7a", textTransform: "uppercase", letterSpacing: "0.1em" }}>On-Premise</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECURITY BAR ── */}
      <div className="security-bar">
        <div className="security-item">🔒 On-premise deployment</div>
        <div className="security-item">🔒 No evidence leaves the network</div>
        <div className="security-item">🔒 SHA-256 chain of custody</div>
        <div className="security-item">🔒 Immutable audit trail</div>
        <div className="security-item">🔒 Role-based access control</div>
      </div>

      {/* ── PROBLEM ── */}
      <section className="section" id="problem">
        <div className="section-label">The Problem</div>
        <h2 className="section-title">
          Investigators are drowning<br/>in digital evidence
        </h2>
        <p className="section-subtitle">
          Child protection investigations involve massive volumes of
          digital evidence across multiple platforms. The evidence
          exists. The connection is missed.
        </p>
        <div className="problem-grid">
          <div className="problem-card">
            <div className="problem-number">50,000+</div>
            <div className="problem-title">Messages per case</div>
            <div className="problem-desc">
              WhatsApp, Telegram, email — manually searched,
              manually cross-referenced, manually understood.
            </div>
          </div>
          <div className="problem-card">
            <div className="problem-number">80%</div>
            <div className="problem-title">Time organizing data</div>
            <div className="problem-desc">
              Only 20% of investigation time is spent
              actually investigating. The rest is data management.
            </div>
          </div>
          <div className="problem-card">
            <div className="problem-number">2</div>
            <div className="problem-title">Different urgency clocks</div>
            <div className="problem-desc">
              Rescue urgency and prosecution urgency are not
              the same. No existing tool separates them.
            </div>
          </div>
        </div>
        <div style={{ background: "#1a0a0a", border: "0.5px solid #ff6b6b", borderRadius: "12px", padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#ff6b6b", marginBottom: "8px" }}>
            The real cost of slow investigation
          </div>
          <div style={{ fontSize: "14px", color: "#9aa0b8", maxWidth: "600px", margin: "0 auto" }}>
            While the investigator chases the wrong suspect — the real one
            has days to flee, destroy evidence, or continue harming the victim.
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section" id="features">
        <div className="section-label">How It Works</div>
        <h2 className="section-title">Four stages.<br/>One platform.</h2>
        <p className="section-subtitle">
          Upload any evidence. CaseMinds processes, argues,
          and surfaces — you decide.
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📥</div>
            <div className="feature-title">Evidence Ingestion</div>
            <div className="feature-desc">
              Any file format — WhatsApp exports, images, call records,
              PDFs, device dumps. SHA-256 hashed on arrival.
              Chain of custody sealed before any AI touches it.
            </div>
            <div className="feature-tag">MIME ROUTING · SHA-256 · AUDIT TRAIL</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <div className="feature-title">Parallel AI Pipelines</div>
            <div className="feature-desc">
              NLP extracts entities. Hash pipeline flags known content.
              Metadata pipeline maps GPS. Synthetic detection catches
              deepfakes. All running simultaneously in under 60 seconds.
            </div>
            <div className="feature-tag">NLP · PHASH · EXIF · EFFICIENTNET</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <div className="feature-title">Evidence Copilot</div>
            <div className="feature-desc">
              Ask questions in Malayalam or English. Get cited answers
              from the actual evidence. Semantic search finds meaning,
              not just keywords — even in Manglish.
            </div>
            <div className="feature-tag">RAG · CHROMADB · MALAYALAM · OLLAMA</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <div className="feature-title">ChronoCase Timeline</div>
            <div className="feature-desc">
              Every timestamp from every source merged into one
              interactive timeline. Suspicious gaps flagged automatically.
              You cannot search for a silence — ChronoCase finds it.
            </div>
            <div className="feature-tag">CROSS-SOURCE · GAP DETECTION · UTC</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <div className="feature-title">Dual Risk Scoring</div>
            <div className="feature-desc">
              Case Risk scores prosecution strength over weeks.
              Active Risk scores current danger over 72 hours.
              Two independent clocks. Rescue urgency never buried
              under case-building volume.
            </div>
            <div className="feature-tag">CASE RISK · ACTIVE RISK · LEADRANK</div>
          </div>
          <div className="feature-card" style={{ borderColor: "#7c5cfc" }}>
            <div className="feature-icon">⚖</div>
            <div className="feature-title">Adversarial Agents</div>
            <div className="feature-desc">
              Agent A builds the prosecution case. Agent B challenges
              every claim with citations from actual pipeline data.
              The investigator sees both — always. The system is
              architecturally incapable of a single false verdict.
            </div>
            <div className="feature-tag" style={{ color: "#7c5cfc", borderColor: "#7c5cfc" }}>
              STRUCTURED JSON · VERIFIED CITATIONS · NO HALLUCINATION
            </div>
          </div>
        </div>
      </section>

      {/* ── ADVERSARIAL AGENTS SECTION ── */}
      <div className="diff-section" id="agents">
        <div className="section-label">The Core Innovation</div>
        <h2 className="section-title" style={{ marginBottom: "8px" }}>
          AI that argues against itself
        </h2>
        <p style={{ fontSize: "16px", color: "#9aa0b8", maxWidth: "560px", lineHeight: 1.7 }}>
          Every other tool gives investigators one confident answer.
          CaseMinds gives them both sides — prosecution and defense —
          so no AI is ever making the decision.
        </p>
        <div className="agents-grid">
          <div className="agent-card agent-a">
            <div className="agent-label">Agent A — Prosecutor</div>
            <div className="agent-claim"><span className="check">✓</span> 47 contacts with victim in 6 days [HIGH]</div>
            <div className="agent-claim"><span className="check">✓</span> Secrecy induction detected [HIGH]</div>
            <div className="agent-claim"><span className="check">✓</span> Physical meeting proposed [HIGH]</div>
            <div className="agent-claim"><span className="check">✓</span> Platform migration to Telegram [MEDIUM]</div>
          </div>
          <div className="agent-card agent-b">
            <div className="agent-label">Agent B — Defender</div>
            <div className="agent-claim"><span className="cross">✗</span> Victim initiated 39 of 47 contacts</div>
            <div className="agent-claim"><span className="cross">✗</span> GPS accuracy 800m — not court admissible</div>
            <div className="agent-claim"><span className="cross">✗</span> Platform migration common for privacy</div>
            <div className="agent-claim"><span className="cross">✗</span> Small sample needs corroboration</div>
          </div>
          <div className="net-bar">
            <div>
              <span style={{ fontSize: "13px", color: "#9aa0b8" }}>Net Confidence: </span>
              <span className="net-score">34.1/100</span>
              <span style={{ fontSize: "13px", color: "#9aa0b8", marginLeft: "12px" }}>
                — Gather more evidence before acting
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#555d7a" }}>
              Final decision: Investigator only
            </div>
          </div>
        </div>
      </div>

      {/* ── CAPABILITIES ── */}
      <section className="section" id="capabilities">
        <div className="section-label">Coverage</div>
        <h2 className="section-title">All 12 ACPIA capabilities<br/>Covered.</h2>
        <p className="section-subtitle">
          Every requirement from the Kerala Police problem statement
          maps to a specific CaseMinds module.
        </p>
        <div className="capabilities-grid">
          {[
            ["01", "Content Analysis", "NLP Pipeline"],
            ["02", "Threat Identification", "Hash Matching"],
            ["03", "Source Correlation", "Knowledge Graph"],
            ["04", "Contextual Extraction", "Evidence Copilot"],
            ["05", "Activity Pattern", "Active Risk Scorer"],
            ["06", "Metadata Mapping", "EXIF Pipeline"],
            ["07", "Synthetic Detection", "EfficientNet"],
            ["08", "Timeline Reconstruction", "ChronoCase"],
            ["09", "Intelligent Retrieval", "RAG + ChromaDB"],
            ["10", "Automated Reporting", "Court Report"],
            ["11", "Risk Assessment", "Dual Scoring"],
            ["12", "Intelligence Fusion", "Agentic Orchestrator"],
          ].map(([num, text, desc]) => (
            <div className="cap-item" key={num}>
              <div className="cap-number">{num}</div>
              <div>
                <div className="cap-text">{text}</div>
                <div className="cap-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section className="section" id="tech">
        <div className="section-label">Technology</div>
        <h2 className="section-title">Built to deploy.<br/>Not just to demo.</h2>
        <p className="section-subtitle">
          Open source. On-premise where it counts.
          No evidence ever leaves the police network.
        </p>
        <div className="tech-grid">
          {[
            ["FastAPI", "Backend API"],
            ["React", "Frontend UI"],
            ["Ollama", "Local LLM"],
            ["SQLite / Postgres", "Case Data"],
            ["Docker", "Deployment"],
          ].map(([name, role]) => (
            <div className="tech-item" key={name}>
              <div className="tech-name">{name}</div>
              <div className="tech-role">{role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <h2>Every hour spent searching evidence is an hour a suspect has to run</h2>
        <p>CaseMinds changes that. One upload. Every connection found. Every decision yours.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={onEnter}>
            Enter Investigation Dashboard
          </button>
          <a href="https://github.com/AYSHALINA-vk/Caseminds"
             target="_blank" rel="noreferrer" className="btn-secondary">
            View GitHub Repository →
          </a>
        </div>
        <p style={{ marginTop: "24px", fontSize: "13px", color: "#555d7a" }}>
          Built for Hac'KP 2026 · Kerala Police · ACPIA Problem Statement
        </p>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-logo">Case<span>Minds</span></div>
        <div className="footer-text">
          Hac'KP 2026 · Kerala Police · ACPIA · Built by Aysha
        </div>
        <div className="footer-links">
          <a href="https://github.com/AYSHALINA-vk/Caseminds" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
