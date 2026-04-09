import { supabase } from "./supabase";
import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Checking...");
  const [places, setPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);

  function addToPlan(place) {
    if (!selectedPlaces.find((p) => p.id === place.id)) {
      setSelectedPlaces([...selectedPlaces, place]);
    }
  }

  function removeFromPlan(placeId) {
    setSelectedPlaces(selectedPlaces.filter((p) => p.id !== placeId));
  }

  function generatePlan() {
    console.log("Generating plan algorithm will go here!");
    alert("Generating plan for " + selectedPlaces.length + " places! (Map and sorting logic coming next)");
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
      .select("*");

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

        <h2 className="text-2xl font-bold mb-4">Available Places</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place) => (
          <div
            key={place.id}
            className="flex flex-col bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              {place.name}
            </h2>

            <p className="text-gray-500 mt-2 mb-4">
              {place.description}
            </p>

            <button 
              onClick={() => addToPlan(place)}
              className="mt-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Add to Plan
            </button>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

export default App;
