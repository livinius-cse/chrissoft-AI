export type BusinessType =
  | 'RETAIL'
  | 'GROCERY'
  | 'PHARMACY'
  | 'ELECTRONICS'
  | 'FASHION'
  | 'HARDWARE'
  | 'WHOLESALE';

export interface ProductVariant {
  sku: string;
  size: string;
  color: string;
  stock: number;
  price?: number;
}

export interface TieredPrice {
  minQty: number;
  unitPrice: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  balance: number;
  purchaseCount: number;
  totalSpent: number;
  avatarColor: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  barcode: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
  image: string;
  status: 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK';

  // Optional Industry Specific Fields (Phase 4 Presets)
  // Retail
  mrp?: number;
  brand?: string;

  // Grocery / FMCG
  batchNumber?: string;
  expiryDate?: string;
  unitOfMeasure?: string;
  isPerishable?: boolean;

  // Medical / Pharmacy
  composition?: string;
  dosageForm?: string;
  requiresPrescription?: boolean;

  // Electronics
  model?: string;
  warrantyMonths?: number;
  serialNumbers?: string[];

  // Fashion / Apparel
  size?: string;
  color?: string;
  material?: string;
  variants?: ProductVariant[];

  // Hardware / Industrial
  grade?: string;
  gauge?: string;
  technicalSpecs?: string;

  // Wholesale / Distribution
  minOrderQty?: number;
  cartonQty?: number;
  tieredPricing?: TieredPrice[];
}

export interface InvoiceItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  batchNumber?: string;
  serialNumber?: string;
  unitOfMeasure?: string;
  hsnCode?: string;
  taxRate?: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  customerGstin?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  discountPercent?: number;
  taxableAmount?: number;
  taxRate?: number;
  tax: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  isInterState?: boolean;
  total: number;
  amountInWords?: string;
  placeOfSupply?: string;
  gstin?: string;
  paymentMethod: 'CASH' | 'CARD' | 'UPI';
  paymentStatus: 'PAID' | 'DRAFT' | 'UNPAID';
  createdAt: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'sale' | 'purchase' | 'stock' | 'customer';
}

export interface Settings {
  businessName: string;
  businessEmail: string;
  phone: string;
  address: string;
  website: string;
  taxRate: number;
  currency: string;
  receiptFooter: string;
  businessType: BusinessType;
  gstin?: string;
  pan?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  organizationId: string;
  role: 'BUYER' | 'VENDOR' | 'ADMIN' | 'STAFF';
  permissions: string[];
  createdAt: string;
}
