import { Router } from 'express';
import multer from 'multer';
import { ResumeController } from '../controllers/resume.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const resumeController = new ResumeController();

// Multer config: store files in memory buffer for forwarding to FastAPI
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// All resume routes require authentication
router.use(requireAuth);

// Upload resumes for a specific job
router.post('/upload', upload.array('files', 20), resumeController.uploadResumes);

export const resumeRoutes = router;
