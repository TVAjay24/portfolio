import { useState, useEffect } from "react";
import RevealSection from "./RevealSection";
import { ExternalLink, Trophy, Compass, Edit, Check, X, Star, Plus, Trash2 } from "lucide-react";
import { supabase } from "../supabase";

const GithubIcon = ({ size = 16, className }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Projects = ({ isAdmin }) => {
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quest Edit state
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    jp_name: "",
    type: "MAIN QUEST",
    difficulty: "MEDIUM",
    status: "IN PROGRESS",
    description: "",
    loot: "",
    github: "",
    live: "",
  });

  // Quest Add state
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [newQuest, setNewQuest] = useState({
    name: "",
    jp_name: "",
    type: "MAIN QUEST",
    difficulty: "MEDIUM",
    status: "IN PROGRESS",
    description: "",
    loot: "",
    github: "",
    live: "",
  });

  const staticFallback = [
    {
      id: "campuslink",
      type: "MAIN QUEST",
      name: "CampusLink",
      jp_name: "キャンパスリンク",
      status: "IN PROGRESS",
      difficulty: "HARD",
      description: "A comprehensive full-stack campus community web application custom engineered for Vidyavardhaka College of Engineering (VVCE) students. Features include an active peer Marketplace, Event coordinates, open discussion Forum boards, group messaging nodes, and personal Connection Wishlists.",
      loot: ["React + Vite", "Node.js", "Express.js", "Supabase", "PostgreSQL"],
      github: "https://github.com/ajayotaku2-dev/CampusLink",
      live: "#",
    },
    {
      id: "campusfinance",
      type: "HACKATHON QUEST",
      name: "CampusFinance",
      jp_name: "キャンパスファイナンス",
      status: "IN PROGRESS",
      difficulty: "MEDIUM",
      description: "A student-centric financial micro-budgeting dashboard built under tight hackathon timelines. Empowers students to log daily expenditures, track scholarship/grant allocations, and visualize monthly budgeting structures to curb college costs.",
      loot: ["React", "Node.js", "Express.js", "Supabase"],
      github: "https://github.com/ajayotaku2-dev/CampusFinance",
      live: "#",
    },
  ];
  // Fetch real-time projects/quests from Supabase
  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        const mappedData = (data || []).map((p) => ({
          id: p.id,
          name: p.title || "",
          jp_name: p.jp_name || p.title || "プロジェクト",
          type: p.type || (p.featured ? "MAIN QUEST" : "SIDE QUEST"),
          difficulty: p.difficulty || (p.featured ? "HARD" : "MEDIUM"),
          status: p.status || "IN PROGRESS",
          description: p.description || "",
          loot: p.tech_stack || [],
          github: p.github_url || "#",
          live: p.live_url || "#",
          sort_order: p.sort_order || 0,
        }));
        setProjectsList(mappedData);
      }
    } catch (err) {
      console.error("Supabase fetch projects failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);
  const getProjects = () => {
    return projectsList;
  };

  const handleEditClick = (p) => {
    setEditingProjectId(p.id);
    setEditForm({
      name: p.name,
      jp_name: p.jp_name,
      type: p.type || "MAIN QUEST",
      difficulty: p.difficulty,
      status: p.status,
      description: p.description,
      loot: p.loot.join(", "),
      github: p.github,
      live: p.live,
    });
  };

  const handleSaveQuest = (projectId) => {
    const updatedProject = {
      id: projectId,
      name: editForm.name,
      jp_name: editForm.jp_name,
      type: editForm.type,
      difficulty: editForm.difficulty,
      status: editForm.status,
      description: editForm.description,
      loot: editForm.loot.split(",").map((t) => t.trim()).filter(Boolean),
      github: editForm.github,
      live: editForm.live,
    };

    const nextList = projectsList.map((p) => (p.id === projectId ? { ...p, ...updatedProject } : p));
    setProjectsList(nextList);

    // Save back to localStorage in CMS format
    const cmsFormat = nextList.map(p => ({
      id: p.id,
      title: p.name,
      description: p.description,
      tech_stack: p.loot,
      github_url: p.github,
      live_url: p.live,
      date: "2025"
    }));
    localStorage.setItem("portfolio_projects", JSON.stringify(cmsFormat));

    setEditingProjectId(null);
  };

  const handleCreateQuest = (e) => {
    e.preventDefault();
    if (!newQuest.name.trim()) return;

    const insertPayload = {
      id: Math.random().toString(36).substr(2, 9),
      name: newQuest.name.trim(),
      jp_name: newQuest.jp_name.trim() || "クエスト",
      type: newQuest.type,
      difficulty: newQuest.difficulty,
      status: newQuest.status,
      description: newQuest.description.trim() || "Synthesizing quest parameters...",
      loot: newQuest.loot.split(",").map((l) => l.trim()).filter(Boolean),
      github: newQuest.github.trim() || "#",
      live: newQuest.live.trim() || "#",
      sort_order: projectsList.length + 1,
    };

    const nextList = [...projectsList, insertPayload];
    setProjectsList(nextList);

    const cmsFormat = nextList.map(p => ({
      id: p.id,
      title: p.name,
      description: p.description,
      tech_stack: p.loot,
      github_url: p.github,
      live_url: p.live,
      date: "2025"
    }));
    localStorage.setItem("portfolio_projects", JSON.stringify(cmsFormat));

    setNewQuest({
      name: "",
      jp_name: "",
      type: "MAIN QUEST",
      status: "IN PROGRESS",
      difficulty: "MEDIUM",
      description: "",
      loot: "",
      github: "",
      live: "",
    });
    setAddFormOpen(false);
  };

  const handleDeleteQuest = (projectId, name) => {
    if (!window.confirm(`DISSOLVE QUEST LOG: "${name}"?`)) return;

    const nextList = projectsList.filter((p) => p.id !== projectId);
    setProjectsList(nextList);

    const cmsFormat = nextList.map(p => ({
      id: p.id,
      title: p.name,
      description: p.description,
      tech_stack: p.loot,
      github_url: p.github,
      live_url: p.live,
      date: "2025"
    }));
    localStorage.setItem("portfolio_projects", JSON.stringify(cmsFormat));
  };

  const currentQuests = getProjects();
  return (
    <RevealSection id="projects" style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Section Divider */}
      <div className="section-divider">
        <h2 style={{ fontFamily: "var(--font-hud)", fontSize: "1.5rem", letterSpacing: "3px", color: "#fff" }}>
          04 // ACTIVE QUEST LOG
        </h2>
        <div className="section-divider-node">QUESTS</div>
        <div className="section-divider-line"></div>
        <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.8rem", color: "var(--text-muted)" }}>[開発プロジェクト]</span>
      </div>

      {/* Admin Action: Add Quest Trigger */}
      {isAdmin && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
          {!addFormOpen ? (
            <button
              onClick={() => setAddFormOpen(true)}
              className="hud-btn"
              style={{
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.75rem",
                borderColor: "var(--accent-cyan)",
                boxShadow: "0 0 10px rgba(0, 255, 196, 0.15)",
              }}
            >
              <Plus size={14} />
              <span>ACTIVATE NEW MAIN/SIDE QUEST</span>
            </button>
          ) : (
            <form
              onSubmit={handleCreateQuest}
              className="hud-panel cyber-scanlines glitch-border"
              style={{
                padding: "24px",
                background: "rgba(9, 18, 37, 0.9)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                width: "100%",
                maxWidth: "600px",
                margin: "0 auto 24px",
                fontFamily: "var(--font-hud)",
                fontSize: "0.8rem",
              }}
            >
              <div className="hud-panel-bottom" />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0, 210, 255, 0.2)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>[ QUEST_INJECTION_SHELL ]</span>
                <X size={14} style={{ color: "var(--text-secondary)", cursor: "pointer" }} onClick={() => setAddFormOpen(false)} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Name & Subtitle */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>QUEST NAME</label>
                    <input
                      type="text"
                      required
                      value={newQuest.name}
                      onChange={(e) => setNewQuest({ ...newQuest, name: e.target.value })}
                      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", fontFamily: "var(--font-hud)", outline: "none" }}
                      placeholder="e.g. CampusLink"
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>JAPANESE TRANSLATION</label>
                    <input
                      type="text"
                      value={newQuest.jp_name}
                      onChange={(e) => setNewQuest({ ...newQuest, jp_name: e.target.value })}
                      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", fontFamily: "var(--font-jp)", outline: "none" }}
                      placeholder="e.g. キャンパスリンク"
                    />
                  </div>
                </div>

                {/* Quest classification & Difficulty */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>CLASSIFICATION</label>
                    <select
                      value={newQuest.type}
                      onChange={(e) => setNewQuest({ ...newQuest, type: e.target.value })}
                      style={{ background: "rgba(9, 18, 37, 0.95)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", fontFamily: "var(--font-hud)", outline: "none" }}
                    >
                      <option value="MAIN QUEST">MAIN QUEST</option>
                      <option value="SIDE QUEST">SIDE QUEST</option>
                      <option value="HACKATHON QUEST">HACKATHON QUEST</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>DIFFICULTY RATING</label>
                    <select
                      value={newQuest.difficulty}
                      onChange={(e) => setNewQuest({ ...newQuest, difficulty: e.target.value })}
                      style={{ background: "rgba(9, 18, 37, 0.95)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", fontFamily: "var(--font-hud)", outline: "none" }}
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                  </div>
                </div>

                {/* Quest State */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>QUEST STATE</label>
                  <select
                    value={newQuest.status}
                    onChange={(e) => setNewQuest({ ...newQuest, status: e.target.value })}
                    style={{ background: "rgba(9, 18, 37, 0.95)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", fontFamily: "var(--font-hud)", outline: "none" }}
                  >
                    <option value="IN PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>

                {/* Description */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>QUEST NARRATIVE DESCRIPTION</label>
                  <textarea
                    value={newQuest.description}
                    onChange={(e) => setNewQuest({ ...newQuest, description: e.target.value })}
                    rows="3"
                    style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", resize: "none", outline: "none" }}
                    placeholder="Enter detailed objective description..."
                  />
                </div>

                {/* Loot */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>QUEST LOOT drops (comma separated)</label>
                  <input
                    type="text"
                    value={newQuest.loot}
                    onChange={(e) => setNewQuest({ ...newQuest, loot: e.target.value })}
                    placeholder="React, Node.js, Supabase, PostgreSQL"
                    style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }}
                  />
                </div>

                {/* Coordinates */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>SOURCE LINK (GITHUB)</label>
                    <input
                      type="text"
                      value={newQuest.github}
                      onChange={(e) => setNewQuest({ ...newQuest, github: e.target.value })}
                      placeholder="https://github.com/..."
                      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>LAUNCH LINK (LIVE)</label>
                    <input
                      type="text"
                      value={newQuest.live}
                      onChange={(e) => setNewQuest({ ...newQuest, live: e.target.value })}
                      placeholder="https://..."
                      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="hud-btn"
                style={{
                  padding: "8px 16px",
                  fontSize: "0.75rem",
                  alignSelf: "flex-start",
                  marginTop: "8px",
                }}
              >
                COMPILE QUEST
              </button>
            </form>
          )}
        </div>
      )}

      {/* Projects Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "28px",
        }}
      >
        {currentQuests.map((project, idx) => {
          const isEditing = editingProjectId === project.id;

          return (
            <div
              key={project.id || idx}
              className="hud-panel cyber-scanlines glitch-border"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                background: "rgba(6, 14, 28, 0.6)",
                minHeight: "450px",
                position: "relative",
              }}
            >
              {/* Card corner decorator */}
              <div className="hud-panel-bottom" />

              {isEditing ? (
                // Administrative HUD Quest Editor Form
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: "var(--font-hud)", fontSize: "0.8rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,210,255,0.2)", paddingBottom: "8px" }}>
                    <span style={{ color: "var(--accent-purple)", fontWeight: "700" }}>[ QUEST_EDITOR_SHELL ]</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Check size={14} style={{ color: "var(--accent-cyan)", cursor: "pointer" }} onClick={() => handleSaveQuest(project.id)} />
                      <X size={14} style={{ color: "#ff4a4a", cursor: "pointer" }} onClick={() => setEditingProjectId(null)} />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {/* Name & Subtitle */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <label style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>QUEST NAME</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem" }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <label style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>JAPANESE TRANSLATION</label>
                        <input
                          type="text"
                          value={editForm.jp_name}
                          onChange={(e) => setEditForm({ ...editForm, jp_name: e.target.value })}
                          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem", fontFamily: "var(--font-jp)" }}
                        />
                      </div>
                    </div>

                    {/* Quest classification & Rating */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <label style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>CLASSIFICATION</label>
                        <select
                          value={editForm.type}
                          onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                          style={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem" }}
                        >
                          <option value="MAIN QUEST">MAIN QUEST</option>
                          <option value="SIDE QUEST">SIDE QUEST</option>
                          <option value="HACKATHON QUEST">HACKATHON QUEST</option>
                        </select>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <label style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>DIFFICULTY RATING</label>
                        <select
                          value={editForm.difficulty}
                          onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                          style={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem" }}
                        >
                          <option value="EASY">EASY</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HARD">HARD</option>
                        </select>
                      </div>
                    </div>

                    {/* Quest Status */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <label style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>QUEST STATE</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        style={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem" }}
                      >
                        <option value="IN PROGRESS">IN PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </div>

                    {/* Description */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <label style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>QUEST NARRATIVE DESCRIPTION</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows="3"
                        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "6px", fontSize: "0.75rem", resize: "none" }}
                      />
                    </div>

                    {/* Loot (Comma separated tech) */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <label style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>QUEST LOOT drop items (comma separated)</label>
                      <input
                        type="text"
                        value={editForm.loot}
                        onChange={(e) => setEditForm({ ...editForm, loot: e.target.value })}
                        placeholder="React, Node.js, Supabase"
                        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem" }}
                      />
                    </div>

                    {/* Coordinates */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <label style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>SOURCE LINK (GITHUB)</label>
                        <input
                          type="text"
                          value={editForm.github}
                          onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem" }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <label style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>LAUNCH LINK (LIVE)</label>
                        <input
                          type="text"
                          value={editForm.live}
                          onChange={(e) => setEditForm({ ...editForm, live: e.target.value })}
                          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Public Standard HUD Quest display card
                <>
                  {/* Header: Quest classification & Rating */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontFamily: "var(--font-hud)",
                      fontSize: "0.65rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-purple)" }}>
                      <Compass size={12} />
                      <span>[{project.type || "MAIN QUEST"}]</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <div
                        style={{
                          color: project.difficulty === "HARD" ? "var(--accent-cyan)" : "var(--accent-blue)",
                          border: `1px solid ${project.difficulty === "HARD" ? "rgba(0, 255, 196, 0.2)" : "rgba(0, 210, 255, 0.2)"}`,
                          background: project.difficulty === "HARD" ? "rgba(0, 255, 196, 0.05)" : "rgba(0, 210, 255, 0.05)",
                          padding: "2px 8px",
                          borderRadius: "2px",
                        }}
                      >
                        DIFF: {project.difficulty}
                      </div>
                      {isAdmin && (
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <button
                            onClick={() => handleEditClick(project)}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              color: "var(--text-secondary)",
                              display: "flex",
                              alignItems: "center",
                              padding: 0,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-cyan)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                            title="EDIT QUEST DATA"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuest(project.id, project.name)}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              color: "#ff4a4a",
                              display: "flex",
                              alignItems: "center",
                              padding: 0,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6b6b")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#ff4a4a")}
                            title="DISSOLVE QUEST LOG"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}                    </div>
                  </div>

                  {/* Title Block */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <h3
                        className="text-glow-blue"
                        style={{
                          fontFamily: "var(--font-hud)",
                          fontSize: "1.4rem",
                          fontWeight: "900",
                          letterSpacing: "1px",
                          color: "#fff",
                        }}
                      >
                        {project.name}
                      </h3>
                      <span
                        style={{
                          fontFamily: "var(--font-hud)",
                          fontSize: "0.65rem",
                          color: "var(--accent-cyan)",
                          fontWeight: "700",
                        }}
                      >
                        [ {project.status} ]
                      </span>
                    </div>
                    <span style={{ fontFamily: "var(--font-jp)", fontSize: "0.65rem", color: "var(--text-muted)" }}>
                      {project.jp_name}
                    </span>
                  </div>

                  <div className="diagonal-stripes" />

                  {/* Description */}
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                      lineHeight: "1.6",
                      flexGrow: 1,
                    }}
                  >
                    {project.description}
                  </p>

                  {/* Tech loot drops */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-hud)",
                        fontSize: "0.65rem",
                        color: "var(--accent-purple)",
                        letterSpacing: "1.5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Trophy size={11} /> QUEST_LOOT (TECH_STACK):
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {project.loot.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--text-primary)",
                            border: "1px solid rgba(0, 210, 255, 0.15)",
                            background: "rgba(0, 210, 255, 0.03)",
                            padding: "4px 8px",
                            borderRadius: "2px",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--accent-cyan)";
                            e.currentTarget.style.boxShadow = "var(--neon-glow-cyan)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "rgba(0, 210, 255, 0.15)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Button links */}
                  <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      style={{ flexGrow: 1, textDecoration: "none" }}
                    >
                      <button
                        className="hud-btn hud-btn-purple"
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          padding: "8px 12px",
                          fontSize: "0.7rem",
                        }}
                      >
                        <GithubIcon size={12} /> SOURCE_CODE
                      </button>
                    </a>
                    <a href={project.live} style={{ flexGrow: 1, textDecoration: "none" }}>
                      <button
                        className="hud-btn"
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          padding: "8px 12px",
                          fontSize: "0.7rem",
                        }}
                      >
                        <ExternalLink size={12} /> LAUNCH_QUEST
                      </button>
                    </a>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </RevealSection>
  );
};

export default Projects;
