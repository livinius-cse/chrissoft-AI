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
    X,
    Calendar,
    Shield
} from 'lucide-react';
import { useApp, Product, Customer, Invoice } from '@/context/AppContext';
import { formatINR, calculateGSTBreakdown, numberToIndianWords } from '@/utils/currency';
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
        addCustomer,
        businessType,
        settings
    } = useApp();

    // Search/Filter states
    const [productSearch, setProductSearch] = useState('');
    const [barcodeSearch, setBarcodeSearch] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCat, setSelectedCat] = useState('All');

    // Tax / Adjustments states
    const [discountPercent, setDiscountPercent] = useState<number>(0);
    const [taxPercent, setTaxPercent] = useState<number>(18);
    const [isInterState, setIsInterState] = useState<boolean>(false);
    const [placeOfSupply, setPlaceOfSupply] = useState<string>('27 - Maharashtra (Intra-state)');
    const [customerGstin, setCustomerGstin] = useState<string>('');
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
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // 1. Calculations with authoritative GST engine
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const discountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
    const gstBreakdown = calculateGSTBreakdown(subtotal, {
        gstRate: taxPercent,
        discount: discountAmount,
        isInterState
    });
    const taxableAmount = gstBreakdown.netTaxableAmount;
    const taxAmount = gstBreakdown.totalTax;
    const total = gstBreakdown.grandTotal;

    // Categories list
    const categoriesList = ['All', ...new Set(products.map(p => p.category))];

    // Barcode / SKU Scanning simulator
    const handleBarcodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const barcodeTarget = barcodeSearch.trim();
        if (!barcodeTarget) return;

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

        addCustomer({
            name: newCustName,
            email: newCustEmail,
            phone: newCustPhone,
            address: newCustAddress || 'Commerce Suite Client'
        });

        toast.success(`Client "${newCustName}" registered.`);
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
    const handleProcessCheckout = async () => {
        if (cart.length === 0) {
            toast.error('Cannot proceed. The checkout cart is empty.');
            return;
        }

        setIsCheckingOut(true);
        try {
            const invoice = await checkout(paymentMethod, discountPercent, taxPercent, isInterState, placeOfSupply);
            toast.success(`Transaction Completed! Invoice ${invoice.invoiceNo} generated.`);
            setCompletedInvoice(invoice);

            setDiscountPercent(0);
            setOrderNotes('');
        } catch (err: any) {
            toast.error(err.message || 'Checkout failed.');
        } finally {
            setIsCheckingOut(false);
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
                            <ScanBarcode className="w-5 h-5 text-brand-400" />
                        </div>
                        <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-brand-600 dark:text-brand-400 cursor-pointer">
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
                                "px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 flex-shrink-0 cursor-pointer",
                                selectedCat === cat
                                    ? "bg-brand-600 border-brand-600 text-white shadow-sm font-semibold"
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
                                        : "bg-card border-border hover:border-brand-500 hover:shadow-md dark:hover:bg-brand-500/[0.02]"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl bg-muted/60 w-11 h-11 flex items-center justify-center rounded-xl group-hover:scale-105 transition-transform duration-200">{p.image}</span>
                                    <div className="text-right">
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-muted rounded font-bold">{p.sku}</span>
                                    </div>
                                </div>

                                <div className="mt-2.5">
                                    <h4 className="text-xs font-bold leading-snug group-hover:text-brand-500 transition-colors line-clamp-1">{p.name}</h4>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                        {p.brand && <span className="text-[9px] font-semibold text-brand-400">{p.brand}</span>}
                                        {p.batchNumber && <span className="text-[9px] text-muted-foreground font-mono">B:{p.batchNumber}</span>}
                                        {p.size && <span className="text-[9px] text-muted-foreground">Sz:{p.size}</span>}
                                    </div>
                                </div>

                                <div className="mt-2.5 flex items-center justify-between border-t border-border/60 pt-2">
                                    <span className="text-xs font-bold text-foreground">{formatINR(p.price)}</span>
                                    <span className={cn(
                                        "text-[10px] font-semibold",
                                        p.stock <= p.minStock ? 'text-amber-500' : 'text-emerald-500'
                                    )}>
                                        {p.stock} left
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
                            className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline cursor-pointer"
                        >
                            <UserPlus className="w-3.5 h-3.5" /> Register Client
                        </button>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                            className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-xs text-left text-foreground hover:bg-muted cursor-pointer"
                        >
                            <span>{currentCustomer ? `${currentCustomer.name} (${currentCustomer.phone})` : 'Walk-in Customer'}</span>
                            <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400">Change</span>
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
                                            className="w-full px-2.5 py-2 text-xs hover:bg-muted rounded-lg text-left cursor-pointer"
                                        >
                                            Walk-in Customer
                                        </button>
                                        {filteredCustomers.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => { setCurrentCustomer(c); setShowCustomerDropdown(false); }}
                                                className="w-full flex justify-between items-center px-2.5 py-2 text-xs hover:bg-muted rounded-lg text-left cursor-pointer"
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
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatINR(item.product.price)} each</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                {/* Quantity adjustments */}
                                <div className="flex items-center border border-border rounded-lg bg-muted p-0.5">
                                    <button
                                        onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                                        className="w-5 h-5 flex items-center justify-center font-bold text-xs hover:bg-card rounded cursor-pointer"
                                    >
                                        -
                                    </button>
                                    <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                                    <button
                                        onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                                        className="w-5 h-5 flex items-center justify-center font-bold text-xs hover:bg-card rounded cursor-pointer"
                                    >
                                        +
                                    </button>
                                </div>

                                <span className="text-xs font-bold w-16 text-right">{formatINR(item.product.price * item.quantity)}</span>

                                <button
                                    onClick={() => removeFromCart(item.product.id)}
                                    className="p-1 hover:bg-rose-500/10 text-rose-500 rounded-lg cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-2">
                            <ShoppingBag className="w-8 h-8 text-brand-400 opacity-60" />
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
                            className="px-3 py-1.5 bg-brand-500/15 text-brand-400 border border-brand-500/20 text-xs font-bold rounded-lg hover:bg-brand-500/25 cursor-pointer"
                        >
                            Apply
                        </button>
                    </div>

                    {/* Tax Supply Type & Rate Selector */}
                    <div className="space-y-2 border-b border-border/60 pb-2.5">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-muted-foreground">Supply Type</span>
                            <div className="flex rounded-lg border border-border p-0.5 bg-muted/40 text-[10px]">
                                <button
                                    type="button"
                                    onClick={() => setIsInterState(false)}
                                    className={cn(
                                        "px-2 py-0.5 rounded font-medium transition-all cursor-pointer",
                                        !isInterState ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Intra (CGST+SGST)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsInterState(true)}
                                    className={cn(
                                        "px-2 py-0.5 rounded font-medium transition-all cursor-pointer",
                                        isInterState ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Inter (IGST)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="space-y-1.5 text-xs text-muted-foreground border-b border-border/60 pb-2.5">
                        <div className="flex justify-between">
                            <span>Items Subtotal</span>
                            <span className="font-semibold text-foreground">{formatINR(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Discount</span>
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    value={discountPercent || ''}
                                    onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                                    className="w-8 bg-transparent text-right border-b border-border text-xs focus:outline-none select-all"
                                    placeholder="0"
                                />
                                <span>% (-{formatINR(discountAmount)})</span>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span>Taxable Value</span>
                            <span className="font-semibold text-foreground">{formatINR(taxableAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>GST Rate</span>
                            <select
                                value={taxPercent}
                                onChange={(e) => setTaxPercent(Number(e.target.value))}
                                className="bg-transparent font-medium border-b border-border text-xs focus:outline-none cursor-pointer"
                            >
                                <option value={18}>18% (Standard GST)</option>
                                <option value={12}>12% (Standard Low)</option>
                                <option value={5}>5% (Essential Goods)</option>
                                <option value={28}>28% (Luxury / Sin Goods)</option>
                                <option value={0}>0% (Exempt / Nil Rated)</option>
                            </select>
                        </div>
                        {taxPercent > 0 && !isInterState && (
                            <>
                                <div className="flex justify-between text-[11px] text-muted-foreground/90 pl-2">
                                    <span>CGST ({taxPercent / 2}%)</span>
                                    <span>+{formatINR(gstBreakdown.cgstAmount)}</span>
                                </div>
                                <div className="flex justify-between text-[11px] text-muted-foreground/90 pl-2">
                                    <span>SGST ({taxPercent / 2}%)</span>
                                    <span>+{formatINR(gstBreakdown.sgstAmount)}</span>
                                </div>
                            </>
                        )}
                        {taxPercent > 0 && isInterState && (
                            <div className="flex justify-between text-[11px] text-muted-foreground/90 pl-2">
                                <span>IGST ({taxPercent}%)</span>
                                <span>+{formatINR(gstBreakdown.igstAmount)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold">Total Payable</span>
                        <span className="text-base font-extrabold text-brand-500">{formatINR(total)}</span>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1.5">
                        {(['CARD', 'UPI', 'CASH'] as const).map(method => (
                            <button
                                key={method}
                                onClick={() => setPaymentMethod(method)}
                                className={cn(
                                    "py-1.5 text-[10px] font-bold border rounded-lg transition-colors cursor-pointer",
                                    paymentMethod === method
                                        ? "bg-brand-600 border-brand-600 text-white"
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
                            className="flex-1 py-2.5 border border-border hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                            Clear Cart
                        </button>
                        <button
                            onClick={handleProcessCheckout}
                            disabled={cart.length === 0 || isCheckingOut}
                            className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold active:scale-[98] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md cursor-pointer"
                        >
                            {isCheckingOut ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Generate Bill <ArrowRight className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    </div>

                </div>

            </div>

            {/* MODAL 1: Add New Customer inline */}
            {showNewCustModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none">
                    <div className="fixed inset-0" onClick={() => setShowNewCustModal(false)} />
                    <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-5 overflow-hidden animate-in slide-in-from-bottom-3 duration-250">

                        <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
                            <h3 className="font-semibold text-sm">Register Merchant Client</h3>
                            <button onClick={() => setShowNewCustModal(false)} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
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
                                        placeholder="+91 98765 43210"
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
                                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold cursor-pointer shadow-md"
                            >
                                Register Customer
                            </button>
                        </form>

                    </div>
                </div>
            )}

            {/* Checkout Invoice Modal Preview */}
            {completedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none">
                    <div className="fixed inset-0" onClick={() => setCompletedInvoice(null)} />
                    <div className="relative w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-6 animate-in slide-in-from-bottom-4 duration-300 max-h-[92vh] flex flex-col">

                        {/* Modal Header */}
                        <div className="flex justify-between items-start border-b border-border pb-3 mb-3 flex-shrink-0 no-print">
                            <div>
                                <h3 className="font-display font-bold text-base flex items-center gap-1.5">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-bounce" /> {completedInvoice.invoiceNo} Generated
                                </h3>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Authoritative GST Invoice &bull; Real-time POS checkout</p>
                            </div>
                            <button onClick={() => setCompletedInvoice(null)} className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg cursor-pointer">
                                <X className="w-4.5 h-4.5" />
                            </button>
                        </div>

                        {/* Print Area */}
                        <div id="invoice-print-area" className="space-y-3.5 text-xs overflow-y-auto pr-1 flex-1">
                            {/* Invoice Title & Seller Info */}
                            <div className="border border-border/80 rounded-xl p-3.5 bg-muted/20">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-[9px] uppercase font-bold text-brand-600 dark:text-brand-400 tracking-wider block mb-0.5">Tax Invoice / Bill of Supply</span>
                                        <h4 className="font-display font-extrabold text-base text-foreground flex items-center gap-1.5">
                                            <Sparkles className="w-4 h-4 text-brand-500" /> {settings?.businessName || 'ChrisSoft AI Enterprise'}
                                        </h4>
                                        <p className="text-muted-foreground text-[10px] mt-0.5">{businessType} Preset &bull; {settings?.address || 'Commerce Hub, Mumbai, MH 400001'}</p>
                                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground font-mono">
                                            <span>GSTIN: <strong className="text-foreground">{completedInvoice.gstin || settings?.gstin || '27AAAAA1111A1Z1'}</strong></span>
                                            {settings?.pan && <span>PAN: <strong className="text-foreground">{settings.pan}</strong></span>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="px-2 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-md text-[10px] font-bold font-mono">ORIGINAL FOR RECIPIENT</span>
                                        <p className="font-mono font-bold text-sm text-foreground mt-1.5">{completedInvoice.invoiceNo}</p>
                                        <p className="text-muted-foreground text-[10px]">{new Date(completedInvoice.createdAt).toLocaleString('en-IN')}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">Method: <strong className="text-foreground">{completedInvoice.paymentMethod}</strong></p>
                                    </div>
                                </div>
                            </div>

                            {/* Two-Column Parties & Supply Details */}
                            <div className="grid grid-cols-2 gap-3 text-[11px]">
                                <div className="border border-border/60 rounded-xl p-3 bg-card">
                                    <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider block mb-1">Billed To (Customer Details)</span>
                                    <p className="font-bold text-foreground text-xs">{completedInvoice.customerName}</p>
                                    <p className="text-muted-foreground text-[10px] mt-0.5">{completedInvoice.customerAddress || 'Client Account'}</p>
                                    <p className="text-muted-foreground text-[10px] mt-0.5">
                                        GSTIN: <span className="font-mono text-foreground font-medium">{completedInvoice.customerGstin || 'URP (Unregistered Person)'}</span>
                                    </p>
                                </div>

                                <div className="border border-border/60 rounded-xl p-3 bg-card">
                                    <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider block mb-1">Place of Supply & Tax Treatment</span>
                                    <p className="font-semibold text-foreground text-xs">{completedInvoice.placeOfSupply || '27 - Maharashtra (Intra-state)'}</p>
                                    <p className="text-muted-foreground text-[10px] mt-0.5">
                                        Tax Supply Type: <strong className="text-foreground">{completedInvoice.isInterState ? 'Inter-state (IGST)' : 'Intra-state (CGST + SGST)'}</strong>
                                    </p>
                                    <p className="text-muted-foreground text-[10px] mt-0.5">Reverse Charge: <span className="text-foreground">No</span></p>
                                </div>
                            </div>

                            {/* Itemized Table */}
                            <div className="border border-border rounded-xl overflow-hidden">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-muted text-[10px] uppercase font-bold text-muted-foreground border-b border-border">
                                            <th className="p-2.5">Item Description</th>
                                            <th className="p-2.5 text-center font-mono">HSN/SAC</th>
                                            <th className="p-2.5 text-center">Unit Price</th>
                                            <th className="p-2.5 text-center">Qty</th>
                                            <th className="p-2.5 text-right">Taxable Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {completedInvoice.items.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-muted/20">
                                                <td className="p-2.5 font-medium">
                                                    <span className="text-foreground font-semibold">{item.name}</span>
                                                    <div className="flex gap-2 text-[9px] text-muted-foreground font-mono mt-0.5">
                                                        {item.batchNumber && <span>Batch: {item.batchNumber}</span>}
                                                        {item.serialNumber && <span>Serial: {item.serialNumber}</span>}
                                                        {item.unitOfMeasure && <span>UOM: {item.unitOfMeasure}</span>}
                                                    </div>
                                                </td>
                                                <td className="p-2.5 text-center font-mono text-muted-foreground text-[11px]">{item.hsnCode || '8471'}</td>
                                                <td className="p-2.5 text-center text-muted-foreground">{formatINR(item.price)}</td>
                                                <td className="p-2.5 text-center font-medium">{item.quantity}</td>
                                                <td className="p-2.5 text-right font-bold text-foreground">{formatINR(item.price * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Financial Reconciliation & Tax Summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-3">
                                {/* Amount in Words */}
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-[9px] font-bold uppercase text-muted-foreground block mb-0.5">Amount Chargeable in Words</span>
                                        <p className="text-xs font-semibold text-foreground italic border-l-2 border-brand-500 pl-2 py-1 bg-muted/30 rounded-r-lg">
                                            {completedInvoice.amountInWords || numberToIndianWords(completedInvoice.total)}
                                        </p>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-2">
                                        {settings?.receiptFooter || 'Thank you for choosing ChrisSoft AI Enterprise Platform.'}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground/70">
                                        Computer generated tax invoice. Subject to local jurisdiction.
                                    </p>
                                </div>

                                {/* Financial Calculations Sub-table */}
                                <div className="flex flex-col items-end space-y-1.5 text-xs">
                                    <div className="flex justify-between w-64 text-[11px]">
                                        <span className="text-muted-foreground">Items Subtotal</span>
                                        <span className="font-semibold text-foreground">{formatINR(completedInvoice.subtotal)}</span>
                                    </div>
                                    {completedInvoice.discount > 0 && (
                                        <div className="flex justify-between w-64 text-[11px] text-rose-500">
                                            <span>Trade Discount {completedInvoice.discountPercent ? `(${completedInvoice.discountPercent}%)` : ''}</span>
                                            <span>-{formatINR(completedInvoice.discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between w-64 text-[11px] border-t border-border/60 pt-1">
                                        <span className="text-muted-foreground">Net Taxable Amount</span>
                                        <span className="font-semibold text-foreground">{formatINR(completedInvoice.taxableAmount ?? (completedInvoice.subtotal - completedInvoice.discount))}</span>
                                    </div>

                                    {/* Dual CGST + SGST or IGST */}
                                    {!completedInvoice.isInterState ? (
                                        <>
                                            <div className="flex justify-between w-64 text-[11px] text-muted-foreground">
                                                <span>Central GST (CGST {(completedInvoice.taxRate ?? 18) / 2}%)</span>
                                                <span className="font-medium text-foreground">{formatINR(completedInvoice.cgst ?? (completedInvoice.tax / 2))}</span>
                                            </div>
                                            <div className="flex justify-between w-64 text-[11px] text-muted-foreground">
                                                <span>State GST (SGST {(completedInvoice.taxRate ?? 18) / 2}%)</span>
                                                <span className="font-medium text-foreground">{formatINR(completedInvoice.sgst ?? (completedInvoice.tax / 2))}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex justify-between w-64 text-[11px] text-muted-foreground">
                                            <span>Integrated GST (IGST {completedInvoice.taxRate ?? 18}%)</span>
                                            <span className="font-medium text-foreground">{formatINR(completedInvoice.igst ?? completedInvoice.tax)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between w-64 text-[11px] text-muted-foreground">
                                        <span>Total GST</span>
                                        <span className="font-semibold text-foreground">{formatINR(completedInvoice.tax)}</span>
                                    </div>

                                    <div className="flex justify-between w-64 font-bold text-sm border-t border-border pt-1.5">
                                        <span className="text-foreground">Grand Total (INR)</span>
                                        <span className="text-brand-500 font-extrabold">{formatINR(completedInvoice.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="mt-4 pt-3 border-t border-border flex gap-2 justify-end no-print flex-shrink-0">
                            <button
                                onClick={() => window.print()}
                                className="px-4 py-2 border border-border hover:bg-muted text-xs font-semibold rounded-xl text-muted-foreground cursor-pointer flex items-center gap-1.5"
                            >
                                <Printer className="w-3.5 h-3.5" /> Print Tax Invoice
                            </button>
                            <button
                                onClick={() => setCompletedInvoice(null)}
                                className="px-4 py-2 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-md"
                            >
                                Done
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default Billing;
