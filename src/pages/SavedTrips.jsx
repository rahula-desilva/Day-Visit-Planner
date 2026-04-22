import { useState, useEffect } from "react";
import { getUserTrips, deleteTrip } from "../services/tripService";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Helper to zoom map to fit all markers
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

export default function SavedTrips({ session, onOpenAuth }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [mapFocus, setMapFocus] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (session) {
      fetchTrips();

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        });
      }
    }
  }, [session]);

  const fetchTrips = async () => {
    setLoading(true);
    const { data, error } = await getUserTrips(session.user.id);
    if (!error) setTrips(data || []);
    setLoading(false);
  };

  const handleDelete = async (e, tripId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this adventure forever?")) {
      setIsDeleting(true);
      const { error } = await deleteTrip(tripId);
      if (error) {
        alert("Could not delete the trip. Please try again.");
      } else {
        setTrips(trips.filter(t => t.id !== tripId));
        if (selectedTrip?.id === tripId) {
          setSelectedTrip(null);
          setRouteGeometry(null);
        }
      }
      setIsDeleting(false);
    }
  };

  const handleViewDetails = async (trip) => {
    setSelectedTrip(trip);
    const sorted = [...trip.trip_places].sort((a, b) => a.order_number - b.order_number);
    let coordsArr = sorted.map(tp => `${tp.places.longitude},${tp.places.latitude}`);
    if (userLocation) {
      coordsArr = [`${userLocation.lon},${userLocation.lat}`, ...coordsArr];
    }
    const coords = coordsArr.join(';');
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.code === "Ok") {
        setRouteGeometry(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
      }
    } catch (e) {
      console.error("OSRM Error:", e);
    }
  };

  if (!session) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-gray-100 mt-8 max-w-2xl mx-auto">
        <div className="text-6xl mb-6">🔒</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Login to See Your History</h3>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">You need to have an account to save and view your personal travel itineraries.</p>
        <button
          onClick={onOpenAuth}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg active:scale-95"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="material-symbols-outlined text-5xl mb-4 text-primary animate-spin">autorenew</span>
        <p className="text-gray-500 font-medium">Fetching your trips...</p>
      </div>
    );
  }

  if (selectedTrip) {
    const sortedPlaces = [...selectedTrip.trip_places].sort((a, b) => a.order_number - b.order_number);
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <button
            onClick={() => { setSelectedTrip(null); setRouteGeometry(null); }}
            className="flex items-center gap-2 text-primary font-bold hover:opacity-70 transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span> Back to History
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">
              Trip on {new Date(selectedTrip.date).toLocaleDateString()}
            </h2>
            <button
              onClick={(e) => handleDelete(e, selectedTrip.id)}
              className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
              title="Delete this trip"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[calc(100vh-280px)] lg:min-h-[500px]">
          <div className="bg-white rounded-2xl shadow-xl overflow-y-auto p-6 border border-gray-100 max-h-[45vh] lg:max-h-none">
            <div className="relative border-l-4 border-primary pl-8 space-y-10 ml-4 py-4">
              {sortedPlaces.map((tp, idx) => (
                <div key={tp.id} className="relative">
                  <div
                    onClick={() => setMapFocus({ lat: tp.places.latitude, lon: tp.places.longitude, ts: Date.now() })}
                    className="absolute -left-[45px] top-1 bg-primary text-white font-bold w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-all"
                    title="Click to zoom in on map"
                  >
                    {tp.order_number}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{tp.places.name}</h3>
                  <p className="text-gray-600 text-sm italic">{tp.places.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative h-[350px] lg:h-full">
            <MapContainer
              center={[sortedPlaces[0].places.latitude, sortedPlaces[0].places.longitude]}
              zoom={13}
              className="h-full w-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {sortedPlaces.map((tp) => (
                <Marker
                  key={tp.id}
                  position={[tp.places.latitude, tp.places.longitude]}
                  icon={L.divIcon({
                    html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:#005ab7;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);color:white;font-weight:bold;">${tp.order_number}</div>`,
                    className: '', iconSize: [32, 32], iconAnchor: [16, 16]
                  })}
                />
              ))}
              {userLocation && (
                <Marker
                  position={[userLocation.lat, userLocation.lon]}
                  icon={L.divIcon({
                    html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);color:white;font-size:14px;">📍</div>`,
                    className: '', iconSize: [32, 32], iconAnchor: [16, 16]
                  })}
                >
                  <Popup><b>Your Location</b></Popup>
                </Marker>
              )}
              {routeGeometry && <Polyline positions={routeGeometry} color="#005ab7" weight={5} opacity={0.6} />}
              <MapRefresher points={[
                ...sortedPlaces.map(tp => [tp.places.latitude, tp.places.longitude]),
                ...(userLocation ? [[userLocation.lat, userLocation.lon]] : [])
              ]} />
              <MapFocuser focus={mapFocus} />
            </MapContainer>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Adventure History</h2>
        <span className="bg-primary/15 text-primary px-4 py-1 rounded-full text-sm font-bold">
          {trips.length} Saved Trips
        </span>
      </div>

      {trips.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-gray-100 mt-8">
          <div className="text-6xl mb-6">🏜️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">No Saved Trips Yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Generate a trip and click "Save Plan" to see your history here.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg"
          >
            Start Planning
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="group bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer relative"
              onClick={() => handleViewDetails(trip)}
            >
              <div className="bg-primary p-5 text-white flex justify-between items-center group-hover:opacity-90 transition-opacity">
                <span className="font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  {new Date(trip.date).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-3">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                    {trip.trip_places?.length || 0} Stops
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, trip.id)}
                    className="bg-red-500/0 hover:bg-red-500 text-white p-1.5 rounded-lg transition-all"
                    title="Delete trip"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 flex-grow">
                <div className="space-y-3">
                  {trip.trip_places
                    ?.sort((a, b) => a.order_number - b.order_number)
                    .slice(0, 4)
                    .map((tp) => (
                      <div key={tp.id} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                          {tp.order_number}
                        </div>
                        <span className="text-gray-600 text-sm font-medium line-clamp-1">
                          {tp.places.name}
                        </span>
                      </div>
                    ))}
                  {trip.trip_places?.length > 4 && (
                    <p className="text-xs text-gray-400 font-medium pl-8">
                      + {trip.trip_places.length - 4} more stops...
                    </p>
                  )}
                </div>
              </div>
              <div className="p-4 bg-primary/10 border-t border-primary/20 text-center">
                <span className="text-primary font-bold text-sm flex items-center justify-center gap-1">
                  View Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
