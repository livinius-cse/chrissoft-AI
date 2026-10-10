import { prisma } from '@equation-orchestra/database';
import { B2BQuotation } from '@equation-orchestra/shared';

export class QuotationService {
  async submitQuotation(rfqId: string, vendorId: string, price: number): Promise<B2BQuotation> {
    const quote = await prisma.quotation.create({
      data: {
        rfqId,
        vendorId,
        price,
        status: 'SUBMITTED',
      },
    });
    return quote as unknown as B2BQuotation;
  }

  async updateQuotationStatus(id: string, status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED'): Promise<B2BQuotation> {
    const quote = await prisma.quotation.update({
      where: { id },
      data: { status },
    });
    return quote as unknown as B2BQuotation;
  }
}
