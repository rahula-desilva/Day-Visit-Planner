import { useState } from "react";
import useAuth from "./hooks/useAuth";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthModals from "./components/AuthModals";

// Pages
import Home from "./pages/Home";
import SavedTrips from "./pages/SavedTrips";
import Admin from "./pages/Admin";
import LandingPage from "./pages/LandingPage";

/**
 * MAIN COMPONENT: App
 * Acts as the lightweight router and layout wrapper for the application.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState("landing");

  // --- Shared Planner State ---
  const [customLocation, setCustomLocation] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [includeLunch, setIncludeLunch] = useState(true);
  
  // Use our professional Auth hook (The "Security Guard")
  const {
    session,
    userRole,
    status,
    showAuth,
    setShowAuth,
    authMode,
    setAuthMode,
    showLogoutConfirm,
    setShowLogoutConfirm
  } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        status={status} 
        session={session} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        onLogout={() => setShowLogoutConfirm(true)} 
        onLogin={() => {
          setAuthMode("signup");
          setShowAuth(true);
        }}
      />

      <main className="flex-grow pt-20">
        {activeTab === "landing" ? (
          <LandingPage 
            onExplore={() => setActiveTab("home")}
            customLocation={customLocation}
            setCustomLocation={setCustomLocation}
            startTime={startTime}
            setStartTime={setStartTime}
            includeLunch={includeLunch}
            setIncludeLunch={setIncludeLunch}
          />
        ) : activeTab === "home" ? (
          <Home 
            session={session}
            setAuthMode={setAuthMode}
            setShowAuth={setShowAuth}
            customLocation={customLocation}
            setCustomLocation={setCustomLocation}
            startTime={startTime}
            setStartTime={setStartTime}
            includeLunch={includeLunch}
            setIncludeLunch={setIncludeLunch}
          />
        ) : (activeTab === "admin" && userRole === 'admin') ? (
          <Admin />
        ) : (
          <div className="p-6">
            <SavedTrips 
              session={session} 
              onOpenAuth={() => { setAuthMode("login"); setShowAuth(true); }} 
            />
          </div>
        )}
      </main>

      <Footer />

      <AuthModals 
        showAuth={showAuth} setShowAuth={setShowAuth}
        authMode={authMode} setAuthMode={setAuthMode}
        showLogoutConfirm={showLogoutConfirm} setShowLogoutConfirm={setShowLogoutConfirm}
      />
    </div>
  );
}
