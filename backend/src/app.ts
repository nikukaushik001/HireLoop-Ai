import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { authRoutes } from './routes/auth.routes';
import { globalErrorHandler } from './middleware/error.middleware';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import { jobRoutes } from './routes/job.routes';
import { candidateRoutes } from './routes/candidate.routes';
import { resumeRoutes } from './routes/resume.routes';
import { interviewRoutes } from './routes/interview.routes';
import { dashboardRoutes } from './routes/dashboard.routes';

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/candidates', candidateRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' }});
});

// Global Error Handler
app.use(globalErrorHandler);

export { app };
