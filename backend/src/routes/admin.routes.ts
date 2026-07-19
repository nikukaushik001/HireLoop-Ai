import { Router } from 'express';
import { getSystemStats, getSystemUsers, approveUser, revokeUser } from '../controllers/admin.controller';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/stats', requireSuperAdmin, getSystemStats);
router.get('/users', requireSuperAdmin, getSystemUsers);
router.put('/users/:id/approve', requireSuperAdmin, approveUser);
router.put('/users/:id/revoke', requireSuperAdmin, revokeUser);

export { router as adminRoutes };
