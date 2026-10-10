import { Router, Response } from 'express';
import { store } from '../store';
import {
  authenticate,
  requireRole,
  AuthenticatedRequest
} from '../middleware/auth';

const router = Router();

// GET /api/activities - ADMIN and STAFF
router.get('/', authenticate, requireRole('ADMIN', 'STAFF'), (req: AuthenticatedRequest, res: Response) => {
  const { type, limit } = req.query;
  let activities = store.getActivities();

  if (type && typeof type === 'string') {
    activities = activities.filter(a => a.type === type);
  }

  if (limit && !isNaN(Number(limit))) {
    activities = activities.slice(0, Number(limit));
  }

  return res.json(activities);
});

// POST /api/activities - ADMIN and STAFF
router.post('/', authenticate, requireRole('ADMIN', 'STAFF'), (req: AuthenticatedRequest, res: Response) => {
  const { title, description, type, time } = req.body;
  if (!title || !description || !type) {
    return res.status(400).json({ error: 'title, description, and type are required' });
  }

  const activity = store.addActivity({
    title,
    description,
    type,
    time
  });

  return res.status(201).json(activity);
});

export default router;
