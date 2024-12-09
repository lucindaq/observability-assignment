const tracer = require("./tracing")("todo-service");
const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
app.use(express.json());
const port = 3000;
let db;

const startServer = async () => {
    const client = await MongoClient.connect("mongodb://localhost:27017/");
    db = client.db("todo");
    await db.collection("todos").insertMany([
        { id: "1", title: "Buy groceries" },
        { id: "2", title: "Install Aspecto" },
        { id: "3", title: "buy my own name domain" },
    ]);
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
};
startServer();

// Add tracing to /todo route
app.get("/todo", async (req, res) => {
    const span = tracer.startSpan("GET /todo");
    try {
        const todos = await db.collection("todos").find({}).toArray();
        res.send(todos);
    } catch (error) {
        span.recordException(error);
        res.status(500).send("Error fetching todos");
    } finally {
        span.end();
    }
});

// Add tracing to /todo/:id route
app.get("/todo/:id", async (req, res) => {
    const span = tracer.startSpan("GET /todo/:id");
    try {
        const todo = await db.collection("todos").findOne({ id: req.params.id });
        res.send(todo);
    } catch (error) {
        span.recordException(error);
        res.status(500).send("Error fetching todo");
    } finally {
        span.end();
    }
});
