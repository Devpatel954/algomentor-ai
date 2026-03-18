import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import { aiApi } from '../../services/api';

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'ai',
    content:
      "Hi! I'm your AI coding assistant powered by Mistral. I can give you hints, explain code, or review your solution. What would you like help with?",
  },
];

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-3 py-2">
      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

function renderMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

function ChatBubble({ message, isTyping }) {
  const isAI = message.role === 'ai';
  return (
    <div className={`flex gap-2.5 ${isAI ? '' : 'flex-row-reverse'} mb-4`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isAI ? 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm' : 'bg-slate-200'
      }`}>
        {isAI ? <Bot size={14} className="text-white" /> : <User size={14} className="text-slate-600" />}
      </div>
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
        isAI
          ? 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-sm'
          : 'bg-indigo-600 text-white rounded-tr-sm'
      }`}>
        {isTyping ? <TypingIndicator /> : (
          <div className="whitespace-pre-line">{renderMarkdown(message.content)}</div>
        )}
      </div>
    </div>
  );
}

/**
 * AIAssistant panel — calls Mistral via the FastAPI backend.
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 *   problemContext: { id, description, title } | null
 *   userCode: string
 *   onAuthRequired: () => void  — called when user is not logged in
 */
export default function AIAssistant({ isOpen, onClose, problemContext, userCode = '' }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const addAIMessage = (content) => {
    setMessages((prev) => [...prev, { id: Date.now(), role: 'ai', content }]);
  };

  const addUserMessage = (content) => {
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content }]);
  };

  const callAI = async (label, apiFn) => {
    addUserMessage(label);
    setIsTyping(true);
    try {
      const data = await apiFn();
      addAIMessage(data.result);
    } catch (err) {
      addAIMessage(`Sorry, I ran into an error: ${err.message}. Please try again.`);
    } finally {
      setIsTyping(false);
    }
  };

  const handleHint = (level = 1) =>
    callAI(`Give me a hint (level ${level})`, () =>
      aiApi.hint(
        problemContext?.id ?? 0,
        problemContext?.description ?? 'General algorithm problem',
        userCode,
        level,
      )
    );

  const handleExplain = () =>
    callAI('Explain my code', () => aiApi.explain(userCode, 'javascript'));

  const handleReview = () =>
    callAI('Review my code', () =>
      aiApi.review(userCode, 'javascript', problemContext?.title ?? '')
    );

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput('');

    const lower = text.toLowerCase();
    if (lower.includes('hint')) return handleHint(lower.includes('more') ? 2 : 1);
    if (lower.includes('explain')) return handleExplain();
    if (lower.includes('review') || lower.includes('complex')) return handleReview();

    // Generic message — send as a hint with user text as context
    addUserMessage(text);
    setIsTyping(true);
    try {
      const data = await aiApi.hint(
        problemContext?.id ?? 0,
        `${problemContext?.description ?? ''}\n\nUser question: ${text}`,
        userCode,
        1,
      );
      addAIMessage(data.result);
    } catch (err) {
      addAIMessage(`Error: ${err.message}`);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  const quickActions = [
    { label: '💡 Hint', fn: () => handleHint(1) },
    { label: '💡💡 More hint', fn: () => handleHint(2) },
    { label: '🔍 Explain code', fn: handleExplain },
    { label: '⚡ Review & complexity', fn: handleReview },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/20 md:hidden" onClick={onClose} />
      <div
        className="fixed right-4 bottom-4 z-50 w-full max-w-sm sm:max-w-md flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
        style={{ height: '540px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">AI Assistant</p>
              <p className="text-xs text-slate-400 font-medium">Mistral · <span className="text-emerald-500">● Connected</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/80">
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)}
          {isTyping && <ChatBubble message={{ role: 'ai', content: '' }} isTyping />}
          <div ref={bottomRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {quickActions.map(({ label, fn }) => (
            <button
              key={label}
              onClick={fn}
              disabled={isTyping}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-600 whitespace-nowrap flex-shrink-0 disabled:opacity-40"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-100">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask anything about this problem..."
              rows={1}
              className="flex-1 resize-none text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder-slate-400 bg-slate-50 max-h-24"
              style={{ lineHeight: '1.5' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isTyping ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

