import { NextResponse } from "next/server";

type RawJob = {
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
  type?: string;
  snippet?: string;
  link?: string;
  updated?: string;
  source?: string;
};

type AdzunaJob = {
  title?: string;
  company?: {
    display_name?: string;
  };
  location?: {
    display_name?: string;
  };
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
  contract_type?: string;
  description?: string;
  redirect_url?: string;
  created?: string;
};

type RemotiveJob = {
  title?: string;
  company_name?: string;
  candidate_required_location?: string;
  salary?: string;
  job_type?: string;
  description?: string;
  url?: string;
  publication_date?: string;
};

function cleanInput(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function cleanText(text?: string) {
  if (!text) return "No description available.";

  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1800);
}

function makeId(value: string, index: number) {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash) || index + 1;
}

function getCompanyLogo(company?: string) {
  if (!company || company === "Company not listed") {
    return "https://www.google.com/s2/favicons?domain=google.com&sz=128";
  }

  const clean = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `https://logo.clearbit.com/${clean}.com`;
}

function getAdzunaCountryCode(location: string) {
  const value = cleanInput(location);

  if (value.includes("united kingdom") || value.includes("london") || value === "uk") {
    return "gb";
  }

  if (value.includes("united states") || value.includes("usa") || value === "us") {
    return "us";
  }

  if (value.includes("canada")) return "ca";
  if (value.includes("australia")) return "au";
  if (value.includes("germany")) return "de";
  if (value.includes("france")) return "fr";
  if (value.includes("india")) return "in";
  if (value.includes("singapore")) return "sg";
  if (value.includes("netherlands")) return "nl";

  return "gb";
}

function detectCategory(title: string) {
  const value = cleanInput(title);

  if (value.match(/finance|account|bookkeep|payroll|audit|credit|ledger/)) {
    return "Finance";
  }

  if (value.match(/retail|store|cashier|sales|shop|customer/)) {
    return "Retail";
  }

  if (value.match(/data|analyst|business intelligence|bi|reporting/)) {
    return "Data";
  }

  if (value.match(/software|developer|engineer|frontend|backend|react|python|web/)) {
    return "Technology";
  }

  if (value.match(/hotel|hospitality|reception|barista|waiter|restaurant/)) {
    return "Hospitality";
  }

  if (value.match(/driver|delivery|courier|van|taxi|uber/)) {
    return "Driving";
  }

  if (value.match(/warehouse|picker|packer|logistics|inventory|stock/)) {
    return "Warehouse";
  }

  if (value.match(/admin|office|assistant|secretary|administrator/)) {
    return "Admin";
  }

  if (value.match(/care|health|nurse|support worker|medical/)) {
    return "Healthcare";
  }

  if (value.match(/marketing|social media|content|seo|digital/)) {
    return "Marketing";
  }

  return "General";
}

function inferJobType(job: RawJob) {
  const text = cleanInput(`${job.title || ""} ${job.type || ""} ${job.snippet || ""}`);

  if (text.includes("part time") || text.includes("part-time")) return "Part-time";
  if (text.includes("full time") || text.includes("full-time")) return "Full-time";
  if (text.includes("contract")) return "Contract";
  if (text.includes("temporary") || text.includes("temp")) return "Temporary";
  if (text.includes("internship") || text.includes("intern")) return "Internship";
  if (text.includes("remote") || text.includes("work from home")) return "Remote";

  return job.type || "Not specified";
}

function scoreJob(job: RawJob, rawTitle: string, rawLocation: string) {
  let score = 35;

  const title = cleanInput(job.title || "");
  const location = cleanInput(job.location || "");
  const description = cleanInput(job.snippet || "");
  const userTitle = cleanInput(rawTitle);
  const userLocation = cleanInput(rawLocation);

  const titleWords = userTitle.split(" ").filter((word) => word.length > 2);
  const locationWords = userLocation.split(" ").filter((word) => word.length > 2);

  if (title.includes(userTitle)) score += 25;
  if (description.includes(userTitle)) score += 10;

  for (const word of titleWords) {
    if (title.includes(word)) score += 8;
    if (description.includes(word)) score += 3;
  }

  for (const word of locationWords) {
    if (location.includes(word)) score += 7;
  }

  if (job.company) score += 6;
  if (job.salary) score += 6;
  if (job.link) score += 8;
  if (description.length > 250) score += 6;

  return Math.max(Math.min(score, 98), 45);
}

function getSmartReason(score: number) {
  if (score >= 75) return "Excellent match";
  if (score >= 60) return "Strong match";
  return "Good match";
}

function buildSummary(description: string, title: string) {
  const clean = cleanText(description);

  if (clean.length > 80) {
    return clean.slice(0, 420);
  }

  return `This role is for ${title}. Open the official apply link to review the full employer details.`;
}

