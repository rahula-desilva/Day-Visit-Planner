import { useState, useEffect } from "react";
import { fetchPlaces } from "../services/placeService";
import { savePlannedTrip } from "../services/tripService";
import { getDistanceFromLatLonInKm } from "../utils/helpers";

// Components
import CategoryFilters from "../components/common/CategoryFilters";
import PlannerForm from "../components/planner/PlannerForm";
import ItineraryView from "../components/planner/ItineraryView";
import PlaceCard from "../components/common/PlaceCard";


/**
 * PAGE: Home
 * The main landing page: now manages its own trip planning logic and state.
 */
export default function Home({ 
  session, 
  setAuthMode, 
  setShowAuth,
  customLocation,
  setCustomLocation,
  startTime,
  setStartTime,
  includeLunch,
  setIncludeLunch
}) {
  // --- Planning Data State ---
  const [places, setPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [plannedTrip, setPlannedTrip] = useState([]);
  const [tripSummary, setTripSummary] = useState(null);
  
  // --- Planning Settings State ---
  const [activeCategory, setActiveCategory] = useState("All");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- Interaction State ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTripId, setCurrentTripId] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [mapFocus, setMapFocus] = useState(null);
  const [startPoint, setStartPoint] = useState(null);

  const categories = ["All", "Nature", "Recreation", "Religious", "Heritage"];
  const [openTipId, setOpenTipId] = useState(null);

  // Fetch places when home page loads
  useEffect(() => {
    async function loadPlaces() {
      const { data } = await fetchPlaces();
      setPlaces(data);
    }
    loadPlaces();

    // Listener to close tips when clicking elsewhere
    const handleGlobalClick = (e) => {
      if (!e.target.closest('.place-card') && !e.target.closest('.tip-button')) {
        setOpenTipId(null);
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // --- Functions ---
  function addToPlan(place) {
    if (!selectedPlaces.find((p) => p.id === place.id)) {
      setSelectedPlaces([...selectedPlaces, place]);
      setCurrentTripId(null);
    }
  }

  function removeFromPlan(placeId) {
    setSelectedPlaces(selectedPlaces.filter((p) => p.id !== placeId));
    setCurrentTripId(null);
  }

  function handleFocusLocation(lat, lon) {
    if (!lat || !lon) return;
    if (!showMap) setShowMap(true);
    setMapFocus({ lat, lon, ts: Date.now() });
  }

  async function handleSaveTrip() {
    if (!session) {
      setAuthMode("login");
      setShowAuth(true);
      return;
    }
    if (currentTripId) return;

    setIsSaving(true);
    const { data, error } = await savePlannedTrip(session.user.id, plannedTrip);
    if (!error) {
      setCurrentTripId(data.id);
      alert("Plan saved successfully!");
    } else {
      alert("Error saving trip: " + error);
    }
    setIsSaving(false);
  }

  
  async function generatePlan() {
    if (selectedPlaces.length === 0) return;
    setIsGenerating(true);

    try {
      let startLat = 6.9271; // Default to Colombo
      let startLon = 79.8612;
      
      // 1. Get Starting Coordinates
      if (customLocation && customLocation.trim()) {
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(customLocation)}&limit=1`);
          const geoData = await geoRes.json();
          if (geoData.length > 0) {
            startLat = parseFloat(geoData[0].lat);
            startLon = parseFloat(geoData[0].lon);
          } else {
            alert("Location not found. Using Colombo as default.");
          }
        } catch (e) {
          console.warn("Geocoding failed", e);
        }
      } else {
        try {
          const position = await new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej, { 
              enableHighAccuracy: true, 
              timeout: 15000, 
              maximumAge: 10000 
            });
          });
          startLat = position.coords.latitude;
          startLon = position.coords.longitude;
        } catch (err) {
          console.warn("Geolocation denied or timed out. Using Colombo as fallback.");
          alert("Could not automatically determine your location. Using default starting point.");
        }
      }

      // Store start point for map marker
      setStartPoint({ lat: startLat, lon: startLon });
      // 2. Sort Route (Nearest Neighbor)
      let available = [...selectedPlaces];
      let sorted = [];
      let currentLoc = { lat: startLat, lon: startLon };

      while (available.length > 0) {
        let closestIdx = 0;
        let minDist = Infinity;
        available.forEach((p, i) => {
          const d = getDistanceFromLatLonInKm(currentLoc.lat, currentLoc.lon, p.latitude, p.longitude);
          if (d < minDist) { minDist = d; closestIdx = i; }
        });
        const next = available.splice(closestIdx, 1)[0];
        sorted.push(next);
        currentLoc = { lat: next.latitude, lon: next.longitude };
      }

      // 3. Get Real Road Route (OSRM)
      let coords = `${startLon},${startLat};` + sorted.map(p => `${p.longitude},${p.latitude}`).join(';');
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
      const data = await response.json();

      if (data.code === "Ok") {
        let h = 9, m = 0;
        if (startTime && startTime.includes(":")) {
          [h, m] = startTime.split(":").map(Number);
        }
        let curTime = h + m/60;
        const initialTime = curTime;
        const legs = data.routes[0].legs;
        const finalItinerary = [];
        let lunchAdded = false;

        for (let i = 0; i < sorted.length; i++) {
          const place = sorted[i];
          const driveHrs = legs[i].duration / 3600;
          
          if (includeLunch && !lunchAdded && curTime + driveHrs >= 12.5) {
             finalItinerary.push({ 
               id: 'lunch', name: "Lunch Break", startTime: curTime + driveHrs, endTime: curTime + driveHrs + 1, isLunch: true, description: "Time to eat!" 
             });
             curTime += 1;
             lunchAdded = true;
          }

          const arrival = curTime + driveHrs;
          const duration = (place.visit_duration_minutes || 60) / 60;
          finalItinerary.push({ ...place, startTime: arrival, endTime: arrival + duration, distanceFromPrevious: legs[i].distance/1000 });
          curTime = arrival + duration;
        }

        setPlannedTrip(finalItinerary);
        const tripDistance = (data.routes[0].distance/1000).toFixed(1);
        const drivingHours = (data.routes[0].duration/3600).toFixed(1);
        const totalHours = (curTime - initialTime).toFixed(1);
        setTripSummary({ distance: tripDistance, drivingHours: drivingHours, totalHours: totalHours });
        setRouteGeometry(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
        
        // Validate trip limits for one-day trip
        if (parseFloat(tripDistance) > 50|| parseFloat(totalHours) > 8) {
          const distanceMsg = parseFloat(tripDistance) > 50 ? `Distance (${tripDistance}km) exceeds 50km` : '';
          const hoursMsg = parseFloat(totalHours) > 8 ? `Duration (${totalHours}hrs) exceeds 8 hours` : '';
          const issues = [distanceMsg, hoursMsg].filter(Boolean).join(' and ');
          
          if (!confirm(`⚠️ One-day trip planner!\n\n${issues}.\n\nThis may be too much for a comfortable one-day trip.\n\n👉 Press OK to adjust your plan (remove places)\n👉 Press Cancel to continue anyway`)) {
            // User wants to continue anyway (Cancel button)
            setShowMap(true);
          } else {
            // User wants to remove locations (OK button)
            setPlannedTrip([]);
            setTripSummary(null);
            setRouteGeometry(null);
            setShowMap(false);
            alert("Please remove some locations from your plan and try again.");
            return;
          }
        } else {
          setShowMap(true);
        }
      }
    } catch (e) {
      console.error(e);
      alert("Error generating plan.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Trip Plan ({selectedPlaces.length} places)</h2>
      
      {selectedPlaces.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedPlaces.map((place) => (
              <span key={`plan-${place.id}`} className="bg-[#005ab7] text-white px-3 py-1 rounded-full flex items-center gap-2 shadow-sm text-sm">
                {place.name}
                <button
                  onClick={() => removeFromPlan(place.id)}
                  className="text-white hover:text-red-200 transition-colors"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <PlannerForm 
            customLocation={customLocation}
            setCustomLocation={setCustomLocation}
            startTime={startTime}
            setStartTime={setStartTime}
            includeLunch={includeLunch}
            setIncludeLunch={setIncludeLunch}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            onGenerate={generatePlan}
            isGenerating={isGenerating}
          />
        </>
      )}

      {plannedTrip.length > 0 && (
        <ItineraryView 
          plannedTrip={plannedTrip}
          tripSummary={tripSummary}
          showMap={showMap}
          setShowMap={setShowMap}
          routeGeometry={routeGeometry}
          mapFocus={mapFocus}
          startPoint={startPoint}
          onFocusLocation={handleFocusLocation}
          onSaveTrip={handleSaveTrip}
          isSaving={isSaving}
          currentTripId={currentTripId}
        />
      )}

      <div className="mt-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Available Places to Visit</h2>
        
        <CategoryFilters 
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places
            .filter((place) => activeCategory === "All" || place.category === activeCategory)
            .map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                isSelected={selectedPlaces.some((p) => p.id === place.id)}
                onAdd={addToPlan}
                onRemove={() => removeFromPlan(place.id)}
                isOpen={openTipId === place.id}
                onToggleTip={() => setOpenTipId(openTipId === place.id ? null : place.id)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
