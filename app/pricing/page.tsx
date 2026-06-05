"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const startCheckout = (plan: string) => {
    if (!session) {
      router.push("/login");
      return;
    }

    router.push(`/checkout?plan=${plan}`);
  };

  const plans = [
    {
      id: "trial",
      name: "7-Day Trial",
      label: "FREE FOR 7 DAYS",
      price: "£0",
      sub: "today",
      description: "Use Jobify free for 7 days. Cancel anytime before billing starts.",
      button: "Use Free for 7 Days",
      highlight: true,
      trial: true,
      features: [
        "Full CV generator access",
        "Cover letter generator",
        "ATS keyword suggestions",
        "PDF download",
        "£0 today",
        "Cancel anytime before trial ends",
      ],
    },
    {
      id: "basic",
      name: "Basic",
      label: "Student friendly",
      price: "£9.99",
      sub: "per month",
      description: "Perfect for students and active job seekers.",
      button: "Choose Basic",
      highlight: false,
      trial: false,
      features: [
        "30 CV generations/month",
        "30 cover letters/month",
        "ATS optimisation",
        "PDF export",
        "Role-based tailoring",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      label: "Best value",
      price: "£19.99",
      sub: "per month",
      description: "For serious job seekers applying to multiple roles.",
      button: "Go Pro",
      highlight: false,
      trial: false,
      features: [
        "Unlimited CV generations",
        "Unlimited cover letters",
        "Advanced ATS scoring",
        "Priority AI processing",
        "Job description matching",
        "Better role tailoring",
      ],
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-gray-900">

      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-160px] left-[-120px] h-[420px] w-[420px] rounded-full bg-blue-200 blur-[140px] opacity-40" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-purple-200 blur-[160px] opacity-35" />

        <div className="absolute top-16 left-10 text-3xl opacity-10">🚀</div>
        <div className="absolute top-28 right-16 text-3xl opacity-10">💼</div>
        <div className="absolute top-56 left-1/4 text-3xl opacity-10">📄</div>
        <div className="absolute bottom-32 left-16 text-3xl opacity-10">🎯</div>
        <div className="absolute bottom-24 right-20 text-3xl opacity-10">✨</div>
      </div>

      {/* HEADER */}
      <section className="max-w-5xl mx-auto text-center pt-12 px-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-2 text-sm shadow-sm">
          <span>🎁</span>
          <span className="text-green-700 font-semibold">
            Free for 7 days • £0 today • Cancel anytime
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black mt-6 tracking-tight">
          Unlock your full CV package
        </h1>

        <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
          Start free today and access your ATS-optimised CV, personalised cover letter, keyword list, and PDF download.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => startCheckout("trial")}
            className="bg-black text-white px-8 py-3 rounded-2xl font-semibold hover:bg-gray-800 transition shadow-lg"
          >
            Use Free for Now
          </button>

          <button
            onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-white border px-8 py-3 rounded-2xl font-semibold hover:shadow-md transition"
          >
            See All Plans
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Card required for trial. You will not be charged today.
        </p>

        <div className="mt-6 flex justify-center gap-3 flex-wrap text-sm">
          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-2 rounded-full">
            📄 Full CV access
          </span>
          <span className="bg-purple-50 text-purple-700 border border-purple-100 px-4 py-2 rounded-full">
            ✉️ Cover letter
          </span>
          <span className="bg-green-50 text-green-700 border border-green-100 px-4 py-2 rounded-full">
            🎯 ATS keywords
          </span>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section
        id="plans"
        className="max-w-6xl mx-auto px-6 mt-12 grid md:grid-cols-3 gap-6"
      >
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl p-6 transition ${
              plan.highlight
                ? "bg-white border-2 border-green-500 shadow-2xl scale-[1.03]"
                : "bg-white border shadow-sm hover:shadow-xl"
            }`}
          >
            {plan.trial && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg">
                FREE FOR 7 DAYS
              </div>
            )}

            <div
              className={`inline-flex text-xs px-3 py-1 rounded-full font-semibold ${
                plan.trial
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {plan.label}
            </div>

            <h2 className="text-2xl font-bold mt-4">{plan.name}</h2>

            <p className="mt-2 text-sm text-gray-500">
              {plan.description}
            </p>

            <div className="mt-6 flex items-end gap-2">
              <span className="text-4xl font-black">{plan.price}</span>
              <span className="text-sm mb-1 text-gray-500">
                {plan.sub}
              </span>
            </div>

            {plan.trial && (
              <div className="mt-4 rounded-2xl bg-green-50 border border-green-200 p-4">
                <p className="text-sm font-semibold text-green-700">
                  Free for 7 days
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Pay £0 today. After 7 days, it continues at £9.99/month unless cancelled.
                </p>
              </div>
            )}

            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => startCheckout(plan.id)}
              className={`w-full mt-7 py-3 rounded-2xl font-semibold transition ${
                plan.trial
                  ? "bg-green-600 text-white hover:bg-green-700 shadow-lg"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {plan.button}
            </button>
          </div>
        ))}
      </section>

      {/* TRUST SECTION */}
      <section className="max-w-5xl mx-auto px-6 mt-12 grid md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-5 text-center shadow-sm">
          <p className="text-2xl">🔐</p>
          <h3 className="font-bold mt-2">Secure checkout</h3>
          <p className="text-sm text-gray-500 mt-1">
            Your payment is handled through a secure checkout flow.
          </p>
        </div>

        <div className="bg-white border rounded-2xl p-5 text-center shadow-sm">
          <p className="text-2xl">⚡</p>
          <h3 className="font-bold mt-2">Instant access</h3>
          <p className="text-sm text-gray-500 mt-1">
            Unlock your CV and cover letter immediately after checkout.
          </p>
        </div>

        <div className="bg-white border rounded-2xl p-5 text-center shadow-sm">
          <p className="text-2xl">🛑</p>
          <h3 className="font-bold mt-2">Cancel anytime</h3>
          <p className="text-sm text-gray-500 mt-1">
            Cancel before the trial ends and you will not be charged.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 mt-12 pb-16">
        <div className="bg-white border rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold">Common questions</h2>

          <div className="mt-5 space-y-5 text-sm">
            <div>
              <h3 className="font-semibold">Is it really free for 7 days?</h3>
              <p className="text-gray-500 mt-1">
                Yes. You pay £0 today. If you cancel before the 7-day trial ends, you will not be charged.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">What happens after 7 days?</h3>
              <p className="text-gray-500 mt-1">
                If you do not cancel, your trial continues as a paid subscription at £9.99/month.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Why is a card required?</h3>
              <p className="text-gray-500 mt-1">
                A card is required to activate the trial and continue service after the trial period if you choose not to cancel.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">What happens after checkout?</h3>
              <p className="text-gray-500 mt-1">
                You will unlock your full CV, cover letter, ATS keywords, and download options.
              </p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}