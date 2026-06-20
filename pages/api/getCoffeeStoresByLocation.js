import { fetchCoffeeStores } from "@/lib/coffee-stores";

const getCoffeeStoresByLocation = async (req, res) => {
  const { latLong, limit = 30 } = req.query;

  if (!latLong) {
    return res.status(400).json({ message: "latLong is required" });
  }

  try {
    const response = await fetchCoffeeStores(latLong, limit);
    return res.status(200).json(Array.isArray(response) ? response : []);
  } catch (error) {
    console.error("Error fetching coffee stores", error);
    return res.status(200).json([]);
  }
};
export default getCoffeeStoresByLocation;