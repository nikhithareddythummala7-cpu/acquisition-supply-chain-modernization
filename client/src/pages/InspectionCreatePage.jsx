import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';

export const InspectionCreatePage = () => {
  const [shipments, setShipments] = useState([]);
  const [formData, setFormData] = useState({
    shipmentId: '',
    receivedQuantity: 100,
    acceptedQuantity: 95,
    rejectedQuantity: 5,
    qualityStatus: 'PASSED',
    defects: 'Minor package seal abrasion',
    notes: 'Physical quality verification completed against specification checklist.',
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await api.get('/shipments?limit=50');
        setShipments(res.data.shipments || []);
        if (res.data.shipments?.length > 0) {
          setFormData((prev) => ({ ...prev, shipmentId: res.data.shipments[0]._id }));
        }
      } catch (err) {}
    };
    fetchShipments();
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
        receivedQuantity: Number(formData.receivedQuantity),
        acceptedQuantity: Number(formData.acceptedQuantity),
        rejectedQuantity: Number(formData.rejectedQuantity),
        defects: formData.defects ? formData.defects.split(',').map((s) => s.trim()) : [],
      };
      await api.post('/inspections', payload);
      addToast('Quality inspection report logged', 'success');
      navigate('/inspections');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Log Quality Inspection Report"
        subtitle="Verify received shipment cargo against technical quality specifications."
        action={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/inspections')}>
            Back
          </Button>
        }
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Target Cargo Shipment *</label>
              <select
                name="shipmentId"
                required
                value={formData.shipmentId}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                {shipments.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.shipmentId}: {s.item} (Tracking: {s.trackingNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Received Quantity *</label>
              <input
                type="number"
                name="receivedQuantity"
                required
                min={1}
                value={formData.receivedQuantity}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Accepted Quantity *</label>
              <input
                type="number"
                name="acceptedQuantity"
                required
                min={0}
                value={formData.acceptedQuantity}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Rejected Quantity</label>
              <input
                type="number"
                name="rejectedQuantity"
                min={0}
                value={formData.rejectedQuantity}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Quality Status</label>
              <select
                name="qualityStatus"
                value={formData.qualityStatus}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                <option value="PASSED">PASSED</option>
                <option value="PARTIAL_PASS">PARTIAL_PASS</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Observed Defects (comma separated)</label>
              <input
                type="text"
                name="defects"
                value={formData.defects}
                onChange={handleChange}
                placeholder="Surface corrosion, package tear, missing documentation"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <Button variant="outline" onClick={() => navigate('/inspections')}>
              Cancel
            </Button>
            <Button type="submit" icon={Save} loading={loading}>
              Save Inspection Report
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
