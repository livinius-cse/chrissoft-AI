import { Router, Response } from 'express';
import { store } from '../store';
import {
  authenticate,
  requireRole,
  requireAdmin,
  AuthenticatedRequest
} from '../middleware/auth';

const router = Router();

// GET /api/customers - ADMIN and STAFF
router.get('/', authenticate, requireRole('ADMIN', 'STAFF'), (req: AuthenticatedRequest, res: Response) => {
  const { search } = req.query;
  let customers = store.getCustomers();

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    customers = customers.filter(c =>
      c.name.toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s) ||
      c.phone.includes(s)
    );
  }

  return res.json(customers);
});

// GET /api/customers/:id - ADMIN and STAFF
router.get('/:id', authenticate, requireRole('ADMIN', 'STAFF'), (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const customer = store.getCustomer(id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  return res.json(customer);
});

// POST /api/customers - ADMIN and STAFF (Cashier customer registration during checkout)
router.post('/', authenticate, requireRole('ADMIN', 'STAFF'), (req: AuthenticatedRequest, res: Response) => {
  const { name, email, phone, address, avatarColor } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const newCustomer = store.addCustomer({
    name,
    email,
    phone: phone || '',
    address: address || '',
    avatarColor
  });

  return res.status(201).json(newCustomer);
});

// PUT /api/customers/:id - ADMIN ONLY
router.put('/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const updated = store.updateCustomer(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  return res.json(updated);
});

export default router;
