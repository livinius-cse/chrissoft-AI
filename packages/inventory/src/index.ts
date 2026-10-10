import { prisma } from '@equation-orchestra/database';

export class InventoryService {
  async getStockLevel(productId: string, warehouseId: string): Promise<number> {
    const item = await prisma.inventory.findFirst({
      where: { productId, warehouseId },
    });
    return item ? item.quantity : 0;
  }

  async updateStockLevel(productId: string, warehouseId: string, quantity: number): Promise<void> {
    const item = await prisma.inventory.findFirst({
      where: { productId, warehouseId },
    });

    if (item) {
      await prisma.inventory.update({
        where: { id: item.id },
        data: { quantity },
      });
    } else {
      await prisma.inventory.create({
        data: {
          productId,
          warehouseId,
          quantity,
        },
      });
    }
  }
}
