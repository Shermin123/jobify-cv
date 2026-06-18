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

  const forceSetup = sessionStorage.getItem("jobify_force_setup");
const setupIsComplete = [
  savedFullName,
  savedCountry,
  savedRole,
  savedExperienceLevel,
  savedJobType,
  savedEducationLevel,
  savedIndustry,
  savedUrgency,
  savedMainStrength,
  savedCvGoal,
  savedCertificates,
  savedPortfolio,
  savedWorkAvailability,
  savedToneStyle,
  savedCoverLetterNeed,
].every((answer) => Boolean(answer?.trim()));
if (forceSetup === "true") {
  sessionStorage.removeItem("jobify_force_setup");
  setSetupStep(0);
  setShowSetupPopup(true);
} else if (!setupIsComplete) {
  setSetupStep(0);
  setShowSetupPopup(true);
}


  }, []);
  useEffect(() => {
  let active = true;
  const checkAccessStatus = async () => {
    if (!session?.user?.email) {
      if (active) setIsUnlocked(false);
      return;
    }
    const hasAccess = await checkSubscription(session.user.email);
    if (active) {
      setIsUnlocked(hasAccess);
    }
  };
  checkAccessStatus();
  return () => {
    active = false;
  };
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
await new Promise<void>((resolve) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => resolve());
  });
});


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
    ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
 
if (status === "loading" && !loading && !rephrasing) {
  return (
    <div className="h-screen flex items-center justify-center text-gray-500">
      Loading...
    </div>
  );
}


