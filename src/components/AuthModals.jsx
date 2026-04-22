import SignUpForm from "./SignUpForm";
import LoginForm from "./LoginForm";
import { signOutUser } from "../services/authService";

/**
 * COMPONENT: AuthModals
 * Manages all authentication-related overlays (Login, Sign Up, and Logout Confirmation).
 */
export default function AuthModals({
  showAuth,
  setShowAuth,
  authMode,
  setAuthMode,
  showLogoutConfirm,
  setShowLogoutConfirm
}) {
  return (
    <>
      {/* Sign Up / Login Modal */}
      {showAuth && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowAuth(false)}
        >
          <div
            className="relative w-full max-w-md cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-all z-50 p-2 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100"
              title="Close"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            {authMode === "signup" ? (
              <SignUpForm onSwitchToLogin={() => setAuthMode("login")} />
            ) : (
              <LoginForm onSwitchToSignUp={() => setAuthMode("signup")} />
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1001] flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                🚪
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Ready to leave?</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">Your travel plans are safe with us! Are you sure you want to log out?</p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-6 py-3 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all active:scale-95"
                >
                  Stay
                </button>
                <button
                  onClick={async () => {
                    await signOutUser();
                    setShowLogoutConfirm(false);
                  }}
                  className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
