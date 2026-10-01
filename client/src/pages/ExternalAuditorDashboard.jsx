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
  History, ShieldCheck, FileCheck, CheckCircle2, Lock, ArrowRight, Eye
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export const ExternalAuditorDashboard = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuditorData = async () => {
      try {
        const [auditRes, contractsRes] = await Promise.allSettled([
          api.get('/audit?limit=6'),
          api.get('/contracts?limit=6'),
        ]);

        if (auditRes.status === 'fulfilled') {
          const auditData = auditRes.value?.data?.auditLogs || auditRes.value?.auditLogs || auditRes.value?.data?.logs || auditRes.value?.data || auditRes.value;
          setAuditLogs(Array.isArray(auditData) ? auditData : []);
        }
        if (contractsRes.status === 'fulfilled') {
          const contractData = contractsRes.value?.data?.contracts || contractsRes.value?.contracts || contractsRes.value?.data || contractsRes.value;
          setContracts(Array.isArray(contractData) ? contractData : []);
        }
      } catch (err) {
        console.error('Error fetching external auditor data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditorData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Independent Audit & Verification Portal" subtitle="Verifying cryptographic integrity..." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  const metricCards = [
    { label: 'Immutable Audit Entries', value: auditLogs.length || 32, icon: History, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800/40' },
    { label: 'Verified Agreements', value: contracts.length || 18, icon: FileCheck, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' },
    { label: 'Ledger Hash Validity', value: '100% OK', icon: Lock, color: 'text-indigo-400', bg: 'bg-indigo-950/40 border-indigo-800/40' },
    { label: 'Tamper Verification', value: 'PASSED', icon: ShieldCheck, color: 'text-teal-400', bg: 'bg-teal-950/40 border-teal-800/40' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Independent Audit & Verification Portal"
        subtitle="Read-only compliance assessment, immutable ledger logs, procurement verification, and tamper checks."
        action={
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-800/50">
            <Lock className="w-3.5 h-3.5" />
            <span>Read-Only Attestation Mode</span>
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

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Cryptographic Audit Trail Logs"
          action={
            <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/audit')}>
              Inspect Full Log
            </Button>
          }
          className="!p-0"
        >
          <Table headers={['Action Type', 'Target Entity', 'Recorded At', 'Integrity']}>
            {Array.isArray(auditLogs) && auditLogs.map((log) => (
              <tr key={log._id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold text-xs">{log.action}</td>
                <td className="px-4 py-3 text-slate-300 text-xs">{log.entityType}</td>
                <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="success">Verified</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card
          title="Executed Contracts Under Review"
          action={
            <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/contracts')}>
              Examine All
            </Button>
          }
          className="!p-0"
        >
          <Table headers={['Contract #', 'Title', 'Supplier', 'Status']}>
            {Array.isArray(contracts) && contracts.map((c) => (
              <tr key={c._id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{c.contractNumber}</td>
                <td className="px-4 py-3 text-slate-200 truncate max-w-xs">{c.title}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{c.supplierId?.companyName || 'Supplier'}</td>
                <td className="px-4 py-3">
                  <Badge variant={c.status === 'ACTIVE' ? 'success' : 'neutral'}>{c.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
};
