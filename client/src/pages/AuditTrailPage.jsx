import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import { Skeleton } from '../components/common/Skeleton';
import api from '../services/api';
import { History, Search, ShieldCheck } from 'lucide-react';

export const AuditTrailPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/audit?page=${page}&limit=15&search=${search}`);
        setLogs(res.data.auditLogs || []);
        setPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditLogs();
  }, [page, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Immutable Governance Audit Trail"
        subtitle="Comprehensive log of all authentication events, requirement approvals, contract edits, and AI executions."
        action={
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 bg-cyan-950/80 px-3 py-1.5 rounded-xl border border-cyan-800/50">
            <ShieldCheck className="w-4 h-4" />
            <span>Tamper-Resistant Security Logging</span>
          </div>
        }
      />

      <Card className="!p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search audit trail by user email, action, entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </Card>

      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <Card className="!p-0">
          <Table headers={['Timestamp', 'User Email', 'Role', 'Action', 'Target Entity', 'IP Address', 'Status']}>
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 font-mono text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium text-slate-200">{log.userEmail}</td>
                <td className="px-4 py-3 font-mono text-cyan-400 text-[11px]">{log.userRole}</td>
                <td className="px-4 py-3 font-mono font-semibold text-slate-100">{log.action}</td>
                <td className="px-4 py-3 text-slate-400">{log.entityType ? `${log.entityType}` : 'N/A'}</td>
                <td className="px-4 py-3 font-mono text-slate-400">{log.ipAddress}</td>
                <td className="px-4 py-3">
                  <Badge variant={log.status === 'SUCCESS' ? 'success' : 'danger'}>{log.status}</Badge>
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
