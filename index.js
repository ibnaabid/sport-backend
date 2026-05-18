const dotenv = require("dotenv")
dotenv.config()

const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    // for dynamic specific

    app.get("/add/:id", async(req,res)=>{
      const {id} = req.params
      const findone = await collection.findOne({
        _id: new ObjectId(id)
      })
      res.json(findone)
    })

    //  delete for one

    app.delete("/add/:id", async(req,res)=>{
      const {id} = req.params;
      const deleteOne= await collection.deleteOne({
        _id: new ObjectId(id)
      })
      res.json(deleteOne)
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
