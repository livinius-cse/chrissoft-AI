import fs from 'fs';
import path from 'path';
import { Customer, Product, Invoice, Activity, Settings, User, InvoiceItem } from './types';
import { calculateGSTBreakdown, numberToIndianWords, formatINR } from './utils/currency';

const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const initialCustomers: Customer[] = [
  { id: 'c-1', name: 'Alexander Wright', email: 'alex@wrightcorp.com', phone: '+1 (555) 0192', address: '499 Broadway, New York, NY 10012', balance: 0, purchaseCount: 14, totalSpent: 4850, avatarColor: 'from-pink-500 to-rose-500', createdAt: '2026-01-15T10:00:00Z' },
  { id: 'c-2', name: 'Sophia Chen', email: 'sophia.c@nexusdesign.io', phone: '+1 (555) 0432', address: '55 Spear St, San Francisco, CA 94105', balance: 840, purchaseCount: 8, totalSpent: 2980, avatarColor: 'from-purple-500 to-indigo-500', createdAt: '2026-02-10T14:30:00Z' },
  { id: 'c-3', name: 'Marcus Miller', email: 'marcus@millerlogistics.net', phone: '+1 (555) 0881', address: '1201 W Adams St, Chicago, IL 60607', balance: 0, purchaseCount: 22, totalSpent: 12450, avatarColor: 'from-blue-500 to-cyan-500', createdAt: '2025-11-20T09:15:00Z' },
  { id: 'c-4', name: 'Elena Rostova', email: 'elena@rostovbuilders.com', phone: '+1 (555) 0772', address: '782 Skyline Blvd, Austin, TX 78746', balance: 1250, purchaseCount: 5, totalSpent: 3000, avatarColor: 'from-emerald-500 to-teal-500', createdAt: '2026-03-01T11:45:00Z' },
  { id: 'c-5', name: 'Devon Carter', email: 'devon@cartergrowth.co', phone: '+1 (555) 0341', address: '220 N Green St, Denver, CO 80202', balance: 0, purchaseCount: 3, totalSpent: 920, avatarColor: 'from-amber-500 to-orange-500', createdAt: '2026-04-12T16:20:00Z' }
];

const initialProducts: Product[] = [
  { id: 'p-1', sku: 'PRD-IP15P', name: 'iPhone 15 Pro Max (256GB - Titanium)', barcode: '190199092837', price: 1199, cost: 780, stock: 45, minStock: 10, category: 'Electronics', image: '📱', status: 'ACTIVE' },
  { id: 'p-2', sku: 'PRD-M3MAC', name: 'MacBook Pro 14 M3 Max (36GB / 1TB)', barcode: '190199081223', price: 3199, cost: 2150, stock: 12, minStock: 5, category: 'Electronics', image: '💻', status: 'ACTIVE' },
  { id: 'p-3', sku: 'PRD-APRPM', name: 'AirPods Max (Space Gray Premium)', barcode: '190199042318', price: 549, cost: 360, stock: 4, minStock: 8, category: 'Audio', image: '🎧', status: 'ACTIVE' },
  { id: 'p-4', sku: 'PRD-LOGMX', name: 'Logitech MX Master 3S Mouse', barcode: '097855172283', price: 99, cost: 52, stock: 78, minStock: 15, category: 'Accessories', image: '🖱️', status: 'ACTIVE' },
  { id: 'p-5', sku: 'PRD-APPW9', name: 'Apple Watch Series 9 (45mm GPS)', barcode: '190199098319', price: 429, cost: 280, stock: 18, minStock: 6, category: 'Electronics', image: '⌚', status: 'ACTIVE' },
  { id: 'p-6', sku: 'PRD-SNDX4', name: 'Sony WH-1000XM4 Noise Cancelling', barcode: '027242919373', price: 348, cost: 210, stock: 0, minStock: 5, category: 'Audio', image: '🎧', status: 'OUT_OF_STOCK' },
  { id: 'p-7', sku: 'PRD-KCHM2', name: 'Keychron Q2 QMK Mechanical Keyboard', barcode: '075482312019', price: 189, cost: 110, stock: 3, minStock: 5, category: 'Accessories', image: '⌨️', status: 'ACTIVE' }
];

