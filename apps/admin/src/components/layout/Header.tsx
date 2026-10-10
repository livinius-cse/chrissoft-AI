import React, { useState } from 'react';
import {
    Search,
    Bell,
    Sun,
    Moon,
    Plus,
    User,
    Settings,
    LogOut,
    Calendar,
    Sparkles,
    Command,
    ArrowRight,
    TrendingUp,
    X
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';
import { Link, useNavigate } from 'react-router-dom';
import { AIAssistantModal } from '../AIAssistantModal';

interface HeaderProps {
    collapsed: boolean;
    setCollapsed: (c: boolean) => void;
    mobileOpen: boolean;
    setMobileOpen: (o: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
    const { theme, toggleTheme } = useTheme();
    const { user, role, isAdmin, logout } = useAuth();
    const { activities, products, customers, searchQuery, setSearchQuery, isBackendConnected } = useApp();
    const navigate = useNavigate();

    // Dropdown states
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [commandQuery, setCommandQuery] = useState('');

    // Unread stock alert activities count
    const unreadCount = activities.filter(a => a.type === 'stock').length;

    const handleCommandShortcut = (e: React.KeyboardEvent) => {
        if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            setShowCommandPalette(true);
        }
    };

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                setShowCommandPalette(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Search filter inside command palette
    const filteredProducts = commandQuery
        ? products.filter(p => p.name.toLowerCase().includes(commandQuery.toLowerCase()) || p.sku.toLowerCase().includes(commandQuery.toLowerCase()))
        : products.slice(0, 3);

    const filteredCustomers = commandQuery
        ? customers.filter(c => c.name.toLowerCase().includes(commandQuery.toLowerCase()) || c.email.toLowerCase().includes(commandQuery.toLowerCase()))
        : customers.slice(0, 3);

    const handleSelectCommandItem = (path: string) => {
        navigate(path);
        setShowCommandPalette(false);
        setCommandQuery('');
    };

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-6 bg-card/85 backdrop-blur-md border-b border-border select-none">

            {/* Search Input Trigger Command Palette */}
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 hover:bg-muted border border-border/40 hover:border-border rounded-xl md:hidden text-muted-foreground hover:text-foreground transition-all duration-150"
                >
                    <span className="sr-only">Toggle Sidebar</span>
                    <MenuIcon className="w-5 h-5" />
                </button>

                <div className="relative max-w-md w-full hidden md:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                        <Search className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search products, invoices, clients... (Ctrl+K)"
                        onClick={() => setShowCommandPalette(true)}
                        readOnly
                        className="w-full pl-10 pr-12 py-2 bg-muted/50 border border-border hover:border-border-hover focus:outline-none rounded-xl text-sm transition-all duration-200 cursor-pointer placeholder-muted-foreground/80"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 border border-border/80 rounded bg-card text-[10px] font-medium text-muted-foreground shadow-sm">
                            <Command className="w-2.5 h-2.5" /> K
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Right Navbar Controls */}
            <div className="flex items-center gap-3">
                {/* AI Assistant Button (Admin Only) */}
                {isAdmin && (
                    <button
                        onClick={() => setShowAIAssistant(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 duration-150 cursor-pointer"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span className="hidden sm:inline">AI Copilot</span>
                    </button>
                )}

                {/* API Status indicator */}
                <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium border bg-muted/40 border-border">
                    <span className={cn("w-2 h-2 rounded-full", isBackendConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400")} />
                    <span className="text-muted-foreground">{isBackendConnected ? "API Connected" : "Local Sync"}</span>
                </div>

                {/* Quick Add Button */}
                <div className="relative">
                    <button
                        onClick={() => setShowQuickAdd(!showQuickAdd)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/10 transition-all duration-150"
                    >
                        <Plus className="w-4.5 h-4.5" />
                        <span className="hidden sm:inline">Quick Entry</span>
                    </button>

                    {showQuickAdd && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowQuickAdd(false)} />
                            <div className="absolute right-0 mt-2.5 w-56 rounded-xl border border-border bg-card p-2 shadow-lg z-50 animate-in fade-in-50 slide-in-from-top-3 duration-250">
                                <div className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground border-b border-border/60 mb-1">
                                    Actions
                                </div>
                                <button
                                    onClick={() => { setShowQuickAdd(false); navigate('/billing'); }}
                                    className="w-full flex items-center justify-between px-2.5 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors text-left"
                                >
                                    Create Invoice <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                                {isAdmin && (
                                    <button
                                        onClick={() => { setShowQuickAdd(false); navigate('/products?add=true'); }}
                                        className="w-full flex items-center justify-between px-2.5 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors text-left"
                                    >
                                        Register Product <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                                    </button>
                                )}
                                <button
                                    onClick={() => { setShowQuickAdd(false); navigate('/customers?add=true'); }}
                                    className="w-full flex items-center justify-between px-2.5 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors text-left"
                                >
                                    Register Customer <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Date Display */}
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-muted/40 border border-border/50 rounded-xl text-xs font-medium text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Jul 30, 2026</span>
                </div>

                {/* Theme Action Switcher */}
                <button
                    onClick={toggleTheme}
                    className="p-2.5 hover:bg-muted border border-border/30 hover:border-border rounded-xl text-muted-foreground hover:text-foreground transition-all duration-150 active:scale-95"
                >
                    {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
                </button>

                {/* Alerts / Activity Feed */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2.5 hover:bg-muted border border-border/30 hover:border-border rounded-xl text-muted-foreground hover:text-foreground transition-all duration-150 relative active:scale-95"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-bounce" />
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                            <div className="absolute right-0 mt-2.5 w-[380px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card p-1 shadow-xl z-50 animate-in fade-in-50 slide-in-from-top-3 duration-250">
                                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border/60">
                                    <span className="font-semibold text-sm">Workspace Alerts</span>
                                    <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 font-medium text-[10px] rounded-full">
                                        {unreadCount} Warning{unreadCount !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto p-1.5 space-y-1">
                                    {activities.slice(0, 4).map((act) => (
                                        <div
                                            key={act.id}
                                            className={cn(
                                                "p-2.5 hover:bg-muted/80 rounded-lg transition-colors border border-transparent",
                                                act.type === 'stock' ? 'bg-amber-500/[0.02] dark:bg-amber-500/[0.01]' : ''
                                            )}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <div className={cn(
                                                    "w-2 h-2 mt-1.5 rounded-full flex-shrink-0",
                                                    act.type === 'sale' ? 'bg-emerald-500' :
                                                        act.type === 'stock' ? 'bg-amber-500' :
                                                            act.type === 'customer' ? 'bg-blue-500' : 'bg-slate-400'
                                                )} />
                                                <div>
                                                    <p className="text-xs font-semibold text-foreground/90">{act.title}</p>
                                                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{act.description}</p>
                                                    <span className="text-[10px] text-muted-foreground/60 block mt-1.5">{act.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {activities.length === 0 && (
                                        <div className="py-8 text-center text-xs text-muted-foreground">All cleared! No activities log.</div>
                                    )}
                                </div>
                                <div className="p-2 border-t border-border/60 text-center">
                                    <button
                                        onClick={() => { setShowNotifications(false); navigate('/reports'); }}
                                        className="text-[11px] font-semibold text-brand-600 dark:text-brand-500 hover:underline"
                                    >
                                        View activity history
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* User profile dropdown drawer */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        className="flex items-center focus:outline-none"
                    >
                        <div className="w-9 h-9 rounded-xl overflow-hidden border border-border hover:border-border-hover shadow-sm transition-all duration-150">
                            <div className="w-full h-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                        </div>
                    </button>

                    {showProfile && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                            <div className="absolute right-0 mt-2.5 w-52 rounded-xl border border-border bg-card p-1 shadow-lg z-50 animate-in fade-in-50 slide-in-from-top-3 duration-250">
                                <div className="px-3 py-2 border-b border-border/60 mb-1">
                                    <p className="text-xs font-semibold text-foreground">{user?.name || 'Alexander Wright'}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono uppercase">
                                        {isAdmin ? 'Administrator' : 'Staff (Cashier)'}
                                    </p>
                                </div>
                                {isAdmin && (
                                    <button
                                        onClick={() => { setShowProfile(false); navigate('/settings'); }}
                                        className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors text-left"
                                    >
                                        <Settings className="w-3.5 h-3.5 text-muted-foreground" /> Business Settings
                                    </button>
                                )}
                                <div className="border-t border-border/60 my-1" />
                                <button
                                    onClick={() => { setShowProfile(false); logout(); navigate('/login'); }}
                                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors text-left font-medium"
                                >
                                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Command Palette Modal Dial */}
            {showCommandPalette && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="fixed inset-0" onClick={() => { setShowCommandPalette(false); setCommandQuery(''); }} />

                    <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl p-0 overflow-hidden animate-in slide-in-from-top-4 duration-300">
                        {/* Command Input Box */}
                        <div className="flex items-center gap-3 px-4 border-b border-border">
                            <Search className="w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Type a product, customer name or path..."
                                value={commandQuery}
                                onChange={(e) => setCommandQuery(e.target.value)}
                                autoFocus
                                className="w-full py-4 bg-transparent focus:outline-none text-sm placeholder-muted-foreground/80"
                            />
                            <button
                                onClick={() => { setShowCommandPalette(false); setCommandQuery(''); }}
                                className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                            >
                                <X className="w-4.5 h-4.5" />
                            </button>
                        </div>

                        {/* Content Results */}
                        <div className="max-h-[360px] overflow-y-auto p-2.5 space-y-3 select-none">

                            {/* Quick Navigation paths */}
                            <div>
                                <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    Quick Navigation
                                </div>
                                <div className="mt-1 grid grid-cols-2 gap-1">
                                    <button
                                        onClick={() => handleSelectCommandItem('/')}
                                        className="flex items-center gap-2 px-2.5 py-2 text-xs hover:bg-muted rounded-lg text-left"
                                    >
                                        <Command className="w-3.5 h-3.5 text-indigo-400" /> Go to Dashboard
                                    </button>
                                    <button
                                        onClick={() => handleSelectCommandItem('/billing')}
                                        className="flex items-center gap-2 px-2.5 py-2 text-xs hover:bg-muted rounded-lg text-left"
                                    >
                                        <Command className="w-3.5 h-3.5 text-indigo-400" /> Open POS Billing
                                    </button>
                                </div>
                            </div>

                            {/* Products Results */}
                            <div>
                                <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    Products ({filteredProducts.length})
                                </div>
                                <div className="mt-1 space-y-0.5">
                                    {filteredProducts.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleSelectCommandItem(`/products#${p.id}`)}
                                            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs hover:bg-muted/80 rounded-lg text-left"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{p.image}</span>
                                                <span className="font-medium">{p.name}</span>
                                                <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded font-mono">{p.sku}</span>
                                            </div>
                                            <span className="font-semibold text-muted-foreground">${p.price}</span>
                                        </button>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <p className="text-[11px] text-muted-foreground px-2.5">No products matched query.</p>
                                    )}
                                </div>
                            </div>

                            {/* Customers Results */}
                            <div>
                                <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    Clients ({filteredCustomers.length})
                                </div>
                                <div className="mt-1 space-y-0.5">
                                    {filteredCustomers.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => handleSelectCommandItem(`/customers#${c.id}`)}
                                            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs hover:bg-muted/80 rounded-lg text-left"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="font-medium">{c.name}</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">{c.email}</span>
                                        </button>
                                    ))}
                                    {filteredCustomers.length === 0 && (
                                        <p className="text-[11px] text-muted-foreground px-2.5">No customers matched query.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Command Palette Footer */}
                        <div className="px-4 py-2 border-t border-border flex items-center justify-between bg-muted/20 text-[10px] text-muted-foreground">
                            <span>Navigate with pointer &bull; Select to inspect details</span>
                            <span>ESC to Close</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ChrisSoft AI Assistant Modal */}
            <AIAssistantModal isOpen={showAIAssistant} onClose={() => setShowAIAssistant(false)} />
        </header>
    );
};

// Hamburger menu icon helper since menu comes from lucide but MenuIcon is cleaner
const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
);
