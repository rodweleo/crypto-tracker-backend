import express from "express";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import routes from "./routes";
import { Server } from "http";
import swaggerSpec from "./config/SwaggerConfig";
dotenv.config();

// Create an Express application
const app = express();
const server: Server = new Server(app);

// Middleware
app.use(express.json());

// Routes
app.use("/api", routes);

// Swagger UI setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start the server and listen on the specified port
server.listen(3000, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:3000`);
  console.log("Swagger docs available at http://localhost:3000/api-docs");
});
