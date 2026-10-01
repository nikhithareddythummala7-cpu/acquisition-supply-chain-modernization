import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import api from '../services/api';
import { Sparkles, ShoppingCart, Users, FileText, ShieldAlert } from 'lucide-react';

export const AIInsightsPage = () => {
  const [data, setData] = useState({ reqs: [], sups: [], ctrs: [], risks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsightsData = async () => {
      try {
        const [reqRes, supRes, ctrRes, rskRes] = await Promise.all([
          api.get('/procurement?limit=10'),
          api.get('/suppliers?limit=10'),
          api.get('/contracts?limit=10'),
          api.get('/risks?limit=10'),
        ]);
        setData({
          reqs: reqRes.data.requirements || [],
          sups: supRes.data.suppliers || [],
          ctrs: ctrRes.data.contracts || [],
          risks: rskRes.data.risks || [],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsightsData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Operational System Insights"
        subtitle="Aggregated AI recommendations and risk warnings across acquisition modules."
      />

      {loading ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Procurement Requirement Insights" headerIcon={ShoppingCart}>
            <div className="space-y-3 text-xs">
              {data.reqs.slice(0, 4).map((r) => (
                <div key={r._id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <div className="font-bold text-slate-200">{r.requestId}: {r.title}</div>
                  <div className="text-slate-400">Category: {r.category} | Budget: ${r.estimatedBudget?.toLocaleString()}</div>
                  {r.aiAnalysis?.priorityInterpretation && (
                    <div className="text-cyan-400 font-mono text-[10px] pt-1">
                      ✦ {r.aiAnalysis.priorityInterpretation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card title="Supplier Performance Scorecard Highlights" headerIcon={Users}>
            <div className="space-y-3 text-xs">
              {data.sups.slice(0, 4).map((s) => (
                <div key={s._id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <div className="font-bold text-slate-200">{s.companyName} ({s.supplierId})</div>
                  <div className="text-slate-400">Quality: {s.qualityScore}/100 | Delivery: {s.deliveryScore}/100 | Risk: {s.riskScore}/100</div>
                  {s.aiEvaluation?.performanceSummary && (
                    <div className="text-emerald-400 font-mono text-[10px] pt-1">
                      ✦ {s.aiEvaluation.performanceSummary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
