import { Router, Request, Response } from 'express';
import { store } from '../store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
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

  return res.json(products);
});

router.get('/:id', (req: Request, res: Response) => {
  const product = store.getProduct(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json(product);
});

router.post('/', (req: Request, res: Response) => {
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

router.put('/:id', (req: Request, res: Response) => {
  const updated = store.updateProduct(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json(updated);
});

router.post('/:id/restock', (req: Request, res: Response) => {
  const qty = Number(req.body.quantity);
  if (isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'Valid restock quantity required' });
  }

  const updated = store.restockProduct(req.params.id, qty);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }

  return res.json({
    success: true,
    product: updated,
    message: `Restocked ${qty} units. New stock is ${updated.stock}.`
  });
});

router.delete('/:id', (req: Request, res: Response) => {
  const deleted = store.deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json({ success: true, message: 'Product deleted' });
});

export default router;
