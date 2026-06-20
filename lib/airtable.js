const Airtable = require("airtable");
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID,
);
const table = base("coffee-stores");

const getMinifiedRecord = (record) => {
  return {
    recordId: record.id,
    ...record.fields,
  };
};

const getMinifiedRecords = (records) => {
  return (records = records.map((record) => getMinifiedRecord(record)));
};

const findRecordByFilter = async (id) => {
  const findCoffeeStoreRecords = await table
    .select({
      filterByFormula: `id="${id}"`,
    })
    .firstPage();

  // firstPage() returns an array of record objects.
  // Use getMinifiedRecords to convert to array of plain objects.
  return getMinifiedRecords(findCoffeeStoreRecords);
};
export { table, getMinifiedRecord, getMinifiedRecords, findRecordByFilter };
