import React, { useState } from "react";
import {
  User,
  Shield,
  Lock,
  Eye,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Palette,
  Check,
  AlertCircle,
  Smartphone,
  Info,
} from "lucide-react";
import { User as UserType } from "../types";

interface SettingsScreenProps {
  currentUser: UserType;
  onEditProfile: () => void;
  onLogOut: () => void;
  onSelectSubScreen: (screen: string) => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
  wallpaperColor: string;
  setWallpaperColor: (color: string) => void;
}

export default function SettingsScreen({
  currentUser,
  onEditProfile,
  onLogOut,
  onSelectSubScreen,
  themeColor,
  setThemeColor,
  wallpaperColor,
  setWallpaperColor,
}: SettingsScreenProps) {
  const [pinCode, setPinCode] = useState("");
  const [isPinConfigured, setIsPinConfigured] = useState(false);
  const [showPinAlert, setShowPinAlert] = useState(false);

  // Wallpaper pallets
  const wallpapers = [
    { name: "Default Teal", class: "bg-[#e5ddd5]", code: "#e5ddd5" },
    { name: "Cosmic Charcoal", class: "bg-surface-container-high", code: "#1e1e24" },
    { name: "Amber Ochre", class: "bg-amber-100", code: "#fef3c7" },
    { name: "Warm Slate", class: "bg-slate-100", code: "#f1f5f9" },
    { name: "Forest Sage", class: "bg-emerald-50/50", code: "#f0fdf4" },
  ];

  const handleSavePin = () => {
    if (pinCode.length < 4) {
      alert("PIN must be at least 4 digits");
      return;
    }
    setIsPinConfigured(true);
    setShowPinAlert(true);
    setTimeout(() => {
      setShowPinAlert(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full bg-background animate-fade-in pb-safe">
      {/* AppBar */}
      <header className="bg-surface sticky top-0 border-b border-outline-variant/30 flex justify-between items-center px-4 h-14 shrink-0 shadow-sm z-50">
        <h1 className="text-xl font-bold font-sans text-primary">Settings</h1>
      </header>

      {/* Main Configurations Container */}
      <main className="flex-grow overflow-y-auto pb-24 custom-scrollbar">
        {/* User profile preview card */}
        <section
          onClick={onEditProfile}
          className="bg-white p-4 border-b border-outline-variant/20 mb-2 flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-colors duration-150"
        >
          <div className="flex items-center gap-4">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-14 h-14 rounded-full object-cover border border-outline-variant/20"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary-container-low text-primary flex items-center justify-center font-bold text-lg">
                U
              </div>
            )}
            <div>
              <h3 className="font-bold text-base text-on-surface leading-tight">
                {currentUser.fullName || "User Account"}
              </h3>
              <p className="text-xs text-on-surface-variant truncate max-w-[200px] mt-0.5">
                {currentUser.status || "Building the future of communication..."}
              </p>
              <span className="text-[10px] text-outline truncate block font-mono mt-1">
                {currentUser.email}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-outline shrink-0" />
        </section>

        {/* Security / PIN Setup section */}
        <section className="bg-white p-4 border-b border-outline-variant/20 mb-2 space-y-3.5">
          <h2 className="text-xs font-bold text-outline tracking-wider uppercase flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-primary" />
            Two-Step PIN Lock
          </h2>
          
          {showPinAlert && (
            <div className="p-3 bg-secondary-container/40 text-on-secondary-container border border-secondary/20 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-secondary shrink-0" />
              <span>Two-step Verification PIN updated successfully!</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="password"
              placeholder="Enter active 4-to-6 digit PIN"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="bg-surface-container focus:bg-white border border-outline-variant/30 rounded-xl px-3 h-10 text-xs w-48 outline-none"
            />
            <button
              onClick={handleSavePin}
              className="bg-primary text-white text-xs font-bold px-4 h-10 rounded-xl shadow-sm hover:brightness-110 cursor-pointer"
            >
              {isPinConfigured ? "Update PIN" : "Enable PIN"}
            </button>
          </div>
          <p className="text-[10px] text-on-surface-variant leading-relaxed">
            For added security, enable Two-Step validation locks. We'll ask you to confirm your lock periodically code digits.
          </p>
        </section>

        {/* Wallpaper Custom Chat Personalization Panel */}
        <section className="bg-white p-4 border-b border-outline-variant/20 mb-2 space-y-3">
          <h2 className="text-xs font-bold text-outline tracking-wider uppercase flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-primary" />
            Chat Wallpaper
          </h2>
          <div className="grid grid-cols-5 gap-3.5 pt-1.5">
            {wallpapers.map((wp) => {
              const isSelected = wallpaperColor === wp.code;
              return (
                <button
                  key={wp.name}
                  onClick={() => setWallpaperColor(wp.code)}
                  className={`relative ${wp.class} h-12 rounded-xl border border-outline-variant/40 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-150`}
                  title={wp.name}
                >
                  {isSelected && (
                    <div className="bg-primary text-white rounded-full p-1 border border-white">
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-on-surface-variant">
            Choose a comforting color wallpaper for your conversation screens from the grid selection above.
          </p>
        </section>

        {/* Options list buttons */}
        <section className="bg-white divide-y divide-outline-variant/10 mb-2">
          {/* Privacy Slider routing Option */}
          <button
            onClick={() => onSelectSubScreen("PRIVACY")}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors group text-left"
          >
            <div className="flex items-center gap-3.5">
              <Eye className="w-5 h-5 text-primary-container" />
              <div>
                <span className="font-semibold text-sm text-on-surface block leading-tight">Privacy Settings</span>
                <span className="text-[10px] text-on-surface-variant mt-0.5 block">Last seen, profile details, read receipts controls</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-outline" />
          </button>

          {/* Notifications levels routing option */}
          <button
            onClick={() => onSelectSubScreen("NOTIFICATIONS")}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors group text-left"
          >
            <div className="flex items-center gap-3.5">
              <Bell className="w-5 h-5 text-primary-container" />
              <div>
                <span className="font-semibold text-sm text-on-surface block leading-tight">Notifications Profiles</span>
                <span className="text-[10px] text-on-surface-variant mt-0.5 block">Volume sliders, custom vibration patterns, and tones</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-outline" />
          </button>

          {/* Help collapsible FAQs option */}
          <button
            onClick={() => onSelectSubScreen("HELP")}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors group text-left"
          >
            <div className="flex items-center gap-3.5">
              <HelpCircle className="w-5 h-5 text-primary-container" />
              <div>
                <span className="font-semibold text-sm text-on-surface block leading-tight">Help Center FAQ</span>
                <span className="text-[10px] text-on-surface-variant mt-0.5 block">Troubleshoot channels, backup, block reports, contact</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-outline" />
          </button>
        </section>

        {/* Sign Out CTA button card */}
        <section className="p-4">
          <button
            onClick={onLogOut}
            className="w-full bg-error-container/40 border border-error/15 hover:bg-error/10 text-error font-semibold flex items-center justify-center p-3.5 gap-2 rounded-xl transition-all outline-none cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out from Account</span>
          </button>
        </section>
      </main>
    </div>
  );
}
