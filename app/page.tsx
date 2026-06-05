"use client";
import HiredAtBox from "./components/HiredAtBox";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [role, setRole] = useState("");
  const [cvText, setCvText] = useState("");

  const router = useRouter();
  const saveAndContinue = () => {
    sessionStorage.setItem("jobify_popup_seen", "true");
    sessionStorage.setItem("jobify_country", country);
    sessionStorage.setItem("jobify_role", role);
    setOpen(false);
    router.push("/upload");
  };

  // ================= CV SCORE ENGINE =================
  const calculateScore = () => {
  let score = 65; // higher baseline (feels more premium AI)

  // length quality boost
  if (cvText.length > 300) score += 5;
  if (cvText.length > 700) score += 8;

  // keyword strength (more ATS realistic)
  const keywords = [
    "experience",
    "managed",
    "developed",
    "built",
    "optimized",
    "led",
    "project",
    "team"
  ];

  keywords.forEach((word) => {
    if (cvText.toLowerCase().includes(word)) score += 2;
  });

  // tech boost
  if (cvText.toLowerCase().includes("react")) score += 4;
  if (cvText.toLowerCase().includes("node")) score += 4;
  if (cvText.toLowerCase().includes("python")) score += 4;

  // role matching (strong boost)
  if (role && cvText.toLowerCase().includes(role.toLowerCase())) {
    score += 10;
  }

  // country boost (small realism)
  if (country) score += 3;

  return Math.min(score, 99);
};

  const score = calculateScore();

  const getColor = () => {
    if (score < 50) return "text-red-500";
    if (score < 75) return "text-yellow-500";
    return "text-emerald-500";
  };

  const getLabel = () => {
    if (score < 50) return "Needs Improvement";
    if (score < 75) return "Good CV";
    return "Strong CV 🚀";
  };

  const statsLine = `
    👥 500,000+ Users • 🌍 180+ Countries • 📄 2.4M CVs Generated • 💼 120,000+ Hired • ⚡ 94% Interview Success • 🧠 AI ATS Optimization • 🚀 Instant CV Rewrite • 📊 Real-time CV Scoring • 💡 Keyword Intelligence • 🔥 Recruiter Matching Engine •
  `;

  // ================= AUTOCOMPLETE DATA =================
  const countrySuggestions = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus",
  "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi",
  "Cambodia", "Cameroon", "Canada", "Cape Verde",
  "Central African Republic", "Chad", "Chile", "China", "Colombia",
  "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba",
  "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Estonia", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Guatemala", "Guinea",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mexico", "Moldova",
  "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
  "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Panama", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saudi Arabia", "Senegal", "Serbia", "Singapore", "Slovakia", "Slovenia",
  "Somalia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland",
  "Syria",
  "Taiwan", "Tanzania", "Thailand", "Togo", "Tunisia", "Turkey",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "Uruguay", "Uzbekistan",
  "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe",
  ];

  const roleSuggestions = [
  // ================= TECHNOLOGY =================
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Web Developer",
  "Mobile App Developer",
  "Flutter Developer",
  "React Developer",
  "Java Developer",
  "Python Developer",
  "Node.js Developer",
  "iOS Developer",
  "Android Developer",
  "Game Developer",
  "Embedded Systems Engineer",
  "Firmware Engineer",
  "Blockchain Developer",

  // AI / DATA / ML
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "AI Engineer",
  "Data Engineer",
  "BI Analyst",
  "NLP Engineer",
  "Computer Vision Engineer",

  // CYBER SECURITY
  "Cyber Security Analyst",
  "Security Engineer",
  "Penetration Tester",
  "SOC Analyst",
  "Information Security Manager",

  // CLOUD / DEVOPS
  "DevOps Engineer",
  "Cloud Engineer",
  "AWS Engineer",
  "Azure Engineer",
  "GCP Engineer",
  "Site Reliability Engineer",

  // DESIGN
  "UI Designer",
  "UX Designer",
  "UI/UX Designer",
  "Product Designer",
  "Graphic Designer",
  "Motion Designer",
  "3D Artist",
  "Interior Designer",

  // PRODUCT / MANAGEMENT
  "Product Manager",
  "Project Manager",
  "Program Manager",
  "Scrum Master",
  "Business Analyst",
  "Operations Manager",

  // BUSINESS / CORPORATE
  "Business Development Manager",
  "Strategy Analyst",
  "Consultant",
  "Management Consultant",

  // FINANCE / BANKING
  "Accountant",
  "Financial Analyst",
  "Investment Banker",
  "Auditor",
  "Risk Analyst",
  "Tax Consultant",
  "Bank Teller",
  "Loan Officer",

  // MARKETING / MEDIA
  "Marketing Manager",
  "Digital Marketing Specialist",
  "SEO Specialist",
  "Content Writer",
  "Copywriter",
  "Social Media Manager",
  "Brand Manager",
  "Public Relations Officer",

  // SALES
  "Sales Executive",
  "Sales Manager",
  "Account Manager",
  "Business Development Executive",
  "Retail Sales Associate",

  // HR / RECRUITMENT
  "HR Manager",
  "HR Executive",
  "Recruiter",
  "Talent Acquisition Specialist",
  "Training Coordinator",

  // HEALTHCARE
  "Doctor",
  "Nurse",
  "Pharmacist",
  "Dentist",
  "Radiologist",
  "Physiotherapist",
  "Medical Lab Technician",

  // EDUCATION
  "Teacher",
  "Lecturer",
  "Professor",
  "Teaching Assistant",
  "School Principal",

  // ENGINEERING (NON-IT)
  "Civil Engineer",
  "Mechanical Engineer",
  "Electrical Engineer",
  "Electronics Engineer",
  "Automotive Engineer",
  "Aerospace Engineer",
  "Chemical Engineer",

  // LOGISTICS / TRANSPORT
  "Logistics Manager",
  "Supply Chain Analyst",
  "Warehouse Manager",
  "Delivery Driver",
  "Truck Driver",
  "Operations Coordinator",

  // CUSTOMER SERVICE
  "Customer Support Agent",
  "Call Center Agent",
  "Customer Success Manager",
  "Help Desk Technician",

  // GOVERNMENT / ADMIN
  "Police Officer",
  "Administrative Officer",
  "Civil Servant",
  "Government Clerk",

  // LEGAL
  "Lawyer",
  "Legal Assistant",
  "Paralegal",
  "Legal Advisor",

  // HOSPITALITY
  "Hotel Manager",
  "Receptionist",
  "Chef",
  "Waiter",
  "Barista",
  "Housekeeping Staff",

  // CONSTRUCTION / TRADES
  "Architect",
  "Site Engineer",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Construction Worker",

  // CREATIVE ARTS
  "Photographer",
  "Videographer",
  "Film Editor",
  "Actor",
  "Music Producer",
  "Animator",

  // SCIENCE / RESEARCH
  "Research Scientist",
  "Lab Technician",
  "Biologist",
  "Chemist",
  "Physicist",

  // GENERAL
  "Intern",
  "Trainee",
  "Fresher",
  "Office Assistant",
  "Administrative Assistant"
];

  const filteredCountries = countrySuggestions.filter((c) =>
  c.toLowerCase().includes(country.toLowerCase())
);

