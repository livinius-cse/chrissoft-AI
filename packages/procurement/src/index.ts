import { prisma } from '@equation-orchestra/database';
import { B2BRFQ, B2BPurchaseOrder } from '@equation-orchestra/shared';

export class ProcurementService {
  async createRFQ(title: string, vendorId: string, description?: string): Promise<B2BRFQ> {
    const rfq = await prisma.rFQ.create({
      data: {
        title,
        vendorId,
        description,
        status: 'DRAFT',
      },
    });
    return rfq as unknown as B2BRFQ;
  }

  async createPurchaseOrder(quotationId: string, vendorId: string, totalAmount: number): Promise<B2BPurchaseOrder> {
    const po = await prisma.purchaseOrder.create({
      data: {
        quotationId,
        vendorId,
        totalAmount,
        status: 'CREATED',
      },
    });
    return po as unknown as B2BPurchaseOrder;
  }
}
