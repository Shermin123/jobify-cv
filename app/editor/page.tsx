"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import { checkProSubscription } from "@/lib/checkSubscription";

type EditorMode = "cv" | "cover";
type AiMode = "polish" | "shorten" | "ats" | "grammar";
type PanelTab = "assistant" | "insert" | "templates" | "review";

export default function EditorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const editorRef = useRef<HTMLDivElement | null>(null);

  const [checking, setChecking] = useState(true);
  const [isPro, setIsPro] = useState(false);

  const [title, setTitle] = useState("Edited CV");
  const [documentType, setDocumentType] = useState<EditorMode>("cv");

  const [htmlContent, setHtmlContent] = useState("");
  const [fontSize, setFontSize] = useState("15");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [zoom, setZoom] = useState(100);

  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [aiLoading, setAiLoading] = useState<AiMode | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [panelTab, setPanelTab] = useState<PanelTab>("assistant");

  const [aiCvModalOpen, setAiCvModalOpen] = useState(false);
  const [newCvName, setNewCvName] = useState("");
  const [newCvEmail, setNewCvEmail] = useState("");
  const [newCvPhone, setNewCvPhone] = useState("");
  const [newCvLocation, setNewCvLocation] = useState("");
  const [newCvTargetRole, setNewCvTargetRole] = useState("");
  const [newCvExperience, setNewCvExperience] = useState("");
  const [newCvEducation, setNewCvEducation] = useState("");
  const [newCvSkills, setNewCvSkills] = useState("");
  const [newCvProjects, setNewCvProjects] = useState("");
  const [newCvLoading, setNewCvLoading] = useState(false);
  const [newCvLoadingStep, setNewCvLoadingStep] = useState(0);

  useEffect(() => {
    if (!newCvLoading) {
      setNewCvLoadingStep(0);
      return;
    }

    const timer = setInterval(() => {
      setNewCvLoadingStep((prev) => (prev + 1) % 4);
    }, 900);

    return () => clearInterval(timer);
  }, [newCvLoading]);

  useEffect(() => {
    const checkAccess = async () => {
      if (status === "loading") return;

      if (!session?.user?.email) {
        alert("Please login first to use the Pro Document Editor.");
        router.push("/login");
        return;
      }

      const proAccess = await checkProSubscription(session.user.email);

      if (!proAccess) {
        alert(
          "The File Editor is a Pro feature. Please subscribe to the Pro plan to edit and export documents."
        );
        router.push("/pricing?upgrade=pro");
        return;
      }

      setIsPro(true);
      setChecking(false);
    };

    checkAccess();
  }, [session?.user?.email, status, router]);

  useEffect(() => {
  if (!isPro) return;

  const savedTitle = sessionStorage.getItem("jobify_editor_title");
  const savedContent = sessionStorage.getItem("jobify_editor_content");
  const savedType = sessionStorage.getItem("jobify_editor_type");
  const savedHtml = sessionStorage.getItem("jobify_editor_html");

  if (savedTitle) setTitle(savedTitle);
  setDocumentType(savedType === "cover" ? "cover" : "cv");

  const finalHtml = savedHtml || (savedContent ? convertTextToHtml(savedContent) : "");

  setHtmlContent(finalHtml);

  requestAnimationFrame(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = finalHtml;
    }
  });
}, [isPro]);

  useEffect(() => {
    if (!isPro) return;

    setSaveStatus("Saving...");

    const timer = setTimeout(() => {
      const html = editorRef.current?.innerHTML || htmlContent;
      const text = editorRef.current?.innerText || "";

      sessionStorage.setItem("jobify_editor_title", title);
      sessionStorage.setItem("jobify_editor_type", documentType);
      sessionStorage.setItem("jobify_editor_html", html);
      sessionStorage.setItem("jobify_editor_content", text);

      setSaveStatus("Saved");
    }, 450);

    return () => clearTimeout(timer);
  }, [title, documentType, htmlContent, isPro]);

  const plainText = () => editorRef.current?.innerText || "";

  const wordCount = useMemo(() => {
    return plainText().trim().split(/\s+/).filter(Boolean).length;
  }, [htmlContent]);

  const characterCount = plainText().length;
  const pageCount = Math.max(1, Math.ceil(wordCount / 430));

  const readability = useMemo(() => {
    if (wordCount === 0) return "Empty";
    if (wordCount < 180) return "Too short";
    if (wordCount <= 650) return "Good length";
    return "Long";
  }, [wordCount]);

  const checklist = useMemo(() => {
    const text = plainText().toLowerCase();

    return {
      hasEmail: /\S+@\S+\.\S+/.test(text),
      hasPhone: /(\+?\d[\d\s().-]{7,})/.test(text),
      hasLinkedIn: text.includes("linkedin"),
      hasSkills: text.includes("skills"),
      hasExperience: text.includes("experience"),
    };
  }, [htmlContent]);

  const checklistScore = useMemo(() => {
    const values = Object.values(checklist);
    const passed = values.filter(Boolean).length;
    return Math.round((passed / values.length) * 100);
  }, [checklist]);

  const updateContent = () => {
    setHtmlContent(editorRef.current?.innerHTML || "");
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const runCommand = (command: string, value?: string) => {
    focusEditor();
    document.execCommand(command, false, value);
    updateContent();
  };

  const applyBlock = (tag: "h1" | "h2" | "h3" | "p") => {
    focusEditor();
    document.execCommand("formatBlock", false, tag);
    updateContent();
  };

  const insertHtml = (html: string) => {
    focusEditor();
    document.execCommand("insertHTML", false, html);
    updateContent();
  };

  const applyColor = (color: string) => {
    runCommand("foreColor", color);
  };

  const applyHighlight = (color: string) => {
    runCommand("hiliteColor", color);
  };

  const insertContactHeader = () => {
    insertHtml(`
      <h1>Your Full Name</h1>
      <p>London, United Kingdom | your.email@example.com | +44 phone number | LinkedIn / Portfolio</p>
      <hr />
      <p><br /></p>
    `);
  };

  const addSection = (sectionTitle: string) => {
    insertHtml(`
      <h2>${sectionTitle}</h2>
      <p>Write your details here...</p>
    `);
  };

  const addAchievementBullet = () => {
    insertHtml(`
      <ul>
        <li>Improved [process/result] by [number/%] through [action/tool/skill].</li>
      </ul>
    `);
  };

  const addExperienceBlock = () => {
    insertHtml(`
      <h2>Work Experience</h2>
      <p><strong>Job Title | Company Name | Dates</strong></p>
      <ul>
        <li>Delivered high-quality work while managing daily responsibilities accurately.</li>
        <li>Improved efficiency by organising tasks, priorities, and communication effectively.</li>
        <li>Collaborated with team members to achieve goals and maintain service quality.</li>
      </ul>
    `);
  };

  const addTable = () => {
    insertHtml(`
      <table>
        <tbody>
          <tr>
            <td><strong>Area</strong></td>
            <td><strong>Details</strong></td>
          </tr>
          <tr>
            <td>Skill / Project</td>
            <td>Write details here</td>
          </tr>
        </tbody>
      </table>
      <p><br /></p>
    `);
  };

  const addLink = () => {
    const url = prompt("Enter link URL:");
    if (!url) return;

    const text = prompt("Enter link text:") || url;

    insertHtml(
      `<a href="${escapeHtml(url)}" target="_blank">${escapeHtml(text)}</a>`
    );
  };

  const addDivider = () => {
    insertHtml("<hr /><p><br /></p>");
  };

  const generateNewCvWithAI = async () => {
    if (!newCvName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!newCvTargetRole.trim()) {
      alert("Please enter your target job role.");
      return;
    }

    if (!newCvSkills.trim()) {
      alert("Please enter your main skills.");
      return;
    }

    setNewCvLoading(true);

    try {
      const prompt = `
Create a professional ATS-friendly CV from scratch using the details below.

Full name: ${newCvName}
Email: ${newCvEmail}
Phone: ${newCvPhone}
Location: ${newCvLocation}
Target role: ${newCvTargetRole}
Experience: ${newCvExperience}
Education: ${newCvEducation}
Skills: ${newCvSkills}
Projects / certifications: ${newCvProjects}

Requirements:
- Use strong ATS keywords for the target role
- Make important ATS keywords bold using **keyword**
- Make section headings clear and professional
- Include a professional summary
- Include key skills
- Include work experience or relevant experience
- Include education
- Include projects or certifications if provided
- Use clear CV sections
- Use achievement-focused bullet points
- Keep it professional and realistic
`;

      const res = await fetch("/api/rephrase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: prompt,
          type: "cv",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Could not generate CV.");
      }

      const generatedCv =
        data.rephrased ||
        data.optimizedCV ||
        data.cv ||
        "AI generated CV could not be created.";

      const html = convertTextToHtml(generatedCv);

      if (editorRef.current) {
        editorRef.current.innerHTML = html;
      }

      setTitle(`${newCvName} - ATS CV`);
      setDocumentType("cv");
      setHtmlContent(html);
      setPanelTab("review");
      setAiCvModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Could not generate CV.");
    } finally {
      setNewCvLoading(false);
    }
  };

  const addCvTemplate = () => {
    const template = `
      <h1>Your Full Name</h1>
      <p>London, United Kingdom | your.email@example.com | +44 phone number | LinkedIn / Portfolio</p>
      <hr />

      <h2>Professional Summary</h2>
      <p>Motivated and detail-focused professional with experience in communication, teamwork, problem-solving, technology, and customer-focused work. Skilled at adapting quickly, completing tasks accurately, and contributing to team goals.</p>

      <h2>Key Skills</h2>
      <ul>
        <li><strong>Communication</strong> and teamwork</li>
        <li><strong>Problem-solving</strong> and organisation</li>
        <li><strong>Customer service</strong> and stakeholder support</li>
        <li>Technical tools and digital systems</li>
      </ul>

      <h2>Work Experience</h2>
      <p><strong>Job Title | Company Name | Dates</strong></p>
      <ul>
        <li>Delivered high-quality support and completed daily responsibilities accurately.</li>
        <li>Improved efficiency by managing tasks, priorities, and communication effectively.</li>
        <li>Worked with team members to achieve targets and maintain service quality.</li>
      </ul>

      <h2>Education</h2>
      <p><strong>Degree / Course | Institution | Dates</strong></p>

      <h2>Projects</h2>
      <p><strong>Project Name</strong></p>
      <ul>
        <li>Describe what you built, improved, or achieved.</li>
      </ul>
    `;

    if (editorRef.current) editorRef.current.innerHTML = template;
    setTitle("Edited CV");
    setDocumentType("cv");
    updateContent();
  };

  const addCoverLetterTemplate = () => {
    const template = `
      <p>Your Name<br />
      Your Email | Phone Number<br />
      Date</p>

      <p>Hiring Manager<br />
      Company Name</p>

      <p>Dear Hiring Manager,</p>

      <p>I am writing to apply for the position at your organisation. With my experience, skills, and motivation to contribute, I believe I would be a strong fit for this role.</p>

      <p>In my previous experience, I developed strong communication, organisation, and problem-solving skills. I am confident that these strengths would help me perform well and support your team effectively.</p>

      <p>I would welcome the opportunity to discuss how my background matches the role. Thank you for your time and consideration.</p>

      <p>Kind regards,<br />
      Your Name</p>
    `;

    if (editorRef.current) editorRef.current.innerHTML = template;
    setTitle("Edited Cover Letter");
    setDocumentType("cover");
    updateContent();
  };

  const replaceAll = () => {
    if (!findText.trim()) {
      alert("Enter text to find.");
      return;
    }

    const html = editorRef.current?.innerHTML || "";
    const escaped = escapeRegExp(findText);
    const regex = new RegExp(escaped, "gi");
    const updated = html.replace(regex, replaceText);

    if (editorRef.current) editorRef.current.innerHTML = updated;
    updateContent();
  };

  const clearEditor = () => {
    if (!confirm("Clear the editor content?")) return;

    if (editorRef.current) editorRef.current.innerHTML = "";
    updateContent();
  };

  const copyAllText = async () => {
    const text = plainText();

    if (!text.trim()) {
      alert("Document is empty.");
      return;
    }

    await navigator.clipboard.writeText(text);
    alert("Document copied.");
  };

  const selectAllText = () => {
    focusEditor();

    const range = document.createRange();
    const selection = window.getSelection();

    if (!editorRef.current || !selection) return;

    range.selectNodeContents(editorRef.current);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const printDocument = () => {
    window.print();
  };

  const cleanFormatting = () => {
    runCommand("removeFormat");
  };

  const makeCompact = () => {
    const html = editorRef.current?.innerHTML || "";
    const cleaned = html
      .replace(/<p><br><\/p>/g, "")
      .replace(/<p><br><\/p>/g, "")
      .replace(/(<br>){3,}/g, "<br><br>");

    if (editorRef.current) editorRef.current.innerHTML = cleaned;
    updateContent();
  };

  const improveWithAI = async (mode: AiMode) => {
    const text = plainText();

    if (!text.trim()) {
      alert("Document is empty.");
      return;
    }

    setAiLoading(mode);

    try {
      const instruction =
        mode === "polish"
          ? "Make this document more professional, polished, clear, and recruiter-friendly. Keep important ATS keywords bold using **keyword**."
          : mode === "shorten"
          ? "Make this document shorter, cleaner, and easier to read while keeping the important meaning. Keep important ATS keywords bold using **keyword**."
          : mode === "grammar"
          ? "Fix grammar, spelling, punctuation, and sentence clarity while keeping the same meaning. Keep important ATS keywords bold using **keyword**."
          : "Improve this document for ATS readability, stronger keywords, clearer structure, and better CV or cover letter wording. Make important ATS keywords bold using **keyword**.";

      const res = await fetch("/api/rephrase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `${instruction}\n\n${text}`,
          type: documentType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "AI improvement failed.");
      }

      const html = convertTextToHtml(data.rephrased || text);

      if (editorRef.current) editorRef.current.innerHTML = html;
      updateContent();
    } catch (err: any) {
      alert(err.message || "Could not improve document.");
    } finally {
      setAiLoading(null);
    }
  };

  const downloadPDF = () => {
    if (!editorRef.current?.innerText.trim()) {
      alert("Document is empty.");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const margin = 16;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;

    let y = 18;

    const addNewPageIfNeeded = (extra = 8) => {
      if (y > pageHeight - extra) {
        doc.addPage();
        y = 18;
      }
    };

    const renderText = (
      text: string,
      options?: {
        fontSize?: number;
        bold?: boolean;
        color?: [number, number, number];
        gap?: number;
        indent?: number;
      }
    ) => {
      const fontSize = options?.fontSize || 11;
      const indent = options?.indent || 0;
      const gap = options?.gap ?? 6;
      const color = options?.color || [55, 65, 81];

      doc.setFont("helvetica", options?.bold ? "bold" : "normal");
      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);

      const lines = doc.splitTextToSize(text || " ", maxWidth - indent);

      lines.forEach((line: string) => {
        addNewPageIfNeeded();
        doc.text(line, margin + indent, y);
        y += gap;
      });
    };

    const renderTextRuns = (
      runs: { text: string; bold: boolean }[],
      options?: {
        fontSize?: number;
        color?: [number, number, number];
        indent?: number;
        gap?: number;
      }
    ) => {
      const fontSize = options?.fontSize || 11;
      const color = options?.color || [55, 65, 81];
      const indent = options?.indent || 0;
      const gap = options?.gap ?? 6;

      let x = margin + indent;

      runs.forEach((run) => {
        const words = run.text.split(/(\s+)/);

        words.forEach((word) => {
          if (!word) return;

          doc.setFont("helvetica", run.bold ? "bold" : "normal");
          doc.setFontSize(fontSize);
          doc.setTextColor(color[0], color[1], color[2]);

          const wordWidth = doc.getTextWidth(word);

          if (x + wordWidth > pageWidth - margin) {
            y += gap;
            x = margin + indent;
            addNewPageIfNeeded();
          }

          doc.text(word, x, y);
          x += wordWidth;
        });
      });

      y += gap;
    };

    const getRuns = (
      node: ChildNode,
      inheritedBold = false
    ): { text: string; bold: boolean }[] => {
      if (node.nodeType === Node.TEXT_NODE) {
        return [{ text: node.textContent || "", bold: inheritedBold }];
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return [];

      const el = node as HTMLElement;
      const isBold =
        inheritedBold ||
        el.tagName === "STRONG" ||
        el.tagName === "B" ||
        el.style.fontWeight === "bold" ||
        Number(el.style.fontWeight) >= 600;

      const runs: { text: string; bold: boolean }[] = [];

      el.childNodes.forEach((child) => {
        runs.push(...getRuns(child, isBold));
      });

      return runs;
    };

    const elements = Array.from(editorRef.current.children);

    elements.forEach((element) => {
      const el = element as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (tag === "h1") {
        renderText(el.innerText, {
          fontSize: 20,
          bold: true,
          color: [15, 23, 42],
          gap: 8,
        });
        y += 2;
        return;
      }

      if (tag === "h2") {
        y += 3;
        renderText(el.innerText.toUpperCase(), {
          fontSize: 13,
          bold: true,
          color: [15, 23, 42],
          gap: 6,
        });
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y - 3, pageWidth - margin, y - 3);
        y += 1;
        return;
      }

      if (tag === "h3") {
        renderText(el.innerText, {
          fontSize: 12,
          bold: true,
          color: [15, 23, 42],
          gap: 6,
        });
        return;
      }

      if (tag === "ul" || tag === "ol") {
        const items = Array.from(el.querySelectorAll("li"));

        items.forEach((li) => {
          renderTextRuns(
            [
              { text: "• ", bold: true },
              ...getRuns(li),
            ],
            {
              fontSize: 11,
              color: [55, 65, 81],
              indent: 4,
              gap: 6,
            }
          );
        });

        y += 2;
        return;
      }

      if (tag === "hr") {
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;
        return;
      }

      renderTextRuns(getRuns(el), {
        fontSize: 11,
        color: [55, 65, 81],
        gap: 6,
      });

      y += 1;
    });

    doc.save(
      documentType === "cv"
        ? "jobify-edited-cv.pdf"
        : "jobify-edited-cover-letter.pdf"
    );
  };

  const downloadDOCX = async () => {
    if (!editorRef.current?.innerText.trim()) {
      alert("Document is empty.");
      return;
    }

    const createTextRuns = (
      node: ChildNode,
      inheritedBold = false
    ): TextRun[] => {
      if (node.nodeType === Node.TEXT_NODE) {
        return [
          new TextRun({
            text: node.textContent || "",
            bold: inheritedBold,
            size: 22,
            color: inheritedBold ? "0F172A" : "374151",
          }),
        ];
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return [];

      const el = node as HTMLElement;
      const isBold =
        inheritedBold ||
        el.tagName === "STRONG" ||
        el.tagName === "B" ||
        el.style.fontWeight === "bold" ||
        Number(el.style.fontWeight) >= 600;

      const runs: TextRun[] = [];

      el.childNodes.forEach((child) => {
        runs.push(...createTextRuns(child, isBold));
      });

      return runs;
    };

    const paragraphs: Paragraph[] = [];
    const elements = Array.from(editorRef.current.children);

    elements.forEach((element) => {
      const el = element as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (tag === "h1") {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: el.innerText,
                bold: true,
                size: 36,
                color: "0F172A",
              }),
            ],
            spacing: { after: 240 },
          })
        );
        return;
      }

      if (tag === "h2") {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: el.innerText.toUpperCase(),
                bold: true,
                size: 26,
                color: "0F172A",
              }),
            ],
            spacing: { before: 220, after: 140 },
            border: {
              bottom: {
                color: "E2E8F0",
                space: 1,
                style: "single",
                size: 6,
              },
            },
          })
        );
        return;
      }

      if (tag === "h3") {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: el.innerText,
                bold: true,
                size: 24,
                color: "0F172A",
              }),
            ],
            spacing: { before: 160, after: 120 },
          })
        );
        return;
      }

      if (tag === "ul" || tag === "ol") {
        const items = Array.from(el.querySelectorAll("li"));

        items.forEach((li) => {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "• ",
                  bold: true,
                  size: 22,
                  color: "374151",
                }),
                ...createTextRuns(li),
              ],
              spacing: { after: 100 },
              indent: { left: 360 },
            })
          );
        });

        return;
      }

      if (tag === "hr") {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: "" })],
            border: {
              bottom: {
                color: "E2E8F0",
                space: 1,
                style: "single",
                size: 6,
              },
            },
            spacing: { after: 180 },
          })
        );
        return;
      }

      paragraphs.push(
        new Paragraph({
          children: createTextRuns(el),
          spacing: { after: 130 },
        })
      );
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);

    saveAs(
      blob,
      documentType === "cv"
        ? "jobify-edited-cv.docx"
        : "jobify-edited-cover-letter.docx"
    );
  };

  if (status === "loading" || checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500">
        Checking Pro access...
      </main>
    );
  }

  if (!isPro) return null;

  return (
    <main className="min-h-screen bg-[#e7ebf1] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white print:hidden">
        <div className="flex min-h-14 flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-sm">
              J
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                Jobify Word Studio
              </p>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-[220px] bg-transparent text-sm font-black text-slate-950 outline-none sm:w-[420px]"
                placeholder="Document title"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
              {saveStatus}
            </span>

            <button onClick={() => router.push("/upload")} className="top-btn">
              Back
            </button>

            <button onClick={copyAllText} className="top-btn">
              Copy
            </button>

            <button onClick={printDocument} className="top-btn">
              Print
            </button>

            <button onClick={downloadPDF} className="top-btn-primary">
              Export PDF
            </button>

            <button onClick={downloadDOCX} className="top-btn-dark">
              Export DOCX
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-[#f8fafc] px-4 py-2">
          <div className="flex flex-wrap items-stretch gap-2">
            <RibbonGroup title="File">
              <button onClick={() => runCommand("undo")} className="tool-btn">
                Undo
              </button>
              <button onClick={() => runCommand("redo")} className="tool-btn">
                Redo
              </button>
              <button onClick={selectAllText} className="tool-btn">
                Select
              </button>
            </RibbonGroup>

            <RibbonGroup title="Font">
              <button
                onClick={() => runCommand("bold")}
                className="tool-btn font-black"
              >
                B
              </button>
              <button
                onClick={() => runCommand("italic")}
                className="tool-btn italic"
              >
                I
              </button>
              <button
                onClick={() => runCommand("underline")}
                className="tool-btn underline"
              >
                U
              </button>

              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="select-btn"
              >
                <option value="Arial">Arial</option>
                <option value="Calibri">Calibri</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times</option>
              </select>

              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="select-btn"
              >
                <option value="13">Small</option>
                <option value="15">Normal</option>
                <option value="17">Large</option>
                <option value="19">Huge</option>
              </select>
            </RibbonGroup>

            <RibbonGroup title="Style">
              <button onClick={() => applyBlock("h1")} className="tool-btn">
                Title
              </button>
              <button onClick={() => applyBlock("h2")} className="tool-btn">
                Heading
              </button>
              <button onClick={() => applyBlock("p")} className="tool-btn">
                Body
              </button>
              <button onClick={cleanFormatting} className="tool-btn">
                Clear
              </button>
            </RibbonGroup>

            <RibbonGroup title="Colour">
              <button
                onClick={() => applyColor("#0f172a")}
                className="tool-btn"
              >
                Black
              </button>
              <button
                onClick={() => applyColor("#2563eb")}
                className="tool-btn text-blue-600"
              >
                Blue
              </button>
              <button
                onClick={() => applyColor("#16a34a")}
                className="tool-btn text-green-600"
              >
                Green
              </button>
              <button
                onClick={() => applyHighlight("#fef08a")}
                className="tool-btn"
              >
                Highlight
              </button>
            </RibbonGroup>

            <RibbonGroup title="Paragraph">
              <button
                onClick={() => runCommand("insertUnorderedList")}
                className="tool-btn"
              >
                Bullets
              </button>
              <button
                onClick={() => runCommand("insertOrderedList")}
                className="tool-btn"
              >
                Numbers
              </button>
              <button
                onClick={() => runCommand("justifyLeft")}
                className="tool-btn"
              >
                Left
              </button>
              <button
                onClick={() => runCommand("justifyCenter")}
                className="tool-btn"
              >
                Center
              </button>
              <button
                onClick={() => runCommand("justifyRight")}
                className="tool-btn"
              >
                Right
              </button>
            </RibbonGroup>

            <RibbonGroup title="Insert">
              <button onClick={addLink} className="tool-btn">
                Link
              </button>
              <button onClick={addTable} className="tool-btn">
                Table
              </button>
              <button onClick={addDivider} className="tool-btn">
                Divider
              </button>
            </RibbonGroup>

            <RibbonGroup title="AI">
              <button
                onClick={() => setAiCvModalOpen(true)}
                className="tool-btn-ai"
              >
                Create CV
              </button>

              <button
                onClick={() => improveWithAI("polish")}
                disabled={!!aiLoading}
                className="tool-btn-ai"
              >
                {aiLoading === "polish" ? "Polishing..." : "Polish"}
              </button>

              <button
                onClick={() => improveWithAI("grammar")}
                disabled={!!aiLoading}
                className="tool-btn-ai"
              >
                {aiLoading === "grammar" ? "Fixing..." : "Grammar"}
              </button>

              <button
                onClick={() => improveWithAI("ats")}
                disabled={!!aiLoading}
                className="tool-btn-ai"
              >
                {aiLoading === "ats" ? "Improving..." : "ATS"}
              </button>
            </RibbonGroup>

            <RibbonGroup title="View">
              <select
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="select-btn"
              >
                <option value={80}>80%</option>
                <option value={90}>90%</option>
                <option value={100}>100%</option>
                <option value={110}>110%</option>
                <option value={125}>125%</option>
              </select>

              <button
                onClick={() => setFocusMode(!focusMode)}
                className="tool-btn"
              >
                {focusMode ? "Tools" : "Focus"}
              </button>
            </RibbonGroup>
          </div>
        </div>
      </header>

      <section className="px-3 py-6 md:px-8 md:py-8 print:p-0">
        <div className="mx-auto grid w-full max-w-[1500px] gap-6 xl:grid-cols-[1fr_340px]">
          <div>
            <div className="mb-4 flex items-center justify-between print:hidden">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Editable A4 document
                </p>
                <p className="text-sm font-semibold text-slate-500">
                  Edit your CV like Microsoft Word. Bold keywords and layout are
                  kept in PDF/DOCX export.
                </p>
              </div>

              <div className="hidden rounded-2xl bg-white px-4 py-2 text-xs font-black text-slate-500 shadow-sm ring-1 ring-slate-200 md:block">
                {wordCount} words • {pageCount} page
                {pageCount > 1 ? "s" : ""} • {readability}
              </div>
            </div>

            <div className="rounded-[2rem] bg-slate-300/40 p-4 shadow-inner">
              <div
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "top center",
                }}
                className={`mx-auto min-h-[1550px] w-full bg-white shadow-[0_30px_100px_rgba(15,23,42,0.22)] ring-1 ring-slate-300 print:min-h-screen print:shadow-none print:ring-0 ${
                  focusMode ? "max-w-[1000px]" : "max-w-[920px]"
                }`}
              >
                <div className="h-7 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 print:hidden" />

                <div
  ref={editorRef}
  contentEditable
  suppressContentEditableWarning
  onInput={updateContent}
  onBlur={updateContent}
  style={{
    fontSize: `${fontSize}px`,
    fontFamily,
  }}
  className="editor-page min-h-[1550px] w-full px-6 py-8 text-slate-900 outline-none sm:px-10 md:px-16 md:py-14 print:min-h-screen print:p-8"
  data-placeholder="Paste your full CV or cover letter here..."
  dangerouslySetInnerHTML={{ __html: htmlContent }}
