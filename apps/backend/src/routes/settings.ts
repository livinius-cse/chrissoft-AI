import { Router, Response } from 'express';
import { store } from '../store';
import {
  authenticate,
  requireRole,
  requireAdmin,
  AuthenticatedRequest
} from '../middleware/auth';

const router = Router();

// GET /api/settings - Authenticated (ADMIN & STAFF can view store profile for POS)
router.get('/', authenticate, requireRole('ADMIN', 'STAFF'), (req: AuthenticatedRequest, res: Response) => {
  return res.json(store.getSettings());
});

// PUT /api/settings - ADMIN ONLY (Tax config, store details, credentials)
router.put('/', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const updated = store.updateSettings(req.body);
  return res.json({
    success: true,
    settings: updated,
    message: 'Settings saved successfully'
  });
});

export default router;
