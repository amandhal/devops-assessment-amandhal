const express = require("express");
const client = require("prom-client");
const pino = require("pino");
const pinoHttp = require("pino-http");

const app = express();

const logger = pino({
  level: "info",
  base: {
    pod: process.env.HOSTNAME || "unknown"
  }
});

app.use(express.json());
app.use(pinoHttp({ logger }));

const register = new client.Registry();

client.collectDefaultMetrics({
  register
});

const requestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total requests"
});

const latency = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Request latency",
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2]
});

register.registerMetric(requestCounter);
register.registerMetric(latency);

const HOSTNAME =
  process.env.HOSTNAME || "unknown";

app.use((req, res, next) => {
  requestCounter.inc();

  const end = latency.startTimer();

  res.on("finish", () => {
    end();
  });

  next();
});

app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    timestamp: new Date(),
    pod: HOSTNAME
  });
});

app.get("/stats", (req, res) => {
  res.json({
    pod: HOSTNAME
  });
});

app.get("/slow", async (req, res) => {
  await new Promise((resolve) =>
    setTimeout(resolve, 3000)
  );

  res.json({
    message: "Slow response completed",
    pod: HOSTNAME
  });
});

app.get("/error", (req, res) => {
  throw new Error(
    "Intentional error for Kibana demo"
  );
});

app.get("/metrics", async (req, res) => {
  res.set(
    "Content-Type",
    register.contentType
  );

  res.end(await register.metrics());
});

app.use((err, req, res, next) => {
  req.log.error(err);

  res.status(500).json({
    error: err.message
  });
});

app.listen(3000, () => {
  console.log("Backend running");
});