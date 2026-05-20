const dotenv = require("dotenv");
dotenv.config();

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const db = client.db("sportsData");
    const sportCollection = db.collection("facility");
    const booking = db.collection("book-sport");

    app.post("/add", async(req,res) => {
      const body = req.body;
      const result = await sportCollection.insertOne(body);
      res.json(result);
    });

    app.get("/add", async(req,res) => {
      const result = await sportCollection.find().toArray();
      res.json(result);
    });

    app.get("/add/:id", async(req,res) => {
      const {id} = req.params;
      const findone = await sportCollection.findOne({
        _id: new ObjectId(id)
      });
      res.json(findone);
    });

    // Booking Post Endpoint
    app.post("/booking", async(req,res) => {
      const data = req.body;
      const result = await booking.insertOne(data);
      res.json(result);
    });

    // Booking Get Endpoint (আইডি কুয়েরি ফিক্সড ট্র্যাকিং)
    app.get("/booking/:userid", async(req,res) => {
      const { userid } = req.params;
      const bookdata = await booking.find({ userid: userid }).toArray(); // Explicitly mapping for safety
      res.json(bookdata);
    });
   

    // booking delete
    app.delete("/booking/:id",async(req,res)=>{
      const {id} = req.params;
      const deleteBooking = await booking.deleteOne({
        _id: new ObjectId(id)
      })
      res.json(deleteBooking)
    })


    // manage edit;
   app.patch("/manage/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const result = await sportCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: body }
  );
  res.json(result);
});




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Keep connection open
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});