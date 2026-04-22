import { useState, useEffect } from "react";
import { fetchPlaces } from "../services/placeService";

/**
 * PAGE: LandingPage
 * A professional, high-end landing page based on Google Stitch UI design.
 */
export default function LandingPage({ 
  onExplore,
  customLocation,
  setCustomLocation,
  startTime,
  setStartTime,
  includeLunch,
  setIncludeLunch
}) {
  const [allPlaces, setAllPlaces] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [openTipId, setOpenTipId] = useState(null);

  const categories = ["All", "Nature", "Recreation", "Religious", "Heritage"];

  useEffect(() => {
    async function loadFeatured() {
      const { data } = await fetchPlaces();
      if (data) {
        setAllPlaces(data);
      }
    }
    loadFeatured();

    const handleClickOutside = (e) => {
      if (!e.target.closest('.location-search')) setShowSuggestions(false);
      if (!e.target.closest('.place-card') && !e.target.closest('.tip-button')) setOpenTipId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const displayedPlaces = allPlaces
    .filter(p => activeCategory === "All" || p.category === activeCategory)
    .slice(0, 4);

  return (
    <div className="bg-white font-body text-gray-900 antialiased">
      <main>
        {/* Hero Section */}
        <section className="relative h-[870px] w-full overflow-hidden">
          <div className="absolute inset-0 z-0 text-white">
            <img 
              className="w-full h-full object-cover" 
              alt="Traditional Sri Lankan stilt fisherman" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8uwd_bkpSSdtVGYqVVExiN6Ng_NatsCht74a0TeeB4cl_whYecfE_O5fsu0aPK6LhPGxAqaeBqkr9W6MetwmnTyUXZWkgWPKHbOeLF5nzGN8NMDPVRXB5gY6Hb_mZN-d9LOBYyR-RZh-AzS1la3pDLpOjCHXH9l-PDadItwm_P-23aV7tLPk6tGaDmtmlq_pgnCEjerRudcjo64D0PACNIXJgoM_IwR6jHarFe2W5Es2JxGIkKoKlN45Zs6o9qeE_4832fuGBmkyB"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
          </div>
          <div className="relative z-10 h-full max-w-7xl mx-auto px-12 flex flex-col justify-center">
            <div className="max-w-2xl">
              <h1 className="font-headline text-white text-6xl font-extrabold tracking-tight mb-4 leading-tight">
                Explore the City <br/>in a Day
              </h1>
              <p className="text-white/90 text-xl font-medium mb-8">
                The ultimate one-day trip planner for Sri Lanka. Discover curated gems from Colombo to Galle.
              </p>
            </div>
          </div>
        </section>

        {/* 🧩 Planner Control Bar - Search & Filter Area */}
        <section className="relative z-20 -mt-20 px-4 md:px-12 max-w-7xl mx-auto">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.15)] flex flex-wrap lg:flex-nowrap items-center gap-6 border border-gray-100">
            
            {/* Starting Location 📍 */}
            <div className="flex-grow flex items-center bg-gray-50 px-6 py-4 rounded-2xl relative location-search group focus-within:ring-2 focus-within:ring-primary transition-all border border-transparent focus-within:border-white shadow-inner">
              <span className="material-symbols-outlined text-primary mr-3">location_on</span>
              <div className="flex flex-col w-full">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Starting Location</span>
                <input 
                  className="bg-transparent border-none p-0 focus:ring-0 text-gray-900 font-bold placeholder:text-gray-400 w-full" 
                  placeholder="Enter your starting point" 
                  type="text"
                  value={customLocation}
                  onChange={(e) => {
                    setCustomLocation(e.target.value);
                    setShowSuggestions(true);
                  }}
                />
              </div>

              {showSuggestions && customLocation.trim().length > 0 && (
                <div className="absolute top-[110%] left-0 z-[100] w-full bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden">
                  {["Colombo", "Kandy", "Galle", "Negombo", "Ella", "Nuwara Eliya", "Sigiriya", "Dehiwala"]
                    .filter(city => city.toLowerCase().includes(customLocation.toLowerCase()))
                    .map(city => (
                      <div 
                        key={city}
                        className="px-6 py-3 hover:bg-primary/10 cursor-pointer font-bold text-gray-700 transition-colors border-b last:border-0 border-gray-50"
                        onClick={() => {
                          setCustomLocation(city);
                          setShowSuggestions(false);
                        }}
                      >
                        {city}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="w-px h-12 bg-gray-200 hidden lg:block"></div>

            {/* Departure Time 🕒 */}
            <div className="flex-grow flex items-center bg-gray-50 px-6 py-4 rounded-2xl group focus-within:ring-2 focus-within:ring-primary transition-all border border-transparent focus-within:border-white shadow-inner min-w-[200px]">
              <span className="material-symbols-outlined text-primary mr-3">schedule</span>
              <div className="flex flex-col w-full">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Departure Time</span>
                <input 
                  type="time"
                  className="bg-transparent border-none p-0 focus:ring-0 text-gray-900 font-bold w-full cursor-pointer"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>

            <div className="w-px h-12 bg-gray-200 hidden lg:block"></div>

            {/* Lunch Toggle 🍱 */}
            <div className="flex items-center gap-4 px-4 bg-gray-50 rounded-2xl py-4 lg:bg-transparent lg:py-0">
               <label className="flex items-center cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={includeLunch} 
                    onChange={(e) => setIncludeLunch(e.target.checked)}
                  />
                  <div className={`w-12 h-6 rounded-full transition-all relative ${includeLunch ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${includeLunch ? 'left-7' : 'left-1'}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-bold text-gray-600 group-hover:text-primary whitespace-nowrap">Lunch Break</span>
               </label>
            </div>

            <button 
              onClick={onExplore}
              className="btn-primary"
            >
              <span className="material-symbols-outlined">explore</span>
              Plan Now
            </button>
          </div>

          {/* Category Pills */}
          <div className="mt-12 flex items-center gap-3 overflow-x-auto px-2 pb-4 no-scrollbar">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-full font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${activeCategory === cat ? 'bg-[#005ab7] text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-600 hover:bg-[#005ab7] hover:text-white hover:scale-105 hover:shadow-md border border-transparent'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Place Cards Grid */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-sm font-bold text-primary tracking-[0.2em] uppercase">Featured Destinations</span>
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-gray-900 mt-2">Iconic Sri Lankan Spots</h2>
            </div>
            <button 
              onClick={onExplore}
              className="text-primary font-bold flex items-center gap-3 hover:gap-5 transition-all text-lg group"
            >
              View Map View 
              <span className="material-symbols-outlined text-2xl">map</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {displayedPlaces.length > 0 ? displayedPlaces.map((place) => (
              <div key={place.id} className="group flex flex-col place-card relative">
                <div className="relative h-80 overflow-hidden rounded-[2rem] bg-gray-100 shadow-xl shadow-gray-200/50">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    src={place.image_url || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5962?auto=format&fit=crop&q=80"} 
                    alt={place.name}
                  />
                  <div className="absolute top-6 right-6 bg-white shadow-lg p-3 rounded-full hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </div>
                </div>
                <div className="mt-8 flex flex-col h-full">
                  <div className="min-h-[56px] flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-headline font-bold text-2xl text-gray-900 leading-tight">{place.name}</h3>
                    <span className="flex items-center text-sm font-bold bg-yellow-50 px-2 py-1 rounded-lg">
                      <span className="material-symbols-outlined text-yellow-500 text-lg mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 
                      {place.rating || "4.8"}
                    </span>
                  </div>
                  
                  <div className="h-8 mb-4 border-b border-gray-50">
                    <span className="inline-flex items-center text-primary text-[11px] font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined align-middle mr-1 text-sm">schedule</span> Opening Time: {place.opening_hours || "09:00 AM - 05:00 PM"}
                    </span>
                  </div>

                  <div className="min-h-[100px] mb-6">
                    <p className="text-gray-900 text-base leading-relaxed font-semibold">
                      {place.description || "A breathtaking destination with stunning views and local charm."}
                    </p>
                  </div>

                  <div className="mb-6 h-10 relative">
                    {place.travel_tips && (
                      <div className="relative z-30 text-left">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setOpenTipId(openTipId === place.id ? null : place.id); 
                          }}
                          className={`tip-button flex items-center gap-3 text-xs font-black transition-all ${openTipId === place.id ? 'text-amber-700' : 'text-gray-500 hover:text-amber-600'}`}
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${openTipId === place.id ? 'bg-amber-100 border-amber-600 shadow-lg scale-110' : 'bg-gray-100 border-gray-300 shadow-sm'}`}>
                            <span className="material-symbols-outlined text-xl">lightbulb</span>
                          </div>
                          {openTipId === place.id ? "HIDE EXPERT TIP" : "SEE EXPERT TIP"}
                        </button>
                        
                        {openTipId === place.id && (
                          <div className="absolute bottom-full left-0 mb-4 p-5 bg-white border-2 border-amber-400 shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-2xl animate-in zoom-in-95 fade-in duration-200 min-w-[260px] w-full max-w-[300px] z-50">
                            <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white border-b-2 border-r-2 border-amber-400 rotate-45"></div>
                            <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2 relative z-10">EXPERT ADVICE</h4>
                            <p className="text-[15px] text-gray-900 font-bold leading-relaxed relative z-10">
                              "{place.travel_tips}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={onExplore}
                    className="w-full bg-[#005ab7] text-white h-14 md:h-16 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-md mt-auto"
                  >
                    <span className="material-symbols-outlined text-xl">explore</span>
                    Plan Visit
                  </button>
                </div>
              </div>
            )) : (
              // Skeleton UI
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col animate-pulse">
                  <div className="aspect-[4/5] bg-gray-100 rounded-[2rem]"></div>
                  <div className="h-8 bg-gray-100 rounded-xl mt-6 w-3/4"></div>
                  <div className="h-20 bg-gray-50 rounded-xl mt-4 w-full"></div>
                  <div className="h-16 bg-gray-100 rounded-xl mt-8 w-full"></div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Newsletter / CTA Section */}
        <section className="py-32 bg-gray-50/50 mt-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 items-center gap-20 md:gap-32">
            <div className="relative">
              <div className="bg-primary/10 w-full aspect-square rounded-[4rem] rotate-3 absolute top-0 left-0 -z-10"></div>
              <img 
                className="rounded-[4rem] w-full aspect-square object-cover shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] relative z-10" 
                alt="Traveler with map" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbgFRewjTUzCH5wGYpmZ1NYzptRpzDC2bKygw_uAqA1WyZV7nj-72kbmSajEUSZKlgPzceFM8iD_vGJZXBmUDpV-M9YdAYpEcTXaV60qqjgzv-B_Fg7zEAEgt7QcPWgLdvLf3E_uMQhihp5Fj9GgyxNCvkimTRnZ_Se1cqMcJV_H3uxyTiVXuDi6skwWmr976tR4xVv6XYsailWMlpZe3EQxGQyJ87fK5PzVhcMhu8xelO_LQhRgr-4PU77dC__tHq_7_-rEIWZ8vB"
              />
            </div>
            <div className="lg:pl-12">
              <span className="text-sm font-bold text-primary tracking-[0.2em] uppercase">Join the Club</span>
              <h2 className="font-headline text-5xl md:text-6xl font-extrabold text-gray-900 mt-4 mb-8 leading-[1.1]">
                Plan your trip in <br className="hidden md:block" /> seconds, not hours.
              </h2>
              <p className="text-gray-500 text-xl mb-12 leading-relaxed font-medium">
                Subscribe to get exclusive one-day itineraries and hidden gem alerts delivered to your inbox every weekend.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 max-w-lg">
                <input 
                  className="flex-grow bg-white border border-gray-100 px-8 py-5 rounded-2xl focus:ring-2 focus:ring-primary shadow-xl shadow-gray-200/20 text-gray-900 font-bold placeholder:text-gray-400" 
                  placeholder="Enter your email" 
                  type="email"
                />
                <button className="btn-primary">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
