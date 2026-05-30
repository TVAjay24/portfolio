import { useState, useEffect } from "react";
import RevealSection from "./RevealSection";
import { supabase } from "../supabase";
import { GraduationCap, Landmark, CheckSquare, Bookmark, Compass, Edit, Check, X, Plus, Trash2 } from "lucide-react";

const Education = ({ isAdmin }) => {
  const [eduStats, setEduStats] = useState({
    education_school: "VIDYAVARDHAKA COLLEGE OF ENGINEERING (VVCE), MYSURU",
    education_degree: "Bachelor of Engineering (B.E.) — Computer Science & Engineering",
    education_period: "QUEST PERIOD: 2024 — 2028",
    education_progress: 25,
    education_progress_label: "25% UNLOCKED (1ST YEAR COMPLETED)",
  });

  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin edit state for school degree card
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [cardForm, setCardForm] = useState({
    education_school: "",
    education_degree: "",
    education_period: "",
    education_progress: 25,
    education_progress_label: "",
  });

  // Admin state for objectives
  const [editingObjId, setEditingObjId] = useState(null);
  const [objTextVal, setObjTextVal] = useState("");
  const [addObjOpen, setAddObjOpen] = useState(false);
  const [newObjText, setNewObjText] = useState("");

  const staticFallbackObjectives = [
    { id: "1", objective_number: "01", text: "Acquire intermediate memory-addressing structures and pointer mapping in C and Python systems." },
    { id: "2", objective_number: "02", text: "Formulate modular, non-blocking asynchronous REST pipelines using the React + Express stack." },
    { id: "3", objective_number: "03", text: "Deconstruct computational logic constraints, discrete structures, and algorithms." },
  ];

  // Fetch dynamic education details
  const fetchEduDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("profile_stats")
        .select("education_school, education_degree, education_period, education_progress, education_progress_label")
        .limit(1)
        .single();

      if (error) throw error;
      if (data && data.education_school) {
        setEduStats(data);
      }
    } catch (err) {
      console.warn("Failed to load dynamic education stats, loading defaults.");
    }
  };

  // Fetch dynamic objectives checklist
  const fetchObjectives = async () => {
    try {
      const { data, error } = await supabase
        .from("education_objectives")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setObjectives(data);
      }
    } catch (err) {
      console.warn("Failed to load dynamic academic objectives, loading defaults.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEduDetails();
    fetchObjectives();
  }, []);

  const getObjectives = () => {
    return objectives.length > 0 ? objectives : staticFallbackObjectives;
  };

  // Save school degree stats card
  const handleSaveCard = async () => {
    try {
      const updated = {
        education_school: cardForm.education_school.trim() || eduStats.education_school,
        education_degree: cardForm.education_degree.trim() || eduStats.education_degree,
        education_period: cardForm.education_period.trim() || eduStats.education_period,
        education_progress: parseInt(cardForm.education_progress),
        education_progress_label: cardForm.education_progress_label.trim() || eduStats.education_progress_label,
      };

      const { error } = await supabase
        .from("profile_stats")
        .update(updated)
        .eq("character_name", "AJAY");

      if (error) throw error;

      setEduStats(updated);
      setIsEditingCard(false);
    } catch (err) {
      alert("Database error: " + err.message);
    }
  };

  const startEditCard = () => {
    setCardForm({
      education_school: eduStats.education_school,
      education_degree: eduStats.education_degree,
      education_period: eduStats.education_period,
      education_progress: eduStats.education_progress,
      education_progress_label: eduStats.education_progress_label,
    });
    setIsEditingCard(true);
  };

  // Objectives CMS actions
  const startEditObj = (obj) => {
    setEditingObjId(obj.id);
    setObjTextVal(obj.text);
  };

  const handleSaveObj = async (objId) => {
    try {
      if (typeof objId === "string" && objId.length > 20) {
        const { error } = await supabase
          .from("education_objectives")
          .update({ text: objTextVal })
          .eq("id", objId);

        if (error) throw error;
      }

      setObjectives((prev) => {
        const listToMap = prev.length > 0 ? prev : staticFallbackObjectives;
        return listToMap.map((o) => (o.id === objId ? { ...o, text: objTextVal } : o));
      });

      setEditingObjId(null);
    } catch (err) {
      alert("Database error: " + err.message);
    }
  };

  const handleAddObjective = async (e) => {
    e.preventDefault();
    if (!newObjText.trim()) return;

    try {
      const activeObjs = objectives.length > 0 ? objectives : staticFallbackObjectives;
      const nextNum = String(activeObjs.length + 1).padStart(2, "0");
      
      const newObj = {
        objective_number: nextNum,
        text: newObjText,
        sort_order: activeObjs.length + 1,
      };

      const { data, error } = await supabase
        .from("education_objectives")
        .insert([newObj])
        .select();

      if (error) throw error;

      if (data) {
        setObjectives((prev) => [...prev, data[0]]);
        setNewObjText("");
        setAddObjOpen(false);
      }
    } catch (err) {
      alert("Failed to insert objective: " + err.message);
    }
  };

  const handleDeleteObjective = async (objId, textStr) => {
    if (!window.confirm(`DELETE ACADEMIC OBJECTIVE NODE: "${textStr.slice(0, 30)}..."?`)) return;

    try {
      if (typeof objId === "string" && objId.length > 20) {
        const { error } = await supabase
          .from("education_objectives")
          .delete()
          .eq("id", objId);

        if (error) throw error;
      }

      setObjectives((prev) => prev.filter((o) => o.id !== objId));
    } catch (err) {
      alert("Database error: " + err.message);
    }
  };

  const currentObjectives = getObjectives();

  return (
    <RevealSection id="education" style={{ padding: "60px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Section Divider */}
      <div className="section-divider">
        <h2 style={{ fontFamily: "var(--font-hud)", fontSize: "1.5rem", letterSpacing: "3px", color: "#fff" }}>
          06 // EDUCATION LOGS
        </h2>
        <div className="section-divider-node">MAIN STORY</div>
        <div className="section-divider-line"></div>
        <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.8rem", color: "var(--text-muted)" }}>[学歴データ]</span>
      </div>

      {/* Main Quest Education Card */}
      <div
        className="hud-panel cyber-scanlines glitch-border"
        style={{
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          background: "linear-gradient(135deg, rgba(8, 15, 30, 0.8) 0%, rgba(2, 4, 8, 0.9) 100%)",
          position: "relative",
        }}
      >
        <div className="hud-panel-bottom" />

        {isEditingCard ? (
          // Admin Education Stats Card Editor
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: "var(--font-hud)", fontSize: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,210,255,0.2)", paddingBottom: "8px" }}>
              <span style={{ color: "var(--accent-purple)", fontWeight: "700" }}>[ EDUCATION_MAINFRAME_EDITOR ]</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <Check size={14} style={{ color: "var(--accent-cyan)", cursor: "pointer" }} onClick={handleSaveCard} />
                <X size={14} style={{ color: "#ff4a4a", cursor: "pointer" }} onClick={() => setIsEditingCard(false)} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>COLLEGE / INSTITUTION NAME</label>
                <input
                  type="text"
                  value={cardForm.education_school}
                  onChange={(e) => setCardForm({ ...cardForm, education_school: e.target.value })}
                  style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "6px", fontSize: "0.75rem" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>DEGREE / SPECIALIZATION TITLE</label>
                <input
                  type="text"
                  value={cardForm.education_degree}
                  onChange={(e) => setCardForm({ ...cardForm, education_degree: e.target.value })}
                  style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "6px", fontSize: "0.75rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <label style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>QUEST CAMPAIGN PERIOD</label>
                  <input
                    type="text"
                    value={cardForm.education_period}
                    onChange={(e) => setCardForm({ ...cardForm, education_period: e.target.value })}
                    style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "6px", fontSize: "0.75rem" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <label style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>PROGRESS BAR LABEL</label>
                  <input
                    type="text"
                    value={cardForm.education_progress_label}
                    onChange={(e) => setCardForm({ ...cardForm, education_progress_label: e.target.value })}
                    style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "6px", fontSize: "0.75rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={{ fontSize: "0.65rem", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
                  <span>SEMESTER PROGRESS PERCENTAGE</span>
                  <span>{cardForm.education_progress}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cardForm.education_progress}
                  onChange={(e) => setCardForm({ ...cardForm, education_progress: e.target.value })}
                  style={{ width: "100%", accentColor: "var(--accent-cyan)", background: "rgba(0,0,0,0.5)", cursor: "pointer" }}
                />
              </div>
            </div>
          </div>
        ) : (
          // Public Standard Education details display card
          <>
            {/* Card Header Info */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                fontFamily: "var(--font-hud)",
                fontSize: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-cyan)" }}>
                <Compass size={14} />
                <span style={{ textShadow: "var(--neon-glow-cyan)" }}>[ ACTIVE MAIN STORY QUEST ]</span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div
                  style={{
                    color: "var(--text-secondary)",
                    border: "1px solid rgba(0, 210, 255, 0.2)",
                    background: "rgba(2, 4, 8, 0.6)",
                    padding: "4px 12px",
                    borderRadius: "2px",
                  }}
                >
                  {eduStats.education_period}
                </div>
                {isAdmin && (
                  <button
                    onClick={startEditCard}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      padding: "4px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-cyan)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                    title="EDIT ACADEMIC CARD"
                  >
                    <Edit size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* School & Degree */}
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
              <div
                style={{
                  padding: "12px",
                  background: "rgba(0, 210, 255, 0.05)",
                  border: "1px solid var(--accent-blue)",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <GraduationCap size={36} style={{ color: "var(--accent-blue)" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-hud)",
                    fontSize: "0.75rem",
                    color: "var(--accent-purple)",
                    letterSpacing: "1.5px",
                  }}
                >
                  VTU AFFILIATED MAINFRAME
                </span>
                <h3
                  style={{
                    fontFamily: "var(--font-hud)",
                    fontSize: "1.3rem",
                    fontWeight: "900",
                    color: "#fff",
                    letterSpacing: "0.5px",
                  }}
                >
                  {eduStats.education_school}
                </h3>
                <p
                  style={{
                    fontSize: "1.05rem",
                    color: "var(--accent-cyan)",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "4px",
                  }}
                >
                  <Bookmark size={14} /> {eduStats.education_degree}
                </p>
              </div>
            </div>

            <div className="diagonal-stripes" style={{ height: "4px" }} />

            {/* Graduation Level Meter */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "var(--font-hud)",
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                }}
              >
                <span>QUEST PROGRESSION (SEMESTER EXP)</span>
                <span style={{ color: "#fff" }}>{eduStats.education_progress_label}</span>
              </div>
              <div className="hud-bar-container" style={{ height: "14px" }}>
                <div className="hud-bar-fill" style={{ width: `${eduStats.education_progress}%` }} />
              </div>
            </div>
          </>
        )}

        {/* Quest Sub-Objectives Checklist */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4
              style={{
                fontFamily: "var(--font-hud)",
                fontSize: "0.8rem",
                letterSpacing: "2px",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Landmark size={14} style={{ color: "var(--accent-purple)" }} /> SUB-QUEST OBJECTIVES (ACADEMIC FOCUS):
            </h4>
            {isAdmin && !addObjOpen && (
              <button
                onClick={() => setAddObjOpen(true)}
                className="hud-btn"
                style={{ padding: "4px 10px", fontSize: "0.6rem", letterSpacing: "1px", borderColor: "var(--accent-cyan)" }}
              >
                <Plus size={10} style={{ marginRight: "4px" }} /> ADD_OBJ
              </button>
            )}
          </div>

          {addObjOpen && (
            <form
              onSubmit={handleAddObjective}
              className="hud-panel cyber-scanlines glitch-border"
              style={{
                padding: "16px",
                background: "rgba(9, 18, 37, 0.8)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div className="hud-panel-bottom" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,210,255,0.2)", paddingBottom: "6px" }}>
                <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.7rem", color: "var(--accent-cyan)", fontWeight: "700" }}>[ COMPILE_NEW_QUEST_OBJECTIVE ]</span>
                <X size={12} style={{ color: "var(--text-secondary)", cursor: "pointer" }} onClick={() => setAddObjOpen(false)} />
              </div>
              <textarea
                required
                placeholder="Formulate academic focus objective..."
                value={newObjText}
                onChange={(e) => setNewObjText(e.target.value)}
                rows="2"
                style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.75rem", resize: "none" }}
              />
              <button type="submit" className="hud-btn" style={{ padding: "4px 12px", fontSize: "0.65rem", alignSelf: "flex-start" }}>INJECT OBJECTIVE</button>
            </form>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {currentObjectives.map((obj, idx) => {
              const isEditingObj = editingObjId === obj.id;

              return (
                <div
                  key={obj.id || idx}
                  className="objective-card-wrapper"
                  style={{
                    display: "flex",
                    gap: "12px",
                    background: "rgba(2, 4, 8, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.02)",
                    padding: "12px 16px",
                    borderRadius: "4px",
                    alignItems: "center",
                    transition: "all 0.3s ease",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-hud)",
                      fontSize: "0.7rem",
                      color: "var(--accent-cyan)",
                      border: "1px solid var(--accent-cyan)",
                      padding: "2px 6px",
                      borderRadius: "2px",
                    }}
                  >
                    OBJ_{obj.objective_number || `0${idx + 1}`}
                  </div>

                  {isEditingObj ? (
                    <div style={{ display: "flex", flexGrow: 1, gap: "10px", alignItems: "center" }}>
                      <input
                        type="text"
                        value={objTextVal}
                        onChange={(e) => setObjTextVal(e.target.value)}
                        style={{
                          flexGrow: 1,
                          background: "rgba(0,0,0,0.5)",
                          border: "1px solid var(--accent-purple)",
                          color: "#fff",
                          padding: "4px 8px",
                          fontSize: "0.85rem",
                          outline: "none",
                        }}
                      />
                      <button onClick={() => handleSaveObj(obj.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--accent-cyan)" }}><Check size={14} /></button>
                      <button onClick={() => setEditingObjId(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#ff4a4a" }}><X size={14} /></button>
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.4", flexGrow: 1 }}>
                        {obj.text}
                      </p>
                      {isAdmin && obj.id && (
                        <div style={{ display: "flex", gap: "8px", opacity: 0.5 }} className="obj-admin-actions">
                          <Edit size={12} style={{ color: "var(--text-secondary)", cursor: "pointer" }} onClick={() => startEditObj(obj)} />
                          <Trash2 size={12} style={{ color: "#ff4a4a", cursor: "pointer" }} onClick={() => handleDeleteObjective(obj.id, obj.text)} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </RevealSection>
  );
};

export default Education;
