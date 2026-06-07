"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ResetPasswordContent() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
  }, []);

  const handleResetPassword = async () => {
    if (!token) {
      setError("Reset link is missing or invalid");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Could not reset password");
        setLoading(false);
        return;
      }

      setMessage("Password updated successfully. Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
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
        <div className="absolute bottom-28 left-20 text-4xl opacity-10">✅</div>
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
            Reset password
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter your new password below.
          </p>
        </div>

        {!token && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            Reset link is missing or invalid.
          </div>
        )}

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
            placeholder="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            placeholder="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            onClick={handleResetPassword}
            disabled={loading || !token}
            className="w-full rounded-2xl bg-slate-950 py-4 font-black text-white shadow-lg transition hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Updating password..." : "Update password"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Back to{" "}
          <Link
            href="/login"
            className="font-black text-blue-600 hover:text-blue-700"
          >
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center text-slate-500">
          Loading reset page...
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}