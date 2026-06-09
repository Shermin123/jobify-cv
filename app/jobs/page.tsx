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

  const currentJob = jobs[currentIndex];

  const nextJob = () => {
    setMessage("");

    if (currentIndex + 1 >= jobs.length) {
      setCurrentIndex(jobs.length);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handleSearch = () => {
    setJobs(demoJobs);
    setCurrentIndex(0);
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

    setMessage("Job declined");
    setTimeout(nextJob, 450);
  };

  const handleSkip = async () => {
    const saved = await saveApplication("skipped");
    if (!saved) return;

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

    const saved = await saveApplication("applied");
    if (!saved) return;

    setMessage(`Application saved for ${currentJob.company}`);
    setTimeout(nextJob, 700);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-300">
            Jobify One-Tap Apply
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
            Swipe. Apply. Get hired.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Upload your CV and cover letter once. Then apply to matching jobs
            with one tap.
          </p>
        </div>

        <div className="mt-8 grid gap-4 rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl md:grid-cols-2">
          <label className="rounded-2xl border border-white/10 bg-slate-900 p-4">
            <span className="text-sm font-black">Upload CV</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setCvFile(e.target.files?.[0] || null)}
              className="mt-3 w-full text-sm text-slate-300 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-bold file:text-white"
            />
            {cvFile && (
              <p className="mt-2 text-xs text-green-300">{cvFile.name}</p>
            )}
          </label>

          <label className="rounded-2xl border border-white/10 bg-slate-900 p-4">
            <span className="text-sm font-black">Upload Cover Letter</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="mt-3 w-full text-sm text-slate-300 file:mr-3 file:rounded-xl file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:font-bold file:text-white"
            />
            {coverFile && (
              <p className="mt-2 text-xs text-green-300">{coverFile.name}</p>
            )}
          </label>
        </div>

        <div className="mt-5 grid gap-3 rounded-[2rem] border border-white/10 bg-white p-4 shadow-2xl md:grid-cols-[1fr_1fr_auto]">
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Job type, e.g. Retail Assistant"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-blue-500"
          />

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location, e.g. London"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-blue-500"
          />

          <button
            onClick={handleSearch}
            className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:scale-[1.02]"
          >
            Find Jobs
          </button>
        </div>

        {message && (
          <div className="mx-auto mt-5 max-w-md rounded-2xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-center text-sm font-bold text-green-300">
            {message}
          </div>
        )}

        <div className="mx-auto mt-8 max-w-md">
          {currentJob ? (
            <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-white text-slate-950 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
                  Recommended Job
                </p>
                <h2 className="mt-4 text-3xl font-black">{currentJob.title}</h2>
                <p className="mt-2 text-lg font-bold">{currentJob.company}</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-100 p-3">
                    <p className="text-xs font-bold text-slate-500">Location</p>
                    <p className="mt-1 text-sm font-black">
                      {currentJob.location}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-100 p-3">
                    <p className="text-xs font-bold text-slate-500">Salary</p>
                    <p className="mt-1 text-sm font-black">
                      {currentJob.salary}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-2xl bg-slate-100 p-3">
                    <p className="text-xs font-bold text-slate-500">Type</p>
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
                    className="rounded-2xl border border-red-200 bg-red-50 px-3 py-4 text-sm font-black text-red-600 transition hover:scale-[1.03] disabled:opacity-50"
                  >
                    Decline
                  </button>

                  <button
                    onClick={handleSkip}
                    disabled={saving}
                    className="rounded-2xl border border-slate-200 bg-slate-100 px-3 py-4 text-sm font-black text-slate-700 transition hover:scale-[1.03] disabled:opacity-50"
                  >
                    Skip
                  </button>

                  <button
                    onClick={handleApply}
                    disabled={saving}
                    className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-4 text-sm font-black text-white shadow-xl transition hover:scale-[1.03] disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Apply"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center">
              <h2 className="text-2xl font-black">No more jobs</h2>
              <p className="mt-2 text-sm text-slate-300">
                Search again to see more job matches.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}