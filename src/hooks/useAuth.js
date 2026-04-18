import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { checkDatabaseConnection } from "../services/placeService";
import { getUserRole } from "../services/authService";

/**
 * HOOK: useAuth
 * Manages the global authentication session and database connection status.
 */
export default function useAuth() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [status, setStatus] = useState("Checking...");
  
  // Modals state
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    // 1. Initial connection check (independent)
    const runStatusCheck = async () => {
      try {
        const { isConnected } = await checkDatabaseConnection();
        setStatus(isConnected ? "✅ Connected" : "❌ Not Connected");
      } catch (err) {
        setStatus("⚠️ API Issue");
      }
    };
    runStatusCheck();

    // 2. Auth Role Helper
    const fetchAndSetRole = async (uid) => {
      try {
        const role = await getUserRole(uid);
        setUserRole(role);
      } catch (err) {
        console.warn("Role fetch skipped or failed.");
        setUserRole("user"); // Fallback
      }
    };

    // 3. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchAndSetRole(session.user.id);
    });

    // 4. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setShowAuth(false);
        fetchAndSetRole(session.user.id);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    session,
    userRole,
    status,
    showAuth,
    setShowAuth,
    authMode,
    setAuthMode,
    showLogoutConfirm,
    setShowLogoutConfirm
  };
}
