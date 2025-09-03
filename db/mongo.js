const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017"; // your connection string
const client = new MongoClient(uri);

let db; // global variable for DB

async function connectDB() {
  await client.connect();
  db = client.db("lawyerdb_mongo"); // name of your MongoDB database
  console.log("Mongo connected");
}

connectDB().catch(console.error);