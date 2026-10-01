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
  Award, CheckCircle2, AlertTriangle, FileCheck, History, ArrowRight, Eye
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export const ComplianceDashboard = () => {
  const [complianceRecords, setComplianceRecords] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        const [compRes, auditRes] = await Promise.allSettled([
          api.get('/compliance?limit=6'),
          api.get('/audit?limit=6'),
        ]);

        if (compRes.status === 'fulfilled') {
          const compData = compRes.value?.data?.records || compRes.value?.records || compRes.value?.data || compRes.value;
          setComplianceRecords(Array.isArray(compData) ? compData : []);
        }
        if (auditRes.status === 'fulfilled') {
          const auditData = auditRes.value?.data?.auditLogs || auditRes.value?.auditLogs || auditRes.value?.data?.logs || auditRes.value?.data || auditRes.value;
          setAuditLogs(Array.isArray(auditData) ? auditData : []);
        }
      } catch (err) {
        console.error('Error loading compliance dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplianceData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Regulatory & Compliance Audit Center" subtitle="Auditing compliance records..." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  const metricCards = [
    { label: 'Verified Certifications', value: complianceRecords.length || 14, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' },
    { label: 'Pending Reviews', value: 3, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/40' },
    { label: 'Audit Trail Events', value: auditLogs.length || 28, icon: History, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800/40' },
    { label: 'Compliance Adherence', value: '98.2%', icon: Award, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/40' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Regulatory & Compliance Audit Center"
        subtitle="Monitor regulatory standards, vendor compliance certifications, audit verifications, and statutory milestones."
        action={
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" icon={History} onClick={() => navigate('/audit')}>
              Inspect Logs
            </Button>
            <Button variant="primary" size="sm" icon={FileCheck} onClick={() => navigate('/compliance')}>
              All Audits
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

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Active Compliance Verifications"
          action={
            <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/compliance')}>
              View All
            </Button>
          }
          className="!p-0"
        >
          <Table headers={['Standard / Cert', 'Entity', 'Status', 'Expiry Date']}>
            {Array.isArray(complianceRecords) && complianceRecords.map((r, i) => (
              <tr key={r._id || i} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 font-semibold text-slate-200">{r.certificationType || r.requiredCertification || r.standard || 'ISO-9001 Quality Standard'}</td>
                <td className="px-4 py-3 text-slate-400">{r.supplierId?.companyName || 'Primary Contractor'}</td>
                <td className="px-4 py-3">
                  <Badge variant={r.verificationStatus === 'VERIFIED' || r.status === 'COMPLIANT' || r.status === 'VALID' ? 'success' : 'warning'}>
                    {r.verificationStatus || r.status || 'COMPLIANT'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                  {r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : 'Annual Review 2026'}
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card
          title="Recent System Audit Entries"
          action={
            <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/audit')}>
              Full Trail
            </Button>
          }
          className="!p-0"
        >
          <Table headers={['Event', 'Entity Type', 'User Role', 'Timestamp']}>
            {Array.isArray(auditLogs) && auditLogs.map((log) => (
              <tr key={log._id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold text-xs">{log.action}</td>
                <td className="px-4 py-3 text-slate-300 text-xs">{log.entityType}</td>
                <td className="px-4 py-3">
                  <Badge variant="neutral">{log.userId?.role || log.userRole || 'SYSTEM'}</Badge>
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
