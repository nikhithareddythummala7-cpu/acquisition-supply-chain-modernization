import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { RoleBasedDashboard } from './pages/RoleBasedDashboard';
import { ProcurementListPage } from './pages/ProcurementListPage';
import { ProcurementCreatePage } from './pages/ProcurementCreatePage';
import { ProcurementDetailPage } from './pages/ProcurementDetailPage';
import { SupplierListPage } from './pages/SupplierListPage';
import { SupplierCreatePage } from './pages/SupplierCreatePage';
import { SupplierDetailPage } from './pages/SupplierDetailPage';
import { BidListPage } from './pages/BidListPage';
import { BidSubmitPage } from './pages/BidSubmitPage';
import { BidComparisonPage } from './pages/BidComparisonPage';
import { ContractListPage } from './pages/ContractListPage';
import { ContractCreatePage } from './pages/ContractCreatePage';
import { ContractDetailPage } from './pages/ContractDetailPage';
import { SupplyChainPage } from './pages/SupplyChainPage';
import { ShipmentListPage } from './pages/ShipmentListPage';
import { ShipmentDetailPage } from './pages/ShipmentDetailPage';
import { InspectionListPage } from './pages/InspectionListPage';
import { InspectionCreatePage } from './pages/InspectionCreatePage';
import { RiskDashboardPage } from './pages/RiskDashboardPage';
import { RiskDetailPage } from './pages/RiskDetailPage';
import { CompliancePage } from './pages/CompliancePage';
import { ForecastPage } from './pages/ForecastPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { NotificationPage } from './pages/NotificationPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">Verifying Authentication...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<RoleBasedDashboard />} />
        
        {/* Procurement Routes */}
        <Route path="/procurement" element={<ProcurementListPage />} />
        <Route path="/procurement/create" element={<ProcurementCreatePage />} />
        <Route path="/procurement/:id" element={<ProcurementDetailPage />} />

        {/* Supplier Routes */}
        <Route path="/suppliers" element={<SupplierListPage />} />
        <Route path="/suppliers/create" element={<SupplierCreatePage />} />
        <Route path="/suppliers/:id" element={<SupplierDetailPage />} />

        {/* Bid Routes */}
        <Route path="/bids" element={<BidListPage />} />
        <Route path="/bids/submit/:reqId" element={<BidSubmitPage />} />
        <Route path="/bids/comparison/:reqId" element={<BidComparisonPage />} />

        {/* Contract Routes */}
        <Route path="/contracts" element={<ContractListPage />} />
        <Route path="/contracts/create" element={<ContractCreatePage />} />
        <Route path="/contracts/:id" element={<ContractDetailPage />} />

        {/* Supply Chain & Logistics Routes */}
        <Route path="/supply-chain" element={<SupplyChainPage />} />
        <Route path="/shipments" element={<ShipmentListPage />} />
        <Route path="/shipments/:id" element={<ShipmentDetailPage />} />
        <Route path="/inspections" element={<InspectionListPage />} />
        <Route path="/inspections/create" element={<InspectionCreatePage />} />

        {/* Risk & Compliance */}
        <Route path="/risk" element={<RiskDashboardPage />} />
        <Route path="/risk/:id" element={<RiskDetailPage />} />
        <Route path="/compliance" element={<CompliancePage />} />
        <Route path="/analytics/forecast" element={<ForecastPage />} />

        {/* AI Engine */}
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/ai-insights" element={<AIInsightsPage />} />

        {/* Governance & Admin */}
        <Route path="/audit" element={<AuditTrailPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
