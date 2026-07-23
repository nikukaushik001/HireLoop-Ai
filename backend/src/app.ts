import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { authRoutes } from './routes/auth.routes';
import { globalErrorHandler } from './middleware/error.middleware';

const app = express();

// Rate Limiting (Prevents DDoS and brute-force attacks)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Limit each IP to 2000 requests per windowMs to allow for frontend progress polling
  message: { success: false, error: { message: 'Too many requests from this IP, please try again after 15 minutes' } }
});
app.use('/api', limiter);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Security middleware
app.use(helmet());

// CORS configuration - support multiple comma-separated origins
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o: string) => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow if no origin (e.g. curl), or if it's in the allowed list, or if it's a vercel domain or localhost or custom domain
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('vercel.app') || origin.startsWith('http://localhost') || origin.endsWith('hireloopai.me')) {
      callback(null, true);
    } else {
      console.error(`CORS Blocked: Origin '${origin}' is not allowed.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
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
import { adminRoutes } from './routes/admin.routes';

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/candidates', candidateRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint for browser testing
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Welcome to HireLoop-AI Backend API! The server is running perfectly.' 
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' }});
});

// Global Error Handler
app.use(globalErrorHandler);

export { app };
