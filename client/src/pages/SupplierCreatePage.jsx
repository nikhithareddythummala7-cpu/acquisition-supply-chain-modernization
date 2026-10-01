import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';

export const SupplierCreatePage = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    street: '100 Defense Highway',
    city: 'Arlington',
    state: 'VA',
    country: 'USA',
    zip: '22202',
    category: 'Defense Equipment',
    yearsInBusiness: 8,
    qualityScore: 85,
    deliveryScore: 88,
    complianceScore: 92,
    riskScore: 15,
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
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zip: formData.zip,
        },
        category: [formData.category],
        yearsInBusiness: Number(formData.yearsInBusiness),
        qualityScore: Number(formData.qualityScore),
        deliveryScore: Number(formData.deliveryScore),
        complianceScore: Number(formData.complianceScore),
        riskScore: Number(formData.riskScore),
      };
      const res = await api.post('/suppliers', payload);
      addToast('Supplier onboarded successfully', 'success');
      navigate(`/suppliers/${res.data._id}`);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Register New Supplier"
        subtitle="Onboard a vendor organization into the acquisition network."
        action={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/suppliers')}>
            Back to Directory
          </Button>
        }
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Company Name *</label>
              <input
                type="text"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Apex Defense Solutions Inc."
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Primary Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@apexdef.com"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Phone Number *</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (800) 555-0199"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Primary Industry Category</label>
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
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Years in Business</label>
              <input
                type="number"
                name="yearsInBusiness"
                value={formData.yearsInBusiness}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Quality Score (0-100)</label>
              <input
                type="number"
                name="qualityScore"
                min={0}
                max={100}
                value={formData.qualityScore}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <Button variant="outline" onClick={() => navigate('/suppliers')}>
              Cancel
            </Button>
            <Button type="submit" icon={Save} loading={loading}>
              Save Supplier
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
