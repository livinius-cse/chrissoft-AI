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
}

export interface InvoiceItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
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
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  organizationId: string;
  role: 'BUYER' | 'VENDOR' | 'ADMIN';
  permissions: string[];
  createdAt: string;
}
