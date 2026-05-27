import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { apiFetch } from "../api";
import { Terminal, Lock, Mail, Compass, Award, ShieldAlert, Check, Plus, Trash2, Edit, LogOut, ArrowLeft, X, Code, Server, Database, Settings, BookOpen, User } from "lucide-react";

const AdminDashboard = () => {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("projects"); // "projects", "skills", "achievements", "blog", "profile", "messages"

  // Data states
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [profileStats, setProfileStats] = useState(null);
  const [messages, setMessages] = useState([]);

  // Project Form State
  const [projectForm, setProjectForm] = useState({ id: null, title: "", description: "", tech_stack: "", live_url: "", github_url: "", thumbnail_url: "", date: "", jp_name: "", type: "MAIN QUEST", status: "IN PROGRESS", difficulty: "MEDIUM" });
  const [projectFormOpen, setProjectFormOpen] = useState(false);

  // Skill Form State
  const [skillForm, setSkillForm] = useState({ id: null, category: "languages", name: "", level: 80, description: "" });
  const [skillFormOpen, setSkillFormOpen] = useState(false);

  // Achievement Form State
  const [achForm, setAchForm] = useState({ id: null, title: "", jp_name: "", award: "", date: "", xp_reward: "", description: "" });
  const [achFormOpen, setAchFormOpen] = useState(false);

  // Blog Form State
  const [blogForm, setBlogForm] = useState({ id: null, title: "", slug: "", content: "", cover_image_url: "", published_date: "", is_draft: true });
  const [blogFormOpen, setBlogFormOpen] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    character_name: "AJAY",
    level: 26,
    xp_percent: 92,
    class: "CSE STUDENT",
    guild: "VVCE, VTU AFFILIATED",
    hp_current: 980,
    hp_max: 980,
    mp_current: 920,
    mp_max: 1000,
    player_rank: "LV.26",
    hero_greeting: "",
    typewriter_words: "",
    biography: "",
    education_school: "",
    education_degree: "",
    education_period: "",
    education_progress: 25,
    education_progress_label: ""
  });

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

  // Fetch all CMS details via Express backend
  const fetchCMSData = async () => {
    try {
      const projData = await apiFetch("/api/projects").catch(() => []);
      setProjects(projData || []);

      const skillData = await apiFetch("/api/skills").catch(() => []);
      setSkills(skillData || []);

      const achData = await apiFetch("/api/achievements").catch(() => []);
      setAchievements(achData || []);

      const blogData = await apiFetch("/api/blog").catch(() => []);
      setBlogPosts(blogData || []);

      const msgData = await apiFetch("/api/messages").catch(() => []);
      setMessages(msgData || []);

      const profData = await apiFetch("/api/profile").catch(() => null);
      if (profData) {
        setProfileStats(profData);
        setProfileForm({
          character_name: profData.character_name || "AJAY",
          level: profData.level || 26,
          xp_percent: profData.xp_percent || 92,
          class: profData.class || "CSE STUDENT",
          guild: profData.guild || "VVCE, VTU AFFILIATED",
          hp_current: profData.hp_current || 980,
          hp_max: profData.hp_max || 980,
          mp_current: profData.mp_current || 920,
          mp_max: profData.mp_max || 1000,
          player_rank: profData.player_rank || "LV.26",
          hero_greeting: profData.hero_greeting || "",
          typewriter_words: profData.typewriter_words ? profData.typewriter_words.join(", ") : "",
          biography: profData.biography || "",
          education_school: profData.education_school || "",
          education_degree: profData.education_degree || "",
          education_period: profData.education_period || "",
          education_progress: profData.education_progress || 25,
          education_progress_label: profData.education_progress_label || ""
        });
      }
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
      const techStackArr = projectForm.tech_stack.split(",").map(t => t.trim()).filter(Boolean);
      const payload = {
        title: projectForm.title,
        description: projectForm.description,
        tech_stack: techStackArr,
        live_url: projectForm.live_url || "#",
        github_url: projectForm.github_url || "#",
        thumbnail_url: projectForm.thumbnail_url || "",
        date: projectForm.date || "",
        // Backwards compatibility columns for dynamic quests mapping bridge
        name: projectForm.title,
        jp_name: projectForm.jp_name || projectForm.title || "プロジェクト",
        type: projectForm.type || "MAIN QUEST",
        status: projectForm.status || "IN PROGRESS",
        difficulty: projectForm.difficulty || "MEDIUM",
        loot: techStackArr,
        github: projectForm.github_url || "#",
        live: projectForm.live_url || "#"
      };

      if (projectForm.id) {
        await apiFetch(`/api/projects/${projectForm.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        payload.sort_order = projects.length + 1;
        await apiFetch("/api/projects", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }

      setProjectFormOpen(false);
      setProjectForm({ id: null, title: "", description: "", tech_stack: "", live_url: "", github_url: "", thumbnail_url: "", date: "", jp_name: "", type: "MAIN QUEST", status: "IN PROGRESS", difficulty: "MEDIUM" });
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
      tech_stack: p.tech_stack ? p.tech_stack.join(", ") : "",
      live_url: p.live_url,
      github_url: p.github_url,
      thumbnail_url: p.thumbnail_url || "",
      date: p.date || "",
      jp_name: p.jp_name || p.title,
      type: p.type || "MAIN QUEST",
      status: p.status || "IN PROGRESS",
      difficulty: p.difficulty || "MEDIUM"
    });
    setProjectFormOpen(true);
  };

  const handleDeleteProject = async (id, title) => {
    if (!window.confirm(`DISSOLVE PROJECT NODE: "${title}"?`)) return;
    try {
      await apiFetch(`/api/projects/${id}`, {
        method: "DELETE"
      });
      fetchCMSData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // ==========================================
  // SKILLS CRUD
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
        await apiFetch(`/api/skills/${skillForm.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        const catSkills = skills.filter(s => s.category === skillForm.category);
        payload.sort_order = catSkills.length + 1;
        await apiFetch("/api/skills", {
          method: "POST",
          body: JSON.stringify(payload)
        });
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
      await apiFetch(`/api/skills/${id}`, {
        method: "DELETE"
      });
      fetchCMSData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // ==========================================
  // ACHIEVEMENTS CRUD
  // ==========================================
  const handleSaveAch = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: achForm.title,
        jp_name: achForm.jp_name || "トロフィー",
        award: achForm.award || "Quest Objective Achieved",
        date: achForm.date || "UNKNOWN DATE",
        xp_reward: achForm.xp_reward || "+500 XP UNLOCKED",
        description: achForm.description || ""
      };

      if (achForm.id) {
        await apiFetch(`/api/achievements/${achForm.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        payload.sort_order = achievements.length + 1;
        await apiFetch("/api/achievements", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }

      setAchFormOpen(false);
      setAchForm({ id: null, title: "", jp_name: "", award: "", date: "", xp_reward: "", description: "" });
      fetchCMSData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleEditAchClick = (a) => {
    setAchForm({
      id: a.id,
      title: a.title,
      jp_name: a.jp_name || a.jpName,
      award: a.award,
      date: a.date,
      xp_reward: a.xp_reward || a.xpReward,
      description: a.description || a.desc
    });
    setAchFormOpen(true);
  };

  const handleDeleteAch = async (id, title) => {
    if (!window.confirm(`DISSOLVE TROPHY: "${title}"?`)) return;
    try {
      await apiFetch(`/api/achievements/${id}`, {
        method: "DELETE"
      });
      fetchCMSData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // ==========================================
  // BLOG POSTS CRUD
  // ==========================================
  const handleSaveBlog = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: blogForm.title,
        slug: blogForm.slug || blogForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
        content: blogForm.content,
        cover_image_url: blogForm.cover_image_url || "",
        published_date: blogForm.published_date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" }).toUpperCase(),
        is_draft: !!blogForm.is_draft
      };

      if (blogForm.id) {
        await apiFetch(`/api/blog/${blogForm.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch("/api/blog", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }

      setBlogFormOpen(false);
      setBlogForm({ id: null, title: "", slug: "", content: "", cover_image_url: "", published_date: "", is_draft: true });
      fetchCMSData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleEditBlogClick = (b) => {
    setBlogForm({
      id: b.id,
      title: b.title,
      slug: b.slug,
      content: b.content,
      cover_image_url: b.cover_image_url || "",
      published_date: b.published_date || "",
      is_draft: !!b.is_draft
    });
    setBlogFormOpen(true);
  };

  const handleDeleteBlog = async (id, title) => {
    if (!window.confirm(`DISSOLVE BLOG POST: "${title}"?`)) return;
    try {
      await apiFetch(`/api/blog/${id}`, {
        method: "DELETE"
      });
      fetchCMSData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // ==========================================
  // PROFILE STATS UPDATE
  // ==========================================
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        character_name: profileForm.character_name,
        level: parseInt(profileForm.level),
        xp_percent: parseInt(profileForm.xp_percent),
        class: profileForm.class,
        guild: profileForm.guild,
        hp_current: parseInt(profileForm.hp_current),
        hp_max: parseInt(profileForm.hp_max),
        mp_current: parseInt(profileForm.mp_current),
        mp_max: parseInt(profileForm.mp_max),
        player_rank: profileForm.player_rank,
        hero_greeting: profileForm.hero_greeting,
        typewriter_words: profileForm.typewriter_words.split(",").map(w => w.trim()).filter(Boolean),
        biography: profileForm.biography,
        education_school: profileForm.education_school,
        education_degree: profileForm.education_degree,
        education_period: profileForm.education_period,
        education_progress: parseInt(profileForm.education_progress),
        education_progress_label: profileForm.education_progress_label
      };

      await apiFetch("/api/profile", {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      alert("MAINFRAME STATS SECURELY SYNCHRONIZED!");
      fetchCMSData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // ==========================================
  // VISITOR MESSAGES DELETE
  // ==========================================
  const handleDeleteMessage = async (id, name) => {
    if (!window.confirm(`DISSOLVE VISITOR TRANSMISSION FROM "${name.toUpperCase()}"?`)) return;
    try {
      await apiFetch(`/api/messages/${id}`, {
        method: "DELETE"
      });
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
        <div className="hud-panel cyber-scanlines glitch-border" style={{ width: "100%", maxWidth: "420px", background: "rgba(6, 12, 24, 0.95)", padding: "32px", zIndex: 10 }}>
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

        {/* Tab Controls - Fully Expanded Dynamic HUD Matrix Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "32px" }}>
          <button
            onClick={() => { setActiveTab("projects"); setProjectFormOpen(false); setSkillFormOpen(false); setAchFormOpen(false); setBlogFormOpen(false); }}
            className={`hud-btn ${activeTab === "projects" ? "" : "hud-btn-purple"}`}
            style={{ padding: "12px", background: activeTab === "projects" ? "var(--accent-cyan)" : "transparent", borderColor: activeTab === "projects" ? "var(--accent-cyan)" : "rgba(189,0,255,0.3)", color: activeTab === "projects" ? "var(--bg-darker)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
          >
            <Compass size={14} />
            <span>PROJECTS ({projects.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab("skills"); setProjectFormOpen(false); setSkillFormOpen(false); setAchFormOpen(false); setBlogFormOpen(false); }}
            className={`hud-btn ${activeTab === "skills" ? "" : "hud-btn-purple"}`}
            style={{ padding: "12px", background: activeTab === "skills" ? "var(--accent-purple)" : "transparent", borderColor: activeTab === "skills" ? "var(--accent-purple)" : "rgba(189,0,255,0.3)", color: activeTab === "skills" ? "var(--bg-darker)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
          >
            <Code size={14} />
            <span>SKILLS ({skills.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab("achievements"); setProjectFormOpen(false); setSkillFormOpen(false); setAchFormOpen(false); setBlogFormOpen(false); }}
            className={`hud-btn ${activeTab === "achievements" ? "" : "hud-btn-purple"}`}
            style={{ padding: "12px", background: activeTab === "achievements" ? "var(--accent-cyan)" : "transparent", borderColor: activeTab === "achievements" ? "var(--accent-cyan)" : "rgba(189,0,255,0.3)", color: activeTab === "achievements" ? "var(--bg-darker)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
          >
            <Award size={14} />
            <span>TROPHIES ({achievements.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab("blog"); setProjectFormOpen(false); setSkillFormOpen(false); setAchFormOpen(false); setBlogFormOpen(false); }}
            className={`hud-btn ${activeTab === "blog" ? "" : "hud-btn-purple"}`}
            style={{ padding: "12px", background: activeTab === "blog" ? "var(--accent-purple)" : "transparent", borderColor: activeTab === "blog" ? "var(--accent-purple)" : "rgba(189,0,255,0.3)", color: activeTab === "blog" ? "var(--bg-darker)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
          >
            <BookOpen size={14} />
            <span>BLOG ({blogPosts.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab("profile"); setProjectFormOpen(false); setSkillFormOpen(false); setAchFormOpen(false); setBlogFormOpen(false); }}
            className={`hud-btn ${activeTab === "profile" ? "" : "hud-btn-purple"}`}
            style={{ padding: "12px", background: activeTab === "profile" ? "var(--accent-cyan)" : "transparent", borderColor: activeTab === "profile" ? "var(--accent-cyan)" : "rgba(189,0,255,0.3)", color: activeTab === "profile" ? "var(--bg-darker)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
          >
            <User size={14} />
            <span>BIO STATS</span>
          </button>
          <button
            onClick={() => { setActiveTab("messages"); setProjectFormOpen(false); setSkillFormOpen(false); setAchFormOpen(false); setBlogFormOpen(false); }}
            className={`hud-btn ${activeTab === "messages" ? "" : "hud-btn-purple"}`}
            style={{ padding: "12px", background: activeTab === "messages" ? "var(--accent-blue)" : "transparent", borderColor: activeTab === "messages" ? "var(--accent-blue)" : "rgba(0,210,255,0.3)", color: activeTab === "messages" ? "var(--bg-darker)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
          >
            <Mail size={14} />
            <span>INBOX ({messages.length})</span>
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
                          <td style={{ padding: "16px", fontWeight: "700" }}>{p.title || p.name}</td>
                          <td style={{ padding: "16px", color: "var(--text-secondary)" }}>{(p.tech_stack || p.loot || []).join(", ")}</td>
                          <td style={{ padding: "16px" }}>{p.date}</td>
                          <td style={{ padding: "16px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button onClick={() => handleEditProjectClick(p)} className="hud-btn" style={{ padding: "4px 8px", fontSize: "0.6rem" }}>
                                <Edit size={10} /> EDIT
                              </button>
                              <button onClick={() => handleDeleteProject(p.id, p.title || p.name)} className="hud-btn hud-btn-purple" style={{ padding: "4px 8px", fontSize: "0.6rem", color: "#ff4a4a", borderColor: "#ff4a4a" }}>
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
                  <X size={14} style={{ cursor: "pointer" }} onClick={() => { setProjectFormOpen(false); setProjectForm({ id: null, title: "", description: "", tech_stack: "", live_url: "", github_url: "", thumbnail_url: "", date: "", jp_name: "", type: "MAIN QUEST", status: "IN PROGRESS", difficulty: "MEDIUM" }); }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>PROJECT TITLE</label>
                    <input type="text" required value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>JAPANESE NAME SUBTITLE</label>
                    <input type="text" value={projectForm.jp_name} onChange={(e) => setProjectForm({ ...projectForm, jp_name: e.target.value })} placeholder="キャンパスリンク" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none", fontFamily: "var(--font-jp)" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>QUEST TYPE</label>
                    <input type="text" value={projectForm.type} onChange={(e) => setProjectForm({ ...projectForm, type: e.target.value })} placeholder="MAIN QUEST" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>STATUS</label>
                    <input type="text" value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })} placeholder="IN PROGRESS" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>DIFFICULTY</label>
                    <input type="text" value={projectForm.difficulty} onChange={(e) => setProjectForm({ ...projectForm, difficulty: e.target.value })} placeholder="HARD" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>TECH STACK TAGS (comma-separated)</label>
                    <input type="text" required value={projectForm.tech_stack} onChange={(e) => setProjectForm({ ...projectForm, tech_stack: e.target.value })} placeholder="React, Node.js, Supabase" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>DATE / PERIOD (e.g. 2024 - 2025)</label>
                    <input type="text" value={projectForm.date} onChange={(e) => setProjectForm({ ...projectForm, date: e.target.value })} placeholder="2024 - 2025" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
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
            ACHIEVEMENTS (TROPHIES) WORKSPACE
           ========================================== */}
        {activeTab === "achievements" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {!achFormOpen ? (
              <>
                <button onClick={() => setAchFormOpen(true)} className="hud-btn" style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px", alignSelf: "flex-start" }}>
                  <Plus size={14} /> FORGE NEW TIMELINE TROPHY
                </button>

                <div className="hud-panel cyber-scanlines" style={{ padding: "0", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(0,210,255,0.2)", background: "rgba(0,210,255,0.03)" }}>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)" }}>TROPHY TITLE</th>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)" }}>AWARD DETAIL</th>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)" }}>XP REWARD</th>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)" }}>DATE</th>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)", textAlign: "right" }}>COORDINATES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {achievements.map((a) => (
                        <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "16px", fontWeight: "700" }}>{a.title}</td>
                          <td style={{ padding: "16px", color: "var(--text-secondary)" }}>{a.award}</td>
                          <td style={{ padding: "16px", color: "var(--accent-cyan)" }}>{a.xp_reward || a.xpReward}</td>
                          <td style={{ padding: "16px" }}>{a.date}</td>
                          <td style={{ padding: "16px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button onClick={() => handleEditAchClick(a)} className="hud-btn" style={{ padding: "4px 8px", fontSize: "0.6rem" }}>
                                <Edit size={10} /> EDIT
                              </button>
                              <button onClick={() => handleDeleteAch(a.id, a.title)} className="hud-btn hud-btn-purple" style={{ padding: "4px 8px", fontSize: "0.6rem", color: "#ff4a4a", borderColor: "#ff4a4a" }}>
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
              // Add / Edit Achievement Form
              <form onSubmit={handleSaveAch} className="hud-panel cyber-scanlines glitch-border" style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "600px", margin: "0 auto", width: "100%" }}>
                <div className="hud-panel-bottom" />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,210,255,0.2)", paddingBottom: "8px" }}>
                  <span style={{ fontFamily: "var(--font-hud)", color: "var(--accent-cyan)", fontWeight: "700" }}>
                    {achForm.id ? `[ EDIT_TROPHY // ${achForm.title.toUpperCase()} ]` : "[ TROPHY_FORGING_SHELL ]"}
                  </span>
                  <X size={14} style={{ cursor: "pointer" }} onClick={() => { setAchFormOpen(false); setAchForm({ id: null, title: "", jp_name: "", award: "", date: "", xp_reward: "", description: "" }); }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>TROPHY TITLE</label>
                    <input type="text" required value={achForm.title} onChange={(e) => setAchForm({ ...achForm, title: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>JAPANESE TRANSLATION</label>
                    <input type="text" value={achForm.jp_name} onChange={(e) => setAchForm({ ...achForm, jp_name: e.target.value })} placeholder="コーディングチャレンジ参加者" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none", fontFamily: "var(--font-jp)" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>XP REWARD LABEL</label>
                    <input type="text" required value={achForm.xp_reward} onChange={(e) => setAchForm({ ...achForm, xp_reward: e.target.value })} placeholder="+1200 XP UNLOCKED" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>UNLOCK DATE</label>
                    <input type="text" required value={achForm.date} onChange={(e) => setAchForm({ ...achForm, date: e.target.value })} placeholder="APRIL 2026" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>OBJECTIVE / HIGHLIGHT LINE</label>
                  <input type="text" required value={achForm.award} onChange={(e) => setAchForm({ ...achForm, award: e.target.value })} placeholder="Cleared Round 2 — Top 1,500..." style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>NARRATIVE DESCRIPTION</label>
                  <textarea required value={achForm.description} onChange={(e) => setAchForm({ ...achForm, description: e.target.value })} rows="4" placeholder="Enter detailed narrative details..." style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", resize: "none", outline: "none" }} />
                </div>

                <button type="submit" className="hud-btn" style={{ padding: "10px 20px", fontSize: "0.75rem", alignSelf: "flex-start", marginTop: "8px" }}>
                  COMPILE_AND_FORGE
                </button>
              </form>
            )}
          </div>
        )}

        {/* ==========================================
            BLOG POSTS WORKSPACE
           ========================================== */}
        {activeTab === "blog" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {!blogFormOpen ? (
              <>
                <button onClick={() => setBlogFormOpen(true)} className="hud-btn" style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px", alignSelf: "flex-start", borderColor: "var(--accent-purple)" }}>
                  <Plus size={14} /> PUBLISH NEW CHRONICLE
                </button>

                <div className="hud-panel cyber-scanlines" style={{ padding: "0", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(189,0,255,0.2)", background: "rgba(189,0,255,0.03)" }}>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)" }}>BLOG TITLE</th>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)" }}>SLUG</th>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)" }}>PUBLISHED</th>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)" }}>STATUS</th>
                        <th style={{ padding: "16px", fontFamily: "var(--font-hud)", textAlign: "right" }}>COORDINATES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogPosts.map((b) => (
                        <tr key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "16px", fontWeight: "700" }}>{b.title}</td>
                          <td style={{ padding: "16px", color: "var(--text-secondary)" }}>{b.slug}</td>
                          <td style={{ padding: "16px" }}>{b.published_date}</td>
                          <td style={{ padding: "16px" }}>
                            <span style={{ color: b.is_draft ? "#ff4a4a" : "var(--accent-cyan)", fontWeight: "bold" }}>
                              {b.is_draft ? "DRAFT" : "PUBLISHED"}
                            </span>
                          </td>
                          <td style={{ padding: "16px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button onClick={() => handleEditBlogClick(b)} className="hud-btn" style={{ padding: "4px 8px", fontSize: "0.6rem" }}>
                                <Edit size={10} /> EDIT
                              </button>
                              <button onClick={() => handleDeleteBlog(b.id, b.title)} className="hud-btn hud-btn-purple" style={{ padding: "4px 8px", fontSize: "0.6rem", color: "#ff4a4a", borderColor: "#ff4a4a" }}>
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
              // Add / Edit Blog Post Form
              <form onSubmit={handleSaveBlog} className="hud-panel cyber-scanlines glitch-border" style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "700px", margin: "0 auto", width: "100%", background: "rgba(9, 18, 37, 0.8)", padding: "24px" }}>
                <div className="hud-panel-bottom" style={{ borderColor: "transparent var(--accent-purple) var(--accent-purple) transparent" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(189,0,255,0.2)", paddingBottom: "8px" }}>
                  <span style={{ fontFamily: "var(--font-hud)", color: "var(--accent-purple)", fontWeight: "700" }}>
                    {blogForm.id ? `[ EDIT_CHRONICLE // ${blogForm.title.toUpperCase()} ]` : "[ CHRONICLE_INJECTION_SHELL ]"}
                  </span>
                  <X size={14} style={{ cursor: "pointer" }} onClick={() => { setBlogFormOpen(false); setBlogForm({ id: null, title: "", slug: "", content: "", cover_image_url: "", published_date: "", is_draft: true }); }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>CHRONICLE TITLE</label>
                    <input type="text" required value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>SLUG (leave blank for automatic)</label>
                    <input type="text" value={blogForm.slug} onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })} placeholder="e.g. system-compiler-build" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>PUBLISHED DATE</label>
                    <input type="text" value={blogForm.published_date} onChange={(e) => setBlogForm({ ...blogForm, published_date: e.target.value })} placeholder="e.g. OCTOBER 2026" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>DRAFT ACCREDITATION</label>
                    <select
                      value={blogForm.is_draft ? "true" : "false"}
                      onChange={(e) => setBlogForm({ ...blogForm, is_draft: e.target.value === "true" })}
                      style={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none", height: "34px" }}
                    >
                      <option value="true">DRAFT NODE</option>
                      <option value="false">PUBLISHED NODE</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>COVER IMAGE URL</label>
                  <input type="text" value={blogForm.cover_image_url} onChange={(e) => setBlogForm({ ...blogForm, cover_image_url: e.target.value })} placeholder="https://images.unsplash.com/..." style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>MARKDOWN ARTICLE CONTENT</label>
                  <textarea required value={blogForm.content} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} rows="12" placeholder="# Article header..." style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "12px", fontSize: "0.85rem", resize: "none", outline: "none", fontFamily: "monospace" }} />
                </div>

                <button type="submit" className="hud-btn hud-btn-purple" style={{ padding: "10px 20px", fontSize: "0.75rem", alignSelf: "flex-start", marginTop: "8px" }}>
                  PUBLISH_CHRONICLE
                </button>
              </form>
            )}
          </div>
        )}

        {/* ==========================================
            BIO STATS WORKSPACE (PROFILE STATS)
           ========================================== */}
        {activeTab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-hud)", fontSize: "1.1rem", borderBottom: "1px dashed rgba(0,210,255,0.2)", paddingBottom: "8px", color: "var(--accent-cyan)" }}>
              CHARACTER_MAINFRAME_STATS
            </h2>

            <form onSubmit={handleSaveProfile} className="hud-panel cyber-scanlines glitch-border" style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "32px" }}>
              <div className="hud-panel-bottom" />
              
              <h3 style={{ fontFamily: "var(--font-hud)", fontSize: "0.8rem", color: "var(--accent-purple)", borderBottom: "1px solid rgba(189,0,255,0.1)", paddingBottom: "4px" }}>[ RPG CHARACTER LOG ]</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>CHARACTER NAME</label>
                  <input type="text" required value={profileForm.character_name} onChange={(e) => setProfileForm({ ...profileForm, character_name: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.25)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>LEVEL (INTEGER)</label>
                  <input type="number" required value={profileForm.level} onChange={(e) => setProfileForm({ ...profileForm, level: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.25)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>XP PERCENT (0 - 100)</label>
                  <input type="number" required min="0" max="100" value={profileForm.xp_percent} onChange={(e) => setProfileForm({ ...profileForm, xp_percent: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.25)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>PLAYER RANK STRING</label>
                  <input type="text" required value={profileForm.player_rank} onChange={(e) => setProfileForm({ ...profileForm, player_rank: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.25)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>CHARACTER CLASS</label>
                  <input type="text" required value={profileForm.class} onChange={(e) => setProfileForm({ ...profileForm, class: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.25)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>GUILD AFFILIATION</label>
                  <input type="text" required value={profileForm.guild} onChange={(e) => setProfileForm({ ...profileForm, guild: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.25)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>HP CURRENT / MAX</label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input type="number" required value={profileForm.hp_current} onChange={(e) => setProfileForm({ ...profileForm, hp_current: e.target.value })} style={{ width: "50%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.25)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                    <input type="number" required value={profileForm.hp_max} onChange={(e) => setProfileForm({ ...profileForm, hp_max: e.target.value })} style={{ width: "50%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.25)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>MP CURRENT / MAX</label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input type="number" required value={profileForm.mp_current} onChange={(e) => setProfileForm({ ...profileForm, mp_current: e.target.value })} style={{ width: "50%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.25)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                    <input type="number" required value={profileForm.mp_max} onChange={(e) => setProfileForm({ ...profileForm, mp_max: e.target.value })} style={{ width: "50%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.25)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                  </div>
                </div>
              </div>

              <h3 style={{ fontFamily: "var(--font-hud)", fontSize: "0.8rem", color: "var(--accent-purple)", borderBottom: "1px solid rgba(189,0,255,0.1)", paddingBottom: "4px", marginTop: "16px" }}>[ SYSTEM SETTINGS & BIO ]</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>HERO GREETING HUD TERMINAL</label>
                  <input type="text" required value={profileForm.hero_greeting} onChange={(e) => setProfileForm({ ...profileForm, hero_greeting: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.25)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>TYPEWRITER STRINGS (comma-separated)</label>
                  <input type="text" required value={profileForm.typewriter_words} onChange={(e) => setProfileForm({ ...profileForm, typewriter_words: e.target.value })} placeholder="Full Stack Dev, Otaku" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.25)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>BIOGRAPHY STORY (MARKDOWN / TEXT)</label>
                <textarea required value={profileForm.biography} onChange={(e) => setProfileForm({ ...profileForm, biography: e.target.value })} rows="5" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.25)", color: "#fff", padding: "8px", fontSize: "0.82rem", resize: "none", outline: "none", lineHeight: "1.5" }} />
              </div>

              <h3 style={{ fontFamily: "var(--font-hud)", fontSize: "0.8rem", color: "var(--accent-purple)", borderBottom: "1px solid rgba(189,0,255,0.1)", paddingBottom: "4px", marginTop: "16px" }}>[ MAIN QUEST EDUCATION LOG ]</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>COLLEGE / INSTITUTION NAME</label>
                  <input type="text" required value={profileForm.education_school} onChange={(e) => setProfileForm({ ...profileForm, education_school: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.25)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>DEGREE / FOCUS SPECIALIZATION</label>
                  <input type="text" required value={profileForm.education_degree} onChange={(e) => setProfileForm({ ...profileForm, education_degree: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.25)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>QUEST CAMPAIGN PERIOD</label>
                  <input type="text" required value={profileForm.education_period} onChange={(e) => setProfileForm({ ...profileForm, education_period: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.25)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>PROGRESS EXP BAR LABEL</label>
                  <input type="text" required value={profileForm.education_progress_label} onChange={(e) => setProfileForm({ ...profileForm, education_progress_label: e.target.value })} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.25)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.68rem", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
                    <span>PROGRESS PERCENTAGE</span>
                    <span style={{ color: "var(--accent-cyan)" }}>{profileForm.education_progress}%</span>
                  </label>
                  <input type="range" min="0" max="100" value={profileForm.education_progress} onChange={(e) => setProfileForm({ ...profileForm, education_progress: parseInt(e.target.value) })} style={{ width: "100%", accentColor: "var(--accent-cyan)", background: "rgba(0,0,0,0.5)", cursor: "pointer", height: "34px" }} />
                </div>
              </div>

              <button type="submit" className="hud-btn" style={{ padding: "12px 24px", fontSize: "0.75rem", alignSelf: "flex-start", marginTop: "12px" }}>
                SYNCHRONIZE SYSTEM STATS
              </button>
            </form>
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
