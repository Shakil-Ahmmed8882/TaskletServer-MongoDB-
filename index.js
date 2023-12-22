const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//|| MONGODB connection
const uri = "mongodb://0.0.0.0:27017";

//middle ware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

// Creating a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    //Creating database and colleciton
    const database = client.db("Tasklet");
    const userCollection = database.collection("users");
    const taskCollection = database.collection("tasks");

    // get all the users
    app.get("/users", async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    // get single task for user (edit)
    app.get("/task", async (req, res) => {
      try {
        const taskId = req.query.taskId;
        if (taskId) {
          console.log(taskId);
          const task = await taskCollection.findOne({
            _id: new ObjectId(taskId),
          });
          res.send(task);
        }
      } catch (error) {
        console.log(error);
      }
    });
    // get all the tasks of an individual user
    app.get("/tasks", async (req, res) => {
      const email = req.query.email;

      console.log(email);
      const tasks = await taskCollection.find({ email }).toArray();
      res.send(tasks);
    });

    // ========= POST ==========
    // store single task
    app.post("/task", async (req, res) => {
      try {
        const task = req.body;
        const isTheTaskStored = await taskCollection.insertOne(task);

        res.send(isTheTaskStored);
      } catch (error) {
        console.log(error);
      }
    });

    // ========= PUT ==========
    app.put("/task", async (req, res) => {
      const taskId = req.query.id;
      const updatedTaskData = req.body;

      const filter = { _id: new ObjectId(taskId) };
      const updateDoc = {
        $set: updatedTaskData,
      };

      const result = await taskCollection.updateOne(filter, updateDoc);

      res.send(result);
    });



    
    // ========= PATCh ==========
    app.patch("/task", async (req, res) => {
      const taskId = req.query.id;
      const state = req.query.state;

      const filter = { _id: new ObjectId(taskId) };
      const task = await taskCollection.findOne(filter)
      
      
      const updateDoc = {
        $set:{
          progress : state 
        },
      };

      const result = await taskCollection.updateOne(filter, updateDoc);

      console.log(result)
      res.send(result);
    });
    // ========= Delete ==========
    app.delete("/task", async (req, res) => {
      const taskId = req.query.id;

      const filter = { _id: new ObjectId(taskId) };
      const result = await taskCollection.deleteOne(filter);

      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  try {
    res.send("Task manager server is running");
  } catch (err) {
    console.log(err);
  }
});

// Start the server on the specified port.
app.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});
