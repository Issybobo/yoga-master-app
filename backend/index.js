const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;
console.log("DB user name", process.env.DB_USER);

app.use(cors());
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.toizdxw.mongodb.net/?retryWrites=true&w=majority`;

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
      const database = client.db("yoga-master");
      const userCollections = database.collection("users");
      const classsesCollections = database.collection("classes");
      const cartCollections = database.collection("cart");
      const paymentCollections = database.collection("payment");
      const enrolledCollections = database.collection("enrolled");
      const appliedCollection = database.collection("applied");

      // Move your route handlers here
      app.post('/new-class', async (req, res) => {
        const newClass = req.body;
        // newClass.availableSeats = [arseInt(newClass.availableSeats);

        const result = await classsesCollections.insertOne(newClass);
        res.send(result);
      });

      
      app.get('/classes', async (req, res) => {
        const query = {status: 'approved'};
        const result = await classsesCollections.find().toArray();
        res.send(result)
      })

      // get classes by instructor email adress
      app.get('/classes/:email', async (req, res) => {
        const email = req.params.email;
        const query = {instructorEmail: email};
        const result = await classsesCollections.find(query).toArray();
        res.send(result);
      })

      // manage classes
      app.get('/classes-manage', async (req, res) => {
        const result = await classsesCollections.find().toArray();
        res.send(result);
      })

      // update classes

      app.patch('/change-status/:id', async(req, res) => {
        const id = req.params.id;
        const status = req.body.status;
        const reason = req.body.reason;
        const filter = {_id: new ObjectId(id)};
        const options = {upsert: true};
        const updateDoc = {
          $set: {
            status: status,
            reason: reason,
          },
        };
        const result = await classsesCollections.updateOne(filter, updateDoc, options);
        res.send(result)
      })

      // get approved classes
      app.get('/approved-classes', async(req, res) => {
        const query = {status: 'approved'};
        const result = await classsesCollections.find(query).toArray();
        res.send(result);
      });

      // get single class details
      app.get('/class/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId (id)};
        const result = await classsesCollections.findOne(query);
        res.send(result)
      })

      // Update class details 

      app.put('/update-class/:id', async (req, res) => {
        const id = req.params.id;
        const updateClass = req.body;
        const filter = {_id: new ObjectId(id)};
        const options = {upsert: true};
        const updateDoc = {
          $set: {
            name: updateClass.name,
            description: updateClass.description,
            price: updateClass.price,
            availableSeats: parseInt(updateClass.availableSeats),
            videoLink: updateClass.videoLink,
            status: 'pending',
          }
        };
        const result = await classsesCollections.updateOne(filter, updateDoc, options);
        res.send(result)
      })
      

      console.log("Pinged your deployment. You successfully connected to MongoDB");

      // Start the server after the client is connected
      app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
      });
 } catch (error) {
      console.error(error);
 } finally {
      // Do not close the client here if you're starting the server inside this function
 }
}

// Run the connection function
run().catch(console.dir);
