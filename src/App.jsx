import { supabase } from "./supabase";
import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    const { data, error } = await supabase.from("trips").select("*");

    if (error) {
      setStatus("❌ Not Connected");
    } else {
      setStatus("✅ Connected Successfully");
    }
  }

  return <h1>{status}</h1>;
}

export default App;