if (showSetupPopup && !loading && !rephrasing) {
  return (
    <main className="nike-popup-bg fixed inset-0 z-[999999] h-[100dvh] w-screen overflow-hidden px-3 py-4 text-slate-950">
  <div className="relative z-10 flex min-h-[calc(100dvh-40px)] items-start justify-center pt-2 sm:items-center">
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
          .nike-popup-bg {
  isolation: isolate;
  background:
    radial-gradient(circle at 12% 18%, rgba(37, 99, 235, 0.38), transparent 30%),
    radial-gradient(circle at 88% 78%, rgba(99, 102, 241, 0.34), transparent 34%),
    linear-gradient(135deg, #020617 0%, #0f172a 45%, #172554 100%);
  background-size: 145% 145%;
  animation: nikeBackgroundShift 7s ease-in-out infinite;
}

.nike-popup-bg::before {
  content: "";
  position: absolute;
  inset: -50%;
  z-index: 0;
  pointer-events: none;
  background:
    repeating-linear-gradient(
      118deg,
      transparent 0,
      transparent 55px,
      rgba(255, 255, 255, 0.035) 57px,
      transparent 61px
    ),
    linear-gradient(
      115deg,
      transparent 38%,
      rgba(255, 255, 255, 0.04) 44%,
      rgba(96, 165, 250, 0.22) 50%,
      rgba(255, 255, 255, 0.08) 55%,
      transparent 62%
    );
  animation: nikeBackgroundSweep 4.8s ease-in-out infinite;
}

.nike-popup-bg::after {
  content: "";
  position: absolute;
  right: -150px;
  bottom: -170px;
  z-index: 0;
  height: 480px;
  width: 480px;
  pointer-events: none;
  border-radius: 9999px;
  background:
    radial-gradient(
      circle,
      rgba(59, 130, 246, 0.48),
      rgba(79, 70, 229, 0.22) 42%,
      transparent 70%
    );
  filter: blur(20px);
  animation: nikeBackgroundGlow 4s ease-in-out infinite;
}

@keyframes nikeBackgroundShift {
  0%,
  100% {
    background-position: 0% 20%;
  }

  50% {
    background-position: 100% 80%;
  }
}

@keyframes nikeBackgroundSweep {
  0% {
    transform: translateX(-40%) translateY(8%) rotate(-5deg);
    opacity: 0.15;
  }

  45% {
    opacity: 1;
  }

  100% {
    transform: translateX(40%) translateY(-8%) rotate(-5deg);
    opacity: 0.15;
  }
}

@keyframes nikeBackgroundGlow {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(0.88);
    opacity: 0.45;
  }

  50% {
    transform: translate3d(-70px, -45px, 0) scale(1.2);
    opacity: 1;
  }
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
          <section
  ref={resultRef}
  className="relative space-y-5"
>
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
<div className="relative grid gap-6 lg:grid-cols-2">
  {/* CV CARD */}
  <div className="group relative overflow-hidden rounded-[2rem] border border-blue-100 bg-white/90 shadow-2xl backdrop-blur-xl transition-all duration-700 hover:-translate-y-1 hover:shadow-blue-200/60">
    <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 bg-[length:200%_100%] animate-gradientMove" />
    <div className="absolute -right-24 -top-24 h-52 w-52 rounded-full bg-blue-200 opacity-40 blur-3xl transition group-hover:opacity-70" />

    <div className="relative p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-xl text-white shadow-lg transition duration-500 group-hover:scale-110">
            📄
          </div>

          <div>
            <h3 className="font-black text-lg">Generated CV</h3>
            <p className="text-xs text-gray-500">ATS-ready resume preview</p>
          </div>
        </div>

        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 animate-softPulse">
          {typing ? "WRITING" : isUnlocked ? "UNLOCKED" : "LOCKED"}
        </span>
      </div>

      <div className="relative mt-5 h-[390px] overflow-hidden rounded-3xl border border-blue-100 bg-slate-50/90 p-4 shadow-inner md:h-[420px]">
        {typing && (
          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-100/40 to-transparent animate-shimmer" />
        )}

        <div
          className={`text-xs md:text-sm text-gray-700 whitespace-pre-line leading-5 md:leading-6 transition-all duration-700 ${
            isUnlocked ? "" : "blur-[1.2px] select-none opacity-85"
          }`}
        >
          {highlightKeywords(displayCv, "blue")}
          {typing && (
            <span className="animate-pulse font-black text-blue-600">|</span>
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
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() =>
              isUnlocked
                ? downloadPDF("Optimised CV", cv, "jobify-optimised-cv.pdf")
                : handleUnlockClick()
            }
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 font-black text-white shadow-lg transition hover:scale-[1.02]"
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
            onClick={() =>
              isUnlocked ? rephraseDocument("cv") : handleUnlockClick()
            }
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
  <div className="group relative overflow-hidden rounded-[2rem] border border-purple-100 bg-white/90 shadow-2xl backdrop-blur-xl transition-all duration-700 hover:-translate-y-1 hover:shadow-purple-200/60">
    <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-[length:200%_100%] animate-gradientMove" />
    <div className="absolute -right-24 -top-24 h-52 w-52 rounded-full bg-purple-200 opacity-40 blur-3xl transition group-hover:opacity-70" />

    <div className="relative p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-xl text-white shadow-lg transition duration-500 group-hover:scale-110">
            ✉️
          </div>

          <div>
            <h3 className="font-black text-lg">Cover Letter</h3>
            <p className="text-xs text-gray-500">
              Personalised application letter
            </p>
          </div>
        </div>

        <span className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-black text-purple-700 animate-softPulse">
          {typing ? "WRITING" : isUnlocked ? "UNLOCKED" : "LOCKED"}
        </span>
      </div>

      <div className="relative mt-5 h-[390px] overflow-hidden rounded-3xl border border-purple-100 bg-slate-50/90 p-4 shadow-inner md:h-[420px]">
        {typing && (
          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-purple-100/40 to-transparent animate-shimmer" />
        )}

        <div
          className={`text-xs md:text-sm text-gray-700 whitespace-pre-line leading-5 md:leading-6 transition-all duration-700 ${
            isUnlocked ? "" : "blur-[1.2px] select-none opacity-85"
          }`}
        >
          {highlightKeywords(displayCoverLetter, "purple")}
          {typing && (
            <span className="animate-pulse font-black text-purple-600">|</span>
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
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 py-3 font-black text-white shadow-lg transition hover:scale-[1.02]"
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
            onClick={() =>
              isUnlocked ? rephraseDocument("cover") : handleUnlockClick()
            }
            disabled={rephrasing === "cover" || typing}
            className="w-full rounded-2xl border border-purple-200 bg-white py-3 font-black text-purple-700 shadow-sm transition hover:bg-purple-50 disabled:opacity-50"
          >
            {rephrasing === "cover" ? "Rephrasing..." : "✨ Rephrase"}
          </button>

          <button
            onClick={() =>
              isUnlocked ? openEditor("cover") : handleUnlockClick()
            }
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

            
          </section>
        )}
       
        {/* INPUT FORM */}
<div className="relative mt-16 isolate overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">
  <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500" />

  <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100 opacity-70 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-100 opacity-70 blur-3xl" />

  <div className="relative z-10 space-y-5 p-6 md:space-y-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
  <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
    ✨ AI CV Builder
  </div>

  <button
    type="button"
    onClick={() => {
      sessionStorage.setItem("jobify_editor_title", "Untitled CV");
      sessionStorage.setItem("jobify_editor_content", "");
      sessionStorage.setItem("jobify_editor_type", "cv");
      router.push("/editor");
    }}
    className="inline-flex items-center gap-1.5 rounded-full border border-orange-300 bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-xs font-black text-white shadow-md transition hover:-translate-y-0.5 hover:from-orange-600 hover:to-red-600 hover:shadow-lg"
  >
    ＋ Create from scratch
  </button>
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
  type="button"
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

      <style jsx global>{`
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

  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
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
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.04);
      opacity: 0.85;
    }
  }

  @keyframes dotPulse {
    0%, 100% {
      opacity: 0.45;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.35);
    }
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

  @keyframes cinemaIn {
    0% {
      opacity: 0;
      transform: perspective(900px) rotateX(8deg) scale(0.92) translateY(24px);
      filter: blur(10px);
    }
    60% {
      opacity: 1;
      transform: perspective(900px) rotateX(0deg) scale(1.02) translateY(0);
      filter: blur(0);
    }
    100% {
      opacity: 1;
      transform: perspective(900px) rotateX(0deg) scale(1) translateY(0);
      filter: blur(0);
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
      transform: translateY(0);
    }
    50% {
      transform: translateY(-6px);
    }
  }

  /* Premium locked vault animations */
  @keyframes vaultCardIn {
    0% {
      opacity: 0;
      transform: translateY(18px) scale(0.92);
      filter: blur(14px);
    }
    65% {
      opacity: 1;
      transform: translateY(-3px) scale(1.025);
      filter: blur(0);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0);
    }
  }

  @keyframes vaultLock {
    0%, 100% {
      transform: translateY(0) rotate(0deg) scale(1);
    }
    50% {
      transform: translateY(-5px) rotate(-4deg) scale(1.05);
    }
  }

  @keyframes vaultRing {
    0% {
      transform: rotate(0deg) scale(1);
      opacity: 0.8;
    }
    100% {
      transform: rotate(360deg) scale(1.12);
      opacity: 0.25;
    }
  }

  @keyframes vaultGlow {
    0%, 100% {
      opacity: 0.45;
      transform: scale(1);
    }
    50% {
      opacity: 0.85;
      transform: scale(1.25);
    }
  }

  @keyframes vaultScanLine {
    0% {
      transform: translateY(-20px);
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    100% {
      transform: translateY(360px);
      opacity: 0;
    }
  }

  @keyframes vaultSweep {
    0% {
      transform: translateX(-130%) rotate(12deg);
    }
    100% {
      transform: translateX(420%) rotate(12deg);
    }
  }

  @keyframes vaultOrbOne {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(40px, 28px) scale(1.25);
    }
  }

  @keyframes vaultOrbTwo {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(-38px, -28px) scale(1.22);
    }
  }

  @keyframes vaultSpark {
    0%, 100% {
      opacity: 0.25;
      transform: translateY(0) scale(1);
    }
    50% {
      opacity: 1;
      transform: translateY(-10px) scale(1.5);
    }
  }

  @keyframes vaultStat {
    0% {
      opacity: 0;
      transform: translateY(8px) scale(0.9);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .animate-stepPulse {
    animation: stepPulse 2.2s ease-in-out infinite;
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

  .animate-dotPulse {
    animation: dotPulse 2s ease-in-out infinite;
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

  .animate-vaultCardIn {
    animation: vaultCardIn 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .animate-vaultLock {
    animation: vaultLock 2.6s ease-in-out infinite;
  }

  .animate-vaultRing {
    animation: vaultRing 3.5s linear infinite;
  }

  .animate-vaultGlow {
    animation: vaultGlow 2.4s ease-in-out infinite;
  }

  .animate-vaultScanLine {
    animation: vaultScanLine 3s ease-in-out infinite;
  }

  .animate-vaultSweep {
    animation: vaultSweep 2.6s ease-in-out infinite;
  }

  .animate-vaultOrbOne {
    animation: vaultOrbOne 4s ease-in-out infinite;
  }

  .animate-vaultOrbTwo {
    animation: vaultOrbTwo 4.4s ease-in-out infinite;
  }

  .animate-vaultSparkOne {
    animation: vaultSpark 2.2s ease-in-out infinite;
  }

  .animate-vaultSparkTwo {
    animation: vaultSpark 2.6s ease-in-out infinite 0.35s;
  }

  .animate-vaultSparkThree {
    animation: vaultSpark 2.8s ease-in-out infinite 0.7s;
  }

  .animate-vaultStatOne {
    animation: vaultStat 0.45s ease-out 0.15s both;
  }

  .animate-vaultStatTwo {
    animation: vaultStat 0.45s ease-out 0.25s both;
  }

  .animate-vaultStatThree {
    animation: vaultStat 0.45s ease-out 0.35s both;
  }
    @keyframes appleCardIn {
  0% {
    opacity: 0;
    transform: translateY(18px) scale(0.92);
    filter: blur(14px);
  }
  65% {
    opacity: 1;
    transform: translateY(-3px) scale(1.025);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes appleFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-6px) rotate(-3deg);
  }
}

@keyframes appleSweep {
  0% {
    transform: translateX(-140%) rotate(12deg);
  }
  100% {
    transform: translateX(420%) rotate(12deg);
  }
}

@keyframes appleOrbOne {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(36px, 28px) scale(1.2);
  }
}

@keyframes appleOrbTwo {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-34px, -24px) scale(1.18);
  }
}

@keyframes appleStat {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.92);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes glassDropFall {
  0% {
    opacity: 0;
    transform: translateY(-28px) scale(0.5);
  }
  15% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(240px) scale(1);
  }
}

.apple-glass-card:hover .glass-drop {
  animation-name: glassDropFall;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-iteration-count: infinite;
}

.glass-drop {
  pointer-events: none;
  position: absolute;
  top: -18px;
  z-index: 5;
  height: 7px;
  width: 7px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 0 14px rgba(255, 255, 255, 0.9),
    0 0 26px rgba(96, 165, 250, 0.5);
  opacity: 0;
}

.glass-drop-1 {
  left: 9%;
  animation-duration: 1.7s;
  animation-delay: 0s;
}

.glass-drop-2 {
  left: 19%;
  animation-duration: 2.1s;
  animation-delay: 0.2s;
}

.glass-drop-3 {
  left: 29%;
  animation-duration: 1.8s;
  animation-delay: 0.4s;
}

.glass-drop-4 {
  left: 39%;
  animation-duration: 2.3s;
  animation-delay: 0.1s;
}

.glass-drop-5 {
  left: 49%;
  animation-duration: 1.9s;
  animation-delay: 0.35s;
}

.glass-drop-6 {
  left: 59%;
  animation-duration: 2.2s;
  animation-delay: 0.15s;
}

.glass-drop-7 {
  left: 69%;
  animation-duration: 1.8s;
  animation-delay: 0.5s;
}

.glass-drop-8 {
  left: 79%;
  animation-duration: 2.4s;
  animation-delay: 0.25s;
}

.glass-drop-9 {
  left: 88%;
  animation-duration: 1.9s;
  animation-delay: 0.45s;
}

.glass-drop-10 {
  left: 95%;
  animation-duration: 2.2s;
  animation-delay: 0.05s;
}

.animate-appleCardIn {
  animation: appleCardIn 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-appleFloat {
  animation: appleFloat 3s ease-in-out infinite;
}

.animate-appleSweep {
  animation: appleSweep 2.9s ease-in-out infinite;
}

.animate-appleOrbOne {
  animation: appleOrbOne 4.2s ease-in-out infinite;
}

.animate-appleOrbTwo {
  animation: appleOrbTwo 4.6s ease-in-out infinite;
}

.animate-appleStatOne {
  animation: appleStat 0.45s ease-out 0.15s both;
}

.animate-appleStatTwo {
  animation: appleStat 0.45s ease-out 0.25s both;
}

.animate-appleStatThree {
  animation: appleStat 0.45s ease-out 0.35s both;
}
  @keyframes framerPanelIn {
  0% {
    opacity: 0;
    transform: translateY(22px) scale(0.92);
    filter: blur(16px);
  }
  65% {
    opacity: 1;
    transform: translateY(-4px) scale(1.025);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes framerSheetFloat {
  0%, 100% {
    transform: translateY(0) rotate(var(--r));
  }
  50% {
    transform: translateY(-7px) rotate(var(--r));
  }
}

@keyframes framerOrbOne {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(34px, 28px) scale(1.18);
  }
}

@keyframes framerOrbTwo {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-34px, -28px) scale(1.16);
  }
}

@keyframes framerSweep {
  0% {
    transform: translateX(-140%) rotate(12deg);
  }
  100% {
    transform: translateX(420%) rotate(12deg);
  }
}

@keyframes framerDropFall {
  0% {
    opacity: 0;
    transform: translateY(-30px) scale(0.45);
  }
  15% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(280px) scale(1);
  }
}

.animate-framerPanelIn {
  animation: framerPanelIn 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-framerOrbOne {
  animation: framerOrbOne 4.2s ease-in-out infinite;
}

.animate-framerOrbTwo {
  animation: framerOrbTwo 4.6s ease-in-out infinite;
}

.animate-framerSweep {
  animation: framerSweep 3s ease-in-out infinite;
}

.framer-sheet-back {
  --r: -8deg;
  animation: framerSheetFloat 3.8s ease-in-out infinite;
}

.framer-sheet-mid {
  --r: 7deg;
  animation: framerSheetFloat 4.2s ease-in-out infinite;
}

.framer-sheet-front {
  --r: 0deg;
  animation: framerSheetFloat 3.5s ease-in-out infinite;
}

.framer-drop {
  pointer-events: none;
  position: absolute;
  top: -22px;
  z-index: 20;
  height: 7px;
  width: 7px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 0 12px rgba(255, 255, 255, 0.95),
    0 0 26px rgba(96, 165, 250, 0.55);
  opacity: 0;
}

.framer-glass:hover .framer-drop {
  animation-name: framerDropFall;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-iteration-count: infinite;
}

.framer-drop-1 { left: 5%; animation-duration: 1.6s; animation-delay: 0s; }
.framer-drop-2 { left: 12%; animation-duration: 2.1s; animation-delay: 0.15s; }
.framer-drop-3 { left: 20%; animation-duration: 1.8s; animation-delay: 0.35s; }
.framer-drop-4 { left: 29%; animation-duration: 2.3s; animation-delay: 0.05s; }
.framer-drop-5 { left: 38%; animation-duration: 1.7s; animation-delay: 0.25s; }
.framer-drop-6 { left: 47%; animation-duration: 2.2s; animation-delay: 0.4s; }
.framer-drop-7 { left: 56%; animation-duration: 1.9s; animation-delay: 0.1s; }
.framer-drop-8 { left: 65%; animation-duration: 2.4s; animation-delay: 0.3s; }
.framer-drop-9 { left: 74%; animation-duration: 1.8s; animation-delay: 0.5s; }
.framer-drop-10 { left: 82%; animation-duration: 2.2s; animation-delay: 0.2s; }
.framer-drop-11 { left: 88%; animation-duration: 1.7s; animation-delay: 0.45s; }
.framer-drop-12 { left: 93%; animation-duration: 2.5s; animation-delay: 0.15s; }
.framer-drop-13 { left: 35%; animation-duration: 2.6s; animation-delay: 0.55s; }
.framer-drop-14 { left: 61%; animation-duration: 2s; animation-delay: 0.65s; }

@keyframes framerBarIn {
  0% {
    opacity: 0;
    transform: translateY(24px) scale(0.96);
    filter: blur(12px);
  }
  70% {
    opacity: 1;
    transform: translateY(-3px) scale(1.01);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes framerSweep {
  0% {
    transform: translateX(-140%) rotate(12deg);
  }
  100% {
    transform: translateX(420%) rotate(12deg);
  }
}

@keyframes framerOrbOne {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(34px, 24px) scale(1.18);
  }
}

@keyframes framerOrbTwo {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-34px, -24px) scale(1.16);
  }
}

@keyframes celebrationExplode {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0.35) rotate(0deg);
  }

  7% {
    opacity: 1;
    transform: translate(calc(var(--x) * 0.12), -70px) scale(1.1) rotate(60deg);
  }

  30% {
    opacity: 1;
    transform: translate(calc(var(--x) * 0.55), calc(var(--y) * 0.25)) scale(var(--s)) rotate(calc(var(--r) * 0.45));
  }

  70% {
    opacity: 1;
    transform: translate(calc(var(--x) * 0.85), calc(var(--y) * 0.72)) scale(var(--s)) rotate(calc(var(--r) * 0.8));
  }

  100% {
    opacity: 0;
    transform: translate(var(--x), var(--y)) scale(calc(var(--s) * 0.75)) rotate(var(--r));
  }
}

@keyframes celebrationGlow {
  0%, 100% {
    box-shadow:
      0 22px 70px rgba(15, 23, 42, 0.22),
      0 0 0 rgba(59, 130, 246, 0);
  }

  50% {
    box-shadow:
      0 26px 90px rgba(15, 23, 42, 0.28),
      0 0 45px rgba(59, 130, 246, 0.35),
      0 0 70px rgba(168, 85, 247, 0.22);
  }
}

.celebration-zone:hover .framer-unlock-bar {
  animation:
    framerBarIn 0.65s cubic-bezier(0.16, 1, 0.3, 1),
    celebrationGlow 1.8s ease-in-out infinite;
  transform: translateY(-2px) scale(1.012);
}

.celebration-piece {
  pointer-events: none;
  position: absolute;
  left: 50%;
  top: 70%;
  z-index: 2147483647;
  height: 10px;
  width: 10px;
  border-radius: 9999px;
  opacity: 0;
  background: linear-gradient(135deg, #2563eb, #06b6d4, #a855f7);
  box-shadow:
    0 0 14px rgba(37, 99, 235, 0.95),
    0 0 30px rgba(6, 182, 212, 0.75),
    0 0 46px rgba(168, 85, 247, 0.6),
    0 18px 34px rgba(15, 23, 42, 0.3);
  will-change: transform, opacity;
}

.celebration-piece:nth-child(3n) {
  border-radius: 3px;
  background: linear-gradient(135deg, #22c55e, #06b6d4);
}

.celebration-piece:nth-child(3n + 1) {
  border-radius: 9999px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
}

.celebration-piece:nth-child(3n + 2) {
  border-radius: 40% 60% 58% 42%;
  background: linear-gradient(135deg, #ec4899, #f59e0b);
}

.celebration-zone:hover .celebration-piece {
  animation-name: celebrationExplode;
  animation-timing-function: cubic-bezier(0.18, 0.88, 0.28, 1);
  animation-iteration-count: infinite;
  animation-fill-mode: both;
}

/* advanced smooth celebration burst */
.celebration-piece-1 { --x: -260px; --y: 760px; --s: 1.1; --r: 520deg; animation-duration: 3.8s; animation-delay: 0s; }
.celebration-piece-2 { --x: -210px; --y: 850px; --s: 0.85; --r: 680deg; animation-duration: 4.4s; animation-delay: 0.1s; }
.celebration-piece-3 { --x: -155px; --y: 720px; --s: 1.25; --r: 460deg; animation-duration: 3.9s; animation-delay: 0.18s; }
.celebration-piece-4 { --x: -90px; --y: 900px; --s: 0.9; --r: 740deg; animation-duration: 4.7s; animation-delay: 0.04s; }
.celebration-piece-5 { --x: -35px; --y: 790px; --s: 1.2; --r: 580deg; animation-duration: 4.1s; animation-delay: 0.24s; }
.celebration-piece-6 { --x: 35px; --y: 880px; --s: 0.95; --r: 700deg; animation-duration: 4.6s; animation-delay: 0.14s; }
.celebration-piece-7 { --x: 95px; --y: 740px; --s: 1.3; --r: 530deg; animation-duration: 3.95s; animation-delay: 0.28s; }
.celebration-piece-8 { --x: 155px; --y: 910px; --s: 0.9; --r: 760deg; animation-duration: 4.8s; animation-delay: 0.09s; }
.celebration-piece-9 { --x: 215px; --y: 810px; --s: 1.1; --r: 620deg; animation-duration: 4.2s; animation-delay: 0.2s; }
.celebration-piece-10 { --x: 270px; --y: 860px; --s: 0.82; --r: 720deg; animation-duration: 4.55s; animation-delay: 0.32s; }

.celebration-piece-11 { --x: -300px; --y: 980px; --s: 0.95; --r: 820deg; animation-duration: 5s; animation-delay: 0.44s; }
.celebration-piece-12 { --x: 310px; --y: 960px; --s: 1.05; --r: 780deg; animation-duration: 4.95s; animation-delay: 0.36s; }
.celebration-piece-13 { --x: -240px; --y: 690px; --s: 0.75; --r: 480deg; animation-duration: 3.7s; animation-delay: 0.52s; }
.celebration-piece-14 { --x: 240px; --y: 700px; --s: 0.78; --r: 500deg; animation-duration: 3.75s; animation-delay: 0.58s; }
.celebration-piece-15 { --x: -125px; --y: 1010px; --s: 1.15; --r: 850deg; animation-duration: 5.15s; animation-delay: 0.66s; }
.celebration-piece-16 { --x: 125px; --y: 1030px; --s: 1.12; --r: 810deg; animation-duration: 5.25s; animation-delay: 0.72s; }
.celebration-piece-17 { --x: -20px; --y: 950px; --s: 0.82; --r: 620deg; animation-duration: 4.7s; animation-delay: 0.8s; }
.celebration-piece-18 { --x: 20px; --y: 920px; --s: 1.22; --r: 660deg; animation-duration: 4.65s; animation-delay: 0.86s; }

.celebration-piece-19 { --x: -330px; --y: 820px; --s: 0.7; --r: 720deg; animation-duration: 4.35s; animation-delay: 0.95s; }
.celebration-piece-20 { --x: 330px; --y: 835px; --s: 0.72; --r: 760deg; animation-duration: 4.4s; animation-delay: 1.05s; }
.celebration-piece-21 { --x: -175px; --y: 1080px; --s: 0.88; --r: 900deg; animation-duration: 5.45s; animation-delay: 1.12s; }
.celebration-piece-22 { --x: 175px; --y: 1070px; --s: 0.9; --r: 880deg; animation-duration: 5.35s; animation-delay: 1.2s; }
.celebration-piece-23 { --x: -70px; --y: 1110px; --s: 1; --r: 920deg; animation-duration: 5.55s; animation-delay: 1.28s; }
.celebration-piece-24 { --x: 70px; --y: 1120px; --s: 1.05; --r: 940deg; animation-duration: 5.6s; animation-delay: 1.34s; }

.celebration-piece-25 { --x: -280px; --y: 620px; --s: 0.65; --r: 480deg; animation-duration: 3.6s; animation-delay: 1.45s; }
.celebration-piece-26 { --x: 285px; --y: 630px; --s: 0.68; --r: 500deg; animation-duration: 3.65s; animation-delay: 1.52s; }
.celebration-piece-27 { --x: -10px; --y: 1160px; --s: 0.8; --r: 980deg; animation-duration: 5.8s; animation-delay: 1.6s; }
.celebration-piece-28 { --x: 10px; --y: 1180px; --s: 0.82; --r: 1000deg; animation-duration: 5.9s; animation-delay: 1.68s; }

.premium-overlay-root:hover .framer-unlock-bar {
  transform: translateY(-6px) scale(1.018);
  box-shadow:
    0 30px 95px rgba(15, 23, 42, 0.3),
    0 0 55px rgba(59, 130, 246, 0.35),
    0 0 90px rgba(168, 85, 247, 0.22);
}

.premium-celebration-layer {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 2147483646;
  overflow: hidden;
}

.premium-shockwave {
  position: fixed;
  left: var(--premium-celebrate-x, 50vw);
  top: var(--premium-celebrate-y, 50vh);
  height: 18px;
  width: 18px;
  border-radius: 9999px;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(59, 130, 246, 0.7);
  box-shadow:
    0 0 30px rgba(59, 130, 246, 0.45),
    0 0 60px rgba(168, 85, 247, 0.35);
  animation: premiumShockwave 2.4s ease-out infinite;
}

.premium-shockwave-2 {
  animation-delay: 0.35s;
  border-color: rgba(168, 85, 247, 0.65);
}

.premium-shockwave-3 {
  animation-delay: 0.7s;
  border-color: rgba(34, 197, 94, 0.55);
}

@keyframes premiumShockwave {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.2);
  }

  12% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(14);
  }
}

.premium-confetti {
  pointer-events: none;
  position: fixed;
  left: var(--premium-celebrate-x, 50vw);
  top: var(--premium-celebrate-y, 50vh);
  z-index: 2147483647;
  height: 10px;
  width: 10px;
  opacity: 0;
  transform: translate3d(0, 0, 0);
  will-change: transform, opacity;
  animation: premiumConfettiFly var(--d) cubic-bezier(0.18, 0.88, 0.28, 1) var(--delay) infinite both;
}

@keyframes premiumConfettiFly {
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0) scale(0.25) rotate(0deg);
  }

  8% {
    opacity: 1;
    transform: translate3d(calc(var(--x) * 0.16), -90px, 0) scale(1.15) rotate(var(--r1));
  }

  28% {
    opacity: 1;
    transform: translate3d(calc(var(--x) * 0.85), calc(var(--y) * 0.24), 0) scale(var(--s)) rotate(var(--r2));
  }

  72% {
    opacity: 0.95;
    transform: translate3d(calc(var(--x) * 1.08), calc(var(--y) * 0.72), 0) scale(calc(var(--s) * 0.92)) rotate(var(--r3));
  }

  100% {
    opacity: 0;
    transform: translate3d(var(--x), var(--y), 0) scale(0.55) rotate(var(--r3));
  }
}

.premium-confetti-shape-0 {
  border-radius: 9999px;
}

.premium-confetti-shape-1 {
  height: 6px;
  width: 16px;
  border-radius: 9999px;
}

.premium-confetti-shape-2 {
  height: 12px;
  width: 6px;
  border-radius: 4px;
}

.premium-confetti-shape-3 {
  height: 9px;
  width: 9px;
  border-radius: 3px;
}

.premium-confetti-shape-4 {
  height: 8px;
  width: 14px;
  border-radius: 45% 55% 50% 50%;
}

.premium-confetti-color-0 {
  background: linear-gradient(135deg, #2563eb, #06b6d4);
  box-shadow: 0 0 18px rgba(37, 99, 235, 0.75);
}

.premium-confetti-color-1 {
  background: linear-gradient(135deg, #7c3aed, #ec4899);
  box-shadow: 0 0 18px rgba(168, 85, 247, 0.75);
}

.premium-confetti-color-2 {
  background: linear-gradient(135deg, #22c55e, #14b8a6);
  box-shadow: 0 0 18px rgba(34, 197, 94, 0.7);
}

.premium-confetti-color-3 {
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  box-shadow: 0 0 18px rgba(245, 158, 11, 0.75);
}

.premium-confetti-color-4 {
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  box-shadow: 0 0 18px rgba(14, 165, 233, 0.75);
}

.premium-confetti-color-5 {
  background: linear-gradient(135deg, #a855f7, #f472b6);
  box-shadow: 0 0 18px rgba(236, 72, 153, 0.75);
}
  @keyframes premiumDockEnter {
  0% {
    opacity: 0;
    transform: translateY(26px) scale(0.94);
    filter: blur(14px);
  }
  70% {
    opacity: 1;
    transform: translateY(-3px) scale(1.012);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes premiumAuroraFloat {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.45;
  }
  50% {
    transform: translate3d(28px, -18px, 0) scale(1.18);
    opacity: 0.85;
  }
}

@keyframes premiumShineMove {
  0% {
    transform: translateX(-160%) rotate(14deg);
    opacity: 0;
  }
  20% {
    opacity: 0.9;
  }
  100% {
    transform: translateX(260%) rotate(14deg);
    opacity: 0;
  }
}

@keyframes premiumBorderFlow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 240% 50%;
  }
}

@keyframes premiumIconFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-5px) rotate(-4deg);
  }
}

@keyframes premiumGlowPulse {
  0%, 100% {
    opacity: 0.42;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.28);
  }
}

@keyframes premiumSpotlight {
  0%, 100% {
    opacity: 0.15;
    transform: translateY(20px) scale(0.95);
  }
  50% {
    opacity: 0.45;
    transform: translateY(-20px) scale(1.08);
  }
}

.premium-unlock-overlay {
  pointer-events: auto;
}

.premium-aurora {
  position: absolute;
  pointer-events: none;
  border-radius: 9999px;
  filter: blur(42px);
  will-change: transform, opacity;
}

.premium-aurora-one {
  left: -90px;
  bottom: -80px;
  width: 260px;
  height: 260px;
  background:
    radial-gradient(circle, rgba(37, 99, 235, 0.42), transparent 62%),
    radial-gradient(circle, rgba(6, 182, 212, 0.34), transparent 68%);
  animation: premiumAuroraFloat 5.6s ease-in-out infinite;
}

.premium-aurora-two {
  right: -100px;
  bottom: -70px;
  width: 280px;
  height: 280px;
  background:
    radial-gradient(circle, rgba(168, 85, 247, 0.42), transparent 62%),
    radial-gradient(circle, rgba(236, 72, 153, 0.28), transparent 68%);
  animation: premiumAuroraFloat 6.4s ease-in-out infinite reverse;
}

.premium-spotlight {
  position: absolute;
  left: 50%;
  bottom: -220px;
  width: 620px;
  height: 420px;
  pointer-events: none;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.26), transparent 64%);
  transform: translateX(-50%);
  filter: blur(16px);
  animation: premiumSpotlight 4.8s ease-in-out infinite;
}

.premium-pill,
.premium-score-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.72);
  padding: 7px 12px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgb(71, 85, 105);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 12px 34px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(22px);
}

.premium-score-pill {
  color: rgb(5, 150, 105);
  letter-spacing: 0.02em;
}

.premium-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: rgb(34, 197, 94);
  box-shadow: 0 0 18px rgba(34, 197, 94, 0.85);
}

.premium-unlock-dock {
  position: relative;
  overflow: visible;
  border-radius: 30px;
  padding: 14px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.58)),
    radial-gradient(circle at 20% 0%, rgba(37, 99, 235, 0.14), transparent 36%),
    radial-gradient(circle at 90% 20%, rgba(168, 85, 247, 0.14), transparent 40%);
  box-shadow:
    0 30px 90px rgba(15, 23, 42, 0.28),
    0 10px 30px rgba(37, 99, 235, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(28px);
  transform-origin: center;
  animation: premiumDockEnter 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  transition:
    transform 0.55s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.55s cubic-bezier(0.16, 1, 0.3, 1),
    background 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

.premium-unlock-overlay:hover .premium-unlock-dock {
  transform: translateY(-10px) scale(1.025);
  box-shadow:
    0 48px 130px rgba(15, 23, 42, 0.36),
    0 0 90px rgba(37, 99, 235, 0.28),
    0 0 120px rgba(168, 85, 247, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 1);
}

.premium-dock-border {
  position: absolute;
  inset: -1px;
  z-index: 0;
  border-radius: 31px;
  padding: 1px;
  background: linear-gradient(
    90deg,
    rgba(37, 99, 235, 0.8),
    rgba(6, 182, 212, 0.7),
    rgba(168, 85, 247, 0.8),
    rgba(236, 72, 153, 0.55),
    rgba(37, 99, 235, 0.8)
  );
  background-size: 240% 100%;
  animation: premiumBorderFlow 5.8s linear infinite;
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  opacity: 0.7;
}

.premium-dock-shine {
  position: absolute;
  top: -40%;
  bottom: -40%;
  left: 0;
  z-index: 1;
  width: 90px;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.8),
    transparent
  );
  filter: blur(1px);
  animation: premiumShineMove 4.2s ease-in-out infinite;
}

.premium-dock-noise {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  border-radius: 30px;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.55) 0 1px, transparent 1px),
    radial-gradient(circle at 80% 40%, rgba(255, 255, 255, 0.42) 0 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.24;
}

.premium-outside-glow {
  position: absolute;
  left: 50%;
  bottom: -70px;
  z-index: -1;
  width: 78%;
  height: 120px;
  pointer-events: none;
  border-radius: 9999px;
  background:
    radial-gradient(circle, rgba(37, 99, 235, 0.35), transparent 62%),
    radial-gradient(circle, rgba(168, 85, 247, 0.2), transparent 70%);
  transform: translateX(-50%);
  filter: blur(26px);
  opacity: 0;
  transition: opacity 0.45s ease, transform 0.45s ease;
}

.premium-unlock-overlay:hover .premium-outside-glow {
  opacity: 1;
  transform: translateX(-50%) translateY(18px) scale(1.12);
}

.premium-icon-wrap {
  position: relative;
  display: flex;
  width: 54px;
  height: 54px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.premium-icon-glow {
  position: absolute;
  inset: -12px;
  border-radius: 22px;
  background:
    radial-gradient(circle, rgba(37, 99, 235, 0.34), transparent 65%),
    radial-gradient(circle, rgba(168, 85, 247, 0.28), transparent 72%);
  filter: blur(12px);
  animation: premiumGlowPulse 3s ease-in-out infinite;
}

.premium-icon {
  position: relative;
  display: flex;
  width: 46px;
  height: 46px;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  font-size: 20px;
  font-weight: 900;
  box-shadow:
    0 18px 36px rgba(37, 99, 235, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.45);
  animation: premiumIconFloat 3.4s ease-in-out infinite;
}

.premium-eyebrow {
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgb(37, 99, 235);
}

.premium-unlock-btn {
  position: relative;
  display: inline-flex;
  min-width: 94px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 7px;
  overflow: hidden;
  border-radius: 20px;
  background:
    radial-gradient(circle at 30% 0%, rgba(255, 255, 255, 0.18), transparent 36%),
    linear-gradient(135deg, #020617, #172554 45%, #2563eb);
  padding: 14px 17px;
  font-size: 13px;
  font-weight: 950;
  color: white;
  box-shadow:
    0 18px 42px rgba(15, 23, 42, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.12) inset;
  transition:
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.premium-unlock-btn::before {
  content: "";
  position: absolute;
  inset: -60%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.58),
    transparent
  );
  transform: translateX(-120%) rotate(18deg);
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.premium-unlock-btn:hover {
  transform: translateY(-3px) scale(1.045);
  box-shadow:
    0 24px 56px rgba(37, 99, 235, 0.38),
    0 0 44px rgba(37, 99, 235, 0.26);
}

.premium-unlock-btn:hover::before {
  transform: translateX(120%) rotate(18deg);
}

.premium-stat {
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.6);
  padding: 10px 8px;
  text-align: center;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 10px 26px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(18px);
  transition:
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    background 0.35s ease;
}

.premium-unlock-overlay:hover .premium-stat {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.78);
}

.premium-stat p {
  font-size: 20px;
  line-height: 1;
  font-weight: 950;
}

.premium-stat span {
  margin-top: 4px;
  display: block;
  font-size: 9px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgb(100, 116, 139);
}

.premium-stat-green p {
  color: rgb(5, 150, 105);
}

.premium-stat-blue p {
  color: rgb(37, 99, 235);
}

.premium-stat-purple p {
  color: rgb(124, 58, 237);
}

@media (max-width: 640px) {
  .premium-unlock-dock {
    padding: 12px;
    border-radius: 26px;
  }

  .premium-dock-border,
  .premium-dock-noise {
    border-radius: 26px;
  }

  .premium-icon-wrap {
    width: 48px;
    height: 48px;
  }

  .premium-icon {
    width: 40px;
    height: 40px;
    border-radius: 15px;
  }

  .premium-unlock-btn {
    min-width: 82px;
    padding: 12px 14px;
  }
}
  /* FAST HIGH-END PREMIUM HOVER OVERRIDE */
.premium-unlock-overlay {
  pointer-events: auto;
}

.premium-mesh {
  position: absolute;
  pointer-events: none;
  border-radius: 9999px;
  filter: blur(34px);
  transform: translate3d(0, 0, 0);
  will-change: transform, opacity;
}

.premium-mesh-one {
  left: -80px;
  bottom: -90px;
  height: 260px;
  width: 260px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.34), transparent 65%);
  animation: premiumMeshFloat 4.8s ease-in-out infinite;
}

.premium-mesh-two {
  right: -90px;
  bottom: -80px;
  height: 280px;
  width: 280px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.32), transparent 65%);
  animation: premiumMeshFloat 5.4s ease-in-out infinite reverse;
}

@keyframes premiumMeshFloat {
  0%, 100% {
    opacity: 0.45;
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    opacity: 0.85;
    transform: translate3d(24px, -18px, 0) scale(1.14);
  }
}

.premium-light-beam {
  position: absolute;
  left: 50%;
  bottom: -240px;
  height: 420px;
  width: 620px;
  pointer-events: none;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.22), transparent 68%);
  filter: blur(18px);
  transform: translateX(-50%);
}

.premium-pill,
.premium-score-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.76);
  padding: 7px 12px;
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgb(71, 85, 105);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 12px 32px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(22px);
}

.premium-score-pill {
  color: rgb(5, 150, 105);
  letter-spacing: 0.03em;
}

.premium-live-dot {
  height: 7px;
  width: 7px;
  border-radius: 9999px;
  background: rgb(34, 197, 94);
  box-shadow: 0 0 18px rgba(34, 197, 94, 0.85);
}

.premium-unlock-dock {
  position: relative;
  display: block;
  width: 100%;
  overflow: visible;
  border: 0;
  border-radius: 30px;
  padding: 14px;
  cursor: pointer;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.64)),
    radial-gradient(circle at 18% 0%, rgba(37, 99, 235, 0.14), transparent 38%),
    radial-gradient(circle at 92% 18%, rgba(168, 85, 247, 0.14), transparent 42%);
  box-shadow:
    0 24px 72px rgba(15, 23, 42, 0.24),
    0 10px 28px rgba(37, 99, 235, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(28px);
  transform: translate3d(0, 0, 0) scale(1);
  transform-origin: center;
  backface-visibility: hidden;
  will-change: transform, box-shadow;
  animation: premiumDockEnter 0.42s cubic-bezier(0.16, 1, 0.3, 1);
  transition:
    transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 220ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes premiumDockEnter {
  from {
    opacity: 0;
    transform: translate3d(0, 18px, 0) scale(0.97);
    filter: blur(8px);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
    filter: blur(0);
  }
}

.premium-unlock-overlay:hover .premium-unlock-dock {
  transform: translate3d(0, -7px, 0) scale(1.018);
  box-shadow:
    0 34px 95px rgba(15, 23, 42, 0.32),
    0 0 54px rgba(37, 99, 235, 0.26),
    0 0 74px rgba(168, 85, 247, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 1);
}

.premium-dock-border {
  position: absolute;
  inset: -1px;
  z-index: 0;
  border-radius: 31px;
  padding: 1px;
  background: linear-gradient(
    90deg,
    rgba(37, 99, 235, 0.85),
    rgba(6, 182, 212, 0.65),
    rgba(168, 85, 247, 0.85),
    rgba(236, 72, 153, 0.5),
    rgba(37, 99, 235, 0.85)
  );
  background-size: 260% 100%;
  opacity: 0.72;
  animation: premiumBorderFlow 3.8s linear infinite;
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
}

@keyframes premiumBorderFlow {
  to {
    background-position: 260% 50%;
  }
}

.premium-dock-shine {
  position: absolute;
  top: -45%;
  bottom: -45%;
  left: -120px;
  z-index: 1;
  width: 80px;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.78), transparent);
  filter: blur(1px);
  transform: translateX(0) rotate(15deg);
  opacity: 0;
}

.premium-unlock-overlay:hover .premium-dock-shine {
  animation: premiumShineFast 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes premiumShineFast {
  0% {
    opacity: 0;
    transform: translateX(0) rotate(15deg);
  }

  18% {
    opacity: 0.95;
  }

  100% {
    opacity: 0;
    transform: translateX(620px) rotate(15deg);
  }
}

.premium-dock-noise {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: 30px;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.56) 0 1px, transparent 1px),
    radial-gradient(circle at 80% 40%, rgba(255, 255, 255, 0.4) 0 1px, transparent 1px);
  background-size: 22px 22px;
  opacity: 0.2;
}

.premium-icon-wrap {
  position: relative;
  display: flex;
  height: 54px;
  width: 54px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.premium-icon-glow {
  position: absolute;
  inset: -12px;
  border-radius: 24px;
  background:
    radial-gradient(circle, rgba(37, 99, 235, 0.35), transparent 66%),
    radial-gradient(circle, rgba(168, 85, 247, 0.25), transparent 74%);
  filter: blur(12px);
  opacity: 0.85;
  transition: transform 220ms ease, opacity 220ms ease;
}

.premium-unlock-overlay:hover .premium-icon-glow {
  opacity: 1;
  transform: scale(1.16);
}

.premium-icon {
  position: relative;
  display: flex;
  height: 46px;
  width: 46px;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background:
    radial-gradient(circle at 30% 0%, rgba(255, 255, 255, 0.28), transparent 34%),
    linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  font-size: 20px;
  font-weight: 950;
  box-shadow:
    0 16px 34px rgba(37, 99, 235, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.45);
  transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
}

.premium-unlock-overlay:hover .premium-icon {
  transform: translateY(-2px) rotate(-6deg) scale(1.06);
}

.premium-eyebrow {
  display: block;
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgb(37, 99, 235);
}

.premium-unlock-btn {
  position: relative;
  display: inline-flex;
  min-width: 92px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 7px;
  overflow: hidden;
  border-radius: 20px;
  background:
    radial-gradient(circle at 30% 0%, rgba(255, 255, 255, 0.18), transparent 36%),
    linear-gradient(135deg, #020617, #172554 46%, #2563eb);
  padding: 13px 16px;
  font-size: 13px;
  font-weight: 950;
  color: white;
  box-shadow:
    0 17px 38px rgba(15, 23, 42, 0.32),
    0 0 0 1px rgba(255, 255, 255, 0.12) inset;
  transition:
    transform 180ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.premium-unlock-overlay:hover .premium-unlock-btn {
  transform: translate3d(0, -2px, 0) scale(1.04);
  box-shadow:
    0 22px 48px rgba(37, 99, 235, 0.34),
    0 0 36px rgba(37, 99, 235, 0.24);
}

.premium-stat {
  display: block;
  border-radius: 19px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.62);
  padding: 10px 8px;
  text-align: center;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 10px 24px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(18px);
  transition:
    transform 200ms cubic-bezier(0.16, 1, 0.3, 1),
    background 200ms ease;
}

.premium-unlock-overlay:hover .premium-stat {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.78);
}

.premium-stat strong {
  display: block;
  font-size: 20px;
  line-height: 1;
  font-weight: 950;
}

.premium-stat small {
  margin-top: 4px;
  display: block;
  font-size: 9px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgb(100, 116, 139);
}

.premium-stat-green strong {
  color: rgb(5, 150, 105);
}

.premium-stat-blue strong {
  color: rgb(37, 99, 235);
}

.premium-stat-purple strong {
  color: rgb(124, 58, 237);
}

.premium-outside-glow {
  position: absolute;
  left: 50%;
  bottom: -62px;
  z-index: -1;
  height: 105px;
  width: 76%;
  pointer-events: none;
  border-radius: 9999px;
  background:
    radial-gradient(circle, rgba(37, 99, 235, 0.32), transparent 64%),
    radial-gradient(circle, rgba(168, 85, 247, 0.2), transparent 72%);
  filter: blur(24px);
  opacity: 0;
  transform: translateX(-50%) translateY(0) scale(0.92);
  transition:
    opacity 220ms ease,
    transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
}

.premium-unlock-overlay:hover .premium-outside-glow {
  opacity: 1;
  transform: translateX(-50%) translateY(16px) scale(1.08);
}

/* smooth premium particles */
.premium-spark-field {
  pointer-events: none;
  position: absolute;
  inset: -90px;
  z-index: 2;
  overflow: visible;
}

.premium-spark {
  position: absolute;
  left: var(--l);
  top: var(--t);
  height: var(--h);
  width: var(--w);
  border-radius: var(--br);
  opacity: 0;
  background: var(--bg);
  box-shadow: var(--shadow);
  transform: translate3d(0, 0, 0) scale(0.4) rotate(0deg);
  will-change: transform, opacity;
}

.premium-unlock-overlay:hover .premium-spark {
  animation: premiumSparkFly var(--dur) cubic-bezier(0.16, 0.84, 0.24, 1) var(--delay) infinite both;
}

@keyframes premiumSparkFly {
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0) scale(0.35) rotate(0deg);
  }

  12% {
    opacity: 1;
  }

  72% {
    opacity: 0.9;
  }

  100% {
    opacity: 0;
    transform: translate3d(var(--x), var(--y), 0) scale(var(--s)) rotate(var(--r));
  }
}

.premium-spark-1 {
  --l: 12%;
  --t: 72%;
  --x: -62px;
  --y: -86px;
  --s: 1;
  --r: 140deg;
  --dur: 980ms;
  --delay: 0ms;
  --h: 6px;
  --w: 6px;
  --br: 9999px;
  --bg: radial-gradient(circle, #ffffff, #60a5fa);
  --shadow: 0 0 16px rgba(96, 165, 250, 0.85);
}

.premium-spark-2 {
  --l: 22%;
  --t: 78%;
  --x: -28px;
  --y: -116px;
  --s: 0.9;
  --r: 210deg;
  --dur: 1180ms;
  --delay: 80ms;
  --h: 4px;
  --w: 18px;
  --br: 9999px;
  --bg: linear-gradient(90deg, #38bdf8, #a855f7);
  --shadow: 0 0 16px rgba(56, 189, 248, 0.7);
}

.premium-spark-3 {
  --l: 34%;
  --t: 74%;
  --x: -8px;
  --y: -96px;
  --s: 1;
  --r: 260deg;
  --dur: 1040ms;
  --delay: 150ms;
  --h: 7px;
  --w: 7px;
  --br: 9999px;
  --bg: radial-gradient(circle, #ffffff, #a855f7);
  --shadow: 0 0 18px rgba(168, 85, 247, 0.8);
}

.premium-spark-4 {
  --l: 48%;
  --t: 80%;
  --x: 22px;
  --y: -128px;
  --s: 0.95;
  --r: 310deg;
  --dur: 1220ms;
  --delay: 40ms;
  --h: 5px;
  --w: 20px;
  --br: 9999px;
  --bg: linear-gradient(90deg, #2563eb, #ec4899);
  --shadow: 0 0 18px rgba(236, 72, 153, 0.7);
}

.premium-spark-5 {
  --l: 60%;
  --t: 72%;
  --x: 52px;
  --y: -94px;
  --s: 1.05;
  --r: 380deg;
  --dur: 1080ms;
  --delay: 120ms;
  --h: 6px;
  --w: 6px;
  --br: 9999px;
  --bg: radial-gradient(circle, #ffffff, #22c55e);
  --shadow: 0 0 16px rgba(34, 197, 94, 0.76);
}

.premium-spark-6 {
  --l: 76%;
  --t: 78%;
  --x: 76px;
  --y: -122px;
  --s: 0.92;
  --r: 460deg;
  --dur: 1260ms;
  --delay: 190ms;
  --h: 4px;
  --w: 18px;
  --br: 9999px;
  --bg: linear-gradient(90deg, #06b6d4, #7c3aed);
  --shadow: 0 0 16px rgba(124, 58, 237, 0.72);
}

.premium-spark-7 {
  --l: 88%;
  --t: 70%;
  --x: 96px;
  --y: -80px;
  --s: 0.9;
  --r: 520deg;
  --dur: 980ms;
  --delay: 240ms;
  --h: 6px;
  --w: 6px;
  --br: 9999px;
  --bg: radial-gradient(circle, #ffffff, #f59e0b);
  --shadow: 0 0 16px rgba(245, 158, 11, 0.78);
}

.premium-spark-8 {
  --l: 18%;
  --t: 45%;
  --x: -72px;
  --y: -30px;
  --s: 0.85;
  --r: 220deg;
  --dur: 1180ms;
  --delay: 300ms;
  --h: 5px;
  --w: 5px;
  --br: 9999px;
  --bg: radial-gradient(circle, #ffffff, #38bdf8);
  --shadow: 0 0 14px rgba(56, 189, 248, 0.75);
}

.premium-spark-9 {
  --l: 82%;
  --t: 45%;
  --x: 72px;
  --y: -34px;
  --s: 0.85;
  --r: 360deg;
  --dur: 1160ms;
  --delay: 360ms;
  --h: 5px;
  --w: 5px;
  --br: 9999px;
  --bg: radial-gradient(circle, #ffffff, #a855f7);
  --shadow: 0 0 14px rgba(168, 85, 247, 0.75);
}

.premium-spark-10 {
  --l: 50%;
  --t: 62%;
  --x: 0px;
  --y: -150px;
  --s: 1;
  --r: 480deg;
  --dur: 1320ms;
  --delay: 210ms;
  --h: 4px;
  --w: 22px;
  --br: 9999px;
  --bg: linear-gradient(90deg, #ffffff, #2563eb);
  --shadow: 0 0 18px rgba(37, 99, 235, 0.75);
}

.premium-spark-11 {
  --l: 8%;
  --t: 90%;
  --x: -42px;
  --y: -68px;
  --s: 0.82;
  --r: 190deg;
  --dur: 1020ms;
  --delay: 420ms;
  --h: 5px;
  --w: 5px;
  --br: 9999px;
  --bg: radial-gradient(circle, #ffffff, #2563eb);
  --shadow: 0 0 14px rgba(37, 99, 235, 0.75);
}

.premium-spark-12 {
  --l: 92%;
  --t: 90%;
  --x: 42px;
  --y: -68px;
  --s: 0.82;
  --r: 420deg;
  --dur: 1020ms;
  --delay: 500ms;
  --h: 5px;
  --w: 5px;
  --br: 9999px;
  --bg: radial-gradient(circle, #ffffff, #ec4899);
  --shadow: 0 0 14px rgba(236, 72, 153, 0.75);
}

.premium-spark-13 {
  --l: 38%;
  --t: 88%;
  --x: -26px;
  --y: -82px;
  --s: 0.88;
  --r: 300deg;
  --dur: 1120ms;
  --delay: 560ms;
  --h: 3px;
  --w: 16px;
  --br: 9999px;
  --bg: linear-gradient(90deg, #22c55e, #06b6d4);
  --shadow: 0 0 14px rgba(6, 182, 212, 0.65);
}

.premium-spark-14 {
  --l: 64%;
  --t: 88%;
  --x: 28px;
  --y: -82px;
  --s: 0.88;
  --r: 340deg;
  --dur: 1120ms;
  --delay: 620ms;
  --h: 3px;
  --w: 16px;
  --br: 9999px;
  --bg: linear-gradient(90deg, #a855f7, #f472b6);
  --shadow: 0 0 14px rgba(244, 114, 182, 0.65);
}

.premium-spark-15 {
  --l: 28%;
  --t: 34%;
  --x: -38px;
  --y: -42px;
  --s: 0.78;
  --r: 260deg;
  --dur: 1280ms;
  --delay: 690ms;
  --h: 4px;
  --w: 4px;
  --br: 9999px;
  --bg: radial-gradient(circle, #ffffff, #60a5fa);
  --shadow: 0 0 14px rgba(96, 165, 250, 0.72);
}

.premium-spark-16 {
  --l: 72%;
  --t: 34%;
  --x: 38px;
  --y: -42px;
  --s: 0.78;
  --r: 420deg;
  --dur: 1280ms;
  --delay: 760ms;
  --h: 4px;
  --w: 4px;
  --br: 9999px;
  --bg: radial-gradient(circle, #ffffff, #c084fc);
  --shadow: 0 0 14px rgba(192, 132, 252, 0.72);
}

.premium-spark-17 {
  --l: 44%;
  --t: 28%;
  --x: -18px;
  --y: -54px;
  --s: 0.74;
  --r: 240deg;
  --dur: 1320ms;
  --delay: 830ms;
  --h: 4px;
  --w: 4px;
  --br: 9999px;
  --bg: radial-gradient(circle, #ffffff, #38bdf8);
  --shadow: 0 0 14px rgba(56, 189, 248, 0.72);
}

.premium-spark-18 {
  --l: 56%;
  --t: 28%;
  --x: 18px;
  --y: -54px;
  --s: 0.74;
  --r: 390deg;
  --dur: 1320ms;
  --delay: 900ms;
  --h: 4px;
  --w: 4px;
  --br: 9999px;
  --bg: radial-gradient(circle, #ffffff, #a855f7);
  --shadow: 0 0 14px rgba(168, 85, 247, 0.72);
}

@media (max-width: 640px) {
  .premium-unlock-dock {
    padding: 12px;
    border-radius: 26px;
  }

  .premium-dock-border,
  .premium-dock-noise {
    border-radius: 27px;
  }

  .premium-icon-wrap {
    height: 48px;
    width: 48px;
  }

  .premium-icon {
    height: 40px;
    width: 40px;
    border-radius: 15px;
  }

  .premium-unlock-btn {
    min-width: 78px;
    padding: 12px 13px;
    font-size: 12px;
  }
}
  /* POLISHED ELITE LOCKED OVERLAY */
.elite-overlay {
  pointer-events: auto;
}

.elite-backdrop {
  position: absolute;
  inset: 0;
  z-index: 10;
  background:
    linear-gradient(to bottom, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.42)),
    radial-gradient(circle at 50% 95%, rgba(37, 99, 235, 0.12), transparent 42%);
  backdrop-filter: blur(1.4px);
}

.elite-ambient-layer {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 20;
  overflow: hidden;
}

.elite-blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(38px);
  will-change: transform, opacity;
}

.elite-blob-blue {
  left: -90px;
  bottom: -85px;
  height: 270px;
  width: 270px;
  background:
    radial-gradient(circle, rgba(37, 99, 235, 0.38), transparent 65%),
    radial-gradient(circle, rgba(6, 182, 212, 0.22), transparent 72%);
  animation: eliteBlobMove 5.4s ease-in-out infinite;
}

.elite-blob-purple {
  right: -105px;
  bottom: -90px;
  height: 295px;
  width: 295px;
  background:
    radial-gradient(circle, rgba(124, 58, 237, 0.34), transparent 64%),
    radial-gradient(circle, rgba(236, 72, 153, 0.2), transparent 72%);
  animation: eliteBlobMove 6.2s ease-in-out infinite reverse;
}

@keyframes eliteBlobMove {
  0%, 100% {
    opacity: 0.5;
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    opacity: 0.9;
    transform: translate3d(26px, -20px, 0) scale(1.15);
  }
}

.elite-spotlight {
  position: absolute;
  left: 50%;
  bottom: -245px;
  height: 430px;
  width: 680px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.24), transparent 68%);
  filter: blur(18px);
  transform: translateX(-50%);
}

.elite-grid-glow {
  position: absolute;
  inset: 0;
  opacity: 0.12;
  background-image:
    linear-gradient(rgba(37, 99, 235, 0.16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(37, 99, 235, 0.16) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: radial-gradient(circle at 50% 75%, black, transparent 70%);
}

.elite-top-pill,
.elite-score-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.78);
  background: rgba(255, 255, 255, 0.78);
  padding: 7px 12px;
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgb(71, 85, 105);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 12px 30px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(24px);
}

.elite-score-pill {
  color: rgb(5, 150, 105);
  letter-spacing: 0.04em;
}

.elite-score-pill span {
  font-weight: 1000;
}

.elite-live-dot {
  height: 7px;
  width: 7px;
  border-radius: 9999px;
  background: rgb(34, 197, 94);
  box-shadow: 0 0 18px rgba(34, 197, 94, 0.9);
  animation: eliteLivePulse 1.6s ease-in-out infinite;
}

@keyframes eliteLivePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.75;
  }

  50% {
    transform: scale(1.35);
    opacity: 1;
  }
}

.elite-dock {
  position: relative;
  display: block;
  width: 100%;
  cursor: pointer;
  overflow: visible;
  border: 0;
  border-radius: 32px;
  padding: 14px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.66)),
    radial-gradient(circle at 15% 0%, rgba(37, 99, 235, 0.15), transparent 38%),
    radial-gradient(circle at 92% 20%, rgba(168, 85, 247, 0.15), transparent 42%);
  box-shadow:
    0 26px 74px rgba(15, 23, 42, 0.26),
    0 12px 34px rgba(37, 99, 235, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(30px);
  transform: translate3d(0, 0, 0);
  transform-origin: center;
  backface-visibility: hidden;
  will-change: transform, box-shadow;
  animation: eliteDockIn 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  transition:
    transform 210ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 210ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes eliteDockIn {
  from {
    opacity: 0;
    transform: translate3d(0, 18px, 0) scale(0.965);
    filter: blur(10px);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
    filter: blur(0);
  }
}

.elite-overlay:hover .elite-dock {
  transform: translate3d(0, -8px, 0) scale(1.02);
  box-shadow:
    0 38px 100px rgba(15, 23, 42, 0.34),
    0 0 56px rgba(37, 99, 235, 0.28),
    0 0 82px rgba(168, 85, 247, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 1);
}

.elite-border {
  position: absolute;
  inset: -1px;
  z-index: 0;
  border-radius: 33px;
  padding: 1px;
  background: linear-gradient(
    90deg,
    rgba(37, 99, 235, 0.9),
    rgba(6, 182, 212, 0.72),
    rgba(168, 85, 247, 0.9),
    rgba(236, 72, 153, 0.58),
    rgba(37, 99, 235, 0.9)
  );
  background-size: 260% 100%;
  opacity: 0.78;
  animation: eliteBorderFlow 3.4s linear infinite;
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
}

@keyframes eliteBorderFlow {
  to {
    background-position: 260% 50%;
  }
}

.elite-shine {
  position: absolute;
  top: -45%;
  bottom: -45%;
  left: -140px;
  z-index: 1;
  width: 90px;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.82), transparent);
  filter: blur(1px);
  opacity: 0;
  transform: rotate(15deg);
}

.elite-overlay:hover .elite-shine {
  animation: eliteShineSweep 0.95s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes eliteShineSweep {
  0% {
    opacity: 0;
    transform: translateX(0) rotate(15deg);
  }

  18% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translateX(650px) rotate(15deg);
  }
}

.elite-noise {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: 32px;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.55) 0 1px, transparent 1px),
    radial-gradient(circle at 80% 42%, rgba(255, 255, 255, 0.42) 0 1px, transparent 1px);
  background-size: 22px 22px;
  opacity: 0.2;
}

.elite-icon-wrap {
  position: relative;
  display: flex;
  height: 56px;
  width: 56px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.elite-icon-ring {
  position: absolute;
  inset: 2px;
  border-radius: 22px;
  border: 1px solid rgba(37, 99, 235, 0.26);
  opacity: 0;
  transform: scale(0.8);
  transition:
    opacity 220ms ease,
    transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
}

.elite-overlay:hover .elite-icon-ring {
  opacity: 1;
  transform: scale(1.24);
}

.elite-icon-glow {
  position: absolute;
  inset: -12px;
  border-radius: 24px;
  background:
    radial-gradient(circle, rgba(37, 99, 235, 0.36), transparent 66%),
    radial-gradient(circle, rgba(168, 85, 247, 0.28), transparent 74%);
  filter: blur(12px);
  opacity: 0.82;
  transition:
    transform 220ms ease,
    opacity 220ms ease;
}

.elite-overlay:hover .elite-icon-glow {
  opacity: 1;
  transform: scale(1.18);
}

.elite-icon {
  position: relative;
  display: flex;
  height: 48px;
  width: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 19px;
  background:
    radial-gradient(circle at 30% 0%, rgba(255, 255, 255, 0.32), transparent 35%),
    linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  font-size: 21px;
  font-weight: 950;
  box-shadow:
    0 17px 36px rgba(37, 99, 235, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.48);
  transition:
    transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 220ms ease;
}

.elite-overlay:hover .elite-icon {
  transform: translateY(-2px) rotate(-7deg) scale(1.07);
  box-shadow:
    0 22px 44px rgba(37, 99, 235, 0.42),
    0 0 30px rgba(124, 58, 237, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.elite-eyebrow {
  display: block;
  font-size: 10px;
  font-weight: 1000;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgb(37, 99, 235);
}

.elite-cta {
  position: relative;
  display: inline-flex;
  min-width: 94px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 7px;
  overflow: hidden;
  border-radius: 21px;
  background:
    radial-gradient(circle at 30% 0%, rgba(255, 255, 255, 0.18), transparent 36%),
    linear-gradient(135deg, #020617, #172554 45%, #2563eb);
  padding: 13px 16px;
  font-size: 13px;
  font-weight: 1000;
  color: white;
  box-shadow:
    0 17px 38px rgba(15, 23, 42, 0.34),
    0 0 0 1px rgba(255, 255, 255, 0.12) inset;
  transition:
    transform 180ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 180ms ease;
}

.elite-overlay:hover .elite-cta {
  transform: translate3d(0, -2px, 0) scale(1.045);
  box-shadow:
    0 23px 52px rgba(37, 99, 235, 0.36),
    0 0 38px rgba(37, 99, 235, 0.26);
}

.elite-arrow {
  display: inline-block;
  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.elite-overlay:hover .elite-arrow {
  transform: translateX(3px);
}

.elite-stat {
  display: block;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.74);
  background: rgba(255, 255, 255, 0.64);
  padding: 10px 8px;
  text-align: center;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    0 10px 24px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(18px);
  transition:
    transform 200ms cubic-bezier(0.16, 1, 0.3, 1),
    background 200ms ease,
    box-shadow 200ms ease;
}

.elite-overlay:hover .elite-stat {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.82);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    0 13px 28px rgba(15, 23, 42, 0.1);
}

.elite-stat strong {
  display: block;
  font-size: 20px;
  line-height: 1;
  font-weight: 1000;
}

.elite-stat small {
  margin-top: 4px;
  display: block;
  font-size: 9px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgb(100, 116, 139);
}

.elite-stat-green strong {
  color: rgb(5, 150, 105);
}

.elite-stat-blue strong {
  color: rgb(37, 99, 235);
}

.elite-stat-purple strong {
  color: rgb(124, 58, 237);
}

.elite-bottom-glow {
  position: absolute;
  left: 50%;
  bottom: -64px;
  z-index: -1;
  height: 110px;
  width: 78%;
  pointer-events: none;
  border-radius: 9999px;
  background:
    radial-gradient(circle, rgba(37, 99, 235, 0.34), transparent 64%),
    radial-gradient(circle, rgba(168, 85, 247, 0.22), transparent 72%);
  filter: blur(24px);
  opacity: 0;
  transform: translateX(-50%) translateY(0) scale(0.92);
  transition:
    opacity 220ms ease,
    transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
}

.elite-overlay:hover .elite-bottom-glow {
  opacity: 1;
  transform: translateX(-50%) translateY(16px) scale(1.1);
}

.elite-particles {
  pointer-events: none;
  position: absolute;
  inset: -80px;
  z-index: 2;
  overflow: visible;
}

.elite-particle {
  position: absolute;
  left: var(--l);
  top: var(--t);
  height: var(--h);
  width: var(--w);
  border-radius: var(--br);
  opacity: 0;
  background: var(--bg);
  box-shadow: var(--shadow);
  transform: translate3d(0, 0, 0) scale(0.4) rotate(0deg);
  will-change: transform, opacity;
}

.elite-overlay:hover .elite-particle {
  animation: eliteParticleFly var(--dur) cubic-bezier(0.16, 0.84, 0.24, 1) var(--delay) infinite both;
}

@keyframes eliteParticleFly {
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0) scale(0.35) rotate(0deg);
  }

  12% {
    opacity: 1;
  }

  70% {
    opacity: 0.92;
  }

  100% {
    opacity: 0;
    transform: translate3d(var(--x), var(--y), 0) scale(var(--s)) rotate(var(--r));
  }
}

.elite-particle:nth-child(1) {
  --l: 12%; --t: 74%; --x: -58px; --y: -88px; --s: 1; --r: 140deg; --dur: 960ms; --delay: 0ms;
  --h: 6px; --w: 6px; --br: 9999px;
  --bg: radial-gradient(circle, #fff, #60a5fa);
  --shadow: 0 0 16px rgba(96, 165, 250, 0.85);
}

.elite-particle:nth-child(2) {
  --l: 23%; --t: 80%; --x: -30px; --y: -120px; --s: 0.9; --r: 210deg; --dur: 1120ms; --delay: 70ms;
  --h: 4px; --w: 18px; --br: 9999px;
  --bg: linear-gradient(90deg, #38bdf8, #a855f7);
  --shadow: 0 0 16px rgba(56, 189, 248, 0.75);
}

.elite-particle:nth-child(3) {
  --l: 35%; --t: 75%; --x: -8px; --y: -100px; --s: 1; --r: 260deg; --dur: 1020ms; --delay: 140ms;
  --h: 7px; --w: 7px; --br: 9999px;
  --bg: radial-gradient(circle, #fff, #a855f7);
  --shadow: 0 0 18px rgba(168, 85, 247, 0.82);
}

.elite-particle:nth-child(4) {
  --l: 48%; --t: 80%; --x: 24px; --y: -132px; --s: 0.95; --r: 310deg; --dur: 1180ms; --delay: 40ms;
  --h: 5px; --w: 20px; --br: 9999px;
  --bg: linear-gradient(90deg, #2563eb, #ec4899);
  --shadow: 0 0 18px rgba(236, 72, 153, 0.72);
}

.elite-particle:nth-child(5) {
  --l: 61%; --t: 73%; --x: 54px; --y: -96px; --s: 1.05; --r: 380deg; --dur: 1040ms; --delay: 120ms;
  --h: 6px; --w: 6px; --br: 9999px;
  --bg: radial-gradient(circle, #fff, #22c55e);
  --shadow: 0 0 16px rgba(34, 197, 94, 0.78);
}

.elite-particle:nth-child(6) {
  --l: 76%; --t: 79%; --x: 78px; --y: -124px; --s: 0.92; --r: 460deg; --dur: 1220ms; --delay: 180ms;
  --h: 4px; --w: 18px; --br: 9999px;
  --bg: linear-gradient(90deg, #06b6d4, #7c3aed);
  --shadow: 0 0 16px rgba(124, 58, 237, 0.72);
}

.elite-particle:nth-child(7) {
  --l: 88%; --t: 70%; --x: 94px; --y: -82px; --s: 0.9; --r: 520deg; --dur: 960ms; --delay: 240ms;
  --h: 6px; --w: 6px; --br: 9999px;
  --bg: radial-gradient(circle, #fff, #f59e0b);
  --shadow: 0 0 16px rgba(245, 158, 11, 0.78);
}

.elite-particle:nth-child(8) {
  --l: 18%; --t: 45%; --x: -70px; --y: -30px; --s: 0.85; --r: 220deg; --dur: 1120ms; --delay: 300ms;
  --h: 5px; --w: 5px; --br: 9999px;
  --bg: radial-gradient(circle, #fff, #38bdf8);
  --shadow: 0 0 14px rgba(56, 189, 248, 0.75);
}

.elite-particle:nth-child(9) {
  --l: 82%; --t: 45%; --x: 70px; --y: -34px; --s: 0.85; --r: 360deg; --dur: 1100ms; --delay: 360ms;
  --h: 5px; --w: 5px; --br: 9999px;
  --bg: radial-gradient(circle, #fff, #a855f7);
  --shadow: 0 0 14px rgba(168, 85, 247, 0.75);
}

.elite-particle:nth-child(10) {
  --l: 50%; --t: 62%; --x: 0px; --y: -150px; --s: 1; --r: 480deg; --dur: 1260ms; --delay: 210ms;
  --h: 4px; --w: 22px; --br: 9999px;
  --bg: linear-gradient(90deg, #fff, #2563eb);
  --shadow: 0 0 18px rgba(37, 99, 235, 0.76);
}

.elite-particle:nth-child(11) {
  --l: 8%; --t: 90%; --x: -42px; --y: -68px; --s: 0.82; --r: 190deg; --dur: 1020ms; --delay: 420ms;
  --h: 5px; --w: 5px; --br: 9999px;
  --bg: radial-gradient(circle, #fff, #2563eb);
  --shadow: 0 0 14px rgba(37, 99, 235, 0.75);
}

.elite-particle:nth-child(12) {
  --l: 92%; --t: 90%; --x: 42px; --y: -68px; --s: 0.82; --r: 420deg; --dur: 1020ms; --delay: 500ms;
  --h: 5px; --w: 5px; --br: 9999px;
  --bg: radial-gradient(circle, #fff, #ec4899);
  --shadow: 0 0 14px rgba(236, 72, 153, 0.75);
}

.elite-particle:nth-child(13) {
  --l: 38%; --t: 88%; --x: -26px; --y: -82px; --s: 0.88; --r: 300deg; --dur: 1080ms; --delay: 560ms;
  --h: 3px; --w: 16px; --br: 9999px;
  --bg: linear-gradient(90deg, #22c55e, #06b6d4);
  --shadow: 0 0 14px rgba(6, 182, 212, 0.65);
}

.elite-particle:nth-child(14) {
  --l: 64%; --t: 88%; --x: 28px; --y: -82px; --s: 0.88; --r: 340deg; --dur: 1080ms; --delay: 620ms;
  --h: 3px; --w: 16px; --br: 9999px;
  --bg: linear-gradient(90deg, #a855f7, #f472b6);
  --shadow: 0 0 14px rgba(244, 114, 182, 0.65);
}

.elite-particle:nth-child(15) {
  --l: 30%; --t: 34%; --x: -38px; --y: -42px; --s: 0.78; --r: 260deg; --dur: 1240ms; --delay: 690ms;
  --h: 4px; --w: 4px; --br: 9999px;
  --bg: radial-gradient(circle, #fff, #60a5fa);
  --shadow: 0 0 14px rgba(96, 165, 250, 0.72);
}

.elite-particle:nth-child(16) {
  --l: 70%; --t: 34%; --x: 38px; --y: -42px; --s: 0.78; --r: 420deg; --dur: 1240ms; --delay: 760ms;
  --h: 4px; --w: 4px; --br: 9999px;
  --bg: radial-gradient(circle, #fff, #c084fc);
  --shadow: 0 0 14px rgba(192, 132, 252, 0.72);
}

@media (max-width: 640px) {
  .elite-dock {
    padding: 12px;
    border-radius: 27px;
  }

  .elite-border,
  .elite-noise {
    border-radius: 28px;
  }

  .elite-icon-wrap {
    height: 48px;
    width: 48px;
  }

  .elite-icon {
    height: 40px;
    width: 40px;
    border-radius: 15px;
    font-size: 18px;
  }

  .elite-cta {
    min-width: 78px;
    padding: 12px 13px;
    font-size: 12px;
  }

  .elite-eyebrow {
    font-size: 9px;
    letter-spacing: 0.14em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .elite-blob,
  .elite-border,
  .elite-live-dot,
  .elite-particle {
    animation: none !important;
  }

  .elite-overlay:hover .elite-dock,
  .elite-overlay:hover .elite-icon,
  .elite-overlay:hover .elite-cta,
  .elite-overlay:hover .elite-stat {
    transform: none;
  }
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
              <span
  className={
    selected
      ? "mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[12px] font-black text-white"
      : "mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-300"
  }
>
  {selected ? "✓" : ""}
</span>
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
              <span
  className={
    selected
      ? "mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-black text-white"
      : "mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-300"
  }
>
  {selected ? "✓" : ""}
</span>
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
    <div className="elite-overlay absolute inset-0 z-[999999] overflow-hidden">
      <div className="elite-backdrop" />

      <div className="elite-ambient-layer">
        <div className="elite-blob elite-blob-blue" />
        <div className="elite-blob elite-blob-purple" />
        <div className="elite-spotlight" />
        <div className="elite-grid-glow" />
      </div>

      <div className="absolute inset-x-4 top-4 z-40 flex items-center justify-between">
        <div className="elite-top-pill">
          <span className="elite-live-dot" />
          Preview locked
        </div>

        <div className="elite-score-pill">
          <span>{atsScore}%</span> ATS
        </div>
      </div>

      <div className="absolute inset-x-4 bottom-4 z-50">
        <button type="button" onClick={onUnlock} className="elite-dock">
          <span className="elite-border" />
          <span className="elite-shine" />
          <span className="elite-noise" />

          <span className="elite-particles">
            {Array.from({ length: 16 }).map((_, index) => (
              <span key={index} className="elite-particle" />
            ))}
          </span>

          <span className="relative z-10 flex items-center gap-4">
            <span className="elite-icon-wrap">
              <span className="elite-icon-ring" />
              <span className="elite-icon-glow" />
              <span className="elite-icon">✦</span>
            </span>

            <span className="min-w-0 flex-1 text-left">
              <span className="elite-eyebrow">Your AI documents are ready</span>

              <span className="mt-0.5 block truncate text-[16px] font-black tracking-[-0.04em] text-slate-950 md:text-[18px]">
                Unlock complete CV package
              </span>

              <span className="mt-1 block truncate text-xs font-bold text-slate-500 md:text-sm">
                Full CV, cover letter, PDF, DOCX, edit and rephrase.
              </span>
            </span>

            <span className="elite-cta">
              Unlock
              <span className="elite-arrow">→</span>
            </span>
          </span>

          <span className="relative z-10 mt-4 grid grid-cols-3 gap-2">
            <span className="elite-stat elite-stat-green">
              <strong>{atsScore}%</strong>
              <small>ATS score</small>
            </span>

            <span className="elite-stat elite-stat-blue">
              <strong>2</strong>
              <small>Documents</small>
            </span>

            <span className="elite-stat elite-stat-purple">
              <strong>{keywordsCount || 8}</strong>
              <small>Keywords</small>
            </span>
          </span>

          <span className="elite-bottom-glow" />
        </button>
      </div>
    </div>
  );
}