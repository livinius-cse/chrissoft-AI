import { prisma } from '@equation-orchestra/database';

export class AnalyticsService {
  async getSpendSummary(organizationId: string) {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        vendor: {
          organizationId,
        },
      },
    });

    const totalSpend = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
    return {
      organizationId,
      totalSpend,
      purchaseOrderCount: purchaseOrders.length,
    };
  }

  async getVendorPerformance(vendorId: string) {
    // Mock performance computation
    return {
      vendorId,
      deliveryTimeScore: 0.94,
      qualityScore: 0.96,
      averageFulfillmentDays: 4.2,
    };
  }
}
