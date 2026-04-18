import { useState } from "react";
import useAuth from "./hooks/useAuth";

// Components
import Header from "./components/Header";
import AuthModals from "./components/AuthModals";

// Pages
import Home from "./pages/Home";
import SavedTrips from "./pages/SavedTrips";
import Admin from "./pages/Admin";

/**
 * MAIN COMPONENT: App
 * Acts as the lightweight router and layout wrapper for the application.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  
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
        onLogout={() => setShowLogoutConfirm(true)} 
        onLogin={() => {
          setAuthMode("signup");
          setShowAuth(true);
        }}
      />
      
      {/* Navigation Switchboard */}
      <nav className="bg-white border-b flex justify-center sticky top-0 z-[40] shadow-sm">
        <button
          onClick={() => setActiveTab("home")}
          className={`px-10 py-4 font-bold transition-all border-b-4 ${activeTab === "home" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          📍 Plan a Trip
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`px-10 py-4 font-bold transition-all border-b-4 ${activeTab === "saved" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          🎒 My Adventures
        </button>

        {userRole === 'admin' && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-10 py-4 font-bold transition-all border-b-4 ${activeTab === "admin" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            ⚙️ Admin
          </button>
        )}
      </nav>

      <main className="flex-grow">
        {activeTab === "home" ? (
          <Home 
            session={session}
            setAuthMode={setAuthMode}
            setShowAuth={setShowAuth}
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

      <AuthModals 
        showAuth={showAuth} setShowAuth={setShowAuth}
        authMode={authMode} setAuthMode={setAuthMode}
        showLogoutConfirm={showLogoutConfirm} setShowLogoutConfirm={setShowLogoutConfirm}
      />
    </div>
  );
}
