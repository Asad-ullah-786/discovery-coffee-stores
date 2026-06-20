import { fetchCoffeeStores } from "@/lib/coffee-stores";

const getCoffeeStoresByLocation = async (req, res) => {
  try {
    const { latLong, limit = 30 } = req.query;

    if (!latLong) {
      return res.status(400).json({ message: "latLong is required" });
    }

    const response = await fetchCoffeeStores(latLong, limit);
    res.status(200).json(Array.isArray(response) ? response : []);
  } catch (error) {
    console.error("Error fetching coffee stores", error);
    res.status(500).json({ message: "Error fetching coffee stores", error: error?.message || error });
  }
};
export default getCoffeeStoresByLocation;