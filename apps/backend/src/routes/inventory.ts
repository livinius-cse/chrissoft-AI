import { Router, Response } from 'express';
import { store } from '../store';
import {
  authenticate,
  requireRole,
  requireAdmin,
  AuthenticatedRequest
} from '../middleware/auth';

const router = Router();

// GET /api/inventory/summary - ADMIN & STAFF (cost & margins scrubbed for staff)
router.get('/summary', authenticate, requireRole('ADMIN', 'STAFF'), (req: AuthenticatedRequest, res: Response) => {
  const products = store.getProducts();

  const totalSkuCount = products.length;
  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);
  const totalCostValuation = products.reduce((acc, p) => acc + (p.cost * p.stock), 0);
  const totalRetailValuation = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const potentialMargin = totalRetailValuation - totalCostValuation;

  const dangerCount = products.filter(p => p.stock === 0).length;
  const warningCount = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const healthyCount = products.filter(p => p.stock > p.minStock).length;

  const health = {
    dangerCount,
    warningCount,
    healthyCount
  };

  if (req.user?.role === 'STAFF') {
    // Redact confidential cost valuation and margins for staff
    return res.json({
      totalSkuCount,
      totalStockCount,
      totalRetailValuation,
      health
    });
  }

  return res.json({
    totalSkuCount,
    totalStockCount,
    totalCostValuation,
    totalRetailValuation,
    potentialMargin,
    health
  });
});

// POST /api/inventory/restock-alerts - ADMIN ONLY
router.post('/restock-alerts', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const products = store.getProducts();
  const lowStockItems = products.filter(p => p.stock <= p.minStock);

  const restocked = lowStockItems.map(p => {
    const qtyToAdd = Math.max(10, p.minStock * 2);
    return store.restockProduct(p.id, qtyToAdd);
  }).filter(Boolean);

  return res.json({
    success: true,
    message: `Restocked ${restocked.length} warning items by safety standard.`,
    restockedProducts: restocked
  });
});

export default router;
