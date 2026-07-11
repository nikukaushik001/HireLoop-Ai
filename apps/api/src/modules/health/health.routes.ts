/**
 * Health Check Routes
 *
 * Swagger documentation lives in JSDoc comments directly above each route.
 * swagger-jsdoc scans these comments and generates the OpenAPI spec.
 * This keeps docs co-located with the code they describe.
 */

import { Router } from 'express';
import { healthCheck } from './health.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Check API health status
 *     description: Returns the health status of the API server and its dependencies (database).
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     timestamp:
 *                       type: string
 *                       example: "2026-07-11T10:00:00.000Z"
 *                     uptime:
 *                       type: number
 *                       example: 3600
 *                     environment:
 *                       type: string
 *                       example: development
 *                     services:
 *                       type: object
 *                       properties:
 *                         server:
 *                           type: string
 *                           example: running
 *                         database:
 *                           type: string
 *                           example: connected
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: SERVICE_UNAVAILABLE
 *                     message:
 *                       type: string
 *                       example: Database connection failed
 */
router.get('/health', healthCheck);

export default router;
