import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ArrowLeft, Sparkles, UserPlus, Phone, Mail, Award, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const SupplierDetailPage = () => {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluatingAI, setEvaluatingAI] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', designation: 'Account Manager', email: '', phone: '' });
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchSupplier = async () => {
    try {
      const res = await api.get(`/suppliers/${id}`);
      setSupplier(res.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplier();
  }, [id]);

  const handleRunAIEvaluation = async () => {
    setEvaluatingAI(true);
    try {
      const res = await api.post(`/suppliers/${id}/ai-evaluation`);
      addToast('AI Supplier Evaluation complete', 'success');
      setSupplier((prev) => ({ ...prev, aiEvaluation: res.data }));
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setEvaluatingAI(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/suppliers/${id}/contacts`, contactForm);
      addToast('Contact person added', 'success');
      setShowContactModal(false);
      setContactForm({ name: '', designation: 'Account Manager', email: '', phone: '' });
      fetchSupplier();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <Skeleton className="h-96" />;
  if (!supplier) return <div className="p-8 text-center text-slate-400">Supplier profile not found</div>;

  const ai = supplier.aiEvaluation;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${supplier.supplierId}: ${supplier.companyName}`}
        subtitle={`Registered ${supplier.yearsInBusiness} years | Category: ${(supplier.category || []).join(', ')}`}
        action={
          <div className="flex items-center space-x-3">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/suppliers')}>
              Back
            </Button>
            <Button variant="secondary" icon={UserPlus} onClick={() => setShowContactModal(true)}>
              Add Contact
            </Button>
            <Button variant="primary" icon={Sparkles} loading={evaluatingAI} onClick={handleRunAIEvaluation}>
              Evaluate Supplier with AI
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-6">
          {/* Performance Gauges / Metric Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-800">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Quality Score</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{supplier.qualityScore}/100</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Delivery Score</span>
              <span className="text-xl font-bold font-mono text-blue-400">{supplier.deliveryScore}/100</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Compliance Score</span>
              <span className="text-xl font-bold font-mono text-cyan-400">{supplier.complianceScore}/100</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Risk Score</span>
              <span className="text-xl font-bold font-mono text-rose-400">{supplier.riskScore}/100</span>
            </div>
          </div>

          {/* Contact Persons Section */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Associated Contact Persons</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(supplier.contacts || []).length === 0 ? (
                <div className="text-xs text-slate-500 py-2 col-span-2">No contact persons recorded.</div>
              ) : (
                (supplier.contacts || []).map((c) => (
                  <div key={c._id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
                    <div className="font-semibold text-slate-200">{c.name}</div>
                    <div className="text-[10px] text-cyan-400 font-mono">{c.designation}</div>
                    <div className="text-slate-400 flex items-center pt-1">
                      <Mail className="w-3 h-3 mr-1" /> {c.email}
                    </div>
                    <div className="text-slate-400 flex items-center">
                      <Phone className="w-3 h-3 mr-1" /> {c.phone}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* AI Supplier Evaluation Scorecard */}
        <Card title="AI Supplier Evaluation" headerIcon={Sparkles} className="border-cyan-800/40">
          {!ai ? (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-cyan-500/40 mx-auto mb-3" />
              <p className="text-xs text-slate-400 mb-4">No AI evaluation scorecard generated yet.</p>
              <Button size="sm" icon={Sparkles} loading={evaluatingAI} onClick={handleRunAIEvaluation}>
                Evaluate Supplier with AI
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-2.5 bg-cyan-950/40 border border-cyan-800/50 rounded-xl text-cyan-300 text-[10px] font-mono">
                ✦ AI Evaluation Scorecard (Non-decision advisory output)
              </div>

              <div>
                <span className="font-bold text-emerald-400 block mb-1">Key Strengths:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {(ai.strengths || []).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-amber-400 block mb-1">Operational Concerns:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {(ai.concerns || []).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-slate-200 block mb-1">Performance Summary:</span>
                <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {ai.performanceSummary}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Add Contact Modal */}
      <Modal isOpen={showContactModal} onClose={() => setShowContactModal(false)} title="Add Supplier Contact Person">
        <form onSubmit={handleAddContact} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Name *</label>
            <input
              type="text"
              required
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Designation</label>
            <input
              type="text"
              value={contactForm.designation}
              onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
            <input
              type="email"
              required
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone *</label>
            <input
              type="text"
              required
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
            <Button variant="outline" onClick={() => setShowContactModal(false)}>Cancel</Button>
            <Button type="submit">Save Contact</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
