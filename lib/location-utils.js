import { State, City } from "country-state-city";
export function createLocationSlug(city, state) {
  if (!city || !state) return "";

  const citySlug = city.toLowerCase().replace(/\s+/g, "-");
  const stateSlug = state.toLowerCase().replace(/\s+/g, "-");

  return `${citySlug}-${stateSlug}`;
}


export function parseLocationSlug(slug) {
  if (!slug || typeof slug !== "string") {
    return { city: null, state: null, isValid: false };
  }

  const parts = slug.split("-");

  // Must have at least 2 parts (city-state)
  if (parts.length < 2) {
    return { city: null, state: null, isValid: false };
  }

  // Parse city slug and normalize
  const citySlug = parts[0].toLowerCase();

  // Parse state (remaining parts joined)
  const stateName = parts
    .slice(1)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
// Get all Indian states
  const indianStates = State.getStatesOfCountry("IN");

  // Validate state exists
  const stateObj = indianStates.find(
    (s) => s.name.toLowerCase() === stateName.toLowerCase()
  );

  if (!stateObj) {
    return { city: null, state: null, isValid: false };
  }

  // Validate city exists in that state - tolerant matching
  const cities = City.getCitiesOfState("IN", stateObj.isoCode);

  // Exact match first
  let cityObj = cities.find((c) => c.name.toLowerCase() === citySlug);

  // Fallbacks for partials/typos: startsWith then includes
  if (!cityObj) {
    cityObj = cities.find((c) => c.name.toLowerCase().startsWith(citySlug));
  }
  if (!cityObj) {
    cityObj = cities.find((c) => c.name.toLowerCase().includes(citySlug));
  }

  if (!cityObj) {
    return { city: null, state: null, isValid: false };
  }

  const cityName = cityObj.name;

  return { city: cityName, state: stateName, isValid: true };


}
