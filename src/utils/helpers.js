/**
 * HELPER FUNCTIONS FOR CALCULATIONS AND FORMATTING
 */

/**
 * Calculates distance between two GPS coordinates in Kilometers
 */
export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

export function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Converts float time (e.g., 14.5) to a string (e.g., "2:30 PM")
 */
export function formatTime(time) {
  const hours = Math.floor(time);
  const mins = Math.round((time - hours) * 60);
  const minutes = mins < 10 ? "0" + mins : mins;
  const period = hours >= 12 && hours < 24 ? "PM" : "AM";
  const formattedHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${formattedHour}:${minutes} ${period}`;
}

/**
 * Normalizes opening hours display text in UI.
 */
export function formatOpeningHours(openingHours) {
  if (!openingHours) return "09:00 AM - 05:00 PM";
  if (String(openingHours).toLowerCase().includes("24")) return "Open 24 Hours";
  return openingHours;
}
