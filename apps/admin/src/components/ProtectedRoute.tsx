import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono uppercase tracking-wider">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold font-display text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground">
          This section requires <strong className="text-foreground">{requiredRole}</strong> privileges.
          Your current account is authenticated as <strong className="text-brand-500">{role}</strong>.
        </p>
        <div className="pt-2">
          <a
            href="/billing"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors"
          >
            Return to POS Billing
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
