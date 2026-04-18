import { supabase } from "../supabase";

/**
 * FETCHES ALL TOURIST SPOTS FROM THE DATABASE
 */
export const fetchPlaces = async () => {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Fetch Places Error:", error);
    return { data: [], error };
  }
  return { data, error: null };
};

/**
 * CHECKS THE DATABASE CONNECTION
 */
export const checkDatabaseConnection = async () => {
  const { data, error } = await supabase.from("places").select("*").limit(1);
  return { isConnected: !error, error };
};
