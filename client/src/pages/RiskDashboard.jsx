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
  ShieldAlert, AlertTriangle, Eye, ArrowRight, TrendingUp, Sparkles
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis
} from 'recharts';

export const RiskDashboard = () => {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const res = await api.get('/risks?limit=8');
        const rskData = res?.data?.risks || res?.risks || res?.data || res;
        setRisks(Array.isArray(rskData) ? rskData : []);
      } catch (err) {
        console.error('Error fetching risk telemetry:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRisks();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Risk Intelligence & Threat Matrix" subtitle="Scanning vulnerability telemetry..." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  const severityCounts = {
    CRITICAL: risks.filter((r) => r.overallRisk === 'CRITICAL').length,
    HIGH: risks.filter((r) => r.overallRisk === 'HIGH').length,
    MEDIUM: risks.filter((r) => r.overallRisk === 'MEDIUM').length,
    LOW: risks.filter((r) => r.overallRisk === 'LOW').length,
  };

  const chartData = [
    { name: 'Critical', count: severityCounts.CRITICAL, fill: '#ef4444' },
    { name: 'High', count: severityCounts.HIGH, fill: '#f97316' },
    { name: 'Medium', count: severityCounts.MEDIUM, fill: '#8b5cf6' },
    { name: 'Low', count: severityCounts.LOW, fill: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Intelligence & Threat Matrix"
        subtitle="Continuous evaluation of supplier vulnerabilities, supply bottlenecks, geopolitical disruptions, and quality failures."
        action={
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" icon={TrendingUp} onClick={() => navigate('/analytics/forecast')}>
              Predictive Models
            </Button>
            <Button variant="primary" size="sm" icon={ShieldAlert} onClick={() => navigate('/risk')}>
              Full Risk Register
            </Button>
          </div>
        }
      />

      {/* Severity Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/40">
          <div className="text-[11px] font-bold text-rose-400 uppercase">Critical Severity</div>
          <div className="text-2xl font-black text-rose-300 font-mono mt-1">{severityCounts.CRITICAL}</div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40">
          <div className="text-[11px] font-bold text-amber-400 uppercase">High Severity</div>
          <div className="text-2xl font-black text-amber-300 font-mono mt-1">{severityCounts.HIGH}</div>
        </div>
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40">
          <div className="text-[11px] font-bold text-purple-400 uppercase">Medium Severity</div>
          <div className="text-2xl font-black text-purple-300 font-mono mt-1">{severityCounts.MEDIUM}</div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40">
          <div className="text-[11px] font-bold text-emerald-400 uppercase">Low Risk</div>
          <div className="text-2xl font-black text-emerald-300 font-mono mt-1">{severityCounts.LOW}</div>
        </div>
      </div>

      {/* Charts & Risk Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Threat Severity Breakdown" className="lg:col-span-1">
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Priority Risks Table */}
        <Card
          title="Active Risk Vectors & Mitigation Priorities"
          className="lg:col-span-2 !p-0"
          action={
            <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/risk')}>
              View All
            </Button>
          }
        >
          <Table headers={['Risk ID', 'Entity Type', 'Overall Risk', 'Supplier Risk', 'Delivery Risk', 'Quality Risk', 'Action']}>
            {Array.isArray(risks) && risks.map((rsk) => (
              <tr key={rsk._id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{rsk.riskId}</td>
                <td className="px-4 py-3 text-slate-300">{rsk.relatedEntityType}</td>
                <td className="px-4 py-3">
                  <Badge variant={rsk.overallRisk === 'CRITICAL' ? 'danger' : rsk.overallRisk === 'HIGH' ? 'warning' : 'info'}>
                    {rsk.overallRisk}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-mono text-rose-400">{rsk.supplierRisk}/100</td>
                <td className="px-4 py-3 font-mono text-amber-400">{rsk.deliveryRisk}/100</td>
                <td className="px-4 py-3 font-mono text-cyan-400">{rsk.qualityRisk}/100</td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm" icon={Eye} onClick={() => navigate(`/risk/${rsk._id}`)}>
                    Analyze
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
