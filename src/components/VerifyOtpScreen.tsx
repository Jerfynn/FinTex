import React, { useState, useEffect, useRef } from "react";
import { LockOpen, ArrowLeft, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";

interface VerifyOtpProps {
  email: string;
  defaultDebugOtp?: string;
  onBack: () => void;
  onVerifySuccess: (token: string, user: any, isNewUser: boolean) => void;
}

export default function VerifyOtpScreen({
  email,
  defaultDebugOtp = "",
  onBack,
  onVerifySuccess,
}: VerifyOtpProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(59);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Count down timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Autofill code if defaultDebugOtp is received to make the prototype incredibly delightful to play with
  useEffect(() => {
    if (defaultDebugOtp && defaultDebugOtp.length === 6) {
      const arr = defaultDebugOtp.split("");
      setDigits(arr);
    }
  }, [defaultDebugOtp]);

  const handleInputChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);

    // Shift focus forward
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = "";
      setDigits(newDigits);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setErrorMsg("");
    const code = digits.join("");
    if (code.length !== 6) {
      setErrorMsg("Please enter all 6 digits of the OTP code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to verify verification code");
      }

      onVerifySuccess(data.token, data.user, data.isNewUser);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setTimeLeft(59);
    setErrorMsg("");
    setDigits(Array(6).fill(""));
    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.error("Resend error:", err);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-between w-full max-w-md mx-auto px-4 pt-4 pb-20 animate-fade-in relative z-10">
      {/* Top navigation back arrow */}
      <header className="w-full flex items-center justify-start h-14">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-surface-container-high active:scale-95 transition-all text-on-surface"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </header>

      <main className="w-full flex-grow flex flex-col items-center py-6">
        {/* Verification Icon Head */}
        <div className="text-center mb-10 mt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-secondary-container text-on-secondary-container mb-6 shadow-sm">
            <LockOpen className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-on-background mb-2">OTP Verification</h1>
          <p className="text-sm text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
            Enter the 6-digit code we sent to your registered address:
            <span className="block font-semibold text-primary font-mono text-xs mt-1 truncate">{email}</span>
          </p>
        </div>

        {/* Prototype Assist Banner */}
        {defaultDebugOtp && (
          <div className="w-full mb-6 p-3 bg-primary-container/20 border border-primary/20 rounded-xl flex items-center gap-2">
            <AlertCircle className="text-primary w-4 h-4 shrink-0" />
            <p className="text-xs text-on-surface font-sans">
              Prototype Assist: Captured OTP <span className="font-mono bg-white px-2 py-0.5 rounded border border-outline-variant font-bold text-primary">{defaultDebugOtp}</span>
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="w-full mb-6 p-3 bg-error-container/40 border border-error/20 rounded-xl text-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-error shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* OTP Input Row */}
        <div className="flex gap-2 mb-8">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center font-bold text-xl bg-surface-container border border-outline-variant rounded-xl focus:border-primary-container focus:ring-2 focus:ring-primary/10 transition-all outline-none"
            />
          ))}
        </div>

        {/* Timer & Resend */}
        <div className="flex flex-col items-center gap-3 mb-10">
          {timeLeft > 0 ? (
            <div className="text-xs text-on-surface-variant flex items-center gap-1.5 font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>
                Resend in <span className="font-bold text-primary">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
              </span>
            </div>
          ) : (
            <button
              onClick={handleResend}
              className="text-xs font-bold text-primary tracking-wider uppercase hover:underline cursor-pointer"
            >
              Resend Code
            </button>
          )}
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-primary-container text-white py-4 rounded-xl shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3 font-semibold text-base cursor-pointer"
        >
          <span>{loading ? "Verifying..." : "Verify & Proceed"}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </main>

      <footer className="w-full overflow-hidden h-16 relative pointer-events-none opacity-25">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-secondary-container blur-2xl rounded-full translate-y-1/2"></div>
      </footer>
    </div>
  );
}
