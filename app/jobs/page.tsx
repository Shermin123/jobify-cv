"use client";

import { useEffect, useMemo, useState } from "react";
import { checkSubscription } from "@/lib/checkSubscription";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Job = {
  id: number;
  title: string;
  company: string;
  logo?: string;
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

function getCompanyLogo(company?: string, logo?: string) {
  if (logo) return logo;

  if (!company) {
    return "https://www.google.com/s2/favicons?domain=google.com&sz=128";
  }

  const clean = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `https://logo.clearbit.com/${clean}.com`;
}
const DAILY_FREE_AUTO_APPLY_LIMIT = 10;
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

const popularJobSuggestions = [
  "Finance Assistant",
  "Accounts Assistant",
  "Junior Accountant",
  "Bookkeeper",
  "Payroll Assistant",
  "Credit Controller",
  "Finance Analyst",
  "Data Analyst",
  "Business Analyst",
  "Software Developer",
  "Frontend Developer",
  "Backend Developer",
  "React Developer",
  "Python Developer",
  "Retail Assistant",
  "Sales Assistant",
  "Customer Service Assistant",
  "Store Assistant",
  "Warehouse Operative",
  "Warehouse Assistant",
  "Admin Assistant",
  "Receptionist",
  "Hotel Receptionist",
  "Care Assistant",
  "Delivery Driver",
  "Marketing Assistant",
  "HR Assistant",
  "Security Guard",
  "Cleaner",
];

const jobGroups: Record<string, string[]> = {
  finance: [
    "Finance Assistant",
    "Accounts Assistant",
    "Junior Accountant",
    "Bookkeeper",
    "Payroll Assistant",
    "Credit Controller",
    "Finance Analyst",
    "Accounts Payable Assistant",
    "Accounts Receivable Assistant",
    "Audit Assistant",
  ],
  accounting: [
    "Accounts Assistant",
    "Junior Accountant",
    "Bookkeeper",
    "Accounts Payable Assistant",
    "Accounts Receivable Assistant",
    "Payroll Assistant",
  ],
  data: [
    "Data Analyst",
    "Junior Data Analyst",
    "Business Analyst",
    "Reporting Analyst",
    "Data Assistant",
    "BI Analyst",
  ],
  software: [
    "Junior Software Developer",
    "Frontend Developer",
    "Backend Developer",
    "React Developer",
    "Python Developer",
    "Web Developer",
    "Software Engineer",
  ],
  developer: [
    "Junior Software Developer",
    "Frontend Developer",
    "Backend Developer",
    "React Developer",
    "Python Developer",
    "Web Developer",
  ],
  retail: [
    "Retail Assistant",
    "Sales Assistant",
    "Store Assistant",
    "Cashier",
    "Customer Assistant",
    "Shop Assistant",
    "Store Associate",
  ],
  sales: [
    "Sales Assistant",
    "Sales Executive",
    "Retail Sales Assistant",
    "Customer Sales Assistant",
    "Business Development Executive",
  ],
  hotel: [
    "Hotel Receptionist",
    "Front Desk Assistant",
    "Guest Service Agent",
    "Restaurant Assistant",
    "Barista",
    "Waiter",
  ],
  hospitality: [
    "Hotel Receptionist",
    "Front Desk Assistant",
    "Guest Service Agent",
    "Restaurant Assistant",
    "Barista",
    "Waiter",
  ],
  warehouse: [
    "Warehouse Operative",
    "Picker Packer",
    "Warehouse Assistant",
    "Logistics Assistant",
    "Inventory Assistant",
  ],
  driver: [
    "Delivery Driver",
    "Courier Driver",
    "Van Driver",
    "Driver",
    "Taxi Driver",
  ],
  admin: [
    "Admin Assistant",
    "Office Assistant",
    "Administrator",
    "Receptionist",
    "Secretary",
  ],
  healthcare: [
    "Care Assistant",
    "Support Worker",
    "Healthcare Assistant",
    "Nursing Assistant",
    "Medical Assistant",
  ],
  marketing: [
    "Marketing Assistant",
    "Digital Marketing Assistant",
    "Social Media Assistant",
    "Content Assistant",
    "SEO Assistant",
  ],
  security: ["Security Guard", "Security Officer", "Door Supervisor"],
  cleaning: ["Cleaner", "Cleaning Operative", "Housekeeper"],
};

const popularLocationSuggestions = [
  "Dubai, United Arab Emirates",
  "Abu Dhabi, United Arab Emirates",
  "Sharjah, United Arab Emirates",
  "Doha, Qatar",
  "Riyadh, Saudi Arabia",
  "Jeddah, Saudi Arabia",
  "London, United Kingdom",
  "Manchester, United Kingdom",
  "Birmingham, United Kingdom",
  "New York, United States",
  "California, United States",
  "Texas, United States",
  "Toronto, Canada",
  "Vancouver, Canada",
  "Bangalore, India",
  "Mumbai, India",
  "Delhi, India",
  "Kochi, India",
  "Singapore",
  "Sydney, Australia",
  "Melbourne, Australia",
  "Berlin, Germany",
  "Paris, France",
  "Amsterdam, Netherlands",
  "Dublin, Ireland",
  "Remote",
  "Worldwide",
];

const locationGroups: Record<string, string[]> = {
  uae: [
    "Dubai, United Arab Emirates",
    "Abu Dhabi, United Arab Emirates",
    "Sharjah, United Arab Emirates",
    "United Arab Emirates",
  ],
  dubai: ["Dubai, United Arab Emirates", "United Arab Emirates"],
  "abu dhabi": ["Abu Dhabi, United Arab Emirates", "United Arab Emirates"],
  qatar: ["Doha, Qatar", "Qatar"],
  doha: ["Doha, Qatar", "Qatar"],
  saudi: ["Riyadh, Saudi Arabia", "Jeddah, Saudi Arabia", "Saudi Arabia"],
  riyadh: ["Riyadh, Saudi Arabia", "Saudi Arabia"],
  uk: [
    "London, United Kingdom",
    "Manchester, United Kingdom",
    "Birmingham, United Kingdom",
    "United Kingdom",
  ],
  london: ["London, United Kingdom", "United Kingdom"],
  india: [
    "Bangalore, India",
    "Mumbai, India",
    "Delhi, India",
    "Kochi, India",
    "India",
  ],
  kerala: ["Kochi, India", "Kerala, India", "India"],
  usa: [
    "New York, United States",
    "California, United States",
    "Texas, United States",
    "United States",
  ],
  canada: ["Toronto, Canada", "Vancouver, Canada", "Canada"],
  australia: ["Sydney, Australia", "Melbourne, Australia", "Australia"],
  germany: ["Berlin, Germany", "Munich, Germany", "Germany"],
  france: ["Paris, France", "France"],
  remote: ["Remote", "Worldwide"],
  worldwide: ["Worldwide", "Remote"],
};

function getSmartJobSuggestions(value: string) {
  const q = value.toLowerCase().trim();

  if (!q || q === "job" || q === "jobs" || q === "work") {
    return popularJobSuggestions.slice(0, 8);
  }

  const groupMatches = Object.entries(jobGroups)
    .filter(([key]) => key.includes(q) || q.includes(key))
    .flatMap(([, items]) => items);

  const directMatches = [
    ...popularJobSuggestions,
    ...Object.values(jobGroups).flat(),
  ].filter((item) => item.toLowerCase().includes(q));

  return Array.from(new Set([...groupMatches, ...directMatches])).slice(0, 8);
}

function getAllCountryNames() {
  return [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Cape Verde",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Congo",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Korea",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestine",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Korea",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vatican City",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe",
  ];
}

function getSmartLocationSuggestions(value: string) {
  const q = value.toLowerCase().trim();

  const priorityLocations = [
    "Worldwide",
    "Remote",
    "All countries",
    "Every country",
    "United Arab Emirates",
    "Dubai, United Arab Emirates",
    "Abu Dhabi, United Arab Emirates",
    "Qatar",
    "Doha, Qatar",
    "Saudi Arabia",
    "Riyadh, Saudi Arabia",
    "India",
    "United Kingdom",
    "United States",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Singapore",
  ];

  const allCountries = getAllCountryNames();

  const allLocations = Array.from(
    new Set([...priorityLocations, ...allCountries])
  );

  if (!q || q === "location" || q === "country" || q === "city") {
    return allLocations;
  }

  return allLocations.filter((item) => item.toLowerCase().includes(q));
}

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
  const [isSubscribed, setIsSubscribed] = useState(false);
const [autoApplyCount, setAutoApplyCount] = useState(0);
  
  const [searching, setSearching] = useState(false);
  const [filesSaved, setFilesSaved] = useState(false);
  const [setupOpen, setSetupOpen] = useState(true);
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [cardAction, setCardAction] = useState<"left" | "right" | "up" | null>(
    null
  );
  const [applyNotice, setApplyNotice] = useState<{
  company: string;
  title: string;
  location: string;
  logo?: string;
} | null>(null);
const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
  

  const currentJob = jobs[currentIndex];

  const progress =
    jobs.length > 0
      ? Math.min(((currentIndex + 1) / jobs.length) * 100, 100)
      : 0;

  const filteredJobSuggestions = useMemo(() => {
    return getSmartJobSuggestions(jobTitle);
  }, [jobTitle]);

  const filteredLocationSuggestions = useMemo(() => {
    return getSmartLocationSuggestions(location);
  }, [location]);
  useEffect(() => {
  const loadAutoApplyAccess = async () => {
    if (!session?.user?.email) {
      setIsSubscribed(false);
      setAutoApplyCount(0);
      return;
    }

    const hasAccess = await checkSubscription(session.user.email);
    setIsSubscribed(hasAccess);

    const today = new Date().toISOString().slice(0, 10);
    const key = `jobify_auto_apply_${session.user.email}_${today}`;
    const savedCount = Number(localStorage.getItem(key) || "0");

    setAutoApplyCount(savedCount);
  };

  loadAutoApplyAccess();
}, [session?.user?.email]);
  useEffect(() => {
  const loadApplications = async () => {
    if (!session?.user?.email) {
      setAppliedJobs([]);
      return;
    }

    try {
      const res = await fetch("/api/applications");
      const data = await res.json();

      if (!res.ok) {
        console.error(data?.error || "Could not load applications");
        return;
      }

      const mappedJobs: Job[] = (data.applications || [])
        .filter((application: any) => application.status === "applied")
        .map((application: any) => ({
          id: application.id,
          title: application.job_title,
          company: application.company,
          location: application.location || "",
          salary: application.salary || "",
          type: application.job_type || "",
          description: "",
          source: "Jobify",
        }));

      setAppliedJobs(mappedJobs);
    } catch (error) {
      console.error("Could not load saved applications:", error);
    }
  };

  loadApplications();
}, [session?.user?.email]);

  const nextJob = () => {
    setMessage("Ready");
    setCardAction(null);

    if (currentIndex + 1 >= jobs.length) {
      setCurrentIndex(jobs.length);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const moveToNextJob = () => {
  setTimeout(nextJob, 260);
};

  const handleSearch = async () => {
  try {
    setSearching(true);
    setMessage("Finding matching vacancies...");
    setCardAction(null);
    setJobDropdownOpen(false);
    setLocationDropdownOpen(false);

    const url = `/api/jobs/search?title=${encodeURIComponent(
      jobTitle || "finance assistant"
    )}&location=${encodeURIComponent(location || "United Arab Emirates")}`;

    const res = await fetch(url);
    const text = await res.text();

    let data: any = {};

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`API did not return JSON. Response: ${text.slice(0, 200)}`);
    }

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
  } catch (error: any) {
    setSearching(false);
    setMessage("Search failed");
    console.error("Job search error:", error);
    alert(error.message || "Could not search jobs. Please try again.");
  }
};

 const saveApplication = async (
  status: "declined" | "skipped" | "applied",
  jobToSave: Job | undefined = currentJob,
  silent = false
) => {
  if (!session?.user?.email) {
    router.push("/login");
    return false;
  }

  if (!jobToSave) return false;

  if (!silent) setSaving(true);

  try {
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job_title: jobToSave.title,
        company: jobToSave.company,
        location: jobToSave.location,
        salary: jobToSave.salary,
        job_type: jobToSave.type,
        status,
      }),
    });

    if (!res.ok) {
      if (!silent) alert("Could not save this action. Please try again.");
      return false;
    }

    return true;
  } finally {
    if (!silent) setSaving(false);
  }
};

  const handleDecline = () => {
  if (!currentJob) return;

  const jobSnapshot = currentJob;

  setCardAction("left");
  setMessage("Declined");
  moveToNextJob();

  void saveApplication("declined", jobSnapshot, true);
};

