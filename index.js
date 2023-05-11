const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())


// routes 

app.get('/', (req, res) => {
    res.send('card doctor server is running...')
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.i5ku26o.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const database = client.db('carDoctorDB');
        const servicesCollection = database.collection('services')
        const bookingCollection = database.collection('bookings')


        // get all services
        app.get('/services', async (req, res) => {
            const result = await servicesCollection.find().toArray();
            res.send(result);
        })


        // get individual services
        app.get('/services/:id', async (req, res) => {
            const result = await servicesCollection.findOne({ _id: new ObjectId(req.params.id) })
            res.send(result)
        })

        // set booking data
        app.post('/bookings', async (req, res) => {
            const bookedService = req.body;

            const result = await bookingCollection.insertOne(bookedService);

            res.send(result)
        })

        // get specific email booking data
        app.get('/bookings', async (req, res) => {
            let query = {}
            if (req.query?.email) {
                query.email = req.query?.email
            }

            const result = await bookingCollection.find(query).toArray()

            res.send(result)
        })

        // delete a booking

        app.delete('/bookings/:id', async (req, res) => {
            const result = await bookingCollection.deleteOne({ _id: new ObjectId(req.params.id) })

            res.send(result);

        })

        // update a booking
        app.patch('/bookings/:id', async (req, res) => {

            const result = await bookingCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: req.body.status } })

            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);







app.listen(port, () => {
    console.log(`car doctor server is running on port ${port}`);
})