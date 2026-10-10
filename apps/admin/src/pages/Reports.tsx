import React, { useState, useMemo } from 'react';
import {
    FileText,
    Download,
    Filter,
    Search,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Receipt,
    Calendar,
    ChevronDown,
    Eye,
    Printer,
    CheckCircle,
    Clock,
    AlertCircle,
    X
} from 'lucide-react';
import { useApp, Invoice } from '@/context/AppContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell
} from 'recharts';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';
import { formatINR } from '@/utils/currency';

// ─── GST Calculation helpers ────────────────────────────────────────────────
const GST_RATE = 0.18;
const CGST_RATE = GST_RATE / 2;
const SGST_RATE = GST_RATE / 2;

const formatCurrency = (amount: number) => formatINR(amount);

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const Reports: React.FC = () => {
    const { invoices, products, customers } = useApp();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [methodFilter, setMethodFilter] = useState<string>('ALL');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    // ── Stats ──────────────────────────────────────────────────────────────
    const totalRevenue = invoices.reduce((acc, i) => acc + i.total, 0);
    const totalTax = invoices.reduce((acc, i) => acc + i.tax, 0);
    const totalDiscount = invoices.reduce((acc, i) => acc + i.discount, 0);
    const avgOrderValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

    // ── Monthly bar chart data ─────────────────────────────────────────────
    const monthlyData = useMemo(() => {
        const map: Record<number, { Revenue: number; Tax: number; count: number }> = {};
        invoices.forEach(inv => {
            const month = new Date(inv.createdAt).getMonth();
            if (!map[month]) map[month] = { Revenue: 0, Tax: 0, count: 0 };
            map[month].Revenue += inv.total;
            map[month].Tax += inv.tax;
            map[month].count += 1;
        });
        return monthNames.map((name, idx) => ({
            name,
            Revenue: Math.round(map[idx]?.Revenue || 0),
            Tax: Math.round(map[idx]?.Tax || 0),
        }));
    }, [invoices]);

    // ── GST Summary per invoice ────────────────────────────────────────────
    const gstSummary = invoices.map(inv => ({
        invoiceNo: inv.invoiceNo,
        taxableAmount: inv.subtotal - inv.discount,
        cgst: Math.round((inv.tax * CGST_RATE / GST_RATE) * 100) / 100,
        sgst: Math.round((inv.tax * SGST_RATE / GST_RATE) * 100) / 100,
        totalGST: inv.tax,
        grandTotal: inv.total,
    }));

    const totalCGST = gstSummary.reduce((acc, g) => acc + g.cgst, 0);
    const totalSGST = gstSummary.reduce((acc, g) => acc + g.sgst, 0);
    const totalGSTPaid = totalCGST + totalSGST;

    // ── Payment Method Distribution ────────────────────────────────────────
    const methodDist = invoices.reduce((acc: Record<string, number>, inv) => {
        acc[inv.paymentMethod] = (acc[inv.paymentMethod] || 0) + 1;
        return acc;
    }, {});
    const methodColors: Record<string, string> = { CASH: '#10b981', CARD: '#6366f1', UPI: '#f59e0b' };

    // ── Filtered invoices list ─────────────────────────────────────────────
    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            const matchSearch =
                inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === 'ALL' || inv.paymentStatus === statusFilter;
            const matchMethod = methodFilter === 'ALL' || inv.paymentMethod === methodFilter;
            return matchSearch && matchStatus && matchMethod;
        });
    }, [invoices, searchQuery, statusFilter, methodFilter]);

    const handleExportCSV = () => {
        const header = ['Invoice No', 'Customer', 'Date', 'Subtotal', 'Discount', 'GST', 'Total', 'Method', 'Status'];
        const rows = filteredInvoices.map(inv => [
            inv.invoiceNo,
            inv.customerName,
            new Date(inv.createdAt).toLocaleDateString(),
            inv.subtotal,
            inv.discount,
            inv.tax,
            inv.total,
            inv.paymentMethod,
            inv.paymentStatus,
        ]);
        const csv = [header, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'equinox_invoices.csv';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Invoice report exported as CSV.');
    };

    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight">Reports & GST Filing</h1>
                    <p className="text-muted-foreground text-xs mt-1">Invoice ledger, tax summaries, and financial performance overviews.</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition-all"
                >
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: formatCurrency(totalRevenue), sub: `${invoices.length} invoices`, icon: DollarSign, color: 'indigo', trend: '+14.2%' },
                    { label: 'GST Collected', value: formatCurrency(totalGSTPaid), sub: `CGST: ${formatCurrency(totalCGST)}`, icon: Receipt, color: 'emerald', trend: '+11.5%' },
                    { label: 'Total Discounts', value: formatCurrency(totalDiscount), sub: 'Applied across orders', icon: TrendingDown, color: 'rose', trend: '' },
                    { label: 'Avg Order Value', value: formatCurrency(avgOrderValue), sub: 'Per invoice average', icon: TrendingUp, color: 'amber', trend: '+6.8%' },
                ].map(card => (
                    <div key={card.label} className="bg-card border border-border p-5 rounded-2xl transition-all duration-300 hover:shadow-md card-blur-glow">
                        <div className="flex justify-between items-start">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</span>
                            <div className={`p-2 rounded-xl bg-${card.color}-50 dark:bg-${card.color}-500/10 text-${card.color}-600 dark:text-${card.color}-500`}>
                                <card.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-xl font-bold tracking-tight">{card.value}</h3>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-[11px] text-muted-foreground">{card.sub}</span>
                                {card.trend && (
                                    <span className="text-[10px] text-emerald-500 font-semibold">{card.trend}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Monthly Revenue Chart + Payment Method Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Monthly Revenue Chart */}
                <div className="lg:col-span-8 bg-card border border-border rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-sm">Monthly Revenue & Tax Overview</h3>
                            <p className="text-muted-foreground text-[11px]">12-month gross revenue vs. GST collected breakdown.</p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 text-brand-600 dark:text-brand-500 text-[10px] font-semibold rounded-lg">
                            FY 2026
                        </span>
                    </div>
                    <div className="h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: '#334155', borderRadius: '12px' }}
                                    labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                                    formatter={(value: number) => [formatINR(value), '']}
                                />
                                <Bar dataKey="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                <Bar dataKey="Tax" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" /> Revenue</span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> GST Collected</span>
                    </div>
                </div>

                {/* Payment Method Distribution */}
                <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
                    <h3 className="font-semibold text-sm mb-1">Payment Methods</h3>
                    <p className="text-muted-foreground text-[11px] mb-5">Distribution of settlement modes.</p>

                    <div className="space-y-4">
                        {(Object.entries(methodDist) as [string, number][]).map(([method, count]) => {
                            const pct = Math.round((count / invoices.length) * 100);
                            return (
                                <div key={method}>
                                    <div className="flex justify-between text-xs font-medium mb-1.5">
                                        <span>{method}</span>
                                        <span className="text-muted-foreground">{count} orders ({pct}%)</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%`, backgroundColor: methodColors[method] || '#6366f1' }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {invoices.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-8">No invoices yet.</p>
                        )}
                    </div>

                    {/* GST Summary Card at bottom */}
                    <div className="mt-6 bg-gradient-to-br from-brand-500/5 to-indigo-500/5 border border-brand-200/30 dark:border-brand-500/20 rounded-xl p-4 space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">GST Summary (18%)</h4>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">CGST (9%)</span>
                            <span className="font-semibold">{formatCurrency(totalCGST)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">SGST (9%)</span>
                            <span className="font-semibold">{formatCurrency(totalSGST)}</span>
                        </div>
                        <div className="flex justify-between text-xs border-t border-border pt-2 font-bold">
                            <span>Total GST Payable</span>
                            <span className="text-brand-600 dark:text-brand-500">{formatCurrency(totalGSTPaid)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice Ledger Table */}
            <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
                <div className="p-5 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                            <FileText className="w-4 h-4 text-brand-500" />
                            Invoice Ledger
                        </h3>
                        <p className="text-muted-foreground text-[11px] mt-0.5">{filteredInvoices.length} records matched.</p>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-1.5 text-xs border border-border rounded-lg bg-muted/50 focus:outline-none focus:border-brand-400 w-36"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-muted/50 focus:outline-none focus:border-brand-400"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PAID">Paid</option>
                            <option value="DRAFT">Draft</option>
                            <option value="UNPAID">Unpaid</option>
                        </select>

                        <select
                            value={methodFilter}
                            onChange={e => setMethodFilter(e.target.value)}
                            className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-muted/50 focus:outline-none focus:border-brand-400"
                        >
                            <option value="ALL">All Methods</option>
                            <option value="CASH">Cash</option>
                            <option value="CARD">Card</option>
                            <option value="UPI">UPI</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                                <th className="px-5 py-3">Invoice No</th>
                                <th className="px-5 py-3">Customer</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3 text-right">Subtotal</th>
                                <th className="px-5 py-3 text-right">GST</th>
                                <th className="px-5 py-3 text-right">Total</th>
                                <th className="px-5 py-3">Method</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-muted-foreground text-xs">
                                        No invoices matched your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map(inv => (
                                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-5 py-3.5 font-mono font-semibold text-brand-600 dark:text-brand-500">{inv.invoiceNo}</td>
                                        <td className="px-5 py-3.5 font-medium">{inv.customerName}</td>
                                        <td className="px-5 py-3.5 text-muted-foreground">
                                            {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">{formatCurrency(inv.subtotal)}</td>
                                        <td className="px-5 py-3.5 text-right text-muted-foreground">{formatCurrency(inv.tax)}</td>
                                        <td className="px-5 py-3.5 text-right font-bold">{formatCurrency(inv.total)}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                                inv.paymentMethod === 'CASH' ? 'bg-emerald-500/10 text-emerald-600' :
                                                    inv.paymentMethod === 'CARD' ? 'bg-indigo-500/10 text-indigo-600' :
                                                        'bg-amber-500/10 text-amber-600'
                                            )}>
                                                {inv.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={cn(
                                                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit",
                                                inv.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-600' :
                                                    inv.paymentStatus === 'DRAFT' ? 'bg-slate-500/10 text-slate-500' :
                                                        'bg-rose-500/10 text-rose-500'
                                            )}>
                                                {inv.paymentStatus === 'PAID' ? <CheckCircle className="w-2.5 h-2.5" /> :
                                                    inv.paymentStatus === 'DRAFT' ? <Clock className="w-2.5 h-2.5" /> :
                                                        <AlertCircle className="w-2.5 h-2.5" />}
                                                {inv.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <button
                                                    onClick={() => setSelectedInvoice(inv)}
                                                    className="p-1.5 border border-border hover:bg-muted hover:border-brand-400 hover:text-brand-500 rounded-lg transition-all"
                                                    title="View Invoice"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedInvoice(inv); setTimeout(() => window.print(), 200); }}
                                                    className="p-1.5 border border-border hover:bg-muted rounded-lg transition-all"
                                                    title="Print Invoice"
                                                >
                                                    <Printer className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Footer summary row */}
                    {filteredInvoices.length > 0 && (
                        <div className="flex items-center justify-between px-5 py-3.5 bg-muted/20 border-t border-border text-xs font-semibold">
                            <span className="text-muted-foreground">{filteredInvoices.length} invoices shown</span>
                            <div className="flex items-center gap-6">
                                <span>GST Total: <span className="text-foreground">{formatCurrency(filteredInvoices.reduce((acc, i) => acc + i.tax, 0))}</span></span>
                                <span>Grand Total: <span className="text-brand-600 dark:text-brand-500">{formatCurrency(filteredInvoices.reduce((acc, i) => acc + i.total, 0))}</span></span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Invoice Detail Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/60 backdrop-blur-xs">
                    <div className="fixed inset-0" onClick={() => setSelectedInvoice(null)} />
                    <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden p-6 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
                            <div>
                                <h3 className="font-display font-bold text-lg">{selectedInvoice.invoiceNo}</h3>
                                <p className="text-[10px] text-muted-foreground mt-1">Generated: {new Date(selectedInvoice.createdAt).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setSelectedInvoice(null)} className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-muted-foreground text-[10px] font-semibold uppercase block mb-1">Company Details</span>
                                    <p className="font-bold">Equinox Merchant Store</p>
                                    <p className="text-muted-foreground">GSTIN: 27AAAAA1111A1Z1</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-[10px] font-semibold uppercase block mb-1">Bill To</span>
                                    <p className="font-bold">{selectedInvoice.customerName}</p>
                                    <p className="text-muted-foreground">ID: {selectedInvoice.customerId}</p>
                                </div>
                            </div>

                            <div className="border border-border rounded-xl overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-muted text-[10px] uppercase font-bold text-muted-foreground border-b border-border">
                                            <th className="p-2.5">Item</th>
                                            <th className="p-2.5 text-center">Price</th>
                                            <th className="p-2.5 text-center">Qty</th>
                                            <th className="p-2.5 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedInvoice.items.map((item, idx) => (
                                            <tr key={idx} className="border-b last:border-0 border-border/80">
                                                <td className="p-2.5 font-medium">{item.name}</td>
                                                <td className="p-2.5 text-center">{formatCurrency(item.price)}</td>
                                                <td className="p-2.5 text-center">{item.quantity}</td>
                                                <td className="p-2.5 text-right font-bold">{formatCurrency(item.price * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col items-end space-y-1.5 border-t border-border pt-4">
                                <div className="flex justify-between w-48 text-[11px]">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-semibold">{formatCurrency(selectedInvoice.subtotal)}</span>
                                </div>
                                {selectedInvoice.discount > 0 && (
                                    <div className="flex justify-between w-48 text-[11px] text-rose-500">
                                        <span>Discount</span>
                                        <span>-{formatCurrency(selectedInvoice.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between w-48 text-[11px]">
                                    <span className="text-muted-foreground">CGST (9%)</span>
                                    <span className="font-semibold">{formatCurrency(selectedInvoice.tax / 2)}</span>
                                </div>
                                <div className="flex justify-between w-48 text-[11px]">
                                    <span className="text-muted-foreground">SGST (9%)</span>
                                    <span className="font-semibold">{formatCurrency(selectedInvoice.tax / 2)}</span>
                                </div>
                                <div className="flex justify-between w-48 font-bold text-sm border-t border-border pt-1.5">
                                    <span>Grand Total</span>
                                    <span className="text-brand-600 dark:text-brand-500">{formatCurrency(selectedInvoice.total)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-2 justify-end">
                            <button
                                onClick={() => window.print()}
                                className="px-4 py-2 border border-border hover:bg-muted text-xs font-semibold rounded-xl text-muted-foreground"
                            >
                                Print Invoice
                            </button>
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
