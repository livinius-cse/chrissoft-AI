import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    CreditCard,
    Users,
    ShoppingBag,
    Box,
    FileText,
    TrendingUp,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ShieldAlert,
    Menu,
    Sparkles
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    mobileOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Billing (POS)', path: '/billing', icon: CreditCard },
        { name: 'Customers', path: '/customers', icon: Users },
        { name: 'Products', path: '/products', icon: ShoppingBag },
        { name: 'Inventory', path: '/inventory', icon: Box },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Analytics', path: '/analytics', icon: TrendingUp },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <aside
            className={cn(
                "h-screen fixed top-0 left-0 z-40 bg-card border-r border-border transition-all duration-300 flex flex-col justify-between select-none",
                collapsed ? "w-20" : "w-64"
            )}
        >
            <div>
                {/* Logo Container */}
                <div className={cn(
                    "flex items-center gap-3 px-6 h-18 border-b border-border transition-all duration-300",
                    collapsed ? "justify-center" : "justify-between"
                )}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                        {!collapsed && (
                            <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/80">
                                ChrisSoft AI
                            </span>
                        )}
                    </div>

                    {!collapsed && (
                        <button
                            onClick={() => setCollapsed(true)}
                            className="p-1.5 hover:bg-muted border border-transparent hover:border-border rounded-lg text-muted-foreground hover:text-foreground transition-all duration-150"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Navigation Menu */}
                <nav className="p-3 space-y-1.5 mt-4">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={cn(
                                    "relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden",
                                    isActive
                                        ? "text-brand-600 dark:text-brand-500 bg-brand-50 dark:bg-brand-100/5 shadow-sm shadow-brand-500/5 font-semibold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                )}
                            >
                                {/* Active Indicator slide effect */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md bg-brand-600 dark:bg-brand-500" />
                                )}

                                <item.icon className={cn(
                                    "w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                                    isActive ? "text-brand-600 dark:text-brand-500" : "text-muted-foreground group-hover:text-foreground"
                                )} />

                                {!collapsed && (
                                    <span className="truncate">{item.name}</span>
                                )}

                                {/* Tooltip on Collapsed */}
                                {collapsed && (
                                    <div className="absolute left-24 px-2.5 py-1.5 bg-gray-900 dark:bg-gray-100 text-gray-100 dark:text-gray-900 text-xs font-semibold rounded-lg opacity-0 pointer-events-none translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-50 shadow-md">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-border space-y-2">
                {/* Toggle on Collapsed Screen */}
                {collapsed && (
                    <button
                        onClick={() => setCollapsed(false)}
                        className="w-full flex items-center justify-center p-2.5 hover:bg-muted border border-border/40 hover:border-border rounded-xl text-muted-foreground hover:text-foreground transition-all duration-150"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}

                <Link
                    to="/login"
                    className={cn(
                        "flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer overflow-hidden transition-all duration-150 group",
                        collapsed ? "justify-center" : ""
                    )}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                    {!collapsed && <span>Logout</span>}
                    {collapsed && (
                        <div className="absolute left-24 px-2.5 py-1.5 bg-rose-500 text-white text-xs font-semibold rounded-lg opacity-0 pointer-events-none translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-50 shadow-md">
                            Logout
                        </div>
                    )}
                </Link>
            </div>
        </aside>
    );
};
