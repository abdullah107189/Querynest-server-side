require('dotenv').config()
const express = require('express');
const app = express()
const port = process.env.PORT || 4545
const cors = require('cors')
// middleware 
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fx40ttv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        const database = client.db("queryNestDB");
        const queriesCollection = database.collection("queries");

        app.get('/', (req, res) => {
            res.send('Hello World!')
        })
        app.post('/add-queries', async (req, res) => {
            const body = req.body
            const result = await queriesCollection.insertOne(body)
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`This server is running this port : ${port}`);
})