import { supabase } from "./supabase";
import { useEffect, useState, useMemo } from "react";
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/LoginForm";
import { signOutUser } from "./auth";
import { savePlannedTrip } from "./tripService";
import SavedTripsView from "./components/SavedTripsView";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Fix for default Leaflet marker icons not showing up in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function formatTime(time) {
  const hours = Math.floor(time);
  const mins = Math.round((time - hours) * 60);
  const minutes = mins < 10 ? "0" + mins : mins;
  const period = hours >= 12 && hours < 24 ? "PM" : "AM";
  const formattedHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${formattedHour}:${minutes} ${period}`;
}

function App() {
  const [status, setStatus] = useState("Checking...");
  const [places, setPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [plannedTrip, setPlannedTrip] = useState([]);
  const [tripSummary, setTripSummary] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [includeLunch, setIncludeLunch] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [customLocation, setCustomLocation] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [mapFocus, setMapFocus] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("signup"); // "signup" or "login"
  const [session, setSession] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("home"); // "home" or "saved"
  const [currentTripId, setCurrentTripId] = useState(null);

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

  const categories = ["All", "Nature", "Recreation", "Religious", "Heritage"];

  function addToPlan(place) {
    if (!selectedPlaces.find((p) => p.id === place.id)) {
      setSelectedPlaces([...selectedPlaces, place]);
      setCurrentTripId(null); // Fresh plan mode
    }
  }

  function removeFromPlan(placeId) {
    setSelectedPlaces(selectedPlaces.filter((p) => p.id !== placeId));
    setCurrentTripId(null); // Fresh plan mode
  }

  function handleFocusLocation(lat, lon) {
    if (!showMap) setShowMap(true);
    // Use an object with a timestamp to ensure clicking the same location triggers the effect
    setMapFocus({ lat, lon, ts: Date.now() });
  }

  async function handleSaveTrip() {
    if (!session) {
      setAuthMode("login");
      setShowAuth(true);
      return;
    }

    if (currentTripId) {
      alert("This trip is already saved in your history!");
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await savePlannedTrip(session.user.id, plannedTrip);

      if (error) {
        alert("Error saving trip: " + error);
      } else {
        setCurrentTripId(data.id);
        alert("Plan saved successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  }

  async function generatePlan() {
    if (selectedPlaces.length === 0) return;
    setIsGenerating(true);

    try {
      let startLat, startLon;

      if (customLocation.trim()) {
        setStatus("Geocoding location...");
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(customLocation)}&limit=1`);
        const geoData = await geoRes.json();

        if (geoData.length > 0) {
          startLat = parseFloat(geoData[0].lat);
          startLon = parseFloat(geoData[0].lon);
        } else {
          alert("Could not find that location. Please try a different city or place name.");
          setIsGenerating(false);
          setStatus("✅ Connected Successfully");
          return;
        }
      } else {
        if (!navigator.geolocation) {
          alert("Geolocation is not supported by your browser");
          setIsGenerating(false);
          return;
        }

        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        startLat = position.coords.latitude;
        startLon = position.coords.longitude;
      }

      setStatus("Calculating Fast Route...");
      const userLat = startLat;
      const userLon = startLon;

      console.log(`Starting Point: https://www.google.com/maps?q=${userLat},${userLon}`);

      let availablePlaces = [...selectedPlaces];
      let sortedRoute = [];
      let currentLocation = { lat: userLat, lon: userLon };

      while (availablePlaces.length > 0) {
        let closestIndex = 0;
        let minDistance = Infinity;
        for (let i = 0; i < availablePlaces.length; i++) {
          const p = availablePlaces[i];
          const dist = getDistanceFromLatLonInKm(currentLocation.lat, currentLocation.lon, p.latitude, p.longitude);
          if (dist < minDistance) {
            minDistance = dist;
            closestIndex = i;
          }
        }
        const nextStop = availablePlaces.splice(closestIndex, 1)[0];
        sortedRoute.push(nextStop);
        currentLocation = { lat: nextStop.latitude, lon: nextStop.longitude };
      }

      let coordinatesString = `${userLon},${userLat}`;
      sortedRoute.forEach(place => {
        coordinatesString += `;${place.longitude},${place.latitude}`;
      });

      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`);
      const data = await response.json();

      if (data.code !== "Ok") {
        alert("Could not calculate actual roads. Make sure all spots have valid coordinates!");
        setStatus("✅ Connected Successfully");
        setIsGenerating(false);
        return;
      }

      const totalDistanceKm = data.routes[0].distance / 1000;
      const totalDrivingHours = data.routes[0].duration / 3600;

      // Parse start time "HH:MM" to float
      const [h, m] = startTime.split(":").map(Number);
      let currentTime = h + m / 60;
      const initialStartTime = currentTime;

      const legs = data.routes[0].legs;
      const finalItinerary = [];
      let lunchAdded = false;

      for (let i = 0; i < sortedRoute.length; i++) {
        const place = sortedRoute[i];
        const driveTimeHours = legs[i].duration / 3600;
        const driveDistanceKm = legs[i].distance / 1000;

        // Scenario A: Lunch happens BEFORE the drive (if it's already past 12:00 PM)
        if (includeLunch && !lunchAdded && currentTime >= 12.0 && currentTime < 14.5) {
          finalItinerary.push({
            id: "lunch-break",
            name: "🍱 Lunch Break",
            description: "Time to refuel after your last visit!",
            startTime: currentTime,
            endTime: currentTime + 1,
            isLunch: true,
            distanceFromPrevious: 0,
            latitude: currentLocation.lat + 0.0001,
            longitude: currentLocation.lon + 0.0001
          });
          currentTime += 1;
          lunchAdded = true;
        }

        let arrivalTime = currentTime + driveTimeHours;

        // Scenario B: Lunch happens AFTER the drive (if arrival is past 12:30 PM)
        if (includeLunch && !lunchAdded && arrivalTime >= 12.5 && arrivalTime < 15.0) {
          finalItinerary.push({
            id: "lunch-break",
            name: "🍱 Lunch Break",
            description: "Time to refuel and rest!",
            startTime: arrivalTime,
            endTime: arrivalTime + 1,
            isLunch: true,
            distanceFromPrevious: driveDistanceKm,
            latitude: place.latitude - 0.0001,
            longitude: place.longitude - 0.0001
          });
          currentTime = arrivalTime + 1;
          arrivalTime = currentTime;
          lunchAdded = true;
        }

        const visitDurationHours = (place.visit_duration_minutes || 60) / 60;
        const departureTime = arrivalTime + visitDurationHours;

        const distanceForThisStop = (lunchAdded && finalItinerary.length > 0 && finalItinerary[finalItinerary.length - 1].id === "lunch-break" && finalItinerary[finalItinerary.length - 1].distanceFromPrevious > 0)
          ? 0
          : driveDistanceKm;

        finalItinerary.push({
          ...place,
          startTime: arrivalTime,
          endTime: departureTime,
          distanceFromPrevious: distanceForThisStop
        });

        currentTime = departureTime;
        currentLocation = { lat: place.latitude, lon: place.longitude };
      }

      const totalTripHours = currentTime - initialStartTime;

      if (totalDistanceKm > 50 || totalTripHours > 12) {
        alert(`Whoops! Too long! This trip is ${totalDistanceKm.toFixed(1)} km and takes a total of ${totalTripHours.toFixed(1)} hours. Please remove a place from your plan.`);
        setStatus("✅ Connected Successfully");
        setIsGenerating(false);
        return;
      }

      setTripSummary({
        distance: totalDistanceKm.toFixed(1),
        drivingHours: totalDrivingHours.toFixed(1),
        totalHours: totalTripHours.toFixed(1)
      });
      setPlannedTrip(finalItinerary);
      if (data.routes[0].geometry) {
        setRouteGeometry(data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]));
      }
      setStatus("✅ Connected Successfully");
      setIsGenerating(false);
      setShowMap(false); // Map stays hidden until the button is clicked

    } catch (error) {
      console.error("Error generating plan:", error);
      alert("Something went wrong while generating the plan. Please check your internet and try again.");
      setStatus("✅ Connected Successfully");
      setIsGenerating(false);
    }
  }

  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Listen for auth changes (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowAuth(false); // Close modal on success
    });

    console.log("App Loaded");
    checkConnection();
    fetchPlaces();

    return () => subscription.unsubscribe();
  }, []);

  async function checkConnection() {
    const { data, error } = await supabase.from("places").select("*");

    if (error) {
      console.log("Error:", error); //  ADD THIS
      setStatus("❌ Not Connected");
    } else {
      console.log("Data:", data); // ADD THIS
      setStatus("✅ Connected Successfully");
    }
  }

  async function fetchPlaces() {
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.log("Error:", error);
    } else {
      console.log("Places:", data);
      setPlaces(data);
    }

  }

  return (
    <div>
      {/* Header with Auth Button */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">🌍 Day Visit Planner | {status}</h1>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <span className="text-sm font-semibold text-indigo-600 hidden md:block">
                Hi, {session.user.user_metadata?.username || session.user.email} 👋
              </span>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95 border border-red-100 flex items-center gap-2"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setAuthMode("signup");
                setShowAuth(true);
              }}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-md"
            >
              Sign Up 🚀
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b flex justify-center sticky top-0 z-[40]">
        <button
          onClick={() => setActiveTab("home")}
          className={`px-8 py-3 font-bold transition-all border-b-4 ${activeTab === "home" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          📍 Plan a Trip
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`px-8 py-3 font-bold transition-all border-b-4 ${activeTab === "saved" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          🎒 My Saved Trips
        </button>
      </div>

      {/* Sign Up Modal Overlay */}
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
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-all font-bold text-xl z-50 p-2"
              title="Close"
            >
              ✕
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
            className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🚪
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to leave?</h2>
              <p className="text-gray-500 mb-8">Are you sure you want to log out from your account?</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                >
                  Stay
                </button>
                <button
                  onClick={async () => {
                    await signOutUser();
                    setShowLogoutConfirm(false);
                  }}
                  className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95 shadow-md"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "home" ? (
        <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">My Current Plan ({selectedPlaces.length} places)</h2>
        {selectedPlaces.length > 0 && (
          <div className="mb-8 p-4 bg-gray-100 rounded-xl">
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedPlaces.map((place) => (
                <span key={`plan-${place.id}`} className="bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-2">
                  {place.name}
                  <button
                    onClick={() => removeFromPlan(place.id)}
                    className="text-sm font-bold text-red-100 hover:text-white active:scale-75 transition-transform"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4 bg-white/50 p-4 rounded-xl border border-white">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Trip Settings</h3>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-600">Starting Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Current Location (GPS)"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
                              className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-gray-700 transition-colors border-b last:border-0 border-gray-50"
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

                    <span className="absolute left-3 top-2.5 text-gray-400">📍</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-600">Start Time</label>
                  <div className="relative">
                    <select
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none bg-white"
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
                    <span className="absolute left-3 top-2.5 text-gray-400">⏰</span>
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
                  <span className="font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">
                    Include Lunch Break (1 hr) 🍱
                  </span>
                </label>

                <p className="text-xs text-gray-500 italic">
                  Tip: If "Starting Location" is empty, we'll use your current GPS location.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
              <button
                id="generate-btn"
                onClick={generatePlan}
                disabled={isGenerating}
                className={`
                  relative font-bold px-8 py-3 rounded-xl transition-all shadow-lg min-w-[200px]
                  ${isGenerating
                    ? "bg-indigo-400 cursor-wait scale-95"
                    : "bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.95] active:shadow-inner"}
                  text-white flex items-center justify-center gap-2
                `}
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin text-xl">🌀</span>
                    Generating...
                  </>
                ) : (
                  "Generate Plan 🚀"
                )}
              </button>
            </div>
          </div>
        )}

        {plannedTrip.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h2 className="text-3xl font-extrabold text-gray-900">Your Optimized Itinerary</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveTrip}
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
                              onClick={() => handleFocusLocation(stop.latitude, stop.longitude)}
                              className={`absolute -left-[45px] top-1 cursor-pointer hover:scale-110 active:scale-95 transition-all ${stop.isLunch ? 'bg-orange-500' : 'bg-indigo-500'} text-white font-bold w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-md`}
                              title="Click to zoom in on map"
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
                            <p className="text-gray-600 leading-relaxed italic">{stop.description}</p>
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
                      center={[plannedTrip[0].latitude, plannedTrip[0].longitude]}
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
                                  <div className="font-bold">{stop.name}</div>
                                  <div className="text-sm text-gray-600">{formatTime(stop.startTime)}</div>
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

                      <MapRefresher points={plannedTrip.map(s => [s.latitude, s.longitude])} />
                      <MapFocuser focus={mapFocus} />
                    </MapContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full font-semibold transition-all border active:scale-95 active:shadow-inner ${activeCategory === cat
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-500"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places
            .filter((place) => activeCategory === "All" || place.category === activeCategory)
            .map((place) => (
              <div
                key={place.id}
                className="flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
              >
                {place.image_url ? (
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="w-full h-48 object-cover border-b border-gray-100"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 border-b border-gray-200 flex items-center justify-center text-gray-400">
                    <span className="text-sm">No Image Available</span>
                  </div>
                )}

                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold text-gray-800">
                    {place.name}
                  </h2>

                  <p className="text-gray-500 mt-2 mb-4">
                    {place.description}
                  </p>

                  <button
                    onClick={() => addToPlan(place)}
                    disabled={selectedPlaces.some((p) => p.id === place.id)}
                    className={`mt-auto w-full font-semibold px-4 py-2 rounded-lg transition-all shadow-sm ${selectedPlaces.some((p) => p.id === place.id)
                      ? "bg-green-100 text-green-700 border-2 border-green-500 shadow-inner cursor-default flex items-center justify-center gap-2"
                      : "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 active:scale-[0.97] active:shadow-inner"
                      }`}
                  >
                    {selectedPlaces.some((p) => p.id === place.id) ? (
                      <>
                        <span>Added</span>
                        <span className="text-lg">✅</span>
                      </>
                    ) : (
                      "Add to Plan"
                    )}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    ) : (
        <div className="p-6">
          <SavedTripsView 
            session={session} 
            onOpenAuth={() => {
              setAuthMode("login");
              setShowAuth(true);
            }} 
          />
        </div>
      )}
    </div>
  );
}

export default App;
