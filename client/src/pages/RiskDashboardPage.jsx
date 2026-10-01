import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import { Skeleton } from '../components/common/Skeleton';
import api from '../services/api';
import { ShieldAlert, Eye, Plus, AlertTriangle } from 'lucide-react';

export const RiskDashboardPage = () => {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRisks = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/risks?page=${page}&limit=10`);
        setRisks(res.data.risks || []);
        setPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRisks();
  }, [page]);

  const severityCounts = {
    CRITICAL: risks.filter((r) => r.overallRisk === 'CRITICAL').length,
    HIGH: risks.filter((r) => r.overallRisk === 'HIGH').length,
    MEDIUM: risks.filter((r) => r.overallRisk === 'MEDIUM').length,
    LOW: risks.filter((r) => r.overallRisk === 'LOW').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Assessment Matrix"
        subtitle="Evaluate supplier risks, transit bottlenecks, quality defect frequencies, and financial vulnerabilities."
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

      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <Card className="!p-0">
          <Table headers={['Risk ID', 'Entity Type', 'Overall Risk', 'Supplier Risk', 'Delivery Risk', 'Quality Risk', 'Status', 'Actions']}>
            {risks.map((rsk) => (
              <tr key={rsk._id} className="hover:bg-slate-800/40 transition-colors">
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
                  <Badge variant="neutral">{rsk.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm" icon={Eye} onClick={() => navigate(`/risk/${rsk._id}`)}>
                    Analyze
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
          <div className="p-4 border-t border-slate-800">
            <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
          </div>
        </Card>
      )}
    </div>
  );
};
