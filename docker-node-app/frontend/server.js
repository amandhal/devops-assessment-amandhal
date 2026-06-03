const express = require("express");
const axios = require("axios");

const app = express();

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "http://backend-service.default.svc.cluster.local:3000";

const FRONTEND_POD =
  process.env.HOSTNAME || "unknown";

app.get("/error", async (req, res) => {
  try {
    await axios.get(`${BACKEND_URL}/error`);
    res.send("Unexpected success");
  } catch (err) {
    res.status(500).send(
      "Backend error triggered successfully"
    );
  }
});

app.get("/slow", async (req, res) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/slow`
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/", async (req, res) => {
  try {
    const health = await axios.get(
      `${BACKEND_URL}/health`
    );

    const stats = await axios.get(
      `${BACKEND_URL}/stats`
    );

    res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>DevOps Assessment App</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
    }

    .card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    button {
      padding: 8px 16px;
      margin-right: 10px;
      cursor: pointer;
    }
  </style>
</head>

<body>

  <h1>DevOps Assessment App</h1>

  <div class="card">
    <p>
      <strong>Frontend Pod:</strong>
      ${FRONTEND_POD}
    </p>

    <p>
      <strong>Backend Pod:</strong>
      ${stats.data.pod}
    </p>

    <p>
      <strong>Status:</strong>
      ${health.data.status}
    </p>
  </div>

  <div class="card">
    <button onclick="location.reload()">
      Refresh
    </button>

    <button onclick="triggerError()">
      Trigger Error
    </button>

    <button onclick="triggerSlow()">
      Slow Request
    </button>
  </div>

  <script>
    async function triggerError() {
      try {
        const response = await fetch("/error");
        const text = await response.text();
        alert(text);
      } catch (err) {
        alert("Failed to trigger error");
      }
    }

    async function triggerSlow() {
      try {
        const response = await fetch("/slow");
        const text = await response.text();
        alert(text);
      } catch (err) {
        alert("Failed to trigger slow request");
      }
    }
  </script>

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