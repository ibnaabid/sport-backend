const dotenv = require("dotenv");
dotenv.config();

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { jwtVerify, createRemoteJWKSet } = require("jose-cjs");
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

const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));
console.log(JWKS)

const jwtToken = async(req, res, next) => {
const authHeader = req?.headers.authorization;
console.log(authHeader)
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  console.log(token)
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }


  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log(payload);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden" });
  }

};

async function run() {
  try {
    // await client.connect();

    const db = client.db("sportsData");
    const sportCollection = db.collection("facility");
    const booking = db.collection("book-sport");

    app.post("/add", async(req, res) => {
      const body = req.body;
      const result = await sportCollection.insertOne(body);
      res.json(result);
    });

    app.get("/add",jwtToken, async(req, res) => {
      const result = await sportCollection.find().toArray();
      res.json(result);
    });

    app.get("/add/:id",jwtToken, async(req, res) => {
      const { id } = req.params;
      const findone = await sportCollection.findOne({
        _id: new ObjectId(id)
      });
      res.json(findone);
    });

    // Booking Post Endpoint
    app.post("/booking",jwtToken, async(req, res) => {
      const data = req.body;
      const result = await booking.insertOne(data);
      res.json(result);
    });

    // Booking Get Endpoint
    app.get("/booking/:userid", async(req, res) => {
      const { userid } = req.params;
      const bookdata = await booking.find({ userid: userid }).toArray();
      res.json(bookdata);
    });
    
    // Booking Delete Endpoint
    app.delete("/booking/:id", async(req, res) => {
      const { id } = req.params;
      const deleteBooking = await booking.deleteOne({
        _id: new ObjectId(id)
      });
      res.json(deleteBooking);
    });

    // all manage
    app.get("/manage", jwtToken, async (req, res) => {
  const result = await sportCollection.find().toArray();
  res.json(result);
});

    // Manage Edit/Update Endpoint
    app.patch("/manage/:id", async (req, res) => {
      const { id } = req.params;
      const body = req.body;
      const result = await sportCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: body }
      );
      res.json(result);
    });

    // Manage Delete Endpoint
    app.delete("/manage/:id",jwtToken, async(req, res) => {
      const { id } = req.params;
      const deleteManage = await sportCollection.deleteOne({
        _id: new ObjectId(id)
      });
      res.json(deleteManage);
    });

    // 

    app.get("/facilities",

    

      async (req, res) => {

        const search =
          req.query.search || "";

        const sport =
          req.query.sport || "";

        let query = {};

        if (search) {

          query.sportName = {

            $regex: search,

            $options: "i"

          };

        }

        if (sport) {

          query.sportType = {

            $in: [sport]

          };

        }

        const result =
          await sportCollection
            .find(query)
            .toArray();

        res.json(result);

      }
    );


    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});