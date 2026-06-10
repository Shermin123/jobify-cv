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
type AdzunaJob = {
  id?: string;
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
  category?: {
    label?: string;
  };
};
type RemotiveJob = {
  id?: number;
  title?: string;
  company_name?: string;
  candidate_required_location?: string;
  salary?: string;
  job_type?: string;
  description?: string;
  url?: string;
  publication_date?: string;
  category?: string;
  tags?: string[];
};

type SearchPlan = {
  keywords: string;
  location: string;
  page: number;
  priority: number;
};

function cleanInput(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function uniqueItems(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

/* EVERY COUNTRY SUPPORT */
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

function isGlobalSearch(location: string) {
  const value = cleanInput(location);

  return (
    !value ||
    value === "all" ||
    value === "all countries" ||
    value === "every country" ||
    value === "worldwide" ||
    value === "global" ||
    value === "international"
  );
}

/* ADVANCED LOCATION INTELLIGENCE */
const locationMap: Record<string, string[]> = {
  dubai: ["Dubai", "United Arab Emirates", "UAE"],
  uae: ["United Arab Emirates", "Dubai", "Abu Dhabi", "Sharjah"],
  "united arab emirates": [
    "United Arab Emirates",
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
  ],
  "abu dhabi": ["Abu Dhabi", "United Arab Emirates"],
  sharjah: ["Sharjah", "United Arab Emirates"],

  qatar: ["Qatar", "Doha"],
  doha: ["Doha", "Qatar"],

  saudi: ["Saudi Arabia", "Riyadh", "Jeddah"],
  "saudi arabia": ["Saudi Arabia", "Riyadh", "Jeddah"],
  riyadh: ["Riyadh", "Saudi Arabia"],
  jeddah: ["Jeddah", "Saudi Arabia"],

  uk: ["United Kingdom", "London", "Manchester", "Birmingham"],
  "united kingdom": ["United Kingdom", "London", "Manchester", "Birmingham"],
  england: ["United Kingdom", "London", "Manchester", "Birmingham"],
  london: ["London", "United Kingdom"],
  manchester: ["Manchester", "United Kingdom"],
  birmingham: ["Birmingham", "United Kingdom"],
  romford: ["Romford", "London", "United Kingdom"],
  walthamstow: ["Walthamstow", "London", "United Kingdom"],

  usa: ["United States", "New York", "California", "Texas"],
  us: ["United States", "New York", "California", "Texas"],
  "united states": ["United States", "New York", "California", "Texas"],
  "new york": ["New York", "United States"],
  california: ["California", "United States"],
  texas: ["Texas", "United States"],

  canada: ["Canada", "Toronto", "Vancouver"],
  toronto: ["Toronto", "Canada"],
  vancouver: ["Vancouver", "Canada"],

  india: ["India", "Bangalore", "Mumbai", "Delhi", "Kochi", "Kerala"],
  kerala: ["Kerala", "Kochi", "India"],
  kochi: ["Kochi", "Kerala", "India"],
  bangalore: ["Bangalore", "India"],
  bengaluru: ["Bangalore", "India"],
  mumbai: ["Mumbai", "India"],
  delhi: ["Delhi", "India"],
  calicut: ["Calicut", "Kerala", "India"],
  kozhikode: ["Kozhikode", "Kerala", "India"],

  pakistan: ["Pakistan", "Karachi", "Lahore", "Islamabad"],
  oman: ["Oman", "Muscat"],
  kuwait: ["Kuwait", "Kuwait City"],
  bahrain: ["Bahrain", "Manama"],

  singapore: ["Singapore"],
  australia: ["Australia", "Sydney", "Melbourne"],
  sydney: ["Sydney", "Australia"],
  melbourne: ["Melbourne", "Australia"],

  germany: ["Germany", "Berlin", "Munich"],
  berlin: ["Berlin", "Germany"],
  munich: ["Munich", "Germany"],

  france: ["France", "Paris"],
  paris: ["Paris", "France"],

  netherlands: ["Netherlands", "Amsterdam"],
  amsterdam: ["Amsterdam", "Netherlands"],

  ireland: ["Ireland", "Dublin"],
  dublin: ["Dublin", "Ireland"],

  malaysia: ["Malaysia", "Kuala Lumpur"],
  "kuala lumpur": ["Kuala Lumpur", "Malaysia"],

  remote: ["Remote", "Worldwide"],
  worldwide: ["Worldwide", "Remote"],
  global: ["Worldwide", "Remote"],
};
function getAdzunaCountryCode(location: string) {
  const value = cleanInput(location);

  const map: Record<string, string> = {
    "united kingdom": "gb",
    uk: "gb",
    england: "gb",
    london: "gb",
    manchester: "gb",
    birmingham: "gb",

    "united states": "us",
    usa: "us",
    us: "us",
    "new york": "us",
    california: "us",
    texas: "us",

    canada: "ca",
    australia: "au",
    austria: "at",
    belgium: "be",
    brazil: "br",
    france: "fr",
    germany: "de",
    india: "in",
    italy: "it",
    mexico: "mx",
    netherlands: "nl",
    "new zealand": "nz",
    poland: "pl",
    singapore: "sg",
    "south africa": "za",
    spain: "es",
    switzerland: "ch",
  };

  for (const [key, code] of Object.entries(map)) {
    if (value.includes(key) || key.includes(value)) {
      return code;
    }
  }

  return "gb";
}

function smartLocations(location: string) {
  const value = cleanInput(location);
  const allCountries = getAllCountryNames();

  if (isGlobalSearch(location)) {
    return uniqueItems([
      "Worldwide",
      "Remote",
      "United States",
      "United Kingdom",
      "Canada",
      "Australia",
      "United Arab Emirates",
      "Qatar",
      "Saudi Arabia",
      "India",
      "Pakistan",
      "Oman",
      "Kuwait",
      "Singapore",
      "Germany",
      "France",
      "Ireland",
      "Netherlands",
      ...allCountries,
    ]);
  }

  for (const [key, locations] of Object.entries(locationMap)) {
    if (value.includes(key) || key.includes(value)) {
      return uniqueItems(locations);
    }
  }

  const exactCountry = allCountries.find(
    (country) => cleanInput(country) === value
  );

  if (exactCountry) return [exactCountry];

  const partialCountries = allCountries.filter((country) =>
    cleanInput(country).includes(value)
  );

  if (partialCountries.length > 0) {
    return partialCountries.slice(0, 10);
  }

  return uniqueItems([location, titleCase(location)]);
}

/* ADVANCED JOB INTELLIGENCE */
const jobGroups: Record<string, string[]> = {
  Finance: [
    "finance assistant",
    "accounts assistant",
    "junior accountant",
    "bookkeeper",
    "payroll assistant",
    "credit controller",
    "accounts payable assistant",
    "accounts receivable assistant",
    "audit assistant",
    "finance analyst",
    "billing assistant",
    "purchase ledger clerk",
  ],
  Retail: [
    "retail assistant",
    "sales assistant",
    "store assistant",
    "customer assistant",
    "cashier",
    "shop assistant",
    "store associate",
    "sales associate",
    "retail sales assistant",
  ],
  Data: [
    "data analyst",
    "junior data analyst",
    "business analyst",
    "reporting analyst",
    "data assistant",
    "BI analyst",
    "analytics assistant",
    "data entry assistant",
  ],
  Technology: [
    "junior software developer",
    "software developer",
    "software engineer",
    "frontend developer",
    "backend developer",
    "full stack developer",
    "web developer",
    "react developer",
    "python developer",
    "flutter developer",
    "mobile app developer",
  ],
  Hospitality: [
    "hotel receptionist",
    "front desk assistant",
    "guest service agent",
    "receptionist",
    "barista",
    "waiter",
    "restaurant assistant",
    "hotel assistant",
    "housekeeping assistant",
  ],
  Driving: [
    "driver",
    "delivery driver",
    "courier driver",
    "van driver",
    "truck driver",
    "uber driver",
    "taxi driver",
  ],
  Warehouse: [
    "warehouse operative",
    "warehouse assistant",
    "picker packer",
    "logistics assistant",
    "inventory assistant",
    "stock assistant",
    "fulfilment associate",
  ],
  Admin: [
    "admin assistant",
    "office assistant",
    "administrator",
    "receptionist",
    "secretary",
    "data entry clerk",
    "office coordinator",
  ],
  Healthcare: [
    "care assistant",
    "support worker",
    "healthcare assistant",
    "nursing assistant",
    "medical assistant",
    "home care assistant",
  ],
  Marketing: [
    "marketing assistant",
    "digital marketing assistant",
    "social media assistant",
    "content assistant",
    "SEO assistant",
    "marketing executive",
  ],
  Education: [
    "teaching assistant",
    "teacher",
    "tutor",
    "education assistant",
    "school assistant",
    "learning support assistant",
  ],
  Security: ["security guard", "security officer", "door supervisor"],
  Cleaning: [
    "cleaner",
    "cleaning operative",
    "housekeeper",
    "housekeeping assistant",
  ],
};

function detectCategory(title: string) {
  const value = cleanInput(title);

  if (
    value.match(
      /finance|account|bookkeep|payroll|audit|tax|bank|credit|ledger|billing/
    )
  ) {
    return "Finance";
  }

  if (
    value.match(
      /retail|store|cashier|sales assistant|shop|customer assistant|sales associate/
    )
  ) {
    return "Retail";
  }

  if (
    value.match(
      /data|analyst|business intelligence|bi|reporting|analytics|data entry/
    )
  ) {
    return "Data";
  }

  if (
    value.match(
      /software|developer|engineer|frontend|backend|full stack|react|python|java|web|flutter|mobile app/
    )
  ) {
    return "Technology";
  }

  if (
    value.match(
      /hotel|hospitality|reception|front desk|guest|restaurant|waiter|barista|housekeeping/
    )
  ) {
    return "Hospitality";
  }

  if (value.match(/driver|delivery|courier|van|truck|taxi|uber/)) {
    return "Driving";
  }

  if (value.match(/warehouse|picker|packer|logistics|inventory|stock|fulfilment/)) {
    return "Warehouse";
  }

  if (value.match(/admin|office|assistant|secretary|administrator|coordinator/)) {
    return "Admin";
  }

  if (value.match(/care|health|nurse|support worker|healthcare|medical|home care/)) {
    return "Healthcare";
  }

  if (value.match(/marketing|social media|content|seo|digital/)) {
    return "Marketing";
  }

  if (value.match(/teacher|teaching|tutor|education|school|learning support/)) {
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

  const variants = [
    cleanTitle,
    cleanTitle.replace(/^junior\s+/i, ""),
    cleanTitle.replace(/\sassistant$/i, ""),
  ];

  if (jobGroups[category]) {
    variants.push(...jobGroups[category]);
  }

  if (category === "General") {
    variants.push(
      "retail assistant",
      "customer service assistant",
      "admin assistant",
      "sales assistant",
      "warehouse operative",
      "data entry assistant"
    );
  }

  return uniqueItems(variants).slice(0, 14);
}

function smartJobSuggestions(query: string) {
  const q = cleanInput(query);

  if (!q || q === "job" || q === "jobs" || q === "work") {
    return uniqueItems(Object.values(jobGroups).flat()).slice(0, 50);
  }

  const categoryMatches = Object.entries(jobGroups)
    .filter(
      ([category]) =>
        category.toLowerCase().includes(q) || q.includes(category.toLowerCase())
    )
    .flatMap(([, jobs]) => jobs);

  const directMatches = Object.values(jobGroups)
    .flat()
    .filter((job) => cleanInput(job).includes(q));

  return uniqueItems([...categoryMatches, ...directMatches]).slice(0, 50);
}

function smartLocationSuggestions(query: string) {
  const q = cleanInput(query);
  const allCountries = getAllCountryNames();

  if (!q || q === "location" || q === "place" || q === "city") {
    return uniqueItems([
      "Dubai",
      "United Arab Emirates",
      "London",
      "United Kingdom",
      "India",
      "Canada",
      "United States",
      "Australia",
      "Qatar",
      "Saudi Arabia",
      "Oman",
      "Kuwait",
      "Pakistan",
      "Germany",
      "France",
      "Remote",
      "Worldwide",
      ...allCountries,
    ]).slice(0, 80);
  }

  const mapMatches = Object.entries(locationMap)
    .filter(([key]) => key.includes(q) || q.includes(key))
    .flatMap(([, locations]) => locations);

  const directMatches = Object.values(locationMap)
    .flat()
    .filter((location) => cleanInput(location).includes(q));

  const countryMatches = allCountries.filter((country) =>
    cleanInput(country).includes(q)
  );

  return uniqueItems([...mapMatches, ...directMatches, ...countryMatches]).slice(
    0,
    80
  );
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
  const text = cleanInput(
    `${job.title || ""} ${job.type || ""} ${job.snippet || ""}`
  );

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

  if (
    text.match(/intern|trainee|entry level|graduate|junior|assistant|no experience/)
  ) {
    return "Entry / Junior";
  }

  if (text.match(/senior|lead|manager|head of|director|principal/)) {
    return "Senior / Lead";
  }

  return "Mid / General";
}

function buildTags(
  job: JoobleJob,
  category: string,
  jobType: string,
  seniority: string
) {
  const tags = [category, jobType, seniority];

  const text = cleanInput(
    `${job.title || ""} ${job.location || ""} ${job.snippet || ""}`
  );

  if (text.includes("remote")) tags.push("Remote");
  if (text.includes("immediate start")) tags.push("Immediate start");
  if (text.includes("no experience")) tags.push("No experience");
  if (text.includes("visa")) tags.push("Visa mentioned");
  if (job.salary) tags.push("Salary listed");
  if (job.link) tags.push("Apply link");

  return uniqueItems(tags).slice(0, 6);
}

function scoreJob(job: JoobleJob, rawTitle: string, rawLocation: string) {
  let score = 20;

  const title = cleanInput(job.title || "");
  const company = cleanInput(job.company || "");
  const location = cleanInput(job.location || "");
  const description = cleanInput(job.snippet || "");
  const userTitle = cleanInput(rawTitle);
  const userLocation = cleanInput(rawLocation);

  const titleWords = userTitle.split(" ").filter((word) => word.length > 2);
  const locationWords = userLocation.split(" ").filter((word) => word.length > 2);

  if (title.includes(userTitle)) score += 30;
  if (description.includes(userTitle)) score += 12;

  for (const word of titleWords) {
    if (title.includes(word)) score += 10;
    if (description.includes(word)) score += 3;
  }

  for (const word of locationWords) {
    if (location.includes(word)) score += 10;
    if (description.includes(word)) score += 2;
  }

  if (company && company !== "company not listed") score += 7;
  if (job.salary) score += 8;
  if (job.link) score += 10;
  if (description.length > 200) score += 7;
  if (description.length > 500) score += 5;
  if (job.updated) score += 5;

  if (description.includes("no experience")) score += 4;
  if (description.includes("immediate start")) score += 5;
  if (description.includes("visa")) score += 3;
  if (description.includes("training provided")) score += 4;

  if (
    description.includes("click here") ||
    description.includes("no interview") ||
    description.includes("earn money fast") ||
    description.includes("work only 1 hour")
  ) {
    score -= 25;
  }

  return Math.max(Math.min(score, 98), 1);
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

  const skillBank = [
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
    "javascript",
    "typescript",
    "flutter",
    "teamwork",
    "organisation",
    "leadership",
    "problem solving",
    "time management",
    "administration",
    "inventory",
    "cash handling",
  ];

  const skills = skillBank.filter((skill) => text.includes(skill));

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

  return Array.isArray(data.results) ? data.results : [];
}
async function fetchRemotiveJobs(keywords: string) {
  const res = await fetch(
    `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(
      keywords
    )}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return [];
  }

  return Array.isArray(data.jobs) ? data.jobs : [];
}

function buildSearchPlans(rawTitle: string, rawLocation: string): SearchPlan[] {
  const keywordVariants = smartKeywordVariants(rawTitle);
  const locationVariants = smartLocations(rawLocation);
  const globalMode = isGlobalSearch(rawLocation);

  const plans: SearchPlan[] = [];

  const maxLocations = globalMode ? 18 : 4;
  const maxKeywords = globalMode ? 3 : 5;

  for (const location of locationVariants.slice(0, maxLocations)) {
    for (const keywords of keywordVariants.slice(0, maxKeywords)) {
      plans.push({ keywords, location, page: 1, priority: 1 });
    }
  }

  if (!globalMode) {
    for (const location of locationVariants.slice(0, 2)) {
      for (const keywords of keywordVariants.slice(0, 3)) {
        plans.push({ keywords, location, page: 2, priority: 2 });
      }
    }
  }

  if (!locationVariants.includes("Remote")) {
    plans.push({
      keywords: keywordVariants[0],
      location: "Remote",
      page: 1,
      priority: 3,
    });
  }

  return plans.slice(0, globalMode ? 54 : 26);
}

function getSmartReason(score: number) {
  if (score >= 75) return "Excellent match";
  if (score >= 55) return "Strong match";
  if (score >= 35) return "Good match";
  return "Broad match";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const rawTitle = searchParams.get("title") || "retail assistant";
    const rawLocation = searchParams.get("location") || "London";
    const limit = Number(searchParams.get("limit") || 30);

    const suggestionsOnly = searchParams.get("suggestions") === "true";
    const suggestionQuery = searchParams.get("q") || rawTitle;
    const suggestionType = searchParams.get("type") || "job";

    if (suggestionsOnly) {
      return NextResponse.json({
        jobs:
          suggestionType === "job"
            ? smartJobSuggestions(suggestionQuery)
            : smartJobSuggestions(rawTitle),
        locations:
          suggestionType === "location"
            ? smartLocationSuggestions(suggestionQuery)
            : smartLocationSuggestions(rawLocation),
      });
    }

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

   const joobleJobs = results.flatMap((result) =>
  result.status === "fulfilled" ? result.value : []
);

const adzunaJobs = await fetchAdzunaJobs(rawTitle, rawLocation);
const remotiveJobs = await fetchRemotiveJobs(rawTitle);

const allJobs = [
  ...joobleJobs,

  ...adzunaJobs.map((job: AdzunaJob) => ({
    title: job.title,
    company: job.company?.display_name,
    location: job.location?.display_name || rawLocation,
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
  })),

  ...remotiveJobs.map((job: RemotiveJob) => ({
    title: job.title,
    company: job.company_name,
    location: job.candidate_required_location || "Remote",
    salary: job.salary,
    type: job.job_type || "Remote",
    snippet: job.description,
    link: job.url,
    updated: job.publication_date,
    source: "Remotive",
  })),
];
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
          applyUrl: "",
          source: job.source || "Jooble",
          posted: job.updated || "Recently posted",
          category,
          seniority,
          matchScore,
          tags: buildTags(job, category, jobType, seniority),
          smartReason: getSmartReason(matchScore),
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
      smartSuggestions: {
        jobs: smartJobSuggestions(rawTitle),
        locations: smartLocationSuggestions(rawLocation),
      },
      searchPlansUsed: plans.length,
      globalReady: true,
      everyCountryReady: true,
      smarterSearch: true,
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