import express from "express";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import swaggerSpec from "./config/SwaggerConfig";
import { QueueEvents } from "bullmq";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import routes from "./routes";
import { WebSocketServer } from "ws";
import "./utils/bullmq/workers";
import { prisma } from "./utils/prisma";
import RedisService from "./services/RedisService";
dotenv.config();

// Create an Express application
const app = express();
app.disable("x-powered-by");

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO server
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

const wsClients: Set<any> = new Set();
const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (ws: any) => {
  console.log("[WS] Client connected");
  wsClients.add(ws);
  ws.send(JSON.stringify({ message: "Connected to raw WebSocket" }));

  ws.on("message", (data: any) => {
    console.log("[WS] Received:", data.toString());
    ws.send(JSON.stringify({ echo: data.toString() }));
  });

  ws.on("close", () => {
    console.log("[WS] Client disconnected");
  });
});

// Middleware
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    // DB test
    await prisma.$queryRaw`SELECT 1`;

    // Redis test
    const redis = await new RedisService().getClient();
    await redis.ping();
    res.status(200).json({ status: "OK" });
  } catch (error: any) {
    res.status(500).json({ status: "FAIL", error: error.message });
  }
});

// Routes
app.use("/api", routes);

// Swagger UI setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// BullMq Queue Events
const queueEvents = new QueueEvents("purchase-crypto");
queueEvents.on("failed", ({ jobId, failedReason }) => {
  const message = JSON.stringify({
    event: "job-failed",
    jobId,
    failedReason,
  });

  console.error(`Job ${jobId} failed: ${failedReason}`);

  // Broadcast to WS clients
  wsClients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });

  io.emit("job-failed", { jobId, failedReason });
});

queueEvents.on("completed", ({ jobId }) => {
  const message = JSON.stringify({ event: "job-completed", jobId });

  console.log(`Job ${jobId} completed successfully`);

  // Broadcast to WS clients
  wsClients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });

  io.emit("job-completed", { jobId });
});

// Start the server and listen on the specified port
server.listen(3000, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:3000`);
  console.log("Swagger docs available at http://localhost:3000/api-docs");
});
