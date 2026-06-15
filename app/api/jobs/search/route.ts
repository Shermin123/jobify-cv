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
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function cleanText(text?: string) {
  if (!text) return "No description available.";

  return String(text)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2200);
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

  if (!clean) {
    return "https://www.google.com/s2/favicons?domain=google.com&sz=128";
  }

  return `https://logo.clearbit.com/${clean}.com`;
}

function getAdzunaCountryCode(location: string) {
  const value = cleanInput(location);

  if (
    value.includes("united kingdom") ||
    value.includes("london") ||
    value.includes("england") ||
    value === "uk" ||
    value === "gb"
  ) {
    return "gb";
  }

  if (
    value.includes("united states") ||
    value.includes("usa") ||
    value.includes("new york") ||
    value.includes("california") ||
    value === "us"
  ) {
    return "us";
  }

  if (value.includes("canada")) return "ca";
  if (value.includes("australia")) return "au";
  if (value.includes("germany")) return "de";
  if (value.includes("france")) return "fr";
  if (value.includes("india")) return "in";
  if (value.includes("singapore")) return "sg";
  if (value.includes("netherlands")) return "nl";
  if (value.includes("ireland")) return "ie";
  if (value.includes("south africa")) return "za";
  if (value.includes("new zealand")) return "nz";

  return "gb";
}

function detectCategory(title: string) {
  const value = cleanInput(title);

  if (value.match(/finance|account|bookkeep|payroll|audit|credit|ledger|tax/)) {
    return "Finance";
  }

  if (value.match(/retail|store|cashier|sales assistant|shop|customer advisor/)) {
    return "Retail";
  }

  if (value.match(/data|analyst|business intelligence|bi|reporting|sql|excel/)) {
    return "Data";
  }

  if (
    value.match(
      /software|developer|engineer|frontend|backend|react|python|web|next|javascript|flutter|mobile|ai|machine learning/
    )
  ) {
    return "Technology";
  }

  if (value.match(/hotel|hospitality|reception|barista|waiter|restaurant|chef/)) {
    return "Hospitality";
  }

  if (value.match(/driver|delivery|courier|van|taxi|uber/)) {
    return "Driving";
  }

  if (value.match(/warehouse|picker|packer|logistics|inventory|stock/)) {
    return "Warehouse";
  }

  if (value.match(/admin|office|assistant|secretary|administrator|data entry/)) {
    return "Admin";
  }

  if (value.match(/care|health|nurse|support worker|medical|healthcare/)) {
    return "Healthcare";
  }

  if (value.match(/marketing|social media|content|seo|digital|brand/)) {
    return "Marketing";
  }

  return "General";
}

function inferJobType(job: RawJob) {
  const text = cleanInput(
    `${job.title || ""} ${job.type || ""} ${job.snippet || ""}`
  );

  if (text.includes("part time") || text.includes("part-time")) return "Part-time";
  if (text.includes("full time") || text.includes("full-time")) return "Full-time";
  if (text.includes("contract")) return "Contract";
  if (text.includes("temporary") || text.includes("temp")) return "Temporary";
  if (text.includes("internship") || text.includes("intern")) return "Internship";
  if (text.includes("remote") || text.includes("work from home")) return "Remote";
  if (text.includes("hybrid")) return "Hybrid";

  return job.type || "Not specified";
}

function normaliseSearchTitle(title: string) {
  const value = cleanInput(title);

  const replacements: Record<string, string[]> = {
    "ai engineer": [
      "AI Engineer",
      "Machine Learning Engineer",
      "Artificial Intelligence Engineer",
      "Data Scientist",
      "Python Developer",
    ],
    "software engineer": [
      "Software Engineer",
      "Software Developer",
      "Full Stack Developer",
      "Backend Developer",
      "Frontend Developer",
    ],
    "flutter developer": [
      "Flutter Developer",
      "Mobile App Developer",
      "Dart Developer",
      "Android Developer",
      "Software Developer",
    ],
    "retail assistant": [
      "Retail Assistant",
      "Sales Assistant",
      "Customer Assistant",
      "Store Assistant",
      "Customer Service Assistant",
    ],
    "data analyst": [
      "Data Analyst",
      "Junior Data Analyst",
      "Business Analyst",
      "Reporting Analyst",
      "BI Analyst",
    ],
    "customer service": [
      "Customer Service Assistant",
      "Customer Service Advisor",
      "Customer Support Agent",
      "Call Centre Agent",
    ],
  };

  for (const key of Object.keys(replacements)) {
    if (value.includes(key)) {
      return replacements[key];
    }
  }

  return [title];
}

