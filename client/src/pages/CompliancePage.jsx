import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import { Skeleton } from '../components/common/Skeleton';
import api from '../services/api';
import { Award, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const CompliancePage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCompliance = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/compliance?page=${page}&limit=10`);
        setRecords(res.data.records || []);
        setPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompliance();
  }, [page]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Regulatory & Quality Compliance Tracking"
        subtitle="Track vendor ISO quality certifications, defense compliance filings, and expiry alerts."
      />

      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <Card className="!p-0">
          <Table headers={['Compliance ID', 'Required Certification Title', 'Supplier Organization', 'Expiry Date', 'Verification Status']}>
            {records.map((rec) => (
              <tr key={rec._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{rec.complianceId}</td>
                <td className="px-4 py-3 font-medium text-slate-200">{rec.requiredCertification}</td>
                <td className="px-4 py-3 text-slate-300">{rec.supplierId?.companyName || 'Supplier'}</td>
                <td className="px-4 py-3 text-slate-300">{new Date(rec.expiryDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Badge variant={rec.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}>
                    {rec.verificationStatus}
                  </Badge>
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
