// Test APIs
const TEST_FOURSQUARE = async () => {
  const url = `https://api.foursquare.com/v2/venues/search?query=coffee&ll=43.734,-79.357&client_id=4HLA3UN2I1QL4VDS4QS2PMWGFXYHKENVCG3NJLGLDFBQXE5G&client_secret=SAGEQRB0KYTXGTRXRASNXSI20ZFL1KFPN13YKU5W0LBEQ1LL&v=20231010&limit=1`;
  
  const res = await fetch(url);
  const data = await res.json();
  
  console.log("=== FourSquare API Test ===");
  console.log("Status Code:", data.meta?.code);
  console.log("Venues Found:", data.response?.venues?.length || 0);
  console.log("Error:", data.meta?.errorDetail || "None");
  
  return data;
};

const TEST_UNSPLASH = async () => {
  console.log("\n=== Unsplash API Test ===");
  console.log("Note: Unsplash requires browser environment or proper polyfill");
  console.log("Will test via Next.js dev server instead");
};

TEST_FOURSQUARE().then(() => TEST_UNSPLASH());