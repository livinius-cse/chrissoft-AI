import React, { useState, useRef } from 'react';
import { cn } from '@/utils/cn';
import {
    TrendingUp,
    TrendingDown,
    IndianRupee,
    ShoppingCart,
    Users,
    AlertTriangle,
    ArrowRight,
    Plus,
    RefreshCw,
    Clock,
    Sparkles,
    CreditCard,
    ShieldCheck,
    X as XIcon
} from 'lucide-react';
import { useApp, Product, Invoice } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/utils/currency';
import { useStaggerEntrance } from '@/hooks/useGsapMotion';
import { ThreeBusinessToken } from '@/components/3d/ThreeBusinessToken';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
    const { invoices, products, activities, restockProduct, customers } = useApp();
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);

    // Apply GSAP staggered entrance on cards and widgets
    useStaggerEntrance(containerRef, '.gsap-stagger-item', [invoices.length, products.length]);

    // Selected Stock Restock State
    const [restockingId, setRestockingId] = useState<string | null>(null);
    const [restockQty, setRestockQty] = useState(10);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    // 1. Calculations
    const revenueTotal = invoices.reduce((acc, inv) => acc + inv.total, 0);
    // Cost analysis (Admin-only metric)
    const monthlyProfitTotal = invoices.reduce((acc, inv) => {
        const profit = inv.items.reduce((itemAcc, item) => {
            const prod = products.find(p => p.id === item.productId);
            const cost = prod ? (prod.cost || 0) : item.price * 0.6;
            return itemAcc + (item.price - cost) * item.quantity;
        }, 0);
        return acc + profit - inv.discount;
    }, 0);

    const pendingPayments = customers.reduce((acc, c) => acc + c.balance, 0);
    const totalOrders = invoices.length;
    const activeCustomersCount = customers.length;

    // 2. Alert criteria: stock <= minStock
    const stockAlerts = products.filter(p => p.stock <= p.minStock).slice(0, 5);

    // 3. Recharts chart data (Mock weekly points)
    const salesChartData = [
        { name: 'Mon', Sales: 24000, Profit: 11000 },
        { name: 'Tue', Sales: 18900, Profit: 9800 },
        { name: 'Wed', Sales: 32000, Profit: 15400 },
        { name: 'Thu', Sales: 27800, Profit: 12000 },
        { name: 'Fri', Sales: 48900, Profit: 23000 },
        { name: 'Sat', Sales: 38900, Profit: 19000 },
        { name: 'Sun', Sales: 52000, Profit: 28000 },
    ];

    // Category shares
    const categories = products.reduce((acc: { [key: string]: number }, p) => {
        acc[p.category] = (acc[p.category] || 0) + p.stock;
        return acc;
    }, {});

    const pieData = (Object.entries(categories) as [string, number][]).map(([name, value]) => ({ name, value }));
    const COLORS = ['#ff6b00', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];

    const handleRestock = (productId: string) => {
        restockProduct(productId, restockQty);
        toast.success(`Successfully restocked product by ${restockQty} units.`);
        setRestockingId(null);
    };

    return (
        <div ref={containerRef} className="space-y-6">

            {/* 3D Hero Banner Row */}
            <div className="gsap-stagger-item relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-slate-900/90 to-brand-950/40 border border-border shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block">
                            <ThreeBusinessToken size={90} badgeText="ChrisSoft AI" className="drop-shadow-lg" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-display text-2xl font-bold tracking-tight text-white">
                                    Welcome, {user?.name || 'Manager'}
                                </h1>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                                    {isAdmin ? 'ADMIN CONSOLE' : 'STAFF TERMINAL'}
                                </span>
                            </div>
                            <p className="text-slate-400 text-xs mt-1">
                                Real-time 3D telemetry for merchant operations, Indian GST invoicing &amp; inventory tracking.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/billing')}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
                        >
                            <Plus className="w-4 h-4" /> Open POS Terminal
                        </button>
                    </div>
                </div>
            </div>

            {/* 4 Beautiful KPI Cards with GSAP Stagger Entrance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Revenue */}
                <div className="gsap-stagger-item bg-card border border-border p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-brand-500/40 card-blur-glow">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Gross Revenue</span>
                        <div className="p-2 bg-brand-50 dark:bg-brand-500/10 rounded-xl text-brand-600 dark:text-brand-400">
                            <IndianRupee className="w-4.5 h-4.5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-bold tracking-tight">{formatINR(revenueTotal)}</h3>
                        <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold mt-1">
                            <TrendingUp className="w-3.5 h-3.5" /> +14.2% from last week
                        </span>
                    </div>
                </div>

                {/* Card 2: Today's Orders */}
                <div className="gsap-stagger-item bg-card border border-border p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-brand-500/40 card-blur-glow">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Invoices Issued</span>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <ShoppingCart className="w-4.5 h-4.5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-bold tracking-tight">{totalOrders}</h3>
                        <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold mt-1">
                            <TrendingUp className="w-3.5 h-3.5" /> +8.3% vs yesterday
                        </span>
                    </div>
                </div>

                {/* Card 3: Monthly Net Profit (Admin vs Staff) */}
                <div className="gsap-stagger-item bg-card border border-border p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-brand-500/40 card-blur-glow">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Estimated Profit</span>
                        <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                            <Sparkles className="w-4.5 h-4.5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-bold tracking-tight">
                            {isAdmin ? formatINR(monthlyProfitTotal) : '🔒 Admin Only'}
                        </h3>
                        <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold mt-1">
                            {isAdmin ? (
                                <>
                                    <TrendingUp className="w-3.5 h-3.5" /> +18.4% margin rate
                                </>
                            ) : (
                                <span className="text-muted-foreground text-[10px]">Restricted for Staff</span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Card 4: Receivable / Customer Balance */}
                <div className="gsap-stagger-item bg-card border border-border p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-brand-500/40 card-blur-glow">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Receivables Balance</span>
                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                            <Users className="w-4.5 h-4.5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-bold tracking-tight">{formatINR(pendingPayments)}</h3>
                        <span className="flex items-center gap-1 text-[11px] text-rose-500 font-semibold mt-1">
                            <TrendingDown className="w-3.5 h-3.5" /> Credit limits active
                        </span>
                    </div>
                </div>
            </div>

            {/* Visual Analytics Graphs block */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Sales Chart Area */}
                <div className="gsap-stagger-item lg:col-span-8 bg-card border border-border rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-sm">Revenue Forecast Analytics</h3>
                            <p className="text-muted-foreground text-[11px]">Dynamic progression showing gross sales vs estimated margins.</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 text-brand-600 dark:text-brand-500 text-[10px] font-semibold rounded-lg">Weekly</span>
                        </div>
                    </div>

                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: '#334155', borderRadius: '12px' }}
                                    labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="Sales" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                                <Area type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Share Donut Chart */}
                <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <h3 className="font-semibold text-sm">Stock Distribution</h3>
                        <p className="text-muted-foreground text-[11px] mb-4">Breakdown of inventory counts by categories.</p>
                    </div>

                    <div className="h-[210px] w-full flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Summary Label */}
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Stock</span>
                            <span className="text-2xl font-bold">{products.reduce((acc, p) => acc + p.stock, 0)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {pieData.map((item, idx) => (
                            <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                <span className="truncate">{item.name} ({item.value})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid: Alerts, Timeline, and Invoices */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Side: Stock Alerts and Today Invoices */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Low Stock Warning Panel */}
                    <div className="bg-card border border-border rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
                                <h3 className="font-semibold text-sm">Low Inventory Stock Audits</h3>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full">
                                {stockAlerts.length} items warning
                            </span>
                        </div>

                        <div className="divide-y divide-border/60">
                            {stockAlerts.map(p => (
                                <div key={p.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{p.image}</span>
                                        <div>
                                            <h4 className="text-xs font-semibold">{p.name}</h4>
                                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">SKU: {p.sku} &bull; Margin: {Math.round((p.price - p.cost) / p.price * 100)}%</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-rose-500">{p.stock} left</p>
                                            <p className="text-[9px] text-muted-foreground">Min standard: {p.minStock}</p>
                                        </div>
                                        {restockingId === p.id ? (
                                            <div className="flex items-center border border-border rounded-lg bg-muted p-0.5">
                                                <input
                                                    type="number"
                                                    value={restockQty}
                                                    onChange={(e) => setRestockQty(Number(e.target.value))}
                                                    className="w-10 bg-transparent text-center text-xs font-semibold focus:outline-none"
                                                />
                                                <button
                                                    onClick={() => handleRestock(p.id)}
                                                    className="px-2 py-1 bg-brand-600 text-white rounded text-[10px] font-medium"
                                                >
                                                    Send
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setRestockingId(p.id); setRestockQty(p.minStock * 2); }}
                                                className="px-2.5 py-1.5 border border-border/80 hover:border-brand-500 hover:text-brand-500 rounded-lg text-[10px] font-bold transition-all text-muted-foreground"
                                            >
                                                Restock
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {stockAlerts.length === 0 && (
                                <div className="py-8 text-center text-xs text-muted-foreground">
                                    🎉 Excellent! All stock levels have healthy buffers.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Invoices list */}
                    <div className="bg-card border border-border rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-sm">Recent POS Invoices</h3>
                            <button
                                onClick={() => navigate('/reports')}
                                className="text-xs text-brand-600 dark:text-brand-500 font-semibold hover:underline flex items-center gap-0.5"
                            >
                                Log Archive <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="divide-y divide-border/60">
                            {invoices.slice(0, 4).map(inv => (
                                <div key={inv.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold">{inv.invoiceNo}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full font-semibold">
                                                {inv.paymentStatus}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                            Client: {inv.customerName} &bull; {inv.items.length} items bought
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-foreground">{formatINR(inv.total)}</p>
                                            <p className="text-[9px] text-muted-foreground">{inv.paymentMethod}</p>
                                        </div>

                                        <button
                                            onClick={() => setSelectedInvoice(inv)}
                                            className="px-2.5 py-1.5 border border-border/80 hover:bg-muted rounded-lg text-[10px] font-bold text-muted-foreground cursor-pointer"
                                        >
                                            View
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Timeline activities */}
                <div className="gsap-stagger-item lg:col-span-5 bg-card border border-border rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-5 border-b border-border/60 pb-3">
                            <h3 className="font-semibold text-sm flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-indigo-400" /> Operational Feed
                            </h3>
                            <span className="text-[10px] text-muted-foreground">Live updates</span>
                        </div>

                        <div className="space-y-4">
                            {activities.slice(0, 5).map(act => (
                                <div key={act.id} className="flex gap-3 relative pb-1">
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={cn(
                                            "w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow-xs text-white",
                                            act.type === 'sale' ? 'bg-emerald-600' :
                                                act.type === 'stock' ? 'bg-amber-600' :
                                                    act.type === 'customer' ? 'bg-blue-600' : 'bg-slate-400'
                                        )}>
                                            {act.type === 'sale' ? '₹' : act.type === 'stock' ? '📦' : '👤'}
                                        </div>
                                        {/* Line connecter */}
                                        <div className="w-0.5 bg-border flex-1 mt-2 mb-1" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold">{act.title}</h4>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">{act.description}</p>
                                        <span className="text-[10px] text-muted-foreground/60 block mt-1.5">{act.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-border/60 pt-4 mt-6 text-center">
                        <button
                            onClick={() => navigate('/settings')}
                            className="text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center justify-center gap-1 mx-auto"
                        >
                            Audits Settings <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoice Modal Preview */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/60 backdrop-blur-xs select-none">
                    <div className="fixed inset-0" onClick={() => setSelectedInvoice(null)} />

                    <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden p-6 animate-in slide-in-from-bottom-4 duration-300">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
                            <div>
                                <h3 className="font-display font-bold text-lg">{selectedInvoice.invoiceNo}</h3>
                                <p className="text-[10px] text-muted-foreground mt-1">Generated: {new Date(selectedInvoice.createdAt).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Invoice Details */}
                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-muted-foreground text-[10px] font-semibold uppercase block mb-1">Company Details</span>
                                    <p className="font-bold">ChrisSoft AI Merchant Store</p>
                                    <p className="text-muted-foreground">GSTIN: 27AAAAA1111A1Z1</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-[10px] font-semibold uppercase block mb-1">Bill To Client</span>
                                    <p className="font-bold">{selectedInvoice.customerName}</p>
                                    <p className="text-muted-foreground">Customer ID: {selectedInvoice.customerId}</p>
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
                                        {selectedInvoice.items.map((item, idx) => (
                                            <tr key={idx} className="border-b last:border-0 border-border/80">
                                                <td className="p-2.5 font-medium">{item.name}</td>
                                                <td className="p-2.5 text-center">{formatINR(item.price)}</td>
                                                <td className="p-2.5 text-center">{item.quantity}</td>
                                                <td className="p-2.5 text-right font-bold">{formatINR(item.price * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Tax Calculations */}
                            <div className="flex flex-col items-end space-y-1.5 border-t border-border pt-4">
                                <div className="flex justify-between w-56 text-[11px]">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-semibold">{formatINR(selectedInvoice.subtotal)}</span>
                                </div>
                                {selectedInvoice.discount > 0 && (
                                    <div className="flex justify-between w-56 text-[11px] text-rose-500">
                                        <span>Discount</span>
                                        <span>-{formatINR(selectedInvoice.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between w-56 text-[11px]">
                                    <span className="text-muted-foreground">GST</span>
                                    <span className="font-semibold">{formatINR(selectedInvoice.tax)}</span>
                                </div>
                                <div className="flex justify-between w-56 font-bold text-sm border-t border-border pt-1.5">
                                    <span>Grand Total</span>
                                    <span className="text-brand-600 dark:text-brand-500">{formatINR(selectedInvoice.total)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-2 justify-end no-print">
                            <button
                                onClick={() => window.print()}
                                className="px-4 py-2 border border-border hover:bg-muted text-xs font-semibold rounded-xl text-muted-foreground"
                            >
                                Print Invoice
                            </button>
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white xs font-semibold rounded-xl"
                            >
                                Acknowledge
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;

