import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import api from '../services/api';
import { Gavel, GitCompare, Plus } from 'lucide-react';

export const BidListPage = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchBids = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bids?page=${page}&limit=10`);
      setBids(res.data.bids || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, [page]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bid Submissions & Proposals"
        subtitle="Track submitted vendor proposals and perform comparative technical evaluations."
        action={
          <Button icon={Plus} onClick={() => navigate('/bids/submit/reqId')}>
            Submit Bid Proposal
          </Button>
        }
      />

      {loading ? (
        <Skeleton className="h-64" />
      ) : bids.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title="No Bid Submissions Found"
          description="Bids submitted by vendor organizations will appear here."
        />
      ) : (
        <Card className="!p-0">
          <Table headers={['Bid ID', 'Requisition ID', 'Supplier / Vendor', 'Quoted Price', 'Delivery (Days)', 'Payment Terms', 'Status', 'Action']}>
            {bids.map((bid) => (
              <tr key={bid._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{bid.bidId}</td>
                <td className="px-4 py-3 font-mono text-slate-300">{bid.procurementRequestId?.requestId || 'N/A'}</td>
                <td className="px-4 py-3 font-medium text-slate-200">{bid.supplierId?.companyName || 'Vendor Bidder'}</td>
                <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">${bid.quotedPrice?.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-300">{bid.deliveryTimeDays} days</td>
                <td className="px-4 py-3 text-slate-400">{bid.paymentTerms}</td>
                <td className="px-4 py-3">
                  <Badge variant={bid.status === 'ACCEPTED' ? 'success' : bid.status === 'REJECTED' ? 'danger' : 'info'}>
                    {bid.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={GitCompare}
                    onClick={() => navigate(`/bids/comparison/${bid.procurementRequestId?._id || bid.procurementRequestId}`)}
                  >
                    Compare Matrix
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
