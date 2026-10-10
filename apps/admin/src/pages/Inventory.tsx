import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import {
    AlertTriangle,
    ArrowDownToLine,
    ArrowUpFromLine,
    Layers,
    Boxes,
    RefreshCw,
    Truck,
    TrendingUp,
    DollarSign,
    FileCheck2,
    PackageCheck,
    Zap
} from 'lucide-react';
import { useApp, Product } from '@/context/AppContext';
import { toast } from 'sonner';

export const Inventory: React.FC = () => {
    const { products, restockProduct, activities } = useApp();

    // Selected Stock Filter
    const [stockType, setStockType] = useState<'ALL' | 'DANGER' | 'WARNING' | 'GOOD'>('ALL');

    // Total Valuation
    const totalSkuCount = products.length;
    const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);
    const totalCostValuation = products.reduce((acc, p) => acc + (p.cost * p.stock), 0);
    const totalRetailValuation = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const potentialMargin = totalRetailValuation - totalCostValuation;

    // Filter products by stock health
    const filteredProducts = products.filter(p => {
        if (stockType === 'ALL') return true;
        if (stockType === 'DANGER') return p.stock === 0;
        if (stockType === 'WARNING') return p.stock > 0 && p.stock <= p.minStock;
        return p.stock > p.minStock;
    });

    // Action: restock all critical items under threshold
    const handleRestockAllAlerts = () => {
        const lowStockItems = products.filter(p => p.stock <= p.minStock);
        if (lowStockItems.length === 0) {
            toast.info('No low-stock items require restocking at this time.');
            return;
        }

        lowStockItems.forEach(p => {
            restockProduct(p.id, p.minStock * 2);
        });

        toast.success(`Successfully refilled ${lowStockItems.length} warning items by their safety standard.`);
    };

    // Stock logs history from activities state
    const inventoryActivities = activities.filter(a => a.type === 'stock');

    return (
        <div className="space-y-6">

            {/* Top Banner Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight">Warehouse &amp; Logistics</h1>
                    <p className="text-muted-foreground text-xs mt-1">Review active inventory valuation, margins markup, and replenish safety buffers.</p>
                </div>

                <button
                    onClick={handleRestockAllAlerts}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 duration-150"
                >
                    <Zap className="w-4 h-4 text-amber-400" /> Restock Warning Items
                </button>
            </div>

            {/* 4 Cards: Warehouse Valuation Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1 */}
                <div className="bg-card border border-border p-5 rounded-2xl">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Physical Item Count</span>
                    <div className="flex justify-between items-end mt-3">
                        <h3 className="text-2xl font-bold tracking-tight">{totalStockCount}</h3>
                        <div className="p-1 px-2.5 bg-muted rounded-lg text-xs font-mono font-bold text-muted-foreground">
                            {totalSkuCount} SKUs
                        </div>
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-card border border-border p-5 rounded-2xl">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Warehouse Cost Basis</span>
                    <div className="flex justify-between items-end mt-3">
                        <h3 className="text-2xl font-bold tracking-tight">${totalCostValuation.toLocaleString()}</h3>
                        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-brand-600 dark:text-brand-500">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-card border border-border p-5 rounded-2xl">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Retail Asset Value</span>
                    <div className="flex justify-between items-end mt-3">
                        <h3 className="text-2xl font-bold tracking-tight">${totalRetailValuation.toLocaleString()}</h3>
                        <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-500">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-card border border-border p-5 rounded-2xl">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Expected Markup Net</span>
                    <div className="flex justify-between items-end mt-3">
                        <h3 className="text-2xl font-bold tracking-tight text-emerald-500 dark:text-emerald-400">
                            +${potentialMargin.toLocaleString()}
                        </h3>
                        <div className="p-1.5 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-500">
                            <FileCheck2 className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Split layout: Stock list (8 col) & Supply logs history (4 col) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left: Health inventory levels list */}
                <div className="lg:col-span-8 bg-card border border-border rounded-2xl overflow-hidden shadow-xs">

                    {/* Health Filter buttons */}
                    <div className="p-4 border-b border-border/80 flex justify-between items-center bg-card select-none">
                        <span className="text-xs font-semibold text-foreground/90">Audit Stock buffers</span>

                        <div className="flex gap-1.5">
                            {(['ALL', 'DANGER', 'WARNING', 'GOOD'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setStockType(type)}
                                    className={cn(
                                        "px-3 py-1 rounded-lg text-xs font-semibold border transition-all duration-150",
                                        stockType === type
                                            ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-brand-600 dark:text-brand-500"
                                            : "bg-card border-border hover:bg-muted text-muted-foreground"
                                    )}
                                >
                                    {type === 'ALL' ? 'All Health' : type === 'DANGER' ? 'Out of Stock' : type === 'WARNING' ? 'Low Stock' : 'Stable'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table list */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase opacity-80">
                                    <th className="p-4">SKU / details</th>
                                    <th className="p-4 text-center">Safety Threshold</th>
                                    <th className="p-4 text-center">Current Quantity</th>
                                    <th className="p-4 text-right">Asset Value (Sell)</th>
                                    <th className="p-4 text-center">Health</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 text-xs select-none">
                                {filteredProducts.map(p => {
                                    const health = p.stock === 0 ? 'DANGER' : p.stock <= p.minStock ? 'WARNING' : 'GOOD';
                                    return (
                                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-xl bg-muted/65 w-8 h-8 flex items-center justify-center rounded-lg">{p.image}</span>
                                                    <div>
                                                        <h4 className="font-semibold">{p.name}</h4>
                                                        <span className="text-[9px] text-muted-foreground/80 font-mono mt-0.5">SKU: {p.sku}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center text-muted-foreground font-semibold">
                                                {p.minStock} units
                                            </td>
                                            <td className="p-4 text-center font-bold">
                                                {p.stock} units
                                            </td>
                                            <td className="p-4 text-right font-bold">
                                                ${p.price * p.stock}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[9px] font-bold",
                                                    health === 'DANGER' ? 'bg-rose-500/10 text-rose-500' :
                                                        health === 'WARNING' ? 'bg-amber-500/10 text-amber-500 animate-pulse' :
                                                            'bg-emerald-500/10 text-emerald-500'
                                                )}>
                                                    {health}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-muted-foreground">
                                            No items matched health select criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>

                {/* Right: Restocking History / Supply logs */}
                <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-1.5 mb-4 border-b border-border/60 pb-3">
                            <Truck className="w-4.5 h-4.5 text-indigo-400" />
                            <h3 className="font-semibold text-sm">Replenishment Audit Trails</h3>
                        </div>

                        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                            {inventoryActivities.map(act => (
                                <div key={act.id} className="text-xs p-3 bg-muted/40 border border-border/80 rounded-xl relative">
                                    <div className="flex items-center gap-1.5 text-amber-500 font-bold mb-1">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        <span>RESTOCKED</span>
                                    </div>
                                    <h4 className="font-bold">{act.title}</h4>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{act.description}</p>
                                    <span className="text-[9.5px] text-muted-foreground/60 block mt-2 text-right">{act.time}</span>
                                </div>
                            ))}

                            {inventoryActivities.length === 0 && (
                                <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center space-y-1.5">
                                    <PackageCheck className="w-7 h-7 text-indigo-400 opacity-60" />
                                    <span>All replenishment logs clear.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-border/60 pt-4 mt-6 text-center text-[10px] text-muted-foreground">
                        Auditing system complies with FIFO inventory valuation.
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Inventory;
