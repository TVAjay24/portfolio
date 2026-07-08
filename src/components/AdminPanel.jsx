import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal, Lock, Mail, ShieldAlert, Check, Plus, Trash2, Edit, LogOut, ArrowLeft, X, BookOpen, Layers, User, Award } from "lucide-react";
import { supabase } from "../supabase";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("projects"); // "projects", "skills", "about"

  // Data lists
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [aboutRecord, setAboutRecord] = useState(null);

  // Form states
  const [projectForm, setProjectForm] = useState({ id: null, title: "", description: "", tech_stack: "", live_url: "", github_url: "", thumbnail_url: "", featured: false });
  const [projectFormOpen, setProjectFormOpen] = useState(false);

  const [skillForm, setSkillForm] = useState({ id: null, name: "", category: "languages", icon_url: "", proficiency: 4, sort_order: 0 });
  const [skillFormOpen, setSkillFormOpen] = useState(false);

  const [aboutForm, setAboutForm] = useState({ id: null, bio: "", tagline: "", resume_url: "", profile_image_url: "" });

  // Initial Auth Check
  useEffect(() => {
    const localSession = sessionStorage.getItem("admin_session");
    if (localSession) {
      setSession(JSON.parse(localSession));
    }

    const checkSession = () => {
      const sess = sessionStorage.getItem("admin_session");
      setSession(sess ? JSON.parse(sess) : null);
    };

    window.addEventListener("storage", checkSession);
    window.addEventListener("admin_auth_change", checkSession);

    return () => {
      window.removeEventListener("storage", checkSession);
      window.removeEventListener("admin_auth_change", checkSession);
    };
  }, []);

  // Fetch data on session activation
  useEffect(() => {
    if (session) {
      fetchProjectsData();
      fetchSkillsData();
      fetchAboutData();
    }
  }, [session]);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      } else {
        sessionStorage.setItem("admin_session", JSON.stringify(data.session));
        window.dispatchEvent(new Event("admin_auth_change"));
        setSession(data.session);
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg("Security handshake failed: " + err.message);
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signout failed", e);
    }
    sessionStorage.clear();
    setSession(null);
    window.dispatchEvent(new Event("admin_auth_change"));
    navigate("/");
  };

  // ====================================================================
  // 1. PROJECTS CRUD
  // ====================================================================
  const fetchProjectsData = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setProjects(data);
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    const stackArray = typeof projectForm.tech_stack === "string"
      ? projectForm.tech_stack.split(",").map(t => t.trim()).filter(Boolean)
      : projectForm.tech_stack;

    const formData = {
      title: projectForm.title.trim(),
      description: projectForm.description.trim(),
      tech_stack: stackArray,
      live_url: projectForm.live_url.trim() || "#",
      github_url: projectForm.github_url.trim() || "#",
      thumbnail_url: projectForm.thumbnail_url.trim() || "",
      featured: projectForm.featured,
    };

    if (projectForm.id) {
      // UPDATE
      const { data, error } = await supabase
        .from("projects")
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq("id", projectForm.id)
        .select();
      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }
      if (data) {
        setProjects(prev => prev.map(p => p.id === projectForm.id ? data[0] : p));
      }
    } else {
      // INSERT
      const { data, error } = await supabase
        .from("projects")
        .insert({ ...formData })
        .select();
      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }
      if (data) {
        setProjects(prev => [...prev, data[0]]);
      }
    }

    setProjectFormOpen(false);
    setProjectForm({ id: null, title: "", description: "", tech_stack: "", live_url: "", github_url: "", thumbnail_url: "", featured: false });
  };

  const handleDeleteProject = async (id, title) => {
    if (!window.confirm(`DISSOLVE PROJECT NODE: "${title}"?`)) return;
    
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);
    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }
    setProjects(prev => prev.filter(p => p.id !== id));
  };



  // ====================================================================
  // 3. SKILLS CRUD
  // ====================================================================
  const fetchSkillsData = async () => {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!error && data) {
      setSkills(data);
    }
  };

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    const formData = {
      name: skillForm.name.trim(),
      category: skillForm.category,
      icon_url: skillForm.icon_url.trim() || "",
      proficiency: parseInt(skillForm.proficiency),
      sort_order: parseInt(skillForm.sort_order) || 0
    };

    if (skillForm.id) {
      // UPDATE (Note: skills table has no updated_at column, so we omit updated_at parameter)
      const { data, error } = await supabase
        .from("skills")
        .update({ ...formData })
        .eq("id", skillForm.id)
        .select();
      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }
      if (data) {
        setSkills(prev => prev.map(s => s.id === skillForm.id ? data[0] : s));
      }
    } else {
      // INSERT
      const { data, error } = await supabase
        .from("skills")
        .insert({ ...formData })
        .select();
      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }
      if (data) {
        setSkills(prev => [...prev, data[0]]);
      }
    }

    setSkillFormOpen(false);
    setSkillForm({ id: null, name: "", category: "languages", icon_url: "", proficiency: 4, sort_order: 0 });
  };

  const handleDeleteSkill = async (id, name) => {
    if (!window.confirm(`DISSOLVE ABILITY NODE: "${name}"?`)) return;

    const { error } = await supabase
      .from("skills")
      .delete()
      .eq("id", id);
    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }
    setSkills(prev => prev.filter(s => s.id !== id));
  };

  // ====================================================================
  // 4. ABOUT ME CRUD
  // ====================================================================
  const fetchAboutData = async () => {
    const { data, error } = await supabase
      .from("about_me")
      .select("*")
      .limit(1);
    if (!error && data && data.length > 0) {
      setAboutRecord(data[0]);
      setAboutForm({
        id: data[0].id,
        bio: data[0].bio || "",
        tagline: data[0].tagline || "",
        resume_url: data[0].resume_url || "",
        profile_image_url: data[0].profile_image_url || ""
      });
    } else {
      setAboutForm({ id: null, bio: "", tagline: "", resume_url: "", profile_image_url: "" });
    }
  };

  const handleSaveAbout = async (e) => {
    e.preventDefault();
    const formData = {
      bio: aboutForm.bio.trim(),
      tagline: aboutForm.tagline.trim(),
      resume_url: aboutForm.resume_url.trim() || "",
      profile_image_url: aboutForm.profile_image_url.trim() || ""
    };

    if (aboutForm.id) {
      // UPDATE
      const { data, error } = await supabase
        .from("about_me")
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq("id", aboutForm.id)
        .select();
      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }
      if (data) {
        setAboutRecord(data[0]);
        alert("COCKPIT DIRECTIVE: About Me profile updated.");
      }
    } else {
      // INSERT
      const { data, error } = await supabase
        .from("about_me")
        .insert({ ...formData })
        .select();
      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }
      if (data) {
        setAboutRecord(data[0]);
        setAboutForm(prev => ({ ...prev, id: data[0].id }));
        alert("COCKPIT DIRECTIVE: About Me profile created.");
      }
    }
  };

  // Secure Panel Lock Check
  if (!session) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "var(--bg-darker)" }}>
        <div className="cyber-grid" />
        <div className="hud-panel cyber-scanlines glitch-border" style={{ width: "100%", maxWidth: "420px", background: "var(--bg-panel-solid)", padding: "32px", zIndex: 10 }}>
          <div className="hud-panel-bottom" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0, 210, 255, 0.2)", paddingBottom: "12px", marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Terminal size={18} style={{ color: "var(--accent-purple)" }} />
              <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.95rem", letterSpacing: "2px", fontWeight: "700", color: "#fff" }}>
                T V AJAY_CMS_COCKPIT
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

  // Active Admin Panel Frame
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-darker)", padding: "80px 24px 60px", color: "#fff", position: "relative" }}>
      <div className="cyber-grid" />
      <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        
        {/* Navigation / HUD Telemetry */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,210,255,0.2)", paddingBottom: "16px", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-hud)", fontSize: "1.6rem", display: "flex", alignItems: "center", gap: "8px", letterSpacing: "2px" }}>
              <Terminal style={{ color: "var(--accent-cyan)" }} /> SECURE_CMS_COCKPIT
            </h1>
            <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.65rem", color: "var(--accent-purple)", letterSpacing: "1.5px" }}>[ SESSION_ACTIVE // T V AJAY ]</span>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "32px" }}>
          <button
            onClick={() => { setActiveTab("projects"); setProjectFormOpen(false); }}
            className={`hud-btn ${activeTab === "projects" ? "" : "hud-btn-purple"}`}
            style={{ padding: "12px 6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: activeTab === "projects" ? "var(--accent-cyan)" : "transparent", borderColor: activeTab === "projects" ? "var(--accent-cyan)" : "rgba(189,0,255,0.3)", color: activeTab === "projects" ? "var(--bg-darker)" : "#fff" }}
          >
            <Award size={14} /> PROJECTS ({projects.length})
          </button>
          <button
            onClick={() => { setActiveTab("skills"); setSkillFormOpen(false); }}
            className={`hud-btn ${activeTab === "skills" ? "" : "hud-btn-purple"}`}
            style={{ padding: "12px 6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: activeTab === "skills" ? "var(--accent-cyan)" : "transparent", borderColor: activeTab === "skills" ? "var(--accent-cyan)" : "rgba(189,0,255,0.3)", color: activeTab === "skills" ? "var(--bg-darker)" : "#fff" }}
          >
            <Layers size={14} /> SKILLS ({skills.length})
          </button>
          <button
            onClick={() => { setActiveTab("about"); }}
            className={`hud-btn ${activeTab === "about" ? "" : "hud-btn-purple"}`}
            style={{ padding: "12px 6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: activeTab === "about" ? "var(--accent-cyan)" : "transparent", borderColor: activeTab === "about" ? "var(--accent-cyan)" : "rgba(189,0,255,0.3)", color: activeTab === "about" ? "var(--bg-darker)" : "#fff" }}
          >
            <User size={14} /> ABOUT ME
          </button>
        </div>

        {/* ====================================================================
            PROJECTS TAB
            ==================================================================== */}
        {activeTab === "projects" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {!projectFormOpen ? (
              <>
                <button onClick={() => {
                  setProjectForm({ id: null, title: "", description: "", tech_stack: "", live_url: "", github_url: "", thumbnail_url: "", featured: false });
                  setProjectFormOpen(true);
                }} className="hud-btn" style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px", alignSelf: "flex-start" }}>
                  <Plus size={14} /> ACTIVATE NEW PROJECT NODE
                </button>

                <div className="hud-panel cyber-scanlines" style={{ padding: "0", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(0,210,255,0.2)", background: "rgba(0,210,255,0.03)" }}>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)" }}>TITLE</th>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)" }}>TECH STACK</th>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)" }}>FEATURED</th>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)", textAlign: "right" }}>COORDINATES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>[ NO PROJECTS DEPLOYED ]</td>
                        </tr>
                      ) : (
                        projects.map((p) => (
                          <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "16px", fontWeight: "700" }}>{p.title}</td>
                            <td style={{ padding: "16px", color: "var(--text-secondary)" }}>{p.tech_stack?.join(", ") || ""}</td>
                            <td style={{ padding: "16px" }}>{p.featured ? "TRUE // FEATURED" : "FALSE"}</td>
                            <td style={{ padding: "16px", textAlign: "right" }}>
                              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                <button onClick={() => {
                                  setProjectForm({
                                    id: p.id,
                                    title: p.title,
                                    description: p.description || "",
                                    tech_stack: p.tech_stack?.join(", ") || "",
                                    live_url: p.live_url || "",
                                    github_url: p.github_url || "",
                                    thumbnail_url: p.thumbnail_url || "",
                                    featured: !!p.featured
                                  });
                                  setProjectFormOpen(true);
                                }} className="hud-btn" style={{ padding: "4px 8px", fontSize: "0.6rem" }}>
                                  <Edit size={10} /> EDIT
                                </button>
                                <button onClick={() => handleDeleteProject(p.id, p.title)} className="hud-btn hud-btn-purple" style={{ padding: "4px 8px", fontSize: "0.6rem", color: "#ff4a4a", borderColor: "#ff4a4a" }}>
                                  <Trash2 size={10} /> DISSOLVE
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
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
                  <X size={14} style={{ cursor: "pointer" }} onClick={() => setProjectFormOpen(false)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>PROJECT TITLE</label>
                    <input type="text" required value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", justifyContent: "center" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "4px" }}>FEATURED QUEST</label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input type="checkbox" checked={projectForm.featured} onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })} style={{ accentColor: "var(--accent-cyan)" }} />
                      <span style={{ fontSize: "0.8rem" }}>FLAG AS FEATURED</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>TECH STACK TAGS (comma-separated)</label>
                  <input type="text" required value={projectForm.tech_stack} onChange={(e) => setProjectForm({ ...projectForm, tech_stack: e.target.value })} placeholder="React, Supabase, PostgreSQL" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
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
                  COMPILE_AND_SAVE // PROJECT
                </button>
              </form>
            )}
          </div>
        )}



        {/* ====================================================================
            SKILLS TAB
            ==================================================================== */}
        {activeTab === "skills" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {!skillFormOpen ? (
              <>
                <button onClick={() => {
                  setSkillForm({ id: null, name: "", category: "languages", icon_url: "", proficiency: 4, sort_order: skills.length + 1 });
                  setSkillFormOpen(true);
                }} className="hud-btn" style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px", alignSelf: "flex-start" }}>
                  <Plus size={14} /> INJECT NEW ABILITY NODE
                </button>

                <div className="hud-panel cyber-scanlines" style={{ padding: "0", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(0,210,255,0.2)", background: "rgba(0,210,255,0.03)" }}>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)" }}>NAME</th>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)" }}>CATEGORY</th>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)" }}>PROFICIENCY (1-5)</th>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)" }}>ORDER</th>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)", textAlign: "right" }}>COORDINATES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skills.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>[ ABILITY GRID VACANT ]</td>
                        </tr>
                      ) : (
                        skills.map((s) => (
                          <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "16px", fontWeight: "700" }}>{s.name}</td>
                            <td style={{ padding: "16px", color: "var(--text-secondary)" }}>{s.category}</td>
                            <td style={{ padding: "16px" }}>{s.proficiency} / 5</td>
                            <td style={{ padding: "16px" }}>{s.sort_order}</td>
                            <td style={{ padding: "16px", textAlign: "right" }}>
                              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                <button onClick={() => {
                                  setSkillForm({
                                    id: s.id,
                                    name: s.name,
                                    category: s.category || "languages",
                                    icon_url: s.icon_url || "",
                                    proficiency: s.proficiency || 4,
                                    sort_order: s.sort_order || 0
                                  });
                                  setSkillFormOpen(true);
                                }} className="hud-btn" style={{ padding: "4px 8px", fontSize: "0.6rem" }}>
                                  <Edit size={10} /> EDIT
                                </button>
                                <button onClick={() => handleDeleteSkill(s.id, s.name)} className="hud-btn hud-btn-purple" style={{ padding: "4px 8px", fontSize: "0.6rem", color: "#ff4a4a", borderColor: "#ff4a4a" }}>
                                  <Trash2 size={10} /> DISSOLVE
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              // Add / Edit Skill Form
              <form onSubmit={handleSaveSkill} className="hud-panel cyber-scanlines glitch-border" style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "600px", margin: "0 auto", width: "100%" }}>
                <div className="hud-panel-bottom" />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,210,255,0.2)", paddingBottom: "8px" }}>
                  <span style={{ fontFamily: "var(--font-hud)", color: "var(--accent-cyan)", fontWeight: "700" }}>
                    {skillForm.id ? `[ EDIT_ABILITY // ${skillForm.name.toUpperCase()} ]` : "[ ABILITY_INJECTION_SHELL ]"}
                  </span>
                  <X size={14} style={{ cursor: "pointer" }} onClick={() => setSkillFormOpen(false)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>ABILITY NAME</label>
                    <input type="text" required value={skillForm.name} onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} placeholder="e.g. React" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>CATEGORY</label>
                    <select value={skillForm.category} onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })} style={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }}>
                      <option value="languages">LANGUAGES</option>
                      <option value="frontend">FRONTEND</option>
                      <option value="backend">BACKEND</option>
                      <option value="database">DATABASE</option>
                      <option value="tools">SYSTEM TOOLS</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>PROFICIENCY LEVEL (1 TO 5)</label>
                    <input type="number" required min="1" max="5" value={skillForm.proficiency} onChange={(e) => setSkillForm({ ...skillForm, proficiency: parseInt(e.target.value) })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>SORT SEQUENCE ORDER</label>
                    <input type="number" value={skillForm.sort_order} onChange={(e) => setSkillForm({ ...skillForm, sort_order: parseInt(e.target.value) })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>ICON CODE / URL Reference</label>
                  <input type="text" value={skillForm.icon_url} onChange={(e) => setSkillForm({ ...skillForm, icon_url: e.target.value })} placeholder="e.g. lucide-terminal" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>

                <button type="submit" className="hud-btn" style={{ padding: "10px 20px", fontSize: "0.75rem", alignSelf: "flex-start", marginTop: "8px" }}>
                  COMPILE_AND_INJECT // SKILL
                </button>
              </form>
            )}
          </div>
        )}

        {/* ====================================================================
            ABOUT ME PROFILE TAB
            ==================================================================== */}
        {activeTab === "about" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <form onSubmit={handleSaveAbout} className="hud-panel cyber-scanlines glitch-border" style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "700px", margin: "0 auto", width: "100%" }}>
              <div className="hud-panel-bottom" />
              <div style={{ borderBottom: "1px solid rgba(0,210,255,0.2)", paddingBottom: "8px" }}>
                <span style={{ fontFamily: "var(--font-hud)", color: "var(--accent-cyan)", fontWeight: "700" }}>
                  [ MANAGE ABOUT PROFILE Telemetry ]
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>TAGLINE / HEADLINE</label>
                <input type="text" required value={aboutForm.tagline} onChange={(e) => setAboutForm({ ...aboutForm, tagline: e.target.value })} placeholder="e.g. CSE STUDENT @ VVCE // SYSTEM BUILDER" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "10px", fontSize: "0.85rem", outline: "none" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>BIOGRAPHY LOG</label>
                <textarea required value={aboutForm.bio} onChange={(e) => setAboutForm({ ...aboutForm, bio: e.target.value })} rows="6" placeholder="Describe your computer science logs..." style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "10px", fontSize: "0.85rem", resize: "none", outline: "none", lineHeight: "1.5" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>RESUME / DATA LOG DEPLOYED LINK</label>
                  <input type="text" value={aboutForm.resume_url} onChange={(e) => setAboutForm({ ...aboutForm, resume_url: e.target.value })} placeholder="#" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>PROFILE IMAGE LOG LINK</label>
                  <input type="text" value={aboutForm.profile_image_url} onChange={(e) => setAboutForm({ ...aboutForm, profile_image_url: e.target.value })} placeholder="https://..." style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>
              </div>

              <button type="submit" className="hud-btn" style={{ padding: "10px 20px", fontSize: "0.75rem", alignSelf: "flex-start", marginTop: "8px" }}>
                COMPILE_AND_SAVE // BIOGRAPHY
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
