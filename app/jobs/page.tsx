"use client";

import { useState } from "react";
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
};

const demoJobs: Job[] = [
  {
    id: 1,
    title: "Retail Assistant",
    company: "Tesco",
    location: "London",
    salary: "£11.50 - £13/hour",
    type: "Part-time",
    description:
      "Help customers, restock shelves, handle tills, and support the store team.",
  },
  {
    id: 2,
    title: "Sales Assistant",
    company: "Zara",
    location: "London",
    salary: "£12/hour",
    type: "Part-time",
    description:
      "Support customers, organise stock, maintain shop floor standards, and process sales.",
  },
  {
    id: 3,
    title: "Warehouse Operative",
    company: "Amazon",
    location: "Romford",
    salary: "£13.15/hour",
    type: "Full-time / Part-time",
    description:
      "Pick, pack, scan items, and support warehouse operations in a fast-paced environment.",
  },
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
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [filesSaved, setFilesSaved] = useState(false);
  const [cardAction, setCardAction] = useState<"left" | "right" | "up" | null>(
    null
  );

  const currentJob = jobs[currentIndex];

  const nextJob = () => {
    setMessage("");
    setCardAction(null);

    if (currentIndex + 1 >= jobs.length) {
      setCurrentIndex(jobs.length);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handleSearch = () => {
    setJobs(demoJobs);
    setCurrentIndex(0);
    setCardAction(null);
    setMessage(
      `Showing ${jobTitle || "jobs"} near ${location || "your location"}`
    );
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
    setMessage("Job declined");
    setTimeout(nextJob, 450);
  };

  const handleSkip = async () => {
    const saved = await saveApplication("skipped");
    if (!saved) return;

    setCardAction("up");
    setMessage("Skipped for now");
    setTimeout(nextJob, 450);
  };

  const handleApply = async () => {
  if (!session?.user?.email) {
    router.push("/login");
    return;
  }

  if (!cvFile) {
    alert("Please upload your CV first.");
    return;
  }

  if (!coverFile) {
    alert("Please upload your cover letter first.");
    return;
  }

  setSaving(true);

  const formData = new FormData();
  formData.append("cv", cvFile);
  formData.append("coverLetter", coverFile);

  const uploadRes = await fetch("/api/job-profile/upload", {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
  setSaving(false);
  alert("Could not upload your CV and cover letter. Please try again.");
  return;
}

setFilesSaved(true);
setSaving(false);

  const saved = await saveApplication("applied");
  if (!saved) return;

  await fetch("/api/applications/confirm-email", {
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

  setCardAction("right");
  setMessage(`Application recorded for ${currentJob.company}. Email sent.`);
  setTimeout(nextJob, 550);
};

  const cardAnimation =
    cardAction === "left"
      ? "translate-x-[-140%] rotate-[-18deg] opacity-0"
      : cardAction === "right"
      ? "translate-x-[140%] rotate-[18deg] opacity-0"
      : cardAction === "up"
      ? "translate-y-[-90px] scale-95 opacity-0"
      : "translate-x-0 translate-y-0 rotate-0 opacity-100";

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#1d4ed8_0%,#020617_42%,#020617_100%)] px-4 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="mx-auto inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-blue-200 shadow-xl backdrop-blur-xl">
            Jobify One-Tap Apply
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">
            Swipe. Apply. Get hired.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Upload your CV and cover letter once. Then swipe through jobs and
            apply in one tap.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl">
            <div className="rounded-[1.5rem] bg-white p-4 text-slate-950">
              <h2 className="text-lg font-black">Your application files</h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                These files will be used when you apply.
              </p>

              <div className="mt-4 space-y-3">
                <label className="block rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-sm font-black">Upload CV</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
  setCvFile(e.target.files?.[0] || null);
  setFilesSaved(false);
}}
                    className="mt-3 w-full text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-bold file:text-white"
                  />
                  {cvFile && (
                    <p className="mt-2 text-xs font-bold text-green-600">
                      {cvFile.name}
                    </p>
                  )}
                </label>
                {filesSaved && (
  <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-black text-green-700">
    ✅ CV and cover letter saved securely
  </div>
)}

                <label className="block rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-sm font-black">Upload Cover Letter</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                        onChange={(e) => {
  setCoverFile(e.target.files?.[0] || null);
  setFilesSaved(false);
}}
                    className="mt-3 w-full text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:font-bold file:text-white"
                  />
                  {coverFile && (
                    <p className="mt-2 text-xs font-bold text-green-600">
                      {coverFile.name}
                    </p>
                  )}
                </label>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-white p-4 text-slate-950">
              <h2 className="text-lg font-black">Find jobs</h2>

              <div className="mt-4 space-y-3">
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Job type, e.g. Retail Assistant"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-blue-500"
                />

                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location, e.g. London"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-blue-500"
                />

                <button
                  onClick={handleSearch}
                  className="w-full rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl transition hover:scale-[1.02]"
                >
                  Find Jobs
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            {message && (
              <div className="mb-5 w-full max-w-md rounded-2xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-center text-sm font-bold text-green-300">
                {message}
              </div>
            )}

            <div className="relative flex min-h-[560px] w-full max-w-md items-center justify-center">
              {currentJob ? (
                <>
                  <div className="absolute inset-x-8 top-8 h-[500px] rotate-[-7deg] rounded-[2.2rem] bg-white/10 blur-[1px]" />
                  <div className="absolute inset-x-8 top-8 h-[500px] rotate-[7deg] rounded-[2.2rem] bg-white/10 blur-[1px]" />

                  <div
                    className={`relative w-full overflow-hidden rounded-[2.4rem] border border-white/20 bg-white text-slate-950 shadow-[0_35px_120px_rgba(0,0,0,0.55)] transition-all duration-500 ease-out ${cardAnimation}`}
                  >
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white">
                      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
                      <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-blue-300/20 blur-2xl" />

                      <div className="relative">
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-white/70">
                          Recommended Job
                        </p>

                        <h2 className="mt-5 text-3xl font-black leading-tight">
                          {currentJob.title}
                        </h2>

                        <p className="mt-2 text-lg font-bold text-white/90">
                          {currentJob.company}
                        </p>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-slate-100 p-3">
                          <p className="text-xs font-bold text-slate-500">
                            Location
                          </p>
                          <p className="mt-1 text-sm font-black">
                            {currentJob.location}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-100 p-3">
                          <p className="text-xs font-bold text-slate-500">
                            Salary
                          </p>
                          <p className="mt-1 text-sm font-black">
                            {currentJob.salary}
                          </p>
                        </div>

                        <div className="col-span-2 rounded-2xl bg-slate-100 p-3">
                          <p className="text-xs font-bold text-slate-500">
                            Type
                          </p>
                          <p className="mt-1 text-sm font-black">
                            {currentJob.type}
                          </p>
                        </div>
                      </div>

                      <p className="mt-5 text-sm leading-6 text-slate-600">
                        {currentJob.description}
                      </p>

                      <div className="mt-6 grid grid-cols-3 gap-3">
                        <button
                          onClick={handleDecline}
                          disabled={saving}
                          className="rounded-2xl border border-red-200 bg-red-50 px-3 py-4 text-sm font-black text-red-600 shadow-sm transition hover:scale-[1.04] disabled:opacity-50"
                        >
                          ✕<br />
                          Decline
                        </button>

                        <button
                          onClick={handleSkip}
                          disabled={saving}
                          className="rounded-2xl border border-slate-200 bg-slate-100 px-3 py-4 text-sm font-black text-slate-700 shadow-sm transition hover:scale-[1.04] disabled:opacity-50"
                        >
                          ↗<br />
                          Skip
                        </button>

                        <button
                          onClick={handleApply}
                          disabled={saving}
                          className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-4 text-sm font-black text-white shadow-xl transition hover:scale-[1.04] disabled:opacity-50"
                        >
                          ✓<br />
                          {saving ? "Saving" : "Apply"}
                        </button>
                      </div>

                      <p className="mt-4 text-center text-xs font-semibold text-slate-400">
                        {currentIndex + 1} of {jobs.length} jobs
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-3xl">
                    🎉
                  </div>
                  <h2 className="mt-5 text-2xl font-black">No more jobs</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Search again to see more job matches.
                  </p>

                  <button
                    onClick={handleSearch}
                    className="mt-5 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950"
                  >
                    Search Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}