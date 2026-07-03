import { useState, useEffect } from "react";

const GOAL = 10;

const PLATFORM_COLORS = {
  Reddit: { bg: "#FF4500", text: "#fff" },
  "X / Twitter": { bg: "#000", text: "#fff" },
  "Blog / Newsletter": { bg: "#0ea5e9", text: "#fff" },
  "Product Directory": { bg: "#8b5cf6", text: "#fff" },
  LinkedIn: { bg: "#0077b5", text: "#fff" },
  Other: { bg: "#6b7280", text: "#fff" },
};

const STATUS_STYLES = {
  Sent: { bg: "#fef9c3", text: "#854d0e", border: "#fde047" },
  Replied: { bg: "#d1fae5", text: "#065f46", border: "#34d399" },
  Converted: { bg: "#ede9fe", text: "#5b21b6", border: "#a78bfa" },
  "No Response": { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
};

const TYPE_LABELS = {
  user: "User Outreach",
  backlink: "Backlink Target",
  content: "Content Placement",
};

const INITIAL_ENTRIES = [];

export default function OutreachTracker() {
  const [entries, setEntries] = useState(() => {
    try {
      const saved = sessionStorage.getItem("seeker_outreach");
      return saved ? JSON.parse(saved) : INITIAL_ENTRIES;
    } catch { return INITIAL_ENTRIES; }
  });

  const [showForm, setShowForm] = useState(false);
  const [showClaude, setShowClaude] = useState(false);
  const [claudeInput, setClaudeInput] = useState("");
  const [claudeResult, setClaudeResult] = useState("");
  const [claudeLoading, setClaudeLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    platform: "Reddit",
    type: "user",
    target: "",
    postUrl: "",
    message: "",
    status: "Sent",
    notes: "",
  });

  useEffect(() => {
    try { sessionStorage.setItem("seeker_outreach", JSON.stringify(entries)); } catch {}
  }, [entries]);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayEntries = entries.filter(e => e.date === todayStr);
  const todayCount = todayEntries.length;
  const totalReplies = entries.filter(e => e.status === "Replied" || e.status === "Converted").length;
  const totalConverted = entries.filter(e => e.status === "Converted").length;
  const backlinks = entries.filter(e => e.type === "backlink").length;
  const replyRate = entries.length > 0 ? Math.round((totalReplies / entries.length) * 100) : 0;

  function handleSubmit() {
    if (!form.target.trim()) return;
    if (editId !== null) {
      setEntries(prev => prev.map(e => e.id === editId ? { ...form, id: editId } : e));
      setEditId(null);
    } else {
      setEntries(prev => [{ ...form, id: Date.now() }, ...prev]);
    }
    setForm({ date: todayStr, platform: "Reddit", type: "user", target: "", postUrl: "", message: "", status: "Sent", notes: "" });
    setShowForm(false);
  }

  function handleEdit(entry) {
    setForm({ ...entry });
    setEditId(entry.id);
    setShowForm(true);
  }

  function handleStatusChange(id, status) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  }

  function handleDelete(id) {
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  async function runClaude() {
    if (!claudeInput.trim()) return;
    setClaudeLoading(true);
    setClaudeResult("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an outreach specialist for SEEKER (seekerscore.com), a career intelligence tool that matches resumes against live job postings and shows users where they rank in the real job market — not just against one job description. It's free with no signup required and resumes are deleted after analysis.

Your job is to analyze a social media post or profile and:
1. Assess if this person is a good outreach target (score 1-5, where 5 = perfect fit)
2. Identify their pain point in one sentence
3. Write a short, personalized, non-spammy outreach message (2-3 sentences max) that references their specific situation and introduces SEEKER naturally
4. Flag if they have backlink potential (blogger, newsletter writer, influencer, etc.)

Format your response as:
FIT SCORE: X/5
PAIN POINT: [one sentence]
BACKLINK POTENTIAL: Yes / No
OUTREACH MESSAGE:
[message here]`,
          messages: [{ role: "user", content: claudeInput }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "No response.";
      setClaudeResult(text);

      // Auto-fill message if extracted
      const msgMatch = text.match(/OUTREACH MESSAGE:\n([\s\S]+)/);
      if (msgMatch) {
        setForm(prev => ({ ...prev, message: msgMatch[1].trim() }));
      }
    } catch (e) {
      setClaudeResult("Error connecting to Claude. Try again.");
    }
    setClaudeLoading(false);
  }

  const filtered = entries.filter(e => {
    if (filterStatus !== "All" && e.status !== filterStatus) return false;
    if (filterType !== "All" && e.type !== filterType) return false;
    return true;
  });

  const progress = Math.min((todayCount / GOAL) * 100, 100);

  return (
    <div style={{ fontFamily: "'DM Mono', 'Courier New', monospace", background: "#0f0f13", minHeight: "100vh", color: "#e2e8f0", padding: "0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0f0f13; } ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 2px; }
        input, textarea, select { outline: none; }
        button { cursor: pointer; }
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", borderBottom: "1px solid #7c3aed33", padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            SEEKER <span style={{ color: "#7c3aed" }}>/ OUTREACH</span>
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3, letterSpacing: "0.05em" }}>TARGET · TEST · IMPROVE</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setShowClaude(!showClaude); setShowForm(false); }} style={{ background: showClaude ? "#7c3aed" : "#1e1e2e", color: showClaude ? "#fff" : "#a78bfa", border: "1px solid #7c3aed55", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontFamily: "inherit", fontWeight: 500, transition: "all 0.2s" }}>
            ✦ Claude Assist
          </button>
          <button onClick={() => { setShowForm(!showForm); setShowClaude(false); setEditId(null); setForm({ date: todayStr, platform: "Reddit", type: "user", target: "", postUrl: "", message: "", status: "Sent", notes: "" }); }} style={{ background: showForm ? "#5b21b6" : "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontFamily: "inherit", fontWeight: 500, transition: "all 0.2s" }}>
            {showForm ? "✕ Cancel" : "+ Log Outreach"}
          </button>
        </div>
      </div>

      <div style={{ padding: "24px 28px", maxWidth: 960, margin: "0 auto" }}>

        {/* Daily Progress */}
        <div style={{ background: "#1a1a2e", border: "1px solid #7c3aed33", borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.08em", textTransform: "uppercase" }}>Today's Progress</div>
              <div style={{ fontSize: 28, fontWeight: 500, color: "#fff", marginTop: 2 }}>{todayCount} <span style={{ fontSize: 16, color: "#6b7280" }}>/ {GOAL} actions</span></div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>{todayCount >= GOAL ? "🎯 Goal reached!" : `${GOAL - todayCount} more to go`}</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: todayCount >= GOAL ? "#34d399" : "#f59e0b" }}>{Math.round(progress)}%</div>
            </div>
          </div>
          <div style={{ background: "#0f0f13", borderRadius: 4, height: 6, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: todayCount >= GOAL ? "linear-gradient(90deg, #34d399, #059669)" : "linear-gradient(90deg, #7c3aed, #a78bfa)", borderRadius: 4, transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total Sent", value: entries.length, color: "#e2e8f0" },
            { label: "Reply Rate", value: `${replyRate}%`, color: "#34d399" },
            { label: "Converted", value: totalConverted, color: "#a78bfa" },
            { label: "Backlink Targets", value: backlinks, color: "#60a5fa" },
          ].map(s => (
            <div key={s.label} style={{ background: "#1a1a2e", border: "1px solid #ffffff0f", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 500, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Claude Assist Panel */}
        {showClaude && (
          <div className="fade-in" style={{ background: "#1a1a2e", border: "1px solid #7c3aed55", borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 8, height: 8, background: "#7c3aed", borderRadius: "50%" }} className="pulse" />
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.06em" }}>CLAUDE PROSPECT ANALYZER</div>
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 12 }}>Paste a Reddit post, X post, or bio. Claude will score the fit, identify the pain point, and draft a personalized outreach message.</div>
            <textarea value={claudeInput} onChange={e => setClaudeInput(e.target.value)} placeholder="Paste post or profile text here..." rows={4} style={{ width: "100%", background: "#0f0f13", border: "1px solid #ffffff15", borderRadius: 8, padding: "12px 14px", color: "#e2e8f0", fontSize: 12, fontFamily: "inherit", resize: "vertical", marginBottom: 10 }} />
            <button onClick={runClaude} disabled={claudeLoading || !claudeInput.trim()} style={{ background: claudeLoading ? "#374151" : "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 12, fontFamily: "inherit", fontWeight: 500, opacity: claudeLoading ? 0.7 : 1, transition: "all 0.2s" }}>
              {claudeLoading ? "Analyzing..." : "✦ Analyze Prospect"}
            </button>
            {claudeResult && (
              <div style={{ marginTop: 14, background: "#0f0f13", border: "1px solid #7c3aed33", borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: 11, color: "#7c3aed", letterSpacing: "0.06em", marginBottom: 8, fontWeight: 500 }}>CLAUDE ANALYSIS</div>
                <pre style={{ fontSize: 12, color: "#cbd5e1", whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.7 }}>{claudeResult}</pre>
                <div style={{ marginTop: 10, fontSize: 11, color: "#6b7280" }}>✓ Outreach message auto-filled in the log form below if open.</div>
              </div>
            )}
          </div>
        )}

        {/* Log Form */}
        {showForm && (
          <div className="fade-in" style={{ background: "#1a1a2e", border: "1px solid #ffffff15", borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.06em", marginBottom: 16 }}>{editId ? "EDIT ENTRY" : "LOG OUTREACH ACTION"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              {[
                { label: "Date", key: "date", type: "date" },
                { label: "Platform", key: "platform", type: "select", options: Object.keys(PLATFORM_COLORS) },
                { label: "Type", key: "type", type: "select", options: Object.keys(TYPE_LABELS) },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{f.label}</div>
                  {f.type === "select" ? (
                    <select value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: "100%", background: "#0f0f13", border: "1px solid #ffffff15", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 12, fontFamily: "inherit" }}>
                      {f.options.map(o => <option key={o} value={o}>{f.key === "type" ? TYPE_LABELS[o] : o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: "100%", background: "#0f0f13", border: "1px solid #ffffff15", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 12, fontFamily: "inherit" }} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              {[
                { label: "Target (username / site)", key: "target", placeholder: "e.g. u/frustrated_dev or techblog.com" },
                { label: "Post / Profile URL", key: "postUrl", placeholder: "https://..." },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{f.label}</div>
                  <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", background: "#0f0f13", border: "1px solid #ffffff15", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 12, fontFamily: "inherit" }} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Message Sent</div>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Paste the message you sent..." rows={3} style={{ width: "100%", background: "#0f0f13", border: "1px solid #ffffff15", borderRadius: 8, padding: "10px 12px", color: "#e2e8f0", fontSize: 12, fontFamily: "inherit", resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Status</div>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={{ width: "100%", background: "#0f0f13", border: "1px solid #ffffff15", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 12, fontFamily: "inherit" }}>
                  {Object.keys(STATUS_STYLES).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Notes</div>
                <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any context or follow-up reminders..." style={{ width: "100%", background: "#0f0f13", border: "1px solid #ffffff15", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 12, fontFamily: "inherit" }} />
              </div>
            </div>
            <button onClick={handleSubmit} disabled={!form.target.trim()} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 12, fontFamily: "inherit", fontWeight: 500, opacity: form.target.trim() ? 1 : 0.5 }}>
              {editId ? "Save Changes" : "Log Action"}
            </button>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {["All", ...Object.keys(STATUS_STYLES)].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ background: filterStatus === s ? "#7c3aed" : "#1a1a2e", color: filterStatus === s ? "#fff" : "#6b7280", border: `1px solid ${filterStatus === s ? "#7c3aed" : "#ffffff15"}`, borderRadius: 6, padding: "5px 12px", fontSize: 11, fontFamily: "inherit", transition: "all 0.15s" }}>{s}</button>
          ))}
          <div style={{ width: 1, background: "#ffffff15", margin: "0 4px" }} />
          {["All", ...Object.keys(TYPE_LABELS)].map(t => (
            <button key={t} onClick={() => setFilterType(t)} style={{ background: filterType === t ? "#1e293b" : "transparent", color: filterType === t ? "#60a5fa" : "#6b7280", border: `1px solid ${filterType === t ? "#60a5fa55" : "#ffffff0f"}`, borderRadius: 6, padding: "5px 12px", fontSize: 11, fontFamily: "inherit", transition: "all 0.15s" }}>{t === "All" ? "All Types" : TYPE_LABELS[t]}</button>
          ))}
        </div>

        {/* Entries */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#374151" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>◎</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "#4b5563", marginBottom: 6 }}>No outreach logged yet</div>
            <div style={{ fontSize: 12, color: "#374151" }}>Use Claude Assist to find prospects, then log your first action</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(e => {
              const pc = PLATFORM_COLORS[e.platform] || PLATFORM_COLORS.Other;
              const sc = STATUS_STYLES[e.status] || STATUS_STYLES.Sent;
              return (
                <div key={e.id} className="fade-in" style={{ background: "#1a1a2e", border: "1px solid #ffffff0a", borderRadius: 10, padding: "14px 16px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "start" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", paddingTop: 2 }}>
                    <div style={{ background: pc.bg, color: pc.text, fontSize: 9, fontWeight: 600, padding: "3px 7px", borderRadius: 4, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{e.platform}</div>
                    <div style={{ fontSize: 9, color: "#4b5563", letterSpacing: "0.04em" }}>{e.date}</div>
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{e.target}</div>
                      <div style={{ fontSize: 9, color: "#6b7280", background: "#ffffff08", padding: "2px 6px", borderRadius: 4 }}>{TYPE_LABELS[e.type]}</div>
                    </div>
                    {e.postUrl && <div style={{ fontSize: 11, color: "#7c3aed", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.postUrl}</div>}
                    {e.message && <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6, marginBottom: e.notes ? 6 : 0, background: "#ffffff05", borderRadius: 6, padding: "8px 10px", borderLeft: "2px solid #7c3aed33" }}>{e.message}</div>}
                    {e.notes && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>📝 {e.notes}</div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                    <select value={e.status} onChange={ev => handleStatusChange(e.id, ev.target.value)} style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, borderRadius: 6, padding: "4px 8px", fontSize: 10, fontFamily: "inherit", fontWeight: 600, cursor: "pointer" }}>
                      {Object.keys(STATUS_STYLES).map(s => <option key={s}>{s}</option>)}
                    </select>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleEdit(e)} style={{ background: "transparent", color: "#6b7280", border: "1px solid #ffffff0f", borderRadius: 5, padding: "3px 8px", fontSize: 10, fontFamily: "inherit" }}>Edit</button>
                      <button onClick={() => handleDelete(e.id)} style={{ background: "transparent", color: "#ef4444", border: "1px solid #ef444422", borderRadius: 5, padding: "3px 8px", fontSize: 10, fontFamily: "inherit" }}>✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
