import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import api from '../services/api';
import { TrendingUp, AlertTriangle, ShieldAlert } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const ForecastPage = () => {
  const [forecastData, setForecastData] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fcRes, anRes] = await Promise.all([
          api.get('/analytics/forecast'),
          api.get('/analytics/anomalies'),
        ]);
        setForecastData(fcRes.data || []);
        setAnomalies(anRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demand Forecasting & Anomaly Detection"
        subtitle="Historical demand trend models, future projections, and automated supply chain variance detection."
      />

      {/* Demand Forecast Chart Card */}
      <Card title="Tactical Equipment Demand Forecast" headerIcon={TrendingUp}>
        <div className="h-72">
          {loading ? (
            <Skeleton className="h-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="actual" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} name="Historical Demand" />
                <Area type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeDasharray="4 4" fill="#8b5cf6" fillOpacity={0.15} name="Projected Forecast" />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Anomaly Detection List */}
      <Card title="Detected Supply Chain Anomalies & Variances" headerIcon={ShieldAlert}>
        {loading ? (
          <Skeleton className="h-40" />
        ) : (
          <div className="space-y-3">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-100 text-xs">{anom.title}</span>
                    <Badge variant={anom.severity === 'CRITICAL' ? 'danger' : 'warning'}>{anom.severity}</Badge>
                  </div>
                  <p className="text-xs text-slate-400">{anom.description}</p>
                </div>

                <div className="flex items-center space-x-4 text-xs font-mono shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase">Baseline</div>
                    <div className="text-slate-300 font-semibold">{anom.historicalBaseline}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase">Observed</div>
                    <div className="text-rose-400 font-bold">{anom.currentValue}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
