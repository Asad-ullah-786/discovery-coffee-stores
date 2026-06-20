// Test Unsplash API
import { createApi } from 'unsplash-js';

const unsplashApi = createApi({
  accessKey: 'GqVhjHqBLWedcR4BWdNkl4XWg_rO_B6OBSh9HNwTf4E',
});

const testUnsplash = async () => {
  console.log("=== Unsplash API Test ===");
  
  try {
    const response = await unsplashApi.search.getPhotos({
      query: 'coffee shops',
      perPage: 5,
    });
    
    console.log("Status:", response.errors ? "Error" : "Success");
    console.log("Errors:", response.errors || "None");
    console.log("Photos Found:", response.response?.results?.length || 0);
    
    if (response.response?.results?.[0]) {
      console.log("First Photo URL:", response.response.results[0].urls.small.substring(0, 50) + "...");
    }
  } catch (error) {
    console.log("Catch Error:", error.message);
  }
};

testUnsplash();
