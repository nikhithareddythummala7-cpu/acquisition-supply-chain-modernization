import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ArrowLeft, Sparkles, GitCompare, CheckCircle2, ShieldAlert } from 'lucide-react';

export const BidComparisonPage = () => {
  const { reqId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchComparison = async () => {
    try {
      const res = await api.get(`/bids/comparison/${reqId}`);
      setData(res.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [reqId]);

  const handleRunAIBidAnalysis = async () => {
    setAnalyzingAI(true);
    try {
      const res = await api.post('/bids/ai-analysis', { procurementRequestId: reqId });
      addToast('AI Bid Comparative Analysis generated', 'success');
      setAiAnalysis(res.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setAnalyzingAI(false);
    }
  };

  if (loading) return <Skeleton className="h-96" />;
  if (!data) return <div className="p-8 text-center text-slate-400">Comparison matrix unavailable</div>;

  const { requirement, bids = [] } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bid Comparison Matrix: ${requirement?.requestId || 'PR-2026-001'}`}
        subtitle={`${requirement?.title || 'Requisition'} | Estimated Budget: $${requirement?.estimatedBudget?.toLocaleString() || '0'}`}
        action={
          <div className="flex items-center space-x-3">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/bids')}>
              Back to Bids
            </Button>
            <Button variant="primary" icon={Sparkles} loading={analyzingAI} onClick={handleRunAIBidAnalysis}>
              Analyze Bids with AI
            </Button>
          </div>
        }
      />

      {/* Side-by-Side Comparison Table */}
      <Card title="Side-by-Side Vendor Proposal Comparison Matrix" headerIcon={GitCompare} className="!p-0">
        {bids.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No bids submitted yet for this requirement.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4 bg-slate-900 border-r border-slate-800">Criteria / Vendor</th>
                  {bids.map((b) => (
                    <th key={b._id} className="p-4 border-r border-slate-800 min-w-[200px]">
                      <div className="font-bold text-slate-100 text-sm">{b.supplierId?.companyName || 'Vendor Bidder'}</div>
                      <div className="text-[10px] text-cyan-400 font-mono">Bid ID: {b.bidId}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="p-4 font-bold bg-slate-900/50 border-r border-slate-800 text-slate-400">Quoted Price</td>
                  {bids.map((b) => (
                    <td key={b._id} className="p-4 border-r border-slate-800 font-mono font-bold text-emerald-400 text-sm">
                      ${b.quotedPrice?.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold bg-slate-900/50 border-r border-slate-800 text-slate-400">Delivery Timeline</td>
                  {bids.map((b) => (
                    <td key={b._id} className="p-4 border-r border-slate-800 font-mono text-slate-200">
                      {b.deliveryTimeDays} Days
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold bg-slate-900/50 border-r border-slate-800 text-slate-400">Quality Score</td>
                  {bids.map((b) => (
                    <td key={b._id} className="p-4 border-r border-slate-800 font-mono text-cyan-400">
                      {b.supplierId?.qualityScore || 85}/100
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold bg-slate-900/50 border-r border-slate-800 text-slate-400">Supplier Risk Score</td>
                  {bids.map((b) => (
                    <td key={b._id} className="p-4 border-r border-slate-800 font-mono text-rose-400">
                      {b.supplierId?.riskScore || 15}/100
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold bg-slate-900/50 border-r border-slate-800 text-slate-400">Payment Terms</td>
                  {bids.map((b) => (
                    <td key={b._id} className="p-4 border-r border-slate-800 text-slate-400">
                      {b.paymentTerms}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold bg-slate-900/50 border-r border-slate-800 text-slate-400">Proposal Status</td>
                  {bids.map((b) => (
                    <td key={b._id} className="p-4 border-r border-slate-800">
                      <Badge variant={b.status === 'ACCEPTED' ? 'success' : 'info'}>{b.status}</Badge>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* AI Bid Comparative Analysis Results */}
      {aiAnalysis && (
        <Card title="AI Bid Comparative Analysis & Trade-Offs" headerIcon={Sparkles} className="border-cyan-800/40">
          <div className="space-y-4 text-xs">
            <div className="p-2.5 bg-cyan-950/40 border border-cyan-800/50 rounded-xl text-cyan-300 text-[10px] font-mono">
              ✦ AI Comparative Analysis (Advisory summary only. Award decision remains with Procurement Officer.)
            </div>

            <div>
              <span className="font-bold text-slate-200 block mb-1">Executive Summary:</span>
              <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                {aiAnalysis.summary}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-200 block mb-1">Trade-Off Analysis:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {(aiAnalysis.tradeOffAnalysis || []).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-bold text-rose-400 block mb-1">Risk Factors & Audit Notes:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {(aiAnalysis.riskFactors || []).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
