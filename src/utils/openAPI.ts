import { default as jsdoc } from 'swagger-jsdoc';

// Define OpenAPI options
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Castrol API Documentation',
            version: '1.0.0',
            description: 'API documentation for Castrol application',
        },
        servers: [
            {
                url: process.env.BACKEND_URL,
            },
        ],
    },
    apis: ['src\\swagger\\*.ts'],
};

export function getOpenApiSpecification(): object {
    // Generate OpenAPI specification from JSDoc comments
    const openapiSpecification = jsdoc(options);
    return openapiSpecification;
}