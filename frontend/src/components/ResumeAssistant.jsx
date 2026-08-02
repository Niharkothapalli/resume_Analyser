import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function ResumeAssistant({ session_id }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'System indexed. Ask specific questions about your role gaps, technical score, or career progression roadmap.'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const chatContainerRef = useRef(null);

  // Scroll ONLY the internal chat container when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', content: textToSend.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        session_id: session_id,
        message: textToSend.trim()
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.reply
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Could not reach Resume Assistant. Please verify your session.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const SUGGESTIONS = [
    "What are my top 3 skill gaps for this role?",
    "How can I improve my technical score?",
    "What projects should I build to level up?",
    "Is my work experience description strong enough?"
  ];

  return (
    <div className="flex flex-col h-full min-h-[480px] w-full text-left space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 px-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-['Syne'] font-bold text-sm text-white">AI Resume Assistant</h4>
            <span className="text-[10px] text-white/40 uppercase tracking-widest block">
              Grounded RAG Dialogue
            </span>
          </div>
        </div>
        <span className="text-[10px] text-white/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 font-mono">
          Session: {session_id?.slice(0, 8)}
        </span>
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 px-2">
          {SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSend(sug)}
              className="text-[11px] text-white/60 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 rounded-full px-3 py-1.5 transition-all text-left cursor-pointer"
            >
              &rarr; {sug}
            </button>
          ))}
        </div>
      )}

      {/* Message History List - Internal Scroll Container Only */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-2 space-y-3.5 custom-scrollbar max-h-[380px]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}

            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-white text-[#121214] font-medium rounded-tr-none'
                  : 'bg-white/[0.05] border border-white/10 text-white/90 rounded-tl-none border-l-2 border-l-white'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-white/40 italic p-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Assistant reasoning...</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-3 rounded-xl bg-[#f87171]/10 border border-[#f87171]/20 text-[#f87171] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/10 px-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about specific projects, skills, or role requirements..."
          className="flex-1 bg-white/5 border border-white/10 rounded-full py-3 px-5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all font-sans"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isLoading}
          className="px-5 py-3 rounded-full font-['Syne'] font-extrabold text-xs uppercase bg-white text-[#121214] hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