function scoreJob(job: RawJob, rawTitle: string, rawLocation: string) {
  let score = 35;

  const title = cleanInput(job.title || "");
  const location = cleanInput(job.location || "");
  const description = cleanInput(job.snippet || "");
  const company = cleanInput(job.company || "");
  const userTitle = cleanInput(rawTitle);
  const userLocation = cleanInput(rawLocation);

  const titleWords = userTitle
    .split(" ")
    .filter((word) => word.length > 2 && !["job", "role"].includes(word));

  const locationWords = userLocation
    .split(" ")
    .filter((word) => word.length > 2);

  if (title === userTitle) score += 30;
  if (title.includes(userTitle)) score += 24;
  if (description.includes(userTitle)) score += 10;

  for (const word of titleWords) {
    if (title.includes(word)) score += 8;
    if (description.includes(word)) score += 3;
  }

  for (const word of locationWords) {
    if (location.includes(word)) score += 6;
  }

  if (location.includes(userLocation)) score += 10;
  if (company && company !== "company not listed") score += 5;
  if (job.salary && job.salary !== "Salary not listed") score += 5;
  if (job.link) score += 8;
  if (description.length > 250) score += 6;
  if (description.length > 600) score += 4;

  const jobType = inferJobType(job);

  if (jobType !== "Not specified") score += 4;

  return Math.max(Math.min(score, 98), 45);
}

function getSmartReason(score: number) {
  if (score >= 80) return "Excellent match";
  if (score >= 68) return "Strong match";
  if (score >= 55) return "Good match";
  return "Possible match";
}

function buildSummary(description: string, title: string) {
  const clean = cleanText(description);

  if (clean.length > 100) {
    return clean.slice(0, 520);
  }

  return `This role is for ${title}. Open the official apply link to review the full employer details.`;
}

function extractSkills(description: string, title: string) {
  const text = cleanInput(`${title} ${description}`);

  const skills = [
    "Customer service",
    "Communication",
    "Teamwork",
    "Sales",
    "Administration",
    "Excel",
    "Python",
    "JavaScript",
    "React",
    "Next.js",
    "Flutter",
    "Firebase",
    "SQL",
    "Machine Learning",
    "Data Analysis",
    "AWS",
    "GCP",
    "Problem solving",
    "Time management",
    "Leadership",
    "Stock control",
    "Retail operations",
    "CRM",
    "Reporting",
  ];

  const found = skills.filter((skill) => text.includes(skill.toLowerCase()));

  return found.length ? found.slice(0, 8) : ["Not clearly listed"];
}

function extractResponsibilities(description: string) {
  const clean = cleanText(description);

  const sentences = clean
    .split(/[.!?]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 45)
    .slice(0, 4);

  return sentences.length
    ? sentences
    : ["Review the official job advert for full responsibilities."];
}

function extractRequirements(description: string) {
  const clean = cleanInput(description);

  const requirements = [];

  if (clean.includes("experience")) requirements.push("Relevant experience preferred");
  if (clean.includes("communication")) requirements.push("Good communication skills");
  if (clean.includes("customer")) requirements.push("Customer-focused approach");
  if (clean.includes("team")) requirements.push("Ability to work in a team");
  if (clean.includes("degree")) requirements.push("Relevant degree may be required");
  if (clean.includes("python")) requirements.push("Python knowledge");
  if (clean.includes("sql")) requirements.push("SQL knowledge");
  if (clean.includes("react")) requirements.push("React experience");
  if (clean.includes("excel")) requirements.push("Excel skills");

  return requirements.length
    ? requirements.slice(0, 6)
    : ["Review the official job advert for full requirements."];
}

