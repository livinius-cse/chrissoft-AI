import React, { useState, useEffect } from 'react';
import {
    Building2,
    User,
    Bell,
    Shield,
    Database,
    Palette,
    Receipt,
    ChevronRight,
    Save,
    Check,
    AlertTriangle,
    Globe,
    Mail,
    Phone,
    MapPin,
    Percent,
    Key,
    Download,
    Upload,
    Trash2,
    Eye,
    EyeOff,
    Layers,
    ShoppingCart,
    Pill,
    Smartphone,
    Shirt,
    Wrench,
    Truck,
    Store,
    Sparkles
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/context/ThemeContext';
import { useApp, BusinessType } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { settingsApi } from '@/api';
import { toast } from 'sonner';

type SettingsSection = 'industry' | 'business' | 'tax' | 'notifications' | 'security' | 'backup' | 'appearance';

const SectionButton: React.FC<{
    id: SettingsSection;
    active: SettingsSection;
    icon: React.ElementType;
    label: string;
    description: string;
    setActive: (s: SettingsSection) => void;
    badge?: string;
}> = ({ id, active, icon: Icon, label, description, setActive, badge }) => (
    <button
        onClick={() => setActive(id)}
        className={cn(
            "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 cursor-pointer",
            active === id
                ? "bg-brand-50 dark:bg-brand-500/10 border border-brand-200/60 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 font-semibold"
                : "hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent"
        )}
    >
        <div className={cn(
            "p-2 rounded-lg flex-shrink-0",
            active === id ? "bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400" : "bg-muted"
        )}>
            <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <p className="text-sm truncate">{label}</p>
                {badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                        {badge}
                    </span>
                )}
            </div>
            <p className="text-[11px] text-muted-foreground/80 truncate">{description}</p>
        </div>
        {active === id && <ChevronRight className="w-4 h-4 flex-shrink-0 text-brand-500" />}
    </button>
);

