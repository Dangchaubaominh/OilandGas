import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    // TODO: Gọi API khi backend hoàn thiện
    // await authApi.forgotPassword({ email });

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4 font-sans">
      <div className="flex flex-col md:flex-row w-full max-w-[900px] min-h-[520px] bg-[#161a23] rounded-[32px] overflow-hidden shadow-2xl">

        {/* --- CỘT TRÁI: Branding --- */}
        <div className="w-full md:w-1/2 bg-[#2545b8] p-10 flex flex-col justify-center items-center text-center">
          <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-[#2545b8] font-bold text-2xl italic tracking-tight">OG</span>
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">Oil & Gas Analyzer</h1>
          <p className="text-blue-200/80 text-sm italic mb-12">
            Enterprise Monitoring & Control System
          </p>
          <div className="space-y-4 text-left w-full max-w-[280px]">
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
              <span className="text-sm opacity-90">Secure password recovery</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
              <span className="text-sm opacity-90">Reset link expires in 15 minutes</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
              <span className="text-sm opacity-90">Contact admin if email not found</span>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: Form --- */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center relative">
          {/* Back to login */}
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm transition-colors mb-8 w-fit"
          >
            <ArrowLeft size={15} />
            Back to Login
          </Link>

          {!submitted ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                  <KeyRound size={22} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Forgot Password?</h2>
                <p className="text-gray-500 text-sm">
                  Enter your registered email. We'll send a reset link if the account exists.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-gray-300 text-xs font-medium ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john.davis@oilgas.com"
                      required
                      className="w-full bg-[#1e2330] border border-gray-700 text-white text-sm rounded-xl px-4 py-3 pl-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              {/* Note */}
              <p className="text-gray-600 text-xs text-center mt-6">
                Don't have access to your email?{" "}
                <span className="text-blue-500">Contact your administrator.</span>
              </p>
            </>
          ) : (
            /* --- Trạng thái đã gửi (Success State) --- */
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm mb-1">
                If <span className="text-white font-medium">{email}</span> is registered,
              </p>
              <p className="text-gray-500 text-sm mb-8">
                a password reset link has been sent.
              </p>

              <div className="bg-[#1e2330] border border-gray-700 rounded-xl p-4 text-left w-full mb-6 space-y-2">
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  Check your inbox and spam folder
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  The link expires in <span className="text-white">15 minutes</span>
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  Do not share this link with anyone
                </p>
              </div>

              <button
                onClick={() => { setSubmitted(false); setEmail(""); }}
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                Try a different email
              </button>

              <Link
                to="/login"
                className="mt-4 w-full text-center py-3 bg-[#1e2330] hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white text-sm rounded-xl transition-colors"
              >
                Back to Login
              </Link>
            </div>
          )}

          {/* Footer */}
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-gray-700 text-[10px]">
              Version 2.1.4 • © 2024 Oil & Gas Systems Inc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
