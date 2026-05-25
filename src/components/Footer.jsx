import { Terminal, Shield, Wifi } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: "1px solid rgba(0, 210, 255, 0.15)",
        background: "rgba(2, 4, 8, 0.95)",
        padding: "24px 24px",
        fontFamily: "var(--font-hud)",
        fontSize: "0.65rem",
        color: "var(--text-muted)",
        position: "relative",
      }}
      className="cyber-scanlines"
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {/* Left Side: Diagnostics */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "6px", height: "6px", backgroundColor: "var(--accent-cyan)", borderRadius: "50%", boxShadow: "var(--neon-glow-cyan)" }} />
            <span>SYS_LINK: ONLINE</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Wifi size={10} style={{ color: "var(--accent-blue)" }} />
            <span>LATENCY: 14ms</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }} className="footer-coords">
            <Shield size={10} style={{ color: "var(--accent-purple)" }} />
            <span>LOC: MYSURU, IND</span>
          </div>
        </div>

        {/* Right Side: Copyright */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Terminal size={10} />
          <span>© {currentYear} AJAY</span>
          <span style={{ color: "var(--accent-blue)" }}>//</span>
          <span>ALL RIGHTS COMPLED</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 650px) {
          footer div {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center;
          }
          .footer-coords {
            display: none !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
