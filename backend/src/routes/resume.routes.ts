import { Router } from 'express';
import multer from 'multer';
import { ResumeController } from '../controllers/resume.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const resumeController = new ResumeController();

import fs from 'fs';
import path from 'path';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

const tempDir = path.join(__dirname, '../../uploads/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION || 'us-east-1';
const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || 'hireloop-ai-resumes-2026';

let storageEngine: multer.StorageEngine;

if (accessKeyId && secretAccessKey) {
  const s3Client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey }
  });
  storageEngine = multerS3({
    s3: s3Client as any,
    bucket: bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'temp/' + uniqueSuffix + '-' + file.originalname);
    }
  });
} else {
  storageEngine = multer.diskStorage({
    destination: (req, file, cb) => cb(null, tempDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  });
}

// Multer config: store files temporarily in S3 (or disk fallback) for background processing
const upload = multer({
  storage: storageEngine,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    // Allow application/pdf or fallback to checking the extension if the OS sends octet-stream
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// All resume routes require authentication
router.use(requireAuth);

// Upload resumes for a specific job (up to 30 resumes at once)
router.post('/upload', upload.array('files', 30), resumeController.uploadResumes);

// Get progress of a running job queue
router.get('/progress/:jobId', resumeController.getProgress);

export const resumeRoutes = router;
