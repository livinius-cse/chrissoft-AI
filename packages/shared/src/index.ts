export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface B2BOrganization extends BaseEntity {
  name: string;
}

export interface B2BUser extends BaseEntity {
  email: string;
  organizationId: string;
  roleId: string;
}

export interface B2BVendor extends BaseEntity {
  name: string;
  organizationId: string;
}

export interface B2BRFQ extends BaseEntity {
  title: string;
  description?: string;
  vendorId: string;
  status: 'DRAFT' | 'SENT' | 'CLOSED';
}

export interface B2BQuotation extends BaseEntity {
  rfqId: string;
  vendorId: string;
  price: number;
  status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
}

export interface B2BPurchaseOrder extends BaseEntity {
  quotationId: string;
  vendorId: string;
  totalAmount: number;
  status: 'CREATED' | 'SENT' | 'DELIVERED' | 'CANCELLED';
}
