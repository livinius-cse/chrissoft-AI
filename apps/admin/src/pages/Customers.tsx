import React, { useState } from 'react';
import {
    Search,
    UserPlus,
    MapPin,
    Mail,
    Phone,
    Calendar,
    TrendingUp,
    FileText,
    DollarSign,
    ChevronRight,
    User,
    ArrowLeft,
    ShoppingBag,
    ExternalLink,
    ChevronLeft
} from 'lucide-react';
import { useApp, Customer, Invoice } from '@/context/AppContext';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

export const Customers: React.FC = () => {
    const { customers, invoices, addCustomer } = useApp();

    // Navigation states
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'CREDIT' | 'ACTIVE'>('ALL');

    // Customer registration
    const [showAddForm, setShowAddForm] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    // Handle register customer
    const handleSubmitCustomer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !phone) {
            toast.error('All details are required.');
            return;
        }
        addCustomer({ name, email, phone, address: address || 'N/A' });
        toast.success(`Registered client "${name}" successfully.`);
        setShowAddForm(false);

        // Clear forms
        setName('');
        setEmail('');
        setPhone('');
        setAddress('');
    };

    // 1. Filter customers List
    const filteredCustomers = customers.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
        const matchFilter =
            filterType === 'ALL' ? true :
                filterType === 'CREDIT' ? c.balance > 0 :
                    c.purchaseCount > 5; // active definition
        return matchSearch && matchFilter;
    });

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

    // Customer Invoices history
    const customerInvoices = selectedCustomerId
        ? invoices.filter(inv => inv.customerId === selectedCustomerId)
        : [];

    return (
        <div className="space-y-6">

            {/* Top Banner Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight">Clients Directory</h1>
                    <p className="text-muted-foreground text-xs mt-1">Review accounts receivable, purchase volumes, and coordinates.</p>
                </div>

                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                    <UserPlus className="w-4 h-4" /> Add New Customer
                </button>
            </div>

            {/* Conditional Add Form Drawer Modal */}
            {showAddForm && (
                <div className="bg-card border border-border p-5 rounded-2xl animate-in slide-in-from-top-3 duration-250 max-w-xl">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/60">
                        <h3 className="font-semibold text-sm">Register Merchant Client</h3>
                        <button onClick={() => setShowAddForm(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                    </div>
                    <form onSubmit={handleSubmitCustomer} className="grid grid-cols-2 gap-4 text-xs">
                        <div className="col-span-2">
                            <label className="text-[10px] font-bold block mb-1">Company / Customer Name *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Marcus Miller"
                                className="w-full px-3 py-2 bg-muted/60 border border-border focus:border-brand-500 rounded-xl focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold block mb-1">Email Coordinates *</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="marcus@millerlogistics.net"
                                className="w-full px-3 py-2 bg-muted/60 border border-border focus:border-brand-500 rounded-xl focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold block mb-1">Phone Number *</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+1 (555) 0182"
                                className="w-full px-3 py-2 bg-muted/60 border border-border focus:border-brand-500 rounded-xl focus:outline-none"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-bold block mb-1">Billing Street Coordinates</label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="101 Logistics Way, Suite A"
                                className="w-full px-3 py-2 bg-muted/60 border border-border focus:border-brand-500 rounded-xl focus:outline-none h-16 resize-none"
                            />
                        </div>
                        <div className="col-span-2 pt-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-xs"
                            >
                                Register Account
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Main Panel Content Split */}
            {!selectedCustomerId ? (

                /* LIST PAGE */
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
                    {/* Filters Row */}
                    <div className="p-4 border-b border-border/80 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative max-w-sm w-full">
                            <input
                                type="text"
                                placeholder="Filter clients catalog..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 bg-muted/50 border border-border focus:border-brand-500 rounded-xl text-xs focus:outline-none"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                <Search className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        <div className="flex gap-1.5 self-end md:self-auto">
                            {(['ALL', 'CREDIT', 'ACTIVE'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={cn(
                                        "px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150",
                                        filterType === type
                                            ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-brand-600 dark:text-brand-500"
                                            : "bg-card border-border hover:bg-muted text-muted-foreground"
                                    )}
                                >
                                    {type === 'ALL' ? 'All Clients' : type === 'CREDIT' ? 'Outstanding Balance' : 'Active Loyalists'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table display */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase">
                                    <th className="p-4">Customer Name</th>
                                    <th className="p-4">Coordinates</th>
                                    <th className="p-4 text-center">Orders Count</th>
                                    <th className="p-4 text-right">Loyalty Sum</th>
                                    <th className="p-4 text-right">Account Credit</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 text-xs">
                                {filteredCustomers.map(c => (
                                    <tr
                                        key={c.id}
                                        className="hover:bg-muted/30 transition-colors cursor-pointer group"
                                        onClick={() => setSelectedCustomerId(c.id)}
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-9 h-9 rounded-xl bg-gradient-to-tr flex items-center justify-center text-white font-bold text-sm",
                                                    c.avatarColor
                                                )}>
                                                    {c.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-500 transition-colors">{c.name}</h4>
                                                    <span className="text-[10px] text-muted-foreground block mt-0.5">Joined {new Date(c.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            <p>{c.email}</p>
                                            <p className="text-[10px] mt-0.5">{c.phone}</p>
                                        </td>
                                        <td className="p-4 text-center font-semibold text-foreground/80">
                                            {c.purchaseCount || 0}
                                        </td>
                                        <td className="p-4 text-right font-bold text-foreground">
                                            ${(c.totalSpent || 0).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            {c.balance > 0 ? (
                                                <span className="font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-lg">
                                                    ${c.balance.toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">&mdash;</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <ChevronRight className="w-4.5 h-4.5 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-1" />
                                        </td>
                                    </tr>
                                ))}

                                {filteredCustomers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center text-muted-foreground">
                                            No accounts matched search criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            ) : (

                /* CUSTOMER PROFILE DETAILS SCREEN */
                <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Back button */}
                    <button
                        onClick={() => setSelectedCustomerId(null)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Directory
                    </button>

                    {selectedCustomer && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                            {/* Profile Card coordinates */}
                            <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 space-y-6">

                                {/* Avatar layout */}
                                <div className="text-center">
                                    <div className={cn(
                                        "w-20 h-20 rounded-2xl bg-gradient-to-tr flex items-center justify-center text-white font-extrabold text-3xl mx-auto shadow-md shadow-brand-500/10",
                                        selectedCustomer.avatarColor
                                    )}>
                                        {selectedCustomer.name.charAt(0)}
                                    </div>
                                    <h3 className="font-display font-bold text-lg text-foreground mt-4">{selectedCustomer.name}</h3>
                                    <span className="text-xs text-muted-foreground mt-1 block">Account Account Client</span>
                                </div>

                                {/* Account Balances summary */}
                                <div className="grid grid-cols-2 gap-4 border-y border-border/80 py-4 text-center">
                                    <div>
                                        <span className="text-[9px] uppercase font-bold text-muted-foreground">Outstanding Credits</span>
                                        <p className={cn(
                                            "text-base font-bold mt-1",
                                            selectedCustomer.balance > 0 ? "text-rose-500" : "text-muted-foreground"
                                        )}>
                                            ${selectedCustomer.balance}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-[9px] uppercase font-bold text-muted-foreground">Total Invoiced</span>
                                        <p className="text-base font-bold mt-1 text-foreground">${selectedCustomer.totalSpent}</p>
                                    </div>
                                </div>

                                {/* Coordinates Details */}
                                <div className="space-y-3.5 text-xs">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Mail className="w-4 h-4 text-brand-600 dark:text-brand-500" />
                                        <span className="truncate">{selectedCustomer.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Phone className="w-4 h-4 text-brand-600 dark:text-brand-500" />
                                        <span>{selectedCustomer.phone}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-muted-foreground">
                                        <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-500 mt-0.5" />
                                        <span>{selectedCustomer.address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Transactions History block */}
                            <div className="lg:col-span-8 space-y-6">

                                {/* Statistics Widget Cards */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-card border border-border p-4 rounded-xl">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Invoices Count</span>
                                        <div className="flex justify-between items-end mt-2">
                                            <h4 className="text-xl font-bold">{selectedCustomer.purchaseCount}</h4>
                                            <ShoppingBag className="w-4.5 h-4.5 text-indigo-400" />
                                        </div>
                                    </div>

                                    <div className="bg-card border border-border p-4 rounded-xl">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Average Order</span>
                                        <div className="flex justify-between items-end mt-2">
                                            <h4 className="text-xl font-bold">
                                                ${selectedCustomer.purchaseCount > 0
                                                    ? Math.round(selectedCustomer.totalSpent / selectedCustomer.purchaseCount)
                                                    : 0}
                                            </h4>
                                            <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
                                        </div>
                                    </div>

                                    <div className="bg-card border border-border p-4 rounded-xl">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Credit limit status</span>
                                        <div className="flex justify-between items-end mt-2">
                                            <h4 className="text-xs font-semibold text-emerald-500 dark:text-emerald-400">Excellent</h4>
                                            <DollarSign className="w-4.5 h-4.5 text-indigo-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Invoice logs list */}
                                <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
                                    <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
                                        <h3 className="font-semibold text-sm flex items-center gap-1.5"><FileText className="w-4.5 h-4.5 text-indigo-405" /> Invoice Log History</h3>
                                        <span className="text-[10px] text-muted-foreground">{customerInvoices.length} entries</span>
                                    </div>

                                    <div className="divide-y divide-border/60 text-xs">
                                        {customerInvoices.map(inv => (
                                            <div key={inv.id} className="py-3.5 flex justify-between items-center first:pt-0 last:pb-0">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold">{inv.invoiceNo}</span>
                                                        <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-semibold">PAID</span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">Purchased {inv.items.length} items &bull; Paid via {inv.paymentMethod}</p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="font-bold text-foreground">${inv.total}</p>
                                                    <span className="text-[9px] text-muted-foreground/60 block mt-0.5">{new Date(inv.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}

                                        {customerInvoices.length === 0 && (
                                            <div className="py-12 text-center text-muted-foreground">
                                                No transactions recorded for this client.
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>

                        </div>
                    )}
                </div>

            )}

        </div>
    );
};

export default Customers;
