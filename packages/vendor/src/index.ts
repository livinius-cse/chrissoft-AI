import { prisma } from '@equation-orchestra/database';
import { B2BVendor } from '@equation-orchestra/shared';

export class VendorService {
  async registerVendor(name: string, organizationId: string): Promise<B2BVendor> {
    const vendor = await prisma.vendor.create({
      data: {
        name,
        organizationId,
      },
    });
    return vendor as unknown as B2BVendor;
  }

  async getVendorById(id: string): Promise<B2BVendor | null> {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
    });
    return vendor as unknown as B2BVendor | null;
  }
}
