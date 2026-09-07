import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Send,
  ShieldCheck,
  Bot,
  User,
  RefreshCw,
} from 'lucide-react';
import { OverloadAdvisorCard } from '../features/copilot/OverloadAdvisorCard';
import {
  fetchCopilotRecommendations,
  sendCopilotChat,
  FALLBACK_RECOMMENDATIONS,
} from '../features/copilot/copilotApi';
import {
  CopilotRecommendationsResponse,
  ChatMessage,
} from '../features/copilot/copilotTypes';

export const InsightsPage: React.FC = () => {
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState<CopilotRecommendationsResponse>(
    FALLBACK_RECOMMENDATIONS
  );
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [query, setQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [budgetRemaining, setBudgetRemaining] = useState<number>(15);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: "Welcome to your AI Coaching Insights! I've analyzed your recent workout logs and nutritional averages. You are in a positive progressive overload trajectory with low fatigue accumulation.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const loadRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const data = await fetchCopilotRecommendations();
      setRecommendations(data);
      setBudgetRemaining(data.dailyBudgetRemaining);
    } catch {
      // Fallback handles gracefully
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleSendChat = async (presetText?: string) => {
    const text = (presetText || query).trim();
    if (!text || chatLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setQuery('');
    setChatLoading(true);

    try {
      const res = await sendCopilotChat(text);
      const botMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        budgetRemaining: res.budgetRemaining,
      };
      setChatHistory((prev) => [...prev, botMessage]);
      setBudgetRemaining(res.budgetRemaining);
    } catch {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Unable to connect to AI Copilot service. Please verify your connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, errMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAskAdvisor = (advisorQuery: string) => {
    setQuery(advisorQuery);
    handleSendChat(advisorQuery);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>{t('insights.title', 'AI Insights & Copilot')}</span>
            <span className="px-2 py-0.5 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PHASE 8
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {t(
              'insights.subtitle',
              'Deterministic progressive overload calculations combined with grounded fitness AI coaching.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadRecommendations}
            disabled={loadingRecs}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Recommendations"
          >
            <RefreshCw className={`w-4 h-4 ${loadingRecs ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span>Daily Budget:</span>
            <strong className="text-emerald-400 font-mono">
              {budgetRemaining} / 15 queries left
            </strong>
          </div>
        </div>
      </div>

      {/* Layer 1: Deterministic Progressive Overload & Deload Engine */}
      <OverloadAdvisorCard
        tips={recommendations.overloadTips}
        deload={recommendations.deload}
        recoveryScore={recommendations.recoveryScore}
        onAskCopilot={handleAskAdvisor}
      />

      {/* Layer 2: Grounded AI Copilot Interactive Chat */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Interactive Fitness Copilot</h3>
              <p className="text-xs text-slate-400">
                Contextual queries answered strictly using your verified workout, nutrition & 1RM
                records
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Anti-Hallucination Grounding</span>
          </span>
        </div>

        {/* Suggested Queries Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            'How is my progressive overload on Bench Press?',
            'What is my estimated 1RM progression this month?',
            'Check my protein adherence against daily goals',
            'Is it time for a recovery deload week?',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendChat(prompt)}
              disabled={chatLoading}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-all text-left"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Chat History Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 max-h-96 overflow-y-auto space-y-3">
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-500 text-black font-semibold shadow-md shadow-emerald-500/10'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <div
                  className={`text-[9px] mt-1.5 flex items-center justify-end ${
                    msg.sender === 'user' ? 'text-black/60' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-slate-300">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {chatLoading && (
            <div className="flex gap-3 items-center text-xs text-slate-400">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                ></span>
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                ></span>
                <span className="text-slate-400">Consulting training database & formulas...</span>
              </div>
            </div>
          )}
        </div>

        {/* Prompt Input Box */}
        <div className="relative pt-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendChat();
              }
            }}
            placeholder={
              budgetRemaining > 0
                ? 'Ask your coach anything about your training, recovery, or diet...'
                : 'Daily query budget reached (resets at 00:00)'
            }
            disabled={budgetRemaining <= 0 || chatLoading}
            className="w-full pl-4 pr-12 py-3.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all disabled:opacity-50"
          />
          <button
            onClick={() => handleSendChat()}
            disabled={!query.trim() || chatLoading || budgetRemaining <= 0}
            className="absolute right-2 top-3.5 p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-black transition-all"
          >
            <Send className="w-4 h-4 font-bold" />
          </button>
        </div>
      </div>
    </div>
  );
};
