/**
 * COMPONENT: Header
 * Displays the app title, navigation tabs, and user auth controls matching the stitch design.
 */
export default function Header({ status, session, onLogout, onLogin, activeTab, setActiveTab, userRole }) {
  const tabs = [
    { id: "landing", label: "Welcome" },
    { id: "home", label: "Explore & Plan" },
    { id: "saved", label: "My Adventures" },
  ];
  if (userRole === "admin") {
    tabs.push({ id: "admin", label: "Admin" });
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-2xl transition-all duration-400 ease-out shadow-[0_20px_40px_-5px_rgba(26,28,29,0.06)]">
      <div className="flex items-center justify-between px-6 md:px-12 h-20 max-w-[1920px] mx-auto">
        <div className="text-2xl font-extrabold tracking-tighter text-primary font-headline">DayVisit Explorer</div>
        
        <nav className="hidden md:flex items-center space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-semibold font-headline transition-all pb-1 ${activeTab === tab.id ? "text-primary border-b-2 border-primary" : "text-gray-600 hover:text-primary"}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-100 mr-2">
            <span className="material-symbols-outlined text-gray-400 mr-2 text-sm">search</span>
            <span className="text-gray-500 text-sm">Search trips...</span>
          </div>

          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-primary hidden xl:block">
                Hi, {session.user.user_metadata?.username || session.user.email} <span className="material-symbols-outlined align-middle ml-1 text-lg">waving_hand</span>
              </span>
              <button
                onClick={onLogout}
                className="bg-red-50 text-red-600 px-6 py-2.5 rounded-full font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:opacity-80 transition-all duration-400 ease-out scale-95 active:scale-90 shadow-md shadow-primary/20"
            >
              Sign Up
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className="md:hidden flex justify-center space-x-4 pb-2 px-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`font-semibold text-sm transition-all pb-1 ${activeTab === tab.id ? "text-primary border-b-2 border-primary" : "text-gray-600 hover:text-primary"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
