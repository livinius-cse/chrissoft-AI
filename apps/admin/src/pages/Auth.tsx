import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles,
    Mail,
    Lock,
    ArrowRight,
    ArrowLeft,
    Building,
    User,
    CheckCircle2,
    Key
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';
import { authApi } from '@/api';
import { useAuth } from '@/context/AuthContext';

type AuthScreen = 'login' | 'signup' | 'forgot' | 'otp';

export const Auth: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [screen, setScreen] = useState<AuthScreen>('login');
    const isDev = import.meta.env.DEV;

    // Form states - prefilled strictly in development mode only
    const [email, setEmail] = useState(isDev ? 'admin@chrissoft.com' : '');
    const [password, setPassword] = useState(isDev ? 'password123' : '');
    const [businessName, setBusinessName] = useState(isDev ? 'ChrisSoft AI Enterprise' : '');
    const [otpCode, setOtpCode] = useState(['', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setErrorMsg('Please input your credentials.');
            return;
        }

        setIsLoading(true);
        setErrorMsg('');

        try {
            const res = await login(email, password);
            toast.success(`Welcome back, ${res.user?.name}!`);
            if (res.user.role === 'STAFF') {
                navigate('/billing');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            const msg = err.message || 'Invalid email or password.';
            setErrorMsg(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        try {
            await authApi.signup(businessName, email, password);
            toast.success('Registration initiated. Verification code sent.');
            setScreen('otp');
        } catch (err: any) {
            console.warn('Backend signup fallback:', err);
            setScreen('otp');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otpCode.join('');
        setIsLoading(true);
        setErrorMsg('');
        try {
            const res = await authApi.verifyOtp(code, email);
            if (res.token) {
                localStorage.setItem('chrissoft_token', res.token);
                localStorage.setItem('chrissoft_user', JSON.stringify(res.user));
            }
            toast.success('Authentication verified successfully!');
            navigate('/');
        } catch (err: any) {
            console.warn('Backend OTP fallback:', err);
            navigate('/');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index: number, val: string) => {
        if (isNaN(Number(val))) return;
        const nextList = [...otpCode];
        nextList[index] = val.slice(-1);
        setOtpCode(nextList);

        // Auto-focus next input
        if (val && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">

            {/* Dynamic Stripe-like Mesh Glowing Background */}
            <div className="absolute inset-0 z-0 overflow-hidden opacity-50">
                <div className="absolute w-[600px] h-[600px] -top-96 -left-48 rounded-full bg-indigo-600/30 blur-[130px] animate-pulse duration-[8000ms]" />
                <div className="absolute w-[800px] h-[800px] -bottom-96 -right-48 rounded-full bg-purple-600/20 blur-[150px] animate-pulse duration-[10000ms]" />
                <div className="absolute w-[500px] h-[500px] top-1/2 left-2/3 rounded-full bg-emerald-600/10 blur-[120px]" />
            </div>

            {/* Grid Pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

            {/* Auth Card Container */}
            <div className="relative w-full max-w-5xl grid lg:grid-cols-12 gap-8 z-10">

                {/* Left Side: Premium Aesthetic Pitch (Notion/Linear style) */}
                <div className="lg:col-span-6 flex flex-col justify-between p-6 lg:p-12 relative overflow-hidden rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white">
                            <Sparkles className="w-5.5 h-5.5" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight text-white">
                            Equinox
                        </span>
                    </div>

                    <div className="my-12 space-y-6">
                        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                            A premium suite for <br />
                            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 gradient-text">
                                Billing &amp; Inventory
                            </span>
                        </h1>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            Control sales workflows, audit stocks in real-time, generate professional tax invoices, and run forecasts matching Stripe-grade reliability.
                        </p>

                        {/* Feature Checkmarks list */}
                        <div className="space-y-3 pt-4">
                            <div className="flex items-center gap-3 text-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <span className="text-slate-300">Live offline-capable POS billing flow</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <span className="text-slate-300">Automatic GST billing calculation &amp; summaries</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <span className="text-slate-300">Detailed stock levels audit, alert notifications</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-6">
                        <span>&copy; 2026 Equinox B2B Inc.</span>
                        <span className="underline cursor-pointer hover:text-slate-400">Terms of Service</span>
                    </div>
                </div>

                {/* Right Side: Account Actions cards Wrapper */}
                <div className="lg:col-span-6 flex flex-col justify-center">
                    <div className="w-full bg-slate-950/40 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl relative">

                        {/* Login panel */}
                        {screen === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div>
                                    <h2 className="font-display text-2xl font-bold text-white tracking-tight">Sign in to ChrisSoft AI</h2>
                                    <p className="text-slate-400 text-xs mt-1.5">
                                        Select a demo account or sign in with registered credentials.
                                    </p>
                                    {isDev && (
                                        <div className="flex items-center gap-2 mt-3 p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Dev Role:</span>
                                            <button
                                                type="button"
                                                onClick={() => { setEmail('admin@chrissoft.com'); setPassword('password123'); setErrorMsg(''); }}
                                                className={cn(
                                                    "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
                                                    email === 'admin@chrissoft.com'
                                                        ? "bg-brand-500 text-white shadow-sm"
                                                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                                )}
                                            >
                                                👑 Admin
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setEmail('staff@chrissoft.com'); setPassword('staff123'); setErrorMsg(''); }}
                                                className={cn(
                                                    "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
                                                    email === 'staff@chrissoft.com'
                                                        ? "bg-blue-600 text-white shadow-sm"
                                                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                                )}
                                            >
                                                👤 Staff (Cashier)
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {errorMsg && (
                                    <div className="px-3.5 py-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-medium">
                                        {errorMsg}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {/* Email Input */}
                                    <div>
                                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Merchant Email</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="e.g. manager@retailer.com"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700/60 focus:border-brand-500 focus:outline-none rounded-xl text-slate-200 text-sm transition-all duration-200"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password Input */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Security Password</label>
                                            <span
                                                onClick={() => setScreen('forgot')}
                                                className="text-[10px] text-brand-500 hover:text-brand-400 font-semibold cursor-pointer"
                                            >
                                                Forgot?
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••••••"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700/60 focus:border-brand-500 focus:outline-none rounded-xl text-slate-200 text-sm transition-all duration-200"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        type="checkbox"
                                        defaultChecked
                                        className="h-4 w-4 bg-slate-900 border-slate-800 rounded text-brand-600 focus:ring-0 focus:ring-offset-0 transition-colors"
                                    />
                                    <label htmlFor="remember-me" className="ml-2.5 text-xs text-slate-400 cursor-pointer">
                                        Remember me on this workstation
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/20 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Sign In <ArrowRight className="w-4.5 h-4.5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Registration panel */}
                        {screen === 'signup' && (
                            <form onSubmit={handleSignup} className="space-y-6">
                                <div>
                                    <h2 className="font-display text-2xl font-bold text-white tracking-tight">Create Merchant Site</h2>
                                    <p className="text-slate-400 text-xs mt-1.5">
                                        Already registered with us?{' '}
                                        <span
                                            onClick={() => setScreen('login')}
                                            className="text-brand-500 hover:text-brand-400 font-semibold cursor-pointer underline hover:no-underline"
                                        >
                                            Login
                                        </span>
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {/* Account Name */}
                                    <div>
                                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Manager Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="e.g. John Doe"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700/60 focus:border-brand-500 focus:outline-none rounded-xl text-slate-200 text-sm transition-all duration-200"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Business Name */}
                                    <div>
                                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Business / Store Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                <Building className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="text"
                                                value={businessName}
                                                onChange={(e) => setBusinessName(e.target.value)}
                                                placeholder="e.g. Wright Retail Ltd"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700/60 focus:border-brand-500 focus:outline-none rounded-xl text-slate-200 text-sm transition-all duration-200"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Corporate Email</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="e.g. alex@company.com"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700/60 focus:border-brand-500 focus:outline-none rounded-xl text-slate-200 text-sm transition-all duration-200"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Choose Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="password"
                                                placeholder="Must be 8+ characters"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700/60 focus:border-brand-500 focus:outline-none rounded-xl text-slate-200 text-sm transition-all duration-200"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/20 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Register Store <ArrowRight className="w-4.5 h-4.5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Forgot password panel */}
                        {screen === 'forgot' && (
                            <div className="space-y-6">
                                <div>
                                    <button
                                        onClick={() => setScreen('login')}
                                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-semibold mb-4"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" /> Back to log in
                                    </button>
                                    <h2 className="font-display text-2xl font-bold text-white tracking-tight">Restore Security Password</h2>
                                    <p className="text-slate-400 text-xs mt-1.5">
                                        We will send an OTP confirmation link to verify your ownership of this merchant account.
                                    </p>
                                </div>

                                <div>
                                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Registered Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="e.g. manager@retailer.com"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700/60 focus:border-brand-500 focus:outline-none rounded-xl text-slate-200 text-sm transition-all duration-200"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setIsLoading(true);
                                        setTimeout(() => {
                                            setIsLoading(false);
                                            setScreen('otp');
                                        }, 1000);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all duration-200 cursor-pointer"
                                >
                                    Send OTP Code
                                </button>
                            </div>
                        )}

                        {/* OTP verification panel */}
                        {screen === 'otp' && (
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div>
                                    <h2 className="font-display text-2xl font-bold text-white tracking-tight animate-bounce">Verify Your Device</h2>
                                    <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                                        We sent a 4-digit code to <span className="font-semibold text-slate-200">{email}</span>. Click authorize once pasted.
                                    </p>
                                </div>

                                {/* OTP Input Fields */}
                                <div className="flex items-center justify-between gap-3 px-4">
                                    {otpCode.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            className="w-14 h-14 bg-slate-900 border border-slate-800 focus:border-brand-500 text-center text-xl font-bold rounded-xl focus:outline-none focus:ring-0 text-white font-mono"
                                            required
                                        />
                                    ))}
                                </div>

                                <div className="text-center text-xs">
                                    <span className="text-slate-500">Didn't receive any instructions?</span>{' '}
                                    <span
                                        onClick={() => {
                                            setOtpCode(['', '', '', '']);
                                            const first = document.getElementById('otp-0');
                                            first?.focus();
                                        }}
                                        className="text-brand-500 hover:text-brand-400 font-semibold cursor-pointer underline hover:no-underline"
                                    >
                                        Resend Code
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all duration-200 cursor-pointer"
                                >
                                    Verify Device
                                </button>
                            </form>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};
export default Auth;
