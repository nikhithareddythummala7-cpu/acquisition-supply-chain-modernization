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
  ShoppingCart, Clock, Gavel, Users, Plus, ArrowRight,
  TrendingUp, Sparkles, Eye, CheckCircle2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from 'recharts';

export const ProcurementDashboard = () => {
  const [stats, setStats] = useState(null);
  const [procurements, setProcurements] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProcurementData = async () => {
      try {
        const [statsRes, procRes, bidsRes] = await Promise.allSettled([
          api.get('/dashboard/stats'),
          api.get('/procurement?limit=5'),
          api.get('/bids?limit=5'),
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value?.data || statsRes.value);
        if (procRes.status === 'fulfilled') {
          const procData = procRes.value?.data?.requirements || procRes.value?.requirements || procRes.value?.data || procRes.value;
          setProcurements(Array.isArray(procData) ? procData : []);
        }
        if (bidsRes.status === 'fulfilled') {
          const bidsData = bidsRes.value?.data?.bids || bidsRes.value?.bids || bidsRes.value?.data || bidsRes.value;
          setBids(Array.isArray(bidsData) ? bidsData : []);
        }
      } catch (err) {
        console.error('Error fetching procurement dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProcurementData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Procurement Command Center" subtitle="Loading requisition telemetry..." />
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
    { label: 'Pending Approvals', value: metrics.pendingApprovals || 0, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/40' },
    { label: 'Active Proposals/Bids', value: metrics.activeBids || 0, icon: Gavel, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/40' },
    { label: 'Active Suppliers', value: metrics.activeSuppliers || 0, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Procurement Command Center"
        subtitle="Strategic sourcing, requisition authoring, vendor bid evaluations, and budget allocation."
        action={
          <div className="flex items-center space-x-2">
            <Button variant="primary" size="sm" icon={Plus} onClick={() => navigate('/procurement/create')}>
              New Requirement
            </Button>
            <Button variant="outline" size="sm" icon={Gavel} onClick={() => navigate('/bids')}>
              Compare Bids
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Requisition Status Distribution">
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

        <Card title="Monthly Budget vs Actual Spend">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyTrendChart || []}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="budget" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} name="Budget" />
                <Area type="monotone" dataKey="spend" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Actual Spend" />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requisitions */}
        <Card
          title="Recent Procurement Requirements"
          action={
            <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/procurement')}>
              View All
            </Button>
          }
          className="!p-0"
        >
          <Table headers={['Req ID', 'Title', 'Estimated Budget', 'Status', 'Action']}>
            {Array.isArray(procurements) && procurements.map((req) => (
              <tr key={req._id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{req.requirementId}</td>
                <td className="px-4 py-3 text-slate-200 font-medium truncate max-w-xs">{req.title}</td>
                <td className="px-4 py-3 font-mono text-emerald-400">${(req.estimatedBudget || 0).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Badge variant={req.status === 'APPROVED' ? 'success' : 'warning'}>{req.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm" icon={Eye} onClick={() => navigate(`/procurement/${req._id}`)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        {/* Recent Bids */}
        <Card
          title="Recent Supplier Proposals"
          action={
            <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/bids')}>
              View All
            </Button>
          }
          className="!p-0"
        >
          <Table headers={['Bid ID', 'Supplier', 'Offered Amount', 'Status', 'Score']}>
            {Array.isArray(bids) && bids.map((b) => (
              <tr key={b._id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{b.bidId}</td>
                <td className="px-4 py-3 text-slate-200 font-medium">{b.supplierId?.companyName || 'Supplier'}</td>
                <td className="px-4 py-3 font-mono text-cyan-400">${(b.bidAmount || 0).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Badge variant={b.status === 'SHORTLISTED' ? 'success' : 'info'}>{b.status}</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-amber-400 font-semibold">{b.aiEvaluationScore || b.complianceScore || 85}/100</td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
};
