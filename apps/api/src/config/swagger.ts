/**
 * Swagger / OpenAPI Configuration
 *
 * WHY: API documentation that stays in sync with code.
 * swagger-jsdoc scans JSDoc comments in route files (@openapi blocks)
 * and generates an OpenAPI 3.0 specification. swagger-ui-express
 * serves a beautiful interactive UI at /api-docs.
 *
 * HOW: Each route file contains @openapi JSDoc comments.
 * This file configures what swagger-jsdoc scans and what metadata
 * appears in the Swagger UI header.
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HireLoop AI — API Documentation',
      version: '1.0.0',
      description:
        'AI-Powered Recruitment Intelligence Platform API. ' +
        'Express.js backend serving as the API gateway for the HireLoop system.',
      contact: {
        name: 'HireLoop Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
    },
  },

  // Scan all route files for @openapi JSDoc comments
  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
