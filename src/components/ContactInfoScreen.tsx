import React, { useState } from "react";
import { ArrowLeft, Phone, Video, Search, Bell, Lock, AlertCircle, Ban, ThumbsDown, Trash2, ShieldAlert, Sparkles, Image } from "lucide-react";
import { User } from "../types";

interface ContactInfoProps {
  selectedFriend: User;
  onBack: () => void;
  onClearHistory: () => void;
}

export default function ContactInfoScreen({
  selectedFriend,
  onBack,
  onClearHistory,
}: ContactInfoProps) {
  const [muteNotifications, setMuteNotifications] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  // Seed media clips
  const mockMedia = [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=150&auto=format&fit=crop",
  ];

  return (
    <div className="flex flex-col h-full bg-background animate-fade-in pb-safe">
      <header className="bg-surface border-b border-outline-variant shadow-sm w-full shrink-0 flex items-center px-4 h-14 z-50">
        <button
          onClick={onBack}
          className="hover:bg-surface-container-high p-2 rounded-full transition-colors text-primary mr-3 cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-semibold text-lg text-primary">Contact Info</h1>
      </header>

      <main className="flex-grow overflow-y-auto pb-12 custom-scrollbar">
        {/* Profile Card Header with big photo */}
        <section className="bg-white p-6 flex flex-col items-center border-b border-outline-variant/15 text-center">
          {selectedFriend.avatarUrl ? (
            <img
              src={selectedFriend.avatarUrl}
              alt={selectedFriend.fullName}
              className="w-24 h-24 rounded-full object-cover border-2 border-outline-variant shadow-md mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary-container-low text-primary flex items-center justify-center font-bold text-3xl mb-4 shadow-md">
              F
            </div>
          )}

          <h2 className="text-xl font-bold text-on-surface leading-tight">
            {selectedFriend.fullName || selectedFriend.email}
          </h2>
          <p className="text-xs text-on-surface-variant font-mono mt-1 select-all">{selectedFriend.email}</p>
          <p className="text-sm font-semibold text-secondary mt-2">
            {selectedFriend.phoneNumber || "+1 (555) 019-2831"}
          </p>

          <p className="mt-4 italic text-xs leading-relaxed text-on-surface-variant bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/25 max-w-[280px]">
            "{selectedFriend.status || "Building the future of communication..."}"
          </p>
        </section>

        {/* Media, links and docs */}
        <section className="bg-white p-4 mb-2 border-b border-outline-variant/15 mt-2 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-outline tracking-wider uppercase">
            <span>Media, links, and docs</span>
            <span className="text-primary font-bold cursor-pointer hover:underline flex items-center gap-1">
              <Image className="w-3.5 h-3.5" /> 3 items
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-1">
            {mockMedia.map((url, idx) => (
              <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-outline-variant/20 shadow-sm max-w-[80px]">
                <img src={url} alt="Media preview file" className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </div>
            ))}
            <div className="aspect-square bg-surface-container rounded-xl flex items-center justify-center text-outline text-[10px] font-bold font-mono">
              +0 more
            </div>
          </div>
        </section>

        {/* Custom selections */}
        <section className="bg-white border-b border-outline-variant/15 mt-2 divide-y divide-outline-variant/10">
          {/* Mute switcher */}
          <div className="flex items-center justify-between p-4 bg-white hover:bg-surface-container-low transition-colors select-none">
            <div className="flex items-center gap-3.5 text-left">
              <Bell className="w-5 h-5 text-primary-container" />
              <div>
                <span className="font-semibold text-sm text-on-surface block leading-tight">Mute notifications</span>
                <span className="text-[10px] text-on-surface-variant mt-0.5 block">Mute conversations notifications</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={muteNotifications}
                onChange={(e) => setMuteNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
            </label>
          </div>

          {/* Encryption block panel */}
          <div className="flex items-start gap-4 p-4 text-left">
            <Lock className="w-5 h-5 text-primary-container shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-sm text-on-surface block leading-tight">Encryption</span>
              <span className="text-[11px] text-on-surface-variant mt-1.5 block leading-relaxed">
                Messages and calls are end-to-end encrypted. Tap to verify with security QR codes.
              </span>
            </div>
          </div>
        </section>

        {/* Blocks and reports actions */}
        <section className="bg-white border-b border-outline-variant/15 mt-2 divide-y divide-outline-variant/10">
          <button
            onClick={() => setIsBlocked(!isBlocked)}
            className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-error/5 transition-colors"
          >
            <Ban className="w-5 h-5 text-error" />
            <div>
              <span className="font-bold text-sm text-error block leading-tight">
                {isBlocked ? "Unblock Contact" : "Block Contact"}
              </span>
              <span className="text-[10px] text-on-surface-variant mt-0.5 block">
                Prevent messages and calls deliveries from reaching you
              </span>
            </div>
          </button>

          <button className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-error/5 transition-colors">
            <ThumbsDown className="w-5 h-5 text-error" />
            <div>
              <span className="font-bold text-sm text-error block leading-tight">Report Spammer</span>
              <span className="text-[10px] text-on-surface-variant mt-0.5 block">File a telemetry complaint report with FinTex</span>
            </div>
          </button>

          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear this chat history?")) {
                onClearHistory();
                onBack();
              }
            }}
            className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-error/5 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-error" />
            <div>
              <span className="font-bold text-sm text-error block leading-tight">Clear Chat History</span>
              <span className="text-[10px] text-on-surface-variant mt-0.5 block">Erase historic conversational files permanently</span>
            </div>
          </button>
        </section>
      </main>
    </div>
  );
}
