import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import api from '../services/api';
import {
  ShoppingCart, Clock, Users, Gavel, FileText, AlertCircle,
  Truck, ShieldAlert, ClipboardCheck, TrendingUp, Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Executive Acquisition Dashboard" subtitle="Loading real-time system metrics..." />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  const { metrics = {}, charts = {} } = stats || {};

  const metricCards = [
    { label: 'Total Requisitions', value: metrics.totalProcurementRequests || 0, icon: ShoppingCart, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800/40' },
    { label: 'Pending Approvals', value: metrics.pendingApprovals || 0, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/40' },
    { label: 'Active Suppliers', value: metrics.activeSuppliers || 0, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' },
    { label: 'Active Bids', value: metrics.activeBids || 0, icon: Gavel, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/40' },
    { label: 'Active Contracts', value: metrics.activeContracts || 0, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-800/40' },
    { label: 'Expiring Soon (<30d)', value: metrics.contractsExpiringSoon || 0, icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-800/40' },
    { label: 'Shipments In Transit', value: metrics.inTransitShipments || 0, icon: Truck, color: 'text-indigo-400', bg: 'bg-indigo-950/40 border-indigo-800/40' },
    { label: 'Delayed Shipments', value: metrics.delayedShipments || 0, icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/40' },
    { label: 'High Risk Items', value: metrics.highRiskItems || 0, icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-950/40 border-red-800/40' },
    { label: 'Pending Inspections', value: metrics.pendingInspections || 0, icon: ClipboardCheck, color: 'text-teal-400', bg: 'bg-teal-950/40 border-teal-800/40' },
  ];

  const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Acquisition Dashboard"
        subtitle="Real-time operational monitoring across procurement, suppliers, logistics, risks, and contracts."
        action={
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 bg-cyan-950/80 px-3 py-1.5 rounded-xl border border-cyan-800/50">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Realtime Engine Active</span>
          </div>
        }
      />

      {/* 10 Operational Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`p-4 rounded-2xl border ${card.bg} backdrop-blur-sm transition-all duration-200 hover:scale-[1.02]`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-2xl font-black text-slate-100 mt-2 font-mono tracking-tight">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Procurement Status Breakdown */}
        <Card title="Procurement Requirements by Status" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.procurementStatusChart || []}>
                <XAxis dataKey="status" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Risk Distribution Pie Chart */}
        <Card title="System Risk Severity Breakdown">
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.riskDistributionChart || []}
                  dataKey="count"
                  nameKey="riskLevel"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(charts.riskDistributionChart || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly Budget vs Spend Area Chart */}
        <Card title="Monthly Procurement Budget vs Spend Trend" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyTrendChart || []}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="budget" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} name="Budget" />
                <Area type="monotone" dataKey="spend" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Actual Spend" />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Shipment Status Breakdown */}
        <Card title="Shipment Logistics Breakdown">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.shipmentStatusChart || []} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="status" type="category" stroke="#64748b" fontSize={10} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
