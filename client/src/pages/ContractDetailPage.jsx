import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ArrowLeft, Sparkles, FileText, Calendar, DollarSign, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ContractDetailPage = () => {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchContract = async () => {
    try {
      const res = await api.get(`/contracts/${id}`);
      setContract(res.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContract();
  }, [id]);

  const handleRunAIContract = async () => {
    setAnalyzingAI(true);
    try {
      const res = await api.post(`/contracts/${id}/ai-analysis`);
      addToast('AI Contract Intelligence extraction complete', 'success');
      setContract((prev) => ({ ...prev, aiExtraction: res.data }));
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setAnalyzingAI(false);
    }
  };

  if (loading) return <Skeleton className="h-96" />;
  if (!contract) return <div className="p-8 text-center text-slate-400">Contract not found</div>;

  const ai = contract.aiExtraction;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${contract.contractNumber}: ${contract.title}`}
        subtitle={`Supplier: ${contract.supplierId?.companyName || 'N/A'} | Status: ${contract.status}`}
        action={
          <div className="flex items-center space-x-3">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/contracts')}>
              Back
            </Button>
            <Button variant="primary" icon={Sparkles} loading={analyzingAI} onClick={handleRunAIContract}>
              AI Contract Insights
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Total Contract Value</span>
              <span className="text-xl font-bold font-mono text-emerald-400">${contract.contractValue?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Execution Dates</span>
              <span className="text-xs text-slate-300 font-mono">
                {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Contract Status</span>
              <Badge variant={contract.status === 'ACTIVE' ? 'success' : 'danger'}>{contract.status}</Badge>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Payment & Delivery Terms</h4>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
              <div><span className="font-semibold text-slate-400">Payment:</span> {contract.paymentTerms}</div>
              <div><span className="font-semibold text-slate-400">Delivery:</span> {contract.deliveryTerms}</div>
              <div><span className="font-semibold text-slate-400">Liquidated Damages:</span> {contract.penaltyTerms}</div>
            </div>
          </div>
        </Card>

        {/* AI Contract Insights Card */}
        <Card title="AI Contract Intelligence" headerIcon={Sparkles} className="border-cyan-800/40">
          {!ai ? (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-cyan-500/40 mx-auto mb-3" />
              <p className="text-xs text-slate-400 mb-4">No AI contract clause extraction generated yet.</p>
              <Button size="sm" icon={Sparkles} loading={analyzingAI} onClick={handleRunAIContract}>
                AI Contract Insights
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-2.5 bg-amber-950/50 border border-amber-800/60 rounded-xl text-amber-300 text-[10px] font-mono leading-tight">
                ⚠️ AI-generated analysis. Verify against original executed legal document. Not legally authoritative.
              </div>

              <div>
                <span className="font-bold text-slate-200 block mb-1">Penalty Clauses Summary:</span>
                <p className="text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {ai.penaltyClauseSummary}
                </p>
              </div>

              <div>
                <span className="font-bold text-rose-400 block mb-1">Extracted Legal Risk Flags:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {(ai.riskFlags || []).map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-emerald-400 block mb-1">Obligations & Deliverables Checklist:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {(ai.obligationChecklist || []).map((ob, i) => (
                    <li key={i}>{ob}</li>
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
