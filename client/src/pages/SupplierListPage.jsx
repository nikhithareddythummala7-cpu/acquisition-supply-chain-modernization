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
import { Plus, Search, Users, Eye, Sparkles } from 'lucide-react';

export const SupplierListPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/suppliers?page=${page}&limit=10&search=${search}`);
      setSuppliers(res.data.suppliers || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [page, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Directory"
        subtitle="Manage supplier profiles, performance scorecards, and regulatory compliance verification."
        action={
          <Button icon={Plus} onClick={() => navigate('/suppliers/create')}>
            Register Supplier
          </Button>
        }
      />

      <Card className="!p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search suppliers by ID, company name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </Card>

      {loading ? (
        <Skeleton className="h-64" />
      ) : suppliers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Suppliers Found"
          description="Register a new vendor to manage their performance scorecard."
          action={
            <Button icon={Plus} onClick={() => navigate('/suppliers/create')}>
              Register Supplier
            </Button>
          }
        />
      ) : (
        <Card className="!p-0">
          <Table headers={['Supplier ID', 'Company Name', 'Quality Score', 'Delivery Score', 'Compliance Score', 'Risk Score', 'Status', 'Actions']}>
            {suppliers.map((sup) => (
              <tr key={sup._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{sup.supplierId}</td>
                <td className="px-4 py-3 font-medium text-slate-200">{sup.companyName}</td>
                <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">{sup.qualityScore}/100</td>
                <td className="px-4 py-3 font-mono text-blue-400 font-semibold">{sup.deliveryScore}/100</td>
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{sup.complianceScore}/100</td>
                <td className="px-4 py-3 font-mono text-rose-400 font-semibold">{sup.riskScore}/100</td>
                <td className="px-4 py-3">
                  <Badge variant={sup.status === 'ACTIVE' ? 'success' : 'danger'}>{sup.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm" icon={Eye} onClick={() => navigate(`/suppliers/${sup._id}`)}>
                    Profile
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