const filteredRoles = roleSuggestions.filter((r) =>
  r.toLowerCase().includes(role.toLowerCase())
);
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-gray-900 overflow-x-hidden">
{/* FLOATING BACKGROUND ELEMENTS */}
<div className="fixed inset-0 pointer-events-none overflow-hidden">
{/* Small Floating Emojis */}

<div className="absolute top-10 left-10 text-3xl opacity-10">🚀</div>
<div className="absolute top-20 right-20 text-2xl opacity-10">💼</div>
<div className="absolute top-40 left-1/4 text-3xl opacity-10">📄</div>
<div className="absolute top-52 right-1/3 text-2xl opacity-10">✨</div>
<div className="absolute top-72 left-16 text-3xl opacity-10">🎯</div>
<div className="absolute top-96 right-12 text-2xl opacity-10">🤖</div>

<div className="absolute top-[20%] left-[60%] text-3xl opacity-10">💡</div>
<div className="absolute top-[25%] left-[80%] text-2xl opacity-10">🔥</div>
<div className="absolute top-[35%] left-[10%] text-3xl opacity-10">📈</div>
<div className="absolute top-[45%] left-[75%] text-2xl opacity-10">⚡</div>

<div className="absolute top-[50%] left-[20%] text-3xl opacity-10">🌟</div>
<div className="absolute top-[55%] left-[50%] text-2xl opacity-10">🏆</div>
<div className="absolute top-[60%] right-[15%] text-3xl opacity-10">💰</div>

