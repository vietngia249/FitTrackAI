import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  X,
  Send,
  ShieldCheck,
  Bot,
  User,
  Plus,
  MessageSquare,
  Trash2,
  Copy,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { ChatMessage, ChatThread } from './copilotTypes';
import { sendCopilotChat } from './copilotApi';
import { useAuth } from '../auth/AuthContext';

interface AiCopilotDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialQuery?: string;
}

const STORAGE_PREFIX = 'fittrack_gemini_threads_';

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  initialQuery,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = () => {
    if (externalOnClose) externalOnClose();
    setInternalIsOpen(false);
  };

  const storageKey = useMemo(
    () => `${STORAGE_PREFIX}${user?.id || 'guest'}`,
    [user?.id]
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [budgetRemaining, setBudgetRemaining] = useState<number>(15);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const createInitialThread = (): ChatThread => {
    const defaultTitle = t('copilot.default_chat_title', 'Fitness Consultation');
    return {
      id: `thread-${Date.now()}`,
      title: defaultTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'welcome-1',
          sender: 'assistant',
          text: t(
            'copilot.welcome_message',
            "Hello! I'm your FitTrack Gemini AI Coach. I analyze your logged workouts, 1RM trajectory, nutrition snapshots, and recovery data to give you personalized coaching advice. What would you like to optimize today?"
          ),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
  };

  // Threads state
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return [createInitialThread()];
  });

  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    return threads[0]?.id || `thread-${Date.now()}`;
  });

  // Re-load threads when user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setThreads(parsed);
          setActiveThreadId(parsed[0].id);
          return;
        }
      }
    } catch {
      // Ignore error
    }
    const init = createInitialThread();
    setThreads([init]);
    setActiveThreadId(init.id);
  }, [storageKey]);

  // Persist threads to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(threads));
    } catch {
      // Ignore storage errors
    }
  }, [threads, storageKey]);

  const activeThread = useMemo(() => {
    return threads.find((t) => t.id === activeThreadId) || threads[0];
  }, [threads, activeThreadId]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialQuery) {
      setInternalIsOpen(true);
      setInput(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages, loading]);

  const quickPrompts = [
    t('copilot.prompt_chest', 'Am I hitting enough chest volume?'),
    t('copilot.prompt_overload', 'Why is progressive overload recommended today?'),
    t('copilot.prompt_nutrition', 'Review my protein and calorie goals'),
    t('copilot.prompt_deload', 'Should I schedule a deload week?'),
  ];

  const handleCreateNewThread = () => {
    const newThread: ChatThread = {
      id: `thread-${Date.now()}`,
      title: t('copilot.new_chat', 'New Chat'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `welcome-${Date.now()}`,
          sender: 'assistant',
          text: t(
            'copilot.welcome_message',
            "Hello! I'm your FitTrack Gemini AI Coach. I analyze your logged workouts, 1RM trajectory, nutrition snapshots, and recovery data to give you personalized coaching advice. What would you like to optimize today?"
          ),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
    setIsSidebarOpen(false);
  };

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads((prev) => {
      const remaining = prev.filter((t) => t.id !== threadId);
      if (remaining.length === 0) {
        const fresh = createInitialThread();
        setActiveThreadId(fresh.id);
        return [fresh];
      }
      if (activeThreadId === threadId) {
        setActiveThreadId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading || !activeThread) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Auto-generate title from first user query if still default title
    const currentMessages = activeThread.messages || [];
    const isFirstUserMsg = currentMessages.filter((m) => m.sender === 'user').length === 0;
    const newTitle =
      isFirstUserMsg
        ? textToSend.length > 28
          ? `${textToSend.substring(0, 28)}...`
          : textToSend
        : activeThread.title;

    // Gather up to last 6 messages as conversation context
    const historyPayload = currentMessages
      .filter((m) => !m.id.startsWith('welcome'))
      .slice(-6)
      .map((m) => ({
        role: m.sender,
        text: m.text,
      }));

    // Optimistically update UI
    setThreads((prev) =>
      prev.map((th) =>
        th.id === activeThread.id
          ? {
              ...th,
              title: newTitle,
              updatedAt: new Date().toISOString(),
              messages: [...th.messages, userMsg],
            }
          : th
      )
    );

    setInput('');
    setLoading(true);

    try {
      const response = await sendCopilotChat(textToSend, historyPayload);
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        budgetRemaining: response.budgetRemaining,
      };

      setThreads((prev) =>
        prev.map((th) =>
          th.id === activeThread.id
            ? {
                ...th,
                updatedAt: new Date().toISOString(),
                messages: [...th.messages, assistantMsg],
              }
            : th
        )
      );

      setBudgetRemaining(response.budgetRemaining);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered a temporary connection issue. Please check your network and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setThreads((prev) =>
        prev.map((th) =>
          th.id === activeThread.id
            ? {
                ...th,
                updatedAt: new Date().toISOString(),
                messages: [...th.messages, errorMsg],
              }
            : th
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatThreadDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return t('copilot.today', 'Today');
      if (diffDays === 1) return t('copilot.yesterday', 'Yesterday');
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* Floating Launcher Button (when closed) */}
      {!isOpen && (
        <button
          onClick={() => setInternalIsOpen(true)}
          className="fixed bottom-20 md:bottom-8 right-5 z-40 group flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-bold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white ring-2 ring-emerald-400"></span>
          </div>
          <span className="text-xs tracking-wide uppercase font-extrabold hidden sm:inline">
            Gemini AI
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 font-mono">
            {budgetRemaining}
          </span>
        </button>
      )}

      {/* Drawer Overlay & Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-xl md:max-w-2xl bg-white dark:bg-[#0d121d] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300 overflow-hidden">
            {/* Top Gemini Header */}
            <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Toggle Sidebar Icon */}
                <button
                  onClick={() => setIsSidebarOpen((prev) => !prev)}
                  title={t('copilot.switch_threads', 'Switch conversation')}
                  className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                    isSidebarOpen
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {isSidebarOpen ? (
                    <PanelLeftClose className="w-4 h-4" />
                  ) : (
                    <PanelLeftOpen className="w-4 h-4" />
                  )}
                </button>

                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                  <div className="w-full h-full bg-white dark:bg-[#0d121d] rounded-[9px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {activeThread?.title || t('copilot.title', 'FitTrack Gemini AI Coach')}
                    </h3>
                    <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      {t('copilot.grounded_badge', 'GROUNDED')}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {t('copilot.subtitle', 'Contextual Fitness & Diet Coach powered by Gemini')}
                  </p>
                </div>
              </div>

              {/* Right Header Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* New Chat Button */}
                <button
                  onClick={handleCreateNewThread}
                  title={t('copilot.new_chat', 'New Chat')}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('copilot.new_chat', 'New Chat')}</span>
                </button>

                <div className="hidden sm:block text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{budgetRemaining}</span>/15
                </div>

                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Anti-Hallucination Grounding Notice */}
            <div className="px-4 py-2 bg-slate-100/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">
                  {t('copilot.safety_disclaimer', 'Grounded in your real training metrics. Refuses medical diagnosis.')}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
                {threads.length} {t('copilot.chat_history', 'chats')}
              </span>
            </div>

            {/* Drawer Body: Sidebar + Main Chat */}
            <div className="relative flex-1 flex overflow-hidden">
              {/* Left Conversation Threads Sidebar (Gemini style) */}
              <div
                className={`absolute inset-y-0 left-0 z-20 w-64 bg-slate-50 dark:bg-[#0a0e17] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
                  isSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
                }`}
              >
                {/* Sidebar Header */}
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <span>{t('copilot.chat_history', 'Conversations')}</span>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* New Chat action inside sidebar */}
                <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80">
                  <button
                    onClick={handleCreateNewThread}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white keep-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('copilot.new_chat', 'New Chat')}</span>
                  </button>
                </div>

                {/* Threads List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {threads.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      {t('copilot.no_conversations', 'No conversations yet')}
                    </div>
                  ) : (
                    threads.map((thread) => {
                      const isActive = thread.id === activeThreadId;
                      return (
                        <div
                          key={thread.id}
                          onClick={() => {
                            setActiveThreadId(thread.id);
                            setIsSidebarOpen(false);
                          }}
                          className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/30'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-6">
                            <MessageSquare
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isActive
                                  ? 'text-emerald-500'
                                  : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                              }`}
                            />
                            <div className="truncate">
                              <p className="truncate text-xs">{thread.title}</p>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {formatThreadDate(thread.updatedAt)} · {thread.messages.length} msgs
                              </span>
                            </div>
                          </div>

                          {/* Delete Action */}
                          <button
                            onClick={(e) => handleDeleteThread(thread.id, e)}
                            title={t('copilot.delete_chat', 'Delete conversation')}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Main Chat Conversation View */}
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {(activeThread?.messages || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'assistant' && (
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      )}

                      <div
                        className={`group relative max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-emerald-500 text-slate-950 font-medium shadow-md shadow-emerald-500/10'
                            : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/70 shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <div
                          className={`text-[9px] mt-1.5 flex items-center justify-between gap-2 ${
                            msg.sender === 'user' ? 'text-slate-950/60' : 'text-slate-400'
                          }`}
                        >
                          <span>{msg.timestamp}</span>

                          {/* Copy Button for Assistant Messages */}
                          {msg.sender === 'assistant' && (
                            <button
                              onClick={() => handleCopyText(msg.text, msg.id)}
                              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-500 transition cursor-pointer"
                              title={t('copilot.copy_reply', 'Copy response')}
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span className="text-emerald-500">{t('copilot.copied', 'Copied')}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>{t('copilot.copy_reply', 'Copy')}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {msg.sender === 'user' && (
                        <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-slate-700 dark:text-slate-300">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="flex gap-3 items-center text-xs text-slate-500 dark:text-slate-400">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
                          style={{ animationDelay: '0.15s' }}
                        ></span>
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
                          style={{ animationDelay: '0.3s' }}
                        ></span>
                        <span className="ml-1 text-[11px] text-slate-500 dark:text-slate-400">
                          {t('copilot.analyzing_metrics', 'Analyzing metrics...')}
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompt Suggestions (When conversation is fresh) */}
                {(!activeThread?.messages || activeThread.messages.length <= 1) && (
                  <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/40">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                      {t('copilot.suggested_questions', 'Suggested Questions')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(prompt)}
                          disabled={loading}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition-all text-left truncate max-w-full cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Bar */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        budgetRemaining > 0
                          ? t('copilot.input_placeholder', 'Ask Gemini about sets, 1RM, macros...')
                          : t('copilot.limit_reached', 'Daily limit reached (resets midnight)')
                      }
                      disabled={budgetRemaining <= 0 || loading}
                      className="w-full pl-3 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all disabled:opacity-50"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || loading || budgetRemaining <= 0}
                      className="absolute right-1.5 p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-bold transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
