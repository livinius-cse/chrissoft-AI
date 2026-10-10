import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { productsApi, customersApi, invoicesApi, activitiesApi } from '../api';

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
}

export interface CartItem {
    product: Product;
    quantity: number;
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

interface AppContextType {
    customers: Customer[];
    products: Product[];
    invoices: Invoice[];
    activities: Activity[];
    cart: CartItem[];
    currentCustomer: Customer | null;
    setCurrentCustomer: (c: Customer | null) => void;
    addToCart: (p: Product) => void;
    removeFromCart: (productId: string) => void;
    updateCartQty: (productId: string, qty: number) => void;
    clearCart: () => void;
    checkout: (paymentMethod: Invoice['paymentMethod'], discountPercent?: number, taxPercent?: number) => Invoice;
    restockProduct: (productId: string, qty: number) => void;
    addProduct: (p: Omit<Product, 'id' | 'status'> & { status?: Product['status'] }) => void;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
    const [activities, setActivities] = useState<Activity[]>(initialActivities);

    const [cart, setCart] = useState<CartItem[]>([]);
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(initialCustomers[0]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Synchronize state with backend
    const refreshData = useCallback(async () => {
        try {
            const [prods, custs, invs, acts] = await Promise.all([
                productsApi.getAll().catch(() => null),
                customersApi.getAll().catch(() => null),
                invoicesApi.getAll().catch(() => null),
                activitiesApi.getAll().catch(() => null),
            ]);

            if (prods && Array.isArray(prods)) {
                setProducts(prods);
                setIsBackendConnected(true);
            }
            if (custs && Array.isArray(custs)) {
                setCustomers(custs);
                if (!currentCustomer && custs.length > 0) {
                    setCurrentCustomer(custs[0]);
                }
            }
            if (invs && Array.isArray(invs)) {
                setInvoices(invs);
            }
            if (acts && Array.isArray(acts)) {
                setActivities(acts);
            }
        } catch (e) {
            console.warn('Backend sync error:', e);
            setIsBackendConnected(false);
        } finally {
            setIsLoading(false);
        }
    }, [currentCustomer]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // Cart operations
    const addToCart = (product: Product) => {
        if (product.stock <= 0 && product.status !== 'DRAFT') return;
        setCart(prev => {
            const idx = prev.findIndex(item => item.product.id === product.id);
            if (idx > -1) {
                if (prev[idx].quantity >= product.stock) return prev; // Limit to in-stock
                const next = [...prev];
                next[idx] = { ...prev[idx], quantity: prev[idx].quantity + 1 };
                return next;
            }
            return [...prev, { product, quantity: 1 }];
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

    // Generate POS Invoice
    const checkout = (paymentMethod: Invoice['paymentMethod'], discountPercent = 0, taxPercent = 18): Invoice => {
        if (cart.length === 0) throw new Error('Cart is empty');

        // 1. Calculate values
        const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
        const discount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
        const taxableAmount = subtotal - discount;
        const tax = Math.round(taxableAmount * (taxPercent / 100) * 100) / 100;
        const total = taxableAmount + tax;

        // 2. Generate details
        const invNo = `INV-2026-0${invoices.length + 1}`;
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

        const newInvoiceItems: InvoiceItem[] = cart.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity
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

        // 3. Update stock levels for purchased items
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

        // 4. Update customer loyalty metadata
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

        // 5. Append invoice & generate timeline activity
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

        // 6. Asynchronously send checkout to backend API for persistence
        invoicesApi.checkout({
            customerId: currentCustomer?.id,
            customerName: currentCustomer?.name || 'Walk-in Customer',
            items: cart.map(c => ({ productId: c.product.id, quantity: c.quantity })),
            paymentMethod,
            discountPercent,
            taxPercent
        }).then(res => {
            if (res.invoice) {
                // Keep backend-assigned invoice ID if returned
                setInvoices(current => current.map(inv => inv.id === newInvoice.id ? res.invoice : inv));
            }
            if (res.updatedProducts) {
                setProducts(prev => {
                    const map = new Map(res.updatedProducts.map(p => [p.id, p]));
                    return prev.map(p => map.get(p.id) || p);
                });
            }
            if (res.customer) {
                setCustomers(prev => prev.map(c => c.id === res.customer?.id ? res.customer! : c));
            }
        }).catch(err => {
            console.warn('Backend checkout sync deferred:', err);
        });

        // 7. Reset POS Cart
        setCart([]);

        return newInvoice;
    };

    const restockProduct = (productId: string, qty: number) => {
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

        // Backend API call
        productsApi.restock(productId, qty).then(res => {
            if (res.product) {
                setProducts(prev => prev.map(p => p.id === productId ? res.product : p));
            }
        }).catch(err => {
            console.warn('Backend restock sync deferred:', err);
        });
    };

    const addProduct = (p: Omit<Product, 'id' | 'status'> & { status?: Product['status'] }) => {
        const newProduct: Product = {
            ...p,
            id: `p-${Date.now()}`,
            status: p.status || (p.stock === 0 ? 'OUT_OF_STOCK' : 'ACTIVE')
        };

        setProducts(prev => [newProduct, ...prev]);
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

        // Backend API call
        productsApi.create(p).then(res => {
            if (res && res.id) {
                setProducts(prev => prev.map(prod => prod.id === newProduct.id ? res : prod));
            }
        }).catch(err => {
            console.warn('Backend addProduct sync deferred:', err);
        });
    };

    const addCustomer = (c: Omit<Customer, 'id' | 'balance' | 'purchaseCount' | 'totalSpent' | 'createdAt' | 'avatarColor'> & { avatarColor?: string }) => {
        const newCustomer: Customer = {
            ...c,
            id: `c-${Date.now()}`,
            balance: 0,
            purchaseCount: 0,
            totalSpent: 0,
            avatarColor: c.avatarColor || ['from-purple-500 to-indigo-500', 'from-pink-500 to-rose-500', 'from-blue-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500'][Math.floor(Math.random() * 5)],
            createdAt: new Date().toISOString()
        };

        setCustomers(prev => [...prev, newCustomer]);
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

        // Backend API call
        customersApi.create(c).then(res => {
            if (res && res.id) {
                setCustomers(prev => prev.map(cust => cust.id === newCustomer.id ? res : cust));
            }
        }).catch(err => {
            console.warn('Backend addCustomer sync deferred:', err);
        });
    };

    return (
        <AppContext.Provider
            value={{
                customers,
                products,
                invoices,
                activities,
                cart,
                currentCustomer,
                setCurrentCustomer,
                addToCart,
                removeFromCart,
                updateCartQty,
                clearCart,
                checkout,
                restockProduct,
                addProduct,
                addCustomer,
                selectedCategory,
                setSelectedCategory,
                searchQuery,
                setSearchQuery,
                isBackendConnected,
                isLoading,
                refreshData
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within an AppProvider');
    return context;
};