function extractBenefits(description: string) {
  const clean = cleanInput(description);

  const benefits = [];

  if (clean.includes("remote")) benefits.push("Remote work options");
  if (clean.includes("hybrid")) benefits.push("Hybrid work options");
  if (clean.includes("training")) benefits.push("Training provided");
  if (clean.includes("pension")) benefits.push("Pension scheme");
  if (clean.includes("bonus")) benefits.push("Bonus opportunity");
  if (clean.includes("discount")) benefits.push("Employee discount");
  if (clean.includes("holiday")) benefits.push("Holiday allowance");

  return benefits.length
    ? benefits.slice(0, 5)
    : ["Review the official job advert for benefits."];
}

async function fetchJoobleJobs(keywords: string, location: string) {
  const apiKey = process.env.JOOBLE_API_KEY;

  if (!apiKey) return [];

  try {
    const pages = [1, 2, 3];

    const results = await Promise.all(
      pages.map(async (page) => {
        const res = await fetch(`https://jooble.org/api/${apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            keywords,
            location,
            page,
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

        return Array.isArray(data.jobs)
          ? data.jobs.map((job: any) => ({
              title: job.title,
              company: job.company,
              location: job.location,
              salary: job.salary,
              type: job.type,
              snippet: job.snippet,
              link: job.link,
              updated: job.updated,
              source: "Jooble",
            }))
          : [];
      })
    );

    return results.flat();
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
    const pages = [1, 2, 3];

    const results = await Promise.all(
      pages.map(async (page) => {
        const url = new URL(
          `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/${page}`
        );

        url.searchParams.set("app_id", appId);
        url.searchParams.set("app_key", appKey);
        url.searchParams.set("what", keywords);
        url.searchParams.set("where", location);
        url.searchParams.set("results_per_page", "50");
        url.searchParams.set("sort_by", "date");
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
      })
    );

    return results.flat();
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
        "No live job provider returned results right now. Try a broader job title or location, or connect Jooble and Adzuna API keys in Vercel.",
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
    const limit = Number(searchParams.get("limit") || 80);

    const searchTitles = normaliseSearchTitle(rawTitle);
    const uniqueSearchTitles = Array.from(new Set([rawTitle, ...searchTitles])).slice(
      0,
      5
    );

    const providerResults = await Promise.all(
      uniqueSearchTitles.map(async (searchTitle) => {
        const [joobleJobs, adzunaJobs, remotiveJobs] = await Promise.all([
          fetchJoobleJobs(searchTitle, rawLocation),
          fetchAdzunaJobs(searchTitle, rawLocation),
          fetchRemotiveJobs(searchTitle),
        ]);

        return {
          joobleJobs,
          adzunaJobs,
          remotiveJobs,
        };
      })
    );

    const joobleJobs = providerResults.flatMap((item) => item.joobleJobs);
    const adzunaJobs = providerResults.flatMap((item) => item.adzunaJobs);
    const remotiveJobs = providerResults.flatMap((item) => item.remotiveJobs);

    const allJobs: RawJob[] = [
      ...joobleJobs,
      ...adzunaJobs,
      ...remotiveJobs,
    ];

    const finalRawJobs =
      allJobs.length > 0 ? allJobs : fallbackJobs(rawTitle, rawLocation);

    const seen = new Set<string>();

    const jobs = finalRawJobs
      .map((job: RawJob, index: number) => {
        const jobTitle = job.title || "Untitled job";
        const company = job.company || "Company not listed";
        const jobLocation = job.location || rawLocation || "Location not listed";
        const description = cleanText(job.snippet);
        const category = detectCategory(`${jobTitle} ${rawTitle} ${description}`);
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
          responsibilities: extractResponsibilities(description),
          requirements: extractRequirements(description),
          benefits: extractBenefits(description),
          skills: extractSkills(description, jobTitle),
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
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }

        return String(b.posted).localeCompare(String(a.posted));
      })
      .slice(0, Math.min(limit, 120));

    return NextResponse.json({
      jobs,
      totalFound: jobs.length,
      searchedLocation: rawLocation,
      searchedKeywords: rawTitle,
      expandedSearches: uniqueSearchTitles,
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