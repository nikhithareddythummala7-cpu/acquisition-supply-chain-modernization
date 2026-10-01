import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { ProcurementDashboard } from './ProcurementDashboard';
import { SupplyChainDashboard } from './SupplyChainDashboard';
import { VendorDashboard } from './VendorDashboard';
import { ContractManagerDashboard } from './ContractManagerDashboard';
import { RiskDashboard } from './RiskDashboard';
import { ComplianceDashboard } from './ComplianceDashboard';
import { OperationsDashboard } from './OperationsDashboard';
import { ExternalAuditorDashboard } from './ExternalAuditorDashboard';
import { DashboardPage } from './DashboardPage';

export const RoleBasedDashboard = () => {
  const { user } = useAuth();
  const role = user?.role;

  switch (role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'PROCUREMENT_OFFICER':
      return <ProcurementDashboard />;
    case 'SUPPLY_CHAIN_ANALYST':
      return <SupplyChainDashboard />;
    case 'VENDOR':
      return <VendorDashboard />;
    case 'CONTRACT_MANAGER':
      return <ContractManagerDashboard />;
    case 'RISK_SPECIALIST':
      return <RiskDashboard />;
    case 'COMPLIANCE_AUDITOR':
      return <ComplianceDashboard />;
    case 'OPERATIONS_COMMANDER':
      return <OperationsDashboard />;
    case 'EXTERNAL_AUDITOR':
      return <ExternalAuditorDashboard />;
    default:
      // Fallback for general or unclassified roles
      return <DashboardPage />;
  }
};
