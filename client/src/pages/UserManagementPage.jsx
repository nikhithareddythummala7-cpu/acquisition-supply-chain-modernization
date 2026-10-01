import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { UserCog, Search, Plus, UserPlus } from 'lucide-react';

const ROLES = [
  'ADMIN',
  'PROCUREMENT_OFFICER',
  'SUPPLY_CHAIN_ANALYST',
  'COMPLIANCE_AUDITOR',
  'VENDOR',
  'CONTRACT_MANAGER',
  'OPERATIONS_COMMANDER',
  'RISK_SPECIALIST',
  'EXTERNAL_AUDITOR',
];

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'PROCUREMENT_OFFICER',
    organization: 'Department of Acquisition & Logistics',
    phone: '',
  });
  const [creating, setCreating] = useState(false);
  const { addToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users?page=${page}&limit=10&search=${search}`);
      setUsers(res.data.users || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}`, { role: newRole });
      addToast('User role updated', 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await api.patch(`/users/${userId}`, { isActive: !currentActive });
      addToast(`User account ${!currentActive ? 'activated' : 'deactivated'}`, 'info');
      fetchUsers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/users', createForm);
      addToast(`User ${createForm.email} created with role ${createForm.role}`, 'success');
      setShowCreateModal(false);
      setCreateForm({
        fullName: '',
        email: '',
        password: '',
        role: 'PROCUREMENT_OFFICER',
        organization: 'Department of Acquisition & Logistics',
        phone: '',
      });
      fetchUsers();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin User Management"
        subtitle="Manage system user credentials, Role-Based Access Control (RBAC) designations, and active account states."
        action={
          <Button icon={UserPlus} onClick={() => setShowCreateModal(true)}>
            Create New User
          </Button>
        }
      />

      <Card className="!p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search users by name, email, organization..."
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
          <Table headers={['User Name', 'Email', 'Organization', 'Current Role', 'Account Status', 'Change Role', 'Action']}>
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-200">{u.fullName}</td>
                <td className="px-4 py-3 text-slate-300 font-mono text-xs">{u.email}</td>
                <td className="px-4 py-3 text-slate-400">{u.organization}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === 'ADMIN' ? 'purple' : 'info'}>{u.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.isActive ? 'success' : 'danger'}>
                    {u.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-1 focus:ring-cyan-500"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant={u.isActive ? 'danger' : 'success'}
                    size="sm"
                    onClick={() => handleToggleActive(u._id, u.isActive)}
                  >
                    {u.isActive ? 'Deactivate' : 'Activate'}
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

      {/* Admin User Creation Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Admin: Create User Account">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
              placeholder="System User"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              placeholder="user@acquisition.com"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Role *</label>
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Organization</label>
            <input
              type="text"
              value={createForm.organization}
              onChange={(e) => setCreateForm({ ...createForm, organization: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" loading={creating}>Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