async function fetchJoobleJobs(keywords: string, location: string) {
  const apiKey = process.env.JOOBLE_API_KEY;

  if (!apiKey) return [];

  try {
    const res = await fetch(`https://jooble.org/api/${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keywords,
        location,
        page: 1,
      }),
      cache: "no-store",
    });

    const text = await res.text();

    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      return [];
    }

    if (!res.ok) return [];

    return Array.isArray(data.jobs) ? data.jobs : [];
  } catch {
    return [];
  }
}

async function fetchAdzunaJobs(keywords: string, location: string) {
  const appId =
    process.env.ADZUNA_APP_ID ||
    process.env.ADZUNA_APPID ||
    process.env.ADZUNA_ID;

  const appKey =
    process.env.ADZUNA_APP_KEY ||
    process.env.ADZUNA_APPKEY ||
    process.env.ADZUNA_KEY;

  if (!appId || !appKey) return [];

  try {
    const countryCode = getAdzunaCountryCode(location);

    const url = new URL(
      `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1`
    );

    url.searchParams.set("app_id", appId);
    url.searchParams.set("app_key", appKey);
    url.searchParams.set("what", keywords);
    url.searchParams.set("where", location);
    url.searchParams.set("results_per_page", "30");
    url.searchParams.set("content-type", "application/json");

    const res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();

    if (!Array.isArray(data.results)) return [];

    return data.results.map((job: AdzunaJob) => ({
      title: job.title,
      company: job.company?.display_name,
      location: job.location?.display_name || location,
      salary:
        job.salary_min && job.salary_max
          ? `${Math.round(job.salary_min)} - ${Math.round(job.salary_max)}`
          : job.salary_min
          ? `${Math.round(job.salary_min)}`
          : "",
      type: job.contract_time || job.contract_type || "Not specified",
      snippet: job.description,
      link: job.redirect_url,
      updated: job.created,
      source: "Adzuna",
    }));
  } catch {
    return [];
  }
}

async function fetchRemotiveJobs(keywords: string) {
  try {
    const res = await fetch(
      `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(
        keywords
      )}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!res.ok) return [];

    const data = await res.json();

    if (!Array.isArray(data.jobs)) return [];

    return data.jobs.map((job: RemotiveJob) => ({
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || "Remote",
      salary: job.salary || "",
      type: job.job_type || "Remote",
      snippet: job.description,
      link: job.url,
      updated: job.publication_date,
      source: "Remotive",
    }));
  } catch {
    return [];
  }
}

function fallbackJobs(title: string, location: string) {
  return [
    {
      title: title || "Customer Service Assistant",
      company: "Company not listed",
      location: location || "Location not listed",
      salary: "Salary not listed",
      type: "Not specified",
      snippet:
        "No live job provider returned results right now. Try a broader job title or location, or connect Jooble/Adzuna API keys in Vercel.",
      link: "",
      updated: "Now",
      source: "Jobify",
    },
  ];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const rawTitle = searchParams.get("title") || "retail assistant";
    const rawLocation = searchParams.get("location") || "London";
    const limit = Number(searchParams.get("limit") || 30);

    const [joobleJobs, adzunaJobs, remotiveJobs] = await Promise.all([
      fetchJoobleJobs(rawTitle, rawLocation),
      fetchAdzunaJobs(rawTitle, rawLocation),
      fetchRemotiveJobs(rawTitle),
    ]);

    const allJobs: RawJob[] = [
      ...joobleJobs,
      ...adzunaJobs,
      ...remotiveJobs,
    ];

    const finalRawJobs = allJobs.length > 0 ? allJobs : fallbackJobs(rawTitle, rawLocation);

    const seen = new Set<string>();

    const jobs = finalRawJobs
      .map((job: RawJob, index: number) => {
        const jobTitle = job.title || "Untitled job";
        const company = job.company || "Company not listed";
        const jobLocation = job.location || rawLocation || "Location not listed";
        const description = cleanText(job.snippet);
        const category = detectCategory(`${jobTitle} ${rawTitle}`);
        const jobType = inferJobType(job);
        const matchScore = scoreJob(job, rawTitle, rawLocation);

        const key = `${jobTitle}-${company}-${jobLocation}`
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();

        return {
          id: makeId(key, index),
          title: jobTitle,
          company,
          logo: getCompanyLogo(company),
          location: jobLocation,
          salary: job.salary || "Salary not listed",
          type: jobType,
          description,
          applyUrl: job.link || "",
          source: job.source || "Jobify",
          posted: job.updated || "Recently posted",
          category,
          seniority: "General",
          matchScore,
          tags: [category, jobType, job.source || "Jobify"].filter(Boolean),
          smartReason: getSmartReason(matchScore),
          summary: buildSummary(description, jobTitle),
          highlights: [buildSummary(description, jobTitle)],
          responsibilities: ["Review the official job advert for full responsibilities."],
          requirements: ["Review the official job advert for full requirements."],
          benefits: ["Review the official job advert for benefits."],
          skills: ["Not clearly listed"],
        };
      })
      .filter((job) => {
        const key = `${job.title}-${job.company}-${job.location}`
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();

        if (seen.has(key)) return false;

        seen.add(key);
        return true;
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, Math.min(limit, 40));

    return NextResponse.json({
      jobs,
      totalFound: jobs.length,
      searchedLocation: rawLocation,
      searchedKeywords: rawTitle,
      providers: {
        jooble: joobleJobs.length,
        adzuna: adzunaJobs.length,
        remotive: remotiveJobs.length,
      },
    });
  } catch (error: any) {
    console.error("Jobs search API error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Jobs search failed",
      },
      { status: 500 }
    );
  }
}