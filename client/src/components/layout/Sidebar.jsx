import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ShoppingCart, Users, Gavel, GitCompare,
  FileText, Truck, Package, ClipboardCheck, ShieldAlert,
  Award, TrendingUp, Sparkles, Bot, History, Settings, UserCog
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'GUEST';

  const sections = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ALL'] },
      ],
    },
    {
      title: 'ACQUISITION',
      items: [
        { label: 'Procurement Requests', path: '/procurement', icon: ShoppingCart, roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'OPERATIONS_COMMANDER', 'COMPLIANCE_AUDITOR', 'EXTERNAL_AUDITOR'] },
        { label: 'Suppliers Directory', path: '/suppliers', icon: Users, roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'CONTRACT_MANAGER', 'OPERATIONS_COMMANDER', 'COMPLIANCE_AUDITOR', 'EXTERNAL_AUDITOR'] },
        { label: 'Bids & Proposals', path: '/bids', icon: Gavel, roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR', 'CONTRACT_MANAGER', 'COMPLIANCE_AUDITOR', 'EXTERNAL_AUDITOR'] },
        { label: 'Bid Comparison', path: '/bids/comparison/PR-2026-001', icon: GitCompare, roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'COMPLIANCE_AUDITOR', 'OPERATIONS_COMMANDER'] },
      ],
    },
    {
      title: 'CONTRACTS',
      items: [
        { label: 'Supply Contracts', path: '/contracts', icon: FileText, roles: ['ADMIN', 'CONTRACT_MANAGER', 'PROCUREMENT_OFFICER', 'VENDOR', 'OPERATIONS_COMMANDER', 'COMPLIANCE_AUDITOR', 'EXTERNAL_AUDITOR'] },
      ],
    },
    {
      title: 'SUPPLY CHAIN',
      items: [
        { label: 'Logistics Monitoring', path: '/supply-chain', icon: Truck, roles: ['ADMIN', 'SUPPLY_CHAIN_ANALYST', 'OPERATIONS_COMMANDER', 'VENDOR'] },
        { label: 'Shipments Tracking', path: '/shipments', icon: Package, roles: ['ADMIN', 'SUPPLY_CHAIN_ANALYST', 'OPERATIONS_COMMANDER', 'VENDOR', 'PROCUREMENT_OFFICER'] },
        { label: 'Quality Inspections', path: '/inspections', icon: ClipboardCheck, roles: ['ADMIN', 'SUPPLY_CHAIN_ANALYST', 'COMPLIANCE_AUDITOR', 'OPERATIONS_COMMANDER'] },
      ],
    },
    {
      title: 'RISK & COMPLIANCE',
      items: [
        { label: 'Risk Assessment', path: '/risk', icon: ShieldAlert, roles: ['ALL'] },
        { label: 'Compliance Tracking', path: '/compliance', icon: Award, roles: ['ADMIN', 'COMPLIANCE_AUDITOR', 'EXTERNAL_AUDITOR', 'RISK_SPECIALIST', 'CONTRACT_MANAGER', 'OPERATIONS_COMMANDER'] },
        { label: 'Forecast & Anomalies', path: '/analytics/forecast', icon: TrendingUp, roles: ['ALL'] },
      ],
    },
    {
      title: 'AI ENGINE',
      items: [
        { label: 'AI RAG Assistant', path: '/ai-assistant', icon: Bot, roles: ['ALL'] },
        { label: 'AI System Insights', path: '/ai-insights', icon: Sparkles, roles: ['ALL'] },
      ],
    },
    {
      title: 'GOVERNANCE',
      items: [
        { label: 'Audit Trail', path: '/audit', icon: History, roles: ['ADMIN', 'COMPLIANCE_AUDITOR', 'EXTERNAL_AUDITOR', 'SUPPLY_CHAIN_ANALYST'] },
        { label: 'User Management', path: '/admin/users', icon: UserCog, roles: ['ADMIN'] },
        { label: 'System Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] },
      ],
    },
  ];

  const canAccess = (itemRoles) => {
    if (itemRoles.includes('ALL')) return true;
    return itemRoles.includes(role);
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-screen sticky top-0 overflow-y-auto">
      {/* Brand Section */}
      <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-cyan-600/30">
          AQ
        </div>
        <div>
          <div className="text-sm font-bold text-slate-100 tracking-tight">Acquisition System</div>
          <div className="text-[10px] text-cyan-400 font-mono">MODERN LOGISTICS</div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 p-3 space-y-6">
        {sections.map((section, idx) => {
          const visibleItems = section.items.filter((item) => canAccess(item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                {section.title}
              </div>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-cyan-600/15 text-cyan-400 font-semibold border border-cyan-500/20 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer Role Badge */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">Role Active</div>
        <div className="text-xs font-semibold text-slate-300 truncate">{user?.fullName || 'Guest'}</div>
        <div className="text-[10px] text-cyan-400 font-mono tracking-tight">{role}</div>
      </div>
    </aside>
  );
};
