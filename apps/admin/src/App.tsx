import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Billing } from './pages/Billing';
import { Customers } from './pages/Customers';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Reports } from './pages/Reports';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { ProtectedRoute } from './components/ProtectedRoute';

const App: React.FC = () => (
  <>
    <Toaster position="top-right" richColors closeButton />
    <Routes>
      {/* Public Authentication Screens */}
      <Route path="/login" element={<Auth />} />
      <Route path="/signup" element={<Auth />} />

      {/* Protected Routes (Staff & Admin) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Billing />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Customers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Products />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Inventory />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin-Only Protected Routes */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <DashboardLayout>
              <Analytics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

export default App;
