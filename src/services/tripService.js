import { supabase } from "../supabase";

/**
 * SAVES A PLANNED TRIP TO THE DATABASE
 * 1. Inserts into 'trips' table to get the trip ID.
 * 2. Inserts all selected places into 'trip_places' table linked to that ID.
 */
export const savePlannedTrip = async (userId, plannedTrip) => {
  try {
    // main trip record
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .insert([
        { 
          user_id: userId, 
          date: new Date().toISOString().split('T')[0] // Saves as YYYY-MM-DD
        }
      ])
      .select()
      .single();

    if (tripError) throw tripError;

    // Order 
    const tripId = tripData.id;
    const placesToInsert = plannedTrip
      .filter(item => !item.isLunch)
      .map((item, index) => ({
        trip_id: tripId,
        place_id: item.id,
        order_number: index + 1
      }));

    // Save all places at once 
    const { error: placesError } = await supabase
      .from("trip_places")
      .insert(placesToInsert);

    if (placesError) throw placesError;

    return { data: tripData, error: null };
  } catch (error) {
    console.error("Save Trip Error:", error);
    return { data: null, error: error.message };
  }
};

/**
 * FETCHES ALL SAVED TRIPS FOR A USER
 */
export const getUserTrips = async (userId) => {
  const { data, error } = await supabase
    .from("trips")
    .select(`
      *,
      trip_places (
        id,
        order_number,
        places (*)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
};

/**
 * DELETES A SAVED TRIP
 */
export const deleteTrip = async (tripId) => {
  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId);

  return { error };
};
