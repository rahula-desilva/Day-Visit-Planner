/**
 * COMPONENT: PlaceCard
 * Displays a single tourist spot with its image, description, and an action button.
 */
export default function PlaceCard({ place, isSelected, onAdd, onRemove, isOpen, onToggleTip }) {
  return (
    <div
      className="flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full place-card relative"
    >
      {/* Image Section - keeps overflow-hidden to clip the top image corners */}
      <div className="relative overflow-hidden flex-shrink-0 rounded-t-2xl">
        {place.image_url ? (
          <img
            src={place.image_url}
            alt={place.name}
            className="w-full h-64 object-cover border-b border-gray-100 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 border-b border-gray-200 flex items-center justify-center text-gray-400">
            <span className="text-sm">No Image Available</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow text-left">
        {/* Title Area - Fixed height for horizontal alignment */}
        <div className="min-h-[56px] mb-2 flex items-center pr-2">
          <h2 className="text-xl font-bold text-gray-900 leading-tight font-sans">
            {place.name}
          </h2>
        </div>

        {/* Opening Hours - Fixed position */}
        <div className="h-8 mb-4 border-b border-gray-50">
          <span className="inline-flex items-center text-primary text-[11px] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined align-middle mr-1 text-sm">schedule</span> Opening Time: {place.opening_hours || "09:00 AM - 05:00 PM"}
          </span>
        </div>

        {/* Description - Bold, Dark, and Easy to Read */}
        <div className="min-h-[100px] mb-6">
          <p className="text-gray-900 text-base leading-relaxed font-semibold">
            {place.description}
          </p>
        </div>

        {/* Interactive Travel Tip Section - Aligned at the bottom */}
        <div className="mb-6 h-10 relative">
          {place.travel_tips && (
            <div className="relative z-30 text-left">
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleTip(); }}
                className={`tip-button flex items-center gap-3 text-xs font-black transition-all ${isOpen ? 'text-amber-700' : 'text-gray-500 hover:text-amber-600'}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${isOpen ? 'bg-amber-100 border-amber-600 shadow-lg scale-110' : 'bg-gray-100 border-gray-300 shadow-sm'}`}>
                  <span className="material-symbols-outlined text-xl">lightbulb</span>
                </div>
                {isOpen ? "HIDE EXPERT TIP" : "SEE EXPERT TIP"}
              </button>
              
              {isOpen && (
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
          onClick={() => isSelected ? onRemove() : onAdd(place)}
          className={`mt-auto w-full font-bold text-sm px-4 py-3 rounded-xl transition-all shadow-md active:scale-95 ${
            isSelected
              ? "bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100 shadow-red-100"
              : "bg-[#005ab7] text-white hover:opacity-90"
          }`}
        >
          {isSelected ? (
            <span className="flex items-center justify-center gap-2">Remove from Plan <span className="material-symbols-outlined">close</span></span>
          ) : (
            <span className="flex items-center justify-center gap-2">Add to Plan <span className="material-symbols-outlined">add_location</span></span>
          )}
        </button>
      </div>
    </div>
  );
}
