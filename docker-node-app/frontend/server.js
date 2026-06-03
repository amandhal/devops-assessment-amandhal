const express = require("express");
const axios = require("axios");

const app = express();

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "http://backend-service.default.svc.cluster.local:3000";

app.get("/", async (req, res) => {
  try {
    const health =
      await axios.get(
        `${BACKEND_URL}/health`
      );

    const stats =
      await axios.get(
        `${BACKEND_URL}/stats`
      );

    res.send(`
      <html>
      <body>
        <h1>DevOps Assessment App</h1>

        <p>Status:
        ${health.data.status}</p>

        <p>Requests:
        ${stats.data.requestCount}</p>

        <p>Users:
        ${stats.data.userCount}</p>

        <button onclick="location.reload()">
          Refresh
        </button>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(8080, () => {
  console.log("Frontend running");
});