import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ArrowLeft, Sparkles, CheckCircle2, XCircle, GitCompare, FileText, AlertTriangle } from 'lucide-react';

export const ProcurementDetailPage = () => {
  const { id } = useParams();
  const [requirement, setRequirement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchRequirement = async () => {
    try {
      const res = await api.get(`/procurement/${id}`);
      setRequirement(res.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirement();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.patch(`/procurement/${id}/status`, { status: newStatus });
      addToast(`Status updated to ${newStatus}`, 'success');
      fetchRequirement();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRunAI = async () => {
    setAnalyzingAI(true);
    try {
      const res = await api.post(`/procurement/${id}/ai-analysis`);
      addToast('AI Requirement Analysis completed', 'success');
      setRequirement((prev) => ({ ...prev, aiAnalysis: res.data }));
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setAnalyzingAI(false);
    }
  };

  if (loading) return <Skeleton className="h-96" />;
  if (!requirement) return <div className="p-8 text-center text-slate-400">Requisition not found</div>;

  const ai = requirement.aiAnalysis;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${requirement.requestId}: ${requirement.title}`}
        subtitle={`Category: ${requirement.category} | Created by ${requirement.createdBy?.fullName || 'User'}`}
        action={
          <div className="flex items-center space-x-3">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/procurement')}>
              Back
            </Button>
            <Button variant="secondary" icon={GitCompare} onClick={() => navigate(`/bids/comparison/${requirement._id}`)}>
              Compare Bids
            </Button>
            <Button variant="primary" icon={Sparkles} loading={analyzingAI} onClick={handleRunAI}>
              Analyze with AI
            </Button>
          </div>
        }
      />

      {/* Main Details & Workflow Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Status Workflow</span>
              <Badge variant={requirement.status === 'APPROVED' ? 'success' : 'info'}>{requirement.status}</Badge>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Budget</span>
              <span className="text-lg font-bold font-mono text-cyan-400">${requirement.estimatedBudget?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Priority</span>
              <Badge variant={requirement.priority === 'CRITICAL' ? 'danger' : 'warning'}>{requirement.priority}</Badge>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Description & Technical Specifications</h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {requirement.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Compliance Requirements</h4>
            <div className="flex flex-wrap gap-2">
              {(requirement.complianceRequirements || []).map((c, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700">
                  ✓ {c}
                </span>
              ))}
            </div>
          </div>

          {/* Workflow Transitions */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-2">
            {requirement.status === 'DRAFT' && (
              <Button size="sm" onClick={() => handleStatusUpdate('SUBMITTED')}>Submit for Review</Button>
            )}
            {requirement.status === 'SUBMITTED' && (
              <>
                <Button size="sm" variant="success" icon={CheckCircle2} onClick={() => handleStatusUpdate('APPROVED')}>Approve</Button>
                <Button size="sm" variant="danger" icon={XCircle} onClick={() => handleStatusUpdate('REJECTED')}>Reject</Button>
              </>
            )}
            {requirement.status === 'APPROVED' && (
              <Button size="sm" variant="primary" onClick={() => handleStatusUpdate('BIDDING')}>Open for Bidding</Button>
            )}
          </div>
        </Card>

        {/* AI Requirement Analysis Results Card */}
        <Card title="AI Requirement Insights" headerIcon={Sparkles} className="border-cyan-800/40">
          {!ai ? (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-cyan-500/40 mx-auto mb-3" />
              <p className="text-xs text-slate-400 mb-4">No AI analysis generated yet for this requisition.</p>
              <Button size="sm" icon={Sparkles} loading={analyzingAI} onClick={handleRunAI}>
                Analyze with AI
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-2.5 bg-cyan-950/40 border border-cyan-800/50 rounded-xl text-cyan-300 flex items-center text-[10px] font-mono">
                <Sparkles className="w-3.5 h-3.5 mr-2 text-cyan-400" />
                <span>AI-Generated Analysis. Verified against system dataset.</span>
              </div>

              <div>
                <span className="font-bold text-slate-200 block mb-1">Key Requirements Extracted:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {(ai.keyRequirements || []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-amber-400 block mb-1">Missing / Unclear Information:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {(ai.missingInformation || []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-slate-200 block mb-1">Suggested Evaluation Criteria:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {(ai.evaluationCriteria || []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-rose-400 block mb-1">Potential Acquisition Risks:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {(ai.potentialRisks || []).map((item, i) => (
                    <li key={i}>{item}</li>
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
