const dotenv = require("dotenv")
dotenv.config()

const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO 

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})



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

    const db = client.db("sportsData")
    const collection = db.collection("facility")

    app.post("/add",async(req,res)=>{
      const body = req.body
      const result = await collection.insertOne(body)
      res.json(result)
    })

    app.get("/add" , async(req,res)=>{
      const result = await collection.find().toArray()
      res.json(result)
    })
   
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
 
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
