import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ArrowLeft, Sparkles, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const RiskDetailPage = () => {
  const { id } = useParams();
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchRisk = async () => {
    try {
      const res = await api.get('/risks?limit=100');
      const match = (res.data.risks || []).find((r) => r._id === id);
      setRisk(match || null);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisk();
  }, [id]);

  const handleRunAIRisk = async () => {
    setAnalyzingAI(true);
    try {
      const res = await api.post(`/risks/${id}/ai-analysis`);
      addToast('AI Risk Analysis completed', 'success');
      setRisk((prev) => ({ ...prev, aiRiskAnalysis: res.data }));
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setAnalyzingAI(false);
    }
  };

  if (loading) return <Skeleton className="h-96" />;
  if (!risk) return <div className="p-8 text-center text-slate-400">Risk record not found</div>;

  const ai = risk.aiRiskAnalysis;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Risk Record ${risk.riskId}`}
        subtitle={`Target Entity: ${risk.relatedEntityType} | Overall Severity: ${risk.overallRisk}`}
        action={
          <div className="flex items-center space-x-3">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/risk')}>
              Back
            </Button>
            <Button variant="primary" icon={Sparkles} loading={analyzingAI} onClick={handleRunAIRisk}>
              Analyze Risk with AI
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Supplier Vulnerability</span>
              <span className="text-xl font-bold font-mono text-rose-400">{risk.supplierRisk}/100</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Delivery Slippage Risk</span>
              <span className="text-xl font-bold font-mono text-amber-400">{risk.deliveryRisk}/100</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Overall Risk Level</span>
              <Badge variant={risk.overallRisk === 'CRITICAL' ? 'danger' : 'warning'}>{risk.overallRisk}</Badge>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Identified Risk Factors</h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800">
              {(risk.riskFactors || []).map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </Card>

        {/* AI Risk Analysis Card */}
        <Card title="AI Risk Factor & Impact Prediction" headerIcon={Sparkles} className="border-cyan-800/40">
          {!ai ? (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-cyan-500/40 mx-auto mb-3" />
              <p className="text-xs text-slate-400 mb-4">No AI risk prediction generated yet.</p>
              <Button size="sm" icon={Sparkles} loading={analyzingAI} onClick={handleRunAIRisk}>
                Analyze Risk with AI
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-2.5 bg-cyan-950/40 border border-cyan-800/50 rounded-xl text-cyan-300 text-[10px] font-mono">
                ✦ AI Risk Prediction (Probabilistic assessment notice)
              </div>

              <div>
                <span className="font-bold text-rose-400 block mb-1">Potential Operational Impact:</span>
                <p className="text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {ai.impact}
                </p>
              </div>

              <div>
                <span className="font-bold text-amber-400 block mb-1">Early Warning Indicators:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {(ai.warningSigns || []).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-emerald-400 block mb-1">Recommended Mitigation Actions:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {(ai.recommendedSteps || []).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
