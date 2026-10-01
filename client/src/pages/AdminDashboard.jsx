import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Table } from '../components/common/Table';
import { Skeleton } from '../components/common/Skeleton';
import api from '../services/api';
import {
  ShieldCheck, Users, UserPlus, FileText, ShoppingCart,
  Activity, AlertTriangle, Key, ArrowRight, Settings, History
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes, auditRes] = await Promise.allSettled([
          api.get('/dashboard/stats'),
          api.get('/users?limit=5'),
          api.get('/audit?limit=5'),
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value?.data || statsRes.value);
        if (usersRes.status === 'fulfilled') {
          const userData = usersRes.value?.data?.users || usersRes.value?.users || usersRes.value?.data || usersRes.value;
          setUsers(Array.isArray(userData) ? userData : []);
        }
        if (auditRes.status === 'fulfilled') {
          const auditData = auditRes.value?.data?.auditLogs || auditRes.value?.auditLogs || auditRes.value?.data?.logs || auditRes.value?.data || auditRes.value;
          setAuditLogs(Array.isArray(auditData) ? auditData : []);
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="System Administration Dashboard" subtitle="Loading enterprise controls..." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  const { metrics = {}, charts = {} } = stats || {};

  const metricCards = [
    { label: 'Total Requisitions', value: metrics.totalProcurementRequests || 0, icon: ShoppingCart, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800/40' },
    { label: 'Active Suppliers', value: metrics.activeSuppliers || 0, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' },
    { label: 'Active Contracts', value: metrics.activeContracts || 0, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-800/40' },
    { label: 'High Risk Alerts', value: metrics.highRiskItems || 0, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/40' },
  ];

  const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Administration Dashboard"
        subtitle="Global system control, user access governance, security policies, and enterprise telemetry."
        action={
          <div className="flex items-center space-x-2">
            <Button variant="primary" size="sm" icon={UserPlus} onClick={() => navigate('/admin/users')}>
              Manage Users
            </Button>
            <Button variant="outline" size="sm" icon={Settings} onClick={() => navigate('/settings')}>
              Settings
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`p-4 rounded-2xl border ${card.bg} backdrop-blur-sm`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-2xl font-black text-slate-100 mt-2 font-mono">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Acquisition Pipeline Status">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.procurementStatusChart || []}>
                <XAxis dataKey="status" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Enterprise Risk Posture">
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
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Admin Quick Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card
          title="Recent System Users"
          subtitle="Latest provisioned accounts"
          action={
            <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/admin/users')}>
              View All
            </Button>
          }
          className="!p-0"
        >
          <Table headers={['User', 'Role', 'Status', 'Joined']}>
            {Array.isArray(users) && users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-200">{u.fullName || u.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === 'ADMIN' ? 'danger' : 'info'}>{u.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.isActive ? 'success' : 'neutral'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        {/* Security Audit Trail */}
        <Card
          title="Security & Governance Audit Log"
          subtitle="Recent system-level operations"
          action={
            <Button variant="ghost" size="sm" icon={History} onClick={() => navigate('/audit')}>
              Audit Trail
            </Button>
          }
          className="!p-0"
        >
          <Table headers={['Action', 'Entity', 'Status', 'Timestamp']}>
            {Array.isArray(auditLogs) && auditLogs.map((log) => (
              <tr key={log._id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 font-mono text-cyan-400 text-xs font-semibold">{log.action}</td>
                <td className="px-4 py-3 text-slate-300 text-xs">{log.entityType}</td>
                <td className="px-4 py-3">
                  <Badge variant="success">Logged</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
};
