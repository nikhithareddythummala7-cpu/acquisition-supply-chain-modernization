import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ArrowLeft, Package, MapPin, Truck, ClipboardCheck } from 'lucide-react';

export const ShipmentDetailPage = () => {
  const { id } = useParams();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newLocation, setNewLocation] = useState('');
  const [newStatus, setNewStatus] = useState('IN_TRANSIT');
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchShipment = async () => {
    try {
      const res = await api.get(`/shipments?limit=100`);
      const match = (res.data.shipments || []).find((s) => s._id === id);
      setShipment(match || null);
      if (match) {
        setNewLocation(match.currentLocation || '');
        setNewStatus(match.status || 'IN_TRANSIT');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const handleUpdateShipment = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/shipments/${id}`, { currentLocation: newLocation, status: newStatus });
      addToast('Shipment tracking updated', 'success');
      fetchShipment();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <Skeleton className="h-96" />;
  if (!shipment) return <div className="p-8 text-center text-slate-400">Shipment not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Shipment ${shipment.shipmentId}: ${shipment.item}`}
        subtitle={`Tracking #: ${shipment.trackingNumber} | Carrier: ${shipment.carrierName}`}
        action={
          <div className="flex items-center space-x-3">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/supply-chain')}>
              Back
            </Button>
            <Button variant="primary" icon={ClipboardCheck} onClick={() => navigate('/inspections/create')}>
              Log Quality Inspection
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Status</span>
              <Badge variant={shipment.status === 'DELAYED' ? 'danger' : 'info'}>{shipment.status}</Badge>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Quantity Shipped</span>
              <span className="text-xl font-bold font-mono text-cyan-400">{shipment.shippedQuantity} units</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Inspection Status</span>
              <Badge variant={shipment.inspectionStatus === 'PASSED' ? 'success' : 'neutral'}>{shipment.inspectionStatus}</Badge>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Milestone Location History</h4>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center text-xs text-slate-200">
                <MapPin className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
                <span><span className="font-semibold text-slate-400">Current GPS Milestone:</span> {shipment.currentLocation}</span>
              </div>
              <div className="flex items-center text-xs text-slate-200">
                <Truck className="w-4 h-4 text-purple-400 mr-2 shrink-0" />
                <span><span className="font-semibold text-slate-400">Target Delivery Date:</span> {new Date(shipment.expectedDeliveryDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Update Location & Status Form */}
        <Card title="Update Shipment Location">
          <form onSubmit={handleUpdateShipment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Milestone Location</label>
              <input
                type="text"
                required
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Shipment Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              >
                <option value="PLANNED">PLANNED</option>
                <option value="READY_TO_SHIP">READY_TO_SHIP</option>
                <option value="IN_TRANSIT">IN_TRANSIT</option>
                <option value="DELAYED">DELAYED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
            <Button type="submit" className="w-full">
              Update Transit Tracking
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
