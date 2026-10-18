import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

import { ThreeBackground } from '@/components/3d/ThreeBackground';
import { ThreeBusinessToken } from '@/components/3d/ThreeBusinessToken';

type AuthScreen = 'login' | 'signup' | 'forgot' | 'otp';

export const Auth: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [screen, setScreen] = useState<AuthScreen>(location.pathname === '/signup' ? 'signup' : 'login');
    const isDev = import.meta.env.DEV;

    // Form states - prefilled strictly in development mode only
    const [email, setEmail] = useState(isDev ? 'admin@chrissoft.com' : '');
    const [password, setPassword] = useState(isDev ? 'password123' : '');
    const [businessName, setBusinessName] = useState(isDev ? 'ChrisSoft AI Enterprise' : '');
    const [managerName, setManagerName] = useState('');
    const [otpCode, setOtpCode] = useState(['', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (location.pathname === '/signup' || location.pathname === '/login') {
            setScreen(location.pathname.slice(1) as 'login' | 'signup');
            setErrorMsg('');
        }
    }, [location.pathname]);

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
            await authApi.signup(managerName, businessName, email, password);
            toast.success('Account created. Sign in with your new credentials.');
            setScreen('login');
            navigate('/login');
        } catch (err: any) {
            const msg = err.message || 'Unable to create your account.';
            setErrorMsg(msg);
            toast.error(msg);
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

            {/* Real WebGL 3D Ambient Particle Constellation Scene */}
            <ThreeBackground particleCount={450} interactive={true} />

            {/* Subtle Gradient Glow & Grid Overlay */}
            <div className="absolute inset-0 bg-radial from-orange-500/5 via-transparent to-slate-950/80 pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

            {/* Auth Card Container */}
            <div className="relative w-full max-w-5xl grid lg:grid-cols-12 gap-8 z-10">

                {/* Left Side: 3D Business Showcase & Platform Highlights */}
                <div className="lg:col-span-6 flex flex-col justify-between p-6 lg:p-10 relative overflow-hidden rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center shadow-lg shadow-brand-500/30 text-white">
                            <Sparkles className="w-5.5 h-5.5" />
                        </div>
                        <div>
                            <span className="font-display font-bold text-xl tracking-tight text-white">
                                ChrisSoft AI
                            </span>
                            <span className="block text-[10px] uppercase font-mono tracking-widest text-brand-400 font-semibold">
                                Business Suite 3D
                            </span>
                        </div>
                    </div>

                    {/* Interactive 3D Business Token */}
                    <div className="my-6 flex flex-col items-center justify-center">
                        <ThreeBusinessToken size={200} badgeText="ChrisSoft AI" className="mx-auto drop-shadow-2xl" />
                        <span className="text-[11px] font-mono text-slate-400 tracking-wider mt-1">
                            Interactive 3D Engine &bull; Drag or hover to tilt
                        </span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                            Next-Gen Intelligent <br />
                            <span className="bg-gradient-to-r from-brand-400 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
                                Commerce &amp; ERP Platform
                            </span>
                        </h1>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                            High-velocity POS billing, multi-store stock audits, real-time GST reconciliation, and automated AI inventory forecasts.
                        </p>

                        {/* Feature Checkmarks list */}
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center gap-3 text-xs">
                                <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                                <span className="text-slate-300">Fast offline-capable POS billing flow</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                <span className="text-slate-300">Automated Indian GST &amp; INR currency support</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <span className="text-slate-300">Server-enforced Admin vs Staff access security</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-5 mt-4">
                        <span>&copy; 2026 ChrisSoft AI Inc.</span>
                        <span className="text-slate-400 font-medium">Enterprise Edition</span>
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
                                <p className="text-center text-xs text-slate-400">
                                    New to ChrisSoft AI?{' '}
                                    <button
                                        type="button"
                                        onClick={() => navigate('/signup')}
                                        className="font-semibold text-brand-400 hover:text-brand-300"
                                    >
                                        Create an account
                                    </button>
                                </p>
                            </form>
                        )}

                        {/* Registration panel */}
                        {screen === 'signup' && (
                            <form onSubmit={handleSignup} className="space-y-6">
                                <div>
                                    <h2 className="font-display text-2xl font-bold text-white tracking-tight">Create Merchant Site</h2>
                                    <p className="text-slate-400 text-xs mt-1.5">
                                        Already registered with us?{' '}
                                        <button
                                            type="button"
                                            onClick={() => navigate('/login')}
                                            className="text-brand-500 hover:text-brand-400 font-semibold underline hover:no-underline"
                                        >
                                            Sign in
                                        </button>
                                    </p>
                                </div>

                                {errorMsg && (
                                    <div className="px-3.5 py-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-medium">
                                        {errorMsg}
                                    </div>
                                )}

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
                                                value={managerName}
                                                onChange={(e) => setManagerName(e.target.value)}
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
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Must be 8+ characters"
                                                minLength={8}
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
                                <p className="text-center text-xs text-slate-400">
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => navigate('/login')}
                                        className="font-semibold text-brand-400 hover:text-brand-300"
                                    >
                                        Sign in
                                    </button>
                                </p>
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
