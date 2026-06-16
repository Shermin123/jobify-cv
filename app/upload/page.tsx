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
  const [fullName, setFullName] = useState("");
const [educationLevel, setEducationLevel] = useState("");
const [certificates, setCertificates] = useState("");
const [portfolio, setPortfolio] = useState("");
const [workAvailability, setWorkAvailability] = useState("");
const [coverLetterNeed, setCoverLetterNeed] = useState("");
  const [mainStrength, setMainStrength] = useState("");
const [weaknessFix, setWeaknessFix] = useState("");
const [toneStyle, setToneStyle] = useState("");
const [cvLength, setCvLength] = useState("");
const getStored = (key: string) => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(key) || localStorage.getItem(key);
};

const setStored = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, value);
  localStorage.setItem(key, value);
};

  const [cv, setCv] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [atsScore, setAtsScore] = useState(97);

  const [displayCv, setDisplayCv] = useState("");
  const [displayCoverLetter, setDisplayCoverLetter] = useState("");

  const [loading, setLoading] = useState(false);
const [rephrasing, setRephrasing] = useState<"cv" | "cover" | null>(null);
const [generated, setGenerated] = useState(false);
  const [typing, setTyping] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
  

  const savedCountry = getStored("jobify_country");
const savedRole = getStored("jobify_role");
const savedFreeCvText = getStored("jobify_free_cv_text");

const savedExperienceLevel = getStored("jobify_experience_level");
const savedJobType = getStored("jobify_job_type");
const savedIndustry = getStored("jobify_industry");
const savedCvGoal = getStored("jobify_cv_goal");
const savedUrgency = getStored("jobify_urgency");
const savedFullName = getStored("jobify_full_name");
const savedEducationLevel = getStored("jobify_education_level");
const savedCertificates = getStored("jobify_certificates");
const savedPortfolio = getStored("jobify_portfolio");
const savedWorkAvailability = getStored("jobify_work_availability");
const savedCoverLetterNeed = getStored("jobify_cover_letter_need");
const savedMainStrength = getStored("jobify_main_strength");
const savedWeaknessFix = getStored("jobify_weakness_fix");
const savedToneStyle = getStored("jobify_tone_style");
const savedCvLength = getStored("jobify_cv_length");

  if (savedCountry) setCountry(savedCountry);
  if (savedRole) setJobRole(savedRole);
  if (savedFreeCvText) setText(savedFreeCvText);

  if (savedExperienceLevel) setExperienceLevel(savedExperienceLevel);
  if (savedJobType) setJobType(savedJobType);
  if (savedIndustry) setIndustry(savedIndustry);
  if (savedCvGoal) setCvGoal(savedCvGoal);
  if (savedUrgency) setUrgency(savedUrgency);
  if (savedFullName) setFullName(savedFullName);
if (savedEducationLevel) setEducationLevel(savedEducationLevel);
if (savedCertificates) setCertificates(savedCertificates);
if (savedPortfolio) setPortfolio(savedPortfolio);
if (savedWorkAvailability) setWorkAvailability(savedWorkAvailability);
if (savedCoverLetterNeed) setCoverLetterNeed(savedCoverLetterNeed);
  if (savedMainStrength) setMainStrength(savedMainStrength);
if (savedWeaknessFix) setWeaknessFix(savedWeaknessFix);
if (savedToneStyle) setToneStyle(savedToneStyle);
if (savedCvLength) setCvLength(savedCvLength);
  const savedGenerated = sessionStorage.getItem("jobify_generated_done");
const savedCv = sessionStorage.getItem("jobify_generated_cv");
const savedCover = sessionStorage.getItem("jobify_generated_cover");
const savedKeywords = sessionStorage.getItem("jobify_generated_keywords");
const savedAts = sessionStorage.getItem("jobify_generated_ats");

if (savedGenerated && savedCv && savedCover) {
  setCv(savedCv);
  setCoverLetter(savedCover);
  setDisplayCv(savedCv.substring(0, 900));
  setDisplayCoverLetter(savedCover.substring(0, 800));
  setKeywords(savedKeywords ? JSON.parse(savedKeywords) : []);
  setAtsScore(savedAts ? Number(savedAts) : 97);
  setGenerated(true);
  setTyping(false);
  setShowUnlock(true);
}

  const setupCompleted = getStored("jobify_setup_completed");
const forceSetup = sessionStorage.getItem("jobify_force_setup");

