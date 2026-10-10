import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import {
    Search,
    Plus,
    Trash2,
    Edit3,
    AlertTriangle,
    Folder,
    DollarSign,
    TrendingUp,
    Percent,
    CheckCircle2,
    PackageCheck,
    ChevronRight,
    TrendingDown,
    X
} from 'lucide-react';
import { useApp, Product } from '@/context/AppContext';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

export const Products: React.FC = () => {
    const { products, addProduct, restockProduct } = useApp();
    const location = useLocation();

    // Selected item modal / detail state
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    // Forms & add views
    const [showAddForm, setShowAddForm] = useState(false);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Hardware');
    const [price, setPrice] = useState<number>(0);
    const [cost, setCost] = useState<number>(0);
    const [sku, setSku] = useState('');
    const [barcode, setBarcode] = useState('');
    const [minStock, setMinStock] = useState<number>(5);
    const [stock, setStock] = useState<number>(10);
    const [image, setImage] = useState('🛡️');

    // Search/Filters
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('All');

    // Quick action Restock
    const [restockQty, setRestockQty] = useState<number>(10);

    // Check URL hashes/params for Add Product requests (e.g. from POS / Header quick entries)
    useEffect(() => {
        if (location.search.includes('add=true')) {
            setShowAddForm(true);
        }
        // Check hash for specific product targeting
        if (location.hash) {
            const matchId = location.hash.replace('#', '');
            if (matchId) {
                setSelectedProductId(matchId);
            }
        }
    }, [location]);

    const handleSubmitProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !sku || !barcode || price <= 0 || cost <= 0) {
            toast.error('Please fill in code, prices, and barcodes.');
            return;
        }

        addProduct({
            name,
            category,
            price,
            cost,
            sku: sku.toUpperCase(),
            barcode,
            minStock,
            stock,
            image
        });

        toast.success(`Registered product "${name}" in catalog database.`);
        setShowAddForm(false);

        // Clear forms
        setName('');
        setPrice(0);
        setCost(0);
        setSku('');
        setBarcode('');
        setStock(10);
        setMinStock(5);
    };

    const executeRestock = (pId: string) => {
        restockProduct(pId, restockQty);
        toast.success(`Restocked product. Stock level updated.`);
        setRestockQty(10);
    };

    // Calculations
    const categoriesList: string[] = ['All', ...Array.from(new Set(products.map(p => p.category)))];

    // Filters
    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
        const matchCat = catFilter === 'All' || p.category === catFilter;
        return matchSearch && matchCat;
    });

    const selectedProduct = products.find(p => p.id === selectedProductId);

    return (
        <div className="space-y-6">

            {/* Top Banner Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight">Stock Inventory Catalog</h1>
                    <p className="text-muted-foreground text-xs mt-1">Audit barcodes, margins, and manage supply alerts.</p>
                </div>

                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4" /> Register New Product
                </button>
            </div>

            {/* Add Product Form Drawer */}
            {showAddForm && (
                <div className="bg-card border border-border p-5 rounded-2xl animate-in slide-in-from-top-3 duration-250 max-w-2xl">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/60">
                        <h3 className="font-semibold text-sm">Register Store SKU/Product</h3>
                        <button onClick={() => setShowAddForm(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                    </div>

                    <form onSubmit={handleSubmitProduct} className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div className="col-span-2">
                            <label className="text-[10px] font-bold block mb-1">Product Title *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Secure Mesh Router"
                                className="w-full px-3 py-2 bg-muted/65 border border-border rounded-xl focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold block mb-1">Category *</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 bg-muted/65 border border-border rounded-xl focus:outline-none"
                            >
                                <option value="Electronics">Electronics</option>
                                <option value="Clothing">Clothing</option>
                                <option value="Hardware">Hardware</option>
                                <option value="Office Goods">Office Goods</option>
                                <option value="Groceries">Groceries</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold block mb-1">Representative Icon Emoji</label>
                            <select
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                className="w-full px-3 py-2 bg-muted/65 border border-border rounded-xl focus:outline-none"
                            >
                                <option value="🛡️">🛡️ Shield</option>
                                <option value="🔌">🔌 Cables</option>
                                <option value="💻">💻 Computer</option>
                                <option value="📦">📦 Package</option>
                                <option value="👕">👕 Shirt</option>
                                <option value="☕">☕ Coffee</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold block mb-1">Price (SELL) *</label>
                            <input
                                type="number"
                                value={price || ''}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                placeholder="40"
                                className="w-full px-3 py-2 bg-muted/65 border border-border rounded-xl focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold block mb-1">Cost (BUY) *</label>
                            <input
                                type="number"
                                value={cost || ''}
                                onChange={(e) => setCost(Number(e.target.value))}
                                placeholder="25"
                                className="w-full px-3 py-2 bg-muted/65 border border-border rounded-xl focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold block mb-1">SKU Code *</label>
                            <input
                                type="text"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                placeholder="SEC-MIN-001"
                                className="w-full px-3 py-2 bg-muted/65 border border-border rounded-xl focus:outline-none font-mono"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold block mb-1">Barcode scanner ID *</label>
                            <input
                                type="text"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                placeholder="10049219"
                                className="w-full px-3 py-2 bg-muted/65 border border-border rounded-xl focus:outline-none font-mono"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold block mb-1">Opening Stock *</label>
                            <input
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-muted/66 border border-border rounded-xl focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold block mb-1">Safety stock limit *</label>
                            <input
                                type="number"
                                value={minStock}
                                onChange={(e) => setMinStock(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-muted/66 border border-border rounded-xl focus:outline-none"
                                required
                            />
                        </div>

                        <div className="col-span-2 pt-2 self-end">
                            <button
                                type="submit"
                                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-xs"
                            >
                                Register SKU details
                            </button>
                        </div>

                    </form>
                </div>
            )}

            {/* Main Grid display area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Side: Filter and Product lists Card (7 columns) */}
                <div className="lg:col-span-7 bg-card border border-border rounded-2xl overflow-hidden shadow-xs">

                    {/* Controls header */}
                    <div className="p-4 border-b border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
                        <div className="relative max-w-sm w-full">
                            <input
                                type="text"
                                placeholder="Search catalog by name, code..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 bg-muted/50 border border-border focus:border-brand-500 rounded-xl text-xs focus:outline-none"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                <Search className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        <select
                            value={catFilter}
                            onChange={(e) => setCatFilter(e.target.value)}
                            className="bg-muted/40 border border-border text-xs px-3 py-1.5 rounded-lg focus:outline-none self-end sm:self-auto font-medium"
                        >
                            {categoriesList.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Product Items Table list */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase">
                                    <th className="p-4">SKU / details</th>
                                    <th className="p-4 text-center">Category</th>
                                    <th className="p-4 text-right">Price</th>
                                    <th className="p-4 text-center">Stock</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 text-xs select-none">
                                {filteredProducts.map(p => (
                                    <tr
                                        key={p.id}
                                        onClick={() => setSelectedProductId(p.id)}
                                        className={cn(
                                            "hover:bg-muted/30 transition-colors cursor-pointer group",
                                            selectedProductId === p.id ? "bg-muted/40" : "",
                                            p.stock <= p.minStock ? "bg-amber-500/[0.015]" : ""
                                        )}
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl bg-muted/65 w-9 h-9 flex items-center justify-center rounded-xl">{p.image}</span>
                                                <div>
                                                    <h4 className="font-semibold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-500 transition-colors">{p.name}</h4>
                                                    <span className="text-[10px] text-muted-foreground/80 font-mono mt-0.5">SKU: {p.sku}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-muted-foreground">
                                            {p.category}
                                        </td>
                                        <td className="p-4 text-right font-bold text-foreground">
                                            ${p.price}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={cn(
                                                "px-2 py-0.5 font-bold rounded text-[10px]",
                                                p.stock <= 0 ? 'bg-rose-500/10 text-rose-500' :
                                                    p.stock <= p.minStock ? 'bg-amber-500/10 text-amber-500' :
                                                        'bg-emerald-500/10 text-emerald-500'
                                            )}>
                                                {p.stock} units
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <ChevronRight className="w-4 h-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                                        </td>
                                    </tr>
                                ))}

                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-muted-foreground">
                                            No items matched query.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Side: Product audit controls (5 columns) */}
                <div className="lg:col-span-5">
                    {selectedProduct ? (
                        <div className="bg-card border border-border rounded-2xl p-5 space-y-6 animate-in fade-in duration-200">

                            {/* Product title header */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl bg-muted/70 p-2.5 rounded-2xl">{selectedProduct.image}</span>
                                    <div>
                                        <h3 className="font-display font-bold text-base text-foreground leading-tight">{selectedProduct.name}</h3>
                                        <p className="text-[10.5px] text-muted-foreground font-mono mt-0.5">SKU: {selectedProduct.sku} &bull; Barcode: {selectedProduct.barcode}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedProductId(null)}
                                    className="p-1 hover:bg-muted text-muted-foreground rounded-lg"
                                >
                                    <X className="w-4.5 h-4.5" />
                                </button>
                            </div>

                            {/* Cost margins analysis */}
                            <div className="grid grid-cols-3 gap-3 border-y border-border/70 py-4 text-center select-none bg-muted/20 rounded-xl px-2">
                                <div>
                                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Buying Cost</span>
                                    <p className="font-bold text-xs mt-1">${selectedProduct.cost}</p>
                                </div>
                                <div>
                                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Selling Price</span>
                                    <p className="font-bold text-xs mt-1">${selectedProduct.price}</p>
                                </div>
                                <div>
                                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Net Margin</span>
                                    <p className="font-extrabold text-xs mt-1 text-emerald-500">
                                        +{Math.round((selectedProduct.price - selectedProduct.cost) / selectedProduct.price * 100)}%
                                    </p>
                                </div>
                            </div>

                            {/* Status Audit Levels */}
                            <div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-3">Inventory Buffer</span>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                            <span>Available Stock</span>
                                            <span>{selectedProduct.stock} / 100 max</span>
                                        </div>
                                        {/* Progress indicator */}
                                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-300",
                                                    selectedProduct.stock <= selectedProduct.minStock ? 'bg-amber-500' : 'bg-brand-500'
                                                )}
                                                style={{ width: `${Math.min(100, (selectedProduct.stock / 100) * 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs p-3 border border-border/80 rounded-xl bg-card">
                                        <span className="text-muted-foreground">Threshold Buffer:</span>
                                        <span className="font-bold">{selectedProduct.minStock} units minimum</span>
                                    </div>
                                </div>
                            </div>

                            {/* Supply restock trigger */}
                            <div className="space-y-3.5 bg-muted/40 p-4 rounded-xl border border-border/60">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Supply Replenishing</span>

                                <div className="flex gap-2.5">
                                    <div className="flex items-center border border-border bg-card rounded-lg p-0.5 w-24">
                                        <button
                                            onClick={() => setRestockQty(Math.max(1, restockQty - 5))}
                                            className="w-6 h-6 flex items-center justify-center font-bold text-xs"
                                        >
                                            -
                                        </button>
                                        <span className="w-10 text-center text-xs font-semibold">{restockQty}</span>
                                        <button
                                            onClick={() => setRestockQty(restockQty + 5)}
                                            className="w-6 h-6 flex items-center justify-center font-bold text-xs"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => executeRestock(selectedProduct.id)}
                                        className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all"
                                    >
                                        Restock Product Inventory
                                    </button>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="bg-card border border-border border-dashed rounded-2xl p-16 text-center select-none text-muted-foreground text-xs flex flex-col items-center justify-center h-48">
                            <PackageCheck className="w-8 h-8 text-indigo-400 opacity-60 mb-2" />
                            <span>Select an item card to inspect markup details and run stock adjustments logs.</span>
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
};

export default Products;
