import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';

export const ProcurementCreatePage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Defense Equipment',
    quantity: 1,
    unitOfMeasure: 'Units',
    estimatedBudget: 100000,
    requiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'MEDIUM',
    department: 'Procurement & Logistics',
    complianceRequirements: 'ISO 9001:2015, Defense Quality Assurance',
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        estimatedBudget: Number(formData.estimatedBudget),
        complianceRequirements: formData.complianceRequirements.split(',').map((s) => s.trim()),
      };
      const res = await api.post('/procurement', payload);
      addToast('Procurement requisition created successfully', 'success');
      navigate(`/procurement/${res.data._id}`);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Procurement Requirement"
        subtitle="Initiate a formal requisition for acquisition approval."
        action={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/procurement')}>
            Back to Requisitions
          </Button>
        }
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Requisition Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Tactical Satellite Communications Antenna System"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Procurement Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                <option value="Defense Equipment">Defense Equipment</option>
                <option value="IT & Communications">IT & Communications</option>
                <option value="Logistics Services">Logistics Services</option>
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="Raw Materials">Raw Materials</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Priority Level *</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Quantity *</label>
              <input
                type="number"
                name="quantity"
                required
                min={1}
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Estimated Budget (USD) *</label>
              <input
                type="number"
                name="estimatedBudget"
                required
                min={0}
                value={formData.estimatedBudget}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Required Delivery Date *</label>
              <input
                type="date"
                name="requiredDate"
                required
                value={formData.requiredDate}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Detailed Specifications & Scope *</label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe complete technical specifications, physical requirements, delivery location, and operating conditions..."
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Compliance Requirements (comma separated)</label>
              <input
                type="text"
                name="complianceRequirements"
                value={formData.complianceRequirements}
                onChange={handleChange}
                placeholder="ISO 9001:2015, STANAG 4586, Defense Procurement Policy"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <Button variant="outline" onClick={() => navigate('/procurement')}>
              Cancel
            </Button>
            <Button type="submit" icon={Save} loading={loading}>
              Submit Requisition
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
