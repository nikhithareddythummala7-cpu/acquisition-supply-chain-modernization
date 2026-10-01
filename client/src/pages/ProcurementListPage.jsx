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
import { Plus, Search, Filter, ShoppingCart, Eye, Sparkles } from 'lucide-react';

export const ProcurementListPage = () => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/procurement?page=${page}&limit=10&search=${search}&status=${statusFilter}`);
      setRequirements(res.data.requirements || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [page, search, statusFilter]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'SUBMITTED': case 'UNDER_REVIEW': return 'info';
      case 'REJECTED': case 'CANCELLED': return 'danger';
      case 'BIDDING': case 'CONTRACTING': return 'purple';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Procurement Requirements"
        subtitle="Manage end-to-end requisitions, technical specifications, and approval workflows."
        action={
          <Button icon={Plus} onClick={() => navigate('/procurement/create')}>
            New Requirement
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ID, title, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
              <option value="APPROVED">APPROVED</option>
              <option value="BIDDING">BIDDING</option>
              <option value="CONTRACTING">CONTRACTING</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table & List View */}
      {loading ? (
        <Card className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </Card>
      ) : requirements.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No Procurement Requirements Found"
          description="Create a new requisition to initiate the acquisition lifecycle."
          action={
            <Button icon={Plus} onClick={() => navigate('/procurement/create')}>
              Create Requisition
            </Button>
          }
        />
      ) : (
        <Card className="!p-0">
          <Table headers={['Request ID', 'Title', 'Category', 'Budget', 'Priority', 'Status', 'AI Analysis', 'Actions']}>
            {requirements.map((req) => (
              <tr key={req._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{req.requestId}</td>
                <td className="px-4 py-3 font-medium text-slate-200">{req.title}</td>
                <td className="px-4 py-3 text-slate-400">{req.category}</td>
                <td className="px-4 py-3 font-mono text-slate-200">${req.estimatedBudget?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Badge variant={req.priority === 'CRITICAL' ? 'danger' : req.priority === 'HIGH' ? 'warning' : 'info'}>
                    {req.priority}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  {req.aiAnalysis?.category ? (
                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                      <Sparkles className="w-3 h-3 mr-1" /> Analyzed
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Pending</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm" icon={Eye} onClick={() => navigate(`/procurement/${req._id}`)}>
                    View
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
