"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const redirectTo =
  sessionStorage.getItem("redirect_after_login") || "/upload";

router.push(redirectTo);
    }
  }, [status, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/upload",
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } 
    } catch {
      setError("Something went wrong");
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/upload" });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">

      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 animate-gradient" />

      <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-blue-400 blur-3xl opacity-30 rounded-full animate-pulse" />
      <div className="absolute bottom-[-140px] right-[-140px] w-[360px] h-[360px] bg-pink-300 blur-3xl opacity-30 rounded-full animate-pulse" />

      {/* ================= CONTAINER ================= */}
      <div className="relative w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

        {/* ================= LEFT: LANDING SECTION ================= */}
        <div className="text-white text-center md:text-left space-y-6">

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Build a CV that gets you
            <span className="block text-yellow-300">HIRED faster 🚀</span>
          </h1>

          <p className="text-white/80 text-lg md:text-xl max-w-md">
            Jobify.cv uses AI to optimize your CV for ATS systems, keywords,
            and recruiter matching — instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <div className="bg-white/20 px-4 py-2 rounded-lg text-sm">
              ⚡ 94% Interview Success
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg text-sm">
              🌍 180+ Countries
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg text-sm">
              📄 2.4M CVs Generated
            </div>
          </div>

          <p className="text-white/70 text-sm hidden md:block">
            Join thousands of job seekers upgrading their careers with AI.
          </p>
        </div>

        {/* ================= RIGHT: LOGIN CARD ================= */}
        <div className="w-full max-w-md mx-auto">

          <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-5">

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-gray-900">
                Login
              </h2>
              <p className="text-sm text-gray-500">
                Access your Jobify dashboard
              </p>
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <input
              className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <div className="relative">
              <input
                className="w-full border border-gray-300 p-3 rounded-xl pr-20 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-sm text-gray-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-xs text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full border border-gray-300 py-3 rounded-xl hover:bg-white/70 transition"
            >
              Continue with Google
            </button>

            <p className="text-xs text-center text-gray-600">
              Demo: test@jobify.cv / 123456
            </p>
          </div>
        </div>
      </div>
{/* Small Floating Emojis */}

<div className="absolute top-10 left-10 text-3xl opacity-10">🚀</div>
<div className="absolute top-20 right-20 text-2xl opacity-10">💼</div>
<div className="absolute top-40 left-1/4 text-3xl opacity-10">📄</div>
<div className="absolute top-52 right-1/3 text-2xl opacity-10">✨</div>
<div className="absolute top-72 left-16 text-3xl opacity-10">🎯</div>
<div className="absolute top-96 right-12 text-2xl opacity-10">🤖</div>

<div className="absolute top-[20%] left-[60%] text-3xl opacity-10">💡</div>
<div className="absolute top-[25%] left-[80%] text-2xl opacity-10">🔥</div>
<div className="absolute top-[35%] left-[10%] text-3xl opacity-10">📈</div>
<div className="absolute top-[45%] left-[75%] text-2xl opacity-10">⚡</div>

<div className="absolute top-[50%] left-[20%] text-3xl opacity-10">🌟</div>
<div className="absolute top-[55%] left-[50%] text-2xl opacity-10">🏆</div>
<div className="absolute top-[60%] right-[15%] text-3xl opacity-10">💰</div>

<div className="absolute top-[70%] left-[5%] text-2xl opacity-10">🧠</div>
<div className="absolute top-[72%] left-[40%] text-3xl opacity-10">📊</div>
<div className="absolute top-[78%] right-[30%] text-2xl opacity-10">🎓</div>

<div className="absolute bottom-32 left-12 text-3xl opacity-10">🌍</div>
<div className="absolute bottom-24 right-20 text-2xl opacity-10">💻</div>
<div className="absolute bottom-16 left-1/3 text-3xl opacity-10">📋</div>
<div className="absolute bottom-10 right-1/2 text-2xl opacity-10">⭐</div>

      {/* ================= ANIMATION ================= */}
      <style jsx>{`
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
        @keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.25s ease-out;
}    
      `}</style>

    </main>
  );
}