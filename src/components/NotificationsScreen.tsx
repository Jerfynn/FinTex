import React, { useState } from "react";
import { ArrowLeft, BellRing, Volume2, Music, Check, Radio, AlertCircle } from "lucide-react";

interface NotificationProps {
  onBack: () => void;
}

export default function NotificationsScreen({ onBack }: NotificationProps) {
  const [volume, setVolume] = useState(70);
  const [melody, setMelody] = useState("FinTex Retro Sparkles");
  const [vibration, setVibration] = useState("Medium");
  const [vibrateTriggered, setVibrateTriggered] = useState(false);

  const testVibrate = () => {
    setVibrateTriggered(true);
    setTimeout(() => {
      setVibrateTriggered(false);
    }, 1200);
  };

  return (
    <div className={`flex flex-col h-full bg-background transition-all duration-300 pb-safe ${vibrateTriggered ? "translate-x-1 rotate-1 scale-98" : ""}`}>
      <header className="bg-surface border-b border-outline-variant shadow-sm w-full shrink-0 flex items-center px-4 h-14 z-50">
        <button
          onClick={onBack}
          className="hover:bg-surface-container-high p-2 rounded-full transition-colors text-primary mr-3 cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-semibold text-lg text-primary">Notifications</h1>
      </header>

      <main className="flex-grow overflow-y-auto pb-12 p-4 space-y-4 custom-scrollbar">
        {/* Alerts card */}
        <section className="bg-white p-4 border border-outline-variant/30 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-outline tracking-wider uppercase flex items-center gap-1.5">
            <BellRing className="w-4.5 h-4.5 text-primary" />
            Alert Volume Configs
          </h2>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs text-on-surface">
              <span>Message Alert tone Volume</span>
              <span className="font-mono font-bold text-primary">{volume}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Volume2 className="text-outline w-5 h-5 shrink-0" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-primary h-1 bg-surface-container rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Melody selects */}
        <section className="bg-white p-4 border border-outline-variant/30 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-outline tracking-wider uppercase flex items-center gap-1.5">
            <Music className="w-4.5 h-4.5 text-primary" />
            Notification Melodies
          </h2>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-on-surface font-semibold">Tones Melody selection</span>
            <select
              value={melody}
              onChange={(e) => setMelody(e.target.value)}
              className="bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2 text-xs outline-none"
            >
              <option value="FinTex Retro Sparkles">FinTex Retro Sparkles (Default)</option>
              <option value="Ambient Zen Synthesizer">Ambient Zen Synthesizer</option>
              <option value="Chimes Bell Rings">Chimes Bell Rings</option>
              <option value="Mute / Silent">Mute / Silent</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-on-surface font-semibold">Vibration levels</span>
            <div className="flex gap-2.5">
              {["Off", "Short", "Medium", "Long"].map((pattern) => {
                const isSelected = vibration === pattern;
                return (
                  <button
                    key={pattern}
                    onClick={() => setVibration(pattern)}
                    className={`flex-1 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary-container text-white border-primary"
                        : "bg-surface-container-low text-on-surface-variant border-outline-variant/30"
                    }`}
                  >
                    {pattern}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Vibration simulation card */}
        <section className="bg-white p-4 border border-outline-variant/30 rounded-2xl shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-outline tracking-wider uppercase">Vibration Testbed</h3>
            <Radio className={`w-4 h-4 text-secondary ${vibrateTriggered ? "animate-ping" : ""}`} />
          </div>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Test the physical haptic vibration profiles to observe how different rhythms alert you of incoming chats.
          </p>
          <button
            onClick={testVibrate}
            className={`w-full py-2 rounded-xl text-xs font-bold shadow-sm transition-all outline-none cursor-pointer ${
              vibrateTriggered
                ? "bg-secondary text-white"
                : "bg-surface-container-high text-on-surface border border-outline-variant/30 hover:bg-surface-container"
            }`}
          >
            {vibrateTriggered ? "📳 Vibrating..." : "Test Vibration"}
          </button>
        </section>
      </main>
    </div>
  );
}
