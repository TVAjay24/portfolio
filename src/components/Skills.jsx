import { useState, useEffect } from "react";
import RevealSection from "./RevealSection";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabase";
import { Code, Terminal, Server, Database, Settings, Trash2, Plus, Check, X, Edit } from "lucide-react";

const Skills = ({ isAdmin }) => {
  const [activeCat, setActiveCat] = useState("languages");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin state for adding skills
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(80);
  const [newSkillDesc, setNewSkillDesc] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  // Admin state for editing skills inline
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [editSkillForm, setEditSkillForm] = useState({ name: "", level: 80, description: "" });

  const categories = [
    { id: "languages", name: "LANGUAGES", icon: Terminal, jpName: "言語" },
    { id: "frontend", name: "FRONTEND", icon: Code, jpName: "フロント" },
    { id: "backend", name: "BACKEND", icon: Server, jpName: "バックエンド" },
    { id: "database", name: "DATABASE", icon: Database, jpName: "データベース" },
    { id: "tools", name: "SYSTEM TOOLS", icon: Settings, jpName: "ツール" },
  ];

  // Static fallback data to guarantee visual safety during setup
  const staticFallback = {
    languages: [
      { name: "JavaScript", level: 90, description: "Primary logic syntax for web scripts and interactive systems." },
      { name: "Python", level: 85, description: "Used for general computations, automation scripts, and backend prototypes." },
      { name: "C Language", level: 80, description: "Foundational syntax for memory structures and pointer algorithms." },
    ],
    frontend: [
      { name: "React", level: 88, description: "Standard client blueprint compiler for interactive SPA nodes." },
      { name: "Vite", level: 85, description: "Modern frontend build engine with rapid virtual hot-reloading." },
      { name: "HTML5", level: 95, description: "Structure markup parser for digital layouts and DOM frameworks." },
      { name: "CSS3", level: 90, description: "Styling sheet compiler using responsive grids, shapes, and custom glows." },
    ],
    backend: [
      { name: "Node.js", level: 80, description: "Runtime compiler for executing JavaScript logic on the server mainframe." },
      { name: "Express.js", level: 82, description: "Routing server blueprint library for standard REST API endpoints." },
    ],
    database: [
      { name: "Supabase", level: 85, description: "Digital database cluster mapping custom authentication and tables." },
      { name: "PostgreSQL", level: 80, description: "Relational database server using rigid schemas and secure logic queries." },
      { name: "MongoDB", level: 78, description: "Document database storage using dynamic JSON schema models." },
    ],
    tools: [
      { name: "Git", level: 85, description: "Main version logger and branch management database tool." },
      { name: "GitHub", level: 88, description: "Remote terminal server for online repository backups." },
      { name: "VS Code", level: 92, description: "Primary IDE workspace styled with keybind maps and extensions." },
    ],
  };

  // Fetch real-time skills from Supabase
  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setSkills(data);
      }
    } catch (err) {
      console.warn("Database skills missing or offline, loading static backup:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // Map database entries to UI categories, falling back to static schema if blank
  const getCategorizedSkills = (catId) => {
    const dbFiltered = skills.filter((s) => s.category === catId);
    return dbFiltered.length > 0 ? dbFiltered : staticFallback[catId];
  };

  // Add new skill node in active category
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      const categorySkills = skills.filter((s) => s.category === activeCat);
      const newSkill = {
        category: activeCat,
        name: newSkillName,
        level: parseInt(newSkillLevel),
        description: newSkillDesc || "Standard logical system module.",
        sort_order: categorySkills.length + 1,
      };

      const { data, error } = await supabase
        .from("skills")
        .insert([newSkill])
        .select();

      if (error) throw error;

      if (data) {
        setSkills((prev) => [...prev, data[0]]);
        setNewSkillName("");
        setNewSkillDesc("");
        setNewSkillLevel(80);
        setFormOpen(false);
      }
    } catch (err) {
      alert("Failed to insert skill: " + err.message);
    }
  };

  // Remove skill node
  const handleDeleteSkill = async (skillId, skillName) => {
    if (!window.confirm(`DISSOLVE ABILITY NODE: "${skillName}"?`)) return;

    try {
      const { error } = await supabase
        .from("skills")
        .delete()
        .eq("id", skillId);

      if (error) throw error;

      setSkills((prev) => prev.filter((s) => s.id !== skillId));
    } catch (err) {
      alert("Failed to delete skill: " + err.message);
    }
  };

  // Inline edit handlers
  const handleEditClick = (s) => {
    setEditingSkillId(s.id);
    setEditSkillForm({
      name: s.name,
      level: s.level,
      description: s.description || "",
    });
  };

  const handleSaveSkillEdit = async (skillId) => {
    try {
      const updatedSkill = {
        name: editSkillForm.name.trim(),
        level: parseInt(editSkillForm.level),
        description: editSkillForm.description.trim(),
      };

      // Only attempt write if ID is standard uuid (i.e. not static fallback string)
      if (typeof skillId === "string" && skillId.length > 20) {
        const { error } = await supabase
          .from("skills")
          .update(updatedSkill)
          .eq("id", skillId);

        if (error) throw error;
      }

      // Sync local state
      setSkills((prev) => {
        const listToMap = prev.length > 0 ? prev : staticFallback[activeCat];
        return listToMap.map((s) => (s.id === skillId ? { ...s, ...updatedSkill } : s));
      });

      setEditingSkillId(null);
    } catch (err) {
      alert("Database error: " + err.message);
    }
  };

  const activeSkillsList = getCategorizedSkills(activeCat);

  return (
    <RevealSection id="skills" style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Section Header Divider */}
      <div className="section-divider">
        <h2 style={{ fontFamily: "var(--font-hud)", fontSize: "1.5rem", letterSpacing: "3px", color: "#fff" }}>
          03 // ACTIVE ABILITIES
        </h2>
        <div className="section-divider-node">ABILITIES</div>
        <div className="section-divider-line"></div>
        <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.8rem", color: "var(--text-muted)" }}>[能力グリッド]</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Category console selectors */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            background: "rgba(2, 4, 8, 0.4)",
            border: "1px solid rgba(0, 210, 255, 0.1)",
            padding: "8px",
            borderRadius: "4px",
          }}
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCat === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCat(cat.id);
                  setFormOpen(false);
                }}
                className={`hud-btn ${isActive ? "" : "hud-btn-purple"}`}
                style={{
                  padding: "10px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.75rem",
                  letterSpacing: "1.5px",
                  color: isActive ? "var(--bg-darker)" : "var(--text-secondary)",
                  background: isActive ? "var(--accent-blue)" : "transparent",
                  borderColor: isActive ? "var(--accent-cyan)" : "rgba(189, 0, 255, 0.3)",
                  flexGrow: 1,
                  justifyContent: "center",
                }}
              >
                <Icon size={14} />
                <span>{cat.name}</span>
                <span
                  style={{
                    fontFamily: "var(--font-jp)",
                    fontSize: "0.55rem",
                    color: isActive ? "var(--bg-darker)" : "var(--text-muted)",
                    marginLeft: "4px",
                  }}
                >
                  [{cat.jpName}]
                </span>
              </button>
            );
          })}
        </div>

        {/* Ability Nodes Grid */}
        <div style={{ minHeight: "260px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCat}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {activeSkillsList.map((skill, idx) => {
                  const isEditing = editingSkillId === skill.id;

                  return (
                    <div
                      key={skill.id || idx}
                      className="hud-panel cyber-scanlines"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        padding: "20px",
                        borderLeft: `3px solid ${activeCat === "frontend" || activeCat === "languages" ? "var(--accent-cyan)" : "var(--accent-purple)"}`,
                      }}
                    >
                      <div className="hud-panel-bottom" />

                      {isEditing ? (
                        /* Inline Edit Mode Form */
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <label style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>NODE NAME</label>
                            <input
                              type="text"
                              value={editSkillForm.name}
                              onChange={(e) => setEditSkillForm({ ...editSkillForm, name: e.target.value })}
                              style={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "6px", fontSize: "0.8rem", outline: "none" }}
                            />
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <label style={{ fontSize: "0.65rem", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
                              <span>LEVEL</span>
                              <span>{editSkillForm.level}%</span>
                            </label>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              value={editSkillForm.level}
                              onChange={(e) => setEditSkillForm({ ...editSkillForm, level: parseInt(e.target.value) })}
                              style={{ width: "100%", accentColor: "var(--accent-cyan)", cursor: "pointer" }}
                            />
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <label style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>DESCRIPTION</label>
                            <textarea
                              value={editSkillForm.description}
                              onChange={(e) => setEditSkillForm({ ...editSkillForm, description: e.target.value })}
                              rows="2"
                              style={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "6px", fontSize: "0.78rem", outline: "none", resize: "none" }}
                            />
                          </div>

                          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                            <button
                              onClick={() => handleSaveSkillEdit(skill.id)}
                              className="hud-btn"
                              style={{ padding: "4px 8px", fontSize: "0.65rem", display: "flex", alignItems: "center", gap: "4px" }}
                            >
                              <Check size={10} /> SAVE
                            </button>
                            <button
                              onClick={() => setEditingSkillId(null)}
                              className="hud-btn hud-btn-purple"
                              style={{ padding: "4px 8px", fontSize: "0.65rem", display: "flex", alignItems: "center", gap: "4px" }}
                            >
                              <X size={10} /> CANCEL
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Static Reading Mode Card */
                        <>
                          {/* Node Heading */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.95rem", letterSpacing: "1px", fontWeight: "700" }}>
                              {skill.name}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span
                                style={{
                                  fontFamily: "var(--font-hud)",
                                  fontSize: "0.75rem",
                                  color: activeCat === "frontend" || activeCat === "languages" ? "var(--accent-cyan)" : "var(--accent-purple)",
                                  fontWeight: "900",
                                  textShadow: activeCat === "frontend" || activeCat === "languages" ? "var(--neon-glow-cyan)" : "var(--neon-glow-purple)",
                                }}
                              >
                                LV. {skill.level}
                              </span>
                              {isAdmin && skill.id && (
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <button
                                    onClick={() => handleEditClick(skill)}
                                    style={{
                                      background: "transparent",
                                      border: "none",
                                      cursor: "pointer",
                                      color: "var(--accent-cyan)",
                                      display: "flex",
                                      alignItems: "center",
                                      padding: 0,
                                    }}
                                    title="EDIT NODE"
                                  >
                                    <Edit size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSkill(skill.id, skill.name)}
                                    style={{
                                      background: "transparent",
                                      border: "none",
                                      cursor: "pointer",
                                      color: "#ff4a4a",
                                      display: "flex",
                                      alignItems: "center",
                                      padding: 0,
                                    }}
                                    title="DISSOLVE NODE"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Level Progress Gauge Bar */}
                          <div>
                            <div className="hud-bar-container" style={{ height: "8px" }}>
                              <div
                                className={`hud-bar-fill ${activeCat === "frontend" || activeCat === "languages" ? "" : "hud-bar-fill-purple"}`}
                                style={{ width: `${skill.level}%` }}
                              />
                            </div>
                          </div>

                          {/* Skill Context Description */}
                          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                            {skill.description}
                          </p>

                          {/* Micro crosshair decorative visualizer */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.4 }}>
                            <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.55rem", color: "var(--text-muted)" }}>
                              ID: {skill.id ? skill.id.slice(0, 8) : `STATIC_0${idx + 1}`}
                            </span>
                            <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.5rem" }}>
                              [ SYS_OK // NOD_0{idx + 1} ]
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Admin Form: Add New Skill */}
              {isAdmin && (
                <div style={{ marginTop: "12px" }}>
                  {!formOpen ? (
                    <button
                      onClick={() => setFormOpen(true)}
                      className="hud-btn"
                      style={{
                        padding: "10px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.75rem",
                        borderColor: "var(--accent-cyan)",
                        boxShadow: "0 0 10px rgba(0, 255, 196, 0.15)",
                      }}
                    >
                      <Plus size={14} />
                      <span>ACTIVATE NEW ABILITY NODE [ {activeCat.toUpperCase()} ]</span>
                    </button>
                  ) : (
                    <form
                      onSubmit={handleAddSkill}
                      className="hud-panel cyber-scanlines glitch-border"
                      style={{
                        padding: "24px",
                        background: "rgba(9, 18, 37, 0.8)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        maxWidth: "500px",
                      }}
                    >
                      <div className="hud-panel-bottom" />
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0, 210, 255, 0.1)", paddingBottom: "8px" }}>
                        <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.8rem", color: "var(--accent-cyan)", fontWeight: "700" }}>
                          [ ABILITY_NODE_INJECTION_SHELL ]
                        </span>
                        <X size={14} style={{ color: "var(--text-secondary)", cursor: "pointer" }} onClick={() => setFormOpen(false)} />
                      </div>

                      <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontFamily: "var(--font-hud)", fontSize: "0.7rem", color: "var(--text-secondary)" }}>NODE NAME (e.g. Docker)</label>
                          <input
                            type="text"
                            required
                            value={newSkillName}
                            onChange={(e) => setNewSkillName(e.target.value)}
                            placeholder="Enter system label"
                            style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", padding: "8px", color: "#fff", outline: "none", fontSize: "0.8rem", fontFamily: "var(--font-hud)" }}
                          />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontFamily: "var(--font-hud)", fontSize: "0.7rem", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
                            <span>ABILITY LEVEL</span>
                            <span>{newSkillLevel}%</span>
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={newSkillLevel}
                            onChange={(e) => setNewSkillLevel(e.target.value)}
                            style={{ width: "100%", accentColor: "var(--accent-cyan)", background: "rgba(0,0,0,0.5)", cursor: "pointer" }}
                          />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontFamily: "var(--font-hud)", fontSize: "0.7rem", color: "var(--text-secondary)" }}>FUNCTION DESCRIPTION</label>
                          <textarea
                            value={newSkillDesc}
                            onChange={(e) => setNewSkillDesc(e.target.value)}
                            placeholder="Synthesize compiler behavior..."
                            rows="2"
                            style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", padding: "8px", color: "#fff", outline: "none", fontSize: "0.8rem", resize: "none" }}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="hud-btn"
                        style={{
                          padding: "8px 16px",
                          fontSize: "0.75rem",
                          alignSelf: "flex-start",
                        }}
                      >
                        COMPILE NODE
                      </button>
                    </form>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </RevealSection>
  );
};

export default Skills;