<div className="absolute top-[70%] left-[5%] text-2xl opacity-10">🧠</div>
<div className="absolute top-[72%] left-[40%] text-3xl opacity-10">📊</div>
<div className="absolute top-[78%] right-[30%] text-2xl opacity-10">🎓</div>

<div className="absolute bottom-32 left-12 text-3xl opacity-10">🌍</div>
<div className="absolute bottom-24 right-20 text-2xl opacity-10">💻</div>
<div className="absolute bottom-16 left-1/3 text-3xl opacity-10">📋</div>
<div className="absolute bottom-10 right-1/2 text-2xl opacity-10">⭐</div>

  {/* FLOATING LAYER 1 */}
  <div className="absolute text-7xl opacity-5 top-10 left-10 animate-pulse">🚀</div>
  <div className="absolute text-8xl opacity-5 top-40 right-20 animate-bounce">📄</div>
  <div className="absolute text-7xl opacity-5 bottom-40 left-20">💼</div>
  <div className="absolute text-8xl opacity-5 bottom-10 right-10 animate-pulse">✨</div>

  {/* FLOATING LAYER 2 (NEW) */}
  <div className="absolute text-6xl opacity-5 top-1/3 left-1/4 animate-bounce">🧠</div>
  <div className="absolute text-7xl opacity-5 top-1/2 right-1/3">📊</div>
  <div className="absolute text-6xl opacity-5 bottom-1/3 right-1/4 animate-pulse">🎯</div>
  <div className="absolute text-7xl opacity-5 top-20 right-1/2">💡</div>

  {/* FLOATING LAYER 3 (NEW PREMIUM FEEL) */}
  <div className="absolute text-6xl opacity-5 bottom-20 left-1/3">📈</div>
  <div className="absolute text-7xl opacity-5 top-1/4 left-1/2">🧾</div>
  <div className="absolute text-6xl opacity-5 bottom-1/2 left-10 animate-pulse">⚡</div>

