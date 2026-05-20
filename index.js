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

const jwtToken = async(req,res,next)=>{

 try{

 const authHeader =req.headers.authorization;

 if(!authHeader){

 return res.status(401).json({
 message:"Unauthorized"
 })

 }

 const token =authHeader.split(" ")[1];

 if(!token){

 return res.status(401).json({
 message:"Unauthorized"
 })

 }

 const JWKS =createRemoteJWKSet(
 new URL('http://localhost:3000/api/auth/jwks'));

 const {payload} =await jwtVerify(token,JWKS
 );

 

 next();

 }

 catch(error){

 return res.status(401).json({
 message:"Invalid Token"
 })

 }

}

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

// maange delte:
app.delete("/manage/:id", async(req,res)=>{
  const {id}= req.params;
  const deleteManage = await sportCollection.deleteOne({
    _id: new ObjectId(id)
  })
  res.json(deleteManage)
})


//  filter 
app.get("/facilities", async (req, res) => {
  const search = req.query.search || "";
  const sport = req.query.sport || "";

  let query = {};

  if (search) {
    query.sportName = { $regex: search, $options: "i" }; 
  }

  if (sport) {
    query.sportType = { $in: [sport] }; 
  }

  const result = await sportCollection.find(query).toArray(); 
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