import { Router, Response } from 'express';
import { store } from '../store';
import {
  authenticate,
  requireRole,
  requireAdmin,
  AuthenticatedRequest
} from '../middleware/auth';
import { BusinessType } from '../types';

const router = Router();

const VALID_BUSINESS_TYPES: BusinessType[] = [
  'RETAIL',
  'GROCERY',
  'PHARMACY',
  'ELECTRONICS',
  'FASHION',
  'HARDWARE',
  'WHOLESALE'
];

// GET /api/settings - Authenticated (ADMIN & STAFF can view store profile for POS)
router.get('/', authenticate, requireRole('ADMIN', 'STAFF'), (req: AuthenticatedRequest, res: Response) => {
  return res.json(store.getSettings());
});

// PUT /api/settings - ADMIN ONLY (Tax config, store details, business type)
router.put('/', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { businessType, ...otherSettings } = req.body;

  if (businessType !== undefined) {
    if (!VALID_BUSINESS_TYPES.includes(businessType)) {
      return res.status(400).json({
        error: `Invalid businessType "${businessType}". Must be one of: ${VALID_BUSINESS_TYPES.join(', ')}`
      });
    }
  }

  const updated = store.updateSettings({
    ...otherSettings,
    ...(businessType ? { businessType } : {})
  });

  return res.json({
    success: true,
    settings: updated,
    message: 'Settings saved successfully'
  });
});

export default router;
