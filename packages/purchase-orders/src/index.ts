import { prisma } from '@equation-orchestra/database';
import { B2BPurchaseOrder } from '@equation-orchestra/shared';

export class PurchaseOrderService {
  async getPurchaseOrderById(id: string): Promise<B2BPurchaseOrder | null> {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
    });
    return po as unknown as B2BPurchaseOrder | null;
  }

  async updatePurchaseOrderStatus(id: string, status: 'CREATED' | 'SENT' | 'DELIVERED' | 'CANCELLED'): Promise<B2BPurchaseOrder> {
    const po = await prisma.purchaseOrder.update({
      where: { id },
      data: { status },
    });
    return po as unknown as B2BPurchaseOrder;
  }
}
