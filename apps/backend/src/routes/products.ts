import { Router, Response } from 'express';
import { store } from '../store';
import {
  authenticate,
  requireRole,
  requireAdmin,
  AuthenticatedRequest,
  sanitizeProductsForRole,
  sanitizeProductForRole
} from '../middleware/auth';

const router = Router();

// GET /api/products - Both ADMIN and STAFF (cost scrubbed for staff)
router.get('/', authenticate, requireRole('ADMIN', 'STAFF'), (req: AuthenticatedRequest, res: Response) => {
  const { category, search } = req.query;
  let products = store.getProducts();

  if (category && typeof category === 'string' && category !== 'All') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.sku.toLowerCase().includes(s) ||
      p.barcode.includes(s)
    );
  }

  const sanitized = sanitizeProductsForRole(products, req.user?.role);
  return res.json(sanitized);
});

// GET /api/products/:id - Both ADMIN and STAFF (cost scrubbed for staff)
router.get('/:id', authenticate, requireRole('ADMIN', 'STAFF'), (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const product = store.getProduct(id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const sanitized = sanitizeProductForRole(product, req.user?.role);
  return res.json(sanitized);
});

// POST /api/products - ADMIN ONLY
router.post('/', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { name, sku, barcode, price, cost, stock, minStock, category, image, status } = req.body;

  if (!name || !sku || !barcode || price === undefined || cost === undefined) {
    return res.status(400).json({ error: 'Missing required product attributes (name, sku, barcode, price, cost)' });
  }

  const newProduct = store.addProduct({
    name,
    sku: String(sku).toUpperCase(),
    barcode,
    price: Number(price),
    cost: Number(cost),
    stock: stock !== undefined ? Number(stock) : 10,
    minStock: minStock !== undefined ? Number(minStock) : 5,
    category: category || 'General',
    image: image || '📦',
    status
  });

  return res.status(201).json(newProduct);
});

// PUT /api/products/:id - ADMIN ONLY
router.put('/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const updated = store.updateProduct(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json(updated);
});

// POST /api/products/:id/restock - ADMIN ONLY
router.post('/:id/restock', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const qty = Number(req.body.quantity);
  if (isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'Valid restock quantity required' });
  }

  const updated = store.restockProduct(id, qty);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }

  return res.json({
    success: true,
    product: updated,
    message: `Restocked ${qty} units. New stock is ${updated.stock}.`
  });
});

// DELETE /api/products/:id - ADMIN ONLY
router.delete('/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const deleted = store.deleteProduct(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json({ success: true, message: 'Product deleted' });
});

export default router;
