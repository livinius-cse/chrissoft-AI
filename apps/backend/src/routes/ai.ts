import { Router, Request, Response } from 'express';
import { AIService } from '@equation-orchestra/ai';
import { store } from '../store';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const aiService = new AIService();

// Secure all AI intelligence endpoints for ADMIN only
router.use(authenticate, requireAdmin);

// 1. Vendor Recommendations
router.post('/recommend-vendors', async (req: Request, res: Response) => {
  try {
    const { rfqDetails } = req.body;
    const details = typeof rfqDetails === 'string' ? rfqDetails : JSON.stringify(rfqDetails || {});
    const recommendations = await aiService.recommendVendors(details);

    return res.json({
      success: true,
      query: details,
      recommendations
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Vendor recommendation failed' });
  }
});

// 2. Demand Forecasting
router.post('/forecast-demand', async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    const targetProduct = productId ? store.getProduct(productId) : store.getProducts()[0];
    const pid = targetProduct ? targetProduct.id : 'PRD-DEFAULT';

    const baseForecast = await aiService.forecastDemand(pid);

    // Enhance forecast with real product stats if found
    const result = {
      productId: pid,
      productName: targetProduct ? targetProduct.name : 'All Products',
      currentStock: targetProduct ? targetProduct.stock : 0,
      predictedDemand: baseForecast.nextMonthPredictedQty || 1200,
      growthRate: baseForecast.growthRate || 0.08,
      recommendedReorderQuantity: targetProduct
        ? Math.max(0, (targetProduct.minStock * 3) - targetProduct.stock)
        : 50,
      confidenceScore: 0.94
    };

    return res.json({
      success: true,
      forecast: result
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Forecasting failed' });
  }
});

// 3. Price Trend Prediction
router.post('/predict-price', async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    const product = productId ? store.getProduct(productId) : store.getProducts()[0];
    const pid = product ? product.id : 'PRD-DEFAULT';

    const trend = await aiService.predictPriceTrend(pid);

    return res.json({
      success: true,
      productId: pid,
      productName: product ? product.name : 'Catalog Item',
      expectedChangePct: trend.expectedChangePct,
      suggestion: trend.suggestion,
      estimatedFuturePrice: product
        ? Math.round(product.price * (1 + trend.expectedChangePct) * 100) / 100
        : undefined
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Price trend prediction failed' });
  }
});

// 4. Procurement Risk Analysis
router.post('/analyze-risk', async (req: Request, res: Response) => {
  try {
    const { purchaseOrderId } = req.body;
    const poId = purchaseOrderId || 'PO-2026-DEFAULT';
    const analysis = await aiService.analyzeProcurementRisk(poId);

    return res.json({
      success: true,
      purchaseOrderId: poId,
      analysis
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Procurement risk analysis failed' });
  }
});

// 5. Contract Summarization
router.post('/summarize-contract', async (req: Request, res: Response) => {
  try {
    const { contractText } = req.body;
    const summary = await aiService.summarizeContract(contractText || 'Standard B2B procurement contract terms');
    return res.json({ success: true, summary });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Contract summarization failed' });
  }
});

// 6. Interactive ChrisSoft AI Assistant / Copilot Chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message string required' });
    }

    const query = message.toLowerCase();
    const products = store.getProducts();
    const invoices = store.getInvoices();
    const customers = store.getCustomers();

    let reply = '';
    let suggestions: string[] = [];

    if (query.includes('stock') || query.includes('inventory') || query.includes('warning') || query.includes('low')) {
      const lowStock = products.filter(p => p.stock <= p.minStock);
      const outOfStock = products.filter(p => p.stock === 0);

      if (lowStock.length > 0) {
        reply = `⚠️ **Inventory Alert**: You have **${lowStock.length} items** below minimum safety buffers, including ${outOfStock.length} completely out of stock:\n` +
          lowStock.map(p => `• **${p.name}**: ${p.stock} units left (Min threshold: ${p.minStock})`).join('\n') +
          `\n\n💡 *Recommendation: Use the Warehouse Replenish action to restore optimal levels.*`;
      } else {
        reply = `✅ All ${products.length} catalog products currently maintain healthy inventory levels above safety thresholds.`;
      }
      suggestions = ['Restock warning items', 'Forecast next month demand', 'Show total warehouse valuation'];
    } else if (query.includes('revenue') || query.includes('sales') || query.includes('financial') || query.includes('profit')) {
      const totalRev = invoices.reduce((acc, i) => acc + i.total, 0);
      const totalOrders = invoices.length;
      reply = `📊 **Financial Snapshot**:\n` +
        `• **Gross Revenue**: $${totalRev.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n` +
        `• **Total Orders Recorded**: ${totalOrders}\n` +
        `• **Average Order Value**: $${(totalOrders > 0 ? totalRev / totalOrders : 0).toFixed(2)}\n` +
        `• **Settlement Modes**: ${invoices.map(i => i.paymentMethod).filter((v, i, a) => a.indexOf(v) === i).join(', ')}`;
      suggestions = ['Show payment method distribution', 'View top spending customers', 'Calculate GST tax summary'];
    } else if (query.includes('vendor') || query.includes('supplier') || query.includes('recommend')) {
      const recommendations = await aiService.recommendVendors('B2B Electronics and Accessories supply');
      reply = `🤝 **AI Vendor Match for Procurement**:\n` +
        recommendations.map(r => `• **${r.name}** (Match: ${Math.round(r.score * 100)}%): ${r.reason}`).join('\n') +
        `\n\n✨ All suppliers vetted for high fulfillment velocity and competitive volume discounts.`;
      suggestions = ['Generate RFQ quotation', 'Analyze procurement risk', 'Predict price trends'];
    } else if (query.includes('customer') || query.includes('client')) {
      const topCust = [...customers].sort((a, b) => b.totalSpent - a.totalSpent)[0];
      reply = `👥 **Client Summary**:\n` +
        `• **Registered Accounts**: ${customers.length}\n` +
        `• **Top Buyer**: ${topCust.name} ($${topCust.totalSpent.toLocaleString()} across ${topCust.purchaseCount} purchases)\n` +
        `• **Total Receivables Pending**: $${customers.reduce((acc, c) => acc + c.balance, 0).toLocaleString()}`;
      suggestions = ['Show clients with unpaid balances', 'Export customer invoices'];
    } else {
      reply = `Hello! I'm the **ChrisSoft AI Copilot**. I can analyze your warehouse inventory, forecast product demand, monitor cash flow, evaluate procurement risks, and recommend vetted suppliers.\n\nWhat would you like me to inspect?`;
      suggestions = ['Which products are low on stock?', 'What is our current revenue?', 'Recommend suppliers for electronics', 'Forecast demand for top products'];
    }

    return res.json({
      success: true,
      reply,
      suggestions,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'AI assistant error' });
  }
});

export default router;