const handleSkip = () => {
  if (!currentJob) return;

  const jobSnapshot = currentJob;

  setCardAction("up");
  setMessage("Skipped");
  moveToNextJob();

  void saveApplication("skipped", jobSnapshot, true);
};
const increaseFreeAutoApplyUsage = () => {
  if (!session?.user?.email) return;

  const today = new Date().toISOString().slice(0, 10);
  const key = `jobify_auto_apply_${session.user.email}_${today}`;
  const nextCount = autoApplyCount + 1;

  localStorage.setItem(key, String(nextCount));
  setAutoApplyCount(nextCount);
};
const playApplySound = () => {
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;

    const audioContext = new AudioContextClass();
    const now = audioContext.currentTime;

    const playTone = (frequency: number, start: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now + start);

      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.12, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(now + start);
      oscillator.stop(now + start + duration);
    };

    playTone(660, 0, 0.16);
    playTone(880, 0.12, 0.18);
    playTone(1040, 0.26, 0.22);

    setTimeout(() => audioContext.close(), 700);
  } catch {}
};

const handleApply = () => {
  if (!session?.user?.email) {
  router.push(`/login?callbackUrl=${encodeURIComponent("/jobs")}`);
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
  if (!isSubscribed && autoApplyCount >= DAILY_FREE_AUTO_APPLY_LIMIT) {
  alert(
    "You have used your 10 free AI Auto Apply applications today. Upgrade to continue applying."
  );
  router.push("/pricing?upgrade=auto-apply-limit");
  return;
}

  if (!currentJob) return;

  const jobSnapshot = currentJob;

setAppliedJobs((prev) => {
  const alreadyExists = prev.some((job) => job.id === jobSnapshot.id);

  if (alreadyExists) return prev;

  return [jobSnapshot, ...prev];
});

playApplySound();

setApplyNotice({
  company: jobSnapshot.company,
  title: jobSnapshot.title,
  location: jobSnapshot.location,
  logo: jobSnapshot.logo,
});

setTimeout(() => {
  setApplyNotice(null);
}, 4500);

setCardAction("right");
setMessage(`Applied to ${jobSnapshot.company}`);
moveToNextJob();
  if (!isSubscribed) {
  increaseFreeAutoApplyUsage();
}


  void (async () => {
    try {
      const formData = new FormData();
      formData.append("cv", cvFile);
      formData.append("coverLetter", coverFile);

      await fetch("/api/job-profile/upload", {
        method: "POST",
        body: formData,
      });

      setFilesSaved(true);

      await saveApplication("applied", jobSnapshot, true);

      await fetch("/api/applications/confirm-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: jobSnapshot.title,
          company: jobSnapshot.company,
          location: jobSnapshot.location,
        }),
      });
    } catch {
      console.error("Background apply failed");
    }
  })();
};
const requireLoginForFiles = (e: React.MouseEvent<HTMLInputElement>) => {
  if (!session?.user?.email) {
    e.preventDefault();
    alert("Please login first, then upload your CV and cover letter.");
    router.push(`/login?callbackUrl=${encodeURIComponent("/jobs")}`);
  }
};
  const cardAnimation =
  cardAction === "left"
    ? "-translate-x-[260px] rotate-[-12deg] opacity-0 scale-[0.92] blur-[1px]"
    : cardAction === "right"
    ? "translate-x-[260px] rotate-[12deg] opacity-0 scale-[0.92] blur-[1px]"
    : cardAction === "up"
    ? "-translate-y-[140px] opacity-0 scale-[0.92] blur-[1px]"
    : "translate-x-0 translate-y-0 rotate-0 opacity-100 scale-100 blur-0";

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#191919]">
      {applyNotice && (
  <div className="fixed inset-x-3 top-28 z-[999] mx-auto max-w-md animate-jobifyApplyToast rounded-[28px] border border-emerald-200 bg-white/95 p-4 shadow-[0_24px_80px_rgba(16,185,129,0.35)] backdrop-blur-2xl sm:top-32">
    <div className="flex items-start gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 p-2 ring-1 ring-emerald-100">
        <img
          src={getCompanyLogo(applyNotice.company, applyNotice.logo)}
          alt={`${applyNotice.company} logo`}
          className="h-9 w-9 object-contain"
          onError={(e) => {
            e.currentTarget.src =
              "https://www.google.com/s2/favicons?domain=google.com&sz=128";
          }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-white">
            ✓
          </span>

          <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-600">
            Application sent
          </p>
        </div>

        <p className="mt-2 text-lg font-black leading-tight text-slate-950">
          {applyNotice.company}
        </p>

        <p className="mt-1 line-clamp-2 text-sm font-bold text-slate-700">
          {applyNotice.title}
        </p>

        <p className="mt-1 text-xs font-semibold text-slate-500">
          {applyNotice.location}
        </p>

        <p className="mt-3 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
          CV and cover letter recorded successfully
        </p>
      </div>
    </div>
  </div>
)}
         <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
  <div className="absolute inset-0 bg-[#f3f2ef]" />

  <div
    className="absolute -left-28 top-14 h-[420px] w-[420px] rounded-full bg-[#0a66c2]/35 blur-3xl"
    style={{ animation: "jobifyBlobOne 7s ease-in-out infinite" }}
  />

  <div
    className="absolute right-[-160px] top-32 h-[500px] w-[500px] rounded-full bg-sky-400/40 blur-3xl"
    style={{ animation: "jobifyBlobTwo 8s ease-in-out infinite" }}
  />

  <div
    className="absolute bottom-[-180px] left-[25%] h-[520px] w-[520px] rounded-full bg-indigo-500/35 blur-3xl"
    style={{ animation: "jobifyBlobThree 9s ease-in-out infinite" }}
  />

  <div
    className="absolute left-[-45%] top-[20%] h-48 w-[190%] rotate-[-8deg] bg-gradient-to-r from-transparent via-[#0a66c2]/25 to-transparent"
    style={{ animation: "jobifyLightSweep 4s ease-in-out infinite" }}
  />

  <div
    className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(10,102,194,0.22)_1px,transparent_0)] bg-[size:32px_32px] opacity-80"
    style={{ animation: "jobifyGridMove 10s linear infinite" }}
  />

  <div
    className="absolute left-[10%] top-[22%] h-3 w-3 rounded-full bg-[#0a66c2]/70 shadow-[0_0_28px_rgba(10,102,194,0.8)]"
    style={{ animation: "jobifyDotOne 4s ease-in-out infinite" }}
  />

  <div
    className="absolute right-[14%] top-[38%] h-3 w-3 rounded-full bg-sky-500/70 shadow-[0_0_28px_rgba(14,165,233,0.8)]"
    style={{ animation: "jobifyDotTwo 5s ease-in-out infinite" }}
  />

  <div
    className="absolute left-[22%] bottom-[16%] h-3 w-3 rounded-full bg-indigo-500/70 shadow-[0_0_28px_rgba(99,102,241,0.8)]"
    style={{ animation: "jobifyDotThree 6s ease-in-out infinite" }}
  />
