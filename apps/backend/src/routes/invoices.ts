import { Router, Request, Response } from 'express';
import { store } from '../store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { customerId, status } = req.query;
  let invoices = store.getInvoices();

  if (customerId && typeof customerId === 'string') {
    invoices = invoices.filter(i => i.customerId === customerId);
  }

  if (status && typeof status === 'string' && status !== 'ALL') {
    invoices = invoices.filter(i => i.paymentStatus === status);
  }

  return res.json(invoices);
});

router.get('/:id', (req: Request, res: Response) => {
  const invoice = store.getInvoice(req.params.id);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  return res.json(invoice);
});

const handleCheckout = (req: Request, res: Response) => {
  const { customerId, customerName, items, paymentMethod, discountPercent, taxPercent } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items list is required for checkout' });
  }

  try {
    const result = store.checkout({
      customerId,
      customerName,
      items,
      paymentMethod: paymentMethod || 'CASH',
      discountPercent: Number(discountPercent) || 0,
      taxPercent: Number(taxPercent) || 18
    });

    return res.status(201).json({
      success: true,
      invoice: result.invoice,
      updatedProducts: result.updatedProducts,
      customer: result.customer
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Checkout failed' });
  }
};

router.post('/checkout', handleCheckout);
router.post('/', handleCheckout);

export default router;