const initialInvoices: Invoice[] = [
  { id: 'inv-1', invoiceNo: 'INV-2026-001', customerId: 'c-3', customerName: 'Marcus Miller', items: [{ productId: 'p-2', name: 'MacBook Pro 14 M3 Max', price: 3199, quantity: 2 }, { productId: 'p-4', name: 'Logitech MX Master 3S Mouse', price: 99, quantity: 2 }], subtotal: 6596, discount: 200, tax: 1151.28, total: 7547.28, paymentMethod: 'CARD', paymentStatus: 'PAID', createdAt: '2026-07-28T14:24:00Z' },
  { id: 'inv-2', invoiceNo: 'INV-2026-002', customerId: 'c-1', customerName: 'Alexander Wright', items: [{ productId: 'p-1', name: 'iPhone 15 Pro Max', price: 1199, quantity: 1 }, { productId: 'p-5', name: 'Apple Watch Series 9', price: 429, quantity: 1 }], subtotal: 1628, discount: 0, tax: 293.04, total: 1921.04, paymentMethod: 'UPI', paymentStatus: 'PAID', createdAt: '2026-07-29T10:45:00Z' },
  { id: 'inv-3', invoiceNo: 'INV-2026-003', customerId: 'c-2', customerName: 'Sophia Chen', items: [{ productId: 'p-3', name: 'AirPods Max', price: 549, quantity: 1 }], subtotal: 549, discount: 50, tax: 89.82, total: 588.82, paymentMethod: 'CASH', paymentStatus: 'PAID', createdAt: '2026-07-30T09:30:00Z' }
];

const initialActivities: Activity[] = [
  { id: 'act-1', title: 'Invoice Generated', description: 'Generated invoice INV-2026-003 for Sophia Chen.', time: '2 hours ago', type: 'sale' },
  { id: 'act-2', title: 'Low Stock Alert', description: 'AirPods Max stock level is low (4 remaining).', time: '4 hours ago', type: 'stock' },
  { id: 'act-3', title: 'New Product Registered', description: 'Added Keychron Q2 Mechanical Keyboard under Accessories.', time: 'Yesterday', type: 'stock' },
  { id: 'act-4', title: 'Payment Received', description: 'Received online UPI payment of $1,921.04 from Alexander Wright.', time: 'Yesterday', type: 'sale' },
  { id: 'act-5', title: 'OutOfStock Warning', description: 'Sony WH-1000XM4 headphones are completely sold out.', time: '2 days ago', type: 'stock' }
];

const initialSettings: Settings = {
  businessName: 'ChrisSoft AI Enterprise',
  businessEmail: 'contact@chrissoft.ai',
  phone: '+1 (555) 0100',
  address: '499 Commerce Park, Suite 200, New York, NY 10012',
  website: 'https://chrissoft.ai',
  taxRate: 18,
  currency: 'INR',
  receiptFooter: 'Thank you for choosing ChrisSoft AI Enterprise Platform.',
  businessType: 'ELECTRONICS'
};

const initialUsers: User[] = [
  {
    id: 'u-1',
    name: 'Alexander Wright',
    email: 'alex@wrightcorp.com',
    passwordHash: 'password', // Demo password
    organizationId: 'org-1',
    role: 'ADMIN',
    permissions: ['all'],
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'u-2',
    name: 'Admin User',
    email: 'admin@chrissoft.com',
    passwordHash: 'password123',
    organizationId: 'org-1',
    role: 'ADMIN',
    permissions: ['all'],
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'u-3',
    name: 'Rohan Sharma (Cashier)',
    email: 'staff@chrissoft.com',
    passwordHash: 'staff123',
    organizationId: 'org-1',
    role: 'STAFF',
    permissions: ['pos', 'checkout', 'products:read', 'customers:read', 'customers:create'],
    createdAt: '2026-01-01T00:00:00Z'
  }
];

interface StoreData {
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
  activities: Activity[];
  settings: Settings;
  users: User[];
}

