import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';

export const ContractCreatePage = () => {
  const [requirements, setRequirements] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    procurementRequestId: '',
    supplierId: '',
    title: '',
    description: '',
    contractValue: 250000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: 'Milestone Payments - Net 30',
    deliveryTerms: 'FOB Destination - Central Logistics Hub',
    penaltyTerms: '1% per week delay up to maximum 10% contract value',
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, supRes] = await Promise.all([
          api.get('/procurement?limit=50'),
          api.get('/suppliers?limit=50'),
        ]);
        setRequirements(reqRes.data.requirements || []);
        setSuppliers(supRes.data.suppliers || []);
        if (reqRes.data.requirements?.length > 0) {
          setFormData((prev) => ({
            ...prev,
            procurementRequestId: reqRes.data.requirements[0]._id,
            title: `Supply Agreement for ${reqRes.data.requirements[0].title}`,
          }));
        }
        if (supRes.data.suppliers?.length > 0) {
          setFormData((prev) => ({ ...prev, supplierId: supRes.data.suppliers[0]._id }));
        }
      } catch (err) {}
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        contractValue: Number(formData.contractValue),
      };
      const res = await api.post('/contracts', payload);
      addToast('Supply contract drafted successfully', 'success');
      navigate(`/contracts/${res.data._id}`);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Draft Supply Contract"
        subtitle="Establish legally binding terms, milestone schedules, and penalty clauses."
        action={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/contracts')}>
            Back to Contracts
          </Button>
        }
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Contract Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Linked Procurement Requisition *</label>
              <select
                name="procurementRequestId"
                required
                value={formData.procurementRequestId}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                {requirements.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.requestId}: {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Selected Supplier *</label>
              <select
                name="supplierId"
                required
                value={formData.supplierId}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.supplierId}: {s.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Contract Value (USD) *</label>
              <input
                type="number"
                name="contractValue"
                required
                min={0}
                value={formData.contractValue}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Start Date *</label>
              <input
                type="date"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">End / Expiry Date *</label>
              <input
                type="date"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Penalty & Liquidated Damages Terms</label>
              <input
                type="text"
                name="penaltyTerms"
                value={formData.penaltyTerms}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <Button variant="outline" onClick={() => navigate('/contracts')}>
              Cancel
            </Button>
            <Button type="submit" icon={Save} loading={loading}>
              Save Contract
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
