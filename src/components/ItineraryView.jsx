import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { formatOpeningHours, formatTime } from "../utils/helpers";

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
  startPoint,
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
              ${(isSaving || currentTripId) ? "bg-gray-400 cursor-not-allowed" : "bg-[#005ab7] hover:opacity-90"} 
              text-white font-bold px-6 py-2 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2
            `}
          >
            {currentTripId ? <span className="flex items-center gap-2">Saved <span className="material-symbols-outlined text-sm">check</span></span> : (isSaving ? "Saving..." : <span className="flex items-center gap-2">Save Plan <span className="material-symbols-outlined text-sm">save</span></span>)}
          </button>
          <button
            onClick={() => setShowMap(!showMap)}
            className="bg-gray-100 text-gray-700 font-bold px-4 py-2 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">map</span>
            {showMap ? "Hide Map" : "Show Map"}
          </button>
        </div>
      </div>

      <div className={`flex flex-col ${showMap ? 'md:flex-row' : ''} gap-8`}>
        {/* Itinerary Column */}
        <div className={`${showMap ? 'md:w-1/2' : 'w-full'} space-y-6`}>
          {tripSummary && (
            <div className="bg-primary/10 border-l-4 border-primary p-4 mb-6 rounded-r-lg shadow-sm">
              <p className="text-primary font-semibold text-lg flex flex-wrap items-center gap-y-2">
                <span className="mr-6 flex items-center"><span className="material-symbols-outlined mr-1">directions_car</span> Drive Distance: <span className="font-bold text-black ml-1">{tripSummary.distance} km</span></span>
                <span className="mr-6 flex items-center"><span className="material-symbols-outlined mr-1">timer</span> Drive Time: <span className="font-bold text-black ml-1">{tripSummary.drivingHours} hrs</span></span>
                <span className="flex items-center"><span className="material-symbols-outlined mr-1">flag</span> Total Trip Time: <span className="font-bold text-black ml-1">{tripSummary.totalHours} hrs</span></span>
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
            <div className="relative border-l-4 border-primary pl-8 space-y-10 ml-4">
              {(() => {
                let visitCount = 0;
                return plannedTrip.map((stop, index) => {
                  if (!stop.isLunch) visitCount++;
                  return (
                    <div key={`itinerary-${stop.id}-${index}`} className="relative">
                      <div
                        onClick={() => !stop.isLunch && onFocusLocation(stop.latitude, stop.longitude)}
                        className={`absolute -left-[45px] top-1 ${!stop.isLunch ? 'cursor-pointer hover:scale-110 active:scale-95' : ''} transition-all ${stop.isLunch ? 'bg-orange-500' : 'bg-primary'} text-white font-bold w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-md`}
                        title={stop.isLunch ? "" : "Click to zoom in on map"}
                      >
                        {stop.isLunch ? <span className="material-symbols-outlined text-sm">restaurant</span> : visitCount}
                      </div>
                      <h3 className={`text-xl font-bold ${stop.isLunch ? 'text-orange-700' : 'text-gray-900'}`}>{stop.name}</h3>
                      <p className={`font-semibold mb-2 text-lg ${stop.isLunch ? 'text-orange-500' : 'text-primary'}`}>
                        {formatTime(stop.startTime)} - {formatTime(stop.endTime)}
                      </p>
                      {stop.distanceFromPrevious !== 9999 && !stop.isLunch && (
                        <p className="text-sm font-medium text-gray-500 mb-3 bg-gray-50 inline-block px-3 py-1 rounded-full border border-gray-200">
                          <span className="material-symbols-outlined align-sub mr-1 text-sm">directions_car</span> {stop.distanceFromPrevious.toFixed(1)} km {index === 0 ? "from your starting point" : "from previous stop"}
                        </p>
                      )}
                      <p className="text-gray-600 leading-relaxed italic mb-3">{stop.description}</p>
                      
                      {stop.travel_tips && (
                        <div className="bg-amber-50 border-l-2 border-amber-400 p-2 text-sm text-amber-900 rounded-r-md">
                          <strong><span className="material-symbols-outlined align-middle text-sm mr-1">lightbulb</span> Tip:</strong> {stop.travel_tips}
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
                        html: `<div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg text-white font-bold bg-primary">
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
                              <p className="text-primary font-bold text-xs m-0 mb-1">{formatTime(stop.startTime)} - {formatTime(stop.endTime)}</p>
                              <p className="text-[10px] text-gray-500 m-0 italic flex items-center"><span className="material-symbols-outlined text-[10px] mr-1">schedule</span> {formatOpeningHours(stop.opening_hours)}</p>
                              {stop.travel_tips && (
                                <p className="text-[11px] bg-amber-50 text-amber-800 p-1 rounded mt-1 border border-amber-100">
                                  <span className="material-symbols-outlined align-middle text-[11px] mr-1">lightbulb</span> {stop.travel_tips}
                                </p>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      );
                    });
                })()}

                {/* Red Starting Location Marker */}
                {startPoint && (
                  <Marker
                    position={[startPoint.lat, startPoint.lon]}
                    icon={L.divIcon({
                      html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);color:white;font-size:14px;">📍</div>`,
                      className: 'custom-div-icon',
                      iconSize: [32, 32],
                      iconAnchor: [16, 16]
                    })}
                  >
                    <Popup>
                      <div className="p-1">
                        <h4 className="font-bold text-base m-0 text-red-600">📍 Your Starting Point</h4>
                        <p className="text-xs text-gray-500 m-0">Trip begins here</p>
                      </div>
                    </Popup>
                  </Marker>
                )}

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
