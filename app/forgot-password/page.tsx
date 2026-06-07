"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendReset = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Could not send reset email");
        setLoading(false);
        return;
      }

      setMessage("If an account exists, a reset link has been sent to your email.");
    } catch {
      setError("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-slate-50 to-white px-4 py-10 text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-100 blur-3xl opacity-80" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-100 blur-3xl opacity-80" />
        <div className="absolute top-24 right-16 text-4xl opacity-10">🔐</div>
        <div className="absolute bottom-28 left-20 text-4xl opacity-10">📩</div>
        <div className="absolute top-1/2 right-1/4 text-4xl opacity-10">✨</div>
      </div>

      <div className="w-full max-w-md rounded-[2rem] border bg-white p-6 shadow-2xl sm:p-8 animate-cardIn">
        <Link href="/" className="mx-auto flex w-fit items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white font-black shadow-lg">
            J
          </div>
          <div className="text-left leading-tight">
            <p className="text-xl font-black">
              <span>Job</span>
              <span className="text-blue-600">ify</span>
              <span className="text-slate-400">.cv</span>
            </p>
            <p className="text-xs font-semibold text-slate-400">
              AI CV Builder
            </p>
          </div>
        </Link>

        <div className="mt-8 text-center">
          <h1 className="text-3xl font-black text-slate-950">
            Forgot password?
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter your email and we’ll send you a secure link to reset your password.
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
            {message}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            onClick={handleSendReset}
            disabled={loading}
            className="w-full rounded-2xl bg-slate-950 py-4 font-black text-white shadow-lg transition hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Sending reset link..." : "Send reset link"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Remember your password?{" "}
          <Link href="/login" className="font-black text-blue-600 hover:text-blue-700">
            Login
          </Link>
        </p>
      </div>

      <style jsx>{`
        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-cardIn {
          animation: cardIn 0.45s ease-out;
        }
      `}</style>
    </main>
  );
}