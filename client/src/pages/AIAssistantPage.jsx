import React, { useState, useRef, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Bot, User, Send, Sparkles, ShieldCheck, FileText, ChevronRight, Loader2 } from 'lucide-react';

export const AIAssistantPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${user?.fullName || ''}! I am your RAG-powered Acquisition & Supply Chain AI Assistant. Ask me anything about procurement requisitions, supplier scores, active contracts, delivery delays, or risk records authorized for your role (${user?.role || 'GUEST'}).`,
      sources: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const suggestionPrompts = [
    'Which suppliers have high quality scores above 85?',
    'Show procurement requests related to defense equipment.',
    'Which contracts are expiring soon within 30 days?',
    'What are the major risks logged for supplier ABC?',
    'Summarize delivery delay bottlenecks across active shipments.',
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { question: textToSend });
      const aiAnswer = res.data?.answer || 'No response generated.';
      const evidence = res.data?.evidenceSources || [];

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiAnswer,
          sources: evidence,
        },
      ]);
    } catch (err) {
      addToast(err.message, 'error');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `An error occurred while processing your request: ${err.message}`,
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="RAG-Based AI Acquisition Assistant"
        subtitle="Conversational Intelligence engine with permission-aware retrieval and verified evidence sources."
        action={
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-800/50">
            <ShieldCheck className="w-4 h-4" />
            <span>RBAC Permission Retrieval Active</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Window */}
        <Card className="lg:col-span-3 flex flex-col h-[650px] !p-0">
          {/* Chat Messages Log */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${
                  msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 shadow-lg shadow-cyan-600/20'
                      : 'bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-lg shadow-cyan-600/30'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white font-medium rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-3'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Evidence / Sources References */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-cyan-400 flex items-center">
                        <FileText className="w-3 h-3 mr-1" /> Verified Source References ({msg.sources.length}):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-700/60 text-slate-300"
                          >
                            <ChevronRight className="w-2.5 h-2.5 mr-0.5 text-cyan-400" />
                            {src.reference}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-3 text-xs text-slate-400 italic">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Searching authorized database context and synthesizing response...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about requisitions, suppliers, contracts, shipments, or risks..."
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <Button type="submit" icon={Send} loading={loading}>
                Send
              </Button>
            </form>
          </div>
        </Card>

        {/* Suggested Prompts Side Card */}
        <Card title="Suggested RAG Prompts" headerIcon={Sparkles}>
          <div className="space-y-2">
            {suggestionPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-300 hover:text-cyan-300 transition-colors flex items-center justify-between group"
              >
                <span>{prompt}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
