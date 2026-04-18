/**
 * COMPONENT: Header
 * Displays the app title, connection status, and user auth controls.
 */
export default function Header({ status, session, onLogout, onLogin }) {
  return (
    <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
      <h1 className="text-xl font-bold text-gray-800">🌍 Day Visit Planner | {status}</h1>

      <div className="flex items-center gap-4">
        {session ? (
          <>
            <span className="text-sm font-semibold text-indigo-600 hidden md:block">
              Hi, {session.user.user_metadata?.username || session.user.email} 👋
            </span>
            <button
              onClick={onLogout}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95 border border-red-100 flex items-center gap-2"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={onLogin}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-md"
          >
            Sign Up 🚀
          </button>
        )}
      </div>
    </div>
  );
}
