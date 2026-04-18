import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { checkDatabaseConnection } from "../services/placeService";

/**
 * HOOK: useAuth
 * Manages the global authentication session and database connection status.
 */
export default function useAuth() {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("Checking...");
  
  // Modals state
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowAuth(false);
    });

    // 3. Connection check
    const checkStatus = async () => {
      const { isConnected } = await checkDatabaseConnection();
      setStatus(isConnected ? "✅ Connected" : "❌ Not Connected");
    };
    checkStatus();

    return () => subscription.unsubscribe();
  }, []);

  return {
    session,
    status,
    showAuth,
    setShowAuth,
    authMode,
    setAuthMode,
    showLogoutConfirm,
    setShowLogoutConfirm
  };
}