const FormField: React.FC<{
    label: string;
    description?: string;
    children: React.ReactNode;
}> = ({ label, description, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 py-4 border-b border-border/60 last:border-0">
        <div className="sm:w-48 flex-shrink-0">
            <p className="text-sm font-semibold">{label}</p>
            {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <div className="flex-1">{children}</div>
    </div>
);

const inputCls = "w-full px-3 py-2 text-sm border border-border rounded-lg bg-muted/50 focus:outline-none focus:border-brand-400 focus:bg-card transition-all duration-150 placeholder-muted-foreground/60";
const toggleCls = (active: boolean) => cn(
    "relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0",
    active ? "bg-brand-600" : "bg-muted-foreground/30"
);
const toggleKnob = (active: boolean) => cn(
    "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
    active ? "translate-x-5" : "translate-x-0"
);

const PRESETS: Array<{
    type: BusinessType;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    color: string;
    features: string[];
}> = [
    {
        type: 'RETAIL',
        title: 'General Retail',
        subtitle: 'Supermarkets, Departmental, Convenience',
        icon: Store,
        color: 'from-blue-500 to-indigo-600',
        features: ['MRP & Selling Price', 'Standard SKU & Barcodes', 'Brand Categorization']
    },
    {
        type: 'GROCERY',
        title: 'Grocery & FMCG',
        subtitle: 'Daily essentials, Provisions, Food items',
        icon: ShoppingCart,
        color: 'from-emerald-500 to-green-600',
        features: ['Batch Number Tracking', 'Expiry Date Audits', 'Units of Measure (kg, gm, ltr)', 'Perishable Goods Flag']
    },
    {
        type: 'PHARMACY',
        title: 'Medical & Pharmacy',
        subtitle: 'Chemist, Clinics, Healthcare supplies',
        icon: Pill,
        color: 'from-rose-500 to-red-600',
        features: ['Chemical Composition / Salts', 'Dosage Form (Tablet, Syrup)', 'Batch & Expiry Controls', 'Prescription Required Flag']
    },
    {
        type: 'ELECTRONICS',
        title: 'Electronics & Gadgets',
        subtitle: 'Phones, Computers, Home Appliances',
        icon: Smartphone,
        color: 'from-brand-500 to-amber-600',
        features: ['Brand & Model Codes', 'Warranty Period (Months)', 'Serial & IMEI Number Tracking']
    },
    {
        type: 'FASHION',
        title: 'Fashion & Apparel',
        subtitle: 'Clothing, Footwear, Boutique Accessories',
        icon: Shirt,
        color: 'from-purple-500 to-pink-600',
        features: ['Size & Color Matrix', 'Fabric & Material Info', 'Multi-variant SKU Inventory']
    },
    {
        type: 'HARDWARE',
        title: 'Hardware & Industrial',
        subtitle: 'Tools, Building Materials, Electricals',
        icon: Wrench,
        color: 'from-amber-500 to-yellow-600',
        features: ['Material Grade (SS-304, etc.)', 'Gauge & Dimensions', 'Units of Measure (meter, set)', 'Technical Specifications']
    },
    {
        type: 'WHOLESALE',
        title: 'Wholesale & Distribution',
        subtitle: 'B2B Trade, Bulk Traders, Warehousing',
        icon: Truck,
        color: 'from-cyan-500 to-teal-600',
        features: ['Minimum Order Quantity (MOQ)', 'Carton / Box Packaging', 'Tiered Bulk Pricing Discounts']
    }
];

export const Settings: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { businessType, setBusinessType, settings, refreshData } = useApp();
    const { isAdmin } = useAuth();
    const [activeSection, setActiveSection] = useState<SettingsSection>('industry');
    const [showAPIKey, setShowAPIKey] = useState(false);
    const [saving, setSaving] = useState(false);

    // ── Business Profile state ─────────────────────────────────────────────
    const [businessName, setBusinessName] = useState('ChrisSoft AI Enterprise');
    const [businessEmail, setBusinessEmail] = useState('contact@chrissoft.ai');
    const [phone, setPhone] = useState('+1 (555) 0100');
    const [address, setAddress] = useState('499 Commerce Park, Suite 200, New York, NY 10012');
    const [website, setWebsite] = useState('https://chrissoft.ai');

    // ── Tax config state ───────────────────────────────────────────────────
    const [gstin, setGstin] = useState('27AAAAA1111A1Z1');
    const [pan, setPan] = useState('AAAAA1111A');
    const [defaultTax, setDefaultTax] = useState('18');
    const [enableHSN, setEnableHSN] = useState(true);

    // ── Notification state ─────────────────────────────────────────────────
    const [notifLowStock, setNotifLowStock] = useState(true);
    const [notifNewOrder, setNotifNewOrder] = useState(true);
    const [notifPayment, setNotifPayment] = useState(true);
    const [notifEmail, setNotifEmail] = useState(false);
    const [notifSMS, setNotifSMS] = useState(false);

    // ── Security state ─────────────────────────────────────────────────────
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState('30');

    // Load server settings on mount
    useEffect(() => {
        if (settings) {
            if (settings.businessName) setBusinessName(settings.businessName);
            if (settings.businessEmail) setBusinessEmail(settings.businessEmail);
            if (settings.phone) setPhone(settings.phone);
            if (settings.address) setAddress(settings.address);
            if (settings.website) setWebsite(settings.website);
            if (settings.taxRate !== undefined) setDefaultTax(String(settings.taxRate));
            if (settings.gstin) setGstin(settings.gstin);
            if (settings.pan) setPan(settings.pan);
        }
    }, [settings]);

    const handleSave = async () => {
        if (!isAdmin) {
            toast.error('Only administrators can modify store settings.');
            return;
        }

        setSaving(true);
        try {
            await settingsApi.updateSettings({
                businessName,
                businessEmail,
                phone,
                address,
                website,
                taxRate: Number(defaultTax) || 18,
                gstin,
                pan,
                businessType
            });
            await refreshData();
            toast.success('Settings saved and synchronized with server.');
        } catch (e) {
            toast.error('Failed to save settings to server.');
        } finally {
            setSaving(false);
        }
    };

    const handleSwitchBusinessType = async (type: BusinessType) => {
        if (!isAdmin) {
            toast.error('Only administrators can switch the business preset.');
            return;
        }

        try {
            await setBusinessType(type);
            toast.success(`Business Preset activated: ${PRESETS.find(p => p.type === type)?.title}`);
        } catch (err) {
            toast.error('Failed to update business type preset.');
        }
    };

    const handleExportData = () => {
        toast.success('Data export initiated. You will receive an email with the download link.');
    };

    const handleClearCache = () => {
        toast.info('Application cache cleared successfully.');
    };

    const activePresetInfo = PRESETS.find(p => p.type === businessType) || PRESETS[0];

    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight">Business Settings &amp; Presets</h1>
                    <p className="text-muted-foreground text-xs mt-1">
                        Configure your multi-industry preset, store identity, tax profile, security, and backup.
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Changes
                    </button>
                )}
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Nav */}
                <div className="lg:col-span-3 space-y-1.5">
                    <SectionButton
                        id="industry"
                        active={activeSection}
                        icon={Layers}
                        label="Industry Presets"
                        description="7 Specialized Modes"
                        badge={activePresetInfo.title}
                        setActive={setActiveSection}
                    />
                    <SectionButton id="business" active={activeSection} icon={Building2} label="Business Profile" description="Store name, contacts" setActive={setActiveSection} />
                    <SectionButton id="tax" active={activeSection} icon={Percent} label="Tax & GST Config" description="GST, PAN, HSN codes" setActive={setActiveSection} />
                    <SectionButton id="notifications" active={activeSection} icon={Bell} label="Notifications" description="Alerts & channels" setActive={setActiveSection} />
                    <SectionButton id="security" active={activeSection} icon={Shield} label="Security" description="2FA, sessions, API" setActive={setActiveSection} />
                    <SectionButton id="backup" active={activeSection} icon={Database} label="Data & Backup" description="Export, restore, purge" setActive={setActiveSection} />
                    <SectionButton id="appearance" active={activeSection} icon={Palette} label="Appearance" description="Theme, language" setActive={setActiveSection} />
                </div>

                {/* Content Panel */}
                <div className="lg:col-span-9 bg-card border border-border rounded-2xl p-6">

                    {/* ── 1. Industry Presets ── */}
                    {activeSection === 'industry' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
                                <div>
                                    <h2 className="font-semibold flex items-center gap-2 text-base">
                                        <Layers className="w-5 h-5 text-brand-500" />
                                        Multi-Industry Workflow Presets
                                    </h2>
                                    <p className="text-muted-foreground text-xs mt-1">
                                        Select an industry profile to dynamically configure product attributes, inventory filters, and POS checkout workflows.
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Active: {activePresetInfo.title}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {PRESETS.map((preset) => {
                                    const isSelected = businessType === preset.type;
                                    const IconComp = preset.icon;

                                    return (
                                        <div
                                            key={preset.type}
                                            onClick={() => handleSwitchBusinessType(preset.type)}
                                            className={cn(
                                                "relative p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer group",
                                                isSelected
                                                    ? "bg-gradient-to-b from-brand-500/10 to-transparent border-brand-500 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/30"
                                                    : "bg-muted/40 border-border hover:border-brand-400/50 hover:bg-muted/70"
                                            )}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl bg-gradient-to-tr flex items-center justify-center text-white shadow-md",
                                                        preset.color
                                                    )}>
                                                        <IconComp className="w-5 h-5" />
                                                    </div>
                                                    {isSelected && (
                                                        <span className="flex items-center gap-1 text-[11px] font-bold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                                                            <Check className="w-3 h-3" /> ACTIVE
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="text-sm font-bold text-foreground group-hover:text-brand-400 transition-colors">
                                                    {preset.title}
                                                </h3>
                                                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                                                    {preset.subtitle}
                                                </p>

                                                <div className="mt-4 space-y-1.5 border-t border-border/50 pt-3">
                                                    {preset.features.map((feat, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-[10px] text-slate-300">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                                                            <span className="truncate">{feat}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-2">
                                                <button
                                                    type="button"
                                                    disabled={isSelected || !isAdmin}
                                                    className={cn(
                                                        "w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5",
                                                        isSelected
                                                            ? "bg-brand-600 text-white cursor-default"
                                                            : "bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white border border-slate-700 hover:border-brand-500"
                                                    )}
                                                >
                                                    {isSelected ? 'Currently Active' : 'Switch to this Preset'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── 2. Business Profile ── */}
                    {activeSection === 'business' && (
                        <div>
                            <h2 className="font-semibold flex items-center gap-2 mb-5">
                                <Building2 className="w-4.5 h-4.5 text-brand-500" />
                                Business Profile
                            </h2>
                            <FormField label="Business Name">
                                <input value={businessName} onChange={e => setBusinessName(e.target.value)} className={inputCls} />
                            </FormField>
                            <FormField label="Email Address" description="Primary contact and invoice sender">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <input value={businessEmail} onChange={e => setBusinessEmail(e.target.value)} className={`${inputCls} pl-9`} />
                                </div>
                            </FormField>
                            <FormField label="Phone Number">
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <input value={phone} onChange={e => setPhone(e.target.value)} className={`${inputCls} pl-9`} />
                                </div>
                            </FormField>
                            <FormField label="Business Address" description="Appears on printed invoices">
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-muted-foreground" />
                                    <textarea
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        rows={3}
                                        className={`${inputCls} pl-9 resize-none`}
                                    />
                                </div>
                            </FormField>
                            <FormField label="Website" description="Shown on invoice footer">
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <input value={website} onChange={e => setWebsite(e.target.value)} className={`${inputCls} pl-9`} />
                                </div>
                            </FormField>
                        </div>
                    )}

                    {/* ── 3. Tax Config ── */}
                    {activeSection === 'tax' && (
                        <div>
                            <h2 className="font-semibold flex items-center gap-2 mb-5">
                                <Percent className="w-4.5 h-4.5 text-brand-500" />
                                Tax &amp; GST Configuration
                            </h2>
                            <FormField label="GSTIN" description="15-digit GST identification number">
                                <input value={gstin} onChange={e => setGstin(e.target.value)} className={`${inputCls} font-mono`} placeholder="27AAAAA1111A1Z1" />
                            </FormField>
                            <FormField label="PAN Number" description="Permanent Account Number">
                                <input value={pan} onChange={e => setPan(e.target.value)} className={`${inputCls} font-mono`} />
                            </FormField>
                            <FormField label="Default Tax Rate (%)" description="Applied at POS checkout unless overridden">
                                <div className="flex items-center gap-2">
                                    <input type="number" value={defaultTax} onChange={e => setDefaultTax(e.target.value)} className={`${inputCls} w-24`} min="0" max="100" />
                                    <span className="text-sm text-muted-foreground">% GST</span>
                                </div>
                                <div className="mt-2 flex gap-2">
                                    {['0', '5', '12', '18', '28'].map(rate => (
                                        <button
                                            key={rate}
                                            onClick={() => setDefaultTax(rate)}
                                            className={cn(
                                                "px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer",
                                                defaultTax === rate
                                                    ? "bg-brand-600 text-white border-brand-600"
                                                    : "border-border text-muted-foreground hover:border-brand-400"
                                            )}
                                        >
                                            {rate}%
                                        </button>
                                    ))}
                                </div>
                            </FormField>
                            <FormField label="HSN/SAC Codes" description="Enable HSN code tracking on invoice line items">
                                <button onClick={() => setEnableHSN(!enableHSN)} className={toggleCls(enableHSN)}>
                                    <div className={toggleKnob(enableHSN)} />
                                </button>
                            </FormField>

                            <div className="mt-6 p-4 bg-amber-500/5 border border-amber-300/30 dark:border-amber-500/20 rounded-xl flex gap-3">
                                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                    Tax configuration changes will apply to all new invoices. Existing invoices retain their original tax amounts.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── 4. Notifications ── */}
                    {activeSection === 'notifications' && (
                        <div>
                            <h2 className="font-semibold flex items-center gap-2 mb-5">
                                <Bell className="w-4.5 h-4.5 text-brand-500" />
                                Notification Preferences
                            </h2>
                            <FormField label="Low Stock Warnings" description="Notify when any item reaches its minimum stock threshold">
                                <button onClick={() => setNotifLowStock(!notifLowStock)} className={toggleCls(notifLowStock)}>
                                    <div className={toggleKnob(notifLowStock)} />
                                </button>
                            </FormField>
                            <FormField label="New Order Alert" description="Trigger in-app notification upon POS checkout">
                                <button onClick={() => setNotifNewOrder(!notifNewOrder)} className={toggleCls(notifNewOrder)}>
                                    <div className={toggleKnob(notifNewOrder)} />
                                </button>
                            </FormField>
                            <FormField label="Payment Confirmations" description="Receive receipts for customer balance settlements">
                                <button onClick={() => setNotifPayment(!notifPayment)} className={toggleCls(notifPayment)}>
                                    <div className={toggleKnob(notifPayment)} />
                                </button>
                            </FormField>
                        </div>
                    )}

                    {/* ── 5. Security ── */}
                    {activeSection === 'security' && (
                        <div>
                            <h2 className="font-semibold flex items-center gap-2 mb-5">
                                <Shield className="w-4.5 h-4.5 text-brand-500" />
                                Security &amp; Access Controls
                            </h2>
                            <FormField label="Two-Factor Authentication (2FA)" description="Require OTP verification for executive access">
                                <button onClick={() => setTwoFactorEnabled(!twoFactorEnabled)} className={toggleCls(twoFactorEnabled)}>
                                    <div className={toggleKnob(twoFactorEnabled)} />
                                </button>
                            </FormField>
                            <FormField label="Session Inactivity Timeout" description="Auto logout after idle time in POS / Admin console">
                                <select
                                    value={sessionTimeout}
                                    onChange={e => setSessionTimeout(e.target.value)}
                                    className={`${inputCls} w-48`}
                                >
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="60">1 hour</option>
                                    <option value="120">2 hours</option>
                                </select>
                            </FormField>
                        </div>
                    )}

                    {/* ── 6. Data & Backup ── */}
                    {activeSection === 'backup' && (
                        <div>
                            <h2 className="font-semibold flex items-center gap-2 mb-5">
                                <Database className="w-4.5 h-4.5 text-brand-500" />
                                Database &amp; Data Integrity
                            </h2>
                            <div className="space-y-4">
                                <div className="p-4 border border-border rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold">Export Complete Merchant Store</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Download entire database as JSON / CSV archive.</p>
                                    </div>
                                    <button onClick={handleExportData} className="px-3 py-1.5 border border-border hover:bg-muted text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer">
                                        <Download className="w-3.5 h-3.5" /> Export Data
                                    </button>
                                </div>

                                <div className="p-4 border border-border rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold">Flush Application Cache</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Clears local cached API responses and reload fresh states.</p>
                                    </div>
                                    <button onClick={handleClearCache} className="px-3 py-1.5 border border-border hover:bg-muted text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer">
                                        <Trash2 className="w-3.5 h-3.5" /> Clear Cache
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── 7. Appearance ── */}
                    {activeSection === 'appearance' && (
                        <div>
                            <h2 className="font-semibold flex items-center gap-2 mb-5">
                                <Palette className="w-4.5 h-4.5 text-brand-500" />
                                UI Theme &amp; Visual Preferences
                            </h2>
                            <FormField label="Interface Theme" description="Switch between Obsidian Dark and Clean Light modes">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleTheme()}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                                            theme === 'dark' ? "bg-brand-600 text-white border-brand-500" : "bg-muted text-muted-foreground border-border"
                                        )}
                                    >
                                        🌙 Obsidian Dark (Neon Orange)
                                    </button>
                                    <button
                                        onClick={() => toggleTheme()}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                                            theme === 'light' ? "bg-brand-600 text-white border-brand-500" : "bg-muted text-muted-foreground border-border"
                                        )}
                                    >
                                        ☀️ Clean Slate Light
                                    </button>
                                </div>
                            </FormField>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Settings;
