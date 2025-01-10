require('dotenv').config()
const express = require('express');
const app = express()
const port = process.env.PORT || 4545
const cors = require('cors')
const jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser')

// middleware 
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://querynest-8df96.web.app",
        "https://querynest-8df96.firebaseapp.com"
    ],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

const verifyToken = (req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        return res.status(401).send({ message: 'Unauthorized Access' })
    }
    jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized Access' })
        }
        res.user = decoded
        next()
    });

}

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        // await client.connect();
        const database = client.db("queryNestDB");
        const queriesCollection = database.collection("queries");
        const recommendationsCollection = database.collection("recommendations");

        // jwt sing 
        app.post('/jwt-singIn', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.SECRET_TOKEN, { expiresIn: '72h' });
            res
                .cookie('token', token, cookieOptions)
                .send({ success: true })
        })

        app.post("/jwt-logout", async (req, res) => {
            res
                .clearCookie("token", { ...cookieOptions, maxAge: 0 })
                .send({ success: true });
        });

        app.get('/', (req, res) => {
            res.send('Hello World!')
        })

        app.post('/add-queries', verifyToken, async (req, res) => {
            const body = req.body
            const result = await queriesCollection.insertOne(body)
            res.send(result)
        })

        app.get('/my-queries', verifyToken, async (req, res) => {
            const email = req.query.email;
            if (email !== res.user.email) {
                return res.status(403).send({ message: 'Forbidden Authorized' })
            }

            let query = { authorEmail: email }
            const result = await queriesCollection.find(query).sort({ uploadDate: -1 }).toArray()
            res.send(result)
        })

        // limit, search, sort 
        app.get('/all-queries', async (req, res) => {
            const limit = parseInt(req.query.limit)
            const search = req.query.search
            const sort = req.query.sort
            if (limit) {
                const result = await queriesCollection.find().limit(limit).sort({ uploadDate: -1 }).toArray()
                res.send(result)
            }
            else {
                let sortSelect = {}
                if (sort === 'asc') {
                    sortSelect = { uploadDate: 1 }
                } else if (sort === 'desc') {
                    sortSelect = { uploadDate: -1 }
                }
                else {
                    sortSelect
                }

                let query = {}

                if (search) {
                    query = {
                        product_name: {
                            $regex: search,
                            $options: 'i'
                        }
                    }
                }
                const result = await queriesCollection.find(query).sort(sortSelect).toArray()
                res.send(result)
            }
        })

        // delete my queries single data 
        app.delete('/my-querie/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await queriesCollection.deleteOne(query)
            res.send(result)
        })

        // querie details for api 
        app.get('/querie-details/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await queriesCollection.findOne(query)
            res.send(result)
        })

        app.patch('/query-update/:id', verifyToken, async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const body = req.body;
            const updateDoc = {
                $set: body
            }
            const result = await queriesCollection.updateOne(filter, updateDoc)
            res.send(result)
        })

        // recommendations
        app.post('/add-recommendations', async (req, res) => {
            const body = req.body;
            const id = body.queryId
            const filter = { _id: new ObjectId(id) }
            const query = {
                $inc: { recommendationCount: 1 }
            }
            const incCount = await queriesCollection.updateOne(filter, query)
            const result = await recommendationsCollection.insertOne(body)
            res.send(result)
        })

        app.get('/allRecommendation', async (req, res) => {
            const id = req.query.id
            const filter = { _id: new ObjectId() }
            const result = await recommendationsCollection.find().toArray()
            const filterQueryId = { queryId: id }
            const resultFind = await recommendationsCollection.find(filterQueryId).toArray()
            res.send(resultFind)
        })


        // my recommendations route
        app.get('/my-recommendation/:email', verifyToken, async (req, res) => {
            const email = req.params.email
            const result = await recommendationsCollection.find({ recommenderEmail: email }).toArray()
            res.send(result)
        })

        // delete my recommendation 
        app.delete('/my-recommendation/:id', async (req, res) => {
            const id = req.params.id;
            const queryId = req.query.queryId;
            const filter = { _id: new ObjectId(queryId) }
            const updateDoc = {
                $inc: {
                    recommendationCount: -1
                }
            }
            const decCount = await queriesCollection.updateOne(filter, updateDoc)
            const result = await recommendationsCollection.deleteOne({ _id: new ObjectId(id) })
            res.send(result)
        })

        // recommendation for me route 
        app.get('/recommendation-for-me/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            const result = await recommendationsCollection.find({ userEmail: email }).toArray()
            res.send(result)
        })

        // ---------------------------------------

        app.get('/popular-queries', async (req, res) => {
            const result = await queriesCollection
                .find({})
                .sort({ recommendationCount: -1 })
                .limit(5)
                .toArray();
            res.send(result);
        });

        // await client.db("admin").command({ ping: 1 });
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