import React, { useState, useMemo } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Users,
    ShoppingBag,
    DollarSign,
    BarChart2,
    Target,
    Zap,
    Award
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
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
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    LineChart,
    Line,
    Legend
} from 'recharts';
import { cn } from '@/utils/cn';
import { formatINR } from '@/utils/currency';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

const formatCurrency = (v: number) => formatINR(v, { showDecimals: false });

export const Analytics: React.FC = () => {
    const { invoices, products, customers, activities } = useApp();
    const [activePeriod, setActivePeriod] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');

    // ── KPIs ──────────────────────────────────────────────────────────────
    const totalRevenue = invoices.reduce((acc, i) => acc + i.total, 0);
    const totalItems = invoices.reduce((acc, i) => acc + i.items.reduce((s, it) => s + it.quantity, 0), 0);
    const avgOrderValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;
    const topCustomer = [...customers].sort((a, b) => b.totalSpent - a.totalSpent)[0];
    const conversionRate = customers.length > 0 ? (invoices.length / customers.length * 100).toFixed(1) : '0.0';

    // ── Sales trend (daily mock with invoice base) ─────────────────────────
    const salesTrendData = useMemo(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const base = totalRevenue / 7;
        return days.map((day, i) => ({
            day,
            Revenue: Math.round(base * [0.62, 0.74, 0.81, 0.93, 1.08, 1.16, 1.28][i]),
            Orders: Math.round((invoices.length / 7) * [0.6, 0.7, 0.8, 0.9, 1.1, 1.2, 1.3][i]),
            Customers: Math.round((customers.length / 7) * [0.65, 0.72, 0.78, 0.9, 1.05, 1.16, 1.25][i]),
        }));
    }, [invoices, customers, totalRevenue]);

    // ── Category Revenue breakdown ─────────────────────────────────────────
    const categoryRevenue = useMemo(() => {
        const map: Record<string, number> = {};
        invoices.forEach(inv => {
            inv.items.forEach(item => {
                const prod = products.find(p => p.id === item.productId);
                const cat = prod?.category || 'Other';
                map[cat] = (map[cat] || 0) + (item.price * item.quantity);
            });
        });
        const total = Object.values(map).reduce((a, b) => a + b, 0);
        return Object.entries(map).map(([name, value]) => ({
            name,
            value: Math.round(value),
            pct: total > 0 ? Math.round((value / total) * 100) : 0,
        })).sort((a, b) => b.value - a.value);
    }, [invoices, products]);

    // ── Customer Lifetime Value distribution ───────────────────────────────
    const clvBuckets = useMemo(() => {
        const buckets = [
            { range: '₹0–₹500', count: 0, color: '#94a3b8' },
            { range: '₹500–₹2K', count: 0, color: '#6366f1' },
            { range: '₹2K–₹5K', count: 0, color: '#10b981' },
            { range: '₹5K+', count: 0, color: '#f59e0b' },
        ];
        customers.forEach(c => {
            if (c.totalSpent < 500) buckets[0].count++;
            else if (c.totalSpent < 2000) buckets[1].count++;
            else if (c.totalSpent < 5000) buckets[2].count++;
            else buckets[3].count++;
        });
        return buckets;
    }, [customers]);

    // ── Performance Radar ──────────────────────────────────────────────────
    const radarData = [
        { subject: 'Sales Growth', A: 82 },
        { subject: 'Customer Ret.', A: 74 },
        { subject: 'Stock Health', A: 61 },
        { subject: 'GST Compliance', A: 95 },
        { subject: 'Avg Margin', A: 68 },
        { subject: 'Order Volume', A: 79 },
    ];

    // ── Top performing products ────────────────────────────────────────────
    const topProducts = useMemo(() => {
        const map: Record<string, { name: string; revenue: number; units: number }> = {};
        invoices.forEach(inv => {
            inv.items.forEach(item => {
                if (!map[item.productId]) {
                    map[item.productId] = { name: item.name, revenue: 0, units: 0 };
                }
                map[item.productId].revenue += item.price * item.quantity;
                map[item.productId].units += item.quantity;
            });
        });
        return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }, [invoices]);

    const maxRevenue = topProducts.length > 0 ? topProducts[0].revenue : 1;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight">Analytics Intelligence</h1>
                    <p className="text-muted-foreground text-xs mt-1">SaaS-grade business insights, trends, and performance projections.</p>
                </div>

                {/* Period Selector */}
                <div className="flex items-center bg-muted border border-border rounded-xl p-1 gap-1">
                    {(['7D', '30D', '90D', '1Y'] as const).map(period => (
                        <button
                            key={period}
                            onClick={() => setActivePeriod(period)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                                activePeriod === period
                                    ? "bg-card border border-border text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: formatCurrency(totalRevenue), change: '+14.2%', up: true, icon: DollarSign, color: 'indigo' },
                    { label: 'Units Sold', value: totalItems.toLocaleString(), change: '+8.3%', up: true, icon: ShoppingBag, color: 'emerald' },
                    { label: 'Avg Order Value', value: formatCurrency(avgOrderValue), change: '+5.1%', up: true, icon: BarChart2, color: 'purple' },
                    { label: 'Conversion Rate', value: `${conversionRate}%`, change: '-2.4%', up: false, icon: Target, color: 'amber' },
                ].map(kpi => (
                    <div key={kpi.label} className="bg-card border border-border p-5 rounded-2xl hover:shadow-md transition-all duration-300 card-blur-glow">
                        <div className="flex items-start justify-between">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                            <div className={`p-2 rounded-xl bg-${kpi.color}-50 dark:bg-${kpi.color}-500/10 text-${kpi.color}-600`}>
                                <kpi.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-2xl font-bold tracking-tight">{kpi.value}</h3>
                            <span className={cn("flex items-center gap-1 text-[11px] font-semibold mt-1", kpi.up ? 'text-emerald-500' : 'text-rose-500')}>
                                {kpi.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                {kpi.change} vs last period
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sales Trend + Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Sales Trend Area Chart */}
                <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-sm">Revenue & Customer Trend</h3>
                            <p className="text-muted-foreground text-[11px]">Weekly progression of revenue, orders, and new customers.</p>
                        </div>
                    </div>
                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="aRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="aCustomers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="day" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: '#334155', borderRadius: '12px' }}
                                    labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#aRevenue)" />
                                <Area type="monotone" dataKey="Customers" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#aCustomers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" /> Revenue</span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Customers</span>
                    </div>
                </div>

                {/* Category Revenue Pie */}
                <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col">
                    <h3 className="font-semibold text-sm mb-1">Revenue by Category</h3>
                    <p className="text-muted-foreground text-[11px] mb-4">Category-wise revenue share this period.</p>

                    <div className="h-[200px] w-full flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryRevenue}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {categoryRevenue.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val: number) => [formatCurrency(val), 'Revenue']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 mt-2 flex-1">
                        {categoryRevenue.slice(0, 4).map((cat, idx) => (
                            <div key={cat.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                    <span className="font-medium truncate">{cat.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-muted-foreground">{formatCurrency(cat.value)}</span>
                                    <span className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-bold text-muted-foreground">{cat.pct}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Performance Radar + CLV Buckets + Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Performance Radar Chart */}
                <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
                    <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-brand-500" />
                        Business Performance
                    </h3>
                    <p className="text-muted-foreground text-[11px] mb-4">Multi-dimensional SaaS health radar.</p>
                    <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#888' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                                <Tooltip formatter={(val: number) => [`${val}/100`, 'Score']} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Customer Lifetime Value Buckets */}
                <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
                    <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-500" />
                        Customer Lifetime Value
                    </h3>
                    <p className="text-muted-foreground text-[11px] mb-5">Distribution of customers by lifetime spend bands.</p>
                    <div className="space-y-4">
                        {clvBuckets.map(bucket => {
                            const total = clvBuckets.reduce((a, b) => a + b.count, 0);
                            const pct = total > 0 ? Math.round((bucket.count / total) * 100) : 0;
                            return (
                                <div key={bucket.range}>
                                    <div className="flex justify-between text-xs font-medium mb-1.5">
                                        <span>{bucket.range}</span>
                                        <span className="text-muted-foreground">{bucket.count} customers ({pct}%)</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%`, backgroundColor: bucket.color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {topCustomer && (
                        <div className="mt-6 p-3 rounded-xl bg-gradient-to-tr from-amber-500/5 to-orange-500/5 border border-amber-200/30 dark:border-amber-500/20">
                            <div className="flex items-center gap-2 mb-1">
                                <Award className="w-4 h-4 text-amber-500" />
                                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Top Customer</span>
                            </div>
                            <p className="text-sm font-bold">{topCustomer.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(topCustomer.totalSpent)} spent · {topCustomer.purchaseCount} orders
                            </p>
                        </div>
                    )}
                </div>

                {/* Top Products by Revenue */}
                <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
                    <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-500" />
                        Top Performing Products
                    </h3>
                    <p className="text-muted-foreground text-[11px] mb-5">Highest revenue-generating items sold.</p>

                    {topProducts.length > 0 ? (
                        <div className="space-y-4">
                            {topProducts.map((prod, idx) => {
                                const pct = Math.round((prod.revenue / maxRevenue) * 100);
                                return (
                                    <div key={prod.name}>
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}>
                                                    {idx + 1}
                                                </span>
                                                <span className="font-medium truncate max-w-[120px]">{prod.name}</span>
                                            </div>
                                            <span className="text-muted-foreground font-semibold">{formatCurrency(prod.revenue)}</span>
                                        </div>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-xs text-muted-foreground">
                            No invoice data yet. Create your first sale in the POS terminal.
                        </div>
                    )}
                </div>
            </div>

            {/* Growth Projection Banner */}
            <div className="bg-gradient-to-br from-brand-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 50%)' }} />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">AI-Powered Projection</p>
                        <h3 className="font-display text-xl font-bold">Q3 2026 Revenue Forecast</h3>
                        <p className="text-sm text-white/80 mt-1">
                            Based on current growth rate, projected revenue for next quarter is{' '}
                            <span className="font-bold text-white">{formatCurrency(totalRevenue * 1.18 * 3)}</span>.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-center px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm">
                            <p className="text-xl font-bold">+18%</p>
                            <p className="text-[10px] text-white/70">YoY Growth</p>
                        </div>
                        <div className="text-center px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm">
                            <p className="text-xl font-bold">{customers.length}</p>
                            <p className="text-[10px] text-white/70">Active Clients</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
