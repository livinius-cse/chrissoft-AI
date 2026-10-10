import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/utils/cn';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground transition-all duration-300">
            {/* Left Sidebar navigation */}
            <div className="hidden md:block">
                <Sidebar
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                />
            </div>

            {/* Mobile Sidebar Navigation Drawer */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 transform md:hidden transition-transform duration-300 ease-in-out",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <Sidebar
                    collapsed={false}
                    setCollapsed={() => { }}
                />
            </div>

            {/* Work Area Grid Wrapper */}
            <div
                className={cn(
                    "transition-all duration-300 min-h-screen flex flex-col",
                    collapsed ? "md:pl-20" : "md:pl-64"
                )}
            >
                <Header
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    mobileOpen={mobileOpen}
                    setMobileOpen={setMobileOpen}
                />

                <main className="flex-1 p-4 sm:p-6 overflow-y-auto w-full max-w-(screen-2xl) mx-auto">
                    {children}
                </main>
            </div>

            {/* Backdrop overlay for mobile drawer */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 bg-gray-900/50 z-30 md:hidden backdrop-blur-xs animate-in fade-in duration-200"
                />
            )}
        </div>
    );
};
export default DashboardLayout;
