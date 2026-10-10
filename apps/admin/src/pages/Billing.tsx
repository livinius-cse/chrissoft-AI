import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import {
    Search,
    UserPlus,
    Trash2,
    Ticket,
    CreditCard,
    FileText,
    Printer,
    ArrowRight,
    Percent,
    Calculator,
    ScanBarcode,
    ShoppingBag,
    Sparkles,
    CheckCircle2,
    X
} from 'lucide-react';
import { useApp, Product, Customer, Invoice } from '@/context/AppContext';
import { toast } from 'sonner';

export const Billing: React.FC = () => {
    const {
        products,
        customers,
        cart,
        currentCustomer,
        setCurrentCustomer,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        checkout,
        addCustomer
    } = useApp();

    // Search/Filter states
    const [productSearch, setProductSearch] = useState('');
    const [barcodeSearch, setBarcodeSearch] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCat, setSelectedCat] = useState('All');

    // Tax / Adjustments states
    const [discountPercent, setDiscountPercent] = useState<number>(0);
    const [taxPercent, setTaxPercent] = useState<number>(18);
    const [couponCode, setCouponCode] = useState('');
    const [orderNotes, setOrderNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CARD');

    // Customer selection states
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [showNewCustModal, setShowNewCustModal] = useState(false);
    const [newCustName, setNewCustName] = useState('');
    const [newCustEmail, setNewCustEmail] = useState('');
    const [newCustPhone, setNewCustPhone] = useState('');
    const [newCustAddress, setNewCustAddress] = useState('');

    // Post Checkout Preview Modal
    const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);

    // 1. Calculations
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const discountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = Math.round(taxableAmount * (taxPercent / 100) * 100) / 100;
    const total = taxableAmount + taxAmount;

    // Categories list
    const categoriesList = ['All', ...new Set(products.map(p => p.category))];

    // Barcode / SKU Scanning simulator
    const handleBarcodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const barcodeTarget = barcodeSearch.trim();
        if (!barcodeTarget) return;

        // Search by Barcode or SKU
        const match = products.find(p => p.barcode === barcodeTarget || p.sku.toLowerCase() === barcodeTarget.toLowerCase());
        if (match) {
            if (match.stock <= 0) {
                toast.warning(`Cannot add ${match.name}. It is out of stock.`);
                return;
            }
            addToCart(match);
            toast.success(`Scanned: ${match.name} added.`);
            setBarcodeSearch('');
        } else {
            toast.error(`Barcode/SKU "${barcodeTarget}" matches no items.`);
        }
    };

    // Click on a product card
    const handleProductClick = (p: Product) => {
        if (p.stock <= 0) {
            toast.warning('Product is currently out of stock.');
            return;
        }
        addToCart(p);
    };

    // Add customer from modal
    const handleCreateCustomer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCustName || !newCustEmail || !newCustPhone) {
            toast.error('All details are required.');
            return;
        }

        // Add to static lists
        addCustomer({
            name: newCustName,
            email: newCustEmail,
            phone: newCustPhone,
            address: newCustAddress || 'Corporate Suite Workstation'
        });

        toast.success(`Merchant Account Client "${newCustName}" registered.`);
        setShowNewCustModal(false);

        setNewCustName('');
        setNewCustEmail('');
        setNewCustPhone('');
        setNewCustAddress('');
    };

    // Apply Coupon simulator
    const handleApplyCoupon = () => {
        if (couponCode.toLowerCase() === 'save10') {
            setDiscountPercent(10);
            toast.success('Coupon code Applied! 10% Discount applied.');
        } else if (couponCode.toLowerCase() === 'save20') {
            setDiscountPercent(20);
            toast.success('Coupon code Applied! 20% Discount applied.');
        } else {
            toast.error('Invalid coupon code.');
        }
        setCouponCode('');
    };

    // Process POS checkout
    const handleProcessCheckout = () => {
        if (cart.length === 0) {
            toast.error('Cannot proceed. The checkout cart is empty.');
            return;
        }

        try {
            const invoice = checkout(paymentMethod, discountPercent, taxPercent);
            toast.success(`Transaction Completed! Invoice ${invoice.invoiceNo} generated.`);
            setCompletedInvoice(invoice); // Open printable invoice preview modal

            // Reset settings
            setDiscountPercent(0);
            setOrderNotes('');
        } catch (err: any) {
            toast.error(err.message || 'Checkout failed.');
        }
    };

    // Filters
    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase());
        const matchCat = selectedCat === 'All' || p.category === selectedCat;
        return matchSearch && matchCat;
    });

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch)
    );

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-10rem)] max-h-[850px] overflow-hidden select-none">

            {/* LEFT BLOCK: Invoice Catalogue / Filters (8 columns) */}
            <div className="xl:col-span-8 flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden p-5 space-y-4">

                {/* Row 1: Barcode & Filter input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-shrink-0">
                    <form onSubmit={handleBarcodeSubmit} className="relative">
                        <input
                            type="text"
                            placeholder="Scan Barcode or input SKU..."
                            value={barcodeSearch}
                            onChange={(e) => setBarcodeSearch(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-muted/60 border border-border focus:border-brand-500 hover:border-border-hover rounded-xl text-sm focus:outline-none placeholder-muted-foreground/80 font-mono"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                            <ScanBarcode className="w-5 h-5 text-indigo-400" />
                        </div>
                        <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-brand-600 dark:text-brand-500">
                            Add
                        </button>
                    </form>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search products in database..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="w-full pl-10 py-2.5 bg-muted/60 border border-border focus:border-brand-500 hover:border-border-hover rounded-xl text-sm focus:outline-none placeholder-muted-foreground/80"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                            <Search className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Row 2: Category Filter Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 flex-shrink-0">
                    {categoriesList.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCat(cat)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 flex-shrink-0",
                                selectedCat === cat
                                    ? "bg-brand-600 border-brand-600 text-white shadow-sm"
                                    : "bg-muted/40 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Row 3: Scrollable Product Cards Grid */}
                <div className="flex-1 overflow-y-auto pr-1">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {filteredProducts.map(p => (
                            <div
                                key={p.id}
                                onClick={() => handleProductClick(p)}
                                className={cn(
                                    "p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all duration-200 select-none group relative",
                                    p.stock <= 0
                                        ? "bg-muted/30 border-border/40 opacity-70 pointer-events-none"
                                        : "bg-card border-border hover:border-brand-500 hover:shadow-md dark:hover:bg-brand-500/[0.01]"
                                )}
                            >
                                {/* Image placeholder emoji */}
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl bg-muted/60 w-11 h-11 flex items-center justify-center rounded-xl group-hover:scale-105 transition-transform duration-200">{p.image}</span>
                                    <div className="text-right">
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-muted rounded font-bold">{p.sku}</span>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <h4 className="text-xs font-bold leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-500 transition-colors">{p.name}</h4>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{p.category}</p>
                                </div>

                                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2">
                                    <span className="text-xs font-bold text-foreground">${p.price}</span>
                                    <span className={cn(
                                        "text-[10px] font-semibold",
                                        p.stock <= p.minStock ? 'text-amber-500' : 'text-emerald-500'
                                    )}>
                                        {p.stock} units
                                    </span>
                                </div>
                            </div>
                        ))}

                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-16 text-center text-xs text-muted-foreground">
                                No items matching product search criteria.
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* RIGHT BLOCK: Dynamic Cart, Customer select & Checkout (4 columns) */}
            <div className="xl:col-span-4 flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden p-5 justify-between">

                {/* Row 1: Customer picker */}
                <div className="space-y-3 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Checkout Client</span>
                        <button
                            onClick={() => setShowNewCustModal(true)}
                            className="text-[10px] font-semibold text-brand-600 dark:text-brand-500 flex items-center gap-1 hover:underline"
                        >
                            <UserPlus className="w-3.5 h-3.5" /> Register Client
                        </button>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                            className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-xs text-left text-foreground hover:bg-muted"
                        >
                            <span>{currentCustomer ? `${currentCustomer.name} (${currentCustomer.phone})` : 'Walk-in Customer'}</span>
                            <span className="text-[10px] font-bold text-brand-600 dark:text-brand-500">Change</span>
                        </button>

                        {showCustomerDropdown && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowCustomerDropdown(false)} />
                                <div className="absolute left-0 right-0 mt-2 rounded-xl border border-border bg-card p-2 shadow-lg z-50 animate-in fade-in-50 duration-200">
                                    <input
                                        type="text"
                                        placeholder="Search accounts catalog..."
                                        value={customerSearch}
                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                        className="w-full px-2.5 py-1.5 bg-muted/60 border border-border rounded-lg text-xs focus:outline-none mb-2"
                                    />
                                    <div className="max-h-[150px] overflow-y-auto space-y-1">
                                        <button
                                            onClick={() => { setCurrentCustomer(null); setShowCustomerDropdown(false); }}
                                            className="w-full px-2.5 py-2 text-xs hover:bg-muted rounded-lg text-left"
                                        >
                                            Walk-in Customer
                                        </button>
                                        {filteredCustomers.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => { setCurrentCustomer(c); setShowCustomerDropdown(false); }}
                                                className="w-full flex justify-between items-center px-2.5 py-2 text-xs hover:bg-muted rounded-lg text-left"
                                            >
                                                <span className="font-semibold">{c.name}</span>
                                                <span className="text-[10px] text-muted-foreground">{c.phone}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Row 2: Selected Items Cart (Scrollable flexbox) */}
                <div className="flex-1 overflow-y-auto my-3 border-y border-border/60 py-3 space-y-2.5">
                    {cart.map((item) => (
                        <div key={item.product.id} className="flex justify-between items-center gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{item.product.image}</span>
                                <div>
                                    <h4 className="text-xs font-bold truncate max-w-[130px]">{item.product.name}</h4>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">${item.product.price} each</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                {/* Quantity adjustments */}
                                <div className="flex items-center border border-border rounded-lg bg-muted p-0.5">
                                    <button
                                        onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                                        className="w-5 h-5 flex items-center justify-center font-bold text-xs hover:bg-card rounded"
                                    >
                                        -
                                    </button>
                                    <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                                    <button
                                        onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                                        className="w-5 h-5 flex items-center justify-center font-bold text-xs hover:bg-card rounded"
                                    >
                                        +
                                    </button>
                                </div>

                                <span className="text-xs font-bold w-12 text-right">${item.product.price * item.quantity}</span>

                                <button
                                    onClick={() => removeFromCart(item.product.id)}
                                    className="p-1 hover:bg-rose-500/10 text-rose-500 rounded-lg"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-2">
                            <ShoppingBag className="w-8 h-8 text-indigo-400 opacity-60" />
                            <p className="text-xs text-muted-foreground">Checkout cart is empty.</p>
                            <p className="text-[10px] text-muted-foreground/60">Scan or tap products above to catalog.</p>
                        </div>
                    )}
                </div>

                {/* Row 3: Discounts & Financial summary */}
                <div className="space-y-3.5 flex-shrink-0 bg-muted/30 p-3 rounded-xl border border-border/80">

                    {/* Coupon inputs */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Coupon (e.g. SAVE10)"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 bg-card border border-border rounded-lg text-xs focus:outline-none"
                        />
                        <button
                            onClick={handleApplyCoupon}
                            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/15 text-brand-600 dark:text-brand-500 border border-indigo-100 dark:border-indigo-500/20 text-xs font-bold rounded-lg hover:bg-indigo-100"
                        >
                            Apply
                        </button>
                    </div>

                    {/* Totals */}
                    <div className="space-y-1.5 text-xs text-muted-foreground border-b border-border/60 pb-2.5">
                        <div className="flex justify-between">
                            <span>Items Total</span>
                            <span className="font-semibold text-foreground">${subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="flex items-center gap-1">
                                Discount Discount
                            </span>
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    value={discountPercent || ''}
                                    onChange={(e) => setDiscountPercent(Math.min(100, Number(e.target.value)))}
                                    className="w-8 bg-transparent text-right border-b border-border text-xs focus:outline-none select-all"
                                    placeholder="0"
                                />
                                <span>% (-${discountAmount})</span>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span>CGST &amp; SGST</span>
                            <div className="flex items-center gap-1">
                                <select
                                    value={taxPercent}
                                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                                    className="bg-transparent font-medium border-b border-border text-xs focus:outline-none"
                                >
                                    <option value={18}>18% (Standard)</option>
                                    <option value={12}>12% (Reduced)</option>
                                    <option value={5}>5% (Essential)</option>
                                    <option value={0}>0% (Tax Free)</option>
                                </select>
                                <span>(+${taxAmount})</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold">Total Payable</span>
                        <span className="text-base font-extrabold text-brand-600 dark:text-brand-500">${total.toLocaleString()}</span>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1.5">
                        {(['CARD', 'UPI', 'CASH'] as const).map(method => (
                            <button
                                key={method}
                                onClick={() => setPaymentMethod(method)}
                                className={cn(
                                    "py-1.5 text-[10px] font-bold border rounded-lg transition-colors",
                                    paymentMethod === method
                                        ? "bg-indigo-600 border-indigo-600 text-white"
                                        : "bg-card border-border hover:bg-muted text-muted-foreground"
                                )}
                            >
                                {method}
                            </button>
                        ))}
                    </div>

                    {/* Checkout Triggers */}
                    <div className="flex gap-2 pt-1 border-t border-border/80">
                        <button
                            onClick={clearCart}
                            className="flex-1 py-2.5 border border-border hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 rounded-xl text-xs font-bold transition-all"
                        >
                            Clear Cart
                        </button>
                        <button
                            onClick={handleProcessCheckout}
                            disabled={cart.length === 0}
                            className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold active:scale-[98] disabled:opacity-50 disabled:pointer-events-none transition-all"
                        >
                            Generate Bill <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                </div>

            </div>

            {/* MODAL 1: Add New Customer inline */}
            {showNewCustModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/60 backdrop-blur-xs select-none">
                    <div className="fixed inset-0" onClick={() => setShowNewCustModal(false)} />
                    <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-5 overflow-hidden animate-in slide-in-from-bottom-3 duration-250">

                        <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
                            <h3 className="font-semibold text-sm">Register Merchant Suite Client</h3>
                            <button onClick={() => setShowNewCustModal(false)} className="p-1 text-muted-foreground hover:text-foreground">
                                <X className="w-4.5 h-4.5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
                            <div>
                                <label className="text-[10px] font-bold block mb-1">Customer / Client Name</label>
                                <input
                                    type="text"
                                    value={newCustName}
                                    onChange={(e) => setNewCustName(e.target.value)}
                                    placeholder="Alexander Rose"
                                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold block mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={newCustEmail}
                                        onChange={(e) => setNewCustEmail(e.target.value)}
                                        placeholder="alex@rose.com"
                                        className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold block mb-1">Telephone</label>
                                    <input
                                        type="text"
                                        value={newCustPhone}
                                        onChange={(e) => setNewCustPhone(e.target.value)}
                                        placeholder="(555) 0212"
                                        className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold block mb-1">Billing Address</label>
                                <textarea
                                    value={newCustAddress}
                                    onChange={(e) => setNewCustAddress(e.target.value)}
                                    placeholder="Address details..."
                                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none h-14 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold"
                            >
                                Register Customer
                            </button>
                        </form>

                    </div>
                </div>
            )}

            {/* Checkout Invoice Modal Preview */}
            {completedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/60 backdrop-blur-xs select-none">
                    <div className="fixed inset-0" onClick={() => setCompletedInvoice(null)} />
                    <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden p-6 animate-in slide-in-from-bottom-4 duration-300">

                        {/* Header */}
                        <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
                            <div>
                                <h3 className="font-display font-bold text-lg flex items-center gap-1.5">
                                    <CheckCircle2 className="w-5.5 h-5.5 text-emerald-500 animate-bounce" /> {completedInvoice.invoiceNo} Created
                                </h3>
                                <p className="text-[10px] text-muted-foreground mt-1">Transaction recorded successfully.</p>
                            </div>
                            <button onClick={() => setCompletedInvoice(null)} className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg">
                                <X className="w-4.5 h-4.5" />
                            </button>
                        </div>

                        {/* Print Area */}
                        <div id="invoice-print-area" className="space-y-4 text-xs">
                            <div className="flex justify-between">
                                <div>
                                    <h4 className="font-display font-extrabold text-base text-brand-600 dark:text-brand-500 flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4" /> Equinox Merchant
                                    </h4>
                                    <p className="text-muted-foreground text-[10px] mt-0.5">Corporate retail workspace &bull; CA</p>
                                    <p className="text-muted-foreground text-[9px] mt-1">GSTIN: 27AABCE1122D1Z1</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-muted-foreground text-[10px] font-semibold uppercase block mb-1">Details</span>
                                    <p className="font-bold">Total: ${completedInvoice.total}</p>
                                    <p className="text-muted-foreground">Method: {completedInvoice.paymentMethod}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                                <div>
                                    <span className="text-muted-foreground text-[9px] font-semibold uppercase block mb-1 font-bold">Store Operator</span>
                                    <p>Alexander Wright</p>
                                    <p className="text-muted-foreground">Admin ID: adm-01</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-[9px] font-semibold uppercase block mb-1 font-bold">Client</span>
                                    <p>{completedInvoice.customerName}</p>
                                    <p className="text-muted-foreground">Customer: {completedInvoice.customerId}</p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="border border-border rounded-xl overflow-hidden mt-4">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-muted text-[10px] uppercase font-bold text-muted-foreground border-b border-border">
                                            <th className="p-2.5">Item Name</th>
                                            <th className="p-2.5 text-center">Unit Price</th>
                                            <th className="p-2.5 text-center">Qty</th>
                                            <th className="p-2.5 text-right">Sum</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {completedInvoice.items.map((item, idx) => (
                                            <tr key={idx} className="border-b last:border-0 border-border/80">
                                                <td className="p-2.5 font-medium">{item.name}</td>
                                                <td className="p-2.5 text-center">${item.price}</td>
                                                <td className="p-2.5 text-center">{item.quantity}</td>
                                                <td className="p-2.5 text-right font-bold">${item.price * item.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Tax Calculations */}
                            <div className="flex flex-col items-end space-y-1.5 border-t border-border pt-4">
                                <div className="flex justify-between w-48 text-[11px]">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-semibold">${completedInvoice.subtotal}</span>
                                </div>
                                {completedInvoice.discount > 0 && (
                                    <div className="flex justify-between w-48 text-[11px] text-rose-500">
                                        <span>Discount</span>
                                        <span>-${completedInvoice.discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between w-48 text-[11px]">
                                    <span className="text-muted-foreground">GST ({taxPercent}%)</span>
                                    <span className="font-semibold">${completedInvoice.tax}</span>
                                </div>
                                <div className="flex justify-between w-48 font-bold text-sm border-t border-border pt-1.5">
                                    <span>Grand Total</span>
                                    <span className="text-brand-600 dark:text-brand-500">${completedInvoice.total}</span>
                                </div>
                            </div>
                        </div>

                        {/* Print and Download Triggers */}
                        <div className="mt-6 flex gap-2 justify-end no-print">
                            <button
                                onClick={() => window.print()}
                                className="px-4 py-2 border border-border hover:bg-muted text-xs font-semibold rounded-xl text-muted-foreground"
                            >
                                Print Invoice
                            </button>
                            <button
                                onClick={() => setCompletedInvoice(null)}
                                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl"
                            >
                                Accept Checkout
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default Billing;
