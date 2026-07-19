import { Router } from 'express';
import multer from 'multer';
import { ResumeController } from '../controllers/resume.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const resumeController = new ResumeController();

import fs from 'fs';
import path from 'path';

const tempDir = path.join(__dirname, '../../uploads/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Multer config: store files temporarily on disk for background processing
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, tempDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  }),
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

// Upload resumes for a specific job (up to 500 resumes at once)
router.post('/upload', upload.array('files', 500), resumeController.uploadResumes);

export const resumeRoutes = router;
