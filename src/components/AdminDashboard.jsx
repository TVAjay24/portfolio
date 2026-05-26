import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { Terminal, Lock, Mail, Compass, Award, ShieldAlert, Check, Plus, Trash2, Edit, LogOut, ArrowLeft, ToggleLeft, ToggleRight, X, Code, Server, Database, Settings } from "lucide-react";

export const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : (import.meta.env.VITE_API_BASE || "");

const AdminDashboard = () => {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("projects"); // "projects", "skills", or "messages"

  // Data states
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [messages, setMessages] = useState([]);

  // Project Form State
  const [projectForm, setProjectForm] = useState({ id: null, title: "", description: "", tech_stack: "", live_url: "", github_url: "", thumbnail_url: "", date: "" });
  const [projectFormOpen, setProjectFormOpen] = useState(false);

  // Skill Form State
  const [skillForm, setSkillForm] = useState({ id: null, category: "languages", name: "", level: 80, description: "" });
  const [skillFormOpen, setSkillFormOpen] = useState(false);

  // Check auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Projects, Skills, & Messages
  const fetchCMSData = async () => {
    try {
      // Fetch Projects from Supabase directly for CMS (realtime)
      const { data: projData, error: projErr } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (projErr) throw projErr;
      setProjects(projData || []);

      // Fetch Skills from Supabase directly
      const { data: skillData, error: skillErr } = await supabase
        .from("skills")
        .select("*")
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true });
      if (skillErr) throw skillErr;
      setSkills(skillData || []);

      // Fetch Contact Messages from Supabase directly
      const { data: msgData, error: msgErr } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (msgErr) throw msgErr;
      setMessages(msgData || []);
    } catch (err) {
      console.error("CMS Sync Error:", err.message);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCMSData();
    }
  }, [session]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // ==========================================
  // PROJECTS CRUD
  // ==========================================
  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: projectForm.title,
        description: projectForm.description,
        tech_stack: projectForm.tech_stack.split(",").map(t => t.trim()).filter(Boolean),
        live_url: projectForm.live_url || "#",
        github_url: projectForm.github_url || "#",
        thumbnail_url: projectForm.thumbnail_url || "",
        date: projectForm.date || ""
      };

      if (projectForm.id) {
        // Edit existing
        const { error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", projectForm.id);
        if (error) throw error;
      } else {
        // Add new
        const { error } = await supabase
          .from("projects")
          .insert([payload]);
        if (error) throw error;
      }

      setProjectFormOpen(false);
      setProjectForm({ id: null, title: "", description: "", tech_stack: "", live_url: "", github_url: "", thumbnail_url: "", date: "" });
      fetchCMSData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleEditProjectClick = (p) => {
    setProjectForm({
      id: p.id,
      title: p.title,
      description: p.description,
      tech_stack: p.tech_stack.join(", "),
      live_url: p.live_url,
      github_url: p.github_url,
      thumbnail_url: p.thumbnail_url || "",
      date: p.date || ""
    });
    setProjectFormOpen(true);
  };

  const handleDeleteProject = async (id, title) => {
    if (!window.confirm(`DISSOLVE PROJECT NODE: "${title}"?`)) return;
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      fetchCMSData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // ==========================================
  // SKILLS (ACTIVE ABILITIES) CRUD
  // ==========================================
  const handleSaveSkill = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        category: skillForm.category,
        name: skillForm.name,
        level: parseInt(skillForm.level),
        description: skillForm.description || ""
      };

      if (skillForm.id) {
        // Edit existing
        const { error } = await supabase
          .from("skills")
          .update(payload)
          .eq("id", skillForm.id);
        if (error) throw error;
      } else {
        // Add new
        const catSkills = skills.filter(s => s.category === skillForm.category);
        payload.sort_order = catSkills.length + 1;

        const { error } = await supabase
          .from("skills")
          .insert([payload]);
        if (error) throw error;
      }

      setSkillFormOpen(false);
      setSkillForm({ id: null, category: "languages", name: "", level: 80, description: "" });
      fetchCMSData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleEditSkillClick = (s) => {
    setSkillForm({
      id: s.id,
      category: s.category,
      name: s.name,
      level: s.level,
      description: s.description || ""
    });
    setSkillFormOpen(true);
  };

  const handleDeleteSkill = async (id, name) => {
    if (!window.confirm(`DISSOLVE ABILITY NODE: "${name}"?`)) return;
    try {
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) throw error;
      fetchCMSData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // ==========================================
  // MESSAGES CRUD
  // ==========================================
  const handleDeleteMessage = async (id, name) => {
    if (!window.confirm(`DISSOLVE VISITOR TRANSMISSION FROM "${name.toUpperCase()}"?`)) return;
    try {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
      fetchCMSData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (!session) {
    // 1. Secured Login Shell
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "var(--bg-darker)" }}>
        <div className="cyber-grid" />
        <div className="hud-panel cyber-scanlines glitch-border" style={{ width: "100%", maxWidth: "420px", background: "var(--bg-panel-solid)", padding: "32px", zIndex: 10 }}>
          <div className="hud-panel-bottom" />
          <div style={{ display: "flex", gap: "8px", alignItems: "center", borderBottom: "1px solid rgba(0, 210, 255, 0.2)", paddingBottom: "12px", marginBottom: "20px" }}>
            <Terminal size={18} style={{ color: "var(--accent-purple)" }} />
            <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.95rem", letterSpacing: "2px", fontWeight: "700", color: "#fff" }}>
              AJAY_CMS_COCKPIT
            </span>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontFamily: "var(--font-hud)", fontSize: "0.75rem", color: "var(--accent-cyan)" }}>ADMIN ID</label>
              <div style={{ position: "relative" }}>
                <Mail size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@email.com"
                  style={{ width: "100%", padding: "10px 12px 10px 36px", background: "rgba(8, 15, 30, 0.6)", border: "1px solid rgba(0, 210, 255, 0.25)", color: "#fff", fontSize: "0.9rem", borderRadius: "4px", outline: "none" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontFamily: "var(--font-hud)", fontSize: "0.75rem", color: "var(--accent-cyan)" }}>PASSKEY</label>
              <div style={{ position: "relative" }}>
                <Lock size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", padding: "10px 12px 10px 36px", background: "rgba(8, 15, 30, 0.6)", border: "1px solid rgba(0, 210, 255, 0.25)", color: "#fff", fontSize: "0.9rem", borderRadius: "4px", outline: "none" }}
                />
              </div>
            </div>

            {errorMsg && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ff4a4a", fontFamily: "var(--font-hud)", fontSize: "0.7rem", padding: "8px 12px", border: "1px solid rgba(255, 74, 74, 0.2)", background: "rgba(255, 74, 74, 0.05)", borderRadius: "4px" }}>
                <ShieldAlert size={14} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="hud-btn hud-btn-purple" style={{ width: "100%", padding: "12px", opacity: loading ? 0.5 : 1 }}>
              {loading ? "AUTHORIZING..." : "LOG IN // COCKPIT"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Authenticated Admin Cockpit Mainframe
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-darker)", padding: "80px 24px 60px", color: "#fff", position: "relative" }}>
      <div className="cyber-grid" />
      <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        
        {/* HUD Navigation / Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,210,255,0.2)", paddingBottom: "16px", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-hud)", fontSize: "1.6rem", display: "flex", alignItems: "center", gap: "8px", letterSpacing: "2px" }}>
              <Terminal style={{ color: "var(--accent-cyan)" }} /> SECURE_CMS_COCKPIT
            </h1>
            <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.65rem", color: "var(--accent-purple)", letterSpacing: "1.5px" }}>[ SESSION_ACTIVE // AJAY ]</span>
          </div>
          
          <div style={{ display: "flex", gap: "12px" }}>
            <a href="/" style={{ textDecoration: "none" }}>
              <button className="hud-btn" style={{ padding: "8px 16px", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "6px" }}>
                <ArrowLeft size={12} /> BACK_TO_SITE
              </button>
            </a>
            <button onClick={handleLogout} className="hud-btn hud-btn-purple" style={{ padding: "8px 16px", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <LogOut size={12} /> LOG_OUT
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
          <button
            onClick={() => { setActiveTab("projects"); setProjectFormOpen(false); setSkillFormOpen(false); }}
            className={`hud-btn ${activeTab === "projects" ? "" : "hud-btn-purple"}`}
            style={{ flexGrow: 1, padding: "12px", background: activeTab === "projects" ? "var(--accent-cyan)" : "transparent", borderColor: activeTab === "projects" ? "var(--accent-cyan)" : "rgba(189,0,255,0.3)", color: activeTab === "projects" ? "var(--bg-darker)" : "#fff" }}
          >
            MANAGE PROJECTS ({projects.length})
          </button>
          <button
            onClick={() => { setActiveTab("skills"); setProjectFormOpen(false); setSkillFormOpen(false); }}
            className={`hud-btn ${activeTab === "skills" ? "" : "hud-btn-purple"}`}
            style={{ flexGrow: 1, padding: "12px", background: activeTab === "skills" ? "var(--accent-purple)" : "transparent", borderColor: activeTab === "skills" ? "var(--accent-purple)" : "rgba(189,0,255,0.3)", color: activeTab === "skills" ? "var(--bg-darker)" : "#fff" }}
          >
            MANAGE SKILLS ({skills.length})
          </button>
          <button
            onClick={() => { setActiveTab("messages"); setProjectFormOpen(false); setSkillFormOpen(false); }}
            className={`hud-btn ${activeTab === "messages" ? "" : "hud-btn-purple"}`}
            style={{ flexGrow: 1, padding: "12px", background: activeTab === "messages" ? "var(--accent-blue)" : "transparent", borderColor: activeTab === "messages" ? "var(--accent-blue)" : "rgba(0,210,255,0.3)", color: activeTab === "messages" ? "var(--bg-darker)" : "#fff" }}
          >
            VISITOR TRANSMISSIONS ({messages.length})
          </button>
        </div>

        {/* ==========================================
            PROJECTS WORKSPACE
           ========================================== */}
        {activeTab === "projects" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {!projectFormOpen ? (
              <>
                <button onClick={() => setProjectFormOpen(true)} className="hud-btn" style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px", alignSelf: "flex-start" }}>
                  <Plus size={14} /> ACTIVATE NEW PROJECT NODE
                </button>

                <div className="hud-panel cyber-scanlines" style={{ padding: "0", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(0,210,255,0.2)", background: "rgba(0,210,255,0.03)" }}>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)" }}>TITLE</th>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)" }}>TECH STACK</th>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)" }}>DATE</th>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)", textAlign: "right" }}>COORDINATES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((p) => (
                        <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "16px", fontWeight: "700" }}>{p.title}</td>
                          <td style={{ padding: "16px", color: "var(--text-secondary)" }}>{p.tech_stack.join(", ")}</td>
                          <td style={{ padding: "16px" }}>{p.date}</td>
                          <td style={{ padding: "16px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button onClick={() => handleEditProjectClick(p)} className="hud-btn" style={{ padding: "4px 8px", fontSize: "0.6rem" }}>
                                <Edit size={10} /> EDIT
                              </button>
                              <button onClick={() => handleDeleteProject(p.id, p.title)} className="hud-btn hud-btn-purple" style={{ padding: "4px 8px", fontSize: "0.6rem", color: "#ff4a4a", borderColor: "#ff4a4a" }}>
                                <Trash2 size={10} /> DISSOLVE
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              // Add / Edit Project Form
              <form onSubmit={handleSaveProject} className="hud-panel cyber-scanlines glitch-border" style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "650px", margin: "0 auto", width: "100%" }}>
                <div className="hud-panel-bottom" />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,210,255,0.2)", paddingBottom: "8px" }}>
                  <span style={{ fontFamily: "var(--font-hud)", color: "var(--accent-cyan)", fontWeight: "700" }}>
                    {projectForm.id ? `[ EDIT_PROJECT // ${projectForm.title.toUpperCase()} ]` : "[ PROJECT_INJECTION_SHELL ]"}
                  </span>
                  <X size={14} style={{ cursor: "pointer" }} onClick={() => { setProjectFormOpen(false); setProjectForm({ id: null, title: "", description: "", tech_stack: "", live_url: "", github_url: "", thumbnail_url: "", date: "" }); }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>PROJECT TITLE</label>
                    <input type="text" required value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>DATE / PERIOD (e.g. 2024)</label>
                    <input type="text" value={projectForm.date} onChange={(e) => setProjectForm({ ...projectForm, date: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>TECH STACK TAGS (comma-separated)</label>
                  <input type="text" required value={projectForm.tech_stack} onChange={(e) => setProjectForm({ ...projectForm, tech_stack: e.target.value })} placeholder="React, Node.js, Supabase" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>DESCRIPTION NARRATIVE</label>
                  <textarea required value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} rows="3" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", resize: "none", outline: "none" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>LAUNCH LINK (LIVE)</label>
                    <input type="text" value={projectForm.live_url} onChange={(e) => setProjectForm({ ...projectForm, live_url: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>SOURCE LINK (GITHUB)</label>
                    <input type="text" value={projectForm.github_url} onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>THUMBNAIL IMAGE URL</label>
                  <input type="text" value={projectForm.thumbnail_url} onChange={(e) => setProjectForm({ ...projectForm, thumbnail_url: e.target.value })} placeholder="https://images.unsplash.com/..." style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>

                <button type="submit" className="hud-btn" style={{ padding: "10px 20px", fontSize: "0.75rem", alignSelf: "flex-start", marginTop: "8px" }}>
                  COMPILE_AND_SAVE
                </button>
              </form>
            )}
          </div>
        )}



        {/* ==========================================
            SKILLS WORKSPACE
           ========================================== */}
        {activeTab === "skills" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {!skillFormOpen ? (
              <>
                <button onClick={() => setSkillFormOpen(true)} className="hud-btn" style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px", alignSelf: "flex-start", borderColor: "var(--accent-purple)" }}>
                  <Plus size={14} /> ACTIVATE NEW ABILITY NODE
                </button>

                <div className="hud-panel cyber-scanlines" style={{ padding: "24px", background: "rgba(6,12,24,0.4)" }}>
                  <div className="hud-panel-bottom" style={{ borderColor: "transparent var(--accent-purple) var(--accent-purple) transparent" }} />
                  
                  {["languages", "frontend", "backend", "database", "tools"].map((cat) => {
                    const catSkills = skills.filter((s) => s.category === cat);
                    const catLabel = cat === "tools" ? "SYSTEM TOOLS" : cat.toUpperCase();
                    
                    return (
                      <div key={cat} style={{ marginBottom: "32px" }}>
                        <h3 style={{ fontFamily: "var(--font-hud)", fontSize: "1rem", color: "var(--accent-cyan)", borderBottom: "1px solid rgba(0,210,255,0.1)", paddingBottom: "6px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                          {cat === "languages" && <Terminal size={14} />}
                          {cat === "frontend" && <Code size={14} />}
                          {cat === "backend" && <Server size={14} />}
                          {cat === "database" && <Database size={14} />}
                          {cat === "tools" && <Settings size={14} />}
                          {catLabel} ({catSkills.length})
                        </h3>

                        {catSkills.length === 0 ? (
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "12px", fontFamily: "var(--font-hud)", background: "rgba(0,0,0,0.2)", borderRadius: "4px" }}>
                            [ NO_ACTIVE_NODES_IN_THIS_GRID ]
                          </div>
                        ) : (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                            {catSkills.map((s) => (
                              <div key={s.id} className="hud-panel" style={{ padding: "16px", background: "rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", gap: "10px", borderLeft: "3px solid var(--accent-purple)", position: "relative" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontWeight: "700", fontSize: "0.9rem" }}>{s.name}</span>
                                  <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.75rem", color: "var(--accent-purple)", fontWeight: "900" }}>LV. {s.level}</span>
                                </div>
                                <div className="hud-bar-container" style={{ height: "6px" }}>
                                  <div className="hud-bar-fill hud-bar-fill-purple" style={{ width: `${s.level}%` }} />
                                </div>
                                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.4", flexGrow: 1 }}>{s.description}</p>
                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "8px", marginTop: "4px" }}>
                                  <button onClick={() => handleEditSkillClick(s)} className="hud-btn" style={{ padding: "3px 6px", fontSize: "0.55rem", borderColor: "rgba(0,210,255,0.4)" }}>
                                    <Edit size={8} /> EDIT
                                  </button>
                                  <button onClick={() => handleDeleteSkill(s.id, s.name)} className="hud-btn hud-btn-purple" style={{ padding: "3px 6px", fontSize: "0.55rem", color: "#ff4a4a", borderColor: "#ff4a4a" }}>
                                    <Trash2 size={8} /> DISSOLVE
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              // Add / Edit Skill Form
              <form onSubmit={handleSaveSkill} className="hud-panel cyber-scanlines glitch-border" style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "550px", margin: "0 auto", width: "100%", background: "rgba(9, 18, 37, 0.8)", padding: "24px" }}>
                <div className="hud-panel-bottom" style={{ borderColor: "transparent var(--accent-purple) var(--accent-purple) transparent" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(189,0,255,0.2)", paddingBottom: "8px" }}>
                  <span style={{ fontFamily: "var(--font-hud)", color: "var(--accent-purple)", fontWeight: "700" }}>
                    {skillForm.id ? `[ EDIT_ABILITY // ${skillForm.name.toUpperCase()} ]` : "[ ABILITY_NODE_INJECTION_SHELL ]"}
                  </span>
                  <X size={14} style={{ cursor: "pointer" }} onClick={() => { setSkillFormOpen(false); setSkillForm({ id: null, category: "languages", name: "", level: 80, description: "" }); }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>NODE CATEGORY</label>
                    <select 
                      value={skillForm.category} 
                      onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })} 
                      style={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none", height: "34px", fontFamily: "var(--font-hud)" }}
                    >
                      <option value="languages">LANGUAGES</option>
                      <option value="frontend">FRONTEND</option>
                      <option value="backend">BACKEND</option>
                      <option value="database">DATABASE</option>
                      <option value="tools">SYSTEM TOOLS</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>ABILITY NAME (e.g. JavaScript)</label>
                    <input type="text" required value={skillForm.name} onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
                    <span>ABILITY LEVEL</span>
                    <span style={{ color: "var(--accent-purple)" }}>{skillForm.level}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={skillForm.level} 
                    onChange={(e) => setSkillForm({ ...skillForm, level: parseInt(e.target.value) })} 
                    style={{ width: "100%", accentColor: "var(--accent-purple)", background: "rgba(0,0,0,0.5)", cursor: "pointer" }} 
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>FUNCTION DESCRIPTION</label>
                  <textarea required value={skillForm.description} onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })} rows="3" placeholder="Synthesize compiler behavior..." style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", resize: "none", outline: "none" }} />
                </div>

                <button type="submit" className="hud-btn hud-btn-purple" style={{ padding: "10px 20px", fontSize: "0.75rem", alignSelf: "flex-start", marginTop: "8px" }}>
                  COMPILE_AND_SAVE
                </button>
              </form>
            )}
          </div>
        )}



        {/* ==========================================
            VISITOR TRANSMISSIONS WORKSPACE
            ========================================== */}
        {activeTab === "messages" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-hud)", fontSize: "1.1rem", borderBottom: "1px dashed rgba(0,210,255,0.2)", paddingBottom: "8px", color: "var(--accent-blue)" }}>
              VISITOR_TRANSMISSIONS_INBOX
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {messages.length === 0 ? (
                <div className="hud-panel cyber-scanlines" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-hud)" }}>
                  [ INBOX_VACANT // NO_SIGNAL_TRANSMISSIONS_DETECTED ]
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="hud-panel cyber-scanlines glitch-border" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", background: "rgba(6,12,24,0.4)" }}>
                    <div className="hud-panel-bottom" style={{ borderColor: "transparent var(--accent-blue) var(--accent-blue) transparent" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#fff" }}>{m.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", fontFamily: "var(--font-hud)" }}>{m.email}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-hud)" }}>
                          {new Date(m.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).toUpperCase()}
                        </span>
                        <button onClick={() => handleDeleteMessage(m.id, m.name)} className="hud-btn hud-btn-purple" style={{ padding: "4px 8px", fontSize: "0.6rem", color: "#ff4a4a", borderColor: "#ff4a4a" }}>
                          DISSOLVE
                        </button>
                      </div>
                    </div>
                    <div className="diagonal-stripes" style={{ height: "2px", opacity: 0.3 }} />
                    <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                      {m.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
