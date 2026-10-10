import { Router, Request, Response } from 'express';
import { store } from '../store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  return res.json(store.getSettings());
});

router.put('/', (req: Request, res: Response) => {
  const updated = store.updateSettings(req.body);
  return res.json({
    success: true,
    settings: updated,
    message: 'Settings saved successfully'
  });
});

export default router;
