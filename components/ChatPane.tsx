
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, PersonTotal } from '../types';

interface ChatPaneProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  totals: PersonTotal[];
  isProcessing: boolean;
  currency: string;
}

const ChatPane: React.FC<ChatPaneProps> = ({ messages, onSendMessage, totals, isProcessing, currency }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative">
      {/* Header with Summary Preview */}
      <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Live Split</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {totals.length === 0 ? (
            <div className="text-xs text-slate-400 italic py-2">Assign items to see split...</div>
          ) : (
            totals.map((p, i) => (
              <div key={i} className="flex-shrink-0 bg-white border border-slate-200 rounded-xl p-3 shadow-sm min-w-[120px]">
                <div className="text-xs font-bold text-blue-600 mb-1">{p.name}</div>
                <div className="text-lg font-bold text-slate-800">{currency}{p.total.toFixed(2)}</div>
                <div className="text-[10px] text-slate-400 truncate">{p.items.length} items</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat History */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-100' 
                : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            placeholder="e.g. 'Alice had the coffee'"
            className="w-full bg-slate-100 border-none rounded-full py-3 px-5 pr-12 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
        <p className="text-[10px] text-slate-400 text-center mt-2 italic">
          Try: "Me and Bob shared the nachos" or "Remove pizza from Alice"
        </p>
      </div>
    </div>
  );
};

export default ChatPane;
