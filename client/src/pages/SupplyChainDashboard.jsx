import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Table } from '../components/common/Table';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import api from '../services/api';
import {
  Package, Truck, CheckCircle2, AlertTriangle, ClipboardCheck,
  ShieldAlert, Eye, TrendingUp, Sparkles, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend, LineChart, Line
} from 'recharts';

export const SupplyChainDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/supply-chain-stats');
      setData(res?.data || res);
    } catch (err) {
      console.error('Failed to load supply chain stats:', err);
      setError(err.response?.data?.message || 'Failed to load supply chain telemetry data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Supply Chain Operations Dashboard"
          subtitle="Real-time monitoring of shipments, deliveries, inspections, suppliers, and supply-chain risks."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const { metrics = {}, charts = {}, tables = {} } = data || {};

  const metricCards = [
    {
      label: 'Total Shipments',
      value: metrics.totalShipments ?? 0,
      icon: Package,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/40 border-cyan-800/40',
      sub: 'All registered consignments',
    },
    {
      label: 'Shipments In Transit',
      value: metrics.inTransitShipments ?? 0,
      icon: Truck,
      color: 'text-indigo-400',
      bg: 'bg-indigo-950/40 border-indigo-800/40',
      sub: 'Active en-route routes',
    },
    {
      label: 'Delivered Shipments',
      value: metrics.deliveredShipments ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40 border-emerald-800/40',
      sub: 'Fulfilled orders',
    },
    {
      label: 'Delayed Shipments',
      value: metrics.delayedShipments ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-400',
      bg: 'bg-rose-950/40 border-rose-800/40',
      sub: 'Schedule deviations',
    },
    {
      label: 'Pending Inspections',
      value: metrics.pendingInspections ?? 0,
      icon: ClipboardCheck,
      color: 'text-amber-400',
      bg: 'bg-amber-950/40 border-amber-800/40',
      sub: 'Awaiting quality check',
    },
    {
      label: 'High-Risk Shipments',
      value: metrics.highRiskShipments ?? 0,
      icon: ShieldAlert,
      color: 'text-red-400',
      bg: 'bg-red-950/40 border-red-800/40',
      sub: 'Severity high or critical',
    },
  ];

  const RISK_COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supply Chain Operations Dashboard"
        subtitle="Real-time monitoring of shipments, deliveries, inspections, suppliers, and supply-chain risks."
        action={
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchStats}
              className="text-xs"
            >
              Refresh Telemetry
            </Button>
            <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-cyan-400 bg-cyan-950/80 px-3 py-1.5 rounded-xl border border-cyan-800/50">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Sensor Sync</span>
            </div>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchStats}>Retry</Button>
        </div>
      )}

      {/* 6 Mongo-Backed Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border ${card.bg} backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight">
                  {card.label}
                </span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">
                  {card.value}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 truncate">{card.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4 Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Shipment Status Breakdown */}
        <Card title="Shipment Status Breakdown" subtitle="Consignments grouped by current execution state">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.shipmentStatusBreakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="status" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Supplier Delivery Performance */}
        <Card title="Supplier Delivery Performance" subtitle="On-time delivery and quality indices across suppliers">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.supplierDeliveryPerformance || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="deliveryScore" fill="#10b981" radius={[4, 4, 0, 0]} name="Delivery Score" />
                <Bar dataKey="qualityScore" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Quality Score" />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Shipment Risk Distribution */}
        <Card title="Shipment Risk Distribution" subtitle="Risk levels detected across shipments and routes">
          <div className="h-64 flex items-center justify-center">
            {charts.shipmentRiskDistribution && charts.shipmentRiskDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.shipmentRiskDistribution}
                    dataKey="count"
                    nameKey="riskLevel"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={4}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {charts.shipmentRiskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No Risk Anomalies" description="All shipments currently within baseline safety tolerance." />
            )}
          </div>
        </Card>

        {/* Chart 4: Monthly Delivery Trend */}
        <Card title="Monthly Delivery Trend" subtitle="On-time vs delayed delivery volume over time">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyDeliveryTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="onTime" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="On-Time" />
                <Area type="monotone" dataKey="delayed" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Delayed" />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 3 Real MongoDB Data Tables */}
      <div className="space-y-6">
        {/* Table 1: Upcoming Deliveries */}
        <Card
          title="Upcoming Deliveries"
          subtitle="Consignments scheduled for near-term depot reception"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/shipments')}>
              View All Shipments
            </Button>
          }
          className="!p-0"
        >
          {tables.upcomingDeliveries && tables.upcomingDeliveries.length > 0 ? (
            <Table headers={['Shipment ID', 'Item Description', 'Supplier', 'Carrier & Tracking', 'Expected Date', 'Status', 'Action']}>
              {tables.upcomingDeliveries.map((shp) => (
                <tr key={shp._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{shp.shipmentId}</td>
                  <td className="px-4 py-3 text-slate-200 font-medium">{shp.item} ({shp.shippedQuantity || shp.quantity} units)</td>
                  <td className="px-4 py-3 text-slate-400">{shp.supplierId?.companyName || 'Primary Logistics Partner'}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                    {shp.carrierName} <span className="text-slate-500">({shp.trackingNumber})</span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                    {shp.expectedDeliveryDate ? new Date(shp.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={shp.status === 'IN_TRANSIT' ? 'info' : 'neutral'}>{shp.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm" icon={Eye} onClick={() => navigate(`/shipments/${shp._id}`)}>
                      Track
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <div className="p-6">
              <EmptyState title="No In-Transit Deliveries" description="There are currently no active shipments en route." />
            </div>
          )}
        </Card>

        {/* Table 2: Delayed Shipments */}
        <Card
          title="Delayed Shipments"
          subtitle="Shipments requiring active expedited resolution and rerouting"
          className="!p-0 border-rose-900/30"
        >
          {tables.delayedShipments && tables.delayedShipments.length > 0 ? (
            <Table headers={['Shipment ID', 'Cargo Item', 'Supplier', 'Current Location', 'Tracking', 'Status', 'Action']}>
              {tables.delayedShipments.map((shp) => (
                <tr key={shp._id} className="hover:bg-rose-950/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-rose-400 font-semibold">{shp.shipmentId}</td>
                  <td className="px-4 py-3 text-slate-200 font-medium">{shp.item}</td>
                  <td className="px-4 py-3 text-slate-400">{shp.supplierId?.companyName || 'Unknown Supplier'}</td>
                  <td className="px-4 py-3 text-amber-400 font-medium">{shp.currentLocation || 'Transit Chokepoint'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-400">{shp.trackingNumber}</td>
                  <td className="px-4 py-3">
                    <Badge variant="danger">{shp.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm" icon={Eye} onClick={() => navigate(`/shipments/${shp._id}`)}>
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <div className="p-6">
              <EmptyState title="Zero Delayed Consignments" description="Outstanding logistics performance: no current transit delays reported." />
            </div>
          )}
        </Card>

        {/* Table 3: Recent Inspections */}
        <Card
          title="Recent Inspections"
          subtitle="Latest quality audits and physical verification logs"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/inspections')}>
              View All Inspections
            </Button>
          }
          className="!p-0"
        >
          {tables.recentInspections && tables.recentInspections.length > 0 ? (
            <Table headers={['Report ID', 'Inspected Entity / Item', 'Supplier', 'Defect Rate', 'Quality Verdict', 'Inspector', 'Action']}>
              {tables.recentInspections.map((insp) => (
                <tr key={insp._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{insp.inspectionId || insp.reportId}</td>
                  <td className="px-4 py-3 text-slate-200 font-medium">{insp.shipmentId?.item || insp.itemInspected || 'Material Consignment'}</td>
                  <td className="px-4 py-3 text-slate-400">{insp.shipmentId?.supplierId?.companyName || insp.supplierId?.companyName || 'Primary Supplier'}</td>
                  <td className="px-4 py-3 font-mono text-amber-400 font-semibold">{insp.rejectedQuantity ? `${insp.rejectedQuantity} items` : `${insp.defectRate || 0}%`}</td>
                  <td className="px-4 py-3">
                    <Badge variant={insp.qualityStatus === 'PASSED' ? 'success' : insp.qualityStatus === 'FAILED' ? 'danger' : 'warning'}>
                      {insp.qualityStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{insp.inspector?.fullName || insp.inspector?.name || insp.inspectorId?.fullName || 'Quality Officer'}</td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm" icon={Eye} onClick={() => navigate('/inspections')}>
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <div className="p-6">
              <EmptyState title="No Recent Inspections" description="No quality reports logged in this evaluation cycle." />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
