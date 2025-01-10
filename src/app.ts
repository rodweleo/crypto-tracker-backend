// Import the 'express' module
import express from 'express';
import swaggerUi from 'swagger-ui-express';
const swaggerSpec = require('./config/swaggerConfig');
import dotenv from "dotenv";
const routes = require('./routes');

dotenv.config()


// Create an Express application
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api', routes);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start the server and listen on the specified port
app.listen(3000, () => {
    // Log a message when the server is successfully running
    console.log(`Server is running on http://localhost:3000`);
    console.log('Swagger docs available at http://localhost:3000/api-docs');
});