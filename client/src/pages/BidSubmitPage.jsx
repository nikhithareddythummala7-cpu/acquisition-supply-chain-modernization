import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ArrowLeft, Send } from 'lucide-react';

export const BidSubmitPage = () => {
  const { reqId } = useParams();
  const [requirements, setRequirements] = useState([]);
  const [formData, setFormData] = useState({
    procurementRequestId: reqId !== 'reqId' ? reqId : '',
    quotedPrice: 120000,
    deliveryTimeDays: 30,
    paymentTerms: 'Milestone Payments - Net 30',
    technicalProposal: 'Detailed technical proposal guaranteeing specification compliance and quality control.',
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReqs = async () => {
      try {
        const res = await api.get('/procurement?limit=50');
        setRequirements(res.data.requirements || []);
        if (res.data.requirements?.length > 0 && !formData.procurementRequestId) {
          setFormData((prev) => ({ ...prev, procurementRequestId: res.data.requirements[0]._id }));
        }
      } catch (err) {}
    };
    fetchReqs();
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
        quotedPrice: Number(formData.quotedPrice),
        deliveryTimeDays: Number(formData.deliveryTimeDays),
      };
      await api.post('/bids', payload);
      addToast('Bid proposal submitted successfully', 'success');
      navigate('/bids');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submit Vendor Bid Proposal"
        subtitle="Submit technical proposal and pricing for an active acquisition opportunity."
        action={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/bids')}>
            Back to Bids
          </Button>
        }
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Target Procurement Opportunity *</label>
              <select
                name="procurementRequestId"
                required
                value={formData.procurementRequestId}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                {requirements.map((req) => (
                  <option key={req._id} value={req._id}>
                    {req.requestId}: {req.title} (Est. Budget: ${req.estimatedBudget?.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Quoted Price (USD) *</label>
              <input
                type="number"
                name="quotedPrice"
                required
                min={0}
                value={formData.quotedPrice}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Delivery Time (Days) *</label>
              <input
                type="number"
                name="deliveryTimeDays"
                required
                min={1}
                value={formData.deliveryTimeDays}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Payment Terms Offered</label>
              <input
                type="text"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Technical Proposal Overview *</label>
              <textarea
                name="technicalProposal"
                required
                rows={4}
                value={formData.technicalProposal}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <Button variant="outline" onClick={() => navigate('/bids')}>
              Cancel
            </Button>
            <Button type="submit" icon={Send} loading={loading}>
              Submit Proposal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
