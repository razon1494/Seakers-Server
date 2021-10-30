const express=require('express')
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors=require('cors');

const app = express()
const port=process.env.PORT||5000;
const ObjectId=require('mongodb').ObjectId;
//middleware
app.use(cors());
app.use(express.json());

const uri=`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yug9g.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client=new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

async function run() {
  try {
      await client.connect();
      console.log('connected to databse from tour server');
      const database=client.db("TourDb");
      const servicesCollection=database.collection("services");
      const bookingCollection=database.collection("bookings");
    //GET API
      app.get('/services', async (req, res) => {
          const cursor=servicesCollection.find({});
          const services=await cursor.toArray();
          res.send(services);
      })
      app.get('/managebookings', async (req, res) => {
          const cursor=bookingCollection.find({});
          const services=await cursor.toArray();
          res.send(services);
      })
      //GET Single Service
      app.get('/services/:id', async (req, res) => {
          const id=req.params.id;
          console.log('got specific id', id);
          const query={_id: ObjectId(id)};
          const service=await servicesCollection.findOne(query);
          res.json(service);
      })
    //add bookings POST API
      app.post('/placeorder', async (req, res) => {
          const service=req.body;
          console.log('result hitted the post api', service);
          const result=await bookingCollection.insertOne(service);
          console.log(result);
          res.send(result);
      });

    //add new tour POST API
    app.post('/addservice', async (req, res) => {
      const service=req.body;
      const result=await servicesCollection.insertOne(service);
      res.json(result);
    })

     // my bookings

  app.get("/mybookings/:email", async (req, res) => {
    const result = await bookingCollection.find({
      email: req.params.email,
    }).toArray();
    res.send(result);
  });
    //update Status
    app.put('/services/:id', async (req, res) => {
      const id=req.params.id;
      console.log('Updating', id);
      const filter= {_id: ObjectId(id)};
      const options={upsert: true};
      const updateDoc={
        $set: {
          status: true
        },
      };
      const result=await bookingCollection.updateOne(filter, updateDoc);

      res.json(result);
    })
      //DELETE API from database
      app.delete('/deletebooking/:id', async (req, res) => {
        const id=req.params.id;
        console.log(id);
        const query={_id: ObjectId(id)};
        console.log(query);
          const result=await bookingCollection.deleteOne(query);
          res.json(result);
      })
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})