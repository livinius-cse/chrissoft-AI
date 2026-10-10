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
import { ProductVariant, TieredPrice } from '../types';

const router = Router();

/**
 * Validates industry-specific optional fields.
 * Returns null if valid, or an error string if invalid.
 */
function validateIndustryFields(body: any): string | null {
  // 1. Expiry Date validation
  if (body.expiryDate !== undefined && body.expiryDate !== null && body.expiryDate !== '') {
    if (typeof body.expiryDate !== 'string' || isNaN(Date.parse(body.expiryDate))) {
      return 'Invalid expiryDate format. Must be a valid date string (e.g. YYYY-MM-DD).';
    }
  }

  // 2. Warranty validation (months)
  if (body.warrantyMonths !== undefined && body.warrantyMonths !== null && body.warrantyMonths !== '') {
    const w = Number(body.warrantyMonths);
    if (isNaN(w) || w < 0) {
      return 'warrantyMonths must be a non-negative number.';
    }
  }

  // 3. Wholesale validations (MOQ & Carton Qty)
  if (body.minOrderQty !== undefined && body.minOrderQty !== null && body.minOrderQty !== '') {
    const moq = Number(body.minOrderQty);
    if (isNaN(moq) || moq < 0) {
      return 'minOrderQty must be a non-negative number.';
    }
  }

  if (body.cartonQty !== undefined && body.cartonQty !== null && body.cartonQty !== '') {
    const cq = Number(body.cartonQty);
    if (isNaN(cq) || cq < 0) {
      return 'cartonQty must be a non-negative number.';
    }
  }

  // 4. Retail MRP validation
  if (body.mrp !== undefined && body.mrp !== null && body.mrp !== '') {
    const mrp = Number(body.mrp);
    if (isNaN(mrp) || mrp < 0) {
      return 'mrp must be a non-negative number.';
    }
  }

  // 5. Tiered pricing validation
  if (body.tieredPricing !== undefined && body.tieredPricing !== null) {
    if (!Array.isArray(body.tieredPricing)) {
      return 'tieredPricing must be an array of { minQty, unitPrice }.';
    }
    for (let i = 0; i < body.tieredPricing.length; i++) {
      const tier: TieredPrice = body.tieredPricing[i];
      if (typeof tier.minQty !== 'number' || tier.minQty <= 0 || isNaN(tier.minQty)) {
        return `Tiered pricing entry #${i + 1} has an invalid minQty (must be > 0).`;
      }
      if (typeof tier.unitPrice !== 'number' || tier.unitPrice < 0 || isNaN(tier.unitPrice)) {
        return `Tiered pricing entry #${i + 1} has an invalid unitPrice (must be >= 0).`;
      }
    }
  }

  // 6. Variants validation
  if (body.variants !== undefined && body.variants !== null) {
    if (!Array.isArray(body.variants)) {
      return 'variants must be an array of { sku, size, color, stock, price? }.';
    }
    for (let i = 0; i < body.variants.length; i++) {
      const v: ProductVariant = body.variants[i];
      if (!v.sku || typeof v.sku !== 'string' || v.sku.trim() === '') {
        return `Variant #${i + 1} is missing a required SKU.`;
      }
      if (typeof v.stock !== 'number' || v.stock < 0 || isNaN(v.stock)) {
        return `Variant #${i + 1} (${v.sku}) has an invalid stock (must be >= 0).`;
      }
      if (v.price !== undefined && (typeof v.price !== 'number' || v.price < 0 || isNaN(v.price))) {
        return `Variant #${i + 1} (${v.sku}) has an invalid price (must be >= 0).`;
      }
    }
  }

  // 7. Serial numbers validation
  if (body.serialNumbers !== undefined && body.serialNumbers !== null) {
    if (!Array.isArray(body.serialNumbers)) {
      return 'serialNumbers must be an array of string identifiers.';
    }
    for (let i = 0; i < body.serialNumbers.length; i++) {
      if (typeof body.serialNumbers[i] !== 'string') {
        return `serialNumbers entry #${i + 1} must be a string.`;
      }
    }
  }

  return null;
}

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
      p.barcode.includes(s) ||
      (p.brand && p.brand.toLowerCase().includes(s)) ||
      (p.batchNumber && p.batchNumber.toLowerCase().includes(s)) ||
      (p.composition && p.composition.toLowerCase().includes(s))
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
  const {
    name,
    sku,
    barcode,
    price,
    cost,
    stock,
    minStock,
    category,
    image,
    status,
    // Industry fields
    mrp,
    brand,
    batchNumber,
    expiryDate,
    unitOfMeasure,
    isPerishable,
    composition,
    dosageForm,
    requiresPrescription,
    model,
    warrantyMonths,
    serialNumbers,
    size,
    color,
    material,
    variants,
    grade,
    gauge,
    technicalSpecs,
    minOrderQty,
    cartonQty,
    tieredPricing
  } = req.body;

  if (!name || !sku || !barcode || price === undefined || cost === undefined) {
    return res.status(400).json({ error: 'Missing required product attributes (name, sku, barcode, price, cost)' });
  }

  if (Number(price) < 0 || Number(cost) < 0) {
    return res.status(400).json({ error: 'Price and cost must be non-negative numbers.' });
  }

  const validationError = validateIndustryFields(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const newProduct = store.addProduct({
    name,
    sku: String(sku).toUpperCase(),
    barcode,
    price: Number(price),
    cost: Number(cost),
    stock: stock !== undefined ? Math.max(0, Number(stock)) : 10,
    minStock: minStock !== undefined ? Math.max(0, Number(minStock)) : 5,
    category: category || 'General',
    image: image || '📦',
    status,
    // Industry optional fields
    ...(mrp !== undefined && mrp !== null && mrp !== '' ? { mrp: Number(mrp) } : {}),
    ...(brand ? { brand: String(brand).trim() } : {}),
    ...(batchNumber ? { batchNumber: String(batchNumber).trim() } : {}),
    ...(expiryDate ? { expiryDate: String(expiryDate).trim() } : {}),
    ...(unitOfMeasure ? { unitOfMeasure: String(unitOfMeasure).trim() } : {}),
    ...(isPerishable !== undefined ? { isPerishable: Boolean(isPerishable) } : {}),
    ...(composition ? { composition: String(composition).trim() } : {}),
    ...(dosageForm ? { dosageForm: String(dosageForm).trim() } : {}),
    ...(requiresPrescription !== undefined ? { requiresPrescription: Boolean(requiresPrescription) } : {}),
    ...(model ? { model: String(model).trim() } : {}),
    ...(warrantyMonths !== undefined && warrantyMonths !== null && warrantyMonths !== '' ? { warrantyMonths: Number(warrantyMonths) } : {}),
    ...(Array.isArray(serialNumbers) ? { serialNumbers } : {}),
    ...(size ? { size: String(size).trim() } : {}),
    ...(color ? { color: String(color).trim() } : {}),
    ...(material ? { material: String(material).trim() } : {}),
    ...(Array.isArray(variants) ? { variants } : {}),
    ...(grade ? { grade: String(grade).trim() } : {}),
    ...(gauge ? { gauge: String(gauge).trim() } : {}),
    ...(technicalSpecs ? { technicalSpecs: String(technicalSpecs).trim() } : {}),
    ...(minOrderQty !== undefined && minOrderQty !== null && minOrderQty !== '' ? { minOrderQty: Number(minOrderQty) } : {}),
    ...(cartonQty !== undefined && cartonQty !== null && cartonQty !== '' ? { cartonQty: Number(cartonQty) } : {}),
    ...(Array.isArray(tieredPricing) ? { tieredPricing } : {})
  });

  return res.status(201).json(newProduct);
});

// PUT /api/products/:id - ADMIN ONLY
router.put('/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);

  if (req.body.price !== undefined && Number(req.body.price) < 0) {
    return res.status(400).json({ error: 'Price must be a non-negative number.' });
  }
  if (req.body.cost !== undefined && Number(req.body.cost) < 0) {
    return res.status(400).json({ error: 'Cost must be a non-negative number.' });
  }

  const validationError = validateIndustryFields(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

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
