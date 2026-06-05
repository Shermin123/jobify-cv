"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const plan = params.get("plan") || "basic";

  const planDetails: Record<
    string,
    {
      name: string;
      price: string;
      note: string;
      button: string;
      badge: string;
    }
  > = {
    trial: {
      name: "7-Day Trial",
      price: "£0 today",
      note: "Demo checkout. This starts a fake 7-day trial for testing. No real payment is taken.",
      button: "Use Free for Now",
      badge: "FREE FOR 7 DAYS",
    },
    basic: {
      name: "Basic",
      price: "£9.99/month",
      note: "Demo checkout. No real payment is taken until Stripe is added.",
      button: "Continue with Basic",
      badge: "MONTHLY PLAN",
    },
    pro: {
      name: "Pro",
      price: "£19.99/month",
      note: "Demo checkout. No real payment is taken until Stripe is added.",
      button: "Continue with Pro",
      badge: "BEST VALUE",
    },
  };

  const selectedPlan = planDetails[plan] || planDetails.basic;

  const handlePayment = () => {
    if (!session) {
      router.push("/login");
      return;
    }

    const subscription = {
      plan,
      planName: selectedPlan.name,
      status: "active",
      demo: true,
      startedAt: new Date().toISOString(),
    };

    localStorage.setItem("jobify_subscription", JSON.stringify(subscription));
    router.push("/upload?unlocked=true");
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-gray-900 overflow-hidden">
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-160px] left-[-120px] h-[420px] w-[420px] rounded-full bg-blue-200 blur-[140px] opacity-40" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-purple-200 blur-[160px] opacity-35" />

        <div className="absolute top-16 left-10 text-3xl opacity-10">🔐</div>
        <div className="absolute top-28 right-16 text-3xl opacity-10">💳</div>
        <div className="absolute top-56 left-1/4 text-3xl opacity-10">📄</div>
        <div className="absolute bottom-32 left-16 text-3xl opacity-10">🎯</div>
        <div className="absolute bottom-24 right-20 text-3xl opacity-10">✨</div>
      </div>

      <section className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_0.9fr] gap-6 items-center">
          {/* TRUST SIDE */}
          <div className="bg-black text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute right-8 top-8 text-8xl opacity-10">
              🔐
            </div>

            <div className="inline-flex bg-white/10 px-4 py-2 rounded-full text-sm">
              Demo checkout
            </div>

            <h1 className="text-4xl md:text-5xl font-black mt-6 leading-tight">
              Unlock your CV package safely
            </h1>

            <p className="text-white/70 mt-4 max-w-xl">
              This is a test checkout for your MVP. No real payment is taken. It only unlocks the app flow.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mt-8">
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl">🔒</p>
                <h3 className="font-bold mt-2">Safe</h3>
                <p className="text-xs text-white/60 mt-1">
                  No real payment now
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl">⚡</p>
                <h3 className="font-bold mt-2">Instant</h3>
                <p className="text-xs text-white/60 mt-1">
                  Unlock immediately
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl">🧪</p>
                <h3 className="font-bold mt-2">Demo</h3>
                <p className="text-xs text-white/60 mt-1">
                  Stripe added later
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-5 text-sm text-white/60">
              Jobify never sells your CV data. This demo checkout only saves a local test subscription in your browser.
            </div>
          </div>

          {/* CHECKOUT CARD */}
          <div className="bg-white border rounded-3xl p-7 shadow-xl">
            <div className="text-center">
              <div className="inline-flex bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-full text-xs font-bold">
                {selectedPlan.badge}
              </div>

              <h2 className="text-3xl font-bold mt-5">
                Checkout
              </h2>

              <p className="text-gray-500 mt-2">
                You selected{" "}
                <span className="font-semibold text-black">
                  {selectedPlan.name}
                </span>
              </p>
            </div>

            <div className="mt-6 bg-slate-50 border rounded-2xl p-5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedPlan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedPlan.note}</p>
                </div>

                <p className="text-2xl font-black text-right">
                  {selectedPlan.price}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-gray-600">
              <p>✓ Unlock full AI-generated CV</p>
              <p>✓ Unlock personalised cover letter</p>
              <p>✓ View ATS keywords</p>
              <p>✓ Continue your app flow</p>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <h3 className="font-semibold text-blue-700">
                🔐 Demo mode notice
              </h3>
              <p className="text-xs text-blue-700 mt-1">
                No card is required here. No real payment will be taken. Stripe can be connected later.
              </p>
            </div>

            <button
              onClick={handlePayment}
              className="w-full mt-6 bg-black text-white py-3 rounded-2xl font-semibold hover:bg-gray-800 transition"
            >
              {selectedPlan.button}
            </button>

            <button
              onClick={() => router.push("/pricing")}
              className="w-full mt-3 border py-3 rounded-2xl font-semibold hover:bg-gray-50 transition"
            >
              Back to plans
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center text-gray-500">
          Loading checkout...
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}