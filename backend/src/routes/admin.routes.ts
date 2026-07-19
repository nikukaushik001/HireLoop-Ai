import { Router } from 'express';
import { getSystemStats, getSystemUsers } from '../controllers/admin.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/stats', getSystemStats);
router.get('/users', getSystemUsers);

export { router as adminRoutes };