class Store {
  private data: StoreData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): StoreData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed: StoreData = JSON.parse(raw);
        // Ensure settings has businessType fallback
        if (parsed.settings && !parsed.settings.businessType) {
          parsed.settings.businessType = 'ELECTRONICS';
        }
        // Ensure default staff user exists for testing/evaluation without breaking existing users
        if (parsed.users && !parsed.users.some(u => u.email === 'staff@chrissoft.com')) {
          const staffUser = initialUsers.find(u => u.email === 'staff@chrissoft.com');
          if (staffUser) {
            parsed.users.push(staffUser);
            this.saveData(parsed);
          }
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to read persisted store. Using defaults.', e);
    }

    const defaultData: StoreData = {
      customers: initialCustomers,
      products: initialProducts,
      invoices: initialInvoices,
      activities: initialActivities,
      settings: initialSettings,
      users: initialUsers
    };
    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: StoreData = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist store:', e);
    }
  }

  // Customers
  getCustomers(): Customer[] {
    return this.data.customers;
  }

  getCustomer(id: string): Customer | undefined {
    return this.data.customers.find(c => c.id === id);
  }

  addCustomer(c: Omit<Customer, 'id' | 'balance' | 'purchaseCount' | 'totalSpent' | 'createdAt'> & { avatarColor?: string }): Customer {
    const avatarColors = [
      'from-purple-500 to-indigo-500',
      'from-pink-500 to-rose-500',
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-teal-500',
      'from-amber-500 to-orange-500'
    ];
    const newCustomer: Customer = {
      ...c,
      id: `c-${Date.now()}`,
      balance: 0,
      purchaseCount: 0,
      totalSpent: 0,
      avatarColor: c.avatarColor || avatarColors[Math.floor(Math.random() * avatarColors.length)],
      createdAt: new Date().toISOString()
    };
    this.data.customers.unshift(newCustomer);
    this.addActivity({
      title: 'New Customer Registered',
      description: `Added client ${c.name} (${c.email}) to accounts.`,
      type: 'customer'
    });
    this.saveData();
    return newCustomer;
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | undefined {
    const index = this.data.customers.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.data.customers[index] = { ...this.data.customers[index], ...updates };
    this.saveData();
    return this.data.customers[index];
  }

  // Products
  getProducts(): Product[] {
    return this.data.products;
  }

  getProduct(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  addProduct(p: Omit<Product, 'id' | 'status'> & { status?: Product['status'] }): Product {
    const newProduct: Product = {
      ...p,
      id: `p-${Date.now()}`,
      status: p.status || (p.stock === 0 ? 'OUT_OF_STOCK' : 'ACTIVE')
    };
    this.data.products.unshift(newProduct);
    this.addActivity({
      title: 'New Product Registered',
      description: `Added "${p.name}" to inventory catalogue.`,
      type: 'stock'
    });
    this.saveData();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    const current = this.data.products[index];
    const nextStock = updates.stock !== undefined ? updates.stock : current.stock;
    const nextStatus = updates.status !== undefined ? updates.status : (nextStock === 0 ? 'OUT_OF_STOCK' : 'ACTIVE');
    this.data.products[index] = {
      ...current,
      ...updates,
      stock: nextStock,
      status: nextStatus
    };
    this.saveData();
    return this.data.products[index];
  }

  restockProduct(id: string, qty: number): Product | undefined {
    const product = this.getProduct(id);
    if (!product) return undefined;
    const nextStock = product.stock + qty;
    const updated = this.updateProduct(id, {
      stock: nextStock,
      status: nextStock > 0 ? 'ACTIVE' : product.status
    });
    this.addActivity({
      title: 'Inventory Restocked',
      description: `Restocked ${qty} units of ${product.name}.`,
      type: 'stock'
    });
    this.saveData();
    return updated;
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Invoices & POS Checkout
  getInvoices(): Invoice[] {
    return this.data.invoices;
  }

  getInvoice(id: string): Invoice | undefined {
    return this.data.invoices.find(i => i.id === id);
  }

  checkout(params: {
    customerId?: string;
    customerName?: string;
    customerGstin?: string;
    customerAddress?: string;
    items: {
      productId: string;
      quantity: number;
      batchNumber?: string;
      serialNumber?: string;
      unitOfMeasure?: string;
      hsnCode?: string;
    }[];
    paymentMethod: Invoice['paymentMethod'];
    discountPercent?: number;
    taxPercent?: number;
    isInterState?: boolean;
    placeOfSupply?: string;
  }): { invoice: Invoice; updatedProducts: Product[]; customer?: Customer } {
    const {
      customerId,
      customerName,
      customerGstin,
      customerAddress,
      items,
      paymentMethod,
      discountPercent = 0,
      taxPercent = 18,
      isInterState = false,
      placeOfSupply = 'State (Intra-state)'
    } = params;

    if (!items || items.length === 0) {
      throw new Error('Cart items cannot be empty');
    }

    // 1. Resolve customer
    let customer = customerId ? this.getCustomer(customerId) : undefined;
    const clientName = customer ? customer.name : (customerName || 'Walk-in Customer');
    const clientId = customer ? customer.id : 'c-walk-in';
    const clientAddress = customer ? customer.address : (customerAddress || '');

    // 2. Validate and price items (Atomic stock verification)
    const invoiceItems: InvoiceItem[] = [];
    const updatedProducts: Product[] = [];

    for (const item of items) {
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Invalid item quantity for product ${item.productId}`);
      }
      const prod = this.getProduct(item.productId);
      if (!prod) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (prod.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${prod.name}. Available: ${prod.stock}, Requested: ${item.quantity}`);
      }

      invoiceItems.push({
        productId: prod.id,
        name: prod.name,
        price: prod.price,
        quantity: item.quantity,
        batchNumber: item.batchNumber || prod.batchNumber,
        serialNumber: item.serialNumber,
        unitOfMeasure: item.unitOfMeasure || prod.unitOfMeasure,
        hsnCode: item.hsnCode || '8471',
        taxRate: Number(taxPercent)
      });
    }

    // 3. Compute authoritative financial amounts with paise precision
    const subtotal = Math.round(invoiceItems.reduce((acc, it) => acc + (it.price * it.quantity), 0) * 100) / 100;
    const safeDiscountPercent = Math.max(0, Math.min(100, Number(discountPercent) || 0));
    const discount = Math.round((subtotal * (safeDiscountPercent / 100)) * 100) / 100;
    const safeTaxPercent = Math.max(0, Number(taxPercent) !== undefined && !isNaN(Number(taxPercent)) ? Number(taxPercent) : 18);
    
    const gstBreakdown = calculateGSTBreakdown(subtotal, discount, safeTaxPercent, Boolean(isInterState));
    const amountInWords = numberToIndianWords(gstBreakdown.grandTotal);

    // 4. Update product inventory stocks
    for (const item of items) {
      const prod = this.getProduct(item.productId)!;
      const nextStock = Math.max(0, prod.stock - item.quantity);
      const nextStatus = nextStock === 0 ? 'OUT_OF_STOCK' : prod.status;
      const updated = this.updateProduct(prod.id, {
        stock: nextStock,
        status: nextStatus
      })!;
      updatedProducts.push(updated);
    }

    // 5. Update customer stats if registered
    if (customer) {
      customer = this.updateCustomer(customer.id, {
        purchaseCount: customer.purchaseCount + 1,
        totalSpent: Math.round((customer.totalSpent + gstBreakdown.grandTotal) * 100) / 100
      })!;
    }

    // 6. Create Invoice
    const invNo = `INV-2026-0${this.data.invoices.length + 1}`;
    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNo: invNo,
      customerId: clientId,
      customerName: clientName,
      customerGstin: customerGstin || undefined,
      customerAddress: clientAddress || undefined,
      items: invoiceItems,
      subtotal,
      discount,
      discountPercent: safeDiscountPercent,
      taxableAmount: gstBreakdown.netTaxableAmount,
      taxRate: safeTaxPercent,
      tax: gstBreakdown.totalTax,
      cgst: gstBreakdown.cgstAmount,
      sgst: gstBreakdown.sgstAmount,
      igst: gstBreakdown.igstAmount,
      isInterState: Boolean(isInterState),
      total: gstBreakdown.grandTotal,
      amountInWords,
      placeOfSupply,
      gstin: this.data.settings.gstin,
      paymentMethod,
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString()
    };

    this.data.invoices.unshift(invoice);

    // 7. Activity
    this.addActivity({
      title: 'Invoice Generated',
      description: `Generated invoice ${invNo} containing ${items.length} item(s) for ${clientName}. Total: ${formatINR(gstBreakdown.grandTotal)}`,
      type: 'sale'
    });

    this.saveData();

    return { invoice, updatedProducts, customer };
  }

  // Activities
  getActivities(): Activity[] {
    return this.data.activities;
  }

  addActivity(activity: Omit<Activity, 'id' | 'time'> & { time?: string }): Activity {
    const newAct: Activity = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      time: activity.time || 'Just now'
    };
    this.data.activities.unshift(newAct);
    // Keep max 50 activities
    if (this.data.activities.length > 50) {
      this.data.activities = this.data.activities.slice(0, 50);
    }
    this.saveData();
    return newAct;
  }

  // Settings
  getSettings(): Settings {
    return this.data.settings;
  }

  updateSettings(updates: Partial<Settings>): Settings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData();
    return this.data.settings;
  }

  // Users
  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  addUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: `u-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }
}

export const store = new Store();
