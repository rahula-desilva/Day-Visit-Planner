import { supabase } from "./supabase";
import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Checking...");

useEffect(() => {
  console.log("App Loaded"); // 👈 ADD THIS
  checkConnection();
  saveTrip();
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

  return <h1>{status}</h1>;
}
async function saveTrip() {
  const { data, error } = await supabase
    .from('trips')
    .insert([
      {
        user_id: null,   // temporary (we'll fix auth later)
        date: "2026-04-08"
      }
    ])
    .select(); // 👈 ADD THIS

  if (error) {
    console.log("Insert Error:", error)
  } else {
    console.log("Trip Saved:", data)
  }
}


export default App;
