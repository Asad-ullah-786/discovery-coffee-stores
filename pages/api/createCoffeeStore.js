import { getMinifiedRecord, table,findRecordByFilter } from "@/lib/airtable";

const createCoffeeStore = async (req, res) => {
  console.log({ req });
  if (req.method === "POST") {
    const { id, name, address, neighbourhood, voting, imgUrl } = req.body;

    try {
      if (id) {
        const records = await findRecordByFilter(id);
        if (records.length !== 0) {
          res.json(records);
        } else {
          if (name) {
            const createRecords = await table.create([
              {
                fields: {
                  id,
                  name,
                  address,
                  neighbourhood,
                  voting:0,
                  imgUrl,
                },
              },
            ]);
            const records = getMinifiedRecord(createRecords);
            res.json({ records });
          } else {
            res.status(400);
            res.json({ message: "name is missing" });
          }
        }
      } else {
        res.status(400);
        res.json({ message: "Id is missing" });
      }
    } catch (err) {
      console.error("Error creating or finding coffee store", err);
      res.status(500);
      res.json({
        message: "Error creating or finding coffee store",
        error: err,
      });
    }
  }
};
export default createCoffeeStore;
