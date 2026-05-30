import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal, Lock, Mail, Compass, Award, ShieldAlert, Check, Plus, Trash2, Edit, LogOut, ArrowLeft, X } from "lucide-react";
import { supabase } from "../supabase";


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("projects"); // "projects" or "messages"

  // Data states
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);

  // Project Form State
  const [projectForm, setProjectForm] = useState({ id: null, title: "", description: "", tech_stack: "", live_url: "", github_url: "", thumbnail_url: "", date: "" });
  const [projectFormOpen, setProjectFormOpen] = useState(false);

  // Check auth state from sessionStorage
  useEffect(() => {
    const localSession = sessionStorage.getItem("admin_session");
    if (localSession) {
      setSession(JSON.parse(localSession));
    } else {
      // If someone is not authenticated and tries to go to /admin, redirect them back to /
      window.location.href = "/";
      return;
    }

    const checkSession = () => {
      const sess = sessionStorage.getItem("admin_session");
      if (!sess) {
        window.location.href = "/";
      } else {
        setSession(JSON.parse(sess));
      }
    };

    window.addEventListener("storage", checkSession);
    window.addEventListener("admin_auth_change", checkSession);

    return () => {
      window.removeEventListener("storage", checkSession);
      window.removeEventListener("admin_auth_change", checkSession);
    };
  }, []);

  // Fetch Projects & Messages from localStorage
  const fetchCMSData = () => {
    // 1. Projects
    let localProjs = localStorage.getItem("portfolio_projects");
    if (!localProjs) {
      const initialProjects = [
        {
          id: "campuslink",
          title: "CampusLink",
          description: "A comprehensive full-stack campus community web application custom engineered for Vidyavardhaka College of Engineering (VVCE) students. Features include an active peer Marketplace, Event coordinates, open discussion Forum boards, group messaging nodes, and personal Connection Wishlists.",
          tech_stack: ["React + Vite", "Node.js", "Express.js", "Supabase", "PostgreSQL"],
          github_url: "https://github.com/ajayotaku2-dev/CampusLink",
          live_url: "#",
          date: "2025"
        },
        {
          id: "campusfinance",
          title: "CampusFinance",
          description: "A student-centric financial micro-budgeting dashboard built under tight hackathon timelines. Empowers students to log daily expenditures, track scholarship/grant allocations, and visualize monthly budgeting structures to curb college costs.",
          tech_stack: ["React", "Node.js", "Express.js", "Supabase"],
          github_url: "https://github.com/ajayotaku2-dev/CampusFinance",
          live_url: "#",
          date: "2024"
        }
      ];
      localStorage.setItem("portfolio_projects", JSON.stringify(initialProjects));
      localProjs = JSON.stringify(initialProjects);
    }
    try {
      setProjects(JSON.parse(localProjs));
    } catch (e) {
      setProjects([]);
    }

    // 2. Transmissions
    let localMsgs = localStorage.getItem("portfolio_messages");
    if (!localMsgs) {
      const initialMessages = [
        {
          id: "msg1",
          name: "Asuka Langley",
          email: "asuka@nerv.org",
          message: "Hey Ajay! This is a secure visitor transmission system check. /// SIGNAL_OUT",
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem("portfolio_messages", JSON.stringify(initialMessages));
      localMsgs = JSON.stringify(initialMessages);
    }
    try {
      setMessages(JSON.parse(localMsgs));
    } catch (e) {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCMSData();
    }
  }, [session]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    setTimeout(() => {
      if (email.trim().toLowerCase() === "tvajay0@gmail.com") {
        const fakeSession = { user: { email: "tvajay0@gmail.com" } };
        sessionStorage.setItem("admin_session", JSON.stringify(fakeSession));
        window.dispatchEvent(new Event("admin_auth_change"));
        setSession(fakeSession);
      } else {
        setErrorMsg("Unauthorized administrator coordinates.");
      }
      setLoading(false);
    }, 600);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signout failed", e);
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('/');
  };

  // ==========================================
  // PROJECTS CRUD
  // ==========================================
  const handleSaveProject = (e) => {
    e.preventDefault();
    const payload = {
      id: projectForm.id || Math.random().toString(36).substr(2, 9),
      title: projectForm.title,
      description: projectForm.description,
      tech_stack: projectForm.tech_stack.split(",").map(t => t.trim()).filter(Boolean),
      live_url: projectForm.live_url || "#",
      github_url: projectForm.github_url || "#",
      thumbnail_url: projectForm.thumbnail_url || "",
      date: projectForm.date || ""
    };

    let updatedProjectsList;
    if (projectForm.id) {
      updatedProjectsList = projects.map(p => p.id === projectForm.id ? payload : p);
    } else {
      updatedProjectsList = [...projects, payload];
    }

    localStorage.setItem("portfolio_projects", JSON.stringify(updatedProjectsList));
    setProjects(updatedProjectsList);
    setProjectFormOpen(false);
    setProjectForm({ id: null, title: "", description: "", tech_stack: "", live_url: "", github_url: "", thumbnail_url: "", date: "" });
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

  const handleDeleteProject = (id, title) => {
    if (!window.confirm(`DISSOLVE PROJECT NODE: "${title}"?`)) return;
    const updated = projects.filter(p => p.id !== id);
    localStorage.setItem("portfolio_projects", JSON.stringify(updated));
    setProjects(updated);
  };

  // ==========================================
  // MESSAGES CRUD
  // ==========================================
  const handleDeleteMessage = (id, name) => {
    if (!window.confirm(`DISSOLVE VISITOR TRANSMISSION FROM "${name.toUpperCase()}"?`)) return;
    const updated = messages.filter(m => m.id !== id);
    localStorage.setItem("portfolio_messages", JSON.stringify(updated));
    setMessages(updated);
  };

  if (!session) {
    // 1. Secured Login Shell
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "var(--bg-darker)" }}>
        <div className="cyber-grid" />
        <div className="hud-panel cyber-scanlines glitch-border" style={{ width: "100%", maxWidth: "420px", background: "var(--bg-panel-solid)", padding: "32px", zIndex: 10 }}>
          <div className="hud-panel-bottom" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0, 210, 255, 0.2)", paddingBottom: "12px", marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Terminal size={18} style={{ color: "var(--accent-purple)" }} />
              <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.95rem", letterSpacing: "2px", fontWeight: "700", color: "#fff" }}>
                AJAY_CMS_COCKPIT
              </span>
            </div>
            <button type="button" onClick={() => navigate("/")} className="hud-btn" style={{ padding: "4px 10px", fontSize: "0.6rem", display: "flex", alignItems: "center", gap: "4px" }}>
              <ArrowLeft size={10} /> BACK
            </button>
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
            <button onClick={() => window.location.replace('/')} className="hud-btn" style={{ padding: "8px 16px", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <ArrowLeft size={12} /> BACK_TO_SITE
            </button>
            <button onClick={handleLogout} className="hud-btn hud-btn-purple" style={{ padding: "8px 16px", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <LogOut size={12} /> EXIT_SYS
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
          <button
            onClick={() => { setActiveTab("projects"); setProjectFormOpen(false); }}
            className={`hud-btn ${activeTab === "projects" ? "" : "hud-btn-purple"}`}
            style={{ flexGrow: 1, padding: "12px", background: activeTab === "projects" ? "var(--accent-cyan)" : "transparent", borderColor: activeTab === "projects" ? "var(--accent-cyan)" : "rgba(189,0,255,0.3)", color: activeTab === "projects" ? "var(--bg-darker)" : "#fff" }}
          >
            MANAGE PROJECTS ({projects.length})
          </button>
          <button
            onClick={() => { setActiveTab("messages"); setProjectFormOpen(false); }}
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
