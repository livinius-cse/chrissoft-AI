import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { productsApi, customersApi, invoicesApi, activitiesApi, settingsApi } from '../api';

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

// Data Types
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

    // Optional Industry Specific Fields
    mrp?: number;
    brand?: string;
    batchNumber?: string;
    expiryDate?: string;
    unitOfMeasure?: string;
    isPerishable?: boolean;
    composition?: string;
    dosageForm?: string;
    requiresPrescription?: boolean;
    model?: string;
    warrantyMonths?: number;
    serialNumbers?: string[];
    size?: string;
    color?: string;
    material?: string;
    variants?: ProductVariant[];
    grade?: string;
    gauge?: string;
    technicalSpecs?: string;
    minOrderQty?: number;
    cartonQty?: number;
    tieredPricing?: TieredPrice[];
}

export interface CartItem {
    product: Product;
    quantity: number;
    selectedVariant?: ProductVariant;
    selectedBatch?: string;
    selectedSerial?: string;
}

export interface InvoiceItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    batchNumber?: string;
    serialNumber?: string;
    unitOfMeasure?: string;
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
    businessType: BusinessType;
    gstin?: string;
    pan?: string;
}

interface AppContextType {
    customers: Customer[];
    products: Product[];
    invoices: Invoice[];
    activities: Activity[];
    cart: CartItem[];
    businessType: BusinessType;
    setBusinessType: (type: BusinessType) => Promise<void>;
    settings: Settings | null;
    currentCustomer: Customer | null;
    setCurrentCustomer: (c: Customer | null) => void;
    addToCart: (p: Product, extra?: { variant?: ProductVariant; batch?: string; serial?: string }) => void;
    removeFromCart: (productId: string) => void;
    updateCartQty: (productId: string, qty: number) => void;
    clearCart: () => void;
    checkout: (paymentMethod: Invoice['paymentMethod'], discountPercent?: number, taxPercent?: number) => Promise<Invoice>;
    restockProduct: (productId: string, qty: number) => void;
    addProduct: (p: Omit<Product, 'id' | 'status'> & { status?: Product['status'] }) => Promise<Product>;
    updateProduct: (id: string, updates: Partial<Product>) => Promise<Product | undefined>;
    addCustomer: (c: Omit<Customer, 'id' | 'balance' | 'purchaseCount' | 'totalSpent' | 'createdAt' | 'avatarColor'> & { avatarColor?: string }) => void;
    selectedCategory: string;
    setSelectedCategory: (cat: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isBackendConnected: boolean;
    isLoading: boolean;
    refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Static Clean Seed Data
const initialCustomers: Customer[] = [
    { id: 'c-1', name: 'Alexander Wright', email: 'alex@wrightcorp.com', phone: '+1 (555) 0192', address: '499 Broadway, New York, NY 10012', balance: 0, purchaseCount: 14, totalSpent: 4850, avatarColor: 'from-pink-500 to-rose-500', createdAt: '2026-01-15T10:00:00Z' },
    { id: 'c-2', name: 'Sophia Chen', email: 'sophia.c@nexusdesign.io', phone: '+1 (555) 0432', address: '55 Spear St, San Francisco, CA 94105', balance: 840, purchaseCount: 8, totalSpent: 2980, avatarColor: 'from-purple-500 to-indigo-500', createdAt: '2026-02-10T14:30:00Z' },
    { id: 'c-3', name: 'Marcus Miller', email: 'marcus@millerlogistics.net', phone: '+1 (555) 0881', address: '1201 W Adams St, Chicago, IL 60607', balance: 0, purchaseCount: 22, totalSpent: 12450, avatarColor: 'from-blue-500 to-cyan-500', createdAt: '2025-11-20T09:15:00Z' },
    { id: 'c-4', name: 'Elena Rostova', email: 'elena@rostovbuilders.com', phone: '+1 (555) 0772', address: '782 Skyline Blvd, Austin, TX 78746', balance: 1250, purchaseCount: 5, totalSpent: 3000, avatarColor: 'from-emerald-500 to-teal-500', createdAt: '2026-03-01T11:45:00Z' },
    { id: 'c-5', name: 'Devon Carter', email: 'devon@cartergrowth.co', phone: '+1 (555) 0341', address: '220 N Green St, Denver, CO 80202', balance: 0, purchaseCount: 3, totalSpent: 920, avatarColor: 'from-amber-500 to-orange-500', createdAt: '2026-04-12T16:20:00Z' }
];

const initialProducts: Product[] = [
    { id: 'p-1', sku: 'PRD-IP15P', name: 'iPhone 15 Pro Max (256GB - Titanium)', barcode: '190199092837', price: 1199, cost: 780, stock: 45, minStock: 10, category: 'Electronics', image: '📱', status: 'ACTIVE', brand: 'Apple', model: 'A3106', warrantyMonths: 12 },
    { id: 'p-2', sku: 'PRD-M3MAC', name: 'MacBook Pro 14 M3 Max (36GB / 1TB)', barcode: '190199081223', price: 3199, cost: 2150, stock: 12, minStock: 5, category: 'Electronics', image: '💻', status: 'ACTIVE', brand: 'Apple', model: 'MRX53LL/A', warrantyMonths: 24 },
    { id: 'p-3', sku: 'PRD-APRPM', name: 'AirPods Max (Space Gray Premium)', barcode: '190199042318', price: 549, cost: 360, stock: 4, minStock: 8, category: 'Audio', image: '🎧', status: 'ACTIVE', brand: 'Apple', warrantyMonths: 12 },
    { id: 'p-4', sku: 'PRD-LOGMX', name: 'Logitech MX Master 3S Mouse', barcode: '097855172283', price: 99, cost: 52, stock: 78, minStock: 15, category: 'Accessories', image: '🖱️', status: 'ACTIVE', brand: 'Logitech', warrantyMonths: 24 },
    { id: 'p-5', sku: 'PRD-APPW9', name: 'Apple Watch Series 9 (45mm GPS)', barcode: '190199098319', price: 429, cost: 280, stock: 18, minStock: 6, category: 'Electronics', image: '⌚', status: 'ACTIVE', brand: 'Apple', warrantyMonths: 12 },
    { id: 'p-6', sku: 'PRD-SNDX4', name: 'Sony WH-1000XM4 Noise Cancelling', barcode: '027242919373', price: 348, cost: 210, stock: 0, minStock: 5, category: 'Audio', image: '🎧', status: 'OUT_OF_STOCK', brand: 'Sony', warrantyMonths: 12 },
    { id: 'p-7', sku: 'PRD-KCHM2', name: 'Keychron Q2 QMK Mechanical Keyboard', barcode: '075482312019', price: 189, cost: 110, stock: 3, minStock: 5, category: 'Accessories', image: '⌨️', status: 'ACTIVE', brand: 'Keychron', warrantyMonths: 12 }
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
    { id: 'act-4', title: 'Payment Received', description: 'Received online UPI payment of ₹1,921.04 from Alexander Wright.', time: 'Yesterday', type: 'sale' },
    { id: 'act-5', title: 'OutOfStock Warning', description: 'Sony WH-1000XM4 headphones are completely sold out.', time: '2 days ago', type: 'stock' }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
    const [activities, setActivities] = useState<Activity[]>(initialActivities);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [businessType, setBusinessTypeState] = useState<BusinessType>('ELECTRONICS');
    const [settings, setSettings] = useState<Settings | null>(null);

    // Fetch data from backend API
    const refreshData = useCallback(async () => {
        try {
            const [prodsRes, custsRes, invsRes, actsRes, settingsRes] = await Promise.allSettled([
                productsApi.getAll(),
                customersApi.getAll(),
                invoicesApi.getAll(),
                activitiesApi.getAll({ limit: 20 }),
                settingsApi.getSettings()
            ]);

            let connected = false;

            if (prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value)) {
                setProducts(prodsRes.value);
                connected = true;
            }
            if (custsRes.status === 'fulfilled' && Array.isArray(custsRes.value)) {
                setCustomers(custsRes.value);
                connected = true;
            }
            if (invsRes.status === 'fulfilled' && Array.isArray(invsRes.value)) {
                setInvoices(invsRes.value);
                connected = true;
            }
            if (actsRes.status === 'fulfilled' && Array.isArray(actsRes.value)) {
                setActivities(actsRes.value);
                connected = true;
            }
            if (settingsRes.status === 'fulfilled' && settingsRes.value) {
                setSettings(settingsRes.value);
                if (settingsRes.value.businessType) {
                    setBusinessTypeState(settingsRes.value.businessType);
                }
                connected = true;
            }

            setIsBackendConnected(connected);
        } catch (e) {
            console.warn('Backend synchronization fallback. Running in local simulation mode.', e);
            setIsBackendConnected(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const setBusinessType = async (newType: BusinessType) => {
        setBusinessTypeState(newType);
        try {
            const res = await settingsApi.updateSettings({ businessType: newType });
            if (res.settings) {
                setSettings(res.settings);
            }
        } catch (err) {
            console.warn('Could not persist businessType to backend:', err);
        }
    };

    // Cart Actions
    const addToCart = (product: Product, extra?: { variant?: ProductVariant; batch?: string; serial?: string }) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id && item.selectedVariant?.sku === extra?.variant?.sku);
            if (existing) {
                if (existing.quantity >= product.stock) return prev;
                return prev.map(item =>
                    item === existing
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            if (product.stock <= 0) return prev;
            return [...prev, {
                product,
                quantity: 1,
                selectedVariant: extra?.variant,
                selectedBatch: extra?.batch || product.batchNumber,
                selectedSerial: extra?.serial
            }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateCartQty = (productId: string, qty: number) => {
        if (qty <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const validatedQty = Math.min(qty, item.product.stock);
                return { ...item, quantity: validatedQty };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCart([]);
    };

    // Generate POS Invoice with Backend Integration
    const checkout = async (paymentMethod: Invoice['paymentMethod'], discountPercent = 0, taxPercent = 18): Promise<Invoice> => {
        if (cart.length === 0) throw new Error('Cart is empty');

        const customer = currentCustomer || {
            id: 'c-walk-in',
            name: 'Walk-in Customer',
            email: 'walk-in@chrissoft.com',
            phone: '',
            address: '',
            balance: 0,
            purchaseCount: 0,
            totalSpent: 0,
            avatarColor: 'from-slate-400 to-slate-600',
            createdAt: new Date().toISOString()
        };

        try {
            const res = await invoicesApi.checkout({
                customerId: customer.id,
                customerName: customer.name,
                items: cart.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity
                })),
                paymentMethod,
                discountPercent,
                taxPercent
            });

            if (res.success && res.invoice) {
                setInvoices(prev => [res.invoice, ...prev]);
                if (res.updatedProducts) {
                    setProducts(prev => prev.map(p => {
                        const up = res.updatedProducts.find(u => u.id === p.id);
                        return up || p;
                    }));
                }
                if (res.customer && currentCustomer) {
                    setCustomers(prev => prev.map(c => c.id === res.customer!.id ? res.customer! : c));
                }
                clearCart();
                return res.invoice;
            }
        } catch (e) {
            console.warn('Backend checkout failed, falling back to local calculation:', e);
        }

        // Local fallback calculation
        const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
        const discount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
        const taxableAmount = subtotal - discount;
        const tax = Math.round(taxableAmount * (taxPercent / 100) * 100) / 100;
        const total = taxableAmount + tax;

        const invNo = `INV-2026-0${invoices.length + 1}`;
        const newInvoiceItems: InvoiceItem[] = cart.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            batchNumber: item.selectedBatch,
            serialNumber: item.selectedSerial,
            unitOfMeasure: item.product.unitOfMeasure
        }));

        const newInvoice: Invoice = {
            id: `inv-${Date.now()}`,
            invoiceNo: invNo,
            customerId: customer.id,
            customerName: customer.name,
            items: newInvoiceItems,
            subtotal,
            discount,
            tax,
            total,
            paymentMethod,
            paymentStatus: 'PAID',
            createdAt: new Date().toISOString()
        };

        setProducts(prev => {
            return prev.map(p => {
                const cartItem = cart.find(c => c.product.id === p.id);
                if (cartItem) {
                    const nextStock = Math.max(0, p.stock - cartItem.quantity);
                    return {
                        ...p,
                        stock: nextStock,
                        status: nextStock === 0 ? 'OUT_OF_STOCK' : p.status
                    };
                }
                return p;
            });
        });

        if (currentCustomer) {
            setCustomers(prev => prev.map(c => {
                if (c.id === currentCustomer.id) {
                    return {
                        ...c,
                        purchaseCount: c.purchaseCount + 1,
                        totalSpent: c.totalSpent + total
                    };
                }
                return c;
            }));
        }

        setInvoices(prev => [newInvoice, ...prev]);
        setActivities(prev => [
            {
                id: `act-${Date.now()}`,
                title: 'Invoice Generated',
                description: `Generated invoice ${invNo} containing ${cart.length} item(s) for ${customer.name}.`,
                time: 'Just now',
                type: 'sale'
            },
            ...prev
        ]);
        clearCart();
        return newInvoice;
    };

    // Restock
    const restockProduct = async (productId: string, qty: number) => {
        try {
            await productsApi.restock(productId, qty);
        } catch (e) {
            console.warn('Backend restock fallback', e);
        }

        setProducts(prev => prev.map(p => {
            if (p.id === productId) {
                const nextStock = p.stock + qty;
                return {
                    ...p,
                    stock: nextStock,
                    status: nextStock > 0 ? 'ACTIVE' : p.status
                };
            }
            return p;
        }));

        const prod = products.find(p => p.id === productId);
        setActivities(prev => [
            {
                id: `act-${Date.now()}`,
                title: 'Inventory Restocked',
                description: `Restocked ${qty} units of ${prod?.name || 'Product'}.`,
                time: 'Just now',
                type: 'stock'
            },
            ...prev
        ]);
    };

    // Add Product
    const addProduct = async (p: Omit<Product, 'id' | 'status'> & { status?: Product['status'] }): Promise<Product> => {
        let createdProd: Product = {
            ...p,
            id: `p-${Date.now()}`,
            status: p.status || (p.stock === 0 ? 'OUT_OF_STOCK' : 'ACTIVE')
        };

        try {
            const res = await productsApi.create(p);
            if (res && res.id) {
                createdProd = res;
            }
        } catch (e) {
            console.warn('Backend product creation fallback', e);
        }

        setProducts(prev => [createdProd, ...prev]);
        setActivities(prev => [
            {
                id: `act-${Date.now()}`,
                title: 'New Product Registered',
                description: `Added "${p.name}" to inventory catalogue.`,
                time: 'Just now',
                type: 'stock'
            },
            ...prev
        ]);

        return createdProd;
    };

    // Update Product
    const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | undefined> => {
        let updatedProd: Product | undefined;
        try {
            const res = await productsApi.update(id, updates);
            if (res) updatedProd = res;
        } catch (e) {
            console.warn('Backend product update fallback', e);
        }

        setProducts(prev => prev.map(p => {
            if (p.id === id) {
                const merged = { ...p, ...updates, ...(updatedProd || {}) };
                updatedProd = merged;
                return merged;
            }
            return p;
        }));

        return updatedProd;
    };

    // Add Customer
    const addCustomer = async (c: Omit<Customer, 'id' | 'balance' | 'purchaseCount' | 'totalSpent' | 'createdAt' | 'avatarColor'> & { avatarColor?: string }) => {
        const avatarColors = [
            'from-purple-500 to-indigo-500',
            'from-pink-500 to-rose-500',
            'from-blue-500 to-cyan-500',
            'from-emerald-500 to-teal-500',
            'from-amber-500 to-orange-500'
        ];

        let newCustomer: Customer = {
            ...c,
            id: `c-${Date.now()}`,
            balance: 0,
            purchaseCount: 0,
            totalSpent: 0,
            avatarColor: c.avatarColor || avatarColors[Math.floor(Math.random() * avatarColors.length)],
            createdAt: new Date().toISOString()
        };

        try {
            const res = await customersApi.create(c);
            if (res && res.id) {
                newCustomer = res;
            }
        } catch (e) {
            console.warn('Backend customer creation fallback', e);
        }

        setCustomers(prev => [newCustomer, ...prev]);
        setActivities(prev => [
            {
                id: `act-${Date.now()}`,
                title: 'New Customer Registered',
                description: `Added client ${c.name} (${c.email}) to accounts.`,
                time: 'Just now',
                type: 'customer'
            },
            ...prev
        ]);
    };

    return (
        <AppContext.Provider
            value={{
                customers,
                products,
                invoices,
                activities,
                cart,
                businessType,
                setBusinessType,
                settings,
                currentCustomer,
                setCurrentCustomer,
                addToCart,
                removeFromCart,
                updateCartQty,
                clearCart,
                checkout,
                restockProduct,
                addProduct,
                updateProduct,
                addCustomer,
                selectedCategory,
                setSelectedCategory,
                searchQuery,
                setSearchQuery,
                isBackendConnected,
                isLoading,
                refreshData,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
