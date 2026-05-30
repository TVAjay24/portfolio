import { useState } from "react";
import { Terminal, X, Lock, Mail, ShieldAlert, Check } from "lucide-react";

const AdminLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    // Simulate cyber-handshake delay
    setTimeout(() => {
      if (email.trim().toLowerCase() === "tvajay0@gmail.com") {
        setSuccess(true);
        const fakeSession = { user: { email: "tvajay0@gmail.com" } };
        sessionStorage.setItem("admin_session", JSON.stringify(fakeSession));
        window.dispatchEvent(new Event("admin_auth_change"));

        setTimeout(() => {
          onLoginSuccess(fakeSession);
          onClose();
          setEmail("");
          setPassword("");
          setSuccess(false);
          setLoading(false);
        }, 1200);
      } else {
        setErrorMsg("Unauthorized administrator coordinates.");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(2, 4, 8, 0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="hud-panel cyber-scanlines glitch-border"
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "var(--bg-panel-solid)",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          position: "relative",
          boxShadow: "0 0 30px rgba(189, 0, 255, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hud-panel-bottom" />

        {/* Header Console */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(0, 210, 255, 0.2)",
            paddingBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-hud)" }}>
            <Terminal size={18} style={{ color: "var(--accent-purple)" }} />
            <span style={{ fontSize: "0.9rem", letterSpacing: "2px", fontWeight: "700", color: "#fff" }}>
              ADMIN_COCKPIT_UPLINK
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.target.style.color = "var(--accent-purple)")}
            onMouseLeave={(e) => (e.target.style.color = "var(--text-secondary)")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Prompt logs */}
        <div
          style={{
            fontFamily: "var(--font-hud)",
            fontSize: "0.7rem",
            color: "var(--text-secondary)",
            background: "rgba(0,0,0,0.3)",
            padding: "8px 12px",
            borderLeft: "2px solid var(--accent-purple)",
            lineHeight: "1.4",
          }}
        >
          <span>&gt; SECURE PROTOCOL INITIATED...</span>
          <br />
          <span>&gt; AUTHENTICATION KEY REQUIRED FOR MAIN FRAMEWRITE ACCESS.</span>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Email input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontFamily: "var(--font-hud)",
                fontSize: "0.75rem",
                letterSpacing: "1px",
                color: "var(--accent-cyan)",
              }}
            >
              ADMIN EMAIL
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={14}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter admin email"
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  background: "rgba(8, 15, 30, 0.6)",
                  border: "1px solid rgba(0, 210, 255, 0.25)",
                  color: "#fff",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                  borderRadius: "4px",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-purple)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(0, 210, 255, 0.25)")}
              />
            </div>
          </div>

          {/* Password input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontFamily: "var(--font-hud)",
                fontSize: "0.75rem",
                letterSpacing: "1px",
                color: "var(--accent-cyan)",
              }}
            >
              SECURITY UPLINK KEY
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={14}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  background: "rgba(8, 15, 30, 0.6)",
                  border: "1px solid rgba(0, 210, 255, 0.25)",
                  color: "#fff",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                  borderRadius: "4px",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-purple)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(0, 210, 255, 0.25)")}
              />
            </div>
          </div>

          {/* Status Message Display */}
          {errorMsg && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#ff4a4a",
                fontFamily: "var(--font-hud)",
                fontSize: "0.7rem",
                padding: "8px 12px",
                border: "1px solid rgba(255, 74, 74, 0.2)",
                background: "rgba(255, 74, 74, 0.05)",
                borderRadius: "4px",
              }}
            >
              <ShieldAlert size={14} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {success && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--accent-cyan)",
                fontFamily: "var(--font-hud)",
                fontSize: "0.7rem",
                padding: "8px 12px",
                border: "1px solid rgba(0, 255, 196, 0.2)",
                background: "rgba(0, 255, 196, 0.05)",
                borderRadius: "4px",
              }}
            >
              <Check size={14} style={{ flexShrink: 0 }} />
              <span>ACCESS GRANTED. SYNCING MAIN MODULE...</span>
            </div>
          )}

          {/* Action button */}
          <button
            type="submit"
            disabled={loading || success}
            className="hud-btn hud-btn-purple"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              opacity: loading || success ? 0.5 : 1,
              pointerEvents: loading || success ? "none" : "auto",
            }}
          >
            {loading ? "AUTHORIZING..." : "LOG IN // COCKPIT"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;
