import{
    table,findRecordByFilter, getMinifiedRecords} from "../../lib/airtable";

const favouriteCoffeeStorebyId = async (req, res) => {
  if (req.method === "PUT") {
     const { id } = req.body;
    try {
      
        if (id) {
            const records = await findRecordByFilter(id);

            if (records.length > 0) {
                const record = records[0];
                const calculatedVoting = parseInt(record.voting) + 1 ;
                parseInt(1);
                console.log("Calculated Voting:", calculatedVoting);
                const upatedRecord = await table.update([
                    {
                        id: record.recordId,
                        fields: {
                        voting: calculatedVoting,
                        },
                    },
                ]); 
                if (upatedRecord) {
                    const minifiedRecord = getMinifiedRecords
                    (upatedRecord);
                    res.json(minifiedRecord);
                }

                
            } else {
                res.status(404).json({ message: "Coffee store not found" });
                return;
            }
        }
            
    } catch (error) {
      console.error("Error favoriting coffee store:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
}
};


 export default favouriteCoffeeStorebyId;     