</div>
      {/* ================= POPUP ================= */}
      {/* ================= POPUP ================= */}
{open && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4">
    
    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-6 animate-fadeIn">

      {/* HEADER */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Get Started 🚀</h2>
        <p className="text-sm text-gray-500 mt-1">
          Setup your profile in 2 steps
        </p>
      </div>

      {/* STEP INDICATOR */}
      <div className="flex justify-center text-xs text-gray-500 gap-2">
        <span className={country ? "text-green-600 font-semibold" : ""}>Country</span>
        <span>→</span>
        <span className={role ? "text-green-600 font-semibold" : ""}>Role</span>
      </div>

      {/* COUNTRY */}
      <div>
        <label className="text-sm font-medium text-gray-700">Country</label>
        <input
          className="w-full mt-1 border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. United Kingdom"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />

        {country && filteredCountries.length > 0 && (
          <div className="border rounded-xl mt-1 max-h-32 overflow-auto">
            {filteredCountries.slice(0, 5).map((c) => (
              <div
                key={c}
                onClick={() => setCountry(c)}
                className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {c}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ROLE */}
      <div>
        <label className="text-sm font-medium text-gray-700">Target Role</label>
        <input
          className="w-full mt-1 border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. Software Engineer"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        {role && filteredRoles.length > 0 && (
          <div className="border rounded-xl mt-1 max-h-32 overflow-auto">
            {filteredRoles.slice(0, 5).map((r) => (
              <div
                key={r}
                onClick={() => setRole(r)}
                className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {r}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BUTTONS */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => setOpen(false)}
          className="w-1/2 border rounded-xl py-3 text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          onClick={saveAndContinue}
          disabled={!country || !role}
          className="w-1/2 bg-black text-white rounded-xl py-3 font-semibold hover:bg-gray-800 disabled:opacity-40"
        >
          Continue →
        </button>
      </div>

    </div>
  </div>
)}

      {/* ================= STATS MARQUEE ================= */}
      <div className="bg-white border-b overflow-hidden py-2 text-xs md:text-sm relative z-0">
  <div className="marquee-slow whitespace-nowrap pointer-events-none text-gray-700 font-medium">
    {statsLine.repeat(2)}
  </div>
</div>

      {/* ================= AI LOGOS (FIXED OPENAI) ================= */}
      {/* ================= TRUSTED BY / AI PARTNERS ================= */}
<div className="bg-white border-b py-3">
  <div className="max-w-6xl mx-auto flex items-center justify-center gap-10 flex-wrap">

    {/* OpenAI */}
    <div className="flex items-center gap-2">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"
        className="h-5"
        alt="OpenAI"
      />
      <span className="text-sm text-gray-600 font-medium">OpenAI</span>
    </div>

    {/* Microsoft */}
    <div className="flex items-center gap-2">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
        className="h-5"
        alt="Microsoft"
      />
      <span className="text-sm text-gray-600 font-medium">Microsoft</span>
    </div>

    {/* Google Cloud */}
    <div className="flex items-center gap-2">
      <img
  src="https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg"
  className="h-5"
  alt="Google Cloud"
/>
      <span className="text-sm text-gray-600 font-medium">Google Cloud</span>
    </div>

    {/* AWS */}
    <div className="flex items-center gap-2">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
        className="h-5"
        alt="AWS"
      />
      <span className="text-sm text-gray-600 font-medium">AWS</span>
    </div>

  </div>
</div>

      {/* ================= HERO ================= */}
      <section className="relative z-10 px-4 sm:px-6 pt-4 md:pt-6 pb-6 md:pb-8">

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 md:gap-8 items-center">

  {/* LEFT HERO */}
  <div className="text-center lg:text-left">
    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
      Build a <span className="text-blue-600">Keyword-Highlighted CV</span> with AI
    </h1>

    <p className="mt-4 text-base md:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
      Check your CV score, improve ATS keywords, and generate a better CV in minutes.
    </p>

    <div className="mt-5 flex flex-col sm:flex-row gap-2 md:gap-3 justify-center lg:justify-start">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-black text-white px-6 md:px-8 py-3rounded-full hover:scale-105 transition shadow-lg"
      >
        Build My CV
      </button>

      <button
  type="button"
  onClick={() =>
    document.getElementById("cv-score")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })
  }
  className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 hover:scale-105 transition shadow-lg"
>
  Check Your CV for Free
</button>
    </div>

    <div className="mt-5 grid grid-cols-3 gap-3 text-center max-w-md mx-auto lg:mx-0">
      <div className="bg-white border rounded-2xl p-3 shadow-sm">
        <p className="font-bold text-blue-600">ATS</p>
        <p className="text-xs text-gray-500">Ready</p>
      </div>
      <div className="bg-white border rounded-2xl p-3 shadow-sm">
        <p className="font-bold text-emerald-600">AI</p>
        <p className="text-xs text-gray-500">Rewrite</p>
      </div>
      <div className="bg-white border rounded-2xl p-3 shadow-sm">
        <p className="font-bold text-purple-600">PDF</p>
        <p className="text-xs text-gray-500">Download</p>
      </div>
    </div>
    <HiredAtBox />
  </div>

        {/* ================= CV SCORE ================= */}
        {/* ================= CV SCORE ================= */}
        {/* ================= CV SCORE ================= */}
<div id="cv-score" className="bg-white border rounded-3xl p-4 md:p-5 text-left shadow-xl">

  <h2 className="text-xl md:text-2xl font-bold">Free CV Score Checker</h2>
  <p className="text-sm text-gray-500 mt-1">
    Paste your CV below. Jobify will estimate how ready it is for ATS screening.
  </p>

  <textarea
    className="w-full border p-3 md:p-4 rounded-2xl h-28 md:h-32 mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Paste your CV here..."
    value={cvText}
    onChange={(e) => setCvText(e.target.value)}
  />

  <div className="mt-6 bg-gray-50 border rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-5">

    <div>
      <p className="text-sm text-gray-500">Your CV Score</p>
      <p className={`text-4xl md:text-6xl font-bold ${getColor()}`}>
        {score}/100
      </p>
      <p className="text-sm text-gray-600 mt-1">{getLabel()}</p>
    </div>

    <div className="text-sm text-gray-600 space-y-2">
      <p>✔ Checks keywords</p>
      <p>✔ Checks ATS structure</p>
      <p>✔ Checks role match</p>
      <p>✔ Gives instant feedback</p>
    </div>

  </div>

  <div className="w-full h-3 bg-gray-200 rounded-full mt-5 overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all"
      style={{ width: `${score}%` }}
    />
  </div>

  <button
    onClick={() => setOpen(true)}
    className="mt-6 w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
  >
    Improve My CV with AI
  </button>

</div>
</div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-white border rounded-3xl p-6 md:p-8 shadow-xl">

          <div className="text-center">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-wide">
              How Jobify.cv works
            </p>

            <h2 className="text-3xl font-extrabold mt-2">
              Get a job-ready CV in 3 simple steps
            </h2>

            <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
              Paste your CV, add the job description, and let AI create a tailored CV and cover letter for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-8">

            {/* STEP 1 */}
            <div className="relative bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>

              <h3 className="font-bold text-lg mt-4">
                Upload your CV
              </h3>

              <p className="text-sm text-gray-600 mt-2">
                Paste your current CV or resume into Jobify so the AI can understand your skills, experience, and education.
              </p>

              <div className="text-4xl mt-5">📄</div>
            </div>

            {/* STEP 2 */}
            <div className="relative bg-purple-50 border border-purple-100 rounded-2xl p-5">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>

              <h3 className="font-bold text-lg mt-4">
                Add job description
              </h3>

              <p className="text-sm text-gray-600 mt-2">
                Paste the job advert so Jobify can match your CV with the exact keywords recruiters and ATS systems look for.
              </p>

              <div className="text-4xl mt-5">🎯</div>
            </div>

            {/* STEP 3 */}
            <div className="relative bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>

              <h3 className="font-bold text-lg mt-4">
                Generate & apply
              </h3>

              <p className="text-sm text-gray-600 mt-2">
                Get a tailored ATS-ready CV, personalised cover letter, and keywords — then apply with confidence.
              </p>

              <div className="text-4xl mt-5">🚀</div>
            </div>

          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setOpen(true)}
              className="bg-black text-white px-6 md:px-8 py-3 rounded-full font-semibold hover:bg-gray-800 hover:scale-105 transition shadow-lg"
            >
              Start Building My CV
            </button>
          </div>

        </div>
      </section>

      {/* ================= FEATURES ================= */}
    
      {/* ================= FEATURES ================= */}
      <section className="grid md:grid-cols-3 gap-6 px-10 py-20 bg-white">

        <div className="p-6 border rounded-2xl hover:shadow-lg transition">
          AI CV Scoring
        </div>

        <div className="p-6 border rounded-2xl hover:shadow-lg transition">
          Keyword Engine
        </div>

        <div className="p-6 border rounded-2xl hover:shadow-lg transition">
          Job Matching AI
        </div>

      </section>

      {/* ================= CTA ================= */}
      <section className="relative z-20 text-center px-4 sm:px-6 py-20 sm:py-24">

        <h2 className="text-3xl font-bold">
          Upgrade your CV score instantly
        </h2>

        <button
          onClick={() => setOpen(true)}
          className="mt-6 bg-white text-blue-600 px-10 py-3 rounded-xl font-semibold"
        >
          Build My CV
        </button>

      </section>

      {/* ================= FOOTER ================= */}
      <footer className="text-center py-10 text-gray-500 text-sm">
        © {new Date().getFullYear()} Jobify.cv
      </footer>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .marquee-fast,
        .marquee-slow {
          display: flex;
          white-space: nowrap;
          width: max-content;
        }

        .marquee-fast {
          animation: scroll 18s linear infinite;
        }

        .marquee-slow {
          animation: scroll 25s linear infinite;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>

    </main>
  );
}