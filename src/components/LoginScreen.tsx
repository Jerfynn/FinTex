import React, { useState } from "react";
import { MessageSquare, Mail, Phone, ChevronRight } from "lucide-react";

interface LoginProps {
  onOtpSent: (email: string, debugOtp?: string) => void;
}

export default function LoginScreen({ onOtpSent }: LoginProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [useEmail, setUseEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSendOtp = async () => {
    setErrorMsg("");
    
    let targetEmail = email.trim();
    if (!useEmail) {
      // If phone model is active, generate a simulated email matching format
      if (!phone || phone.length < 7) {
        setErrorMsg("Please enter a valid phone number");
        return;
      }
      targetEmail = `phone_${phone.replace(/\D/g, "")}@chatapp.com`;
    }

    if (!targetEmail) {
      setErrorMsg("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      setErrorMsg("Please enter a valid email format");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to trigger OTP delivery");
      }

      onOtpSent(targetEmail, data.debugOtp);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 py-8 animate-fade-in relative z-10">
      <div className="w-full max-w-[400px] flex flex-col space-y-8">
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 bg-primary-container rounded-3xl flex items-center justify-center shadow-md">
            <MessageSquare className="text-white w-10 h-10" fill="currentColor" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-primary font-sans">FinTex</h1>
            <p className="text-xs text-on-surface-variant font-mono">Simple. Secure. Reliable.</p>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">
              {useEmail ? "Enter your email address" : "Enter your phone number"}
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              FinTex will send a 6-digit verification code to log in safely.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-error-container/40 border border-error/20 rounded-xl text-error text-xs">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            {useEmail ? (
              /* Email Input Grid */
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-primary uppercase tracking-wider">Email Address</label>
                <div className="relative flex items-center border-b border-primary py-2 px-1 focus-within:border-primary-container">
                  <Mail className="text-outline w-5 h-5 mr-3 shrink-0" />
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-on-surface text-base outline-none p-0"
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                    autoFocus
                  />
                </div>
              </div>
            ) : (
              /* Phone Input Grid */
              <div className="space-y-4">
                <div className="relative w-full border-b border-outline-variant py-2 flex items-center justify-between px-2 cursor-pointer rounded-t-lg bg-surface-container-low hover:bg-surface-container transition-colors">
                  <span className="text-on-surface text-base">United States</span>
                  <span className="text-xs text-outline font-bold">US (+1)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-16 border-b border-outline-variant py-2 text-center text-on-surface text-base">
                    +1
                  </div>
                  <div className="flex-grow border-b border-primary py-2">
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-on-surface text-base outline-none p-0"
                      onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      autoFocus
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full bg-primary-container text-white hover:brightness-110 disabled:opacity-50 py-3 rounded-full flex items-center justify-center space-x-2 shadow-md active:scale-95 transition-all text-base font-semibold cursor-pointer"
          >
            <span>{loading ? "Sending..." : "Send OTP"}</span>
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="text-center py-1">
            <span className="text-xs font-bold text-outline-variant uppercase">OR</span>
          </div>

          <button
            onClick={() => {
              setErrorMsg("");
              setUseEmail(!useEmail);
            }}
            className="w-full border border-outline-variant hover:bg-surface-container-low transition-colors py-3 rounded-full flex items-center justify-center space-x-2 text-on-surface-variant font-semibold text-sm cursor-pointer"
          >
            {useEmail ? (
              <>
                <Phone className="w-4 h-4 text-on-surface-variant" />
                <span>Use Phone Number</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 text-on-surface-variant" />
                <span>Use Email Address</span>
              </>
            )}
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center px-4">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            By continuing, you agree to FinTex's{" "}
            <a href="#" className="font-semibold text-secondary hover:underline">
              Terms of Service
            </a>{" "}
            &amp;{" "}
            <a href="#" className="font-semibold text-secondary hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
