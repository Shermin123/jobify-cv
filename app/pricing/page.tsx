"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import EmojiBackground from "@/app/components/EmojiBackground";

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [upgrade, setUpgrade] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUpgrade(params.get("upgrade"));
  }, []);

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
      description:
        "Try Jobify with full access before paying. Perfect for testing your first CV and cover letter.",
      button: "Use Free for 7 Days",
      highlight: true,
      trial: true,
      features: [
        "Full CV generator access",
        "Generate tailored cover letters",
        "ATS keyword suggestions included",
        "CV score checker included",
        "Download your CV as PDF",
        "Try before paying",
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
      description:
        "Best for students and job seekers applying to a few roles each month.",
      button: "Choose Basic",
      highlight: false,
      trial: false,
      features: [
        "30 CV generations per month",
        "30 cover letters per month",
        "ATS optimisation for each CV",
        "Keyword suggestions for job descriptions",
        "CV score checker access",
        "PDF export included",
        "Role-based CV tailoring",
        "Good for part-time, graduate, and entry-level jobs",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      label: "Best value",
      price: "£19.99",
      sub: "per month",
      description:
        "For serious job seekers who want unlimited AI generation plus a full Pro document editor to customise, polish, and export final CVs and cover letters.",
      button: "Go Pro",
      highlight: true,
      trial: false,
      features: [
        "Unlimited CV generations",
        "Unlimited cover letters",
        "Advanced ATS optimisation",
        "Document Editor included",
        "AI Polish, Grammar Fix, and ATS Improve",
        "PDF and DOCX export",
        "Autosave while editing",
      ],
    },
  ];

  const companies = [
    {
      name: "Google",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    },
    {
      name: "Amazon",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    },
    {
      name: "Microsoft",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    },
    {
      name: "NHS",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d3/National_Health_Service_%28England%29_logo.svg",
    },
    {
      name: "Tesco",
      logo: "https://upload.wikimedia.org/wikipedia/en/b/b0/Tesco_Logo.svg",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-gray-900">
      <EmojiBackground />

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-180px] left-[-130px] h-[420px] w-[420px] rounded-full bg-blue-200 blur-[140px] opacity-40" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-purple-200 blur-[160px] opacity-35" />

        <div className="absolute top-16 left-10 text-3xl opacity-10">🚀</div>
        <div className="absolute top-28 right-16 text-3xl opacity-10">💼</div>
        <div className="absolute top-56 left-1/4 text-3xl opacity-10">📄</div>
        <div className="absolute bottom-32 left-16 text-3xl opacity-10">🎯</div>
        <div className="absolute bottom-24 right-20 text-3xl opacity-10">✨</div>
      </div>

      {/* HEADER */}
      <section className="max-w-6xl mx-auto text-center pt-6 px-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-2 text-xs md:text-sm shadow-sm">
          <span>🎁</span>
          <span className="text-green-700 font-bold">
            Free for 7 days • £0 today • Cancel anytime
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black mt-4 tracking-tight">
          Unlock your full CV package
        </h1>

        <p className="text-gray-500 mt-3 max-w-2xl mx-auto text-sm md:text-base">
          Start free today and access your ATS-optimised CV, personalised cover
          letter, keyword list, and PDF download.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => startCheckout("trial")}
            className="bg-black text-white px-7 py-3 rounded-2xl font-bold hover:bg-gray-800 transition shadow-lg"
          >
            Use Free for Now
          </button>

          <button
            onClick={() =>
              document.getElementById("plans")?.scrollIntoView({
                behavior: "smooth",
              })
            }
            className="bg-white border px-7 py-3 rounded-2xl font-bold hover:shadow-md transition"
          >
            See All Plans
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Card required for trial. You will not be charged today.
        </p>
      </section>

      {/* COMPACT COMPANY LOGOS */}
      <section className="max-w-5xl mx-auto px-6 mt-5">
        <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-black text-slate-900">
                Our customers are hired and working here
              </p>
              <p className="text-[11px] text-slate-500">
                Stronger CVs for competitive roles.
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-end gap-2">
              {companies.map((company) => (
                <div
                  key={company.name}
                  className="group flex h-9 w-24 items-center justify-center rounded-xl border border-slate-100 bg-white px-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="max-h-4 max-w-[74px] object-contain transition duration-300 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section
        id="plans"
        className="max-w-6xl mx-auto px-6 mt-7 grid md:grid-cols-3 gap-5"
      >
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl p-5 transition ${
              plan.id === "pro"
                ? "bg-slate-950 text-white border-2 border-blue-500 shadow-2xl md:scale-[1.03]"
                : plan.highlight
                ? "bg-white border-2 border-green-500 shadow-2xl md:scale-[1.02]"
                : "bg-white border shadow-sm hover:shadow-xl"
            }`}
          >
            {plan.trial && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg">
                FREE FOR 7 DAYS
              </div>
            )}

            <div
              className={`inline-flex text-xs px-3 py-1 rounded-full font-bold ${
                plan.trial
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {plan.label}
            </div>

            <h2 className="text-2xl font-black mt-4">{plan.name}</h2>

            <p
              className={`mt-2 text-sm ${
                plan.id === "pro" ? "text-white/60" : "text-gray-500"
              }`}
            >
              {plan.description}
            </p>

            <div
              className={`mt-4 rounded-2xl border p-3 ${
                plan.id === "pro"
                  ? "bg-white/10 border-white/10"
                  : "bg-slate-50 border-slate-100"
              }`}
            >
              <p
                className={`text-xs font-black ${
                  plan.id === "pro" ? "text-blue-300" : "text-slate-900"
                }`}
              >
                {plan.id === "trial"
                  ? "Try the full CV builder before paying."
                  : plan.id === "basic"
                  ? "Best if you are applying to a few jobs each month."
                  : "Best if you are actively applying to multiple jobs."}
              </p>

              <p
                className={`mt-1 text-xs leading-5 ${
                  plan.id === "pro" ? "text-white/60" : "text-slate-500"
                }`}
              >
                {plan.id === "trial"
                  ? "Generate your CV, cover letter, keywords, and PDF during the trial. Cancel before 7 days and pay £0."
                  : plan.id === "basic"
                  ? "Create stronger applications without rewriting your CV manually for every role."
                  : "Generate unlimited tailored CVs and cover letters, then edit them in the Pro Document Editor with AI tools, formatting, PDF export, and DOCX export."}
              </p>
            </div>

            {plan.id === "pro" && upgrade === "pro" && (
              <div className="mt-4 rounded-2xl border border-blue-400/30 bg-blue-500/10 p-3">
                <p className="text-sm font-black text-blue-300">
                  Pro required for File Editor
                </p>
                <p className="mt-1 text-xs text-white/70">
                  Subscribe to Pro to unlock document editing, AI polish tools,
                  and PDF/DOCX export.
                </p>
              </div>
            )}

            <div className="mt-5 flex items-end gap-2">
              <span className="text-4xl font-black">{plan.price}</span>
              <span
                className={`text-sm mb-1 ${
                  plan.id === "pro" ? "text-white/50" : "text-gray-500"
                }`}
              >
                {plan.sub}
              </span>
            </div>

            {plan.trial && (
              <div className="mt-4 rounded-2xl bg-green-50 border border-green-200 p-3">
                <p className="text-sm font-bold text-green-700">
                  Free for 7 days
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Pay £0 today. Then £9.99/month unless cancelled.
                </p>
              </div>
            )}

            <ul
              className={`mt-5 space-y-2 text-sm ${
                plan.id === "pro" ? "text-white/75" : "text-gray-600"
              }`}
            >
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="text-green-600 font-black">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => startCheckout(plan.id)}
              className={`w-full mt-6 py-3 rounded-2xl font-bold transition ${
                plan.id === "pro"
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                  : plan.trial
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
      <section className="max-w-5xl mx-auto px-6 mt-10 grid md:grid-cols-3 gap-4">
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
      <section className="max-w-3xl mx-auto px-6 mt-10 pb-16">
        <div className="bg-white border rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold">Common questions</h2>

          <div className="mt-5 space-y-5 text-sm">
            <div>
              <h3 className="font-semibold">Is it really free for 7 days?</h3>
              <p className="text-gray-500 mt-1">
                Yes. You pay £0 today. If you cancel before the 7-day trial
                ends, you will not be charged.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">What happens after 7 days?</h3>
              <p className="text-gray-500 mt-1">
                If you do not cancel, your trial continues as a paid
                subscription at £9.99/month.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Why is a card required?</h3>
              <p className="text-gray-500 mt-1">
                A card is required to activate the trial and continue service
                after the trial period if you choose not to cancel.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">
                Is the Pro Document Editor included in Basic?
              </h3>
              <p className="text-gray-500 mt-1">
                No. The Pro Document Editor is included only in the Pro plan.
                Basic users can generate and download CVs, but advanced editing
                tools are Pro-only.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">What happens after checkout?</h3>
              <p className="text-gray-500 mt-1">
                You will unlock your full CV, cover letter, ATS keywords, and
                available download options based on your plan.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}