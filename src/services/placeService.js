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

/**
 * ADMIN: ADD A NEW PLACE
 */
export const addPlace = async (placeDetails) => {
  const { data, error } = await supabase
    .from("places")
    .insert([placeDetails])
    .select();

  return { data, error };
};

/**
 * ADMIN: UPDATE AN EXISTING PLACE
 */
export const updatePlace = async (placeId, placeDetails) => {
  const { data, error } = await supabase
    .from("places")
    .update(placeDetails)
    .eq("id", placeId)
    .select();

  return { data, error };
};
export const deletePlace = async (placeId) => {
  const { error } = await supabase.from("places").delete().eq("id", placeId);
  return { error };
};
