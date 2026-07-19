import { Router } from 'express';
import { getSystemStats, getSystemUsers, approveUser } from '../controllers/admin.controller';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/stats', requireSuperAdmin, getSystemStats);
router.get('/users', requireSuperAdmin, getSystemUsers);
router.put('/users/:id/approve', requireSuperAdmin, approveUser);

export { router as adminRoutes };
