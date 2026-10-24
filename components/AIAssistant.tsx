'use client';

import React, { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import {
  Sparkles,
  X,
  Send,
  ShieldAlert,
  CalendarPlus,
  Bot,
  User,
  ArrowRight,
  HelpCircle,
  Clock,
  Building,
} from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  toolCall?: any;
  isSalaryRestricted?: boolean;
  isLeaveFormPreFill?: boolean;
  leaveData?: any;
}

export default function AIAssistant({
  onPreFillLeave,
}: {
  onPreFillLeave?: (leaveData: any) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'HCM Lite AI Copilot online. I can assist you with leave balances, shift attendance policy, grace cutoffs, or pre-filling leave requests from plain English.',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await apiFetch('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      });

      if (res.success) {
        const aiMsg: Message = {
          sender: 'ai',
          text: res.reply || 'Request processed.',
          toolCall: res.toolCall,
          isSalaryRestricted: res.isSalaryRestricted,
          isLeaveFormPreFill: res.isLeaveFormPreFill,
          leaveData: res.leaveData,
        };

        setMessages((prev) => [...prev, aiMsg]);

        if (res.isLeaveFormPreFill && res.leaveData && onPreFillLeave) {
          onPreFillLeave(res.leaveData);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: res.message || 'Error occurred while contacting AI Assistant.' },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: err.message || 'Failed to reach AI service.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestionPills = [
    'How many sick leaves do I have left?',
    'What is the office timing and grace rule?',
    'Taking next Monday off for personal work',
    'Who is on leave today?',
    "What is my colleague's salary?",
    'Show department headcount breakdown',
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition duration-200 cursor-pointer border ${
            isOpen
              ? 'bg-[#111E30] text-[#F8FAFC] border-[#203044]'
              : 'bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white hover:from-[#15803D] hover:to-[#16A34A] border-emerald-400/40 shadow-emerald-950/60'
          }`}
          aria-label="Toggle AI Copilot"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-wide">
            {isOpen ? 'Close Copilot' : 'AI Copilot'}
          </span>
        </button>
      </div>

      {/* Slide-out / Floating Chat Card */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-96 md:w-[420px] max-h-[580px] h-[80vh] bg-[#0D1928] border border-[#203044] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-[#03101D] border-b border-[#203044] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                  <span>Saylani HCM AI Copilot</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
                    Live Twin
                  </span>
                </h3>
                <p className="text-[10px] text-[#94A3B8]">Natural language queries & smart leave parsing</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111E30] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white rounded-br-none shadow-sm'
                      : 'bg-[#111E30] border border-[#203044] text-[#F8FAFC] rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {/* Salary Privacy Guard Refusal Warning */}
                  {m.isSalaryRestricted && (
                    <div className="mt-2.5 p-2 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-[11px] flex items-start gap-1.5">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                      <span>
                        Access Denied: Scoped privacy rule restricts compensation ledger queries to authorized administrators.
                      </span>
                    </div>
                  )}

                  {/* Pre-fill Leave Notification */}
                  {m.isLeaveFormPreFill && m.leaveData && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-[11px] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CalendarPlus className="w-4 h-4 text-emerald-400" />
                        <span>Pre-filled leave form ready!</span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-400 font-semibold uppercase">
                        {m.leaveData.type}
                      </span>
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-[#111E30] border border-[#203044] text-[#94A3B8] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px] py-2">
                <div className="w-3.5 h-3.5 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
                <span>AI Copilot processing live query...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Strip */}
          <div className="px-3 py-2 bg-[#03101D] border-t border-[#203044] overflow-x-auto flex gap-1.5 no-scrollbar">
            {suggestionPills.map((pill, i) => (
              <button
                key={i}
                type="button"
                onClick={() => sendMessage(pill)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#0D1928] hover:bg-[#111E30] border border-[#203044] hover:border-emerald-500/40 text-[10px] text-[#94A3B8] hover:text-[#F8FAFC] transition cursor-pointer"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 bg-[#03101D] border-t border-[#203044] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot or apply: 'leave next Monday'..."
              className="flex-1 bg-[#020817] border border-[#203044] focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white disabled:opacity-50 transition cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
