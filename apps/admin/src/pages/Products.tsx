import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import {
    Search,
    Plus,
    Trash2,
    Edit3,
    AlertTriangle,
    Folder,
    IndianRupee,
    TrendingUp,
    Percent,
    CheckCircle2,
    PackageCheck,
    ChevronRight,
    TrendingDown,
    X,
    Calendar,
    Shield,
    Layers,
    Tag,
    Clock,
    Sparkles,
    Check
} from 'lucide-react';
import { useApp, Product, BusinessType } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/utils/currency';
import { useStaggerEntrance } from '@/hooks/useGsapMotion';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

export const Products: React.FC = () => {
    const { products, addProduct, updateProduct, restockProduct, businessType } = useApp();
    const { isAdmin } = useAuth();
    const location = useLocation();
    const containerRef = useRef<HTMLDivElement>(null);

    useStaggerEntrance(containerRef, '.gsap-stagger-item', [products.length, businessType]);

    // Selected item modal / detail state
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Forms & add views
    const [showAddForm, setShowAddForm] = useState(false);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('General');
    const [price, setPrice] = useState<number>(0);
    const [cost, setCost] = useState<number>(0);
    const [sku, setSku] = useState('');
    const [barcode, setBarcode] = useState('');
    const [minStock, setMinStock] = useState<number>(5);
    const [stock, setStock] = useState<number>(10);
    const [image, setImage] = useState('📦');

    // Industry Specific Form States
    const [mrp, setMrp] = useState<number>(0);
    const [brand, setBrand] = useState('');
    const [batchNumber, setBatchNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [unitOfMeasure, setUnitOfMeasure] = useState('pcs');
    const [isPerishable, setIsPerishable] = useState(false);
    const [composition, setComposition] = useState('');
    const [dosageForm, setDosageForm] = useState('Tablet');
    const [requiresPrescription, setRequiresPrescription] = useState(false);
    const [model, setModel] = useState('');
    const [warrantyMonths, setWarrantyMonths] = useState<number>(12);
    const [serialNumbersText, setSerialNumbersText] = useState('');
    const [size, setSize] = useState('M');
    const [color, setColor] = useState('');
    const [material, setMaterial] = useState('');
    const [grade, setGrade] = useState('');
    const [gauge, setGauge] = useState('');
    const [technicalSpecs, setTechnicalSpecs] = useState('');
    const [minOrderQty, setMinOrderQty] = useState<number>(1);
    const [cartonQty, setCartonQty] = useState<number>(1);
    const [tierMinQty, setTierMinQty] = useState<number>(10);
    const [tierUnitPrice, setTierUnitPrice] = useState<number>(0);

    // Search/Filters
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('All');

    // Quick action Restock
    const [restockQty, setRestockQty] = useState<number>(10);

    useEffect(() => {
        if (location.search.includes('add=true') && isAdmin) {
            setShowAddForm(true);
        }
        if (location.hash) {
            const matchId = location.hash.replace('#', '');
            if (matchId) {
                setSelectedProductId(matchId);
            }
        }
    }, [location, isAdmin]);

    const resetForm = () => {
        setName('');
        setPrice(0);
        setCost(0);
        setSku('');
        setBarcode('');
        setStock(10);
        setMinStock(5);
        setImage('📦');
        setMrp(0);
        setBrand('');
        setBatchNumber('');
        setExpiryDate('');
        setUnitOfMeasure('pcs');
        setIsPerishable(false);
        setComposition('');
        setDosageForm('Tablet');
        setRequiresPrescription(false);
        setModel('');
        setWarrantyMonths(12);
        setSerialNumbersText('');
        setSize('M');
        setColor('');
        setMaterial('');
        setGrade('');
        setGauge('');
        setTechnicalSpecs('');
        setMinOrderQty(1);
        setCartonQty(1);
        setTierMinQty(10);
        setTierUnitPrice(0);
    };

    const handleSubmitProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) {
            toast.error('Only administrators can register products.');
            return;
        }

        if (!name || !sku || !barcode || price < 0 || cost < 0) {
            toast.error('Please fill in required fields (Name, SKU, Barcode, Price, Cost).');
            return;
        }

        const serials = serialNumbersText
            ? serialNumbersText.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
            : undefined;

        const tieredPricing = tierUnitPrice > 0 && tierMinQty > 0
            ? [{ minQty: tierMinQty, unitPrice: tierUnitPrice }]
            : undefined;

        try {
            await addProduct({
                name,
                category,
                price: Number(price),
                cost: Number(cost),
                sku: sku.toUpperCase(),
                barcode,
                minStock: Number(minStock),
                stock: Number(stock),
                image,
                // Preset optional fields
                mrp: mrp > 0 ? Number(mrp) : undefined,
                brand: brand ? brand.trim() : undefined,
                batchNumber: batchNumber ? batchNumber.trim() : undefined,
                expiryDate: expiryDate ? expiryDate : undefined,
                unitOfMeasure: unitOfMeasure ? unitOfMeasure.trim() : undefined,
                isPerishable: isPerishable,
                composition: composition ? composition.trim() : undefined,
                dosageForm: dosageForm ? dosageForm.trim() : undefined,
                requiresPrescription: requiresPrescription,
                model: model ? model.trim() : undefined,
                warrantyMonths: warrantyMonths >= 0 ? Number(warrantyMonths) : undefined,
                serialNumbers: serials,
                size: size ? size.trim() : undefined,
                color: color ? color.trim() : undefined,
                material: material ? material.trim() : undefined,
                grade: grade ? grade.trim() : undefined,
                gauge: gauge ? gauge.trim() : undefined,
                technicalSpecs: technicalSpecs ? technicalSpecs.trim() : undefined,
                minOrderQty: minOrderQty > 0 ? Number(minOrderQty) : undefined,
                cartonQty: cartonQty > 0 ? Number(cartonQty) : undefined,
                tieredPricing
            });

            toast.success(`Registered product "${name}" with ${businessType} preset attributes.`);
            setShowAddForm(false);
            resetForm();
        } catch (err: any) {
            toast.error(err.message || 'Failed to register product');
        }
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
        const s = search.toLowerCase();
        const matchSearch =
            p.name.toLowerCase().includes(s) ||
            p.sku.toLowerCase().includes(s) ||
            p.barcode.includes(s) ||
            (p.brand && p.brand.toLowerCase().includes(s)) ||
            (p.batchNumber && p.batchNumber.toLowerCase().includes(s));
        const matchCat = catFilter === 'All' || p.category === catFilter;
        return matchSearch && matchCat;
    });

    const selectedProduct = products.find(p => p.id === selectedProductId);

    return (
        <div ref={containerRef} className="space-y-6">

            {/* Top Banner Row */}
            <div className="gsap-stagger-item flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="font-display text-2xl font-bold tracking-tight">Product Catalog &amp; Inventory</h1>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30 uppercase">
                            Preset: {businessType}
                        </span>
                    </div>
                    <p className="text-muted-foreground text-xs mt-1">
                        Tailored for {businessType} workflow: industry attributes, batch/expiry controls, and SKU auditing.
                    </p>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => { setShowAddForm(!showAddForm); resetForm(); }}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Register New Product
                    </button>
                )}
            </div>

            {/* Add Product Form Drawer */}
            {showAddForm && (
                <div className="bg-card border border-border p-6 rounded-2xl animate-in slide-in-from-top-3 duration-250 shadow-2xl max-w-3xl">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <span className="p-2 bg-brand-500/10 text-brand-500 rounded-lg">
                                <Plus className="w-4 h-4" />
                            </span>
                            <div>
                                <h3 className="font-semibold text-sm">Register {businessType} SKU / Item</h3>
                                <p className="text-[11px] text-muted-foreground">Standard barcode, monetary fields &amp; industry attributes</p>
                            </div>
                        </div>
                        <button onClick={() => setShowAddForm(false)} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmitProduct} className="space-y-4 text-xs">
                        {/* Core General Attributes */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="col-span-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Product Title *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Paracetamol 500mg or iPhone 15"
                                    className="w-full px-3 py-2 bg-muted/60 border border-border rounded-xl focus:outline-none focus:border-brand-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Category *</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3 py-2 bg-muted/60 border border-border rounded-xl focus:outline-none focus:border-brand-500"
                                >
                                    <option value="General">General</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Groceries">Groceries</option>
                                    <option value="Medicine">Medicine</option>
                                    <option value="Clothing">Clothing</option>
                                    <option value="Hardware">Hardware</option>
                                    <option value="Wholesale">Wholesale</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Icon Emoji</label>
                                <select
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    className="w-full px-3 py-2 bg-muted/60 border border-border rounded-xl focus:outline-none focus:border-brand-500"
                                >
                                    <option value="📦">📦 Package</option>
                                    <option value="📱">📱 Smartphone</option>
                                    <option value="💻">💻 Laptop</option>
                                    <option value="💊">💊 Capsule</option>
                                    <option value="🍏">🍏 Grocery</option>
                                    <option value="👕">👕 Apparel</option>
                                    <option value="🔧">🔧 Hardware</option>
                                    <option value="🎧">🎧 Audio</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">SKU Code *</label>
                                <input
                                    type="text"
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                    placeholder="PRD-001"
                                    className="w-full px-3 py-2 bg-muted/60 border border-border rounded-xl focus:outline-none font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Barcode scanner ID *</label>
                                <input
                                    type="text"
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                    placeholder="890123456789"
                                    className="w-full px-3 py-2 bg-muted/60 border border-border rounded-xl focus:outline-none font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Selling Price (₹) *</label>
                                <input
                                    type="number"
                                    value={price || ''}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    placeholder="1000"
                                    className="w-full px-3 py-2 bg-muted/60 border border-border rounded-xl focus:outline-none"
                                    min="0"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Cost Price (₹) *</label>
                                <input
                                    type="number"
                                    value={cost || ''}
                                    onChange={(e) => setCost(Number(e.target.value))}
                                    placeholder="700"
                                    className="w-full px-3 py-2 bg-muted/60 border border-border rounded-xl focus:outline-none"
                                    min="0"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Opening Stock *</label>
                                <input
                                    type="number"
                                    value={stock}
                                    onChange={(e) => setStock(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-muted/60 border border-border rounded-xl focus:outline-none"
                                    min="0"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Safety stock limit *</label>
                                <input
                                    type="number"
                                    value={minStock}
                                    onChange={(e) => setMinStock(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-muted/60 border border-border rounded-xl focus:outline-none"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        {/* Industry Specific Specialized Attributes Panel */}
                        <div className="p-4 bg-muted/30 border border-brand-500/20 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-brand-400 font-semibold text-xs pb-1 border-b border-border/40">
                                <Sparkles className="w-3.5 h-3.5" />
                                {businessType} Preset Specific Fields
                            </div>

                            {/* 1. Grocery & FMCG */}
                            {businessType === 'GROCERY' && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Batch Number</label>
                                        <input type="text" value={batchNumber} onChange={e => setBatchNumber(e.target.value)} placeholder="BATCH-2026-A" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Expiry Date</label>
                                        <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Unit of Measure</label>
                                        <select value={unitOfMeasure} onChange={e => setUnitOfMeasure(e.target.value)} className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg">
                                            <option value="kg">kg (Kilogram)</option>
                                            <option value="gm">gm (Gram)</option>
                                            <option value="ltr">ltr (Litre)</option>
                                            <option value="ml">ml (Millilitre)</option>
                                            <option value="pcs">pcs (Pieces)</option>
                                            <option value="pack">pack (Packet)</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2 pt-4">
                                        <input type="checkbox" id="perishable" checked={isPerishable} onChange={e => setIsPerishable(e.target.checked)} className="rounded text-brand-600" />
                                        <label htmlFor="perishable" className="text-xs font-semibold cursor-pointer">Perishable Item</label>
                                    </div>
                                </div>
                            )}

                            {/* 2. Pharmacy / Healthcare */}
                            {businessType === 'PHARMACY' && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold block mb-1">Salt / Chemical Composition</label>
                                        <input type="text" value={composition} onChange={e => setComposition(e.target.value)} placeholder="e.g. Paracetamol 500mg + Caffeine 30mg" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Dosage Form</label>
                                        <select value={dosageForm} onChange={e => setDosageForm(e.target.value)} className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg">
                                            <option value="Tablet">Tablet</option>
                                            <option value="Capsule">Capsule</option>
                                            <option value="Syrup">Syrup</option>
                                            <option value="Ointment">Ointment</option>
                                            <option value="Injection">Injection</option>
                                            <option value="Drops">Drops</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Batch Number</label>
                                        <input type="text" value={batchNumber} onChange={e => setBatchNumber(e.target.value)} placeholder="MED-BATCH-09" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Expiry Date</label>
                                        <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                    <div className="flex items-center gap-2 pt-4 col-span-2">
                                        <input type="checkbox" id="prescription" checked={requiresPrescription} onChange={e => setRequiresPrescription(e.target.checked)} className="rounded text-brand-600" />
                                        <label htmlFor="prescription" className="text-xs font-semibold cursor-pointer">Requires Prescription (Schedule H/X)</label>
                                    </div>
                                </div>
                            )}

                            {/* 3. Electronics & Gadgets */}
                            {businessType === 'ELECTRONICS' && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Brand Name</label>
                                        <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Apple, Sony, Samsung" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Model / Serial Code</label>
                                        <input type="text" value={model} onChange={e => setModel(e.target.value)} placeholder="A3106 / WH-1000XM5" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Warranty (Months)</label>
                                        <input type="number" value={warrantyMonths} onChange={e => setWarrantyMonths(Number(e.target.value))} min="0" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">IMEI / Serial Numbers (comma-sep)</label>
                                        <input type="text" value={serialNumbersText} onChange={e => setSerialNumbersText(e.target.value)} placeholder="IMEI1, IMEI2" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg font-mono text-[11px]" />
                                    </div>
                                </div>
                            )}

                            {/* 4. Fashion & Apparel */}
                            {businessType === 'FASHION' && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Size</label>
                                        <select value={size} onChange={e => setSize(e.target.value)} className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg">
                                            <option value="XS">XS</option>
                                            <option value="S">S</option>
                                            <option value="M">M</option>
                                            <option value="L">L</option>
                                            <option value="XL">XL</option>
                                            <option value="XXL">XXL</option>
                                            <option value="Free Size">Free Size</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Color</label>
                                        <input type="text" value={color} onChange={e => setColor(e.target.value)} placeholder="Navy Blue, Charcoal" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold block mb-1">Fabric / Material</label>
                                        <input type="text" value={material} onChange={e => setMaterial(e.target.value)} placeholder="100% Cotton, Denim, Linen" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                </div>
                            )}

                            {/* 5. Hardware & Industrial */}
                            {businessType === 'HARDWARE' && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Material Grade</label>
                                        <input type="text" value={grade} onChange={e => setGrade(e.target.value)} placeholder="SS-304, Grade 8.8" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Gauge / Size</label>
                                        <input type="text" value={gauge} onChange={e => setGauge(e.target.value)} placeholder="16 Gauge, 1/2 inch" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Unit of Measure</label>
                                        <input type="text" value={unitOfMeasure} onChange={e => setUnitOfMeasure(e.target.value)} placeholder="meter, piece, kg" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Technical Specs</label>
                                        <input type="text" value={technicalSpecs} onChange={e => setTechnicalSpecs(e.target.value)} placeholder="Tensile 700MPa" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                </div>
                            )}

                            {/* 6. Wholesale & Distribution */}
                            {businessType === 'WHOLESALE' && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Min Order Qty (MOQ)</label>
                                        <input type="number" value={minOrderQty} onChange={e => setMinOrderQty(Number(e.target.value))} min="1" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Units per Carton</label>
                                        <input type="number" value={cartonQty} onChange={e => setCartonQty(Number(e.target.value))} min="1" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Bulk Tier Min Qty</label>
                                        <input type="number" value={tierMinQty} onChange={e => setTierMinQty(Number(e.target.value))} min="1" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Bulk Tier Unit Price (₹)</label>
                                        <input type="number" value={tierUnitPrice || ''} onChange={e => setTierUnitPrice(Number(e.target.value))} min="0" placeholder="e.g. 850" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                </div>
                            )}

                            {/* 7. General Retail */}
                            {businessType === 'RETAIL' && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">MRP (₹)</label>
                                        <input type="number" value={mrp || ''} onChange={e => setMrp(Number(e.target.value))} min="0" placeholder="1200" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold block mb-1">Brand Name</label>
                                        <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Retail Brand" className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-border">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 border border-border hover:bg-muted rounded-xl text-xs font-semibold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
                            >
                                Save Product
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Product List Table / Grid */}
            <div className="gsap-stagger-item bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-80">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={`Search ${businessType.toLowerCase()} products by name, SKU, brand, batch...`}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-xs w-full focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        {categoriesList.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCatFilter(cat)}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer",
                                    catFilter === cat
                                        ? "bg-brand-600 text-white font-semibold shadow-xs"
                                        : "bg-muted text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold border-b border-border tracking-wider">
                                <th className="p-3.5 pl-5">Product Info</th>
                                <th className="p-3.5">SKU / Barcode</th>
                                <th className="p-3.5">Industry Attributes</th>
                                <th className="p-3.5 text-right">Price</th>
                                {isAdmin && <th className="p-3.5 text-right">Cost</th>}
                                <th className="p-3.5 text-center">Stock</th>
                                <th className="p-3.5 text-right pr-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredProducts.map(p => {
                                const isLowStock = p.stock <= p.minStock;

                                return (
                                    <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                                        <td className="p-3.5 pl-5">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl p-1 bg-muted rounded-xl">{p.image}</span>
                                                <div>
                                                    <p className="font-semibold text-foreground text-xs">{p.name}</p>
                                                    <span className="text-[10px] text-muted-foreground">{p.category}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-3.5 font-mono">
                                            <p className="font-semibold text-foreground">{p.sku}</p>
                                            <p className="text-[10px] text-muted-foreground">{p.barcode}</p>
                                        </td>

                                        {/* Dynamic Industry Badges */}
                                        <td className="p-3.5">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {/* Grocery / FMCG */}
                                                {p.batchNumber && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                        Batch: {p.batchNumber}
                                                    </span>
                                                )}
                                                {p.expiryDate && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                                        <Calendar className="w-2.5 h-2.5" /> Exp: {p.expiryDate}
                                                    </span>
                                                )}
                                                {p.isPerishable && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-rose-500/10 text-rose-400 font-semibold">
                                                        Perishable
                                                    </span>
                                                )}

                                                {/* Pharmacy */}
                                                {p.composition && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-purple-500/10 text-purple-400 truncate max-w-[160px]" title={p.composition}>
                                                        {p.composition}
                                                    </span>
                                                )}
                                                {p.dosageForm && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300 font-semibold">
                                                        {p.dosageForm}
                                                    </span>
                                                )}
                                                {p.requiresPrescription && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-rose-600/20 text-rose-400 font-bold border border-rose-500/30">
                                                        Rx Required
                                                    </span>
                                                )}

                                                {/* Electronics */}
                                                {p.brand && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                                                        {p.brand} {p.model ? `• ${p.model}` : ''}
                                                    </span>
                                                )}
                                                {p.warrantyMonths !== undefined && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold flex items-center gap-1">
                                                        <Shield className="w-2.5 h-2.5" /> {p.warrantyMonths}m Warranty
                                                    </span>
                                                )}

                                                {/* Fashion */}
                                                {p.size && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-300">
                                                        Size {p.size}
                                                    </span>
                                                )}
                                                {p.color && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300">
                                                        {p.color}
                                                    </span>
                                                )}

                                                {/* Hardware */}
                                                {p.grade && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-500/10 text-amber-400">
                                                        {p.grade} {p.gauge ? `(${p.gauge})` : ''}
                                                    </span>
                                                )}

                                                {/* Wholesale */}
                                                {p.minOrderQty !== undefined && p.minOrderQty > 1 && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-400">
                                                        MOQ: {p.minOrderQty}
                                                    </span>
                                                )}
                                                {p.cartonQty !== undefined && p.cartonQty > 1 && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300">
                                                        {p.cartonQty}/box
                                                    </span>
                                                )}

                                                {/* Retail */}
                                                {p.mrp !== undefined && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] text-muted-foreground font-mono">
                                                        MRP: {formatINR(p.mrp)}
                                                    </span>
                                                )}

                                                {!p.brand && !p.batchNumber && !p.size && !p.grade && !p.minOrderQty && !p.composition && (
                                                    <span className="text-[10px] text-muted-foreground italic">Standard item</span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-3.5 text-right font-bold text-foreground">
                                            {formatINR(p.price)}
                                        </td>

                                        {isAdmin && (
                                            <td className="p-3.5 text-right text-muted-foreground font-mono">
                                                {p.cost !== undefined ? formatINR(p.cost) : '—'}
                                            </td>
                                        )}

                                        <td className="p-3.5 text-center">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full font-bold text-[11px]",
                                                p.stock === 0
                                                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                                    : isLowStock
                                                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                                        : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                            )}>
                                                {p.stock} {p.unitOfMeasure || 'units'}
                                            </span>
                                        </td>

                                        <td className="p-3.5 text-right pr-5">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => executeRestock(p.id)}
                                                        className="px-2 py-1 bg-muted hover:bg-brand-600 hover:text-white rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                                                        title="Quick Restock"
                                                    >
                                                        +10
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setSelectedProductId(p.id)}
                                                    className="px-2.5 py-1 border border-border hover:bg-muted rounded-lg text-[10px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                                                >
                                                    Inspect
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none">
                    <div className="fixed inset-0" onClick={() => setSelectedProductId(null)} />

                    <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4">
                        <div className="flex items-start justify-between pb-3 border-b border-border">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl p-2 bg-muted rounded-2xl">{selectedProduct.image}</span>
                                <div>
                                    <h3 className="font-display font-bold text-lg">{selectedProduct.name}</h3>
                                    <p className="text-xs text-muted-foreground font-mono">{selectedProduct.sku} &bull; {selectedProduct.category}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedProductId(null)} className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-muted/40 rounded-xl border border-border/60">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Selling Price</span>
                                <span className="text-base font-bold text-foreground">{formatINR(selectedProduct.price)}</span>
                            </div>
                            {isAdmin && (
                                <div className="p-3 bg-muted/40 rounded-xl border border-border/60">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Purchase Cost</span>
                                    <span className="text-base font-bold text-foreground">{formatINR(selectedProduct.cost)}</span>
                                </div>
                            )}
                            <div className="p-3 bg-muted/40 rounded-xl border border-border/60">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Current Stock</span>
                                <span className="text-base font-bold text-brand-500">{selectedProduct.stock} units</span>
                            </div>
                            <div className="p-3 bg-muted/40 rounded-xl border border-border/60">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Safety Buffer</span>
                                <span className="text-base font-bold">{selectedProduct.minStock} units</span>
                            </div>
                        </div>

                        {/* Industry attributes details */}
                        <div className="p-3.5 bg-muted/20 border border-border rounded-xl space-y-2 text-xs">
                            <span className="text-[10px] uppercase font-bold text-brand-400 block mb-1">
                                {businessType} Metadata
                            </span>
                            {selectedProduct.brand && <p><strong className="text-muted-foreground">Brand:</strong> {selectedProduct.brand}</p>}
                            {selectedProduct.model && <p><strong className="text-muted-foreground">Model:</strong> {selectedProduct.model}</p>}
                            {selectedProduct.warrantyMonths && <p><strong className="text-muted-foreground">Warranty:</strong> {selectedProduct.warrantyMonths} Months</p>}
                            {selectedProduct.batchNumber && <p><strong className="text-muted-foreground">Batch No:</strong> {selectedProduct.batchNumber}</p>}
                            {selectedProduct.expiryDate && <p><strong className="text-muted-foreground">Expiry Date:</strong> {selectedProduct.expiryDate}</p>}
                            {selectedProduct.composition && <p><strong className="text-muted-foreground">Formula:</strong> {selectedProduct.composition}</p>}
                            {selectedProduct.size && <p><strong className="text-muted-foreground">Size / Color:</strong> {selectedProduct.size} {selectedProduct.color ? `(${selectedProduct.color})` : ''}</p>}
                            {selectedProduct.minOrderQty && <p><strong className="text-muted-foreground">MOQ:</strong> {selectedProduct.minOrderQty} units</p>}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setSelectedProductId(null)}
                                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
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

export default Products;
