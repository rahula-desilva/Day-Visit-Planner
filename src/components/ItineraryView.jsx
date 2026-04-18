import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { formatTime } from "../utils/helpers";

/**
 * MAP HELPERS (Internal to this file)
 */
function MapRefresher({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);
  return null;
}

function MapFocuser({ focus }) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.flyTo([focus.lat, focus.lon], 16, {
        duration: 1.5
      });
    }
  }, [focus, map]);
  return null;
}

/**
 * COMPONENT: ItineraryView
 * Displays the calculated trip results and the interactive map.
 */
export default function ItineraryView({
  plannedTrip,
  tripSummary,
  showMap,
  setShowMap,
  routeGeometry,
  mapFocus,
  onFocusLocation,
  onSaveTrip,
  isSaving,
  currentTripId
}) {
  if (!plannedTrip || plannedTrip.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-3xl font-extrabold text-gray-900">Your Optimized Itinerary</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onSaveTrip}
            disabled={isSaving || currentTripId}
            className={`
              ${(isSaving || currentTripId) ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"} 
              text-white font-bold px-6 py-2 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2
            `}
          >
            {currentTripId ? "Saved ✓" : (isSaving ? "Saving..." : "Save Plan 💾")}
          </button>
          <button
            onClick={() => setShowMap(!showMap)}
            className="bg-blue-100 text-blue-700 font-bold px-4 py-2 rounded-lg hover:bg-blue-200 transition-all flex items-center gap-2"
          >
            {showMap ? "Hide Map 🗺️" : "Show Map 🗺️"}
          </button>
        </div>
      </div>

      <div className={`flex flex-col ${showMap ? 'md:flex-row' : ''} gap-8`}>
        {/* Itinerary Column */}
        <div className={`${showMap ? 'md:w-1/2' : 'w-full'} space-y-6`}>
          {tripSummary && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg shadow-sm">
              <p className="text-blue-800 font-semibold text-lg flex flex-wrap items-center gap-y-2">
                <span className="mr-6">🚗 Drive Distance: <span className="font-bold text-black">{tripSummary.distance} km</span></span>
                <span className="mr-6">⏱️ Drive Time: <span className="font-bold text-black">{tripSummary.drivingHours} hrs</span></span>
                <span>🏁 Total Trip Time: <span className="font-bold text-black">{tripSummary.totalHours} hrs</span></span>
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
            <div className="relative border-l-4 border-indigo-500 pl-8 space-y-10 ml-4">
              {(() => {
                let visitCount = 0;
                return plannedTrip.map((stop, index) => {
                  if (!stop.isLunch) visitCount++;
                  return (
                    <div key={`itinerary-${stop.id}-${index}`} className="relative">
                      <div
                        onClick={() => !stop.isLunch && onFocusLocation(stop.latitude, stop.longitude)}
                        className={`absolute -left-[45px] top-1 ${!stop.isLunch ? 'cursor-pointer hover:scale-110 active:scale-95' : ''} transition-all ${stop.isLunch ? 'bg-orange-500' : 'bg-indigo-500'} text-white font-bold w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-md`}
                        title={stop.isLunch ? "" : "Click to zoom in on map"}
                      >
                        {stop.isLunch ? "🍱" : visitCount}
                      </div>
                      <h3 className={`text-xl font-bold ${stop.isLunch ? 'text-orange-700' : 'text-gray-900'}`}>{stop.name}</h3>
                      <p className={`font-semibold mb-2 text-lg ${stop.isLunch ? 'text-orange-500' : 'text-indigo-600'}`}>
                        {formatTime(stop.startTime)} - {formatTime(stop.endTime)}
                      </p>
                      {stop.distanceFromPrevious !== 9999 && !stop.isLunch && (
                        <p className="text-sm font-medium text-gray-500 mb-3 bg-gray-50 inline-block px-3 py-1 rounded-full border border-gray-200">
                          🚗 {stop.distanceFromPrevious.toFixed(1)} km {index === 0 ? "from your starting point" : "from previous stop"}
                        </p>
                      )}
                      <p className="text-gray-600 leading-relaxed italic mb-3">{stop.description}</p>
                      
                      {stop.travel_tips && (
                        <div className="bg-amber-50 border-l-2 border-amber-400 p-2 text-sm text-amber-900 rounded-r-md">
                          <strong>💡 Tip:</strong> {stop.travel_tips}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Map Column */}
        {showMap && (
          <div className="md:w-1/2">
            <div className="map-container shadow-2xl border-4 border-white">
              <MapContainer
                center={(() => {
                  const firstRealStop = plannedTrip.find(s => !s.isLunch);
                  return firstRealStop ? [firstRealStop.latitude, firstRealStop.longitude] : [0, 0];
                })()}
                zoom={13}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {(() => {
                  let visitCount = 0;
                  return plannedTrip
                    .filter(stop => !stop.isLunch)
                    .map((stop, idx) => {
                      visitCount++;
                      const markerLabel = visitCount;

                      const customIcon = L.divIcon({
                        html: `<div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg text-white font-bold bg-blue-600">
                              ${markerLabel}
                             </div>`,
                        className: 'custom-div-icon',
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                      });

                      return (
                        <Marker
                          key={`map-marker-${stop.id}-${idx}`}
                          position={[stop.latitude, stop.longitude]}
                          icon={customIcon}
                        >
                          <Popup>
                            <div className="p-1">
                              <h4 className="font-bold text-base m-0">{stop.name}</h4>
                              <p className="text-indigo-600 font-bold text-xs m-0 mb-1">{formatTime(stop.startTime)} - {formatTime(stop.endTime)}</p>
                              <p className="text-[10px] text-gray-500 m-0 italic">🕒 {stop.opening_hours || "09:00 AM - 05:00 PM"}</p>
                              {stop.travel_tips && (
                                <p className="text-[11px] bg-amber-50 text-amber-800 p-1 rounded mt-1 border border-amber-100">
                                  💡 {stop.travel_tips}
                                </p>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      );
                    });
                })()}

                {routeGeometry && (
                  <Polyline
                    positions={routeGeometry}
                    color="blue"
                    weight={5}
                    opacity={0.6}
                  />
                )}

                <MapRefresher points={plannedTrip.filter(s => !s.isLunch).map(s => [s.latitude, s.longitude])} />
                <MapFocuser focus={mapFocus} />
              </MapContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
