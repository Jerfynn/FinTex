import React, { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, AlertCircle, Sparkles, Send } from "lucide-react";

interface HelpProps {
  onBack: () => void;
}

export default function HelpScreen({ onBack }: HelpProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [ticketMsg, setTicketMsg] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");

  const faqs = [
    {
      q: "How do I add friends on FinTex?",
      a: "Navigate to the 'Friends' tab at the bottom, tap 'Add Friend' in the top right, enter their email address, and click Invite. Once they approve the pending request, they will automatically appear grouped alphabetically in your friends directory and you can start sharing live chats!",
    },
    {
      q: "How do I configure my Two-step PIN lock?",
      a: "Go to your Settings screen. Under the Two-Step PIN Lock section, compose a secure 4-to-6 digit password lock, and click Enable PIN. FinTex will prompt you for this credentials lock periodically.",
    },
    {
      q: "Are messages end-to-end synchronized?",
      a: "Yes! Direct conversations leverage authenticated full-duplex WebSocket connections. High-performance databases (PostgreSQL) index message history so they load beautifully if you log in from other client-side tabs.",
    },
    {
      q: "How do I customize my status or photo?",
      a: "Tap on your personal name details card inside the Settings dashboard to update your profile photo, status statement (e.g., 'At the gym', 'Busy'), bio, and phone numbers instantly.",
    },
  ];

  const handleSendTicket = () => {
    if (!ticketMsg.trim()) return;
    setTicketStatus("Ticket filed successfully! Our help agents will review and reply within 12 hours.");
    setTicketMsg("");
    setTimeout(() => {
      setTicketStatus("");
    }, 5000);
  };

  return (
    <div className="flex flex-col h-full bg-background animate-fade-in pb-safe">
      <header className="bg-surface border-b border-outline-variant shadow-sm w-full shrink-0 flex items-center px-4 h-14 z-50">
        <button
          onClick={onBack}
          className="hover:bg-surface-container-high p-2 rounded-full transition-colors text-primary mr-3 cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-semibold text-lg text-primary font-sans">Help Center FAQ</h1>
      </header>

      <main className="flex-grow overflow-y-auto pb-12 p-4 space-y-4 custom-scrollbar">
        {/* Support section */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-outline tracking-wider uppercase">Frequently Asked Questions</h2>
          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="bg-white border border-outline-variant/30 rounded-2xl p-4 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center text-left outline-none text-xs font-bold text-on-surface cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />}
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-xs leading-relaxed text-on-surface-variant font-sans border-t border-outline-variant/10 pt-3">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact form tickets */}
        <section className="bg-white p-4 border border-outline-variant/30 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-outline tracking-wider uppercase flex items-center gap-1.5">
            <Sparkles className="w-4.5 h-4.5 text-secondary animate-pulse" />
            Contact Customer Support
          </h2>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Report bugs, check status anomalies, or submit system feedback. Our engineering team resolves tickets instantly.
          </p>

          {ticketStatus && (
            <div className="p-3 bg-secondary-container/40 text-on-secondary-container border border-secondary/20 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-secondary shrink-0" />
              <span>{ticketStatus}</span>
            </div>
          )}

          <div className="space-y-3">
            <textarea
              placeholder="Describe your query or feedback in details..."
              rows={3}
              value={ticketMsg}
              onChange={(e) => setTicketMsg(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl p-3 outline-none text-xs text-on-surface resize-none"
            />
            <button
              onClick={handleSendTicket}
              className="w-full bg-primary-container text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 shadow-sm outline-none cursor-pointer"
            >
              <Send className="w-4 h-4 text-white" />
              <span className="text-xs uppercase">Send Ticket Report</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
