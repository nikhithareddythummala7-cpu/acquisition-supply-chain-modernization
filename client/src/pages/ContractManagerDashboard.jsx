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
  FileText, AlertCircle, Plus, Eye, ArrowRight, ShieldCheck, DollarSign
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export const ContractManagerDashboard = () => {
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const [contractsRes, statsRes] = await Promise.allSettled([
          api.get('/contracts?limit=6'),
          api.get('/dashboard/stats'),
        ]);

        if (contractsRes.status === 'fulfilled') {
          const contractsData = contractsRes.value?.data?.contracts || contractsRes.value?.contracts || contractsRes.value?.data || contractsRes.value;
          setContracts(Array.isArray(contractsData) ? contractsData : []);
        }
        if (statsRes.status === 'fulfilled') setStats(statsRes.value?.data || statsRes.value);
      } catch (err) {
        console.error('Error fetching contract dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContractData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Contract Lifecycle Management" subtitle="Loading agreements data..." />
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
    { label: 'Active Contracts', value: metrics.activeContracts || contracts.length, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-800/40' },
    { label: 'Expiring Soon (<30d)', value: metrics.contractsExpiringSoon || 0, icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-800/40' },
    { label: 'Active Suppliers', value: metrics.activeSuppliers || 0, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' },
    { label: 'Contract Portfolio', value: '$12.4M', icon: DollarSign, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800/40' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contract Lifecycle Management Dashboard"
        subtitle="Supervise agreement milestones, SLA compliance, renewals, and financial commitments."
        action={
          <div className="flex items-center space-x-2">
            <Button variant="primary" size="sm" icon={Plus} onClick={() => navigate('/contracts/create')}>
              New Contract
            </Button>
            <Button variant="outline" size="sm" icon={FileText} onClick={() => navigate('/contracts')}>
              All Agreements
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

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Contract Status Breakdown" className="lg:col-span-1">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.contractStatusChart || []}>
                <XAxis dataKey="status" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Active Contract Repository"
          className="lg:col-span-2 !p-0"
          action={
            <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/contracts')}>
              View All
            </Button>
          }
        >
          <Table headers={['Contract #', 'Title', 'Supplier', 'Value', 'Status', 'Action']}>
            {Array.isArray(contracts) && contracts.map((c) => (
              <tr key={c._id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{c.contractNumber}</td>
                <td className="px-4 py-3 text-slate-200 font-medium truncate max-w-xs">{c.title}</td>
                <td className="px-4 py-3 text-slate-400">{c.supplierId?.companyName || 'Vendor Entity'}</td>
                <td className="px-4 py-3 font-mono text-emerald-400">${(c.contractValue || 0).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Badge variant={c.status === 'ACTIVE' ? 'success' : 'neutral'}>{c.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm" icon={Eye} onClick={() => navigate(`/contracts/${c._id}`)}>
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
};
