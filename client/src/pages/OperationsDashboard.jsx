import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Table } from '../components/common/Table';
import { Skeleton } from '../components/common/Skeleton';
import api from '../services/api';
import {
  Activity, Truck, Package, ShieldCheck, ShoppingCart, Eye, ArrowRight, Crosshair
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export const OperationsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOpsData = async () => {
      try {
        const [statsRes, shipRes, procRes] = await Promise.allSettled([
          api.get('/dashboard/stats'),
          api.get('/shipments?limit=5'),
          api.get('/procurement?limit=5'),
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value?.data || statsRes.value);
        if (shipRes.status === 'fulfilled') {
          const shipData = shipRes.value?.data?.shipments || shipRes.value?.shipments || shipRes.value?.data || shipRes.value;
          setShipments(Array.isArray(shipData) ? shipData : []);
        }
        if (procRes.status === 'fulfilled') {
          const procData = procRes.value?.data?.requirements || procRes.value?.requirements || procRes.value?.data || procRes.value;
          setProcurements(Array.isArray(procData) ? procData : []);
        }
      } catch (err) {
        console.error('Error fetching operations dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpsData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Operations Command & Readiness Center" subtitle="Synchronizing tactical readiness..." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  const { metrics = {}, charts = {} } = stats || {};

  const metricCards = [
    { label: 'Active Shipments', value: metrics.inTransitShipments || shipments.length, icon: Truck, color: 'text-indigo-400', bg: 'bg-indigo-950/40 border-indigo-800/40' },
    { label: 'Pending Requisitions', value: metrics.pendingApprovals || 0, icon: ShoppingCart, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800/40' },
    { label: 'Delayed Cargo', value: metrics.delayedShipments || 0, icon: Activity, color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/40' },
    { label: 'Operations Readiness', value: '96.5%', icon: Crosshair, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Command & Readiness Center"
        subtitle="Tactical acquisition synchronization, logistics readiness, shipment arrivals, and resource fulfillment."
        action={
          <div className="flex items-center space-x-2">
            <Button variant="primary" size="sm" icon={Package} onClick={() => navigate('/supply-chain')}>
              Logistics Feed
            </Button>
            <Button variant="outline" size="sm" icon={Truck} onClick={() => navigate('/shipments')}>
              All Shipments
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`p-4 rounded-2xl border ${card.bg} backdrop-blur-sm`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-2xl font-black text-slate-100 mt-2 font-mono">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Active Logistics Movements"
          action={
            <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/shipments')}>
              View All
            </Button>
          }
          className="!p-0"
        >
          <Table headers={['Shipment ID', 'Material / Item', 'Carrier', 'Status', 'Action']}>
            {Array.isArray(shipments) && shipments.map((s) => (
              <tr key={s._id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{s.shipmentId}</td>
                <td className="px-4 py-3 text-slate-200 font-medium">{s.item}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{s.carrierName}</td>
                <td className="px-4 py-3">
                  <Badge variant={s.status === 'IN_TRANSIT' ? 'info' : 'success'}>{s.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm" icon={Eye} onClick={() => navigate(`/shipments/${s._id}`)}>
                    Track
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card
          title="Tactical Requisitions"
          action={
            <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/procurement')}>
              View All
            </Button>
          }
          className="!p-0"
        >
          <Table headers={['Req ID', 'Requirement', 'Department', 'Status']}>
            {Array.isArray(procurements) && procurements.map((p) => (
              <tr key={p._id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{p.requirementId}</td>
                <td className="px-4 py-3 text-slate-200 font-medium truncate max-w-xs">{p.title}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{p.department || 'Operations'}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.status === 'APPROVED' ? 'success' : 'warning'}>{p.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
};