</div>
      {searching && (
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

      <section className="relative z-10 mx-auto max-w-4xl px-2 pb-16 pt-2 sm:px-6 lg:pb-10 lg:pt-6">
  {/* TOP SEARCH CARD */}
  <div className="rounded-[22px] border border-slate-200 bg-white/95 p-3 shadow-[0_12px_35px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:rounded-[28px] sm:p-4">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-2 shadow-lg ring-1 ring-slate-200">
  <img
    src="https://www.google.com/s2/favicons?domain=google.com&sz=128"
    alt="Google G"
    className="h-8 w-8 object-contain"
  />
</div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0a66c2]">
            Jobify Jobs
          </p>
          <h1 className="text-xl font-black text-slate-950">Auto Apply</h1>
        </div>
      </div>

      <button
        onClick={() => setSetupOpen((prev) => !prev)}
        className="rounded-full bg-[#0a66c2] px-4 py-2 text-xs font-black text-white shadow-lg transition active:scale-95"
      >
        {setupOpen ? "Close" : "Search"}
      </button>
    </div>

    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-[#0a66c2] transition-all duration-700"
        style={{ width: `${progress}%` }}
      />
    </div>

    <p className="mt-2 text-xs font-bold text-slate-500">
      {message} · Job {currentJob ? currentIndex + 1 : 0} of {jobs.length}
    </p>
  </div>

  {/* SEARCH FORM */}
  {setupOpen && (
    <section className="mt-4 rounded-[28px] border border-slate-200 bg-white/95 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.10)]">
      <div className="grid gap-4">
        <SearchDropdown
          label="Job title"
          value={jobTitle}
          placeholder="e.g. Finance Assistant, Data Analyst"
          open={jobDropdownOpen}
          suggestions={filteredJobSuggestions}
          onFocus={() => setJobDropdownOpen(true)}
          onBlur={() => setTimeout(() => setJobDropdownOpen(false), 120)}
          onChange={(value) => {
            setJobTitle(value);
            setJobDropdownOpen(true);
          }}
          onSelect={(value) => {
            setJobTitle(value);
            setJobDropdownOpen(false);
          }}
        />

        <SearchDropdown
          label="Location"
          value={location}
          placeholder="e.g. United Kingdom, Dubai, Remote"
          open={locationDropdownOpen}
          suggestions={filteredLocationSuggestions}
          onFocus={() => setLocationDropdownOpen(true)}
          onBlur={() => setTimeout(() => setLocationDropdownOpen(false), 120)}
          onChange={(value) => {
            setLocation(value);
            setLocationDropdownOpen(true);
          }}
          onSelect={(value) => {
            setLocation(value);
            setLocationDropdownOpen(false);
          }}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">
              CV / Resume
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onClick={requireLoginForFiles}
              onChange={(e) => {
                setCvFile(e.target.files?.[0] || null);
                setFilesSaved(false);
              }}
              className="mt-2 w-full text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-[#0a66c2] file:px-3 file:py-2 file:text-xs file:font-black file:text-white"
            />
            {cvFile && (
              <p className="mt-2 truncate text-xs font-black text-green-600">
                {cvFile.name}
              </p>
            )}
          </label>

          <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">
              Cover letter
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onClick={requireLoginForFiles}
              onChange={(e) => {
                setCoverFile(e.target.files?.[0] || null);
                setFilesSaved(false);
              }}
              className="mt-2 w-full text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-[#0a66c2] file:px-3 file:py-2 file:text-xs file:font-black file:text-white"
            />
            {coverFile && (
              <p className="mt-2 truncate text-xs font-black text-green-600">
                {coverFile.name}
              </p>
            )}
          </label>
        </div>

        <button
          onClick={handleSearch}
          disabled={searching || saving}
          className="rounded-2xl bg-[#0a66c2] px-6 py-4 text-sm font-black text-white shadow-lg transition active:scale-95 disabled:opacity-50"
        >
          {searching ? "Searching..." : "Search Jobs"}
        </button>
      </div>
    </section>
  )}

{/* LUXURY JOB CARD */}
<section className="mx-auto mt-2 max-w-3xl sm:mt-5">
  {currentJob ? (
    <article
      className={`relative overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-2xl transition-all duration-500 ease-out sm:rounded-[34px] sm:shadow-[0_30px_90px_rgba(15,23,42,0.18)] ${cardAnimation}`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-blue-200/70 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-indigo-200/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
      </div>

      <div className="relative p-3.5 sm:p-6">
        <div className="rounded-[24px] border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-4 shadow-sm sm:p-5">
  <div className="flex items-start gap-4">
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 sm:h-20 sm:w-20 sm:rounded-[24px]">
      <img
        src={getCompanyLogo(currentJob.company, currentJob.logo)}
        alt={`${currentJob.company} logo`}
        className="h-10 w-10 object-contain sm:h-12 sm:w-12"
        onError={(e) => {
          e.currentTarget.src =
            "https://www.google.com/s2/favicons?domain=google.com&sz=128";
        }}
      />
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">
        Applying to
      </p>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <h2 className="truncate text-2xl font-black leading-tight text-slate-950 sm:text-4xl">
          {currentJob.company}
        </h2>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
          AI Matched
        </span>
      </div>

      <p className="mt-2 text-base font-black text-slate-700 sm:text-lg">
        {currentJob.title}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-500">
        {currentJob.location || "Location not specified"}
      </p>
    </div>
  </div>
</div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-lg sm:p-4">
            <p className="text-[10px] font-black uppercase tracking-wide text-white/40">
              Match
            </p>
            <p className="mt-0.5 text-xl font-black text-emerald-300 sm:mt-1 sm:text-2xl">
              {Math.min(currentJob.matchScore || 72, 100)}%
            </p>
          </div>

          <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:p-4">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Type
            </p>
            <p className="mt-0.5 line-clamp-1 text-xs font-black text-slate-800 sm:mt-1 sm:text-sm">
              {currentJob.type || "Full-time"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:p-4">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Salary
            </p>
            <p className="mt-0.5 line-clamp-1 text-xs font-black text-slate-800 sm:mt-1 sm:text-sm">
              {currentJob.salary || "Not listed"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:p-4">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Source
            </p>
            <p className="mt-0.5 line-clamp-1 text-xs font-black text-slate-800 sm:mt-1 sm:text-sm">
              {currentJob.source || "Jobify"}
            </p>
          </div>
        </div>

        <div className="mt-2 rounded-[18px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-2.5 shadow-sm sm:mt-5 sm:rounded-[26px] sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-950">
                AI CV match analysis
              </p>
              <p className="mt-0.5 line-clamp-1 text-[10px] font-semibold text-slate-500 sm:mt-1 sm:text-xs">
  Based on title, location, role keywords, and your uploaded profile.
</p>
            </div>

            <p className="shrink-0 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-black text-white">
              {Math.min(currentJob.matchScore || 72, 100)}%
            </p>
          </div>

          <div className="mt-2 overflow-hidden rounded-full bg-white p-1 shadow-inner sm:mt-3">
            <div
              className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 py-1.5 text-center text-[10px] font-black text-white shadow-sm transition-all duration-700 sm:py-2 sm:text-[11px]"
              style={{
                width: `${Math.min(currentJob.matchScore || 72, 100)}%`,
              }}
            >
              Strong match
            </div>
          </div>
        </div>

        <div className="mt-2 rounded-[18px] border border-slate-200 bg-white/90 p-3 shadow-sm sm:mt-5 sm:rounded-[26px] sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-slate-950">
              Job description
            </p>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
              Preview
            </span>
          </div>

          <p className="mt-2 max-h-[54px] overflow-y-auto pr-2 text-xs font-semibold leading-5 text-slate-600 sm:mt-3 sm:max-h-[140px] sm:text-sm sm:leading-6">
            {currentJob.summary || currentJob.description}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3">
          <button
            onClick={handleDecline}
            disabled={searching || !currentJob}
            className="rounded-2xl border border-rose-200 bg-rose-50 px-2 py-3 text-xs sm:px-3 sm:py-4 sm:text-sm font-black text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-95 disabled:opacity-40"
          >
            ✕ Decline
          </button>

          <button
            onClick={handleSkip}
            disabled={searching || !currentJob}
            className="rounded-2xl border border-slate-200 bg-white px-2 py-3 text-xs sm:px-3 sm:py-4 sm:text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-95 disabled:opacity-40"
          >
            ↑ Skip
          </button>

          <button
            onClick={handleApply}
            disabled={searching || !currentJob}
            className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-2 py-3 text-xs sm:px-3 sm:py-4 sm:text-sm font-black text-white shadow-[0_16px_35px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:opacity-40"
          >
            ↗ Apply
          </button>
        </div>
      </div>
    </article>
  ) : (
    <div className="rounded-[34px] border border-white/70 bg-white/90 p-8 text-center shadow-[0_30px_90px_rgba(15,23,42,0.16)] backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-white p-3 shadow-lg ring-1 ring-slate-200">
        <img
          src="https://www.google.com/s2/favicons?domain=google.com&sz=128"
          alt="Google G"
          className="h-7 w-7 object-contain sm:h-10 sm:w-10"
        />
      </div>

      <h2 className="mt-5 text-3xl font-black text-slate-950">
        No more jobs
      </h2>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        You have reviewed all current vacancies. Search again to discover more matching jobs.
      </p>

      <button
        onClick={handleSearch}
        className="mt-6 rounded-2xl bg-[#0a66c2] px-7 py-3 text-sm font-black text-white shadow-lg transition hover:bg-blue-700 active:scale-95"
      >
        Search Again
      </button>
    </div>
    )}
</section>

{/* AUTO APPLIED JOBS LIST */}
<section className="relative z-10 mx-auto mt-6 max-w-3xl rounded-[28px] border border-slate-200 bg-white/95 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-6">
  <div className="flex items-start justify-between gap-4">
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-600">
        Auto applied jobs
      </p>

      <h2 className="mt-1 text-2xl font-black text-slate-950">
        Applications sent
      </h2>

      <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
        All jobs you have applied to.
      </p>
    </div>

    <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center ring-1 ring-emerald-100">
      <p className="text-2xl font-black text-emerald-600">
        {appliedJobs.length}
      </p>
      <p className="text-[10px] font-black uppercase text-emerald-700">
        Applied
      </p>
    </div>
  </div>

  <div className="mt-5 space-y-3">
    {appliedJobs.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
        <p className="text-sm font-black text-slate-700">
          No applications sent yet
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          Press Apply on a job and it will appear here.
        </p>
      </div>
    ) : (
      appliedJobs.map((job, index) => (
        <div
          key={`${job.id}-${index}`}
          className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
            <img
              src={getCompanyLogo(job.company, job.logo)}
              alt={`${job.company} logo`}
              className="h-8 w-8 object-contain"
              onError={(e) => {
                e.currentTarget.src =
                  "https://www.google.com/s2/favicons?domain=google.com&sz=128";
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">
                ✓
              </span>

              <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
                Applied
              </p>
            </div>

            <p className="mt-1 truncate text-base font-black text-slate-950">
              {job.company}
            </p>

            <p className="mt-0.5 line-clamp-1 text-sm font-bold text-slate-700">
              {job.title}
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              {job.location}
            </p>
          </div>

          <div className="shrink-0 rounded-full bg-white px-3 py-1 text-[10px] font-black text-slate-500 ring-1 ring-slate-200">
            {job.source || "Jobify"}
          </div>
        </div>
      ))
    )}
  </div>
</section>
</section>

      <style>{`
        @keyframes jobifyApplyToast {
  0% {
    opacity: 0;
    transform: translateY(-18px) scale(0.94);
  }
  15% {
    opacity: 1;
    transform: translateY(0) scale(1.02);
  }
  25% {
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-jobifyApplyToast {
  animation: jobifyApplyToast 0.45s ease-out both;
}
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
          @keyframes bgBlobOne {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(80px, 60px) scale(1.15);
  }
}

@keyframes bgBlobTwo {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-90px, 80px) scale(1.2);
  }
}

@keyframes bgBlobThree {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(60px, -90px) scale(1.18);
  }
}

@keyframes bgGrid {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 42px 42px;
  }
}

@keyframes floatOne {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-22px) rotate(8deg);
  }
}

@keyframes floatTwo {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(26px) rotate(-8deg);
  }
}

@keyframes floatThree {
  0%, 100% {
    transform: translateX(0) rotate(0deg);
  }
  50% {
    transform: translateX(28px) rotate(10deg);
  }
}

.animate-bgBlobOne {
  animation: bgBlobOne 11s ease-in-out infinite;
}

.animate-bgBlobTwo {
  animation: bgBlobTwo 13s ease-in-out infinite;
}

.animate-bgBlobThree {
  animation: bgBlobThree 15s ease-in-out infinite;
}

.animate-bgGrid {
  animation: bgGrid 18s linear infinite;
}

.animate-floatOne {
  animation: floatOne 5s ease-in-out infinite;
}

.animate-floatTwo {
  animation: floatTwo 6s ease-in-out infinite;
}

.animate-floatThree {
  animation: floatThree 7s ease-in-out infinite;
}
  @keyframes premiumBlobOne {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(45px, 35px, 0) scale(1.08);
  }
}

@keyframes premiumBlobTwo {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(-50px, 30px, 0) scale(1.1);
  }
}

@keyframes premiumBlobThree {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(35px, -45px, 0) scale(1.09);
  }
}

.animate-premiumBlobOne {
  animation: premiumBlobOne 14s ease-in-out infinite;
}

.animate-premiumBlobTwo {
  animation: premiumBlobTwo 16s ease-in-out infinite;
}

.animate-premiumBlobThree {
  animation: premiumBlobThree 18s ease-in-out infinite;
}
  @keyframes premiumBlobOne {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(70px, 40px, 0) scale(1.12);
  }
}

@keyframes premiumBlobTwo {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(-70px, 45px, 0) scale(1.14);
  }
}

@keyframes premiumBlobThree {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(45px, -60px, 0) scale(1.12);
  }
}

@keyframes premiumGrid {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 34px 34px;
  }
}

@keyframes premiumDotOne {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.35;
  }
  50% {
    transform: translateY(-35px);
    opacity: 0.9;
  }
}

@keyframes premiumDotTwo {
  0%, 100% {
    transform: translateX(0);
    opacity: 0.35;
  }
  50% {
    transform: translateX(-38px);
    opacity: 0.9;
  }
}

@keyframes premiumDotThree {
  0%, 100% {
    transform: translate(0, 0);
    opacity: 0.35;
  }
  50% {
    transform: translate(32px, -28px);
    opacity: 0.9;
  }
}

.animate-premiumBlobOne {
  animation: premiumBlobOne 12s ease-in-out infinite;
}

.animate-premiumBlobTwo {
  animation: premiumBlobTwo 14s ease-in-out infinite;
}

.animate-premiumBlobThree {
  animation: premiumBlobThree 16s ease-in-out infinite;
}

.animate-premiumGrid {
  animation: premiumGrid 18s linear infinite;
}

.animate-premiumDotOne {
  animation: premiumDotOne 5s ease-in-out infinite;
}

.animate-premiumDotTwo {
  animation: premiumDotTwo 6s ease-in-out infinite;
}

.animate-premiumDotThree {
  animation: premiumDotThree 7s ease-in-out infinite;
}
  @keyframes jobifyBlobOne {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(120px, 60px, 0) scale(1.18);
  }
}

@keyframes jobifyBlobTwo {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(-130px, 70px, 0) scale(1.2);
  }
}

@keyframes jobifyBlobThree {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(80px, -90px, 0) scale(1.15);
  }
}

@keyframes jobifyLightSweep {
  0% {
    transform: translateX(-35%) rotate(-8deg);
    opacity: 0;
  }
  35% {
    opacity: 1;
  }
  100% {
    transform: translateX(35%) rotate(-8deg);
    opacity: 0;
  }
}

@keyframes jobifyGridMove {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 34px 34px;
  }
}
  @keyframes jobifyBlobOne {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(150px, 85px, 0) scale(1.25);
  }
}

@keyframes jobifyBlobTwo {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(-160px, 90px, 0) scale(1.28);
  }
}

@keyframes jobifyBlobThree {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(110px, -120px, 0) scale(1.22);
  }
}

@keyframes jobifyLightSweep {
  0% {
    transform: translateX(-40%) rotate(-8deg);
    opacity: 0;
  }
  35% {
    opacity: 1;
  }
  100% {
    transform: translateX(40%) rotate(-8deg);
    opacity: 0;
  }
}

@keyframes jobifyGridMove {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 32px 32px;
  }
}

@keyframes jobifyDotOne {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.45;
  }
  50% {
    transform: translateY(-60px) scale(1.7);
    opacity: 1;
  }
}

@keyframes jobifyDotTwo {
  0%, 100% {
    transform: translateX(0) scale(1);
    opacity: 0.45;
  }
  50% {
    transform: translateX(-70px) scale(1.7);
    opacity: 1;
  }
}

@keyframes jobifyDotThree {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.45;
  }
  50% {
    transform: translate(55px, -55px) scale(1.7);
    opacity: 1;
  }
}
      `}</style>
    </main>
  );
}

function SearchDropdown({
  label,
  value,
  placeholder,
  open,
  suggestions,
  onFocus,
  onBlur,
  onChange,
  onSelect,
}: {
  label: string;
  value: string;
  placeholder: string;
  open: boolean;
  suggestions: string[];
  onFocus: () => void;
  onBlur: () => void;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="relative">
      <label className="mb-2 block text-xs font-black uppercase tracking-wide text-neutral-500">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#0a66c2] focus:ring-4 focus:ring-[#0a66c2]/10"
      />

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-[78px] z-[80] max-h-[320px] overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-[0_18px_55px_rgba(0,0,0,0.14)]">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onMouseDown={() => onSelect(item)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold text-neutral-700 transition hover:bg-[#eef3f8] hover:text-[#0a66c2]"
            >
              <span>{item}</span>
              <span className="text-xs text-neutral-400">Select</span>
            </button>
          ))}
        </div>
      )}
    </div>
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

function SmallInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f8fafd] p-3 text-center">
      <p className="text-[10px] font-black uppercase text-neutral-400">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-black">{value}</p>
    </div>
  );
}