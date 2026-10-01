import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Settings, ShieldCheck, Sparkles } from 'lucide-react';

export const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System Parameters & Configuration"
        subtitle="Manage global acquisition settings, AI provider parameters, and security policies."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="AI Provider Configuration" headerIcon={Sparkles}>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Primary AI Engine Provider</label>
              <input
                type="text"
                disabled
                value="Google Gemini API / Modular Abstraction Engine"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">AI Execution Scope & Guardrails</label>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 space-y-1 text-[11px]">
                <div>✔ AI operates as advisory assistant only (No silent decision making)</div>
                <div>✔ Strict RBAC context filtering enforced on RAG retrieval</div>
                <div>✔ Zero hardcoded fake responses</div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Security & Authentication Parameters" headerIcon={ShieldCheck}>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">JWT Expiry Duration</label>
              <input
                type="text"
                disabled
                value="7 Days (Configured via SERVER_ENV)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Password Encryption Standard</label>
              <input
                type="text"
                disabled
                value="Bcryptjs with 10 Salt Rounds"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
