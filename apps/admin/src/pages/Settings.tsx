import React, { useState } from 'react';
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
    EyeOff
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'sonner';

type SettingsSection = 'business' | 'tax' | 'notifications' | 'security' | 'backup' | 'appearance';

const SectionButton: React.FC<{
    id: SettingsSection;
    active: SettingsSection;
    icon: React.ElementType;
    label: string;
    description: string;
    setActive: (s: SettingsSection) => void;
}> = ({ id, active, icon: Icon, label, description, setActive }) => (
    <button
        onClick={() => setActive(id)}
        className={cn(
            "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200",
            active === id
                ? "bg-brand-50 dark:bg-brand-500/10 border border-brand-200/60 dark:border-brand-500/20 text-brand-600 dark:text-brand-400"
                : "hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent"
        )}
    >
        <div className={cn(
            "p-2 rounded-lg flex-shrink-0",
            active === id ? "bg-brand-100 dark:bg-brand-500/20" : "bg-muted"
        )}>
            <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{label}</p>
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

export const Settings: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [activeSection, setActiveSection] = useState<SettingsSection>('business');
    const [showAPIKey, setShowAPIKey] = useState(false);
    const [saved, setSaved] = useState(false);

    // ── Business Profile state ─────────────────────────────────────────────
    const [businessName, setBusinessName] = useState('Equinox Merchant Store');
    const [businessEmail, setBusinessEmail] = useState('admin@equinoxstore.com');
    const [phone, setPhone] = useState('+1 (555) 0100');
    const [address, setAddress] = useState('499 Commerce Park, Suite 200, New York, NY 10012');
    const [website, setWebsite] = useState('https://equinox.store');

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

    const handleSave = () => {
        setSaved(true);
        toast.success('Settings saved successfully.');
        setTimeout(() => setSaved(false), 2500);
    };

    const handleExportData = () => {
        toast.success('Data export initiated. You will receive an email with the download link.');
    };
    const handleClearCache = () => {
        toast.info('Application cache cleared successfully.');
    };

    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight">Business Settings</h1>
                    <p className="text-muted-foreground text-xs mt-1">Configure your store profile, tax compliance, security, and integrations.</p>
                </div>
                <button
                    onClick={handleSave}
                    className={cn(
                        "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition-all",
                        saved
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-brand-600 hover:bg-brand-700 text-white"
                    )}
                >
                    {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Nav */}
                <div className="lg:col-span-3 space-y-1.5">
                    <SectionButton id="business" active={activeSection} icon={Building2} label="Business Profile" description="Store name, contacts" setActive={setActiveSection} />
                    <SectionButton id="tax" active={activeSection} icon={Percent} label="Tax & GST Config" description="GST, PAN, HSN codes" setActive={setActiveSection} />
                    <SectionButton id="notifications" active={activeSection} icon={Bell} label="Notifications" description="Alerts & channels" setActive={setActiveSection} />
                    <SectionButton id="security" active={activeSection} icon={Shield} label="Security" description="2FA, sessions, API" setActive={setActiveSection} />
                    <SectionButton id="backup" active={activeSection} icon={Database} label="Data & Backup" description="Export, restore, purge" setActive={setActiveSection} />
                    <SectionButton id="appearance" active={activeSection} icon={Palette} label="Appearance" description="Theme, language" setActive={setActiveSection} />
                </div>

                {/* Content Panel */}
                <div className="lg:col-span-9 bg-card border border-border rounded-2xl p-6">

                    {/* ── Business Profile ── */}
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

                    {/* ── Tax Config ── */}
                    {activeSection === 'tax' && (
                        <div>
                            <h2 className="font-semibold flex items-center gap-2 mb-5">
                                <Percent className="w-4.5 h-4.5 text-brand-500" />
                                Tax & GST Configuration
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
                                                "px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all",
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

                    {/* ── Notifications ── */}
                    {activeSection === 'notifications' && (
                        <div>
                            <h2 className="font-semibold flex items-center gap-2 mb-5">
                                <Bell className="w-4.5 h-4.5 text-brand-500" />
                                Notification Preferences
                            </h2>
                            <p className="text-xs text-muted-foreground mb-5">Control which events trigger in-app and external alerts.</p>

                            {[
                                { label: 'Low Stock Alerts', description: 'When product stock drops at or below minimum threshold', value: notifLowStock, set: setNotifLowStock },
                                { label: 'New Invoice Created', description: 'When a POS transaction is completed and invoice generated', value: notifNewOrder, set: setNotifNewOrder },
                                { label: 'Payment Received', description: 'When a customer completes a payment', value: notifPayment, set: setNotifPayment },
                            ].map(item => (
                                <FormField key={item.label} label={item.label} description={item.description}>
                                    <button onClick={() => item.set(!item.value)} className={toggleCls(item.value)}>
                                        <div className={toggleKnob(item.value)} />
                                    </button>
                                </FormField>
                            ))}

                            <div className="border-t border-border pt-5 mt-2">
                                <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider text-xs">Delivery Channels</h3>
                                {[
                                    { label: 'Email Notifications', description: 'Send alerts to business email', value: notifEmail, set: setNotifEmail },
                                    { label: 'SMS Notifications', description: 'Send SMS to registered phone number', value: notifSMS, set: setNotifSMS },
                                ].map(item => (
                                    <FormField key={item.label} label={item.label} description={item.description}>
                                        <button onClick={() => item.set(!item.value)} className={toggleCls(item.value)}>
                                            <div className={toggleKnob(item.value)} />
                                        </button>
                                    </FormField>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Security ── */}
                    {activeSection === 'security' && (
                        <div>
                            <h2 className="font-semibold flex items-center gap-2 mb-5">
                                <Shield className="w-4.5 h-4.5 text-brand-500" />
                                Security & Access
                            </h2>
                            <FormField label="Two-Factor Authentication" description="Require OTP verification on every login">
                                <button onClick={() => setTwoFactorEnabled(!twoFactorEnabled)} className={toggleCls(twoFactorEnabled)}>
                                    <div className={toggleKnob(twoFactorEnabled)} />
                                </button>
                            </FormField>
                            <FormField label="Session Timeout" description="Auto-logout after inactivity (minutes)">
                                <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} className={`${inputCls} w-32`}>
                                    <option value="15">15 min</option>
                                    <option value="30">30 min</option>
                                    <option value="60">1 hour</option>
                                    <option value="240">4 hours</option>
                                    <option value="0">Never</option>
                                </select>
                            </FormField>
                            <FormField label="API Secret Key" description="Used for external integrations and webhooks">
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                        <input
                                            type={showAPIKey ? 'text' : 'password'}
                                            value={import.meta.env.VITE_STRIPE_SECRET_KEY || "sk_test_placeholder"}
                                            readOnly
                                            className={`${inputCls} pl-9 pr-9 font-mono text-xs`}
                                        />
                                        <button
                                            onClick={() => setShowAPIKey(!showAPIKey)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showAPIKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => toast.success('New API key generated.')}
                                        className="px-3 py-2 text-xs font-semibold border border-border rounded-lg hover:bg-muted transition-colors"
                                    >
                                        Regenerate
                                    </button>
                                </div>
                            </FormField>

                            <div className="mt-6 p-4 bg-rose-500/5 border border-rose-300/30 dark:border-rose-500/20 rounded-xl">
                                <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> Danger Zone
                                </h3>
                                <p className="text-xs text-muted-foreground mb-3">These actions are irreversible. All sessions will be terminated.</p>
                                <button
                                    onClick={() => toast.error('All sessions terminated.', { description: 'Please log in again.' })}
                                    className="px-3 py-1.5 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-300/40 dark:border-rose-500/30 rounded-lg transition-colors"
                                >
                                    Terminate All Active Sessions
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Data & Backup ── */}
                    {activeSection === 'backup' && (
                        <div>
                            <h2 className="font-semibold flex items-center gap-2 mb-5">
                                <Database className="w-4.5 h-4.5 text-brand-500" />
                                Data Management & Backup
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted/40 border border-border rounded-xl">
                                    <div>
                                        <h3 className="text-sm font-semibold">Export All Data</h3>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">Download invoices, customers, and products as a JSON or CSV archive.</p>
                                    </div>
                                    <button
                                        onClick={handleExportData}
                                        className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold hover:shadow-md transition-all"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Export
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted/40 border border-border rounded-xl">
                                    <div>
                                        <h3 className="text-sm font-semibold">Import Data</h3>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">Upload a previously exported backup to restore your business data.</p>
                                    </div>
                                    <button
                                        onClick={() => toast.info('Import dialog opening...')}
                                        className="flex items-center gap-1.5 px-3.5 py-2 border border-border hover:bg-muted text-muted-foreground rounded-xl text-xs font-semibold transition-all"
                                    >
                                        <Upload className="w-3.5 h-3.5" /> Import
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted/40 border border-border rounded-xl">
                                    <div>
                                        <h3 className="text-sm font-semibold">Clear App Cache</h3>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">Free up storage used by temporary data and cached assets.</p>
                                    </div>
                                    <button
                                        onClick={handleClearCache}
                                        className="flex items-center gap-1.5 px-3.5 py-2 border border-border hover:bg-muted text-muted-foreground rounded-xl text-xs font-semibold transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Clear Cache
                                    </button>
                                </div>

                                <div className="p-4 bg-muted/20 rounded-xl border border-border">
                                    <h3 className="text-sm font-semibold mb-3">Automatic Backup Schedule</h3>
                                    <div className="flex items-center gap-3">
                                        <select className={`${inputCls} w-40`} defaultValue="daily">
                                            <option value="hourly">Every Hour</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="manual">Manual Only</option>
                                        </select>
                                        <span className="text-xs text-muted-foreground">Last backup: <span className="font-semibold text-foreground">Jul 31, 2026 03:00 AM</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Appearance ── */}
                    {activeSection === 'appearance' && (
                        <div>
                            <h2 className="font-semibold flex items-center gap-2 mb-5">
                                <Palette className="w-4.5 h-4.5 text-brand-500" />
                                Appearance & Display
                            </h2>
                            <FormField label="Color Theme" description="Switch between dark and light interface modes">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => theme !== 'dark' && toggleTheme()}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all",
                                            theme === 'dark'
                                                ? "bg-slate-900 border-brand-500 text-white shadow-md shadow-brand-500/20"
                                                : "border-border text-muted-foreground hover:border-border-hover"
                                        )}
                                    >
                                        🌙 Dark Mode
                                    </button>
                                    <button
                                        onClick={() => theme !== 'light' && toggleTheme()}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all",
                                            theme === 'light'
                                                ? "bg-white border-brand-500 text-slate-900 shadow-md"
                                                : "border-border text-muted-foreground hover:border-border-hover"
                                        )}
                                    >
                                        ☀️ Light Mode
                                    </button>
                                </div>
                            </FormField>
                            <FormField label="Display Language">
                                <select className={`${inputCls} w-48`} defaultValue="en">
                                    <option value="en">🇺🇸 English (US)</option>
                                    <option value="en-in">🇮🇳 English (India)</option>
                                    <option value="hi">हिंदी</option>
                                    <option value="ta">தமிழ்</option>
                                </select>
                            </FormField>
                            <FormField label="Currency Format">
                                <select className={`${inputCls} w-48`} defaultValue="usd">
                                    <option value="usd">$ USD</option>
                                    <option value="inr">₹ INR</option>
                                    <option value="eur">€ EUR</option>
                                    <option value="gbp">£ GBP</option>
                                </select>
                            </FormField>
                            <FormField label="Date Format">
                                <select className={`${inputCls} w-48`} defaultValue="mdy">
                                    <option value="mdy">MM/DD/YYYY</option>
                                    <option value="dmy">DD/MM/YYYY</option>
                                    <option value="ymd">YYYY-MM-DD</option>
                                </select>
                            </FormField>
                        </div>
                    )}

                    {/* Save Button (inline) */}
                    <div className="pt-6 flex justify-end">
                        <button
                            onClick={handleSave}
                            className={cn(
                                "flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm active:scale-95 transition-all",
                                saved ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-brand-600 hover:bg-brand-700 text-white"
                            )}
                        >
                            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {saved ? 'Changes Saved!' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
