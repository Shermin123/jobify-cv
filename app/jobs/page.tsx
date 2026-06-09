"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  applyUrl?: string;
  source?: string;
  posted?: string;
  summary?: string;
highlights?: string[];
responsibilities?: string[];
requirements?: string[];
benefits?: string[];
skills?: string[];
category?: string;
seniority?: string;
matchScore?: number;
smartReason?: string;
tags?: string[];
};

const demoJobs: Job[] = [
  {
    id: 1,
    title: "Search real vacancies to begin",
    company: "Jobify Jobs",
    location: "Worldwide",
    salary: "Salary varies",
    type: "Full-time / Part-time",
    description:
      "Search real vacancies, upload your CV and cover letter once, then review each job in a clean professional application flow.",
    applyUrl: "",
    source: "Jobify",
    posted: "Ready",
  },
];

const jobSuggestions = [
  "Finance Assistant",
  "Accounts Assistant",
  "Junior Accountant",
  "Bookkeeper",
  "Payroll Assistant",
  "Credit Controller",
];

const locationSuggestions = [
  "United Arab Emirates",
  "Dubai",
  "Abu Dhabi",
  "Qatar",
  "Doha",
  "Saudi Arabia",
];

export default function JobsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<Job[]>(demoJobs);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState("Ready");
  const [saving, setSaving] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [searching, setSearching] = useState(false);
  const [filesSaved, setFilesSaved] = useState(false);
  const [setupOpen, setSetupOpen] = useState(true);
  const [cardAction, setCardAction] = useState<"left" | "right" | "up" | null>(
    null
  );

  const currentJob = jobs[currentIndex];

  const progress =
    jobs.length > 0
      ? Math.min(((currentIndex + 1) / jobs.length) * 100, 100)
      : 0;

  const filteredJobSuggestions = useMemo(() => {
    return jobTitle.length > 0
      ? jobSuggestions
          .filter((item) =>
            item.toLowerCase().includes(jobTitle.toLowerCase())
          )
          .slice(0, 6)
      : jobSuggestions;
  }, [jobTitle]);

  const filteredLocationSuggestions = useMemo(() => {
    return location.length > 0
      ? locationSuggestions
          .filter((item) =>
            item.toLowerCase().includes(location.toLowerCase())
          )
          .slice(0, 6)
      : locationSuggestions;
  }, [location]);

  const nextJob = () => {
    setMessage("Ready");
    setCardAction(null);

    if (currentIndex + 1 >= jobs.length) {
      setCurrentIndex(jobs.length);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const moveToNextJobWithSwipe = () => {
    setTimeout(nextJob, 350);
  };

  const handleSearch = async () => {
    try {
      setSearching(true);
      setMessage("Finding matching vacancies...");
      setCardAction(null);

      const res = await fetch(
        `/api/jobs/search?title=${encodeURIComponent(
          jobTitle || "finance assistant"
        )}&location=${encodeURIComponent(location || "United Arab Emirates")}`
      );

      const data = await res.json();

      setSearching(false);

      if (!res.ok) {
        alert(data?.error || "Could not find jobs.");
        setMessage("Search failed");
        return;
      }

      setJobs(data.jobs || []);
      setCurrentIndex(0);
      setSetupOpen(false);
      setMessage(`Found ${data.jobs?.length || 0} jobs`);
    } catch {
      setSearching(false);
      setMessage("Search failed");
      alert("Could not search jobs. Please try again.");
    }
  };

  const saveApplication = async (status: "declined" | "skipped" | "applied") => {
    if (!session?.user?.email) {
      router.push("/login");
      return false;
    }

    if (!currentJob) return false;

    setSaving(true);

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job_title: currentJob.title,
        company: currentJob.company,
        location: currentJob.location,
        salary: currentJob.salary,
        job_type: currentJob.type,
        status,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      alert("Could not save this action. Please try again.");
      return false;
    }

    return true;
  };

  const handleDecline = async () => {
    const saved = await saveApplication("declined");
    if (!saved) return;

    setCardAction("left");
    setMessage("Declined");
    moveToNextJobWithSwipe();
  };

  const handleSkip = async () => {
    const saved = await saveApplication("skipped");
    if (!saved) return;

    setCardAction("up");
    setMessage("Skipped");
    moveToNextJobWithSwipe();
  };

  const handleApply = async () => {
    if (!session?.user?.email) {
      router.push("/login");
      return;
    }

    if (!cvFile) {
      alert("Please upload your CV first.");
      setSetupOpen(true);
      return;
    }

    if (!coverFile) {
      alert("Please upload your cover letter first.");
      setSetupOpen(true);
      return;
    }

    try {
      setSaving(true);
      setShowLoader(true);
      setMessage("Preparing application...");

      const formData = new FormData();
      formData.append("cv", cvFile);
      formData.append("coverLetter", coverFile);

      const uploadRes = await fetch("/api/job-profile/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        setSaving(false);
        setShowLoader(false);
        alert("Could not upload your CV and cover letter. Please try again.");
        return;
      }

      setFilesSaved(true);

      const saved = await saveApplication("applied");
      if (!saved) {
        setShowLoader(false);
        return;
      }

      const emailRes = await fetch("/api/applications/confirm-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: currentJob.title,
          company: currentJob.company,
          location: currentJob.location,
        }),
      });

      if (!emailRes.ok) {
        const emailError = await emailRes.json();
        alert(emailError?.error || "Application saved, but email was not sent.");
      }

      setSaving(false);
      setShowLoader(false);
      setCardAction("right");
      setMessage(`Applied to ${currentJob.company}`);

      if (currentJob.applyUrl) {
        window.open(currentJob.applyUrl, "_blank");
      }

      moveToNextJobWithSwipe();
    } catch {
      setSaving(false);
      setShowLoader(false);
      setMessage("Application failed");
      alert("Could not complete application. Please try again.");
    }
  };

  const cardAnimation =
    cardAction === "left"
      ? "-translate-x-[80px] opacity-0 scale-[0.97]"
      : cardAction === "right"
      ? "translate-x-[80px] opacity-0 scale-[0.97]"
      : cardAction === "up"
      ? "-translate-y-8 opacity-0 scale-[0.97]"
      : "translate-x-0 translate-y-0 opacity-100 scale-100";

  return (
    <main className="min-h-screen bg-[#f3f2ef] text-[#191919]">
      {(searching || showLoader) && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-white/70 px-6 backdrop-blur-xl">
          <div className="w-full max-w-sm rounded-3xl border border-[#d0d0d0] bg-white p-8 text-center shadow-xl">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-[#0a66c2]/15" />
              <div className="absolute inset-3 animate-spin rounded-full border-2 border-transparent border-t-[#0a66c2]" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a66c2] text-xl font-black text-white">
                J
              </div>
            </div>

            <p className="mt-6 text-lg font-black">
              {searching ? "Finding matching jobs" : "Preparing application"}
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Please wait while Jobify completes this step.
            </p>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 lg:pb-10">
        <header className="sticky top-3 z-50 rounded-2xl border border-[#d6d6d6] bg-white/95 shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#0a66c2] text-lg font-black text-white">
                J
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0a66c2]">
                  Jobify
                </p>
                <h1 className="text-base font-black sm:text-xl">Jobs</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-full bg-[#eef3f8] px-4 py-2 text-xs font-bold text-neutral-600 sm:block">
                {message}
              </div>

              <button
                onClick={() => setSetupOpen((prev) => !prev)}
                className="rounded-full bg-[#0a66c2] px-5 py-2 text-xs font-black text-white transition hover:bg-[#004182]"
              >
                {setupOpen ? "Close Search" : "Search Jobs"}
              </button>
            </div>
          </div>

          <div className="h-1 overflow-hidden bg-neutral-100">
            <div
              className="h-full bg-[#0a66c2] transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        {setupOpen && (
          <section className="mt-4 rounded-2xl border border-[#d6d6d6] bg-white p-5 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wide text-neutral-500">
                  Job title
                </label>
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Finance Assistant"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#0a66c2] focus:ring-4 focus:ring-[#0a66c2]/10"
                />

                <div className="mt-2 flex flex-wrap gap-2">
                  {filteredJobSuggestions.map((item) => (
                    <button
                      key={item}
                      onClick={() => setJobTitle(item)}
                      className="rounded-full border border-[#0a66c2]/20 bg-[#eef3f8] px-3 py-1.5 text-[11px] font-bold text-[#0a66c2] transition hover:bg-[#0a66c2] hover:text-white"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wide text-neutral-500">
                  Location
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Dubai"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#0a66c2] focus:ring-4 focus:ring-[#0a66c2]/10"
                />

                <div className="mt-2 flex flex-wrap gap-2">
                  {filteredLocationSuggestions.map((item) => (
                    <button
                      key={item}
                      onClick={() => setLocation(item)}
                      className="rounded-full border border-[#0a66c2]/20 bg-[#eef3f8] px-3 py-1.5 text-[11px] font-bold text-[#0a66c2] transition hover:bg-[#0a66c2] hover:text-white"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_180px]">
              <label className="rounded-xl border border-neutral-300 bg-[#f8fafd] px-4 py-3">
                <span className="text-xs font-black uppercase tracking-wide text-neutral-500">
                  CV / Resume
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    setCvFile(e.target.files?.[0] || null);
                    setFilesSaved(false);
                  }}
                  className="mt-2 w-full text-xs text-neutral-500 file:mr-2 file:rounded-lg file:border-0 file:bg-[#0a66c2] file:px-3 file:py-2 file:text-xs file:font-black file:text-white"
                />
                {cvFile && (
                  <p className="mt-2 truncate text-xs font-black text-green-600">
                    {cvFile.name}
                  </p>
                )}
              </label>

              <label className="rounded-xl border border-neutral-300 bg-[#f8fafd] px-4 py-3">
                <span className="text-xs font-black uppercase tracking-wide text-neutral-500">
                  Cover letter
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    setCoverFile(e.target.files?.[0] || null);
                    setFilesSaved(false);
                  }}
                  className="mt-2 w-full text-xs text-neutral-500 file:mr-2 file:rounded-lg file:border-0 file:bg-[#0a66c2] file:px-3 file:py-2 file:text-xs file:font-black file:text-white"
                />
                {coverFile && (
                  <p className="mt-2 truncate text-xs font-black text-green-600">
                    {coverFile.name}
                  </p>
                )}
              </label>

              <button
                onClick={handleSearch}
                disabled={searching || saving}
                className="h-full rounded-xl bg-[#0a66c2] px-6 py-4 text-sm font-black text-white transition hover:bg-[#004182] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {searching ? "Searching..." : "Find Jobs"}
              </button>
            </div>
          </section>
        )}

        <div className="mt-5 grid gap-5 lg:grid-cols-[260px_1fr_280px]">
            <aside className="hidden lg:block">
  <div className="group sticky top-24 overflow-hidden rounded-[28px] border border-[#d6d6d6] bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(10,102,194,0.16)]">
    <div className="relative bg-gradient-to-br from-[#0a66c2] to-[#004182] p-5 text-white">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/15 blur-2xl transition-all duration-700 group-hover:scale-125" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
            One-tap apply
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight">
            Application cockpit
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Get your files ready once. Apply faster to every matching job.
          </p>
        </div>

        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-black text-[#0a66c2] shadow-lg transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
          {cvFile && coverFile ? "✓" : "↗"}
          <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-green-400 ring-4 ring-[#0a66c2]" />
        </div>
      </div>
    </div>

    <div className="p-5">
      <div className="mb-5 overflow-hidden rounded-2xl bg-[#eef3f8] p-1">
        <div
          className="h-3 rounded-xl bg-gradient-to-r from-[#0a66c2] to-[#40a9ff] transition-all duration-700 ease-out"
          style={{
            width:
              cvFile && coverFile && filesSaved
                ? "100%"
                : cvFile && coverFile
                ? "75%"
                : cvFile || coverFile
                ? "42%"
                : "12%",
          }}
        />
      </div>

      <div className="space-y-3">
        <PremiumStatusRow
          label="CV / Resume"
          value={cvFile ? "Ready" : "Upload"}
          good={!!cvFile}
        />

        <PremiumStatusRow
          label="Cover letter"
          value={coverFile ? "Ready" : "Upload"}
          good={!!coverFile}
        />

        <PremiumStatusRow
          label="Apply system"
          value={filesSaved ? "Synced" : cvFile && coverFile ? "Ready" : "Waiting"}
          good={filesSaved || (!!cvFile && !!coverFile)}
          neutral={!filesSaved && !(cvFile && coverFile)}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-[#0a66c2]/15 bg-[#f8fafd] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
            ⚡
          </div>

          <div>
            <p className="text-sm font-black text-[#191919]">
              {cvFile && coverFile
                ? "Fast apply unlocked"
                : "Upload files to unlock fast apply"}
            </p>
            <p className="mt-1 text-xs font-semibold leading-5 text-neutral-500">
              {cvFile && coverFile
                ? "You can now apply with one smooth action."
                : "Your CV and cover letter are required before applying."}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setSetupOpen(true)}
        className="mt-5 w-full rounded-full border border-[#0a66c2] bg-white px-5 py-3 text-sm font-black text-[#0a66c2] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#eef3f8]"
      >
        Manage files
      </button>
    </div>
  </div>
</aside>

                <section className="min-w-0">
  {currentJob ? (
    <article
      className={`group relative overflow-hidden rounded-[32px] border border-[#d6d6d6] bg-white shadow-[0_18px_70px_rgba(0,0,0,0.08)] transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-[0_30px_100px_rgba(10,102,194,0.18)] ${cardAnimation}`}
    >
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#0a66c2]/10 blur-3xl transition-all duration-700 group-hover:scale-125 group-hover:bg-[#0a66c2]/20" />

      <div className="relative bg-gradient-to-br from-[#0a66c2] via-[#0758a8] to-[#003b73] p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white">
              {currentJob.type || "Job"}
            </span>

            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white/80">
              {currentJob.posted || "Recently posted"}
            </span>

            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white/80">
              {currentJob.source || "Job board"}
            </span>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3 text-center text-[#0a66c2] shadow-lg transition-all duration-500 group-hover:scale-105">
            <p className="text-xl font-black">
              {currentJob.matchScore ?? Math.round(progress)}%
            </p>
            <p className="text-[10px] font-black uppercase tracking-wide">
              Match
            </p>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-sm font-bold text-white/70">
            {currentJob.company}
          </p>

          <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            {currentJob.title}
          </h2>

          <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-white/85">
            <span className="rounded-full bg-black/15 px-4 py-2">
              📍 {currentJob.location}
            </span>

            <span className="rounded-full bg-black/15 px-4 py-2">
              💰 {currentJob.salary}
            </span>

            {currentJob.smartReason && (
              <span className="rounded-full bg-white px-4 py-2 text-[#0a66c2]">
                ✨ {currentJob.smartReason}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <div className="grid gap-3 sm:grid-cols-3">
          <InfoBox label="Location" value={currentJob.location} />
          <InfoBox label="Salary" value={currentJob.salary} />
          <InfoBox
            label="Apply link"
            value={currentJob.applyUrl ? "Available" : "Not listed"}
          />
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-[#f8fafd] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-[#191919]">
                  About this job
                </h3>
                <p className="mt-1 text-sm font-semibold text-neutral-500">
                  Important details from the listing
                </p>
              </div>

              <span className="rounded-full bg-[#eef3f8] px-4 py-2 text-xs font-black text-[#0a66c2]">
                Job {currentIndex + 1} of {jobs.length}
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-neutral-700">
              {currentJob.summary || currentJob.description}
            </p>
          </div>

          <div className="p-5">
            <div className="rounded-2xl bg-[#f8fafd] p-4">
              <p className="text-xs font-black uppercase tracking-wide text-neutral-400">
                Why this job stands out
              </p>

              <ul className="mt-3 space-y-2">
                {(currentJob.highlights || [currentJob.description])
                  .slice(0, 3)
                  .map((item, index) => (
                    <li
                      key={index}
                      className="flex gap-3 text-sm leading-6 text-neutral-700"
                    >
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0a66c2] text-[10px] font-black text-white">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(currentJob.skills || currentJob.tags || [])
                .slice(0, 6)
                .map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#0a66c2]/20 bg-[#eef3f8] px-3 py-1.5 text-xs font-bold text-[#0a66c2] transition-all duration-300 hover:bg-[#0a66c2] hover:text-white"
                  >
                    {item}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-200 bg-[#f8fafd] p-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={handleApply}
              disabled={saving || searching || !currentJob}
              className="group relative overflow-hidden rounded-2xl bg-[#0a66c2] px-6 py-4 text-sm font-black text-white shadow-[0_14px_35px_rgba(10,102,194,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#004182] hover:shadow-[0_22px_55px_rgba(10,102,194,0.35)] disabled:opacity-40"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">
                {saving ? "Applying..." : "Apply now"}
              </span>
            </button>

            <button
              onClick={handleSkip}
              disabled={saving || searching || !currentJob}
              className="rounded-2xl border border-[#0a66c2]/25 bg-white px-6 py-4 text-sm font-black text-[#0a66c2] transition-all duration-300 hover:-translate-y-1 hover:bg-[#eef3f8] hover:shadow-md disabled:opacity-40"
            >
              Skip
            </button>

            <button
              onClick={handleDecline}
              disabled={saving || searching || !currentJob}
              className="rounded-2xl border border-neutral-300 bg-white px-6 py-4 text-sm font-black text-neutral-700 transition-all duration-300 hover:-translate-y-1 hover:bg-neutral-100 hover:shadow-md disabled:opacity-40"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </article>
  ) : (
    <div className="rounded-3xl border border-[#d6d6d6] bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#0a66c2] text-2xl font-black text-white">
        J
      </div>
      <h2 className="mt-6 text-3xl font-black">No more jobs</h2>
      <p className="mt-2 text-sm leading-6 text-neutral-500">
        Search again to find more matching vacancies.
      </p>
      <button
        onClick={handleSearch}
        className="mt-6 rounded-full bg-[#0a66c2] px-6 py-3 text-sm font-black text-white transition hover:bg-[#004182]"
      >
        Search Again
      </button>
    </div>
  )}
</section>

          <aside className="hidden lg:block">
            <div className="rounded-2xl border border-[#d6d6d6] bg-white p-5 shadow-sm">
              <h3 className="text-lg font-black">Current progress</h3>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-[#0a66c2] transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 text-sm font-bold text-neutral-500">
                Job {currentJob ? currentIndex + 1 : 0} of {jobs.length}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-[#d6d6d6] bg-white p-5 shadow-sm">
              <h3 className="text-lg font-black">How it works</h3>
              <div className="mt-4 space-y-4 text-sm leading-6 text-neutral-600">
                <p>
                  <span className="font-black text-[#191919]">Apply</span>{" "}
                  records the job, uploads files, sends email, and opens the
                  official link.
                </p>
                <p>
                  <span className="font-black text-[#191919]">Skip</span> saves
                  the job without showing the loading popup.
                </p>
                <p>
                  <span className="font-black text-[#191919]">Decline</span>{" "}
                  records jobs you are not interested in.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <style>{`
        @keyframes jobifyBar {
          0% {
            transform: translateX(-120%);
          }
          50% {
            transform: translateX(20%);
          }
          100% {
            transform: translateX(160%);
          }
        }
      `}</style>
    </main>
  );
}

function PremiumStatusRow({
  label,
  value,
  good,
  neutral,
}: {
  label: string;
  value: string;
  good?: boolean;
  neutral?: boolean;
}) {
  return (
    <div className="group/row flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0a66c2]/30 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div
          className={
            good
              ? "flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-sm font-black text-green-600 transition-all duration-300 group-hover/row:scale-110"
              : neutral
              ? "flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3f8] text-sm font-black text-[#0a66c2] transition-all duration-300 group-hover/row:scale-110"
              : "flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-sm font-black text-red-500 transition-all duration-300 group-hover/row:scale-110"
          }
        >
          {good ? "✓" : neutral ? "•" : "!"}
        </div>

        <div>
          <p className="text-sm font-black text-[#191919]">{label}</p>
          <p className="text-[11px] font-semibold text-neutral-400">
            {good ? "Completed" : neutral ? "In progress" : "Required"}
          </p>
        </div>
      </div>

      <span
        className={
          good
            ? "rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700"
            : neutral
            ? "rounded-full bg-[#eef3f8] px-3 py-1 text-xs font-black text-[#0a66c2]"
            : "rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-600"
        }
      >
        {value}
      </span>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-[#f8fafd] p-4">
      <p className="text-xs font-black uppercase text-neutral-400">{label}</p>
      <p className="mt-2 text-sm font-black">{value}</p>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  primary,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        primary
          ? "group relative flex-1 overflow-hidden rounded-full bg-[#0a66c2] px-6 py-4 text-sm font-black text-white shadow-[0_14px_35px_rgba(10,102,194,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#004182] hover:shadow-[0_20px_50px_rgba(10,102,194,0.35)] disabled:opacity-40"
          : "flex-1 rounded-full border border-neutral-300 bg-white px-6 py-4 text-sm font-black text-neutral-700 transition-all duration-300 hover:-translate-y-1 hover:bg-neutral-100 hover:shadow-md disabled:opacity-40"
      }
    >
      {primary && (
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      )}
      <span className="relative">{label}</span>
    </button>
  );
}