/>
              </div>
            </div>
          </div>

          {!focusMode && (
            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-4 shadow-xl print:hidden xl:sticky xl:top-[170px]">
              <div className="mb-4 grid grid-cols-4 gap-1 rounded-2xl bg-slate-100 p-1">
                {(["assistant", "insert", "templates", "review"] as PanelTab[]).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setPanelTab(tab)}
                      className={`rounded-xl px-2 py-2 text-[10px] font-black capitalize ${
                        panelTab === tab
                          ? "bg-white text-blue-700 shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>

              {panelTab === "assistant" && (
                <div className="space-y-5">
                  <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-lg">
                    <p className="text-xs font-black uppercase tracking-widest text-white/70">
                      Smart Assistant
                    </p>
                    <h2 className="mt-2 text-xl font-black">
                      Make your CV stronger
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-white/70">
                      Create, polish, improve ATS keywords, and keep bold
                      formatting in exports.
                    </p>

                    <button
                      onClick={() => setAiCvModalOpen(true)}
                      className="mt-4 w-full rounded-2xl bg-white py-3 text-sm font-black text-blue-700 shadow-sm transition hover:bg-blue-50"
                    >
                      ✨ Create CV with AI
                    </button>
                  </div>

                  <div>
                    <p className="panel-title">AI actions</p>

                    <div className="mt-3 grid gap-2">
                      <button
                        onClick={() => improveWithAI("polish")}
                        className="side-btn"
                      >
                        AI polish document
                      </button>
                      <button
                        onClick={() => improveWithAI("grammar")}
                        className="side-btn"
                      >
                        Fix grammar
                      </button>
                      <button
                        onClick={() => improveWithAI("ats")}
                        className="side-btn"
                      >
                        Improve ATS keywords
                      </button>
                      <button
                        onClick={() => improveWithAI("shorten")}
                        className="side-btn"
                      >
                        Shorten document
                      </button>
                      <button onClick={makeCompact} className="side-btn">
                        Make layout compact
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-sm font-black text-blue-700">
                      Smart status
                    </p>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs font-black text-blue-700">
                        <span>Checklist score</span>
                        <span>{checklistScore}%</span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${checklistScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-xs font-semibold text-blue-700/80">
                      <p>Length: {readability}</p>
                      <p>Words: {wordCount}</p>
                      <p>Pages: {pageCount}</p>
                      <p>Autosave: {saveStatus}</p>
                    </div>
                  </div>
                </div>
              )}

              {panelTab === "insert" && (
                <div className="space-y-5">
                  <div>
                    <p className="panel-title">Insert blocks</p>

                    <div className="mt-3 grid gap-2">
                      <button
                        onClick={insertContactHeader}
                        className="side-btn"
                      >
                        Contact header
                      </button>

                      <button
                        onClick={() => addSection("Professional Summary")}
                        className="side-btn"
                      >
                        Summary section
                      </button>

                      <button
                        onClick={() => addSection("Key Skills")}
                        className="side-btn"
                      >
                        Skills section
                      </button>

                      <button
                        onClick={addExperienceBlock}
                        className="side-btn"
                      >
                        Experience block
                      </button>

                      <button
                        onClick={() => addSection("Education")}
                        className="side-btn"
                      >
                        Education section
                      </button>

                      <button
                        onClick={addAchievementBullet}
                        className="side-btn"
                      >
                        Achievement bullet
                      </button>

                      <button onClick={addTable} className="side-btn">
                        Table
                      </button>

                      <button onClick={addDivider} className="side-btn">
                        Divider
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {panelTab === "templates" && (
                <div className="space-y-5">
                  <div>
                    <p className="panel-title">Templates</p>

                    <div className="mt-3 grid gap-2">
                      <button onClick={addCvTemplate} className="side-btn">
                        Full CV template
                      </button>

                      <button
                        onClick={addCoverLetterTemplate}
                        className="side-btn"
                      >
                        Cover letter template
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="panel-title">Find & replace</p>

                    <input
                      value={findText}
                      onChange={(e) => setFindText(e.target.value)}
                      className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Find text"
                    />

                    <input
                      value={replaceText}
                      onChange={(e) => setReplaceText(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Replace with"
                    />

                    <button
                      onClick={replaceAll}
                      className="mt-2 w-full rounded-xl bg-slate-950 py-3 text-sm font-black text-white hover:bg-slate-800"
                    >
                      Replace all
                    </button>
                  </div>
                </div>
              )}

              {panelTab === "review" && (
                <div className="space-y-5">
                  <div>
                    <p className="panel-title">Document checklist</p>

                    <div className="mt-3 space-y-2 text-sm font-bold">
                      <CheckItem done={checklist.hasEmail} label="Email added" />
                      <CheckItem done={checklist.hasPhone} label="Phone added" />
                      <CheckItem
                        done={checklist.hasLinkedIn}
                        label="LinkedIn added"
                      />
                      <CheckItem
                        done={checklist.hasSkills}
                        label="Skills section"
                      />
                      <CheckItem
                        done={checklist.hasExperience}
                        label="Experience section"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="panel-title">Document stats</p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-white p-3 text-center">
                        <p className="text-xs font-bold text-slate-400">
                          Words
                        </p>
                        <p className="text-xl font-black">{wordCount}</p>
                      </div>

                      <div className="rounded-xl bg-white p-3 text-center">
                        <p className="text-xs font-bold text-slate-400">
                          Chars
                        </p>
                        <p className="text-xl font-black">{characterCount}</p>
                      </div>
                    </div>
                  </div>

                  <button onClick={selectAllText} className="side-btn">
                    Select all text
                  </button>

                  <button onClick={clearEditor} className="side-btn text-red-600">
                    Clear page
                  </button>
                </div>
              )}
            </aside>
          )}
        </div>
      </section>

      {aiCvModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm print:hidden">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 p-5 backdrop-blur">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                  AI CV Generator
                </p>
                <h2 className="text-2xl font-black text-slate-950">
                  Create ATS CV from scratch
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Important keywords will be bold and kept in PDF/DOCX exports.
                </p>
              </div>

              <button
                onClick={() => setAiCvModalOpen(false)}
                disabled={newCvLoading}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              <SmartInput
                label="Full name"
                value={newCvName}
                onChange={setNewCvName}
                placeholder="Mohammed Shermin"
              />

              <SmartInput
                label="Target job role"
                value={newCvTargetRole}
                onChange={setNewCvTargetRole}
                placeholder="AI Engineer / Data Analyst / Retail Assistant"
              />

              <SmartInput
                label="Email"
                value={newCvEmail}
                onChange={setNewCvEmail}
                placeholder="your@email.com"
              />

              <SmartInput
                label="Phone"
                value={newCvPhone}
                onChange={setNewCvPhone}
                placeholder="+44..."
              />

              <SmartInput
                label="Location"
                value={newCvLocation}
                onChange={setNewCvLocation}
                placeholder="London, United Kingdom"
              />

              <SmartTextarea
                label="Skills"
                value={newCvSkills}
                onChange={setNewCvSkills}
                placeholder="Python, React, Flutter, communication, teamwork..."
              />

              <SmartTextarea
                label="Experience"
                value={newCvExperience}
                onChange={setNewCvExperience}
                placeholder="Jobs, internships, part-time work, freelance work..."
              />

              <SmartTextarea
                label="Education"
                value={newCvEducation}
                onChange={setNewCvEducation}
                placeholder="MSc, BSc, college, university, certifications..."
              />

              <div className="md:col-span-2">
                <SmartTextarea
                  label="Projects / certificates / achievements"
                  value={newCvProjects}
                  onChange={setNewCvProjects}
                  placeholder="Projects, certificates, hackathons, achievements..."
                  tall
                />
              </div>
            </div>

            {newCvLoading && (
              <div className="mx-5 mb-5 rounded-3xl border border-blue-100 bg-blue-50 p-5 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-3xl text-white shadow-md animate-cvFloat">
                  🤖
                </div>

                <p className="mt-3 text-sm font-black text-slate-900">
                  {
                    [
                      "Reading your answers...",
                      "Writing ATS summary...",
                      "Adding bold keywords...",
                      "Building your CV layout...",
                    ][newCvLoadingStep]
                  }
                </p>

                <div className="mx-auto mt-4 h-2 max-w-md overflow-hidden rounded-full bg-blue-100">
                  <div className="h-full w-1/2 rounded-full bg-blue-600 animate-cvBar" />
                </div>
              </div>
            )}

            <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-100 bg-white/95 p-5 backdrop-blur sm:flex-row sm:justify-end">
              <button
                onClick={() => setAiCvModalOpen(false)}
                disabled={newCvLoading}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={generateNewCvWithAI}
                disabled={newCvLoading}
                className="relative overflow-hidden rounded-2xl bg-blue-600 px-8 py-3 text-sm font-black text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {newCvLoading && (
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-cvShimmer" />
                )}

                <span className="relative z-10">
                  {newCvLoading ? "Creating your CV..." : "Create AI CV"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .top-btn {
          border: 1px solid rgb(226 232 240);
          background: white;
          border-radius: 0.75rem;
          padding: 0.55rem 0.8rem;
          font-size: 0.75rem;
          font-weight: 900;
          color: rgb(51 65 85);
        }

        .top-btn:hover {
          background: rgb(248 250 252);
        }

        .top-btn-primary {
          border-radius: 0.75rem;
          background: rgb(37 99 235);
          padding: 0.55rem 0.9rem;
          font-size: 0.75rem;
          font-weight: 900;
          color: white;
        }

        .top-btn-primary:hover {
          background: rgb(29 78 216);
        }

        .top-btn-dark {
          border-radius: 0.75rem;
          background: rgb(15 23 42);
          padding: 0.55rem 0.9rem;
          font-size: 0.75rem;
          font-weight: 900;
          color: white;
        }

        .tool-btn {
          border: 1px solid rgb(226 232 240);
          background: white;
          border-radius: 0.6rem;
          padding: 0.45rem 0.7rem;
          font-size: 0.75rem;
          font-weight: 900;
          color: rgb(51 65 85);
          transition: 0.15s ease;
          white-space: nowrap;
        }

        .tool-btn:hover {
          background: rgb(241 245 249);
        }

        .tool-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tool-btn-ai {
          border: 1px solid rgb(191 219 254);
          background: rgb(239 246 255);
          border-radius: 0.6rem;
          padding: 0.45rem 0.7rem;
          font-size: 0.75rem;
          font-weight: 900;
          color: rgb(29 78 216);
          transition: 0.15s ease;
          white-space: nowrap;
        }

        .tool-btn-ai:hover {
          background: rgb(219 234 254);
        }

        .tool-btn-ai:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .select-btn {
          border: 1px solid rgb(226 232 240);
          background: white;
          border-radius: 0.6rem;
          padding: 0.45rem 0.65rem;
          font-size: 0.75rem;
          font-weight: 900;
          color: rgb(51 65 85);
          outline: none;
        }

        .side-btn {
          width: 100%;
          border: 1px solid rgb(226 232 240);
          background: white;
          border-radius: 0.9rem;
          padding: 0.85rem;
          text-align: left;
          font-size: 0.85rem;
          font-weight: 900;
          color: rgb(51 65 85);
          transition: 0.15s ease;
        }

        .side-btn:hover {
          background: rgb(248 250 252);
          border-color: rgb(191 219 254);
        }

        .panel-title {
          font-size: 0.72rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgb(148 163 184);
        }

        .editor-page {
          line-height: 1.75;
        }

        .editor-page:empty::before {
          content: attr(data-placeholder);
          color: rgb(148 163 184);
        }

        .editor-page :global(h1) {
          font-size: 2rem;
          line-height: 1.2;
          font-weight: 900;
          color: rgb(15 23 42);
          margin-bottom: 0.75rem;
        }

        .editor-page :global(h2) {
          font-size: 1.2rem;
          line-height: 1.4;
          font-weight: 900;
          color: rgb(15 23 42);
          margin-top: 1.4rem;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid rgb(226 232 240);
          padding-bottom: 0.25rem;
        }

        .editor-page :global(h3) {
          font-size: 1rem;
          font-weight: 900;
          color: rgb(15 23 42);
          margin-top: 1rem;
        }

        .editor-page :global(p) {
          margin-bottom: 0.65rem;
        }

        .editor-page :global(ul),
        .editor-page :global(ol) {
          margin-left: 1.25rem;
          margin-bottom: 0.75rem;
        }

        .editor-page :global(li) {
          margin-bottom: 0.35rem;
        }

        .editor-page :global(hr) {
          border: none;
          border-top: 1px solid rgb(226 232 240);
          margin: 1rem 0;
        }

        .editor-page :global(a) {
          color: rgb(37 99 235);
          text-decoration: underline;
        }

        .editor-page :global(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }

        .editor-page :global(td) {
          border: 1px solid rgb(226 232 240);
          padding: 0.5rem;
        }

        @keyframes cvShimmer {
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes cvFloat {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-6px) rotate(3deg);
          }
        }

        @keyframes cvBar {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(220%);
          }
        }

        .animate-cvShimmer {
          animation: cvShimmer 1.4s infinite;
        }

        .animate-cvFloat {
          animation: cvFloat 1.3s ease-in-out infinite;
        }

        .animate-cvBar {
          animation: cvBar 1.2s ease-in-out infinite;
        }

        @media print {
          body {
            background: white;
          }
        }
      `}</style>
    </main>
  );
}

function RibbonGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex flex-wrap gap-1">{children}</div>
      <p className="mt-1 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
        {title}
      </p>
    </div>
  );
}

function SmartInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
        placeholder={placeholder}
      />
    </label>
  );
}

function SmartTextarea({
  label,
  value,
  onChange,
  placeholder,
  tall = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  tall?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 ${
          tall ? "h-32" : "h-24"
        }`}
        placeholder={placeholder}
      />
    </label>
  );
}

function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
        done
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      <span>{label}</span>
      <span>{done ? "✓" : "—"}</span>
    </div>
  );
}

function convertTextToHtml(text: string) {
  return text
    .split("\n")
    .map((line) => {
      const clean = line.trim();

      if (!clean) return "<p><br /></p>";

      const looksLikeHeading =
        clean.length < 45 &&
        clean === clean.toUpperCase() &&
        /[A-Z]/.test(clean);

      const formatted = escapeHtml(clean)
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(
          /\b(ATS|Python|React|Next\.js|JavaScript|TypeScript|SQL|Machine Learning|AI|Data Analysis|Flutter|Firebase|Docker|Communication|Teamwork|Customer Service|Leadership|Problem Solving|Project Management|Microsoft Excel|Power BI|Tableau|Data Science|Cloud|AWS|Azure|Google Cloud|Node\.js|Express|MongoDB|PostgreSQL|Supabase|Stripe|API|REST|Git|GitHub)\b/gi,
          "<strong>$1</strong>"
        );

      if (looksLikeHeading) {
        return `<h2>${formatted}</h2>`;
      }

      if (clean.startsWith("•") || clean.startsWith("-")) {
        return `<ul><li>${formatted.replace(/^[-•]\s*/, "")}</li></ul>`;
      }

      return `<p>${formatted}</p>`;
    })
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}