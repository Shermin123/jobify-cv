"use client";

import { useState } from "react";

const withoutJobify = {
  score: 46,
  label: "Without Jobify",
  status: "Needs Improvement",
  summary: "Hard-working manager with good communication skills.",
  experience: [
    "Helped the team with daily tasks",
    "Worked on different projects",
    "Responsible for planning",
  ],
  skills: ["Team Player", "Hard Working", "Communication"],
};

const withJobify = {
  score: 92,
  label: "With Jobify",
  status: "ATS Ready",
  summary:
    "Results-driven Product Manager with experience in product strategy, analytics, and cross-functional leadership.",
  experience: [
    "Led a team of 12 people to deliver product initiatives",
    "Improved project delivery speed by 28%",
    "Increased product adoption by 19%",
  ],
  skills: [
    "Product Strategy",
    "Data Analysis",
    "Roadmap Planning",
    "Leadership",
  ],
};

export default function AtsCvTransform() {
  const [isOptimised, setIsOptimised] = useState(false);

  const cv = isOptimised ? withJobify : withoutJobify;

  const toggleOptimised = () => {
    setIsOptimised((current) => !current);
  };

  return (
    <section className="relative mx-auto w-full max-w-[460px]">
      {/* TITLE */}
      <div className="mb-3 flex items-center justify-between gap-3 text-left">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
            CV Transformation
          </p>

          <p className="mt-1 text-xs font-bold text-slate-600">
            Hover or tap to see the difference
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black text-white shadow-sm transition-all duration-500 ${
            isOptimised
              ? "bg-gradient-to-r from-emerald-500 to-blue-600"
              : "bg-gradient-to-r from-orange-500 to-red-500"
          }`}
        >
          {cv.status}
        </span>
      </div>

      {/* INTERACTIVE AREA */}
      <button
        type="button"
        onMouseEnter={() => setIsOptimised(true)}
        onMouseLeave={() => setIsOptimised(false)}
        onClick={toggleOptimised}
        aria-label="Compare a CV before and after using Jobify"
        aria-pressed={isOptimised}
        className="block w-full cursor-pointer rounded-[24px] text-left outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
      >
        {/* COMPARISON TABS */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div
            className={`rounded-xl border px-2 py-2 text-center transition-all duration-500 ${
              !isOptimised
                ? "scale-[1.02] border-orange-300 bg-gradient-to-r from-orange-100 to-red-100 shadow-md"
                : "border-slate-200 bg-white opacity-50"
            }`}
          >
            <p className="text-[9px] font-black uppercase tracking-wide text-orange-700">
              Without Jobify
            </p>

            <p className="mt-0.5 text-[10px] font-bold text-slate-600">
              Generic CV
            </p>
          </div>

          <div
            className={`rounded-xl border px-2 py-2 text-center transition-all duration-500 ${
              isOptimised
                ? "scale-[1.02] border-emerald-300 bg-gradient-to-r from-emerald-100 to-blue-100 shadow-md"
                : "border-slate-200 bg-white opacity-50"
            }`}
          >
            <p className="text-[9px] font-black uppercase tracking-wide text-emerald-700">
              With Jobify
            </p>

            <p className="mt-0.5 text-[10px] font-bold text-slate-600">
              ATS-ready CV
            </p>
          </div>
        </div>

        {/* CV CARD */}
        <div
          className={`relative mx-auto overflow-hidden rounded-[22px] border-2 p-4 shadow-xl transition-all duration-700 ${
            isOptimised
              ? "rotate-0 scale-[1.01] border-blue-300 bg-gradient-to-br from-white via-blue-50 to-purple-50"
              : "-rotate-1 border-orange-200 bg-gradient-to-br from-white via-orange-50 to-red-50"
          }`}
        >
          {/* BACKGROUND GLOWS */}
          <div
            className={`pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full blur-3xl transition-all duration-700 ${
              isOptimised ? "bg-blue-300/40" : "bg-orange-300/40"
            }`}
          />

          <div
            className={`pointer-events-none absolute -bottom-14 -left-14 h-32 w-32 rounded-full blur-3xl transition-all duration-700 ${
              isOptimised ? "bg-purple-300/40" : "bg-red-300/30"
            }`}
          />

          <div className="relative">
            {/* PROFILE AND SCORE */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white shadow-md transition-all duration-700 ${
                    isOptimised
                      ? "rotate-0 bg-gradient-to-br from-blue-600 to-purple-600"
                      : "-rotate-6 bg-gradient-to-br from-orange-500 to-red-500"
                  }`}
                >
                  JD
                </div>

                <div className="min-w-0 text-left">
                  <h3 className="truncate text-base font-black text-slate-950">
                    Jane Doe
                  </h3>

                  <p className="truncate text-[10px] font-semibold text-slate-500">
                    Senior Product Manager
                  </p>
                </div>
              </div>

              <div
                className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border-[5px] bg-white shadow-md transition-all duration-700 ${
                  isOptimised
                    ? "scale-105 border-emerald-500"
                    : "border-orange-400"
                }`}
              >
                <span className="text-xl font-black leading-none text-slate-950">
                  {cv.score}
                </span>

                <span className="mt-0.5 text-[7px] font-black uppercase text-slate-400">
                  ATS Score
                </span>
              </div>
            </div>

            {/* STATUS */}
            <div
              className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-[10px] font-black text-white shadow-sm transition-all duration-700 ${
                isOptimised
                  ? "bg-gradient-to-r from-emerald-500 to-blue-600"
                  : "bg-gradient-to-r from-orange-500 to-red-500"
              }`}
            >
              {cv.label}
            </div>

            {/* SUMMARY */}
            <div className="mt-4 text-left">
              <h4 className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                Professional Summary
              </h4>

              <p
                className={`mt-2 rounded-xl p-2.5 text-[11px] font-semibold leading-5 transition-all duration-700 ${
                  isOptimised
                    ? "translate-x-0 bg-blue-100/80 text-slate-700"
                    : "translate-x-1 bg-orange-100/70 text-slate-500"
                }`}
              >
                {cv.summary}
              </p>
            </div>

            {/* EXPERIENCE */}
            <div className="mt-4 text-left">
              <h4 className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                Experience
              </h4>

              <div className="mt-2 space-y-2">
                {cv.experience.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className={`flex items-start gap-2 rounded-xl border p-2 transition-all duration-700 ${
                      isOptimised
                        ? "translate-x-0 border-blue-200 bg-white shadow-sm"
                        : index === 1
                          ? "-translate-x-1 border-orange-100 bg-orange-50"
                          : "translate-x-1 border-orange-100 bg-orange-50"
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        isOptimised
                          ? "bg-gradient-to-r from-blue-600 to-purple-600"
                          : "bg-orange-400"
                      }`}
                    />

                    <p
                      className={`text-[10px] font-semibold leading-4 ${
                        isOptimised ? "text-slate-700" : "text-slate-500"
                      }`}
                    >
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* SKILLS */}
            <div className="mt-4 text-left">
              <h4 className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                Skills
              </h4>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {cv.skills.map((skill, index) => (
                  <span
                    key={skill}
                    className={`rounded-full px-2.5 py-1 text-[8px] font-black shadow-sm transition-all duration-700 ${
                      isOptimised
                        ? index % 2 === 0
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* RESULT */}
            <div
              className={`mt-4 rounded-xl px-3 py-2.5 text-center text-[10px] font-black text-white shadow-md transition-all duration-700 ${
                isOptimised
                  ? "bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-600"
                  : "bg-gradient-to-r from-orange-500 to-red-500"
              }`}
            >
              {isOptimised
                ? "✨ With Jobify: ATS-ready and job focused"
                : "⚠️ Without Jobify: weak keywords and generic content"}
            </div>
          </div>
        </div>
      </button>

      <p className="mt-3 text-center text-[10px] font-bold text-slate-500">
        Hover on desktop or tap on mobile
      </p>
    </section>
  );
}