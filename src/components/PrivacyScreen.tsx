import React, { useState } from "react";
import { ArrowLeft, Lock, Users, AlertOctagon, Check, UserMinus } from "lucide-react";

interface PrivacyProps {
  onBack: () => void;
}

export default function PrivacyScreen({ onBack }: PrivacyProps) {
  const [lastSeen, setLastSeen] = useState("Everyone");
  const [profilePhoto, setProfilePhoto] = useState("Everyone");
  const [statusText, setStatusText] = useState("My Contacts");
  const [readReceipts, setReadReceipts] = useState(true);

  // Block list state
  const [blockList, setBlockList] = useState([
    { id: 401, name: "Spammer Bot", email: "bot@spammer.com" },
  ]);

  const removeBlocked = (id: number) => {
    setBlockList((prev) => prev.filter((u) => u.id !== id));
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
        <h1 className="font-semibold text-lg text-primary">Privacy Settings</h1>
      </header>

      <main className="flex-grow overflow-y-auto pb-12 custom-scrollbar">
        {/* Info Box */}
        <section className="p-4 bg-white border-b border-outline-variant/15 flex gap-3 text-xs leading-relaxed text-on-surface-variant">
          <Lock className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
          <p>
            Your privacy is prioritized. Any selections you implement here will sync immediately to prevent leaks of personal status updates and last seen events.
          </p>
        </section>

        {/* Visibilities configs table */}
        <section className="bg-white p-4 border-b border-outline-variant/15 mt-2 space-y-4">
          <h2 className="text-xs font-bold text-outline tracking-wider uppercase mb-3">
            Who can see my personal info
          </h2>

          {/* Last seen */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Last Seen &amp; Online</label>
            <select
              value={lastSeen}
              onChange={(e) => setLastSeen(e.target.value)}
              className="bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2 text-xs outline-none"
            >
              <option value="Everyone">Everyone</option>
              <option value="My Contacts">My Contacts</option>
              <option value="Nobody">Nobody</option>
            </select>
          </div>

          {/* Profile photo */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Profile Photo Visibility</label>
            <select
              value={profilePhoto}
              onChange={(e) => setProfilePhoto(e.target.value)}
              className="bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2 text-xs outline-none"
            >
              <option value="Everyone">Everyone</option>
              <option value="My Contacts">My Contacts</option>
              <option value="Nobody">Nobody</option>
            </select>
          </div>

          {/* Status Updates */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Status updates</label>
            <select
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              className="bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2 text-xs outline-none"
            >
              <option value="Everyone">Everyone</option>
              <option value="My Contacts">My Contacts</option>
              <option value="Nobody">Nobody</option>
            </select>
          </div>
        </section>

        {/* Checkbox triggers */}
        <section className="bg-white p-4 border-b border-outline-variant/15 mt-2 space-y-3">
          <h2 className="text-xs font-bold text-outline tracking-wider uppercase mb-2">
            Messaging Options
          </h2>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={readReceipts}
              onChange={(e) => setReadReceipts(e.target.checked)}
              className="mt-1 h-4 w-4 text-primary focus:ring-primary rounded"
            />
            <div>
              <span className="text-xs font-bold text-on-surface block leading-tight">Read Receipts</span>
              <span className="text-[10px] text-on-surface-variant leading-relaxed mt-1 block">
                If turned off, you won't send or receive Read Receipts. Read Receipts are always sent for group chats.
              </span>
            </div>
          </label>
        </section>

        {/* Blocking configs */}
        <section className="bg-white p-4 border-b border-outline-variant/15 mt-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-outline tracking-wider uppercase">
              Blocked Contacts ({blockList.length})
            </h2>
            <AlertOctagon className="w-4 h-4 text-outline" />
          </div>

          {blockList.length === 0 ? (
            <p className="text-xs text-on-surface-variant italic">No contacts currently blocked.</p>
          ) : (
            <div className="space-y-2">
              {blockList.map((u) => (
                <div
                  key={u.id}
                  className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-outline-variant/20"
                >
                  <div className="min-w-0 pr-1">
                    <span className="text-xs font-bold text-on-surface block">{u.name}</span>
                    <span className="text-[10px] text-outline block font-mono truncate">{u.email}</span>
                  </div>
                  <button
                    onClick={() => removeBlocked(u.id)}
                    className="text-[10px] font-bold text-primary hover:text-error flex items-center gap-1 cursor-pointer border border-outline-variant/30 px-2 py-1.5 rounded-lg hover:bg-white transition-colors"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>Unblock</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
