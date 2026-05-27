
import { useState, useEffect } from "react";
import RevealSection from "./RevealSection";
import { apiFetch } from "../api";
import { Award, Star, Calendar, Terminal, Edit, Check, X, Plus, Trash2 } from "lucide-react";

const Achievements = ({ isAdmin }) => {
  const [achievementsList, setAchievementsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Trophy Edit State
  const [editingTrophyId, setEditingTrophyId] = useState(null);
  const [trophyForm, setTrophyForm] = useState({
    title: "",
    jp_name: "",
    award: "",
    date: "",
    xp_reward: "",
    description: "",
  });

  // Trophy Add State
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [newTrophy, setNewTrophy] = useState({
    title: "",
    jp_name: "",
    award: "",
    date: "",
    xp_reward: "",
    description: "",
  });

  const staticFallback = [
    {
      id: "the_big_code_google",
      title: "THE BIG CODE — GOOGLE",
      jp_name: "コーディングチャレンジ参加者",
      award: "Cleared Round 2 — Top 1,500 of 100,000+ nationally",
      date: "APRIL 2026",
      xp_reward: "+1200 XP UNLOCKED",
      description: "Competed in Google India's The Big Code Challenge 2026, a national multi-stage coding elimination powered by HackerEarth. Advanced through the Qualifying Round and Round 1 to break into the Top 1,500 out of 100,000+ engineering students across India. Round 2 featured a high-stakes algorithmic coding showdown testing advanced DSA, problem-solving speed, and CS fundamentals under pressure.",
    },
    {
      id: "hackathon_campusfinance",
      title: "HACKATHON PARTICIPANT",
      jp_name: "ハッカソン出場者",
      award: "Designed & Assembled CampusFinance",
      date: "OCTOBER 2024",
      xp_reward: "+500 XP UNLOCKED",
      description: "Competed in an intense student hackathon sprint. Designed and assembled CampusFinance—a high-fidelity student-focused micro-budgeting web app. Effectively bridged a React interface layer with real-time Supabase analytics and authentication modules to streamline student financial tracking.",
    },
  ];

  // Fetch achievements from Express backend
  const fetchAchievements = async () => {
    try {
      const data = await apiFetch("/api/achievements");
      if (data && data.length > 0) {
        setAchievementsList(data);
      }
    } catch (err) {
      console.warn("Database achievements missing or offline, loading static backup:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const getAchievements = () => {
    return achievementsList.length > 0 ? achievementsList : staticFallback;
  };

  const handleEditClick = (t) => {
    setEditingTrophyId(t.id);
    setTrophyForm({
      title: t.title,
      jp_name: t.jp_name || t.jpName,
      award: t.award,
      date: t.date,
      xp_reward: t.xp_reward || t.xpReward,
      description: t.description || t.desc,
    });
  };

  const handleSaveTrophy = async (trophyId) => {
    try {
      const updatedTrophy = {
        title: trophyForm.title,
        jp_name: trophyForm.jp_name,
        award: trophyForm.award,
        date: trophyForm.date,
        xp_reward: trophyForm.xp_reward,
        description: trophyForm.description,
      };

      // Only attempt write if ID is standard uuid (i.e. not static fallback string)
      if (typeof trophyId === "string" && trophyId.length > 20) {
        await apiFetch(`/api/achievements/${trophyId}`, {
          method: "PUT",
          body: JSON.stringify(updatedTrophy),
        });
      }

      // Sync local state
      setAchievementsList((prev) => {
        const listToMap = prev.length > 0 ? prev : staticFallback;
        return listToMap.map((t) => (t.id === trophyId ? { ...t, ...updatedTrophy } : t));
      });

      setEditingTrophyId(null);
    } catch (err) {
      alert("Database error: " + err.message);
    }
  };

  const handleCreateTrophy = async (e) => {
    e.preventDefault();
    if (!newTrophy.title.trim()) return;

    try {
      const activeTrophies = getAchievements();
      const insertPayload = {
        title: newTrophy.title.trim(),
        jp_name: newTrophy.jp_name.trim() || "トロフィー",
        award: newTrophy.award.trim() || "Quest Objective Achieved",
        date: newTrophy.date.trim() || "UNKNOWN DATE",
        xp_reward: newTrophy.xp_reward.trim() || "+500 XP UNLOCKED",
        description: newTrophy.description.trim() || "Synthesized trophy details...",
        sort_order: activeTrophies.length + 1,
      };

      const data = await apiFetch("/api/achievements", {
        method: "POST",
        body: JSON.stringify(insertPayload),
      });

      if (data) {
        setAchievementsList((prev) => [...prev, data]);
        setNewTrophy({ title: "", jp_name: "", award: "", date: "", xp_reward: "", description: "" });
        setAddFormOpen(false);
      }
    } catch (err) {
      alert("Failed to inject new trophy: " + err.message);
    }
  };

  const handleDeleteTrophy = async (trophyId, name) => {
    if (!window.confirm(`DISSOLVE TROPHY: "${name}"?`)) return;

    try {
      if (typeof trophyId === "string" && trophyId.length > 20) {
        await apiFetch(`/api/achievements/${trophyId}`, {
          method: "DELETE",
        });
      }

      setAchievementsList((prev) => {
        const listToFilter = prev.length > 0 ? prev : staticFallback;
        return listToFilter.filter((t) => t.id !== trophyId);
      });
    } catch (err) {
      alert("Failed to delete trophy: " + err.message);
    }
  };

  const currentTrophies = getAchievements();

  return (
    <RevealSection id="achievements" style={{ padding: "60px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Title Divider */}
      <div className="section-divider">
        <h2 style={{ fontFamily: "var(--font-hud)", fontSize: "1.5rem", letterSpacing: "3px", color: "#fff" }}>
          05 // UNLOCKED TROPHIES
        </h2>
        <div className="section-divider-node">TROPHIES</div>
        <div className="section-divider-line"></div>
        <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.8rem", color: "var(--text-muted)" }}>[受賞・実績]</span>
      </div>

      {/* Admin Action: Add Trophy Trigger */}
      {isAdmin && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
          {!addFormOpen ? (
            <button
              onClick={() => setAddFormOpen(true)}
              className="hud-btn hud-btn-purple"
              style={{
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.75rem",
                borderColor: "var(--accent-purple)",
                boxShadow: "0 0 10px rgba(189, 0, 255, 0.15)",
              }}
            >
              <Plus size={14} />
              <span>FORGE NEW TIMELINE TROPHY</span>
            </button>
          ) : (
            <form
              onSubmit={handleCreateTrophy}
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
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(189, 0, 255, 0.2)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--accent-purple)", fontWeight: "700" }}>[ TROPHY_FORGING_SHELL ]</span>
                <X size={14} style={{ color: "var(--text-secondary)", cursor: "pointer" }} onClick={() => setAddFormOpen(false)} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Title & JP Subtitle */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>TROPHY TITLE</label>
                    <input
                      type="text"
                      required
                      value={newTrophy.title}
                      onChange={(e) => setNewTrophy({ ...newTrophy, title: e.target.value })}
                      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", fontFamily: "var(--font-hud)", outline: "none" }}
                      placeholder="e.g. THE BIG CODE — GOOGLE"
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>JAPANESE TRANSLATION</label>
                    <input
                      type="text"
                      value={newTrophy.jp_name}
                      onChange={(e) => setNewTrophy({ ...newTrophy, jp_name: e.target.value })}
                      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", fontFamily: "var(--font-jp)", outline: "none" }}
                      placeholder="e.g. コーディングチャレンジ参加者"
                    />
                  </div>
                </div>

                {/* XP Reward & Date */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>XP REWARD LABEL</label>
                    <input
                      type="text"
                      value={newTrophy.xp_reward}
                      onChange={(e) => setNewTrophy({ ...newTrophy, xp_reward: e.target.value })}
                      placeholder="e.g. +1200 XP UNLOCKED"
                      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>UNLOCK DATE</label>
                    <input
                      type="text"
                      value={newTrophy.date}
                      onChange={(e) => setNewTrophy({ ...newTrophy, date: e.target.value })}
                      placeholder="e.g. APRIL 2026"
                      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }}
                    />
                  </div>
                </div>

                {/* Objective */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>OBJECTIVE / HIGHLIGHT LINE</label>
                  <input
                    type="text"
                    value={newTrophy.award}
                    onChange={(e) => setNewTrophy({ ...newTrophy, award: e.target.value })}
                    placeholder="e.g. Cleared Round 2 — Top 1,500..."
                    style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }}
                  />
                </div>

                {/* Description */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>NARRATIVE DESCRIPTION</label>
                  <textarea
                    value={newTrophy.description}
                    onChange={(e) => setNewTrophy({ ...newTrophy, description: e.target.value })}
                    rows="3"
                    style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", resize: "none", outline: "none" }}
                    placeholder="Enter detailed narrative..."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="hud-btn hud-btn-purple"
                style={{
                  padding: "8px 16px",
                  fontSize: "0.75rem",
                  alignSelf: "flex-start",
                  marginTop: "8px",
                }}
              >
                FORGE TROPHY
              </button>
            </form>
          )}
        </div>
      )}

      {/* Trophies listing container */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {currentTrophies.map((trophy, idx) => {
          const isEditing = editingTrophyId === trophy.id;

          return (
            <div
              key={trophy.id || idx}
              className="hud-panel cyber-scanlines"
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr",
                gap: "24px",
                padding: "28px",
                borderRight: "4px solid var(--accent-purple)",
              }}
            >
              <div className="hud-panel-bottom" />

              {/* Left Column: Trophy Badge Visualizer */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(2,4,8,0.5)",
                  border: "1px solid rgba(189, 0, 255, 0.2)",
                  borderRadius: "4px",
                  height: "100px",
                  position: "relative",
                }}
              >
                {/* Spinning background halo */}
                <div
                  style={{
                    position: "absolute",
                    width: "70px",
                    height: "70px",
                    border: "1px dashed var(--accent-purple)",
                    borderRadius: "50%",
                    opacity: 0.2,
                    animation: "spin-hud 20s linear infinite",
                  }}
                />
                <Award
                  size={36}
                  style={{
                    color: "var(--accent-purple)",
                    filter: "drop-shadow(0 0 8px var(--accent-purple))",
                    zIndex: 2,
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: "4px",
                    fontFamily: "var(--font-hud)",
                    fontSize: "0.45rem",
                    color: "var(--accent-cyan)",
                    letterSpacing: "1px",
                  }}
                >
                  UNLOCKED
                </span>
              </div>

              {/* Right Column: Quest details / Editing shell */}
              {isEditing ? (
                // Admin Trophy Editor Form
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: "var(--font-hud)", fontSize: "0.8rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(189,0,255,0.2)", paddingBottom: "8px" }}>
                    <span style={{ color: "var(--accent-purple)", fontWeight: "700" }}>[ TROPHY_EDITOR_SHELL ]</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Check size={14} style={{ color: "var(--accent-cyan)", cursor: "pointer" }} onClick={() => handleSaveTrophy(trophy.id)} />
                      <X size={14} style={{ color: "#ff4a4a", cursor: "pointer" }} onClick={() => setEditingTrophyId(null)} />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {/* Title & JP Subtitle */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <label style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>TROPHY TITLE</label>
                        <input
                          type="text"
                          value={trophyForm.title}
                          onChange={(e) => setTrophyForm({ ...trophyForm, title: e.target.value })}
                          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem" }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <label style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>JAPANESE TRANSLATION</label>
                        <input
                          type="text"
                          value={trophyForm.jp_name}
                          onChange={(e) => setTrophyForm({ ...trophyForm, jp_name: e.target.value })}
                          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem", fontFamily: "var(--font-jp)" }}
                        />
                      </div>
                    </div>

                    {/* XP reward & Date */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <label style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>XP REWARD LABEL</label>
                        <input
                          type="text"
                          value={trophyForm.xp_reward}
                          onChange={(e) => setTrophyForm({ ...trophyForm, xp_reward: e.target.value })}
                          placeholder="+1200 XP UNLOCKED"
                          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem" }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <label style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>UNLOCK DATE</label>
                        <input
                          type="text"
                          value={trophyForm.date}
                          onChange={(e) => setTrophyForm({ ...trophyForm, date: e.target.value })}
                          placeholder="APRIL 2026"
                          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem" }}
                        />
                      </div>
                    </div>

                    {/* Objective */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <label style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>OBJECTIVE / HIGHLIGHT LINE</label>
                      <input
                        type="text"
                        value={trophyForm.award}
                        onChange={(e) => setTrophyForm({ ...trophyForm, award: e.target.value })}
                        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem" }}
                      />
                    </div>

                    {/* Description */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <label style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>NARRATIVE DESCRIPTION</label>
                      <textarea
                        value={trophyForm.description}
                        onChange={(e) => setTrophyForm({ ...trophyForm, description: e.target.value })}
                        rows="3"
                        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(189,0,255,0.2)", color: "#fff", padding: "6px", fontSize: "0.75rem", resize: "none" }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Public Standard HUD Trophy details display card
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  
                  {/* Trophy Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <h3
                        style={{
                          fontFamily: "var(--font-hud)",
                          fontSize: "1.25rem",
                          fontWeight: "900",
                          color: "#fff",
                          letterSpacing: "1px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {trophy.title}
                        {isAdmin && (
                          <span style={{ display: "inline-flex", gap: "6px", alignItems: "center", marginLeft: "8px" }}>
                            <button
                              onClick={() => handleEditClick(trophy)}
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
                              title="EDIT TROPHY"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteTrophy(trophy.id, trophy.title)}
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
                              title="DISSOLVE TROPHY"
                            >
                              <Trash2 size={12} />
                            </button>
                          </span>
                        )}                      </h3>
                      <span style={{ fontFamily: "var(--font-jp)", fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {trophy.jp_name || trophy.jpName}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        fontFamily: "var(--font-hud)",
                        fontSize: "0.7rem",
                      }}
                    >
                      <span style={{ color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Star size={11} /> {trophy.xp_reward || trophy.xpReward}
                      </span>
                      <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={11} /> {trophy.date}
                      </span>
                    </div>
                  </div>

                  {/* Stripe */}
                  <div className="diagonal-stripes" style={{ height: "4px", opacity: 0.7 }} />

                  {/* Award highlight line */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontFamily: "var(--font-hud)",
                      fontSize: "0.8rem",
                      color: "var(--accent-blue)",
                    }}
                  >
                    <Terminal size={12} />
                    <span>OBJECTIVE: {trophy.award}</span>
                  </div>

                  {/* Narrative description */}
                  <p
                    style={{
                      fontSize: "0.95rem",
                      color: "var(--text-secondary)",
                      lineHeight: "1.6",
                    }}
                  >
                    {trophy.description || trophy.desc}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <style>{`
        @media (max-width: 600px) {
          #achievements .hud-panel {
            grid-template-columns: 1fr !important;
            justify-items: center;
            text-align: center;
          }
          #achievements .hud-panel div:nth-child(3) {
            align-items: center !important;
          }
        }
      `}</style>
    </RevealSection>
  );
};

export default Achievements;
