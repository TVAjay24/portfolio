import { useState, useEffect } from "react";
import RevealSection from "./RevealSection";
import { supabase } from "../supabase";
import { Terminal, ArrowUpRight, Edit, Check, X, Plus, Trash2, Send, ShieldAlert, Sparkles } from "lucide-react";

export const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : (import.meta.env.VITE_API_BASE || "");

// Custom SVG GitHub icon
const GithubIcon = ({ size = 24, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// Custom SVG LinkedIn icon
const LinkedinIcon = ({ size = 24, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Custom SVG Mail icon
const MailIcon = ({ size = 24, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

// Custom SVG Phone icon
const PhoneIcon = ({ size = 24, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const Contact = ({ isAdmin }) => {
  const [contactCards, setContactCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Message transmission state
  const [msgForm, setMsgForm] = useState({ name: "", email: "", message: "" });
  const [sendingMsg, setSendingMsg] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [msgError, setMsgError] = useState("");

  const handleTransmitSignal = (e) => {
    e.preventDefault();
    if (!msgForm.name.trim() || !msgForm.email.trim() || !msgForm.message.trim()) return;

    setSendingMsg(true);
    setMsgError("");
    setSentSuccess(false);

    // Simulate cyber-handshake transmission delay
    setTimeout(() => {
      const newMessage = {
        id: Math.random().toString(36).substr(2, 9),
        name: msgForm.name.trim(),
        email: msgForm.email.trim(),
        message: msgForm.message.trim(),
        created_at: new Date().toISOString()
      };

      // Load inbox, append new transmission, save
      let localMsgs = localStorage.getItem("portfolio_messages");
      let messagesArray = [];
      if (localMsgs) {
        try { messagesArray = JSON.parse(localMsgs); } catch (e) {}
      }
      messagesArray = [newMessage, ...messagesArray];
      localStorage.setItem("portfolio_messages", JSON.stringify(messagesArray));

      setSentSuccess(true);
      setMsgForm({ name: "", email: "", message: "" });
      setSendingMsg(false);
      setTimeout(() => setSentSuccess(false), 5000);
    }, 800);
  };

  // Admin edit state
  const [editingCardId, setEditingCardId] = useState(null);
  const [cardForm, setCardForm] = useState({
    title: "",
    jp_name: "",
    line: "",
    link: "",
    badge: "",
  });

  // Admin add state
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    title: "",
    jp_name: "",
    icon_type: "github",
    line: "",
    link: "",
    badge: "ACTIVE",
  });

  const staticFallback = [
    {
      id: "github",
      title: "GITHUB UPLINK",
      jp_name: "ソースコード",
      icon_type: "github",
      line: "> HANDLE // TVAjay24",
      link: "https://github.com/TVAjay24",
      badge: "CONNECTED",
    },
    {
      id: "linkedin",
      title: "LINKEDIN NETWORK",
      jp_name: "プロフェッショナル",
      icon_type: "linkedin",
      line: "> PROFILE // T V Ajay",
      link: "https://www.linkedin.com/in/t-v-ajay-b047013a5",
      badge: "CONNECTED",
    },
    {
      id: "email",
      title: "MAIL TERMINAL",
      jp_name: "メール",
      icon_type: "email",
      line: "> ADDRESS // tvajay0@gmail.com",
      link: "mailto:tvajay0@gmail.com",
      badge: "ACTIVE",
    },
    {
      id: "phone",
      title: "DIRECT COMM LINK",
      jp_name: "電話番号",
      icon_type: "phone",
      line: "> NUMBER // +91 8050325644",
      link: "tel:+918050325644",
      badge: "ACTIVE",
    },
  ];

  // Fetch dynamic contacts from localStorage
  const fetchContactMethods = () => {
    let localContacts = localStorage.getItem("portfolio_contacts");
    if (!localContacts) {
      localStorage.setItem("portfolio_contacts", JSON.stringify(staticFallback));
      localContacts = JSON.stringify(staticFallback);
    }
    try {
      setContactCards(JSON.parse(localContacts));
    } catch (err) {
      setContactCards(staticFallback);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContactMethods();
  }, []);

  const getContactCards = () => {
    return contactCards;
  };

  const getIconComponent = (iconType) => {
    switch (iconType) {
      case "github": return GithubIcon;
      case "linkedin": return LinkedinIcon;
      case "email": return MailIcon;
      case "phone": return PhoneIcon;
      default: return MailIcon;
    }
  };

  // Save changes
  const handleSaveCard = (cardId) => {
    const updated = {
      title: cardForm.title.trim(),
      jp_name: cardForm.jp_name.trim(),
      line: cardForm.line.trim(),
      link: cardForm.link.trim(),
      badge: cardForm.badge.trim(),
    };

    setContactCards((prev) => {
      const next = prev.map((c) => (c.id === cardId ? { ...c, ...updated } : c));
      localStorage.setItem("portfolio_contacts", JSON.stringify(next));
      return next;
    });

    setEditingCardId(null);
  };

  const startEditCard = (e, c) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCardId(c.id);
    setCardForm({
      title: c.title,
      jp_name: c.jp_name || c.jpName,
      line: c.line,
      link: c.link,
      badge: c.badge,
    });
  };

  const handleCreateContact = (e) => {
    e.preventDefault();
    if (!newContact.title.trim()) return;

    const insertPayload = {
      id: Math.random().toString(36).substr(2, 9),
      title: newContact.title.trim(),
      jp_name: newContact.jp_name.trim() || "コンタクト",
      icon_type: newContact.icon_type,
      line: newContact.line.trim() || "> HANDLE // UNKNOWN",
      link: newContact.link.trim() || "#",
      badge: newContact.badge.trim() || "ACTIVE",
      sort_order: contactCards.length + 1,
    };

    setContactCards((prev) => {
      const next = [...prev, insertPayload];
      localStorage.setItem("portfolio_contacts", JSON.stringify(next));
      return next;
    });

    setNewContact({ title: "", jp_name: "", icon_type: "github", line: "", link: "", badge: "ACTIVE" });
    setAddFormOpen(false);
  };

  const handleDeleteContact = (e, cardId, title) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`DISSOLVE UPLINK CHANNEL: "${title}"?`)) return;

    setContactCards((prev) => {
      const next = prev.filter((c) => c.id !== cardId);
      localStorage.setItem("portfolio_contacts", JSON.stringify(next));
      return next;
    });
  };

  const activeCards = getContactCards();

  return (
    <RevealSection id="contact" style={{ padding: "80px 24px 100px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Title Divider */}
      <div className="section-divider">
        <h2 style={{ fontFamily: "var(--font-hud)", fontSize: "1.5rem", letterSpacing: "3px", color: "#fff" }}>
          06 // CONTACT_UPLINK
        </h2>
        <div className="section-divider-node">CONTACT</div>
        <div className="section-divider-line"></div>
        <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.8rem", color: "var(--text-muted)" }}>[連絡先]</span>
      </div>

      {/* Subtitle tag */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>
          Initialize communication networks. Select an uplink channel to establish connection logs.
        </p>
      </div>

      {/* Admin Action: Add Contact Trigger */}
      {isAdmin && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
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
              <span>ESTABLISH NEW UPLINK CHANNEL</span>
            </button>
          ) : (
            <form
              onSubmit={handleCreateContact}
              className="hud-panel cyber-scanlines glitch-border"
              style={{
                padding: "24px",
                background: "rgba(9, 18, 37, 0.9)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                width: "100%",
                maxWidth: "600px",
                margin: "0 auto",
                fontFamily: "var(--font-hud)",
                fontSize: "0.8rem",
              }}
            >
              <div className="hud-panel-bottom" />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0, 210, 255, 0.2)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>[ UPLINK_ESTABLISHMENT_SHELL ]</span>
                <X size={14} style={{ color: "var(--text-secondary)", cursor: "pointer" }} onClick={() => setAddFormOpen(false)} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Title & JP Subtitle */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label htmlFor="uplink_title" style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>UPLINK TITLE</label>
                    <input
                      id="uplink_title"
                      name="uplink_title"
                      type="text"
                      required
                      value={newContact.title}
                      onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", fontFamily: "var(--font-hud)", outline: "none" }}
                      placeholder="e.g. DISCORD CHANNEL"
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label htmlFor="uplink_jp_name" style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>JAPANESE TRANSLATION</label>
                    <input
                      id="uplink_jp_name"
                      name="uplink_jp_name"
                      type="text"
                      value={newContact.jp_name}
                      onChange={(e) => setNewContact({ ...newContact, jp_name: e.target.value })}
                      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", fontFamily: "var(--font-jp)", outline: "none" }}
                      placeholder="e.g. ディスコード"
                    />
                  </div>
                </div>

                {/* Parameter line & Badge status */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label htmlFor="uplink_line" style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>PARAMETER LINE</label>
                    <input
                      id="uplink_line"
                      name="uplink_line"
                      type="text"
                      required
                      value={newContact.line}
                      onChange={(e) => setNewContact({ ...newContact, line: e.target.value })}
                      placeholder="e.g. &gt; HANDLE // TVAjay"
                      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label htmlFor="uplink_badge" style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>UPLINK BADGE STATUS</label>
                    <input
                      id="uplink_badge"
                      name="uplink_badge"
                      type="text"
                      required
                      value={newContact.badge}
                      onChange={(e) => setNewContact({ ...newContact, badge: e.target.value })}
                      placeholder="e.g. CONNECTED"
                      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }}
                    />
                  </div>
                </div>

                {/* Target link path & Icon Type dropdown */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label htmlFor="uplink_link" style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>TARGET UPLINK PATH</label>
                    <input
                      id="uplink_link"
                      name="uplink_link"
                      type="text"
                      required
                      value={newContact.link}
                      onChange={(e) => setNewContact({ ...newContact, link: e.target.value })}
                      placeholder="e.g. https://github.com/..."
                      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", outline: "none" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>VECTOR BRAND GRAPHIC</label>
                    <select
                      value={newContact.icon_type}
                      onChange={(e) => setNewContact({ ...newContact, icon_type: e.target.value })}
                      style={{ background: "rgba(9, 18, 37, 0.95)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "8px", fontSize: "0.8rem", fontFamily: "var(--font-hud)", outline: "none" }}
                    >
                      <option value="github">github</option>
                      <option value="linkedin">linkedin</option>
                      <option value="email">email</option>
                      <option value="phone">phone</option>
                    </select>
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
                ESTABLISH UPLINK
              </button>
            </form>
          )}
        </div>
      )}

      {/* Grid of Contact Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {activeCards.map((card, idx) => {
          const IconComponent = getIconComponent(card.icon_type);
          const isExternal = card.link.startsWith("http");
          const isEditing = editingCardId === card.id;

          return (
            <div key={card.id || idx} style={{ width: "100%" }}>
              {isEditing ? (
                // Admin Contact Editor Panel
                <div
                  className="hud-panel cyber-scanlines glitch-border"
                  style={{
                    padding: "24px",
                    background: "rgba(9, 18, 37, 0.85)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    fontFamily: "var(--font-hud)",
                    fontSize: "0.8rem",
                  }}
                >
                  <div className="hud-panel-bottom" />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,210,255,0.2)", paddingBottom: "8px" }}>
                    <span style={{ color: "var(--accent-purple)", fontWeight: "700" }}>[ UPLINK_COORDINATES_EDITOR ]</span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Check size={14} style={{ color: "var(--accent-cyan)", cursor: "pointer" }} onClick={() => handleSaveCard(card.id)} />
                      <X size={14} style={{ color: "#ff4a4a", cursor: "pointer" }} onClick={() => setEditingCardId(null)} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <label htmlFor={`edit_uplink_title_${card.id}`} style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>UPLINK TITLE</label>
                      <input
                        id={`edit_uplink_title_${card.id}`}
                        name="uplink_title"
                        type="text"
                        value={cardForm.title}
                        onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <label htmlFor={`edit_uplink_jp_${card.id}`} style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>JAPANESE TRANSLATION</label>
                      <input
                        id={`edit_uplink_jp_${card.id}`}
                        name="uplink_jp_name"
                        type="text"
                        value={cardForm.jp_name}
                        onChange={(e) => setCardForm({ ...cardForm, jp_name: e.target.value })}
                        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem", fontFamily: "var(--font-jp)" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <label htmlFor={`edit_uplink_line_${card.id}`} style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>PARAMETER LINE (e.g. &gt; HANDLE // ...)</label>
                      <input
                        id={`edit_uplink_line_${card.id}`}
                        name="uplink_line"
                        type="text"
                        value={cardForm.line}
                        onChange={(e) => setCardForm({ ...cardForm, line: e.target.value })}
                        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <label htmlFor={`edit_uplink_badge_${card.id}`} style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>UPLINK BADGE STATUS</label>
                      <input
                        id={`edit_uplink_badge_${card.id}`}
                        name="uplink_badge"
                        type="text"
                        value={cardForm.badge}
                        onChange={(e) => setCardForm({ ...cardForm, badge: e.target.value })}
                        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <label htmlFor={`edit_uplink_link_${card.id}`} style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>TARGET UPLINK PATH (URL / email / tel)</label>
                    <input
                      id={`edit_uplink_link_${card.id}`}
                      name="uplink_link"
                      type="text"
                      value={cardForm.link}
                      onChange={(e) => setCardForm({ ...cardForm, link: e.target.value })}
                      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,210,255,0.2)", color: "#fff", padding: "4px", fontSize: "0.75rem" }}
                    />
                  </div>
                </div>
              ) : (
                // Public standard clickable contact card link
                <a
                  href={card.link}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                  className="contact-card-link"
                >
                  <div
                    className="hud-panel cyber-scanlines"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "100px 1fr",
                      gap: "24px",
                      padding: "28px",
                      borderLeft: "4px solid var(--accent-cyan)",
                      transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                      position: "relative",
                    }}
                  >
                    <div className="hud-panel-bottom" />

                    {/* Left Column: Visualizer Badge */}
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
                      <IconComponent
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
                        {card.badge}
                      </span>
                    </div>

                    {/* Right Column: Information */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", justifyContent: "center" }}>
                      
                      {/* Card Header: Title & Subtitle */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <h3
                          style={{
                            fontFamily: "var(--font-hud)",
                            fontSize: "1.25rem",
                            fontWeight: "900",
                            color: "#fff",
                            letterSpacing: "1.2px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {card.title}
                          <ArrowUpRight size={14} className="card-arrow" style={{ opacity: 0.5, color: "var(--accent-cyan)", transition: "all 0.3s ease" }} />
                          {isAdmin && card.id && (
                            <span style={{ display: "inline-flex", gap: "8px", alignItems: "center", marginLeft: "8px", zIndex: 200 }}>
                              <button
                                onClick={(e) => startEditCard(e, card)}
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
                                title="EDIT UPLINK CARD"
                              >
                                <Edit size={12} style={{ marginLeft: "4px" }} />
                              </button>
                              <button
                                onClick={(e) => handleDeleteContact(e, card.id, card.title)}
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
                                title="DISSOLVE UPLINK CHANNEL"
                              >
                                <Trash2 size={12} style={{ marginLeft: "4px" }} />
                              </button>
                            </span>
                          )}                        </h3>
                        <span style={{ fontFamily: "var(--font-jp)", fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "1px" }}>
                          {card.jp_name || card.jpName}
                        </span>
                      </div>

                      {/* Stripe */}
                      <div className="diagonal-stripes" style={{ height: "4px", opacity: 0.7 }} />

                      {/* Monospace Parameter Line */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontFamily: "var(--font-hud)",
                          fontSize: "0.85rem",
                          color: "var(--accent-blue)",
                          letterSpacing: "0.5px",
                        }}
                      >
                        <Terminal size={12} />
                        <span>{card.line}</span>
                      </div>
                    </div>
                  </div>
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* ----------------------------------------------------
          SIGNAL TRANSMISSION UPLINK (CONTACT FORM)
          ---------------------------------------------------- */}
      <div 
        className="hud-panel cyber-scanlines glitch-border" 
        style={{ 
          marginTop: "48px", 
          padding: "32px", 
          background: "rgba(6, 12, 24, 0.45)", 
          border: "1px solid rgba(0, 210, 255, 0.2)",
          position: "relative",
          maxWidth: "700px",
          margin: "48px auto 0"
        }}
      >
        <div className="hud-panel-bottom" style={{ borderColor: "transparent var(--accent-cyan) var(--accent-cyan) transparent" }} />
        
        <div style={{ display: "flex", gap: "8px", alignItems: "center", borderBottom: "1px solid rgba(0, 210, 255, 0.2)", paddingBottom: "12px", marginBottom: "24px" }}>
          <Terminal size={16} style={{ color: "var(--accent-cyan)" }} />
          <span style={{ fontFamily: "var(--font-hud)", fontSize: "0.9rem", letterSpacing: "2px", fontWeight: "700", color: "#fff" }}>
            SECURE_SIGNAL_TRANSMISSION_UPLINK
          </span>
        </div>

        <form onSubmit={handleTransmitSignal} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="name" style={{ fontFamily: "var(--font-hud)", fontSize: "0.7rem", color: "var(--accent-blue)" }}>OPERATOR IDENTIFIER (NAME)</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={msgForm.name}
                onChange={(e) => setMsgForm({ ...msgForm, name: e.target.value })}
                placeholder="e.g. USER_01"
                style={{ width: "100%", padding: "10px 12px", background: "rgba(0, 0, 0, 0.5)", border: "1px solid rgba(0, 210, 255, 0.2)", color: "#fff", fontSize: "0.85rem", outline: "none", fontFamily: "var(--font-hud)" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="email" style={{ fontFamily: "var(--font-hud)", fontSize: "0.7rem", color: "var(--accent-blue)" }}>SIGNAL COM ADDRESS (EMAIL)</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={msgForm.email}
                onChange={(e) => setMsgForm({ ...msgForm, email: e.target.value })}
                placeholder="e.g. operator@nerv.org"
                style={{ width: "100%", padding: "10px 12px", background: "rgba(0, 0, 0, 0.5)", border: "1px solid rgba(0, 210, 255, 0.2)", color: "#fff", fontSize: "0.85rem", outline: "none", fontFamily: "var(--font-hud)" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="message" style={{ fontFamily: "var(--font-hud)", fontSize: "0.7rem", color: "var(--accent-blue)" }}>SIGNAL MESSAGE PAYLOAD (TRANSMISSION)</label>
            <textarea
              id="message"
              name="message"
              required
              rows="4"
              value={msgForm.message}
              onChange={(e) => setMsgForm({ ...msgForm, message: e.target.value })}
              placeholder="Input your transmission signal message here..."
              style={{ width: "100%", padding: "12px", background: "rgba(0, 0, 0, 0.5)", border: "1px solid rgba(0, 210, 255, 0.2)", color: "#fff", fontSize: "0.85rem", resize: "none", outline: "none", fontFamily: "var(--font-hud)", lineHeight: "1.5" }}
            />
          </div>

          {msgError && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ff4a4a", fontFamily: "var(--font-hud)", fontSize: "0.75rem", padding: "8px 12px", border: "1px solid rgba(255, 74, 74, 0.2)", background: "rgba(255, 74, 74, 0.05)", borderRadius: "4px" }}>
              <ShieldAlert size={14} />
              <span>{msgError}</span>
            </div>
          )}

          {sentSuccess && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-cyan)", fontFamily: "var(--font-hud)", fontSize: "0.75rem", padding: "8px 12px", border: "1px solid rgba(0, 255, 196, 0.2)", background: "rgba(0, 255, 196, 0.05)", borderRadius: "4px" }}>
              <Sparkles size={14} className="text-glow-blue" />
              <span>TRANSMISSION RECEIVED // SECURELY ENCRYPTED // +100 XP UNLOCKED!</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={sendingMsg}
            className="hud-btn" 
            style={{ 
              alignSelf: "flex-start", 
              padding: "10px 24px", 
              fontSize: "0.75rem", 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              opacity: sendingMsg ? 0.5 : 1,
              borderColor: "var(--accent-cyan)",
              boxShadow: "0 0 10px rgba(0, 255, 196, 0.1)"
            }}
          >
            <Send size={12} />
            <span>{sendingMsg ? "TRANSMITTING_SIGNAL..." : "TRANSMIT MESSAGE // SEND"}</span>
          </button>
        </form>
      </div>

      {/* Styled hovering effects and mobile adjustments */}
      <style>{`
        .contact-card-link {
          text-decoration: none !important;
          color: inherit !important;
          display: block;
        }
        .contact-card-link:hover .hud-panel {
          border-color: rgba(0, 210, 255, 0.6) !important;
          border-left-color: var(--accent-cyan) !important;
          box-shadow: 
            0 0 25px rgba(0, 210, 255, 0.2),
            inset 0 0 20px rgba(0, 210, 255, 0.1) !important;
          transform: translateY(-4px);
        }
        .contact-card-link:hover .card-arrow {
          transform: translate(2px, -2px);
          opacity: 1 !important;
          color: var(--accent-cyan) !important;
        }
        @media (max-width: 600px) {
          #contact .hud-panel {
            grid-template-columns: 1fr !important;
            justify-items: center;
            text-align: center;
          }
          #contact .hud-panel div:nth-child(3) {
            align-items: center !important;
          }
        }
      `}</style>
    </RevealSection>
  );
};

export default Contact;
