import { NextResponse } from "next/server";

type JoobleJob = {
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

type SearchPlan = {
  keywords: string;
  location: string;
  page: number;
};

function cleanInput(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function uniqueItems(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

/* GLOBAL LOCATION INTELLIGENCE */
function smartLocations(location: string) {
  const value = cleanInput(location);

  if (!value) return ["Worldwide"];

  const map: Record<string, string[]> = {
    "dubai": ["United Arab Emirates", "Dubai", "UAE"],
    "uae": ["United Arab Emirates", "Dubai", "Abu Dhabi"],
    "abu dhabi": ["United Arab Emirates", "Abu Dhabi"],
    "sharjah": ["United Arab Emirates", "Sharjah"],

    "qatar": ["Qatar", "Doha"],
    "doha": ["Qatar", "Doha"],

    "saudi": ["Saudi Arabia", "Riyadh", "Jeddah"],
    "riyadh": ["Saudi Arabia", "Riyadh"],
    "jeddah": ["Saudi Arabia", "Jeddah"],

    "uk": ["United Kingdom", "London", "Manchester", "Birmingham"],
    "united kingdom": ["United Kingdom", "London", "Manchester"],
    "london": ["United Kingdom", "London"],
    "manchester": ["United Kingdom", "Manchester"],

    "usa": ["United States", "New York", "California", "Texas"],
    "united states": ["United States", "New York", "California"],
    "new york": ["United States", "New York"],
    "california": ["United States", "California"],
    "texas": ["United States", "Texas"],

    "canada": ["Canada", "Toronto", "Vancouver"],
    "toronto": ["Canada", "Toronto"],
    "vancouver": ["Canada", "Vancouver"],

    "india": ["India", "Bangalore", "Mumbai", "Delhi", "Kochi"],
    "kerala": ["India", "Kerala", "Kochi"],
    "kochi": ["India", "Kochi"],
    "bangalore": ["India", "Bangalore"],
    "bengaluru": ["India", "Bangalore"],
    "mumbai": ["India", "Mumbai"],
    "delhi": ["India", "Delhi"],

    "singapore": ["Singapore"],
    "australia": ["Australia", "Sydney", "Melbourne"],
    "sydney": ["Australia", "Sydney"],
    "melbourne": ["Australia", "Melbourne"],

    "germany": ["Germany", "Berlin", "Munich"],
    "berlin": ["Germany", "Berlin"],
    "france": ["France", "Paris"],
    "paris": ["France", "Paris"],
    "netherlands": ["Netherlands", "Amsterdam"],
    "amsterdam": ["Netherlands", "Amsterdam"],

    "ireland": ["Ireland", "Dublin"],
    "dublin": ["Ireland", "Dublin"],

    "malaysia": ["Malaysia", "Kuala Lumpur"],
    "kuala lumpur": ["Malaysia", "Kuala Lumpur"],

    "remote": ["Remote", "Worldwide"],
    "worldwide": ["Worldwide", "Remote"],
  };

  for (const key of Object.keys(map)) {
    if (value.includes(key)) return map[key];
  }

  return [location];
}

/* GLOBAL JOB ROLE INTELLIGENCE */
function detectCategory(title: string) {
  const value = cleanInput(title);

  if (value.match(/finance|account|bookkeep|payroll|audit|tax|bank|credit/)) {
    return "Finance";
  }

  if (value.match(/retail|store|cashier|sales assistant|shop|customer assistant/)) {
    return "Retail";
  }

  if (value.match(/data|analyst|business intelligence|bi|reporting/)) {
    return "Data";
  }

  if (value.match(/software|developer|engineer|frontend|backend|full stack|react|python|java|web/)) {
    return "Technology";
  }

  if (value.match(/hotel|hospitality|reception|front desk|guest|restaurant|waiter|barista/)) {
    return "Hospitality";
  }

  if (value.match(/driver|delivery|courier|van|truck/)) {
    return "Driving";
  }

  if (value.match(/warehouse|picker|packer|logistics|inventory/)) {
    return "Warehouse";
  }

  if (value.match(/admin|office|assistant|secretary|administrator/)) {
    return "Admin";
  }

  if (value.match(/care|health|nurse|support worker|healthcare|medical/)) {
    return "Healthcare";
  }

  if (value.match(/marketing|social media|content|seo|digital/)) {
    return "Marketing";
  }

  if (value.match(/teacher|teaching|tutor|education|school/)) {
    return "Education";
  }

  if (value.match(/security|guard|door supervisor/)) {
    return "Security";
  }

  if (value.match(/cleaner|cleaning|housekeeping/)) {
    return "Cleaning";
  }

  return "General";
}

function smartKeywordVariants(title: string) {
  const cleanTitle = title.trim() || "retail assistant";
  const category = detectCategory(cleanTitle);
  const variants = [cleanTitle];

  const groups: Record<string, string[]> = {
    Finance: [
      "finance assistant",
      "accounts assistant",
      "junior accountant",
      "bookkeeper",
      "payroll assistant",
      "credit controller",
      "accounts payable",
      "accounts receivable",
      "audit assistant",
      "finance analyst",
    ],
    Retail: [
      "retail assistant",
      "sales assistant",
      "store assistant",
      "customer assistant",
      "cashier",
      "shop assistant",
      "store associate",
    ],
    Data: [
      "data analyst",
      "junior data analyst",
      "business analyst",
      "reporting analyst",
      "data assistant",
      "BI analyst",
    ],
    Technology: [
      "junior software developer",
      "frontend developer",
      "backend developer",
      "web developer",
      "react developer",
      "python developer",
      "software engineer",
    ],
    Hospitality: [
      "hotel receptionist",
      "front desk assistant",
      "guest service agent",
      "receptionist",
      "barista",
      "waiter",
      "restaurant assistant",
    ],
    Driving: [
      "driver",
      "delivery driver",
      "courier driver",
      "van driver",
      "truck driver",
    ],
    Warehouse: [
      "warehouse operative",
      "warehouse assistant",
      "picker packer",
      "logistics assistant",
      "inventory assistant",
    ],
    Admin: [
      "admin assistant",
      "office assistant",
      "administrator",
      "receptionist",
      "secretary",
    ],
    Healthcare: [
      "care assistant",
      "support worker",
      "healthcare assistant",
      "nursing assistant",
      "medical assistant",
    ],
    Marketing: [
      "marketing assistant",
      "digital marketing assistant",
      "social media assistant",
      "content assistant",
      "SEO assistant",
    ],
    Education: [
      "teaching assistant",
      "teacher",
      "tutor",
      "education assistant",
      "school assistant",
    ],
    Security: [
      "security guard",
      "security officer",
      "door supervisor",
    ],
    Cleaning: [
      "cleaner",
      "cleaning operative",
      "housekeeper",
      "housekeeping assistant",
    ],
  };

  if (groups[category]) variants.push(...groups[category]);

  return uniqueItems(variants).slice(0, 10);
}

function cleanText(text?: string) {
  if (!text) return "No description available.";

  return text
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

function inferJobType(job: JoobleJob) {
  const text = cleanInput(`${job.title || ""} ${job.type || ""} ${job.snippet || ""}`);

  if (text.includes("part time") || text.includes("part-time")) return "Part-time";
  if (text.includes("full time") || text.includes("full-time")) return "Full-time";
  if (text.includes("contract")) return "Contract";
  if (text.includes("temporary") || text.includes("temp")) return "Temporary";
  if (text.includes("internship") || text.includes("intern")) return "Internship";
  if (text.includes("remote") || text.includes("work from home")) return "Remote";

  return job.type || "Not specified";
}

function detectSeniority(title: string, description: string) {
  const text = cleanInput(`${title} ${description}`);

  if (text.match(/intern|trainee|entry level|graduate|junior|assistant/)) {
    return "Entry / Junior";
  }

  if (text.match(/senior|lead|manager|head of|director/)) {
    return "Senior / Lead";
  }

  return "Mid / General";
}

function buildTags(job: JoobleJob, category: string, jobType: string) {
  const tags = [category, jobType];

  const text = cleanInput(`${job.title || ""} ${job.location || ""} ${job.snippet || ""}`);

  if (text.includes("remote")) tags.push("Remote");
  if (job.salary) tags.push("Salary listed");
  if (job.link) tags.push("Apply link");
  if (job.updated) tags.push("Updated");

  return uniqueItems(tags).slice(0, 5);
}

function scoreJob(job: JoobleJob, rawTitle: string, rawLocation: string) {
  let score = 0;

  const title = cleanInput(job.title || "");
  const company = cleanInput(job.company || "");
  const location = cleanInput(job.location || "");
  const description = cleanInput(job.snippet || "");
  const userTitle = cleanInput(rawTitle);
  const userLocation = cleanInput(rawLocation);

  const titleWords = userTitle.split(" ").filter((word) => word.length > 2);
  const locationWords = userLocation.split(" ").filter((word) => word.length > 2);

  for (const word of titleWords) {
    if (title.includes(word)) score += 12;
    if (description.includes(word)) score += 3;
  }

  for (const word of locationWords) {
    if (location.includes(word)) score += 10;
    if (description.includes(word)) score += 2;
  }

  if (company && company !== "company not listed") score += 8;
  if (job.salary) score += 8;
  if (job.link) score += 10;
  if (description.length > 200) score += 8;
  if (description.length > 500) score += 5;
  if (job.updated) score += 5;

  if (description.includes("no experience")) score += 4;
  if (description.includes("immediate start")) score += 4;
  if (description.includes("visa")) score += 3;

  if (
    description.includes("click here") ||
    description.includes("no interview") ||
    description.includes("earn money fast")
  ) {
    score -= 25;
  }

  return Math.max(score, 0);
}
function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 25);
}

function extractSmartDetails(description: string, jobTitle: string) {
  const sentences = splitSentences(description);
  const text = description.toLowerCase();

  const highlights = sentences.slice(0, 4);

  const requirements = sentences
    .filter((s) => {
      const value = s.toLowerCase();
      return (
        value.includes("experience") ||
        value.includes("skill") ||
        value.includes("required") ||
        value.includes("must") ||
        value.includes("knowledge") ||
        value.includes("ability") ||
        value.includes("qualification")
      );
    })
    .slice(0, 4);

  const responsibilities = sentences
    .filter((s) => {
      const value = s.toLowerCase();
      return (
        value.includes("responsible") ||
        value.includes("support") ||
        value.includes("manage") ||
        value.includes("assist") ||
        value.includes("prepare") ||
        value.includes("deliver") ||
        value.includes("handle") ||
        value.includes("work with")
      );
    })
    .slice(0, 4);

  const benefits = sentences
    .filter((s) => {
      const value = s.toLowerCase();
      return (
        value.includes("benefit") ||
        value.includes("salary") ||
        value.includes("bonus") ||
        value.includes("training") ||
        value.includes("career") ||
        value.includes("flexible") ||
        value.includes("holiday") ||
        value.includes("pension")
      );
    })
    .slice(0, 3);

  const skills = [
    "communication",
    "customer service",
    "excel",
    "microsoft office",
    "sales",
    "accounting",
    "finance",
    "data analysis",
    "python",
    "react",
    "teamwork",
    "organisation",
    "leadership",
    "problem solving",
    "time management",
  ].filter((skill) => text.includes(skill));

  return {
    summary:
      highlights.length > 0
        ? highlights.slice(0, 2).join(" ")
        : `This role is for ${jobTitle}. Review the official job page for the full employer description.`,
    highlights:
      highlights.length > 0
        ? highlights
        : ["Review the official apply link for full job details."],
    responsibilities:
      responsibilities.length > 0
        ? responsibilities
        : ["Responsibilities are not clearly listed in the job feed."],
    requirements:
      requirements.length > 0
        ? requirements
        : ["Requirements are not clearly listed in the job feed."],
    benefits:
      benefits.length > 0
        ? benefits
        : ["Benefits are not clearly listed in the job feed."],
    skills: skills.length > 0 ? skills.slice(0, 6) : ["Not clearly listed"],
  };
}

async function fetchJooblePage(
  apiKey: string,
  keywords: string,
  location: string,
  page: number
) {
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

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Could not fetch jobs from Jooble");
  }

  return Array.isArray(data.jobs) ? data.jobs : [];
}

function buildSearchPlans(rawTitle: string, rawLocation: string): SearchPlan[] {
  const keywordVariants = smartKeywordVariants(rawTitle);
  const locationVariants = smartLocations(rawLocation);

  const plans: SearchPlan[] = [];

  for (const location of locationVariants.slice(0, 4)) {
    for (const keywords of keywordVariants.slice(0, 5)) {
      plans.push({ keywords, location, page: 1 });
    }
  }

  for (const location of locationVariants.slice(0, 2)) {
    for (const keywords of keywordVariants.slice(0, 3)) {
      plans.push({ keywords, location, page: 2 });
    }
  }

  return plans.slice(0, 20);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const rawTitle = searchParams.get("title") || "retail assistant";
    const rawLocation = searchParams.get("location") || "London";
    const limit = Number(searchParams.get("limit") || 30);

    const apiKey = process.env.JOOBLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing JOOBLE_API_KEY" },
        { status: 500 }
      );
    }

    const plans = buildSearchPlans(rawTitle, rawLocation);

    const results = await Promise.allSettled(
      plans.map((plan) =>
        fetchJooblePage(apiKey, plan.keywords, plan.location, plan.page)
      )
    );

    const allJobs = results.flatMap((result) =>
      result.status === "fulfilled" ? result.value : []
    );

    const seen = new Set<string>();

    const jobs = allJobs
      .map((job: JoobleJob, index: number) => {
        const jobTitle = job.title || "Untitled job";
        const company = job.company || "Company not listed";
        const jobLocation =
          job.location || smartLocations(rawLocation)[0] || "Location not listed";
        const description = cleanText(job.snippet);
        const category = detectCategory(`${jobTitle} ${rawTitle}`);
        const jobType = inferJobType(job);
        const seniority = detectSeniority(jobTitle, description);
        const matchScore = scoreJob(job, rawTitle, rawLocation);
        const smartDetails = extractSmartDetails(description, jobTitle);

        const key = `${jobTitle}-${company}-${jobLocation}`
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();

        return {
          id: makeId(key, index),
          title: jobTitle,
          company,
          location: jobLocation,
          salary: job.salary || "Salary not listed",
          type: jobType,
          description,
          applyUrl: job.link || "",
          source: job.source || "Jooble",
          posted: job.updated || "Recently posted",
          category,
          seniority,
          matchScore,
          tags: buildTags(job, category, jobType),
          smartReason:
            matchScore >= 50
              ? "Strong match"
              : matchScore >= 30
              ? "Good match"
              : "Broad match",
              summary: smartDetails.summary,
highlights: smartDetails.highlights,
responsibilities: smartDetails.responsibilities,
requirements: smartDetails.requirements,
benefits: smartDetails.benefits,
skills: smartDetails.skills,
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
      searchedLocation: smartLocations(rawLocation)[0],
      searchedKeywords: smartKeywordVariants(rawTitle)[0],
      suggestions: smartKeywordVariants(rawTitle),
      searchPlansUsed: plans.length,
      globalReady: true,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to search jobs with Jooble",
      },
      { status: 500 }
    );
  }
}