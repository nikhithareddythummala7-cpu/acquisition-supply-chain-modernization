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
import { FileText, Plus, Search, Eye, AlertTriangle } from 'lucide-react';

export const ContractListPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/contracts?page=${page}&limit=10&search=${search}`);
      setContracts(res.data.contracts || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [page, search]);

  const isExpiringSoon = (endDate) => {
    if (!endDate) return false;
    const diffDays = (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 30;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supply Contract Lifecycle"
        subtitle="Manage legally binding supply agreements, tracking expiry, renewal terms, and AI legal clause extraction."
        action={
          <Button icon={Plus} onClick={() => navigate('/contracts/create')}>
            Draft New Contract
          </Button>
        }
      />

      <Card className="!p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search contracts by contract number, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </Card>

      {loading ? (
        <Skeleton className="h-64" />
      ) : contracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Contracts Found"
          description="Draft or execute supply agreements to manage lifecycle terms."
          action={
            <Button icon={Plus} onClick={() => navigate('/contracts/create')}>
              Draft New Contract
            </Button>
          }
        />
      ) : (
        <Card className="!p-0">
          <Table headers={['Contract #', 'Title', 'Supplier', 'Contract Value', 'End Date', 'Expiry Indicator', 'Status', 'Actions']}>
            {contracts.map((ctr) => (
              <tr key={ctr._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{ctr.contractNumber}</td>
                <td className="px-4 py-3 font-medium text-slate-200">{ctr.title}</td>
                <td className="px-4 py-3 text-slate-300">{ctr.supplierId?.companyName || 'Supplier'}</td>
                <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">${ctr.contractValue?.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-300">{new Date(ctr.endDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {isExpiringSoon(ctr.endDate) ? (
                    <span className="inline-flex items-center text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50 animate-pulse">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Expiring &lt;30d
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Normal</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={ctr.status === 'ACTIVE' ? 'success' : ctr.status === 'EXPIRED' ? 'danger' : 'neutral'}>
                    {ctr.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm" icon={Eye} onClick={() => navigate(`/contracts/${ctr._id}`)}>
                    View Terms
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
