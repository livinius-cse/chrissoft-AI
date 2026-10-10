import React, { useState } from 'react';
import {
    Sparkles,
    X,
    Send,
    Bot,
    User,
    TrendingUp,
    Truck,
    PackageCheck,
    AlertTriangle,
    RefreshCw,
    CheckCircle2
} from 'lucide-react';
import { aiApi, VendorRecommendation, DemandForecast } from '../api';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

interface AIAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    suggestions?: string[];
    timestamp: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
    const { products, restockProduct } = useApp();
    const [activeTab, setActiveTab] = useState<'copilot' | 'vendors' | 'forecasting'>('copilot');

    // Copilot State
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            sender: 'ai',
            text: 'Hello! I am **ChrisSoft AI Copilot**, your intelligent B2B procurement & store assistant. Ask me anything about stock inventory levels, supplier recommendations, or financial summaries.',
            suggestions: [
                'Which products are low on stock?',
                'What is our current revenue?',
                'Recommend suppliers for electronics',
                'Forecast demand for top products'
            ],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Vendor Rec State
    const [rfqQuery, setRfqQuery] = useState('High-performance electronics and computer accessories');
    const [vendorRecs, setVendorRecs] = useState<VendorRecommendation[]>([]);
    const [loadingRecs, setLoadingRecs] = useState(false);

    // Forecasting State
    const [selectedProductForForecast, setSelectedProductForForecast] = useState<string>(products[0]?.id || '');
    const [forecastResult, setForecastResult] = useState<DemandForecast | null>(null);
    const [loadingForecast, setLoadingForecast] = useState(false);

    if (!isOpen) return null;

    const handleSendMessage = async (msgText: string) => {
        const query = msgText.trim();
        if (!query || isLoading) return;

        const userMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: 'user',
            text: query,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await aiApi.chat(query);
            const aiMsg: ChatMessage = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text: res.reply,
                suggestions: res.suggestions,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err: any) {
            const errorMsg: ChatMessage = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text: '⚠️ Unable to connect to AI microservice at this moment. Please check backend connection.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFetchVendorRecs = async () => {
        setLoadingRecs(true);
        try {
            const res = await aiApi.recommendVendors(rfqQuery);
            setVendorRecs(res.recommendations || []);
            toast.success(`Matched ${res.recommendations.length} qualified suppliers via AI.`);
        } catch (err: any) {
            toast.error('Failed to get vendor recommendations');
        } finally {
            setLoadingRecs(false);
        }
    };

    const handleFetchForecast = async () => {
        setLoadingForecast(true);
        try {
            const res = await aiApi.forecastDemand(selectedProductForForecast);
            setForecastResult(res.forecast);
            toast.success('AI predictive demand analysis updated.');
        } catch (err: any) {
            toast.error('Failed to fetch demand forecast');
        } finally {
            setLoadingForecast(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/70 backdrop-blur-sm select-none">
            <div className="fixed inset-0" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] animate-in zoom-in-95 duration-200">

                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-sm flex items-center gap-2">
                                ChrisSoft AI Intelligence
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-brand-600 dark:text-brand-400 font-bold">
                                    Gemini Engine
                                </span>
                            </h2>
                            <p className="text-[11px] text-muted-foreground">Smart Procurement, Demand Forecasting &amp; Copilot</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted">
                        <X className="w-4.5 h-4.5" />
                    </button>
                </div>

                {/* Mode Tabs */}
                <div className="flex border-b border-border bg-card text-xs font-semibold px-4 pt-2 gap-2">
                    <button
                        onClick={() => setActiveTab('copilot')}
                        className={`pb-2 px-3 border-b-2 transition-colors ${
                            activeTab === 'copilot'
                                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        💬 AI Copilot
                    </button>
                    <button
                        onClick={() => { setActiveTab('vendors'); if (vendorRecs.length === 0) handleFetchVendorRecs(); }}
                        className={`pb-2 px-3 border-b-2 transition-colors ${
                            activeTab === 'vendors'
                                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        🤝 Vendor Matcher
                    </button>
                    <button
                        onClick={() => { setActiveTab('forecasting'); if (!forecastResult) handleFetchForecast(); }}
                        className={`pb-2 px-3 border-b-2 transition-colors ${
                            activeTab === 'forecasting'
                                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        📈 Demand Forecast
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {activeTab === 'copilot' && (
                        <div className="flex flex-col h-full justify-between">
                            {/* Chat Thread */}
                            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-3">
                                {messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1 px-1">
                                            {msg.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3 text-brand-500" />}
                                            <span>{msg.sender === 'user' ? 'You' : 'ChrisSoft AI'}</span>
                                            <span>•</span>
                                            <span>{msg.timestamp}</span>
                                        </div>
                                        <div
                                            className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                                                msg.sender === 'user'
                                                    ? 'bg-brand-600 text-white rounded-tr-xs'
                                                    : 'bg-muted/70 text-foreground border border-border/80 rounded-tl-xs whitespace-pre-line'
                                            }`}
                                        >
                                            {msg.text}
                                        </div>

                                        {/* Suggestions chips */}
                                        {msg.suggestions && msg.suggestions.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {msg.suggestions.map((s, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleSendMessage(s)}
                                                        className="text-[10px] px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors"
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-500" />
                                        <span>Analyzing procurement database...</span>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input Bar */}
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
                                className="flex gap-2 border-t border-border/80 pt-3"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask ChrisSoft AI about stock, vendors, cash flow..."
                                    className="flex-1 px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-brand-500"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                                >
                                    <Send className="w-3.5 h-3.5" /> Send
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'vendors' && (
                        <div className="space-y-4">
                            <div className="bg-muted/30 p-3.5 rounded-xl border border-border/80 space-y-2">
                                <label className="text-xs font-bold block">RFQ / Procurement Criteria</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={rfqQuery}
                                        onChange={(e) => setRfqQuery(e.target.value)}
                                        className="flex-1 px-3 py-2 text-xs bg-card border border-border rounded-lg focus:outline-none"
                                        placeholder="e.g. Mechanical components with net-30 terms"
                                    />
                                    <button
                                        onClick={handleFetchVendorRecs}
                                        disabled={loadingRecs}
                                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                                    >
                                        {loadingRecs ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                        Match
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Recommended Suppliers ({vendorRecs.length})
                                </h3>
                                {vendorRecs.map(vendor => (
                                    <div
                                        key={vendor.vendorId}
                                        className="p-3.5 rounded-xl border border-border bg-card flex items-start justify-between gap-3 shadow-xs"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg">
                                                <Truck className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold">{vendor.name}</h4>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">{vendor.reason}</p>
                                                <span className="text-[9.5px] font-mono text-muted-foreground/60 block mt-1">ID: {vendor.vendorId}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-emerald-500">
                                                {Math.round(vendor.score * 100)}% Match
                                            </span>
                                            <button
                                                onClick={() => toast.success(`Generated RFQ for ${vendor.name}`)}
                                                className="block mt-1 text-[10px] px-2 py-0.5 bg-muted hover:bg-muted/80 rounded font-semibold text-foreground transition-colors"
                                            >
                                                Send RFQ
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'forecasting' && (
                        <div className="space-y-4">
                            <div className="bg-muted/30 p-3.5 rounded-xl border border-border/80 space-y-2">
                                <label className="text-xs font-bold block">Select Catalog Item for AI Demand Prediction</label>
                                <div className="flex gap-2">
                                    <select
                                        value={selectedProductForForecast}
                                        onChange={(e) => setSelectedProductForForecast(e.target.value)}
                                        className="flex-1 px-3 py-2 text-xs bg-card border border-border rounded-lg focus:outline-none"
                                    >
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleFetchForecast}
                                        disabled={loadingForecast}
                                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                                    >
                                        {loadingForecast ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
                                        Forecast
                                    </button>
                                </div>
                            </div>

                            {forecastResult && (
                                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-start border-b border-border/60 pb-3">
                                        <div>
                                            <h3 className="font-bold text-sm">{forecastResult.productName}</h3>
                                            <span className="text-[10px] text-muted-foreground">Predictive Horizon: Next 30 Days</span>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                                            {Math.round(forecastResult.confidenceScore * 100)}% Confidence
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 bg-muted/40 rounded-xl">
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Current Stock</span>
                                            <span className="text-lg font-bold mt-1 block">{forecastResult.currentStock} units</span>
                                        </div>
                                        <div className="p-3 bg-muted/40 rounded-xl">
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Predicted Demand</span>
                                            <span className="text-lg font-bold text-brand-600 dark:text-brand-400 mt-1 block">{forecastResult.predictedDemand} units</span>
                                        </div>
                                        <div className="p-3 bg-muted/40 rounded-xl">
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Growth Velocity</span>
                                            <span className="text-lg font-bold text-emerald-500 mt-1 block">+{(forecastResult.growthRate * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <PackageCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                                            <span>Suggested Safety Replenishment: <strong>+{forecastResult.recommendedReorderQuantity} units</strong></span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                restockProduct(forecastResult.productId, forecastResult.recommendedReorderQuantity || 20);
                                                toast.success('Auto-restocked based on AI forecast recommendation.');
                                            }}
                                            className="px-2.5 py-1 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 transition-colors"
                                        >
                                            Execute Auto-Restock
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
