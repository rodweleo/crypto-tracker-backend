const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Cryptocurrency Tracker API',
            version: '1.0.0',
            description: 'API for tracking cryptocurrency prices and managing user portfolios.',
        },
        servers: [
            {
                url: 'http://localhost:3000', // Update this to your deployed API URL
            },
        ],
    },
    apis: ['./src/routes/*.ts'], // Path to the API routes for documentation
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;
