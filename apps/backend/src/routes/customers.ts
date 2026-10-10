import { Router, Request, Response } from 'express';
import { store } from '../store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
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

router.get('/:id', (req: Request, res: Response) => {
  const customer = store.getCustomer(req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  return res.json(customer);
});

router.post('/', (req: Request, res: Response) => {
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

router.put('/:id', (req: Request, res: Response) => {
  const updated = store.updateCustomer(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  return res.json(updated);
});

export default router;
