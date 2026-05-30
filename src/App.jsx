import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AboutMe from "./components/AboutMe";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Achievements from "./components/Achievements";
import Education from "./components/Education";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AdminLoginModal from "./components/AdminLoginModal";
import AdminDashboard from "./components/AdminDashboard";

// Sub-component wrapping the primary portfolio panels
const MainPortfolio = ({ isAdmin, setModalOpen }) => {
  return (
    <>
      {/* Navigation HUD top bar */}
      <Navbar isAdmin={isAdmin} onAdminTrigger={() => setModalOpen(true)} />

      {/* Home / Hero Canvas */}
      <Hero isAdmin={isAdmin} />

      {/* Profile Card & Traits */}
      <AboutMe isAdmin={isAdmin} />

      {/* Interactive Ability Grid */}
      <Skills isAdmin={isAdmin} />

      {/* Quest Logs Projects */}
      <Projects isAdmin={isAdmin} />

      {/* Accomplished hackathons & badges */}
      <Achievements isAdmin={isAdmin} />

      {/* Education level maps */}
      <Education isAdmin={isAdmin} />

      {/* Transmission secure portal inputs */}
      <Contact />

      {/* Diagnostics & Coords bottom bar */}
      <Footer />
    </>
  );
};

function App() {
  const [session, setSession] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  // Monitor local Auth state dynamically
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

  const isAdmin = !!session;

  return (
    <>
      {/* Dynamic Futuristic Grid Overlay Background */}
      <div className="cyber-grid" />

      {/* Main Portals & Dashboard Cockpit Panels */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <Routes>
          <Route path="/" element={<MainPortfolio isAdmin={isAdmin} setModalOpen={setModalOpen} />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>

      {/* Admin login holographic terminal overlay rendered at root level */}
      <AdminLoginModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onLoginSuccess={() => {
          console.log("Authorized cockpit writes.");
          navigate("/admin");
        }}
      />
    </>
  );
}

export default App;
