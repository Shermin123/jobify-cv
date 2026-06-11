"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import { supabase } from "@/lib/supabase";
import { checkSubscription } from "@/lib/checkSubscription";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import EmojiBackground from "@/app/components/EmojiBackground";
import HiredAtBox from "@/app/components/HiredAtBox";
import mammoth from "mammoth";

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const resultRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [text, setText] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [country, setCountry] = useState("");
  const [showSetupPopup, setShowSetupPopup] = useState(false);
const [setupStep, setSetupStep] = useState(0);
const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  

  const [experienceLevel, setExperienceLevel] = useState("");
  const [jobType, setJobType] = useState("");
  const [industry, setIndustry] = useState("");
  const [cvGoal, setCvGoal] = useState("");
  const [urgency, setUrgency] = useState("");

  const [cv, setCv] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [atsScore, setAtsScore] = useState(94);

  const [displayCv, setDisplayCv] = useState("");
  const [displayCoverLetter, setDisplayCoverLetter] = useState("");

  const [loading, setLoading] = useState(false);
const [rephrasing, setRephrasing] = useState<"cv" | "cover" | null>(null);
const [generated, setGenerated] = useState(false);
  const [typing, setTyping] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  const savedCountry = sessionStorage.getItem("jobify_country");
  const savedRole = sessionStorage.getItem("jobify_role");
  const savedFreeCvText = sessionStorage.getItem("jobify_free_cv_text");

  const savedExperienceLevel = sessionStorage.getItem("jobify_experience_level");
  const savedJobType = sessionStorage.getItem("jobify_job_type");
  const savedIndustry = sessionStorage.getItem("jobify_industry");
  const savedCvGoal = sessionStorage.getItem("jobify_cv_goal");
  const savedUrgency = sessionStorage.getItem("jobify_urgency");

  if (savedCountry) setCountry(savedCountry);
  if (savedRole) setJobRole(savedRole);
  if (savedFreeCvText) setText(savedFreeCvText);

  if (savedExperienceLevel) setExperienceLevel(savedExperienceLevel);
  if (savedJobType) setJobType(savedJobType);
  if (savedIndustry) setIndustry(savedIndustry);
  if (savedCvGoal) setCvGoal(savedCvGoal);
  if (savedUrgency) setUrgency(savedUrgency);

  const setupCompleted = sessionStorage.getItem("jobify_setup_completed");

  if (!setupCompleted) {
  setSetupStep(0);
  setShowSetupPopup(true);
}

  const checkAccessStatus = async () => {
    if (!session?.user?.email) {
      setIsUnlocked(false);
      return;
    }

    const hasAccess = await checkSubscription(session.user.email);
    setIsUnlocked(hasAccess);
  };

  checkAccessStatus();
}, [session?.user?.email]);

