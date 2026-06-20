// initialize unsplash api
import { createApi } from 'unsplash-js';

const unsplashApi = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
});

const getUrlForCoffeeStores = (latLong, limit, query) => {
  return `https://api.foursquare.com/v2/venues/search?query=${query}&ll=${latLong}&client_id=${process.env.NEXT_PUBLIC_FOURSQUARE_CLIENT_ID}&client_secret=${process.env.NEXT_PUBLIC_FOURSQUARE_CLIENT_SECRET}&v=20231010&limit=${limit}`;
};

const getlistOfCoffeeStorePhotos = async () => {
  try {
    const unsplashResponse = await unsplashApi.search.getPhotos({
      query: 'coffee shops',
      perPage: 30,
    });

    if (!unsplashResponse || !unsplashResponse.response || !Array.isArray(unsplashResponse.response.results)) {
      console.error('Unsplash returned unexpected response:', unsplashResponse);
      return [];
    }

    return unsplashResponse.response.results.map((result) => result.urls?.small).filter(Boolean);
  } catch (error) {
    console.error('Error fetching Unsplash photos:', error);
    return [];
  }
};

// Helper function to build complete address from location object
const buildAddress = (location) => {
  if (!location) return "";
  const parts = [];
  
  // Pehle main address ya cross street try karo
  if (location.address) {
    parts.push(location.address);
  } else if (location.crossStreet) {
    parts.push(location.crossStreet);
  }
  
  // City, state, postal code add karo
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.postalCode) parts.push(location.postalCode);
  if (location.country) parts.push(location.country);
  
  const address = parts.filter(p => p).join(", ");
  return address || "";
};

// Reverse geocoding: coordinates se address nikalo
const getReverseGeocodedAddress = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    
    if (data.address) {
      const addr = data.address;
      const parts = [];
      if (addr.road) parts.push(addr.road);
      if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
      if (addr.postcode) parts.push(addr.postcode);
      if (addr.country) parts.push(addr.country);
      return parts.filter(p => p).join(", ");
    }
  } catch (error) {
    console.log("Reverse geocoding error:", error);
  }
  return "";
};

export const fetchCoffeeStores = async (latLong = "43.734408615313974, -79.35777890925395", limit = 16) => {
  const unsplashResponse = await getlistOfCoffeeStorePhotos();

  try {
    const response = await fetch(getUrlForCoffeeStores(latLong, limit, "coffee stores"));

    if (!response.ok) {
      console.error(`Foursquare fetch failed with status ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!data.response || !Array.isArray(data.response.venues)) {
      console.error('Unexpected Foursquare response:', data);
      return [];
    }

    return Promise.all(
      data.response.venues.map(async (venue, idx) => {
        let address = buildAddress(venue.location);

        if (!address && venue.location?.lat && venue.location?.lng) {
          address = await getReverseGeocodedAddress(venue.location.lat, venue.location.lng);
        }

        return {
          id: venue.id ? venue.id.toString() : idx.toString(),
          name: venue.name || "Coffee Store",
          address: address || "Address not available",
          neighborhood: (venue.location?.neighborhood && venue.location.neighborhood.length > 0)
            ? venue.location.neighborhood[0]
            : "",
          imgUrl: (unsplashResponse && unsplashResponse[idx]) ? unsplashResponse[idx] : null,
        };
      })
    );
  } catch (error) {
    console.error('Error fetching coffee store data:', error);
    return [];
  }
};

