import { prisma } from '@equation-orchestra/database';
import { B2BRFQ } from '@equation-orchestra/shared';

export class RFQService {
  async getRFQById(id: string): Promise<B2BRFQ | null> {
    const rfq = await prisma.rFQ.findUnique({
      where: { id },
    });
    return rfq as unknown as B2BRFQ | null;
  }

  async updateRFQStatus(id: string, status: 'DRAFT' | 'SENT' | 'CLOSED'): Promise<B2BRFQ> {
    const rfq = await prisma.rFQ.update({
      where: { id },
      data: { status },
    });
    return rfq as unknown as B2BRFQ;
  }
}
