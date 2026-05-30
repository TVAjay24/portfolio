import { useState, useEffect } from "react";
import RevealSection from "./RevealSection";
import { Cpu, Zap, Edit2, Check, X, Edit, CheckSquare, Plus, Trash2 } from "lucide-react";

const AboutMe = ({ isAdmin }) => {
  const [stats, setStats] = useState({
    character_name: "AJAY",
    level: 26,
    xp_percent: 92,
    class: "CSE STUDENT",
    guild: "VVCE",
    hp_current: 980,
    hp_max: 980,
    mp_current: 920,
    mp_max: 1000,
    player_rank: "LV.26",
  });

  const [bioText, setBioText] = useState(
    "I am a first-year B.E. Computer Science student at Vidyavardhaka College of Engineering (VVCE), Mysuru, affiliated with VTU. Deeply passionate about modern web technologies and full-stack architecture, I also enjoy exploring game development, diving into immersive anime worlds, and building sleek, responsive systems that bridge functional design with engaging storytelling."
  );

  const [passiveSkills, setPassiveSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats edit state
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Bio edit state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editBioVal, setEditBioVal] = useState("");

  // Passive skill edit state
  const [editingPassiveId, setEditingPassiveId] = useState(null);
  const [passiveForm, setPassiveForm] = useState({ name: "", jp_name: "", description: "" });
  const [addPassiveOpen, setAddPassiveOpen] = useState(false);
  const [newPassive, setNewPassive] = useState({ name: "", jp_name: "", description: "" });

  const staticFallbackSkills = [
    {
      id: "fast_learner",
      name: "FAST LEARNER",
      jp_name: "急速な学習",
      description: "Adapting swiftly to novel system structures, coding stacks, and developer tools.",
    },
    {
      id: "creative_builder",
      name: "CREATIVE BUILDER",
      jp_name: "創造的創造物",
      description: "Architecting immersive designs, interactive HUD graphics, and detailed animations.",
    },
    {
      id: "otaku_core",
      name: "OTAKU CORE",
      jp_name: "オタク精神",
      description: "Drawing inspiration from story-rich games, detailed manga, and complex anime themes.",
    },
    {
      id: "problem_solver",
      name: "PROBLEM SOLVER",
      jp_name: "解決者",
      description: "Approaching logic bugs and algorithmic hurdles with a systematic C/Python process.",
    },
  ];

  const defaultStats = {
    character_name: "AJAY",
    level: 26,
    xp_percent: 92,
    class: "CSE STUDENT",
    guild: "VVCE",
    hp_current: 980,
    hp_max: 980,
    mp_current: 920,
    mp_max: 1000,
    player_rank: "LV.26",
    biography: "I am a first-year B.E. Computer Science student at Vidyavardhaka College of Engineering (VVCE), Mysuru, affiliated with VTU. Deeply passionate about modern web technologies and full-stack architecture, I also enjoy exploring game development, diving into immersive anime worlds, and building sleek, responsive systems that bridge functional design with engaging storytelling."
  };

  // Fetch real-time RPG stats & biography from localStorage
  useEffect(() => {
    let localProfile = localStorage.getItem("portfolio_profile");
    if (!localProfile) {
      localStorage.setItem("portfolio_profile", JSON.stringify(defaultStats));
      localProfile = JSON.stringify(defaultStats);
    }
    try {
      const parsedStats = JSON.parse(localProfile);
      setStats(parsedStats);
      if (parsedStats.biography) setBioText(parsedStats.biography);
    } catch (err) {
      console.warn("Error reading local stats cache.");
    }

    // Fetch dynamic passive traits from localStorage
    let localPassives = localStorage.getItem("portfolio_passives");
    if (!localPassives) {
      localStorage.setItem("portfolio_passives", JSON.stringify(staticFallbackSkills));
      localPassives = JSON.stringify(staticFallbackSkills);
    }
    try {
      setPassiveSkills(JSON.parse(localPassives));
    } catch (err) {
      setPassiveSkills(staticFallbackSkills);
    }
    setLoading(false);
  }, []);

  // Update RPG stats in localStorage
  const saveStatUpdate = (field, value) => {
    setStats((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "level") {
        next.player_rank = `LV.${value}`;
      }
      localStorage.setItem("portfolio_profile", JSON.stringify(next));
      return next;
    });
    setEditingField(null);
  };

  // Update biography narrative
  const handleSaveBio = () => {
    const trimmedBio = editBioVal.trim() || bioText;
    setBioText(trimmedBio);
    setStats((prev) => {
      const next = { ...prev, biography: trimmedBio };
      localStorage.setItem("portfolio_profile", JSON.stringify(next));
      return next;
    });
    setIsEditingBio(false);
  };

  // Edit passive skill triggers
  const startEditPassive = (skill) => {
    setEditingPassiveId(skill.id);
    setPassiveForm({
      name: skill.name,
      jp_name: skill.jp_name,
      description: skill.description,
    });
  };

  const handleSavePassive = (passiveId) => {
    const updated = {
      name: passiveForm.name,
      jp_name: passiveForm.jp_name,
      description: passiveForm.description,
    };

    setPassiveSkills((prev) => {
      const next = prev.map((s) => (s.id === passiveId ? { ...s, ...updated } : s));
      localStorage.setItem("portfolio_passives", JSON.stringify(next));
      return next;
    });

    setEditingPassiveId(null);
  };

  const handleAddPassive = (e) => {
    e.preventDefault();
    if (!newPassive.name.trim()) return;

    const insertedObj = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPassive.name,
      jp_name: newPassive.jp_name || "パッシブ",
      description: newPassive.description || "Synthesizing core parameters...",
      sort_order: passiveSkills.length + 1,
    };

    setPassiveSkills((prev) => {
      const next = [...prev, insertedObj];
      localStorage.setItem("portfolio_passives", JSON.stringify(next));
      return next;
    });

    setNewPassive({ name: "", jp_name: "", description: "" });
    setAddPassiveOpen(false);
  };

  const handleDeletePassive = (passiveId, name) => {
    if (!window.confirm(`DELETE PASSIVE TRAIT: "${name}"?`)) return;

    setPassiveSkills((prev) => {
      const next = prev.filter((s) => s.id !== passiveId);
      localStorage.setItem("portfolio_passives", JSON.stringify(next));
      return next;
    });
  };

  const getPassiveSkills = () => {
    return passiveSkills;
  };

  const handleEditClick = (field, currentVal) => {
    setEditingField(field);
    setEditValue(currentVal);
  };

  const renderStatRow = (label, field, type = "text") => {
    const isEditing = editingField === field;
    const value = stats[field];

    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px", alignItems: "center" }}>
        <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{label}:</span>
        {isEditing ? (
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "6px" }}>
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              style={{
                width: "90px",
                background: "rgba(8,15,30,0.8)",
                border: "1px solid var(--accent-purple)",
                color: "#fff",
                fontFamily: "var(--font-hud)",
                fontSize: "0.75rem",
                textAlign: "right",
                padding: "2px 4px",
                outline: "none",
              }}
            />
            <button
              onClick={() => saveStatUpdate(field, type === "number" ? parseInt(editValue) : editValue)}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--accent-cyan)", display: "flex", alignItems: "center" }}
            >
              <Check size={12} />
            </button>
            <button
              onClick={() => setEditingField(null)}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#ff4a4a", display: "flex", alignItems: "center" }}
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "4px" }}>
            <span style={{ textAlign: "right", color: field === "level" || field === "player_rank" ? "var(--accent-purple)" : field === "class" ? "var(--accent-cyan)" : "#fff", fontSize: "0.85rem", fontWeight: field === "level" || field === "player_rank" ? "900" : "400" }}>
              {value}
            </span>
            {isAdmin && (
              <button
                onClick={() => handleEditClick(field, value)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: "0 2px",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-cyan)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <Edit2 size={10} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const activePassives = getPassiveSkills();

  return (
    <RevealSection id="about" style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Title Divider */}
      <div className="section-divider">
        <h2 style={{ fontFamily: "var(--font-hud)", fontSize: "1.5rem", letterSpacing: "3px", color: "#fff" }}>
          02 // CHARACTER PROFILE
        </h2>
        <div className="section-divider-node">PROFILE</div>
        <div className="section-divider-line"></div>
        <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.8rem", color: "var(--text-muted)" }}>[自己紹介]</span>
      </div>

      <div className="rpg-grid">
        {/* Left Panel: RPG Stat Sheet */}
        <div className="hud-panel cyber-scanlines" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="hud-panel-bottom" />
          
          {/* Card Top Branding */}
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-hud)", fontSize: "0.7rem", color: "var(--accent-blue)" }}>
            <span>SEC_STATUS: SECURE</span>
            <span>ID: AJAY_8923</span>
          </div>

          {/* SVG Character Avatar Silhouette / Energy Core */}
          <div
            style={{
              height: "200px",
              width: "100%",
              border: "1px solid rgba(0, 210, 255, 0.1)",
              background: "rgba(2, 4, 8, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Holographic background rings */}
            <div
              style={{
                position: "absolute",
                width: "140px",
                height: "140px",
                border: "2px dashed var(--accent-cyan)",
                borderRadius: "50%",
                opacity: 0.25,
                animation: "spin-hud 25s linear infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "110px",
                height: "110px",
                border: "1px solid var(--accent-purple)",
                borderRadius: "50%",
                opacity: 0.3,
                animation: "spin-hud 15s linear infinite reverse",
              }}
            />
            <Cpu
              size={48}
              style={{
                color: "var(--accent-cyan)",
                filter: "drop-shadow(0 0 10px var(--accent-cyan))",
                zIndex: 2,
              }}
            />
            
            {/* Absolute indicator tags inside screen */}
            <div style={{ position: "absolute", top: "8px", left: "8px", fontFamily: "var(--font-hud)", fontSize: "0.55rem", color: "var(--accent-cyan)" }}>[CORE_MONITOR]</div>
            <div style={{ position: "absolute", bottom: "8px", right: "8px", fontFamily: "var(--font-hud)", fontSize: "0.55rem", color: "var(--accent-purple)" }}>ONLINE</div>
          </div>

          {/* Character Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: "var(--font-hud)" }}>
            {renderStatRow("CHARACTER", "character_name")}
            {renderStatRow("PLAYER RANK", "level", "number")}
            {renderStatRow("CLASS", "class")}
            {renderStatRow("GUILD", "guild")}

            {/* RPG Bars - HP */}
            <div style={{ marginTop: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", marginBottom: "4px" }}>
                <span style={{ color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: "2px" }}>
                  <Zap size={10} /> HP (STAMINA)
                </span>
                {editingField === "hp" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      style={{ width: "50px", background: "rgba(0,0,0,0.5)", border: "1px solid var(--accent-cyan)", color: "#fff", textAlign: "right", fontSize: "0.65rem", padding: "0 2px" }}
                    />
                    <button onClick={() => saveStatUpdate("hp_current", parseInt(editValue))} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--accent-cyan)" }}><Check size={10} /></button>
                  </div>
                ) : (
                  <span style={{ color: "#fff", display: "flex", alignItems: "center", gap: "4px" }}>
                    {stats.hp_current} / {stats.hp_max}
                    {isAdmin && (
                      <Edit2 size={8} style={{ color: "var(--text-muted)", cursor: "pointer" }} onClick={() => handleEditClick("hp", stats.hp_current)} />
                    )}
                  </span>
                )}
              </div>
              <div className="hud-bar-container">
                <div className="hud-bar-fill" style={{ width: `${(stats.hp_current / stats.hp_max) * 100}%` }}></div>
              </div>
            </div>

            {/* RPG Bars - MP */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", marginBottom: "4px" }}>
                <span style={{ color: "var(--accent-purple)", display: "flex", alignItems: "center", gap: "2px" }}>
                  <Zap size={10} /> MP (MANA / LOGIC)
                </span>
                {editingField === "mp" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      style={{ width: "50px", background: "rgba(0,0,0,0.5)", border: "1px solid var(--accent-purple)", color: "#fff", textAlign: "right", fontSize: "0.65rem", padding: "0 2px" }}
                    />
                    <button onClick={() => saveStatUpdate("mp_current", parseInt(editValue))} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--accent-purple)" }}><Check size={10} /></button>
                  </div>
                ) : (
                  <span style={{ color: "#fff", display: "flex", alignItems: "center", gap: "4px" }}>
                    {stats.mp_current} / {stats.mp_max}
                    {isAdmin && (
                      <Edit2 size={8} style={{ color: "var(--text-muted)", cursor: "pointer" }} onClick={() => handleEditClick("mp", stats.mp_current)} />
                    )}
                  </span>
                )}
              </div>
              <div className="hud-bar-container">
                <div className="hud-bar-fill hud-bar-fill-purple" style={{ width: `${(stats.mp_current / stats.mp_max) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Biography and Passive Traits Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Detailed Biography panel */}
          <div className="hud-panel" style={{ borderLeft: "4px solid var(--accent-blue)", position: "relative" }}>
            <div className="hud-panel-bottom" />
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontFamily: "var(--font-hud)", fontSize: "1rem", letterSpacing: "2px", color: "var(--accent-cyan)" }}>
                [ LOG_ENTRY // TRANSMISSION_RECEIVED ]
              </h3>
              {isAdmin && !isEditingBio && (
                <button
                  onClick={() => { setEditBioVal(bioText); setIsEditingBio(true); }}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-cyan)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                  title="EDIT BIOGRAPHY"
                >
                  <Edit size={14} />
                </button>
              )}
            </div>

            {isEditingBio ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <textarea
                  value={editBioVal}
                  onChange={(e) => setEditBioVal(e.target.value)}
                  rows="5"
                  style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid var(--accent-blue)", color: "#fff", padding: "8px", fontSize: "0.95rem", resize: "none", outline: "none" }}
                />
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button onClick={handleSaveBio} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--accent-cyan)" }}><Check size={16} /></button>
                  <button onClick={() => setIsEditingBio(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#ff4a4a" }}><X size={16} /></button>
                </div>
              </div>
            ) : (
              <p style={{ lineHeight: "1.8", color: "var(--text-secondary)", fontSize: "1.05rem" }}>
                {bioText}
              </p>
            )}
          </div>

          {/* Active Passive Traits Grid */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontFamily: "var(--font-hud)", fontSize: "0.9rem", letterSpacing: "3px", color: "#fff" }}>
                &gt;&gt; ACTIVE PASSIVE SKILLS
              </h3>
              {isAdmin && !addPassiveOpen && (
                <button
                  onClick={() => setAddPassiveOpen(true)}
                  className="hud-btn"
                  style={{ padding: "4px 10px", fontSize: "0.6rem", letterSpacing: "1px", borderColor: "var(--accent-cyan)" }}
                >
                  <Plus size={10} style={{ marginRight: "4px" }} /> ADD_TRAIT
                </button>
              )}
            </div>

            {addPassiveOpen && (
              <form
                onSubmit={handleAddPassive}
                className="hud-panel cyber-scanlines glitch-border"
                style={{
                  padding: "16px",
                  background: "rgba(9, 18, 37, 0.8)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div className="hud-panel-bottom" />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,210,255,0.2)", paddingBottom: "6px" }}>
                  <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.7rem", color: "var(--accent-cyan)", fontWeight: "700" }}>[ INJECT_PASSIVE_TRAIT ]</span>
                  <X size={12} style={{ color: "var(--text-secondary)", cursor: "pointer" }} onClick={() => setAddPassiveOpen(false)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <input
                    type="text"
                    required
                    placeholder="Trait Name (e.g. FAST LEARNER)"
                    value={newPassive.name}
                    onChange={(e) => setNewPassive({ ...newPassive, name: e.target.value })}
                    style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem", fontFamily: "var(--font-hud)" }}
                  />
                  <input
                    type="text"
                    placeholder="Japanese label"
                    value={newPassive.jp_name}
                    onChange={(e) => setNewPassive({ ...newPassive, jp_name: e.target.value })}
                    style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem", fontFamily: "var(--font-jp)" }}
                  />
                </div>
                <textarea
                  required
                  placeholder="Synthesize passive description..."
                  value={newPassive.description}
                  onChange={(e) => setNewPassive({ ...newPassive, description: e.target.value })}
                  rows="2"
                  style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "6px", fontSize: "0.75rem", resize: "none" }}
                />
                <button type="submit" className="hud-btn" style={{ padding: "4px 12px", fontSize: "0.65rem", alignSelf: "flex-start" }}>COMPILE TRAIT</button>
              </form>
            )}
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              {activePassives.map((skill) => {
                const isEditingPassive = editingPassiveId === skill.id;

                return (
                  <div
                    key={skill.id}
                    className="hud-panel glitch-border"
                    style={{
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      position: "relative",
                    }}
                  >
                    <div className="hud-panel-bottom" />
                    
                    {isEditingPassive ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.7rem", fontFamily: "var(--font-hud)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--accent-purple)", fontWeight: "700" }}>[ EDIT_TRAIT ]</span>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <Check size={12} style={{ color: "var(--accent-cyan)", cursor: "pointer" }} onClick={() => handleSavePassive(skill.id)} />
                            <X size={12} style={{ color: "#ff4a4a", cursor: "pointer" }} onClick={() => setEditingPassiveId(null)} />
                          </div>
                        </div>
                        <input
                          type="text"
                          value={passiveForm.name}
                          onChange={(e) => setPassiveForm({ ...passiveForm, name: e.target.value })}
                          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "2px", fontSize: "0.7rem" }}
                        />
                        <input
                          type="text"
                          value={passiveForm.jp_name}
                          onChange={(e) => setPassiveForm({ ...passiveForm, jp_name: e.target.value })}
                          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "2px", fontSize: "0.7rem", fontFamily: "var(--font-jp)" }}
                        />
                        <textarea
                          value={passiveForm.description}
                          onChange={(e) => setPassiveForm({ ...passiveForm, description: e.target.value })}
                          rows="2"
                          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.7rem", resize: "none" }}
                        />
                      </div>
                    ) : (
                      <>
                        {/* Skill Heading */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.75rem", letterSpacing: "1px", color: "var(--accent-cyan)" }}>
                            [{skill.name}]
                          </span>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <span style={{ fontFamily: "var(--font-jp)", fontSize: "0.6rem", color: "var(--text-muted)" }}>
                              {skill.jp_name || skill.jpName}
                            </span>
                            {isAdmin && skill.id && (
                              <div style={{ display: "flex", gap: "4px" }}>
                                <Edit size={10} style={{ color: "var(--text-secondary)", cursor: "pointer" }} onClick={() => startEditPassive(skill)} />
                                <Trash2 size={10} style={{ color: "#ff4a4a", cursor: "pointer" }} onClick={() => handleDeletePassive(skill.id, skill.name)} />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div style={{ width: "20px", height: "2px", backgroundColor: "var(--accent-purple)" }} />
                        
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                          {skill.description || skill.desc}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </RevealSection>
  );
};

export default AboutMe;
