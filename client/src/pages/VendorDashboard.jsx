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
  Gavel, FileText, Truck, Award, Plus, ArrowRight, Eye, Send
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export const VendorDashboard = () => {
  const [bids, setBids] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const [bidsRes, contractsRes, shipmentsRes] = await Promise.allSettled([
          api.get('/bids?limit=5'),
          api.get('/contracts?limit=5'),
          api.get('/shipments?limit=5'),
        ]);

        if (bidsRes.status === 'fulfilled') {
          const bidsData = bidsRes.value?.data?.bids || bidsRes.value?.bids || bidsRes.value?.data || bidsRes.value;
          setBids(Array.isArray(bidsData) ? bidsData : []);
        }
        if (contractsRes.status === 'fulfilled') {
          const contractsData = contractsRes.value?.data?.contracts || contractsRes.value?.contracts || contractsRes.value?.data || contractsRes.value;
          setContracts(Array.isArray(contractsData) ? contractsData : []);
        }
        if (shipmentsRes.status === 'fulfilled') {
          const shipmentsData = shipmentsRes.value?.data?.shipments || shipmentsRes.value?.shipments || shipmentsRes.value?.data || shipmentsRes.value;
          setShipments(Array.isArray(shipmentsData) ? shipmentsData : []);
        }
      } catch (err) {
        console.error('Error fetching vendor data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Vendor Portal Dashboard" subtitle="Loading vendor workspace..." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  const metricCards = [
    { label: 'Active Proposals', value: bids.length, icon: Gavel, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/40' },
    { label: 'Awarded Contracts', value: contracts.length, icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800/40' },
    { label: 'Active Shipments', value: shipments.length, icon: Truck, color: 'text-indigo-400', bg: 'bg-indigo-950/40 border-indigo-800/40' },
    { label: 'Supplier Rating', value: '94%', icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Portal Dashboard"
        subtitle="Overview of your submitted bids, awarded contracts, shipment obligations, and compliance standings."
        action={
          <div className="flex items-center space-x-2">
            <Button variant="primary" size="sm" icon={Send} onClick={() => navigate('/bids')}>
              Browse Requisitions
            </Button>
            <Button variant="outline" size="sm" icon={Truck} onClick={() => navigate('/shipments')}>
              Update Shipment
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
          title="My Active Supply Contracts"
          action={
            <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/contracts')}>
              View All
            </Button>
          }
          className="!p-0"
        >
          <Table headers={['Contract #', 'Title', 'Value', 'Status']}>
            {Array.isArray(contracts) && contracts.map((c) => (
              <tr key={c._id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{c.contractNumber}</td>
                <td className="px-4 py-3 text-slate-200 truncate max-w-xs">{c.title}</td>
                <td className="px-4 py-3 font-mono text-emerald-400">${(c.contractValue || 0).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Badge variant={c.status === 'ACTIVE' ? 'success' : 'neutral'}>{c.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card
          title="Recent Consignments & Tracking"
          action={
            <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/shipments')}>
              View All
            </Button>
          }
          className="!p-0"
        >
          <Table headers={['Shipment ID', 'Item', 'Carrier', 'Status', 'Action']}>
            {Array.isArray(shipments) && shipments.map((s) => (
              <tr key={s._id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{s.shipmentId}</td>
                <td className="px-4 py-3 text-slate-200">{s.item}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{s.carrierName}</td>
                <td className="px-4 py-3">
                  <Badge variant={s.status === 'DELIVERED' ? 'success' : 'info'}>{s.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm" icon={Eye} onClick={() => navigate(`/shipments/${s._id}`)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
};
