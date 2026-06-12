"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EmojiBackground from "@/app/components/EmojiBackground";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const getSafeCallbackUrl = () => {
    if (typeof window === "undefined") return "/dashboard";

    try {
      const params = new URLSearchParams(window.location.search);
      const fromQuery = params.get("callbackUrl");

      let savedRedirect = "";
      try {
        savedRedirect = sessionStorage.getItem("redirect_after_login") || "";
      } catch {
        savedRedirect = "";
      }

      const fallback = "/dashboard";
      const rawCallback = fromQuery || savedRedirect || fallback;

      let safePath = fallback;

      if (rawCallback.startsWith("/")) {
        safePath = rawCallback;
      } else {
        const parsed = new URL(rawCallback);
        if (parsed.origin === window.location.origin) {
          safePath = `${parsed.pathname}${parsed.search}`;
        }
      }

      if (
        safePath.startsWith("/login") ||
        safePath.startsWith("/signup") ||
        safePath.startsWith("/api/auth")
      ) {
        return fallback;
      }

      return safePath;
    } catch {
      return "/dashboard";
    }
  };

  const getAbsoluteCallbackUrl = () => {
    if (typeof window === "undefined") return "/dashboard";

    const safePath = getSafeCallbackUrl();
    return `${window.location.origin}${safePath}`;
  };

  useEffect(() => {
  if (status === "authenticated") {
    router.replace("/dashboard");
  }
}, [status, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    const redirectTo = getSafeCallbackUrl();

    try {
      const res = await signIn("credentials", {
        email,
        password,
        callbackUrl: redirectTo,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.replace(res?.url || redirectTo);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
  setGoogleLoading(true);
  setError("");

  try {
    await signIn("google", {
      callbackUrl: "/dashboard",
      redirect: true,
    });
  } catch {
    setGoogleLoading(false);
    setError("Google login failed. Please try again.");
  }
};

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <main className="relative flex min-h-screen items-start justify-center overflow-hidden px-4 pb-10 pt-6 md:items-center md:py-10">
      <EmojiBackground />

      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 animate-gradient" />

      <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] animate-pulse rounded-full bg-blue-400 opacity-30 blur-3xl" />
      <div className="absolute bottom-[-140px] right-[-140px] h-[360px] w-[360px] animate-pulse rounded-full bg-pink-300 opacity-30 blur-3xl" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-10 top-10 text-3xl opacity-10">🚀</div>
        <div className="absolute right-20 top-20 text-2xl opacity-10">💼</div>
        <div className="absolute left-1/4 top-40 text-3xl opacity-10">📄</div>
        <div className="absolute right-1/3 top-52 text-2xl opacity-10">✨</div>
        <div className="absolute left-16 top-72 text-3xl opacity-10">🎯</div>
        <div className="absolute right-12 top-96 text-2xl opacity-10">🤖</div>
        <div className="absolute bottom-32 left-12 text-3xl opacity-10">🌍</div>
        <div className="absolute bottom-24 right-20 text-2xl opacity-10">💻</div>
        <div className="absolute bottom-16 left-1/3 text-3xl opacity-10">📋</div>
        <div className="absolute bottom-10 right-1/2 text-2xl opacity-10">⭐</div>
      </div>

      <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-10">
        <div className="space-y-5 text-center text-white md:space-y-6 md:text-left">
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl md:text-6xl">
            Build a CV that gets you
            <span className="block text-yellow-300">HIRED faster 🚀</span>
          </h1>

          <p className="mx-auto max-w-md text-base text-white/80 md:mx-0 md:text-xl">
            Jobify.cv uses AI to optimize your CV for ATS systems, keywords,
            and recruiter matching — instantly.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
            <div className="rounded-lg bg-white/20 px-4 py-2 text-sm">
              ⚡ 94% Interview Success
            </div>
            <div className="rounded-lg bg-white/20 px-4 py-2 text-sm">
              🌍 180+ Countries
            </div>
            <div className="rounded-lg bg-white/20 px-4 py-2 text-sm">
              📄 2.4M CVs Generated
            </div>
          </div>

          <p className="hidden text-sm text-white/70 md:block">
            Join thousands of job seekers upgrading their careers with AI.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="space-y-5 rounded-3xl border border-white/40 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="space-y-1 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Login</h2>
              <p className="text-sm text-gray-500">
                Access your Jobify dashboard
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <input
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <div className="relative">
              <input
                className="w-full rounded-xl border border-gray-300 bg-white p-3 pr-20 text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-sm font-medium text-gray-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading || googleLoading}
              className="w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-300" />
              <span className="text-xs text-gray-500">OR</span>
              <div className="h-px flex-1 bg-gray-300" />
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3 font-semibold text-gray-900 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                className="h-5"
                alt="Google"
              />
              {googleLoading ? "Opening Google..." : "Continue with Google"}
            </button>

            <div className="space-y-3 text-center">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-sm font-semibold text-purple-600 hover:text-purple-700"
              >
                Forgot password?
              </button>

              <p className="text-sm text-gray-600">
                New to Jobify?{" "}
                <Link
                  href="/signup"
                  className="font-black text-blue-600 hover:text-blue-700"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-gradient {
          background-size: 400% 400%;
          animation: gradientMove 12s ease infinite;
        }

        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </main>
  );
}