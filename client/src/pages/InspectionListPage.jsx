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
import { ClipboardCheck, Plus } from 'lucide-react';

export const InspectionListPage = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInspections = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/inspections?page=${page}&limit=10`);
        setInspections(res.data.inspections || []);
        setPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInspections();
  }, [page]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality Inspection Reports"
        subtitle="Verification logs for received cargo shipments, defect logging, and acceptance rates."
        action={
          <Button icon={Plus} onClick={() => navigate('/inspections/create')}>
            Log Inspection
          </Button>
        }
      />

      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <Card className="!p-0">
          <Table headers={['Inspection ID', 'Shipment Reference', 'Inspector', 'Received', 'Accepted', 'Rejected', 'Quality Status', 'Defects']}>
            {inspections.map((ins) => (
              <tr key={ins._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{ins.inspectionId}</td>
                <td className="px-4 py-3 font-mono text-slate-300">{ins.shipmentId?.shipmentId || 'Shipment'}</td>
                <td className="px-4 py-3 text-slate-300">{ins.inspector?.fullName || 'Inspector'}</td>
                <td className="px-4 py-3 font-mono text-slate-200">{ins.receivedQuantity}</td>
                <td className="px-4 py-3 font-mono text-emerald-400">{ins.acceptedQuantity}</td>
                <td className="px-4 py-3 font-mono text-rose-400">{ins.rejectedQuantity}</td>
                <td className="px-4 py-3">
                  <Badge variant={ins.qualityStatus === 'PASSED' ? 'success' : 'danger'}>{ins.qualityStatus}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-400">{(ins.defects || []).join(', ') || 'None'}</td>
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
