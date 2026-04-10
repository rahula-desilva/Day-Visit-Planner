import { supabase } from "./supabase";
import { useEffect, useState } from "react";

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

  const categories = ["All", "Nature", "Recreation", "Religious", "Heritage"];

  function addToPlan(place) {
    if (!selectedPlaces.find((p) => p.id === place.id)) {
      setSelectedPlaces([...selectedPlaces, place]);
    }
  }

  function removeFromPlan(placeId) {
    setSelectedPlaces(selectedPlaces.filter((p) => p.id !== placeId));
  }

  async function generatePlan() {
    if (selectedPlaces.length === 0) return;
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatus("Calculating Fast Route...");
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        // 👉 ADD THIS TO DEBUG:
        console.log(`My Browser thinks I am exactly here: https://www.google.com/maps?q=${userLat},${userLon}`);

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

        try {
          const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=false`);
          const data = await response.json();

          if (data.code !== "Ok") {
            alert("Could not calculate actual roads. Make sure all spots have valid coordinates!");
            setStatus("✅ Connected Successfully");
            return;
          }

          const totalDistanceKm = data.routes[0].distance / 1000;
          const totalDrivingHours = data.routes[0].duration / 3600;

          let currentTime = 9;
          const legs = data.routes[0].legs;

          const finalItinerary = sortedRoute.map((place, index) => {
            const driveTimeHours = legs[index].duration / 3600;
            const arrivalTime = currentTime + driveTimeHours;
            const visitDurationHours = (place.visit_duration_minutes || 60) / 60;
            const departureTime = arrivalTime + visitDurationHours;

            currentTime = departureTime;

            return {
              ...place,
              startTime: arrivalTime,
              endTime: departureTime,
              distanceFromPrevious: legs[index].distance / 1000
            };
          });

          const totalTripHours = currentTime - 9;

          if (totalDistanceKm > 30 || totalTripHours > 8) {
            alert(`Whoops! Too long! This trip is ${totalDistanceKm.toFixed(1)} km and takes a total of ${totalTripHours.toFixed(1)} hours. Please remove a place from your plan.`);
            setStatus("✅ Connected Successfully");
            return;
          }

          setTripSummary({
            distance: totalDistanceKm.toFixed(1),
            drivingHours: totalDrivingHours.toFixed(1),
            totalHours: totalTripHours.toFixed(1)
          });
          setPlannedTrip(finalItinerary);
          setStatus("✅ Connected Successfully");

        } catch (error) {
          console.error("API Error: ", error);
          alert("Failed to connect to the fast map API.");
          setStatus("✅ Connected Successfully");
        }
      },
      (error) => {
        console.error(error);
        alert("We need your location to calculate actual driving time!");
      }
    );
  }

  useEffect(() => {
    console.log("App Loaded"); // 👈 ADD THIS
    checkConnection();
    fetchPlaces(); // ✅ updated


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
      <h1>{status}</h1>

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">My Current Plan ({selectedPlaces.length} places)</h2>
        {selectedPlaces.length > 0 && (
          <div className="mb-8 p-4 bg-gray-100 rounded-xl">
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedPlaces.map((place) => (
                <span key={`plan-${place.id}`} className="bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-2">
                  {place.name}
                  <button onClick={() => removeFromPlan(place.id)} className="text-sm font-bold text-red-200 hover:text-white">✕</button>
                </span>
              ))}
            </div>
            <button
              onClick={generatePlan}
              className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-lg w-full md:w-auto hover:bg-indigo-700 transition shadow-md"
            >
              Generate Plan 🚀
            </button>
          </div>
        )}

        {plannedTrip.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Your Optimized Itinerary</h2>

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
                {plannedTrip.map((stop, index) => (
                  <div key={`itinerary-${stop.id}`} className="relative">
                    <div className="absolute -left-[45px] top-1 bg-indigo-500 text-white font-bold w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-md">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{stop.name}</h3>
                    <p className="text-indigo-600 font-semibold mb-2 text-lg">
                      {formatTime(stop.startTime)} - {formatTime(stop.endTime)}
                    </p>
                    {stop.distanceFromPrevious !== 9999 && (
                      <p className="text-sm font-medium text-gray-500 mb-3 bg-gray-50 inline-block px-3 py-1 rounded-full border border-gray-200">
                        🚗 {stop.distanceFromPrevious.toFixed(1)} km {index === 0 ? "from your starting point" : "from previous stop"}
                      </p>
                    )}
                    <p className="text-gray-600 leading-relaxed">{stop.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full font-semibold transition-all border ${
                activeCategory === cat
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
                  className="mt-auto w-full bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                >
                  Add to Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
