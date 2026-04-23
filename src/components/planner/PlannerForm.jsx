/**
 * COMPONENT: PlannerForm
 * Handles user inputs for trip settings like location, start time, and lunch.
 */
export default function PlannerForm({ 
  customLocation, 
  setCustomLocation, 
  startTime, 
  setStartTime, 
  includeLunch, 
  setIncludeLunch, 
  showSuggestions, 
  setShowSuggestions,
  onGenerate,
  isGenerating
}) {
  return (
    <div className="mb-8 p-4 bg-gray-100 rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4 bg-white/50 p-4 rounded-xl border border-white">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Trip Settings</h3>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600">Starting Location</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Current Location (GPS)"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                value={customLocation}
                onChange={(e) => {
                  setCustomLocation(e.target.value);
                  setShowSuggestions(true);
                }}
              />

              {showSuggestions && customLocation.trim().length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {["Colombo", "Kandy", "Galle", "Negombo", "Jaffna", "Anuradhapura", "Trincomalee", "Matara", "Kurunegala", "Ratnapura", "Gampaha", "Kalutara", "Bentota", "Sigiriya", "Ella", "Nuwara Eliya", "Dehiwala"]
                    .filter(city => city.toLowerCase().includes(customLocation.toLowerCase()))
                    .map(city => (
                      <div
                        key={city}
                        className="px-4 py-2 hover:bg-primary/10 cursor-pointer text-gray-700 transition-colors border-b last:border-0 border-gray-50"
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

              <span className="absolute left-3 top-2.5 material-symbols-outlined text-gray-400 text-lg">location_on</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600">Start Time</label>
            <div className="relative">
              <select
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none bg-white"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              >
                {Array.from({ length: 4 * 12 }).map((_, i) => {
                  const h = Math.floor(i / 4) + 6; // Start from 6 AM
                  const m = (i % 4) * 15;
                  const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                  const displayH = h > 12 ? h - 12 : h;
                  const ampm = h >= 12 ? 'PM' : 'AM';
                  return (
                    <option key={timeStr} value={timeStr}>
                      {displayH}:{m.toString().padStart(2, '0')} {ampm}
                    </option>
                  );
                })}
              </select>
              <span className="absolute left-3 top-2.5 material-symbols-outlined text-gray-400 text-lg">schedule</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-white/50 p-4 rounded-xl border border-white flex flex-col justify-center">
          <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white/80 transition-all">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={includeLunch}
                onChange={(e) => setIncludeLunch(e.target.checked)}
              />
              <div className={`w-12 h-6 rounded-full transition-colors ${includeLunch ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
              <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${includeLunch ? 'translate-x-6' : ''}`}></div>
            </div>
              Include Lunch Break (1 hr) <span className="material-symbols-outlined align-sub ml-1 text-orange-500">restaurant</span>
          </label>

          <p className="text-xs text-gray-500 italic">
            Tip: If "Starting Location" is empty, we'll use your current GPS location.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
        <button
          id="generate-btn"
          onClick={onGenerate}
          disabled={isGenerating}
          className={`
            relative font-bold px-8 py-3 rounded-xl transition-all shadow-md min-w-[200px]
            ${isGenerating
              ? "bg-[#005ab7]/50 cursor-wait scale-95"
              : "bg-[#005ab7] hover:opacity-90 active:scale-95"}
            text-white flex items-center justify-center gap-2
          `}
        >
          {isGenerating ? (
            <>
              <span className="material-symbols-outlined animate-spin text-xl">autorenew</span>
              Generating...
            </>
          ) : (
            <>
              Generate Plan <span className="material-symbols-outlined">rocket_launch</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
