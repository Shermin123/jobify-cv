"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import EmojiBackground from "@/app/components/EmojiBackground";

function normalizePricingRegion(country: string) {
  const value = String(country || "").trim().toUpperCase();

  const ukCountries = [
    "UK",
    "GB",
    "UNITED KINGDOM",
    "ENGLAND",
    "SCOTLAND",
    "WALES",
    "NORTHERN IRELAND",
  ];

  const lowPriceCountries = [
    "LOW",

    // South Asia
    "IN",
    "INDIA",
    "PK",
    "PAKISTAN",
    "BD",
    "BANGLADESH",
    "LK",
    "SRI LANKA",
    "NP",
    "NEPAL",

    // Southeast Asia
    "PH",
    "PHILIPPINES",
    "ID",
    "INDONESIA",
    "VN",
    "VIETNAM",
    "KH",
    "CAMBODIA",
    "MM",
    "MYANMAR",

    // Africa
    "NG",
    "NIGERIA",
    "KE",
    "KENYA",
    "GH",
    "GHANA",
    "UG",
    "UGANDA",
    "TZ",
    "TANZANIA",
    "ZA",
    "SOUTH AFRICA",

    // Other price-sensitive markets
    "EG",
    "EGYPT",
    "MA",
    "MOROCCO",
    "TR",
    "TURKEY",
  ];

  if (ukCountries.includes(value)) return "UK";
  if (lowPriceCountries.includes(value)) return "LOW";

  return "DEFAULT";
}

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);

  const plan = params.get("plan") || "basic";
  const rawCountry = params.get("country") || "UK";
  const country = normalizePricingRegion(rawCountry);

  const pricingByCountry: Record<
    string,
    {
      countryLabel: string;
      trial: string;
      basic: string;
      pro: string;
    }
  > = {
    UK: {
      countryLabel: "United Kingdom",
      trial: "£0 today",
      basic: "£9.99/month",
      pro: "£19.99/month",
    },
    LOW: {
      countryLabel: "Starter pricing region",
      trial: "£0 today",
      basic: "£1.99/month",
      pro: "£4.99/month",
    },
    DEFAULT: {
      countryLabel: "Other countries",
      trial: "£0 today",
      basic: "£4.99/month",
      pro: "£9.99/month",
    },
  };

  const selectedPricing =
    pricingByCountry[country] || pricingByCountry.DEFAULT;

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
      price: selectedPricing.trial,
      note: "Start your free trial. Stripe will securely manage your subscription.",
      button: "Start Free Trial",
      badge: "FREE FOR 7 DAYS",
    },
    basic: {
      name: "Basic",
      price: selectedPricing.basic,
      note: "Perfect for students and active job seekers.",
      button: "Continue to Secure Checkout",
      badge: "MONTHLY PLAN",
    },
    pro: {
      name: "Pro",
      price: selectedPricing.pro,
      note: "Best for serious job seekers applying to multiple roles.",
      button: "Continue to Secure Checkout",
      badge: "BEST VALUE",
    },
  };

  const selectedPlan = planDetails[plan] || planDetails.basic;

  const handlePayment = async () => {
    if (!session?.user?.email) {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          email: session.user.email,
          country,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Stripe checkout failed");
        setLoading(false);
        return;
      }

      if (!data?.url) {
        alert("Stripe checkout URL was not returned.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      alert("Something went wrong opening Stripe checkout.");
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-gray-900 overflow-hidden">
      <EmojiBackground />

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
          <div className="bg-black text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute right-8 top-8 text-8xl opacity-10">
              🔐
            </div>

            <div className="inline-flex bg-white/10 px-4 py-2 rounded-full text-sm">
              Secure Stripe checkout
            </div>

            <h1 className="text-4xl md:text-5xl font-black mt-6 leading-tight">
              Unlock your CV package safely
            </h1>

            <p className="text-white/70 mt-4 max-w-xl">
              Your payment is processed securely by Stripe. Jobify does not
              store your card details.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mt-8">
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl">🔒</p>
                <h3 className="font-bold mt-2">Secure</h3>
                <p className="text-xs text-white/60 mt-1">
                  Stripe protected
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl">⚡</p>
                <h3 className="font-bold mt-2">Instant</h3>
                <p className="text-xs text-white/60 mt-1">
                  Unlock after payment
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl">📄</p>
                <h3 className="font-bold mt-2">Ready</h3>
                <p className="text-xs text-white/60 mt-1">
                  CV and letter access
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-5 text-sm text-white/60">
              Your CV data is used to generate your documents and is never sold.
            </div>
          </div>

          <div className="bg-white border rounded-3xl p-7 shadow-xl">
            <div className="text-center">
              <div className="inline-flex bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-full text-xs font-bold">
                {selectedPlan.badge}
              </div>

              <h2 className="text-3xl font-bold mt-5">Checkout</h2>

              <p className="text-gray-500 mt-2">
                You selected{" "}
                <span className="font-semibold text-black">
                  {selectedPlan.name}
                </span>
              </p>

              <p className="mt-2 text-xs font-bold text-blue-600">
                Region: {selectedPricing.countryLabel}
              </p>
            </div>

            <div className="mt-6 bg-slate-50 border rounded-2xl p-5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedPlan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedPlan.note}
                  </p>
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
              <p>✓ Download PDF documents</p>
              <p>✓ Access saved documents</p>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <h3 className="font-semibold text-blue-700">
                🔐 Secure payment
              </h3>
              <p className="text-xs text-blue-700 mt-1">
                You will be redirected to Stripe Checkout to complete your
                payment securely.
              </p>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full mt-6 bg-black text-white py-3 rounded-2xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Opening secure checkout..." : selectedPlan.button}
            </button>

            <button
              onClick={() => router.push("/pricing")}
              disabled={loading}
              className="w-full mt-3 border py-3 rounded-2xl font-semibold hover:bg-gray-50 transition disabled:opacity-50"
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