useEffect(() => {
  if (!showSetupPopup) return;

  const originalOverflow = document.body.style.overflow;
  const originalPosition = document.body.style.position;
  const originalWidth = document.body.style.width;

  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.width = "100%";

  return () => {
    document.body.style.overflow = originalOverflow;
    document.body.style.position = originalPosition;
    document.body.style.width = originalWidth;
  };
}, [showSetupPopup]);

  const clearTypingTimer = () => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  };

  const typeText = (
    fullCvText: string,
    fullCoverText: string,
    speed = 16,
    onComplete?: () => void
  ) => {
    clearTypingTimer();

    setDisplayCv("");
    setDisplayCoverLetter("");
    setTyping(true);
    setShowUnlock(false);

    let index = 0;
    const maxLength = Math.max(fullCvText.length, fullCoverText.length);

    typingTimerRef.current = setInterval(() => {
      index += 3;

      setDisplayCv(fullCvText.substring(0, index));
      setDisplayCoverLetter(fullCoverText.substring(0, index));

      if (index >= maxLength) {
        clearTypingTimer();
        if (onComplete) onComplete();
      }
    }, speed);
  };

  const typeDocuments = (finalCv: string, finalCoverLetter: string) => {
    const cvPreview = finalCv.substring(0, 900);
    const coverPreview = finalCoverLetter.substring(0, 800);

    typeText(cvPreview, coverPreview, 16, () => {
      setTimeout(() => {
        setTyping(false);
        setShowUnlock(true);
      }, 700);
    });
  };

  const copyText = async (value: string, label: string) => {
    if (!value) {
      alert(`${label} is empty`);
      return;
    }

    await navigator.clipboard.writeText(value);
    alert(`${label} copied!`);
  };
  const handleWordUpload = async (file: File) => {
  if (!file) return;

  if (!file.name.endsWith(".docx")) {
    alert("Please upload a DOCX file");
    return;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();

    const result = await mammoth.extractRawText({
      arrayBuffer,
    });

    setText(result.value);
  } catch {
    alert("Could not read this Word file");
  }
};
  const rephraseDocument = async (type: "cv" | "cover") => {
  const content = type === "cv" ? cv : coverLetter;

  if (!content) {
    alert(type === "cv" ? "CV is empty" : "Cover letter is empty");
    return;
  }

  

  setRephrasing(type);

  try {
    const res = await fetch("/api/rephrase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        type,
        jobRole,
        country,
        jobDescription,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Rephrase failed");
    }

    if (type === "cv") {
      setCv(data.rephrased);
      setDisplayCv(data.rephrased.substring(0, 900));
    } else {
      setCoverLetter(data.rephrased);
      setDisplayCoverLetter(data.rephrased.substring(0, 800));
    }
  } catch (err: any) {
    alert(err.message || "Could not rephrase");
  } finally {
    setRephrasing(null);
  }
};
    
  const openEditor = (type: "cv" | "cover") => {
  if (!session) {
    router.push("/login");
    return;
  }

  const content = type === "cv" ? cv : coverLetter;

  if (!content) {
    alert(type === "cv" ? "CV is empty" : "Cover letter is empty");
    return;
  }

  sessionStorage.setItem(
    "jobify_editor_title",
    type === "cv" ? "Edited CV" : "Edited Cover Letter"
  );

  sessionStorage.setItem("jobify_editor_content", content);
  sessionStorage.setItem("jobify_editor_type", type);

  router.push("/editor");
};


  const downloadPDF = (title: string, content: string, fileName: string) => {
    if (!content) {
      alert(`${title} is empty`);
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 15;
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 6;

    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(title, margin, y);

    y += 12;

    doc.setFontSize(11);

    const keywordList = keywords
      .filter(Boolean)
      .map((k) => k.trim())
      .filter(Boolean);

    const escapeRegex = (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const keywordRegex =
      keywordList.length > 0
        ? new RegExp(`(${keywordList.map(escapeRegex).join("|")})`, "gi")
        : null;

    const paragraphs = content.split("\n");

    paragraphs.forEach((paragraph) => {
      const wrappedLines = doc.splitTextToSize(paragraph || " ", maxWidth);

      wrappedLines.forEach((line: string) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }

        if (!keywordRegex) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(55, 65, 81);
          doc.text(line, margin, y);
          y += lineHeight;
          return;
        }

        const parts = line.split(keywordRegex);
        let x = margin;

        parts.forEach((part: string) => {
          if (!part) return;

          const isKeyword = keywordList.some(
            (keyword) => keyword.toLowerCase() === part.toLowerCase()
          );

          const textWidth = doc.getTextWidth(part);

if (isKeyword) {
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
} else {
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
}

doc.text(part, x, y);
x += textWidth;
        });

        y += lineHeight;
      });

      y += 2;
    });

    doc.save(fileName);
  };
  const downloadDOCX = async (
  title: string,
  content: string,
  fileName: string
) => {
  if (!content) {
    alert(`${title} is empty`);
    return;
  }

  const keywordList = keywords
    .filter(Boolean)
    .map((k) => k.trim())
    .filter(Boolean);

  const escapeRegex = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const keywordRegex =
    keywordList.length > 0
      ? new RegExp(`(${keywordList.map(escapeRegex).join("|")})`, "gi")
      : null;

  const makeRuns = (line: string) => {
    if (!keywordRegex) {
      return [
        new TextRun({
          text: line || " ",
          size: 22,
        }),
      ];
    }

    return line.split(keywordRegex).filter(Boolean).map((part) => {
      const isKeyword = keywordList.some(
        (keyword) => keyword.toLowerCase() === part.toLowerCase()
      );

      return new TextRun({
        text: part,
        size: 22,
        bold: isKeyword,
        color: isKeyword ? "000000" : "374151",
highlight: undefined,
      });
    });
  };

  const paragraphs = content.split("\n").map(
    (line) =>
      new Paragraph({
        children: makeRuns(line),
        spacing: {
          after: 160,
        },
      })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: 34,
                color: "0F172A",
              }),
            ],
            spacing: {
              after: 320,
            },
          }),
          ...paragraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
};

  const highlightKeywords = (
    content: string,
    highlightColor: "blue" | "purple"
  ) => {
    if (!content) return null;

    if (!keywords.length) {
      return content;
    }

    const escapedKeywords = keywords
      .filter(Boolean)
      .map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    if (!escapedKeywords.length) {
      return content;
    }

    const regex = new RegExp(`(${escapedKeywords.join("|")})`, "gi");

    return content.split(regex).map((part, index) => {
      const isKeyword = keywords.some(
        (keyword) => keyword.toLowerCase() === part.toLowerCase()
      );

      if (!isKeyword) {
        return <span key={index}>{part}</span>;
      }

      return (
        <strong
          key={index}
          className="font-black text-black"
        >
          {part}
        </strong>
      );
    });
  };

  const generateAll = async () => {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    const saveGeneratedDocument = async (
      finalCv: string,
      finalCoverLetter: string,
      finalKeywords: string[],
      finalAtsScore: number
    ) => {
      if (!session?.user?.email) return;

      const { error } = await supabase.from("generated_documents").insert({
        user_email: session.user.email,
        job_role: jobRole,
        country,
        original_cv: text,
        job_description: jobDescription,
        optimized_cv: finalCv,
        cover_letter: finalCoverLetter,
        keywords: finalKeywords,
        ats_score: finalAtsScore,
      });

      if (error) {
        console.error("Supabase save error:", error.message);
      }
    };

    if (!text) return alert("Please paste your CV first");

    if (wordCount < 80) {
      return alert(
        "Please paste at least 80 words from your CV for better AI results."
      );
    }

    setLoading(true);
    setGenerated(true);
    setTyping(true);
    setShowUnlock(false);

    setCv("");
    setCoverLetter("");
    setKeywords([]);
    setDisplayCv("");
    setDisplayCoverLetter("");

    setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    const fakeCvTyping = `Reading your CV...
Finding your strongest achievements...
Checking your AI setup answers...
Improving your professional summary...
Adding ATS keywords...
Rewriting your CV for recruiters...
Preparing your tailored CV preview...`;

    const fakeCoverTyping = `Reading the job description...
Matching your experience to the role...
Using your country, industry and job type...
Writing a personalised opening...
Improving professional tone...
Preparing your cover letter preview...`;

    typeText(fakeCvTyping, fakeCoverTyping, 25);

    try {
      const res = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  cvText: text,
  jobRole,
  country,
  jobDescription,
  userEmail: session?.user?.email,
  experienceLevel,
  jobType,
  industry,
  cvGoal,
  urgency,
}),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to generate");

      const finalCv =
        data.optimizedCV ||
        data.cv ||
        "Your ATS-optimised CV has been generated successfully.";

      const finalCoverLetter =
        data.coverLetter ||
        "Your personalised cover letter has been generated successfully.";

      const finalKeywords = data.keywords || [];
      const finalAtsScore = data.atsScore || 94;

      setCv(finalCv);
      setCoverLetter(finalCoverLetter);
      setKeywords(finalKeywords);
      setAtsScore(finalAtsScore);

      await saveGeneratedDocument(
        finalCv,
        finalCoverLetter,
        finalKeywords,
        finalAtsScore
      );

      typeDocuments(finalCv, finalCoverLetter);
    } catch (err: any) {
      alert(err.message);
      setGenerated(false);
      setTyping(false);
      clearTypingTimer();
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockClick = () => {
    if (!session) {
      router.push("/login");
      return;
    }

    if (!isUnlocked) {
      router.push("/pricing");
      return;
    }

    alert("Full access is active.");
  };
  const countrySuggestions = [
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
  "Sao Tome and Principe",
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

const roleSuggestions = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Web Developer",
  "Mobile App Developer",
  "Flutter Developer",
  "React Developer",
  "Next.js Developer",
  "Java Developer",
  "Python Developer",
  "Node.js Developer",
  "PHP Developer",
  "Laravel Developer",
  "WordPress Developer",
  "iOS Developer",
  "Android Developer",
  "Game Developer",
  "Embedded Systems Engineer",
  "Firmware Engineer",
  "Blockchain Developer",
  "Smart Contract Developer",

  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "AI Engineer",
  "Data Engineer",
  "BI Analyst",
  "Power BI Developer",
  "Tableau Developer",
  "NLP Engineer",
  "Computer Vision Engineer",
  "Research Assistant",
  "AI Researcher",

  "Cyber Security Analyst",
  "Security Engineer",
  "Penetration Tester",
  "SOC Analyst",
  "Information Security Manager",
  "Network Security Engineer",
  "Cloud Security Engineer",

  "DevOps Engineer",
  "Cloud Engineer",
  "AWS Engineer",
  "Azure Engineer",
  "GCP Engineer",
  "Site Reliability Engineer",
  "Linux Administrator",
  "System Administrator",
  "Network Engineer",

  "UI Designer",
  "UX Designer",
  "UI/UX Designer",
  "Product Designer",
  "Graphic Designer",
  "Motion Designer",
  "3D Artist",
  "Interior Designer",
  "Video Editor",
  "Animator",

  "Product Manager",
  "Project Manager",
  "Program Manager",
  "Scrum Master",
  "Business Analyst",
  "Operations Manager",
  "Operations Coordinator",
  "Office Manager",

  "Business Development Manager",
  "Business Development Executive",
  "Strategy Analyst",
  "Consultant",
  "Management Consultant",
  "Entrepreneur",
  "Founder",

  "Accountant",
  "Accounts Assistant",
  "Bookkeeper",
  "Financial Analyst",
  "Investment Banker",
  "Auditor",
  "Risk Analyst",
  "Tax Consultant",
  "Bank Teller",
  "Loan Officer",
  "Payroll Officer",
  "Finance Assistant",

  "Marketing Manager",
  "Digital Marketing Specialist",
  "SEO Specialist",
  "Content Writer",
  "Copywriter",
  "Social Media Manager",
  "Brand Manager",
  "Public Relations Officer",
  "Email Marketing Specialist",
  "Performance Marketing Specialist",

  "Sales Executive",
  "Sales Manager",
  "Account Manager",
  "Business Development Executive",
  "Retail Sales Associate",
  "Sales Assistant",
  "Customer Advisor",
  "Store Assistant",
  "Store Manager",
  "Cashier",

  "HR Manager",
  "HR Executive",
  "Recruiter",
  "Talent Acquisition Specialist",
  "Training Coordinator",
  "HR Assistant",
  "People Operations Assistant",

  "Doctor",
  "Nurse",
  "Healthcare Assistant",
  "Care Assistant",
  "Support Worker",
  "Pharmacist",
  "Dentist",
  "Radiologist",
  "Physiotherapist",
  "Medical Lab Technician",
  "Clinical Assistant",

  "Teacher",
  "Lecturer",
  "Professor",
  "Teaching Assistant",
  "School Principal",
  "Tutor",
  "Academic Advisor",

  "Civil Engineer",
  "Mechanical Engineer",
  "Electrical Engineer",
  "Electronics Engineer",
  "Automotive Engineer",
  "Aerospace Engineer",
  "Chemical Engineer",
  "Structural Engineer",
  "Site Engineer",
  "Quality Engineer",

  "Logistics Manager",
  "Supply Chain Analyst",
  "Warehouse Manager",
  "Warehouse Operative",
  "Picker Packer",
  "Delivery Driver",
  "Truck Driver",
  "Courier Driver",
  "Operations Coordinator",
  "Inventory Assistant",

  "Customer Support Agent",
  "Call Center Agent",
  "Customer Success Manager",
  "Help Desk Technician",
  "Technical Support Specialist",
  "Live Chat Support Agent",

  "Police Officer",
  "Security Officer",
  "Administrative Officer",
  "Civil Servant",
  "Government Clerk",
  "Admin Assistant",
  "Office Assistant",
  "Data Entry Clerk",

  "Lawyer",
  "Legal Assistant",
  "Paralegal",
  "Legal Advisor",
  "Compliance Officer",

  "Hotel Manager",
  "Receptionist",
  "Front Desk Agent",
  "Chef",
  "Commis Chef",
  "Kitchen Assistant",
  "Waiter",
  "Waitress",
  "Barista",
  "Bartender",
  "Housekeeping Staff",
  "Cleaner",
  "Restaurant Manager",

  "Architect",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Construction Worker",
  "Painter",
  "Maintenance Technician",
  "HVAC Technician",

  "Photographer",
  "Videographer",
  "Film Editor",
  "Actor",
  "Music Producer",
  "Content Creator",
  "Influencer",
  "Journalist",

  "Research Scientist",
  "Lab Technician",
  "Biologist",
  "Chemist",
  "Physicist",
  "Environmental Scientist",

  "Intern",
  "Trainee",
  "Graduate Trainee",
  "Fresher",
  "Apprentice",
  "Part-time Worker",
  "Temporary Worker",
];

const filteredCountries = countrySuggestions
  .filter((c) => c.toLowerCase().includes(country.toLowerCase().trim()))
  .slice(0, 10);

const filteredRoles = roleSuggestions
  .filter((r) => r.toLowerCase().includes(jobRole.toLowerCase().trim()))
  .slice(0, 10);

const setupAnswers = [
  country,
  jobRole,
  experienceLevel,
  jobType,
  industry,
  cvGoal,
  urgency,
];

const canGoNext = Boolean(setupAnswers[setupStep]);

const saveSetupAndContinue = () => {
  sessionStorage.setItem("jobify_country", country);
  sessionStorage.setItem("jobify_role", jobRole);
  sessionStorage.setItem("jobify_experience_level", experienceLevel);
  sessionStorage.setItem("jobify_job_type", jobType);
  sessionStorage.setItem("jobify_industry", industry);
  sessionStorage.setItem("jobify_cv_goal", cvGoal);
  sessionStorage.setItem("jobify_urgency", urgency);
  sessionStorage.setItem("jobify_setup_completed", "true");

  setShowSetupPopup(false);

  setTimeout(() => {
    document
      .getElementById("ai-setup-summary")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 150);
};

const nextSetupStep = () => {
  if (setupStep < 6) {
    setSetupStep((prev) => prev + 1);
    return;
  }

  saveSetupAndContinue();
};

const previousSetupStep = () => {
  if (setupStep > 0) {
    setSetupStep((prev) => prev - 1);
  }
};
  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }
  if (showSetupPopup) {
  return (
    <main className="fixed inset-0 z-[9999] flex h-[100svh] w-screen items-center justify-center overflow-hidden bg-[#303647] px-3 py-2 text-slate-950">
      <div className="relative flex h-[calc(100svh-16px)] w-full max-w-[430px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_35px_100px_rgba(0,0,0,0.35)] animate-popupIn sm:h-auto sm:max-h-[calc(100svh-32px)]">
        {/* TOP LIGHT SHAPE */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-28 -top-24 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
          <div className="absolute left-0 top-0 h-36 w-full bg-gradient-to-br from-blue-50 via-white to-transparent" />
          <div className="absolute right-[-30px] top-[65px] h-28 w-[120%] rotate-[-14deg] bg-blue-50/80" />
        </div>

        <div
  className="relative flex h-full min-h-0 flex-col p-4 overscroll-contain sm:p-5"
  style={{ WebkitOverflowScrolling: "touch" }}
>
          {/* TOP ROW */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-[11px] font-black text-white shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-dotPulse" />
              AI Setup
            </div>

            <p className="text-xs font-black text-slate-400">
              {setupStep + 1}/7
            </p>
          </div>

          {/* TITLE */}
          <div className="mt-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl font-black text-white shadow-[0_18px_40px_rgba(37,99,235,0.35)] animate-iconFloat">
              ✦
            </div>

            <h1 className="mt-3 text-[24px] font-black tracking-[-0.04em] text-slate-950">
              Personalise your CV
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Answer a few quick questions for better AI results.
            </p>
          </div>

          {/* PROGRESS */}
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${((setupStep + 1) / 7) * 100}%` }}
            />
          </div>

          {/* QUESTION BOX */}
          <div
  key={setupStep}
  className="mt-3 min-h-0 flex-1 overflow-y-auto rounded-[20px] border border-slate-200 bg-white/95 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.08)] animate-questionIn sm:p-4"
>
            {setupStep === 0 && (
              <div className="relative">
                <h3 className="text-lg font-black text-slate-950">
                  🌍 Applying in which country?
                </h3>

                <input
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Type country, e.g. United Kingdom"
                  value={country}
                  onFocus={() => setShowCountrySuggestions(true)}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setShowCountrySuggestions(true);
                  }}
                />

                {showCountrySuggestions &&
                  country &&
                  filteredCountries.length > 0 && (
                    <div className="absolute z-40 mt-2 max-h-36 w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
                      {filteredCountries.slice(0, 8).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setCountry(c);
                            setShowCountrySuggestions(false);
                          }}
                          className="block w-full p-3 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            )}

            {setupStep === 1 && (
              <div className="relative">
                <h3 className="text-lg font-black text-slate-950">
                  🎯 Target job role?
                </h3>

                <input
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Type role, e.g. Software Engineer"
                  value={jobRole}
                  onFocus={() => setShowRoleSuggestions(true)}
                  onChange={(e) => {
                    setJobRole(e.target.value);
                    setShowRoleSuggestions(true);
                  }}
                />

                {showRoleSuggestions && jobRole && filteredRoles.length > 0 && (
                  <div className="absolute z-40 mt-2 max-h-36 w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    {filteredRoles.slice(0, 8).map((r, index) => (
                      <button
                        key={`${r}-${index}`}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setJobRole(r);
                          setShowRoleSuggestions(false);
                        }}
                        className="block w-full p-3 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {setupStep === 2 && (
              <QuestionButtons
                title="📈 Experience level?"
                value={experienceLevel}
                setValue={setExperienceLevel}
                options={[
                  "Student / Fresher",
                  "0-1 years",
                  "1-3 years",
                  "3-5 years",
                  "5+ years",
                  "No experience",
                  "Internship experience",
                  "Freelance experience",
                ]}
              />
            )}

            {setupStep === 3 && (
              <QuestionButtons
                title="💼 Job type?"
                value={jobType}
                setValue={setJobType}
                options={[
                  "Full-time",
                  "Part-time",
                  "Internship",
                  "Graduate role",
                  "Remote job",
                  "Career switch",
                  "Contract",
                  "Temporary",
                ]}
              />
            )}

            {setupStep === 4 && (
              <QuestionButtons
                title="🏢 Industry?"
                value={industry}
                setValue={setIndustry}
                options={[
                  "Technology",
                  "Retail",
                  "Hospitality",
                  "Healthcare",
                  "Finance",
                  "Education",
                  "Customer Service",
                  "Warehouse",
                  "Data / AI",
                  "Software",
                  "Administration",
                ]}
              />
            )}

            {setupStep === 5 && (
              <QuestionButtons
                title="✨ Improve what most?"
                value={cvGoal}
                setValue={setCvGoal}
                options={[
                  "ATS keywords",
                  "Professional wording",
                  "Achievements",
                  "Career switch",
                  "CV structure",
                  "Grammar",
                  "Improve bullet points",
                  "Highlight transferable skills",
                ]}
              />
            )}

            {setupStep === 6 && (
              <QuestionButtons
                title="⏳ Applying when?"
                value={urgency}
                setValue={setUrgency}
                options={[
                  "Today",
                  "This week",
                  "This month",
                  "Just preparing",
                  "Urgent application",
                  "Interview tomorrow",
                  "Applying after improving CV",
                ]}
              />
            )}
          </div>

          {/* BUTTONS */}
          <div className="mt-3 shrink-0 flex gap-3 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => {
                if (setupStep === 0) {
                  setShowSetupPopup(false);
                  return;
                }

                previousSetupStep();
              }}
              className="w-1/2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50 active:scale-95"
            >
              {setupStep === 0 ? "Cancel" : "Back"}
            </button>

            <button
              type="button"
              onClick={nextSetupStep}
              disabled={!canGoNext}
              className="w-1/2 rounded-2xl bg-slate-950 py-3 text-sm font-black text-white transition hover:bg-blue-700 active:scale-95 disabled:bg-slate-400"
            >
              {setupStep === 6 ? "Start →" : "Next →"}
            </button>
          </div>
        </div>
            </div>

      <style jsx>{`
        @keyframes popupIn {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.96);
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes questionIn {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.985);
            filter: blur(5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes iconFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes dotPulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.25);
          }
        }

        .animate-popupIn {
          animation: popupIn 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-questionIn {
          animation: questionIn 0.32s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-iconFloat {
          animation: iconFloat 3.2s ease-in-out infinite;
        }

        .animate-dotPulse {
          animation: dotPulse 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
  return (
    <main className="relative min-h-screen text-gray-900 overflow-x-hidden">
     {false && showSetupPopup && (
  <div className="fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-slate-950/80 px-4 py-3 backdrop-blur-2xl">
    <div
  className="relative w-full max-w-md max-h-[calc(100svh-1.5rem)] overflow-y-auto overscroll-contain rounded-[28px] border border-white/20 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.45)] animate-cinemaIn"
  style={{ WebkitOverflowScrolling: "touch" }}
>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 left-[-40%] h-40 w-[180%] rotate-[-8deg] bg-gradient-to-r from-transparent via-blue-200/40 to-transparent animate-lightSweep" />
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative p-5">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-[11px] font-black text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            AI Setup
          </div>

          <p className="text-xs font-black text-slate-400">
            {setupStep + 1}/7
          </p>
        </div>

        <div className="mt-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl text-white shadow-xl animate-float">
            ✦
          </div>

          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
            Personalise your CV
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Answer a few quick questions for better AI results.
          </p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-700 ease-out"
            style={{ width: `${((setupStep + 1) / 7) * 100}%` }}
          />
        </div>

        <div
          key={setupStep}
          className="mt-5 rounded-[22px] border border-slate-200 bg-white/95 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] animate-questionCut"
        >
          {setupStep === 0 && (
            <div className="relative">
              <h3 className="text-lg font-black text-slate-950">
                🌍 Applying in which country?
              </h3>

              <input
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type country, e.g. United Kingdom"
                value={country}
                onFocus={() => setShowCountrySuggestions(true)}
                onClick={(e) => {
                  setTimeout(() => {
                    e.currentTarget.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }, 250);
                }}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setShowCountrySuggestions(true);
                }}
              />

              {showCountrySuggestions &&
                country &&
                filteredCountries.length > 0 && (
                  <div className="absolute z-30 mt-2 max-h-36 w-full overflow-auto rounded-2xl border bg-white shadow-2xl">
                    {filteredCountries.slice(0, 8).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setCountry(c);
                          setShowCountrySuggestions(false);
                        }}
                        className="block w-full p-3 text-left text-sm font-semibold hover:bg-blue-50"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          )}

          {setupStep === 1 && (
            <div className="relative">
              <h3 className="text-lg font-black text-slate-950">
                🎯 Target job role?
              </h3>

              <input
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type role, e.g. Software Engineer"
                value={jobRole}
                onFocus={() => setShowRoleSuggestions(true)}
                onClick={(e) => {
                  setTimeout(() => {
                    e.currentTarget.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }, 250);
                }}
                onChange={(e) => {
                  setJobRole(e.target.value);
                  setShowRoleSuggestions(true);
                }}
              />

              {showRoleSuggestions && jobRole && filteredRoles.length > 0 && (
                <div className="absolute z-30 mt-2 max-h-36 w-full overflow-auto rounded-2xl border bg-white shadow-2xl">
                  {filteredRoles.slice(0, 8).map((r, index) => (
                    <button
                      key={`${r}-${index}`}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setJobRole(r);
                        setShowRoleSuggestions(false);
                      }}
                      className="block w-full p-3 text-left text-sm font-semibold hover:bg-blue-50"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {setupStep === 2 && (
            <QuestionButtons
              title="📈 Experience level?"
              value={experienceLevel}
              setValue={setExperienceLevel}
              options={[
                "Student / Fresher",
                "0-1 years",
                "1-3 years",
                "3-5 years",
                "5+ years",
                "No experience",
                "Internship experience",
                "Freelance experience",
              ]}
            />
          )}

          {setupStep === 3 && (
            <QuestionButtons
              title="💼 Job type?"
              value={jobType}
              setValue={setJobType}
              options={[
                "Full-time",
                "Part-time",
                "Internship",
                "Graduate role",
                "Remote job",
                "Career switch",
                "Contract",
                "Temporary",
                "Night shift",
                "Weekend job",
              ]}
            />
          )}

          {setupStep === 4 && (
            <QuestionButtons
              title="🏢 Industry?"
              value={industry}
              setValue={setIndustry}
              options={[
                "Technology",
                "Retail",
                "Hospitality",
                "Healthcare",
                "Finance",
                "Education",
                "Customer Service",
                "Warehouse",
                "Construction",
                "Marketing",
                "Data / AI",
                "Software",
                "Administration",
              ]}
            />
          )}

          {setupStep === 5 && (
            <QuestionButtons
              title="✨ Improve what most?"
              value={cvGoal}
              setValue={setCvGoal}
              options={[
                "ATS keywords",
                "Professional wording",
                "Achievements",
                "Career switch",
                "CV structure",
                "Grammar",
                "Shorten my CV",
                "Make it sound confident",
                "Improve bullet points",
                "Highlight transferable skills",
              ]}
            />
          )}

          {setupStep === 6 && (
            <QuestionButtons
              title="⏳ Applying when?"
              value={urgency}
              setValue={setUrgency}
              options={[
                "Today",
                "This week",
                "This month",
                "Just preparing",
                "Urgent application",
                "Interview tomorrow",
                "Applying after improving CV",
              ]}
            />
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => {
              if (setupStep === 0) {
                setShowSetupPopup(false);
                return;
              }

              previousSetupStep();
            }}
            className="w-1/2 rounded-2xl border border-slate-200 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50"
          >
            {setupStep === 0 ? "Cancel" : "Back"}
          </button>

          <button
            type="button"
            onClick={nextSetupStep}
            disabled={!canGoNext}
            className="w-1/2 rounded-2xl bg-slate-950 py-3 text-sm font-black text-white transition hover:scale-[1.02] hover:bg-blue-700 disabled:opacity-40 disabled:hover:scale-100"
          >
            {setupStep === 6 ? "Start →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

  {(loading || rephrasing) && (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white/80 px-4 backdrop-blur-xl">
    <div className="w-full max-w-[310px] rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-2xl animate-cookIn">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-gradient-to-br from-blue-600 to-indigo-600 text-4xl shadow-xl animate-cookPot">
        {loading ? "👨‍🍳" : "✨"}
      </div>

      <h3 className="mt-5 text-2xl font-black text-slate-950">
        {loading
          ? "Cooking your CV"
          : rephrasing === "cv"
          ? "Polishing your CV"
          : "Polishing your letter"}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {loading
          ? "Adding ATS keywords, stronger wording, and recruiter-friendly structure."
          : "Making it smoother, sharper, and more professional."}
      </p>

      <div className="mt-6 flex justify-center gap-2">
        <span className="h-3 w-3 rounded-full bg-blue-600 animate-cookDotOne" />
        <span className="h-3 w-3 rounded-full bg-indigo-600 animate-cookDotTwo" />
        <span className="h-3 w-3 rounded-full bg-purple-600 animate-cookDotThree" />
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-cookBar" />
      </div>
    </div>
  </div>
)}

{/* BACKGROUND */}
<EmojiBackground />

      {/* HEADER */}
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-4">
  <div className="bg-white/85 backdrop-blur-xl border rounded-3xl p-6 shadow-sm text-center">
    <h1 className="text-3xl md:text-5xl font-black tracking-tight">
      🚀 AI CV Studio
    </h1>

    <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
      Paste your CV and job description. Jobify creates an ATS-friendly CV
      and cover letter in seconds.
    </p>
    

    {isUnlocked && (
      <div className="inline-flex mt-4 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-full text-sm font-bold">
        ✅ Subscription active — full access unlocked
      </div>
    )}

  </div>
</section>

      <section className="max-w-6xl mx-auto px-4 pb-10 space-y-6">
        {/* RESULTS */}
        {generated && (
          <section ref={resultRef} className="space-y-5">
            <div className="rounded-3xl bg-slate-950 text-white p-4 md:p-6 shadow-2xl overflow-hidden relative">
              <div className="absolute right-6 top-5 text-6xl opacity-10">
                {typing ? "✍️" : isUnlocked ? "✅" : "🔒"}
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <p className="text-sm text-blue-300 font-semibold">
                    {typing
                      ? "AI is writing your documents..."
                      : isUnlocked
                      ? "Full access active"
                      : "Preview generated"}
                  </p>

                  <h2 className="text-2xl md:text-3xl font-black mt-1">
                    {typing
                      ? "Creating your tailored CV package"
                      : isUnlocked
                      ? "Your documents are unlocked"
                      : "Your CV package is ready"}
                  </h2>

                  <p className="text-white/60 text-sm mt-2">
                    {typing
                      ? "Matching keywords, improving structure and writing your application."
                      : isUnlocked
                      ? "You can copy and use your full CV and cover letter."
                      : "ATS score and keywords are visible. Subscribe to unlock documents."}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 min-w-full md:min-w-[360px]">
                  <div className="bg-white/10 rounded-2xl p-3 text-center">
                    <p className="text-xs text-white/50">ATS</p>
                    <h3 className="text-2xl font-black text-emerald-300">
                      {atsScore}%
                    </h3>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-3 text-center">
                    <p className="text-xs text-white/50">Docs</p>
                    <h3 className="text-2xl font-black">2</h3>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-3 text-center">
                    <p className="text-xs text-white/50">Words</p>
                    <h3 className="text-2xl font-black text-blue-300">
                      {keywords.length || 8}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* KEYWORDS */}
            <div className="bg-white/90 backdrop-blur-xl border rounded-3xl p-5 shadow-sm">
              <h3 className="font-black text-lg mb-3">
                🎯 ATS Keywords Detected
              </h3>

              <div className="flex flex-wrap gap-2">
                {keywords.length > 0 ? (
                  keywords.map((k, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-black shadow-md"
                    >
                      <span>✓</span>
                      <strong>{k}</strong>
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    Keywords will appear here after generation.
                  </p>
                )}
              </div>
            </div>

            {/* DOCUMENT PREVIEW CARDS */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* CV CARD */}
              <div className="group relative overflow-hidden rounded-[2rem] border border-blue-100 bg-white/90 backdrop-blur-xl shadow-2xl transition-all duration-700 hover:-translate-y-2 hover:shadow-blue-200/60">
                <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 bg-[length:200%_100%] animate-gradientMove" />
                <div className="absolute -top-24 -right-24 h-52 w-52 rounded-full bg-blue-200 blur-3xl opacity-40 group-hover:opacity-70 transition" />

                <div className="relative p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition duration-500">
                        📄
                      </div>

                      <div>
                        <h3 className="font-black text-lg">Generated CV</h3>
                        <p className="text-xs text-gray-500">
                          ATS-ready resume preview
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 text-xs font-black animate-softPulse">
                      {typing ? "WRITING" : isUnlocked ? "UNLOCKED" : "LOCKED"}
                    </span>
                  </div>

                  <div className="relative mt-5 rounded-3xl bg-slate-50/90 border border-blue-100 p-4 h-[230px] md:h-[280px] overflow-hidden shadow-inner">
                    {typing && (
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-blue-100/40 to-transparent -translate-x-full animate-shimmer" />
                    )}

                    <div
                      className={`text-xs md:text-sm text-gray-700 whitespace-pre-line leading-5 md:leading-6 transition-all duration-700 ${
                        isUnlocked ? "" : "blur-sm select-none"
                      }`}
                    >
                      {highlightKeywords(displayCv, "blue")}
                      {typing && (
                        <span className="animate-pulse font-black text-blue-600">
                          |
                        </span>
                      )}
                    </div>

                    {!isUnlocked && showUnlock && (
                      <div className="absolute inset-0 bg-white/75 backdrop-blur-md flex items-center justify-center animate-fadeUp">
                        <div className="text-center px-5">
                          <div className="text-5xl mb-3 animate-bounce">🔒</div>
                          <h4 className="font-black text-lg">Unlock full CV</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            View, copy and download your full CV.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {showUnlock && (
  <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
    <button
      onClick={() =>
        isUnlocked
          ? downloadPDF("Optimised CV", cv, "jobify-optimised-cv.pdf")
          : handleUnlockClick()
      }
      className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-2xl font-black hover:scale-[1.02] transition shadow-lg"
    >
      {isUnlocked ? "Download CV PDF" : "Subscribe to Unlock CV"}
    </button>
    <button
  onClick={() =>
    isUnlocked
      ? downloadDOCX("Optimised CV", cv, "jobify-optimised-cv.docx")
      : handleUnlockClick()
  }
  className="w-full rounded-2xl border border-blue-200 bg-white py-3 font-black text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:opacity-50"
>
  {isUnlocked ? "Download DOCX" : "Unlock DOCX"}
</button>
    

    <button
      onClick={() => rephraseDocument("cv")}
      disabled={rephrasing === "cv" || typing}
      className="w-full rounded-2xl border border-blue-200 bg-white py-3 font-black text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:opacity-50"
    >
      {rephrasing === "cv" ? "Rephrasing..." : "✨ Rephrase CV"}
    </button>
      <button
  onClick={() => openEditor("cv")}
  className="w-full rounded-2xl border border-blue-200 bg-white py-3 font-black text-blue-700 shadow-sm transition hover:bg-blue-50"
>
  ✏️ Edit CV
</button>
   
  </div>
)}
                </div>
              </div>

              {/* COVER LETTER CARD */}
              <div className="group relative overflow-hidden rounded-[2rem] border border-purple-100 bg-white/90 backdrop-blur-xl shadow-2xl transition-all duration-700 hover:-translate-y-2 hover:shadow-purple-200/60">
                <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-[length:200%_100%] animate-gradientMove" />
                <div className="absolute -top-24 -right-24 h-52 w-52 rounded-full bg-purple-200 blur-3xl opacity-40 group-hover:opacity-70 transition" />

                <div className="relative p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition duration-500">
                        ✉️
                      </div>

                      <div>
                        <h3 className="font-black text-lg">Cover Letter</h3>
                        <p className="text-xs text-gray-500">
                          Personalised application letter
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 text-xs font-black animate-softPulse">
                      {typing ? "WRITING" : isUnlocked ? "UNLOCKED" : "LOCKED"}
                    </span>
                  </div>

                  <div className="relative mt-5 rounded-3xl bg-slate-50/90 border border-purple-100 p-4 h-[230px] md:h-[280px] overflow-hidden shadow-inner">
                    {typing && (
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-purple-100/40 to-transparent -translate-x-full animate-shimmer" />
                    )}

                    <div
                      className={`text-xs md:text-sm text-gray-700 whitespace-pre-line leading-5 md:leading-6 transition-all duration-700 ${
                        isUnlocked ? "" : "blur-sm select-none"
                      }`}
                    >
                      {highlightKeywords(displayCoverLetter, "purple")}
                      {typing && (
                        <span className="animate-pulse font-black text-purple-600">
                          |
                        </span>
                      )}
                    </div>

                    {!isUnlocked && showUnlock && (
                      <div className="absolute inset-0 bg-white/75 backdrop-blur-md flex items-center justify-center animate-fadeUp">
                        <div className="text-center px-5">
                          <div className="text-5xl mb-3 animate-bounce">🔒</div>
                          <h4 className="font-black text-lg">
                            Unlock cover letter
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Copy and send your personalised letter.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {showUnlock && (
  <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
    <button
      onClick={() =>
        isUnlocked
          ? downloadPDF(
              "Cover Letter",
              coverLetter,
              "jobify-cover-letter.pdf"
            )
          : handleUnlockClick()
      }
      className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-2xl font-black hover:scale-[1.02] transition shadow-lg"
    >
      {isUnlocked ? "Download PDF" : "Subscribe"}
    </button>

    <button
      onClick={() =>
        isUnlocked
          ? downloadDOCX(
              "Cover Letter",
              coverLetter,
              "jobify-cover-letter.docx"
            )
          : handleUnlockClick()
      }
      className="w-full rounded-2xl border border-purple-200 bg-white py-3 font-black text-purple-700 shadow-sm transition hover:bg-purple-50"
    >
      {isUnlocked ? "Download DOCX" : "Unlock DOCX"}
    </button>

    <button
      onClick={() => rephraseDocument("cover")}
      disabled={rephrasing === "cover" || typing}
      className="w-full rounded-2xl border border-purple-200 bg-white py-3 font-black text-purple-700 shadow-sm transition hover:bg-purple-50 disabled:opacity-50"
    >
      {rephrasing === "cover" ? "Rephrasing..." : "✨ Rephrase"}
    </button>
      <button
  onClick={() => openEditor("cover")}
  className="w-full rounded-2xl border border-purple-200 bg-white py-3 font-black text-purple-700 shadow-sm transition hover:bg-purple-50"
>
  ✏️ Edit Letter
</button>
  </div>
)}
                </div>
              </div>
            </div>

            {/* COPY BUTTONS */}
            {isUnlocked && showUnlock && (
              <div className="grid md:grid-cols-3 gap-3">
                <button
                  onClick={() => copyText(cv, "CV")}
                  className="bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-lg"
                >
                  Copy CV
                </button>

                <button
                  onClick={() => copyText(coverLetter, "Cover letter")}
                  className="bg-purple-600 text-white py-3 rounded-2xl font-bold hover:bg-purple-700 shadow-lg"
                >
                  Copy Cover Letter
                </button>

                <button
                  onClick={() => copyText(keywords.join(", "), "Keywords")}
                  className="bg-emerald-600 text-white py-3 rounded-2xl font-bold hover:bg-emerald-700 shadow-lg"
                >
                  Copy Keywords
                </button>
              </div>
            )}

            {!isUnlocked && showUnlock && (
              <button
                onClick={() => router.push("/pricing")}
                className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg hover:bg-gray-800 shadow-xl"
              >
                Subscribe to Unlock Full Result
              </button>
            )}
          </section>
        )}
       
        {/* INPUT FORM */}
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white/90 backdrop-blur-xl shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500" />

          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-100 blur-3xl opacity-70" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-100 blur-3xl opacity-70" />

          <div className="relative p-4 md:p-7 space-y-5 md:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  ✨ AI CV Builder
                </div>

                <h2 className="mt-3 text-xl md:text-2xl font-black text-slate-900">
                  Create your tailored application
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Paste your CV and job description. Jobify will rewrite your CV
                  and cover letter for the role.
                </p>
              </div>

              <div className="bg-slate-50 border rounded-2xl p-3 min-w-[260px]">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide text-center mb-2">
                  Powered by AI workflow
                </p>

                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"
                      className="h-5"
                      alt="OpenAI"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      OpenAI
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"
                      className="h-5"
                      alt="AI"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      ATS AI
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {(experienceLevel || jobType || industry || cvGoal || urgency) && (
              <div
  id="ai-setup-summary"
  className="rounded-3xl border border-blue-100 bg-blue-50 p-4"
>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  <p className="text-sm font-black text-blue-700">
    🤖 AI setup loaded from your answers
  </p>

  <button
    type="button"
    onClick={() => {
      setSetupStep(0);
      setShowSetupPopup(true);
    }}
    className="rounded-full bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-700 transition"
  >
    Edit answers
  </button>
</div>

                <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
                  {experienceLevel && (
                    <span className="rounded-full bg-white border px-3 py-2 font-bold text-slate-600">
                      Level: {experienceLevel}
                    </span>
                  )}

                  {jobType && (
                    <span className="rounded-full bg-white border px-3 py-2 font-bold text-slate-600">
                      Type: {jobType}
                    </span>
                  )}

                  {industry && (
                    <span className="rounded-full bg-white border px-3 py-2 font-bold text-slate-600">
                      Industry: {industry}
                    </span>
                  )}

                  {cvGoal && (
                    <span className="rounded-full bg-white border px-3 py-2 font-bold text-slate-600">
                      Focus: {cvGoal}
                    </span>
                  )}

                  {urgency && (
                    <span className="rounded-full bg-white border px-3 py-2 font-bold text-slate-600">
                      Applying: {urgency}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-800">
                  Target Job Role
                </span>
                <span className="text-xs text-slate-400">
                  Optional but recommended
                </span>
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                  🎯
                </span>

                <input
                  className="w-full border border-slate-200 bg-slate-50/70 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  placeholder="e.g. Software Engineer, Data Analyst, AI Engineer"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-sm font-black text-slate-900">
                      📄 Paste Your CV
                    </label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Minimum 80 words required for better results.
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-600 text-white px-3 py-1 text-[10px] font-black">
                    REQUIRED
                  </span>
                </div>
                <input
  type="file"
  accept=".docx"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) handleWordUpload(file);
  }}
  className="mb-3 w-full rounded-2xl border border-blue-100 bg-white p-3 text-sm font-semibold text-slate-600"
/>
                <textarea
                  className="w-full border border-blue-100 bg-white p-3 md:p-4 rounded-2xl h-44 md:h-64 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-inner text-sm leading-6"
                  placeholder="Paste your CV here...

Example:
Professional Summary
Work Experience
Skills
Education
Projects"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span
                    className={
                      text.trim().split(/\s+/).filter(Boolean).length < 80
                        ? "text-red-500 font-semibold"
                        : "text-green-600 font-semibold"
                    }
                  >
                    {text.trim().split(/\s+/).filter(Boolean).length} / 80 words
                  </span>

                  <span className="text-slate-500">Best result: 150+ words</span>
                </div>
              </div>

              <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-sm font-black text-slate-900">
                      💼 Paste Job Description
                    </label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Add the job advert for stronger keyword matching.
                    </p>
                  </div>

                  <span className="rounded-full bg-purple-600 text-white px-3 py-1 text-[10px] font-black">
                    RECOMMENDED
                  </span>
                </div>

                <textarea
                  className="w-full border border-purple-100 bg-white p-3 md:p-4 rounded-2xl h-44 md:h-64 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none shadow-inner text-sm leading-6"
                  placeholder="Paste the job description here...

Example:
Responsibilities
Required skills
Experience needed
Company requirements"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {jobDescription.trim().split(/\s+/).filter(Boolean).length}{" "}
                    words
                  </span>
                  <span>Improves ATS keyword match</span>
                </div>
              </div>
            </div>

            <button
              onClick={generateAll}
              disabled={
                loading ||
                !text ||
                text.trim().split(/\s+/).filter(Boolean).length < 80
              }
              className="group relative w-full overflow-hidden rounded-2xl bg-black py-4 font-black text-white shadow-xl transition hover:bg-slate-900 disabled:opacity-50"
            >
              <span className="relative z-10">
                {loading
                  ? "Generating documents..."
                  : "🚀 Generate Tailored CV & Cover Letter"}
              </span>

              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition duration-700" />
            </button>

            {text && text.trim().split(/\s+/).filter(Boolean).length < 80 && (
              <p className="text-center text-sm font-semibold text-red-500">
                Please add at least 80 words from your CV to continue.
              </p>
            )}

            
          </div>
        </div>

        {!generated && (
          <div className="bg-white/90 backdrop-blur-xl border rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-black">Your results will appear here</h2>

            <p className="text-sm text-gray-500 mt-2">
              Keywords and ATS score are visible after generation. CV and cover
              letter unlock after subscription.
            </p>
          </div>
        )}
        <HiredAtBox />
      </section>

      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes cinemaIn {
  0% {
    opacity: 0;
    transform: perspective(900px) rotateX(8deg) scale(0.92) translateY(24px);
    filter: blur(10px);
  }
  60% {
    opacity: 1;
    transform: perspective(900px) rotateX(0deg) scale(1.02) translateY(0);
    filter: blur(0px);
  }
  100% {
    opacity: 1;
    transform: perspective(900px) rotateX(0deg) scale(1) translateY(0);
    filter: blur(0px);
  }
}

@keyframes questionCut {
  0% {
    opacity: 0;
    transform: translateY(18px) scale(0.98);
    filter: blur(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes lightSweep {
  0% {
    transform: translateX(-40%) rotate(-8deg);
  }
  100% {
    transform: translateX(40%) rotate(-8deg);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

.animate-cinemaIn {
  animation: cinemaIn 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-questionCut {
  animation: questionCut 0.42s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-lightSweep {
  animation: lightSweep 2.8s ease-in-out infinite alternate;
}

.animate-float {
  animation: float 2.6s ease-in-out infinite;
}
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes softPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.04);
            opacity: 0.85;
          }
        }

        .animate-shimmer {
          animation: shimmer 1.4s infinite;
        }

        .animate-gradientMove {
          animation: gradientMove 3s linear infinite;
        }

        .animate-fadeUp {
          animation: fadeUp 0.5s ease-out;
        }

        .animate-softPulse {
          animation: softPulse 1.6s ease-in-out infinite;
        }
        
    
      @keyframes cookIn {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes cookPot {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-5px) rotate(-3deg);
  }
  50% {
    transform: translateY(0) rotate(3deg);
  }
  75% {
    transform: translateY(-3px) rotate(-2deg);
  }
}

@keyframes cookDot {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.35;
  }
  50% {
    transform: translateY(-7px);
    opacity: 1;
  }
}

@keyframes cookBar {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(220%);
  }
}

.animate-cookIn {
  animation: cookIn 0.35s ease-out;
}

.animate-cookPot {
  animation: cookPot 1.4s ease-in-out infinite;
}

.animate-cookDotOne {
  animation: cookDot 0.9s ease-in-out infinite;
}

.animate-cookDotTwo {
  animation: cookDot 0.9s ease-in-out infinite 0.15s;
}

.animate-cookDotThree {
  animation: cookDot 0.9s ease-in-out infinite 0.3s;
}

.animate-cookBar {
  animation: cookBar 1.15s ease-in-out infinite;
}
      `}</style>
    </main>
  );
}
function QuestionButtons({
  title,
  value,
  setValue,
  options,
}: {
  title: string;
  value: string;
  setValue: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <h3 className="text-lg font-black text-slate-950">{title}</h3>

      <div className="mt-4 grid grid-cols-1 gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setValue(option)}
            className={
              value === option
                ? "rounded-2xl border border-blue-600 bg-blue-600 px-3 py-2.5 text-left text-sm font-black text-white shadow-[0_12px_26px_rgba(37,99,235,0.22)] active:scale-95"
                : "rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-bold text-slate-700 active:scale-95"
            }
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}