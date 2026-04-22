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

/**
 * UPLOADS AN IMAGE FILE TO SUPABASE STORAGE
 */
export const uploadPlaceImage = async (file) => {
  // Create a unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('places-images')
    .upload(filePath, file);

  if (error) {
    return { error };
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('places-images')
    .getPublicUrl(filePath);

  return { publicUrl, error: null };
};
