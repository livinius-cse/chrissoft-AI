import { api } from './client';
import { Customer, Product, Invoice, Activity } from '../context/AppContext';

export * from './client';

// ── Auth API ────────────────────────────────────────────────────────
export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }),

  signup: (businessName: string, email: string, password: string) =>
    api.post<{ success: boolean; message: string; email: string }>('/auth/signup', {
      businessName,
      email,
      password,
    }),

  verifyOtp: (code: string, email?: string) =>
    api.post<LoginResponse>('/auth/verify-otp', { code, email }),

  getMe: () =>
    api.get<{ user: { id: string; name: string; email: string; role: string } }>('/auth/me'),

  logout: () => {
    localStorage.removeItem('chrissoft_token');
    localStorage.removeItem('chrissoft_user');
  },
};

// ── Products API ────────────────────────────────────────────────────
export const productsApi = {
  getAll: (params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return api.get<Product[]>(`/products${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) =>
    api.get<Product>(`/products/${id}`),

  create: (product: Omit<Product, 'id' | 'status'> & { status?: Product['status'] }) =>
    api.post<Product>('/products', product),

  update: (id: string, updates: Partial<Product>) =>
    api.put<Product>(`/products/${id}`, updates),

  restock: (id: string, quantity: number) =>
    api.post<{ success: boolean; product: Product; message: string }>(`/products/${id}/restock`, { quantity }),

  delete: (id: string) =>
    api.delete<{ success: boolean }>(`/products/${id}`),
};

// ── Customers API ───────────────────────────────────────────────────
export const customersApi = {
  getAll: (params?: { search?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return api.get<Customer[]>(`/customers${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) =>
    api.get<Customer>(`/customers/${id}`),

  create: (customer: Omit<Customer, 'id' | 'balance' | 'purchaseCount' | 'totalSpent' | 'createdAt' | 'avatarColor'> & { avatarColor?: string }) =>
    api.post<Customer>('/customers', customer),

  update: (id: string, updates: Partial<Customer>) =>
    api.put<Customer>(`/customers/${id}`, updates),
};

// ── Invoices / Billing API ──────────────────────────────────────────
export interface CheckoutPayload {
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
}

export interface CheckoutResponse {
  success: boolean;
  invoice: Invoice;
  updatedProducts: Product[];
  customer?: Customer;
}

export const invoicesApi = {
  getAll: (params?: { customerId?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.customerId) query.append('customerId', params.customerId);
    if (params?.status) query.append('status', params.status);
    const qs = query.toString();
    return api.get<Invoice[]>(`/invoices${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) =>
    api.get<Invoice>(`/invoices/${id}`),

  checkout: (payload: CheckoutPayload) =>
    api.post<CheckoutResponse>('/invoices/checkout', payload),
};

// ── Inventory API ───────────────────────────────────────────────────
export interface InventorySummary {
  totalSkuCount: number;
  totalStockCount: number;
  totalCostValuation: number;
  totalRetailValuation: number;
  potentialMargin: number;
  health: {
    dangerCount: number;
    warningCount: number;
    healthyCount: number;
  };
}

export const inventoryApi = {
  getSummary: () =>
    api.get<InventorySummary>('/inventory/summary'),

  restockAlerts: () =>
    api.post<{ success: boolean; message: string; restockedProducts: Product[] }>('/inventory/restock-alerts'),
};

// ── Activities API ──────────────────────────────────────────────────
export const activitiesApi = {
  getAll: (params?: { type?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString();
    return api.get<Activity[]>(`/activities${qs ? `?${qs}` : ''}`);
  },

  create: (activity: Omit<Activity, 'id' | 'time'> & { time?: string }) =>
    api.post<Activity>('/activities', activity),
};

// ── Analytics & Reports API ─────────────────────────────────────────
export const analyticsApi = {
  getAnalytics: () =>
    api.get<any>('/analytics'),

  getReports: () =>
    api.get<any>('/analytics/reports'),
};

// ── AI Intelligence API ─────────────────────────────────────────────
export interface VendorRecommendation {
  vendorId: string;
  name: string;
  score: number;
  reason: string;
}

export interface DemandForecast {
  productId: string;
  productName: string;
  currentStock: number;
  predictedDemand: number;
  growthRate: number;
  recommendedReorderQuantity: number;
  confidenceScore: number;
}

export const aiApi = {
  recommendVendors: (rfqDetails: string) =>
    api.post<{ success: boolean; recommendations: VendorRecommendation[] }>('/ai/recommend-vendors', { rfqDetails }),

  forecastDemand: (productId?: string) =>
    api.post<{ success: boolean; forecast: DemandForecast }>('/ai/forecast-demand', { productId }),

  predictPrice: (productId?: string) =>
    api.post<{ success: boolean; productId: string; productName: string; expectedChangePct: number; suggestion: string; estimatedFuturePrice?: number }>('/ai/predict-price', { productId }),

  analyzeRisk: (purchaseOrderId?: string) =>
    api.post<{ success: boolean; purchaseOrderId: string; analysis: any }>('/ai/analyze-risk', { purchaseOrderId }),

  chat: (message: string) =>
    api.post<{ success: boolean; reply: string; suggestions: string[]; timestamp: string }>('/ai/chat', { message }),
};

// ── Settings API ────────────────────────────────────────────────────
export const settingsApi = {
  getSettings: () =>
    api.get<any>('/settings'),

  updateSettings: (settings: any) =>
    api.put<{ success: boolean; settings: any; message: string }>('/settings', settings),
};
