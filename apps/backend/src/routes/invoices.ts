import { Router, Response } from 'express';
import { store } from '../store';
import {
  authenticate,
  requireRole,
  AuthenticatedRequest
} from '../middleware/auth';

const router = Router();

// GET /api/invoices - ADMIN and STAFF
router.get('/', authenticate, requireRole('ADMIN', 'STAFF'), (req: AuthenticatedRequest, res: Response) => {
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

// GET /api/invoices/:id - ADMIN and STAFF
router.get('/:id', authenticate, requireRole('ADMIN', 'STAFF'), (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const invoice = store.getInvoice(id);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  return res.json(invoice);
});

// POS Checkout Handler - ADMIN and STAFF
const handleCheckout = (req: AuthenticatedRequest, res: Response) => {
  const {
    customerId,
    customerName,
    customerGstin,
    customerAddress,
    items,
    paymentMethod,
    discountPercent,
    taxPercent,
    isInterState,
    placeOfSupply
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items list is required for checkout' });
  }

  try {
    const result = store.checkout({
      customerId,
      customerName,
      customerGstin,
      customerAddress,
      items,
      paymentMethod: paymentMethod || 'CASH',
      discountPercent: discountPercent !== undefined ? Number(discountPercent) : 0,
      taxPercent: taxPercent !== undefined ? Number(taxPercent) : undefined,
      isInterState: Boolean(isInterState),
      placeOfSupply: placeOfSupply || undefined
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

router.post('/checkout', authenticate, requireRole('ADMIN', 'STAFF'), handleCheckout);
router.post('/', authenticate, requireRole('ADMIN', 'STAFF'), handleCheckout);

export default router;
