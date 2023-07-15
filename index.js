const express = require("express");
const redis = require("redis");
const app = express();
const port = 3000;

const client = redis.createClient({
    host: "localhost",
    port: "6379",
});

client.on("error", (error) => {
    console.error("Redis connection error:", error);
});

client.connect();

client.on("connect", () => {
    console.log("Redis client connected");
});

// Serve the front-end to the client
app.get("/", async (req, res) => {
    try {
        const reply = await client.get("counter");

        const counter = reply || 0;
        res.send(`
        <html>
          <head>
            <title>Front-end</title>
            <style>
              body {
                background-color: #252525;
                color: #fff;
                font-family: Arial, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
              }
              .container {
                text-align: center;
              }
              h1 {
                margin-bottom: 16px;
              }
              p {
                margin-bottom: 8px;
              }
              .button {
                display: inline-block;
                padding: 8px 16px;
                background-color: #4caf50;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                cursor: pointer;
                border: none;
                outline: none;
              }
              .button:hover {
                background-color: #45a049;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Ergomake Example</h1>
              <p>Counter: <span id="counter">${counter}</span></p>
              <button class="button" onclick="increment()">Increment</button>
              <button class="button" onclick="decrement()">Decrement</button>
            </div>
            <script>
              function updateCounter(value) {
                document.getElementById('counter').textContent = value;
              }

              function increment() {
                fetch('/increment')
                  .then(response => response.text())
                  .then(message => {
                    updateCounter(message);
                  })
                  .catch(error => console.log(error));
              }

              function decrement() {
                fetch('/decrement')
                  .then(response => response.text())
                  .then(message => {
                    updateCounter(message);
                  })
                  .catch(error => console.log(error));
              }
            </script>
          </body>
        </html>
      `);
    } catch (err) {
        console.error("Redis GET error:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Increment the counter on each request to /increment endpoint
app.get("/increment", async (req, res) => {
    try {
        const reply = await client.incr("counter");
        res.send(reply.toString());
    } catch (err) {
        console.error("Redis INCR error:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Decrement the counter on each request to /decrement endpoint
app.get("/decrement", async (req, res) => {
    try {
        const reply = await client.decr("counter");
        res.send(reply.toString());
    } catch (err) {
        console.error("Redis DECR error:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});
