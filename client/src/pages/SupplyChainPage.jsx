import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import api from '../services/api';
import { Truck, Package, Clock, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react';

export const SupplyChainPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await api.get('/shipments?limit=20');
        setShipments(res.data.shipments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supply Chain Logistics Monitoring"
        subtitle="Real-time transit milestone tracking, carrier status updates, and delay indicators."
        action={
          <Button icon={Package} onClick={() => navigate('/shipments')}>
            All Cargo Shipments
          </Button>
        }
      />

      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shipments.map((shp) => (
            <Card key={shp._id} className="space-y-4 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-cyan-400 font-bold">{shp.shipmentId}</span>
                <Badge variant={shp.status === 'DELAYED' ? 'danger' : shp.status === 'DELIVERED' ? 'success' : 'info'}>
                  {shp.status}
                </Badge>
              </div>

              <div>
                <h4 className="font-bold text-slate-100 text-sm">{shp.item}</h4>
                <div className="text-xs text-slate-400 mt-0.5">Carrier: {shp.carrierName}</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex items-center text-slate-300">
                  <MapPin className="w-3.5 h-3.5 mr-2 text-cyan-400 shrink-0" />
                  <span className="truncate">Current Location: {shp.currentLocation}</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <Clock className="w-3.5 h-3.5 mr-2 text-amber-400 shrink-0" />
                  <span>Est. Delivery: {new Date(shp.expectedDeliveryDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <Package className="w-3.5 h-3.5 mr-2 text-purple-400 shrink-0" />
                  <span>Quantity Shipped: {shp.shippedQuantity} units</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>Tracking: {shp.trackingNumber}</span>
                <button
                  onClick={() => navigate(`/shipments/${shp._id}`)}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Track Transit &rarr;
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