if (forceSetup === "true") {
  sessionStorage.removeItem("jobify_force_setup");
  setSetupStep(0);
  setShowSetupPopup(true);
} else if (!setupCompleted) {
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

  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = originalOverflow;
  };
}, [showSetupPopup]);
    useEffect(() => {
  if (!loading && !rephrasing) return;

  const originalHtmlOverflow = document.documentElement.style.overflow;
  const originalBodyOverflow = document.body.style.overflow;

  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";

  return () => {
    document.documentElement.style.overflow = originalHtmlOverflow;
    document.body.style.overflow = originalBodyOverflow;
  };
}, [loading, rephrasing]);

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
  sessionStorage.setItem("redirect_after_login", "/upload");
  router.push(`/login?callbackUrl=${encodeURIComponent("/upload")}`);
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
    alert(`${title || "Document"} is empty`);
    return;
  }

  const isCoverLetter = fileName.toLowerCase().includes("cover");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = isCoverLetter ? 18 : 14;
  const maxWidth = pageWidth - margin * 2;
  const bottomLimit = pageHeight - 16;

  let y = isCoverLetter ? 22 : 16;

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

  const cleanContent = cleanAiText(content);

  const addPageIfNeeded = () => {
    if (y > bottomLimit) {
      doc.addPage();
      y = 16;
    }
  };

  const isHeading = (line: string) => {
    const clean = line.trim();
    return (
      clean.length > 2 &&
      clean.length < 40 &&
      clean === clean.toUpperCase() &&
      !clean.includes("|") &&
      !clean.startsWith("-")
    );
  };

  const drawNormalLine = (
    line: string,
    xStart: number,
    fontSize: number,
    lineHeight: number,
    baseBold = false
  ) => {
    const wrapped = doc.splitTextToSize(line, maxWidth - (xStart - margin));

    wrapped.forEach((wrappedLine: string) => {
      addPageIfNeeded();

      if (!keywordRegex) {
        doc.setFont("helvetica", baseBold ? "bold" : "normal");
        doc.setFontSize(fontSize);
        doc.setTextColor(baseBold ? 15 : 55, baseBold ? 23 : 65, baseBold ? 42 : 81);
        doc.text(wrappedLine, xStart, y);
        y += lineHeight;
        return;
      }

      const parts = wrappedLine.split(keywordRegex).filter(Boolean);
      let x = xStart;

      parts.forEach((part) => {
        const isKeyword = keywordList.some(
          (keyword) => keyword.toLowerCase() === part.toLowerCase()
        );

        doc.setFont("helvetica", isKeyword || baseBold ? "bold" : "normal");
        doc.setFontSize(fontSize);
        doc.setTextColor(isKeyword || baseBold ? 0 : 55, isKeyword || baseBold ? 0 : 65, isKeyword || baseBold ? 0 : 81);

        const width = doc.getTextWidth(part);
        doc.text(part, x, y);
        x += width;
      });

      y += lineHeight;
    });
  };

  const lines = cleanContent.split("\n");

  lines.forEach((rawLine, index) => {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      y += isCoverLetter ? 4 : 3;
      return;
    }

    addPageIfNeeded();

    const firstLine = index === 0 && !isCoverLetter;
    const heading = isHeading(line);
    const bullet = line.trim().startsWith("-");

    if (firstLine) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42);
      doc.text(line.trim(), margin, y);
      y += 7;
      return;
    }

    if (heading) {
      y += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(37, 99, 235);
      doc.text(line.trim(), margin, y);
      y += 5.5;
      return;
    }

    if (bullet) {
      const bulletText = line.replace(/^-+\s*/, "");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.4);
      doc.setTextColor(55, 65, 81);
      doc.text("•", margin, y);

      drawNormalLine(bulletText, margin + 5, 9.4, 5.2);
      return;
    }

    drawNormalLine(
      line,
      margin,
      isCoverLetter ? 10.2 : 9.6,
      isCoverLetter ? 6.2 : 5.4
    );
  });

  doc.save(fileName);
};
  const downloadDOCX = async (
  title: string,
  content: string,
  fileName: string
) => {
  if (!content) {
    alert(`${title || "Document"} is empty`);
    return;
  }

  const isCoverLetter = fileName.toLowerCase().includes("cover");

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

  const cleanContent = cleanAiText(content);

  const isHeading = (line: string) => {
    const clean = line.trim();
    return (
      clean.length > 2 &&
      clean.length < 40 &&
      clean === clean.toUpperCase() &&
      !clean.includes("|") &&
      !clean.startsWith("-")
    );
  };

  const makeRuns = (line: string, forceBold = false) => {
    if (!keywordRegex || forceBold) {
      return [
        new TextRun({
          text: line || " ",
          size: forceBold ? 24 : isCoverLetter ? 22 : 21,
          bold: forceBold,
          color: forceBold ? "2563EB" : "374151",
        }),
      ];
    }

    return line
      .split(keywordRegex)
      .filter(Boolean)
      .map((part) => {
        const isKeyword = keywordList.some(
          (keyword) => keyword.toLowerCase() === part.toLowerCase()
        );

        return new TextRun({
          text: part,
          size: isCoverLetter ? 22 : 21,
          bold: isKeyword,
          color: isKeyword ? "000000" : "374151",
        });
      });
  };

  const paragraphs = cleanContent.split("\n").map((line, index) => {
    const cleanLine = line.trimEnd();

    if (!cleanLine.trim()) {
      return new Paragraph({
        children: [new TextRun({ text: " ", size: 8 })],
        spacing: { after: 80 },
      });
    }

    const firstLine = index === 0 && !isCoverLetter;
    const heading = isHeading(cleanLine);
    const bullet = cleanLine.trim().startsWith("-");

    if (firstLine) {
      return new Paragraph({
        children: [
          new TextRun({
            text: cleanLine.trim(),
            bold: true,
            size: 30,
            color: "0F172A",
          }),
        ],
        spacing: { after: 180 },
      });
    }

    if (heading) {
      return new Paragraph({
        children: makeRuns(cleanLine.trim(), true),
        spacing: { before: 220, after: 100 },
      });
    }

    if (bullet) {
      return new Paragraph({
        children: makeRuns(cleanLine.replace(/^-+\s*/, "")),
        bullet: { level: 0 },
        spacing: { after: 90 },
      });
    }

    return new Paragraph({
      children: makeRuns(cleanLine),
      spacing: {
        after: isCoverLetter ? 180 : 110,
      },
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: isCoverLetter ? 900 : 650,
              right: isCoverLetter ? 850 : 650,
              bottom: isCoverLetter ? 900 : 650,
              left: isCoverLetter ? 850 : 650,
            },
          },
        },
        children: paragraphs,
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
  const cleanAiText = (value: string) => {
  return String(value || "")
    .replace(/^Optimised CV\s*/gi, "")
    .replace(/^Optimized CV\s*/gi, "")
    .replace(/^Curriculum Vitae\s*/gi, "")
    .replace(/^Resume\s*/gi, "")
    .replace(/^Cover Letter\s*/gi, "")
    .replace(/\bOptimised CV\b/gi, "")
    .replace(/\bOptimized CV\b/gi, "")
    .replace(/\bCurriculum Vitae\b/gi, "")
    .replace(/\bCover Letter\b/gi, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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
setGenerated(false);
setTyping(false);
setShowUnlock(false);

setCv("");
setCoverLetter("");
setKeywords([]);
setDisplayCv("");
setDisplayCoverLetter("");

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

    

    try {
      const res = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  cvText: text,
  fullName,
  jobRole,
  country,
  jobDescription,
  userEmail: session?.user?.email,
  experienceLevel,
  jobType,
  educationLevel,
  industry,
  urgency,
  mainStrength,
  cvGoal,
  certificates,
  portfolio,
  workAvailability,
  toneStyle,
  coverLetterNeed,
}),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to generate");

      const rawCv =
  data.optimizedCV ||
  data.cv ||
  "Your ATS-optimised CV has been generated successfully.";

const rawCoverLetter =
  data.coverLetter ||
  "Your personalised cover letter has been generated successfully.";

const finalCv = cleanAiText(rawCv);
const finalCoverLetter = cleanAiText(rawCoverLetter);

      const finalKeywords = data.keywords || [];
      const finalAtsScore = data.atsScore || 97;

      setCv(finalCv);
setCoverLetter(finalCoverLetter);
setKeywords(finalKeywords);
setAtsScore(finalAtsScore);
setGenerated(true);
setTyping(true);
      sessionStorage.setItem("jobify_generated_cv", finalCv);
sessionStorage.setItem("jobify_generated_cover", finalCoverLetter);
sessionStorage.setItem("jobify_generated_keywords", JSON.stringify(finalKeywords));
sessionStorage.setItem("jobify_generated_ats", String(finalAtsScore));
sessionStorage.setItem("jobify_generated_done", "true");

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
    sessionStorage.setItem("redirect_after_login", "/upload");
    router.push(`/login?callbackUrl=${encodeURIComponent("/upload")}`);
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
  fullName,
  country,
  jobRole,
  experienceLevel,
  jobType,
  educationLevel,
  industry,
  urgency,
  mainStrength,
  cvGoal,
  certificates,
  portfolio,
  workAvailability,
  toneStyle,
  coverLetterNeed,
];

const canGoNext = Boolean(setupAnswers[setupStep]?.trim());

const saveSetupAndContinue = () => {
  setStored("jobify_country", country);
  setStored("jobify_role", jobRole);
  setStored("jobify_experience_level", experienceLevel);
  setStored("jobify_job_type", jobType);
  setStored("jobify_industry", industry);
  setStored("jobify_cv_goal", cvGoal);
  setStored("jobify_urgency", urgency);
  setStored("jobify_full_name", fullName);
  setStored("jobify_education_level", educationLevel);
  setStored("jobify_certificates", certificates);
  setStored("jobify_portfolio", portfolio);
  setStored("jobify_work_availability", workAvailability);
  setStored("jobify_cover_letter_need", coverLetterNeed);
  setStored("jobify_main_strength", mainStrength);
  setStored("jobify_weakness_fix", weaknessFix);
  setStored("jobify_tone_style", toneStyle);
  setStored("jobify_cv_length", cvLength);
  setStored("jobify_setup_completed", "true");

  setShowSetupPopup(false);

  setTimeout(() => {
    document
      .getElementById("ai-setup-summary")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 150);
};

const nextSetupStep = () => {
  if (setupStep < 14) {
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
    <main className="fixed inset-0 z-[999999] h-[100dvh] w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-3 py-4 text-slate-950">
  <div className="flex min-h-[calc(100dvh-40px)] items-start justify-center pt-2 sm:items-center">
  <div className="relative w-full max-w-[520px] overflow-hidden rounded-[34px] border border-white/20 bg-white shadow-[0_40px_120px_rgba(0,0,0,0.45)] animate-popupIn">
  {/* TOP LIGHT SHAPE */}
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -right-28 -top-24 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
    <div className="absolute left-0 top-0 h-36 w-full bg-gradient-to-br from-blue-50 via-white to-transparent" />
    <div className="absolute right-[-30px] top-[65px] h-28 w-[120%] rotate-[-14deg] bg-blue-50/80" />
  </div>

  <div className="relative flex max-h-[calc(100dvh-32px)] flex-col overflow-hidden p-4 sm:p-5">
          {/* TOP ROW */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-[11px] font-black text-white shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-dotPulse" />
              AI Setup
            </div>

            <p className="text-xs font-black text-slate-400">
              {setupStep + 1}/15
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
              style={{ width: `${((setupStep + 1) / 15) * 100}%` }}
            />
          </div>

          {/* QUESTION BOX */}
          <div
  key={setupStep}
  className="mt-4 min-h-0 flex-1 rounded-[22px] border border-slate-200 bg-white/95 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] animate-questionIn"
>
            {setupStep === 0 && (
  <div>
    <h3 className="text-lg font-black text-slate-950">
      👤 What is your full name?
    </h3>

    <input
      className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
      placeholder="Type your full name"
      value={fullName}
      onChange={(e) => setFullName(e.target.value)}
    />
  </div>
)}

{setupStep === 1 && (
  <div className="relative">
    <h3 className="text-lg font-black text-slate-950">
      🌍 Where are you applying?
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

    {showCountrySuggestions && country && filteredCountries.length > 0 && (
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

{setupStep === 2 && (
  <div className="relative">
    <h3 className="text-lg font-black text-slate-950">
      🎯 What job role do you want?
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

{setupStep === 3 && (
  <QuestionButtons
    title="📈 How much experience do you have?"
    value={experienceLevel}
    setValue={setExperienceLevel}
    options={[
      "No experience",
      "Less than 1 year",
      "1-2 years",
      "3-5 years",
      "5+ years",
      "Student / Fresher",
      "Internship experience",
      "Freelance experience",
    ]}
  />
)}

{setupStep === 4 && (
  <MultiSelectQuestionButtons
    title="💼 What job type do you want?"
    value={jobType}
    setValue={setJobType}
    options={[
      "Full-time",
      "Part-time",
      "Internship",
      "Remote",
      "Hybrid",
      "Temporary",
      "Contract",
      "Graduate role",
    ]}
  />
)}

{setupStep === 5 && (
  <QuestionButtons
    title="🎓 What is your education level?"
    value={educationLevel}
    setValue={setEducationLevel}
    options={[
      "School",
      "Diploma",
      "Bachelor's degree",
      "Master's degree",
      "PhD",
      "Certification only",
      "Currently studying",
      "No formal education",
    ]}
  />
)}

{setupStep === 6 && (
  <MultiSelectQuestionButtons
    title="🏢 What field are you applying for?"
    value={industry}
    setValue={setIndustry}
    options={[
      "Technology",
      "Finance",
      "Retail",
      "Healthcare",
      "Hospitality",
      "Warehouse",
      "Customer Service",
      "Education",
      "Admin",
      "Data / AI",
      "Software",
      "Other",
    ]}
  />
)}

{setupStep === 7 && (
  <MultiSelectQuestionButtons
    title="🚀 When can you start?"
    value={urgency}
    setValue={setUrgency}
    options={[
      "Immediately",
      "This week",
      "In 2 weeks",
      "In 1 month",
      "Flexible",
      "Just preparing",
      "Urgent application",
      "Interview tomorrow",
    ]}
  />
)}
{setupStep === 8 && (
  <MultiSelectQuestionButtons
    title="💪 What is your strongest skill?"
    value={mainStrength}
    setValue={setMainStrength}
    options={[
      "Communication",
      "Customer service",
      "Teamwork",
      "Leadership",
      "Technical skills",
      "Problem solving",
      "Sales",
      "Administration",
      "Data / IT skills",
      "Attention to detail",
    ]}
  />
)}

{setupStep === 9 && (
  <MultiSelectQuestionButtons
    title="🎯 What should your CV focus on?"
    value={cvGoal}
    setValue={setCvGoal}
    options={[
      "Experience",
      "Skills",
      "Education",
      "Projects",
      "Achievements",
      "Career change",
      "ATS keywords",
      "Professional wording",
    ]}
  />
)}

{setupStep === 10 && (
  <MultiSelectQuestionButtons
    title="📜 Do you have any certificates?"
    value={certificates}
    setValue={setCertificates}
    options={[
      "Yes",
      "No",
      "Currently studying",
      "Planning to get one",
      "Only online certificates",
      "Professional certificate",
    ]}
  />
)}

{setupStep === 11 && (
  <MultiSelectQuestionButtons
    title="💻 Do you have projects or portfolio?"
    value={portfolio}
    setValue={setPortfolio}
    options={[
      "Yes",
      "No",
      "GitHub",
      "Website",
      "University projects",
      "Freelance projects",
      "Work projects",
    ]}
  />
)}

{setupStep === 12 && (
  <MultiSelectQuestionButtons
    title="🕒 What is your availability?"
    value={workAvailability}
    setValue={setWorkAvailability}
    options={[
      "Weekdays",
      "Weekends",
      "Evenings",
      "Night shifts",
      "Flexible",
      "Remote only",
      "Immediate availability",
    ]}
  />
)}

{setupStep === 13 && (
  <MultiSelectQuestionButtons
    title="📄 What CV style do you want?"
    value={toneStyle}
    setValue={setToneStyle}
    options={[
      "Simple",
      "Professional",
      "Modern",
      "ATS-focused",
      "Student friendly",
      "Graduate style",
      "Experienced style",
    ]}
  />
)}


{setupStep === 14 && (
  <MultiSelectQuestionButtons
    title="✉️ Do you need a cover letter?"
    value={coverLetterNeed}
    setValue={setCoverLetterNeed}
    options={[
      "Yes",
      "No",
      "Maybe",
      "Only if job needs it",
      "Yes, tailored to job",
      "Make it short",
      "Make it professional",
    ]}
  />
)}
</div>

          {/* BUTTONS */}
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
              {setupStep === 14 ? "Start →" : "Next →"}
                        </button>
          </div>
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
    

  {(loading || rephrasing) && (
  <div className="fixed left-0 top-0 z-[999999999] flex h-[100dvh] w-[100vw] items-center justify-center overflow-hidden bg-white/95 px-4 backdrop-blur-xl">
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

    <div className="mt-5 grid gap-3 sm:grid-cols-3">
  <div className="group relative overflow-hidden rounded-2xl border border-blue-200 bg-white px-4 py-3 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
    <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-blue-100 transition duration-500 group-hover:scale-150" />

    <p className="relative text-2xl font-black tracking-tight text-blue-600 animate-stepPulse">
      STEP 1
    </p>
    <p className="relative mt-1 text-sm font-black text-slate-950">
      Paste
    </p>
    <p className="relative mt-1 text-xs font-semibold leading-5 text-slate-500">
      Paste your old CV and job description
    </p>
  </div>

  <div className="group relative overflow-hidden rounded-2xl border border-purple-200 bg-white px-4 py-3 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-pink-400" />
    <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-purple-100 transition duration-500 group-hover:scale-150" />

    <p className="relative text-2xl font-black tracking-tight text-purple-600 animate-stepPulse">
      STEP 2
    </p>
    <p className="relative mt-1 text-sm font-black text-slate-950">
      Generate
    </p>
    <p className="relative mt-1 text-xs font-semibold leading-5 text-slate-500">
      Generate your Jobify CV and cover letter
    </p>
  </div>

  <div className="group relative overflow-hidden rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-green-400" />
    <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-emerald-100 transition duration-500 group-hover:scale-150" />

    <p className="relative text-2xl font-black tracking-tight text-emerald-600 animate-stepPulse">
      STEP 3
    </p>
    <p className="relative mt-1 text-sm font-black text-slate-950">
      Ready to Apply
    </p>
    <p className="relative mt-1 text-xs font-semibold leading-5 text-slate-500">
      Download, copy, and apply with confidence
    </p>
  </div>
</div>
    

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

                  <div className="relative mt-5 rounded-3xl bg-slate-50/90 border border-blue-100 p-4 h-[320px] md:h-[340px] overflow-hidden shadow-inner">
                    {typing && (
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-blue-100/40 to-transparent -translate-x-full animate-shimmer" />
                    )}

                    <div
                      className={`text-xs md:text-sm text-gray-700 whitespace-pre-line leading-5 md:leading-6 transition-all duration-700 ${
                        isUnlocked ? "" : "blur-[1px] select-none opacity-90"
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
  <PremiumLockedOverlay
    atsScore={atsScore}
    keywordsCount={keywords.length}
    onUnlock={handleUnlockClick}
  />
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
      onClick={() => (isUnlocked ? rephraseDocument("cv") : handleUnlockClick())}
      disabled={rephrasing === "cv" || typing}
      className="w-full rounded-2xl border border-blue-200 bg-white py-3 font-black text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:opacity-50"
    >
      {rephrasing === "cv" ? "Rephrasing..." : "✨ Rephrase CV"}
    </button>
      <button
  onClick={() => (isUnlocked ? openEditor("cv") : handleUnlockClick())}
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

                  <div className="relative mt-5 rounded-3xl bg-slate-50/90 border border-purple-100 p-4 h-[320px] md:h-[340px] overflow-hidden shadow-inner">
                    {typing && (
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-purple-100/40 to-transparent -translate-x-full animate-shimmer" />
                    )}

                    <div
                      className={`text-xs md:text-sm text-gray-700 whitespace-pre-line leading-5 md:leading-6 transition-all duration-700 ${
                        isUnlocked ? "" : "blur-[1px] select-none opacity-90"
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
  <PremiumLockedOverlay
    atsScore={atsScore}
    keywordsCount={keywords.length}
    onUnlock={handleUnlockClick}
  />
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
      onClick={() => (isUnlocked ? rephraseDocument("cover") : handleUnlockClick())}
      disabled={rephrasing === "cover" || typing}
      className="w-full rounded-2xl border border-purple-200 bg-white py-3 font-black text-purple-700 shadow-sm transition hover:bg-purple-50 disabled:opacity-50"
    >
      {rephrasing === "cover" ? "Rephrasing..." : "✨ Rephrase"}
    </button>
      <button
  onClick={() => (isUnlocked ? openEditor("cover") : handleUnlockClick())}
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

{(fullName ||
  country ||
  jobRole ||
  experienceLevel ||
  jobType ||
  educationLevel ||
  industry ||
  urgency ||
  mainStrength ||
  cvGoal ||
  certificates ||
  portfolio ||
  workAvailability ||
  toneStyle ||
  coverLetterNeed) && (
  <div
    id="ai-setup-summary"
    className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4"
  >
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-black text-blue-700">
        🤖 AI setup loaded from your answers
      </p>

      <button
        type="button"
        onClick={() => {
          setSetupStep(0);
          setShowSetupPopup(true);
        }}
        className="rounded-full bg-blue-600 px-4 py-2 text-xs font-black text-white transition hover:bg-blue-700"
      >
        Edit answers
      </button>
    </div>

    <details className="mt-3">
      <summary className="cursor-pointer text-xs font-black text-slate-500">
        View setup details
      </summary>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Name", fullName],
          ["Country", country],
          ["Role", jobRole],
          ["Level", experienceLevel],
          ["Type", jobType],
          ["Education", educationLevel],
          ["Industry", industry],
          ["Focus", cvGoal],
          ["Applying", urgency],
          ["Strength", mainStrength],
          ["Certificates", certificates],
          ["Portfolio", portfolio],
          ["Availability", workAvailability],
          ["Style", toneStyle],
          ["Cover Letter", coverLetterNeed],
        ]
          .filter((item) => item[1])
          .map(([label, value]) => (
            <div
              key={label}
              className="min-w-0 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm"
            >
              <p className="text-[10px] font-black uppercase tracking-wide text-blue-500">
                {label}
              </p>
              <p className="mt-1 truncate text-sm font-black text-slate-800">
                {value}
              </p>
            </div>
          ))}
      </div>
    </details>
  </div>
)}

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
        {/* GOOGLE STYLE REVIEWS */}
<div className="rounded-[32px] border border-slate-200 bg-white/90 p-5 md:p-8 shadow-2xl backdrop-blur-xl">
  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
    <div>
      <p className="text-sm font-black text-blue-600 uppercase tracking-widest">
        Loved by job seekers
      </p>

      <h2 className="mt-2 text-2xl md:text-4xl font-black text-slate-950">
        People are improving their CVs with Jobify.cv
      </h2>

      <p className="mt-2 max-w-2xl text-sm md:text-base text-slate-500">
        Real-style feedback from users creating ATS-ready CVs, cover letters, and keyword-matched applications.
      </p>
    </div>

    <div className="rounded-3xl border bg-slate-50 p-5 min-w-[240px]">
      <div className="flex items-center gap-3">
        <div className="text-5xl font-black text-slate-950">4.9</div>
        <div>
          <div className="text-xl text-yellow-400">★★★★★</div>
          <p className="mt-1 text-sm text-slate-500">
            Based on 1,278 user reviews
          </p>
        </div>
      </div>
    </div>
  </div>

  <div className="mt-8 grid md:grid-cols-3 gap-5">
    {[
      {
        name: "Sarah M.",
        role: "Graduate Job Seeker",
        date: "2 weeks ago",
        initials: "S",
        review:
          "Jobify improved my CV structure and helped me add stronger keywords. My CV looked much more professional after using it.",
      },
      {
        name: "James R.",
        role: "Retail Assistant",
        date: "1 month ago",
        initials: "J",
        review:
          "I pasted my old CV and the AI rewrote my experience in a better way. The cover letter was also very useful.",
      },
      {
        name: "Aisha K.",
        role: "Data Analyst Applicant",
        date: "3 weeks ago",
        initials: "A",
        review:
          "The ATS keywords helped me understand what was missing. I used the improved CV and got shortlisted.",
      },
      {
        name: "Mohammed H.",
        role: "Software Developer",
        date: "6 days ago",
        initials: "M",
        review:
          "It made my project descriptions much stronger and more technical without sounding fake.",
      },
      {
        name: "Emily T.",
        role: "Marketing Executive",
        date: "4 weeks ago",
        initials: "E",
        review:
          "The CV score and rewritten bullet points were really helpful. My application looked cleaner and more focused.",
      },
      {
        name: "Daniel P.",
        role: "Career Switcher",
        date: "1 week ago",
        initials: "D",
        review:
          "I am switching careers and Jobify helped me explain my transferable skills properly.",
      },
      {
        name: "Priya N.",
        role: "Business Analyst Applicant",
        date: "3 days ago",
        initials: "P",
        review:
          "The generated CV was much better aligned with the role. The keywords made it feel more ATS-ready.",
      },
      {
        name: "Liam B.",
        role: "Warehouse Operative",
        date: "5 days ago",
        initials: "L",
        review:
          "It helped me turn simple warehouse duties into professional CV bullet points.",
      },
      {
        name: "Fatima R.",
        role: "Care Assistant",
        date: "1 week ago",
        initials: "F",
        review:
          "Very easy to use. It improved my care work experience and made my CV sound more confident.",
      },
      {
        name: "Oliver K.",
        role: "Junior Developer",
        date: "2 weeks ago",
        initials: "O",
        review:
          "The AI explained my student projects properly. My CV looked more suitable for developer jobs.",
      },
      {
        name: "Chloe W.",
        role: "Customer Service Advisor",
        date: "4 days ago",
        initials: "C",
        review:
          "The cover letter sounded professional and natural. I only had to make small edits before applying.",
      },
      {
        name: "Hassan A.",
        role: "IT Support Applicant",
        date: "8 days ago",
        initials: "H",
        review:
          "It added better IT support keywords like troubleshooting, tickets, hardware, and customer support.",
      },
      {
        name: "Mia S.",
        role: "Receptionist",
        date: "2 weeks ago",
        initials: "M",
        review:
          "My admin and receptionist experience looked much clearer after Jobify rewrote it.",
      },
      {
        name: "Noah D.",
        role: "Finance Graduate",
        date: "3 weeks ago",
        initials: "N",
        review:
          "My CV was too general before. Jobify made it more finance-focused and professional.",
      },
      {
        name: "Grace L.",
        role: "Teaching Assistant",
        date: "6 days ago",
        initials: "G",
        review:
          "It improved my education and childcare experience nicely. The CV looked cleaner and easier to read.",
      },
      {
        name: "Arjun V.",
        role: "Data Science Student",
        date: "9 days ago",
        initials: "A",
        review:
          "It helped me describe Python, machine learning, datasets, and project results better.",
      },
      {
        name: "Sophie C.",
        role: "Hospitality Worker",
        date: "1 month ago",
        initials: "S",
        review:
          "My restaurant experience sounded much more professional after using Jobify.",
      },
      {
        name: "Ryan M.",
        role: "Sales Assistant",
        date: "2 weeks ago",
        initials: "R",
        review:
          "The tool helped me add achievements and stronger wording to my sales experience.",
      },
      {
        name: "Nadia B.",
        role: "Project Coordinator",
        date: "5 days ago",
        initials: "N",
        review:
          "I liked how it tailored the CV to the role instead of giving generic wording.",
      },
      {
        name: "Ben T.",
        role: "Security Officer",
        date: "3 weeks ago",
        initials: "B",
        review:
          "Simple and useful. It helped me organise my training, responsibilities, and work history.",
      },
      {
        name: "Zara M.",
        role: "HR Assistant",
        date: "1 week ago",
        initials: "Z",
        review:
          "The professional summary it created was much better than what I had before.",
      },
      {
        name: "Leo F.",
        role: "Graphic Designer",
        date: "4 weeks ago",
        initials: "L",
        review:
          "It helped me describe my freelance work in a more results-focused way.",
      },
      {
        name: "Amelia J.",
        role: "NHS Admin Applicant",
        date: "6 days ago",
        initials: "A",
        review:
          "I used it for an NHS admin application. The cover letter and keywords were very helpful.",
      },
      {
        name: "Yusuf K.",
        role: "Cloud Intern Applicant",
        date: "2 weeks ago",
        initials: "Y",
        review:
          "It improved my cloud project wording and made my CV look more internship-ready.",
      },
      {
        name: "Ella P.",
        role: "Marketing Assistant",
        date: "10 days ago",
        initials: "E",
        review:
          "The AI helped me add campaign, content, analytics, and social media keywords naturally.",
      },
      {
        name: "Kai R.",
        role: "Delivery Driver",
        date: "3 days ago",
        initials: "K",
        review:
          "It made my delivery work sound professional by highlighting reliability and customer service.",
      },
      {
        name: "Hannah G.",
        role: "Office Assistant",
        date: "2 weeks ago",
        initials: "H",
        review:
          "The CV layout became much cleaner. My admin skills section looked more complete.",
      },
      {
        name: "Ibrahim S.",
        role: "Cybersecurity Student",
        date: "1 week ago",
        initials: "I",
        review:
          "It added better cybersecurity, networking, Linux, and project keywords to my CV.",
      },
      {
        name: "Ruby A.",
        role: "Barista",
        date: "5 days ago",
        initials: "R",
        review:
          "I used it for part-time jobs. It made my customer service experience sound stronger.",
      },
      {
        name: "Samir P.",
        role: "AI Internship Applicant",
        date: "6 days ago",
        initials: "S",
        review:
          "The AI CV was tailored well for internships and explained my machine learning projects clearly.",
      },
    ].map((review, index) => (
      <div
        key={`${review.name}-${index}`}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 font-black text-white">
              {review.initials}
            </div>

            <div>
              <h3 className="font-black text-slate-900">{review.name}</h3>
              <p className="text-xs text-slate-500">{review.role}</p>
            </div>
          </div>

          <div className="text-xl text-slate-400">⋮</div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="text-yellow-400 tracking-tight">★★★★★</div>
          <span className="text-xs text-slate-400">{review.date}</span>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          {review.review}
        </p>

        <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-50 text-[10px] font-black text-blue-600">
            ✓
          </span>
          <span>Verified Jobify user</span>
        </div>
      </div>
    ))}
  </div>
</div>
        <HiredAtBox />
      </section>

      <style jsx>{`
        @keyframes stepPulse {
  0%, 100% {
    transform: scale(1);
    letter-spacing: -0.03em;
  }
  50% {
    transform: scale(1.04);
    letter-spacing: 0.01em;
  }
}

.animate-stepPulse {
  animation: stepPulse 2.2s ease-in-out infinite;
}
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
  @keyframes unlockCardIn {
  0% {
    opacity: 0;
    transform: translateY(18px) scale(0.94);
    filter: blur(8px);
  }
  70% {
    opacity: 1;
    transform: translateY(-2px) scale(1.02);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}
  @keyframes premiumCardIn {
  0% {
    opacity: 0;
    transform: translateY(22px) scale(0.9);
    filter: blur(14px);
  }
  60% {
    opacity: 1;
    transform: translateY(-4px) scale(1.03);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes lockFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-7px) rotate(-4deg);
  }
}

@keyframes premiumRing {
  0% {
    transform: rotate(0deg) scale(1);
  }
  100% {
    transform: rotate(360deg) scale(1.04);
  }
}

@keyframes premiumRingReverse {
  0% {
    transform: rotate(360deg) scale(1);
  }
  100% {
    transform: rotate(0deg) scale(1.08);
  }
}

@keyframes premiumSweep {
  0% {
    transform: translateX(-130%) rotate(12deg);
  }
  100% {
    transform: translateX(350%) rotate(12deg);
  }
}

@keyframes premiumScan {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  35% {
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
}

@keyframes premiumOrbOne {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(45px, 35px) scale(1.25);
  }
}

@keyframes premiumOrbTwo {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-45px, -35px) scale(1.25);
  }
}

@keyframes statPop {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.92);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-premiumCardIn {
  animation: premiumCardIn 0.65s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-lockFloat {
  animation: lockFloat 2.5s ease-in-out infinite;
}

.animate-premiumRing {
  animation: premiumRing 4s linear infinite;
}

.animate-premiumRingReverse {
  animation: premiumRingReverse 5s linear infinite;
}

.animate-premiumSweep {
  animation: premiumSweep 2.4s ease-in-out infinite;
}

.animate-premiumScan {
  animation: premiumScan 3.2s ease-in-out infinite;
}

.animate-premiumOrbOne {
  animation: premiumOrbOne 4s ease-in-out infinite;
}

.animate-premiumOrbTwo {
  animation: premiumOrbTwo 4.4s ease-in-out infinite;
}

.animate-statPop {
  animation: statPop 0.45s ease-out 0.15s both;
}

.animate-statPopTwo {
  animation: statPop 0.45s ease-out 0.25s both;
}

.animate-statPopThree {
  animation: statPop 0.45s ease-out 0.35s both;
}

@keyframes lockFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-6px) rotate(-3deg);
  }
}

@keyframes premiumSweep {
  0% {
    transform: translateX(-120%) rotate(12deg);
  }
  100% {
    transform: translateX(320%) rotate(12deg);
  }
}

@keyframes orbOne {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(20px, 30px) scale(1.18);
  }
}

@keyframes orbTwo {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-25px, -20px) scale(1.15);
  }
}

.animate-unlockCardIn {
  animation: unlockCardIn 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-lockFloat {
  animation: lockFloat 2.6s ease-in-out infinite;
}

.animate-premiumSweep {
  animation: premiumSweep 2.8s ease-in-out infinite;
}

.animate-orbOne {
  animation: orbOne 4s ease-in-out infinite;
}

.animate-orbTwo {
  animation: orbTwo 4.5s ease-in-out infinite;
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
    <div className="flex h-full min-h-0 flex-col">
      <h3 className="text-lg font-black leading-tight text-slate-950">
        {title}
      </h3>

      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
        Select one answer
      </p>

      <div
        className="mt-3 grid max-h-[260px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {options.map((option) => {
          const selected = value === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => setValue(option)}
              className={
                selected
                  ? "rounded-2xl border border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2.5 text-left text-sm font-black text-white shadow-[0_12px_26px_rgba(37,99,235,0.22)] transition active:scale-95"
                  : "rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 active:scale-95"
              }
            >
              <span className="mr-2">{selected ? "✅" : "○"}</span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultiSelectQuestionButtons({
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
  const selectedValues = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const toggleOption = (option: string) => {
    const alreadySelected = selectedValues.includes(option);

    const updated = alreadySelected
      ? selectedValues.filter((item) => item !== option)
      : [...selectedValues, option];

    setValue(updated.join(", "));
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black leading-tight text-slate-950">
            {title}
          </h3>

          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
            Select all that apply
          </p>
        </div>

        {selectedValues.length > 0 && (
          <button
            type="button"
            onClick={() => setValue("")}
            className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-black text-slate-500 shadow-sm active:scale-95"
          >
            Clear
          </button>
        )}
      </div>

      {selectedValues.length > 0 && (
        <div className="mt-3 flex max-h-[56px] flex-wrap gap-2 overflow-y-auto pr-1">
          {selectedValues.map((item) => (
            <span
              key={item}
              className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white shadow-sm"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      <div
        className="mt-3 grid max-h-[230px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {options.map((option) => {
          const selected = selectedValues.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={
                selected
                  ? "rounded-2xl border border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2.5 text-left text-sm font-black text-white shadow-[0_12px_26px_rgba(37,99,235,0.22)] transition active:scale-95"
                  : "rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 active:scale-95"
              }
            >
              <span className="mr-2">{selected ? "✅" : "⬜"}</span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
function PremiumLockedOverlay({
  atsScore,
  keywordsCount,
  onUnlock,
}: {
  atsScore: number;
  keywordsCount: number;
  onUnlock: () => void;
}) {
  return (
    <>
      <div className="absolute inset-0 z-10 bg-slate-950/10 backdrop-blur-[1.5px]" />

      {/* animated background effects */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <div className="absolute left-[-80px] top-10 h-40 w-40 rounded-full bg-blue-500/30 blur-3xl animate-premiumOrbOne" />
        <div className="absolute right-[-80px] bottom-8 h-40 w-40 rounded-full bg-purple-500/30 blur-3xl animate-premiumOrbTwo" />
        <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-transparent via-white/35 to-transparent animate-premiumScan" />
        <div className="absolute inset-y-0 -left-1/2 w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-premiumSweep" />
      </div>

      <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
        <div className="relative w-full max-w-[340px] overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-5 text-center shadow-[0_35px_100px_rgba(15,23,42,0.35)] backdrop-blur-2xl animate-premiumCardIn">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-[length:220%_100%] animate-gradientMove" />

          {/* lock icon */}
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-premiumRing" />
            <div className="absolute inset-2 rounded-full border-4 border-purple-500/25 animate-premiumRingReverse" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-800 text-3xl shadow-2xl animate-lockFloat">
              🔒
            </div>
          </div>

          <p className="mt-3 text-[11px] font-black uppercase tracking-[0.24em] text-blue-600">
            Premium CV is ready
          </p>

          <h4 className="mt-2 text-[23px] font-black leading-tight tracking-[-0.04em] text-slate-950">
            Your AI-tailored result is waiting
          </h4>

          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            We found your strongest keywords, improved the structure, and prepared
            your full CV package.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-2 shadow-sm animate-statPop">
              <p className="text-2xl font-black text-emerald-600">
                {atsScore}%
              </p>
              <p className="text-[10px] font-black uppercase text-emerald-700">
                ATS Score
              </p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50/90 p-2 shadow-sm animate-statPopTwo">
              <p className="text-2xl font-black text-blue-600">2</p>
              <p className="text-[10px] font-black uppercase text-blue-700">
                Documents
              </p>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-purple-50/90 p-2 shadow-sm animate-statPopThree">
              <p className="text-2xl font-black text-purple-600">
                {keywordsCount || 8}
              </p>
              <p className="text-[10px] font-black uppercase text-purple-700">
                Keywords
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onUnlock}
            className="group relative mt-5 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-[length:220%_100%] py-4 text-sm font-black text-white shadow-[0_18px_45px_rgba(37,99,235,0.45)] transition hover:scale-[1.025] active:scale-95 animate-gradientMove"
          >
            <span className="relative z-10">Unlock Full CV Package →</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition duration-700 group-hover:translate-x-full" />
          </button>

          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-black text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-dotPulse" />
            PDF • DOCX • Edit • Rephrase
          </div>
        </div>
      </div>
    </>
  );
}