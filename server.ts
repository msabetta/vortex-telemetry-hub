import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { faker } from "@faker-js/faker";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  app.use(express.json());

  // Simulation State
  let metrics = {
    throughput: 0,
    latency: 0,
    ozoneUsage: 45.2, // percentage
    kafkaLag: 120,
    flinkProcessingRate: 0,
    errors: 0,
    activeSensors: 2500,
  };

  // Metrics History for charts
  const history: any[] = [];
  const MAX_HISTORY = 30;

  // Simulate Telemetry Flow
  setInterval(() => {
    // High throughput simulation: 50k-150k events/sec
    metrics.throughput = faker.number.int({ min: 85000, max: 145000 });
    metrics.latency = Number((faker.number.float({ min: 1.2, max: 8.5 })).toFixed(2));
    metrics.kafkaLag = faker.number.int({ min: 50, max: 450 });
    metrics.flinkProcessingRate = metrics.throughput - faker.number.int({ min: -100, max: 1000 });
    metrics.ozoneUsage = Math.min(100, metrics.ozoneUsage + 0.001);
    
    // Random error spikes
    if (Math.random() > 0.95) {
      metrics.errors += faker.number.int({ min: 1, max: 10 });
    }

    const snapshot = {
      timestamp: new Date().toISOString(),
      ...metrics
    };

    history.push(snapshot);
    if (history.length > MAX_HISTORY) history.shift();

    io.emit("metrics:update", snapshot);
  }, 1000);

  // API Routes
  app.get("/api/metrics/history", (req, res) => {
    res.json(history);
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", engine: "Vortex v1.0.0" });
  });

  app.use((req, res) => {
    const newUrl = "https://vortex-telemetry-hub.europe-west2.run.app" + req.originalUrl;
    return res.redirect(301, newUrl);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Vortex Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
