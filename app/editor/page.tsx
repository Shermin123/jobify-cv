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
type PanelTab = "smart" | "insert" | "templates" | "review";

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
  const [panelTab, setPanelTab] = useState<PanelTab>("smart");

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
    const savedTitle = sessionStorage.getItem("jobify_editor_title");
    const savedContent = sessionStorage.getItem("jobify_editor_content");
    const savedType = sessionStorage.getItem("jobify_editor_type");
    const savedHtml = sessionStorage.getItem("jobify_editor_html");

    if (savedTitle) setTitle(savedTitle);
    if (savedType === "cover") setDocumentType("cover");

    if (savedHtml) {
      setHtmlContent(savedHtml);
      setTimeout(() => {
        if (editorRef.current) editorRef.current.innerHTML = savedHtml;
      }, 50);
      return;
    }

    if (savedContent) {
      const html = convertTextToHtml(savedContent);
      setHtmlContent(html);
      setTimeout(() => {
        if (editorRef.current) editorRef.current.innerHTML = html;
      }, 50);
    }
  }, []);

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
    return htmlContent
      ? plainText().trim().split(/\s+/).filter(Boolean).length
      : 0;
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

    insertHtml(`<a href="${escapeHtml(url)}" target="_blank">${escapeHtml(text)}</a>`);
  };

  const addDivider = () => {
    insertHtml("<hr /><p><br /></p>");
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
        <li>Communication and teamwork</li>
        <li>Problem-solving and organisation</li>
        <li>Customer service and stakeholder support</li>
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
          ? "Make this document more professional, polished, clear, and recruiter-friendly."
          : mode === "shorten"
          ? "Make this document shorter, cleaner, and easier to read while keeping the important meaning."
          : mode === "grammar"
          ? "Fix grammar, spelling, punctuation, and sentence clarity while keeping the same meaning."
          : "Improve this document for ATS readability, stronger keywords, clearer structure, and better CV or cover letter wording.";

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
    const text = plainText();

    if (!text.trim()) {
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

    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(title || "Edited Document", margin, y);

    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(55, 65, 81);

    text.split("\n").forEach((paragraph) => {
      const lines = doc.splitTextToSize(paragraph || " ", maxWidth);

      lines.forEach((line: string) => {
        if (y > pageHeight - 18) {
          doc.addPage();
          y = 20;
        }

        doc.text(line, margin, y);
        y += 6;
      });

      y += 2;
    });

    doc.save(
      documentType === "cv"
        ? "jobify-edited-cv.pdf"
        : "jobify-edited-cover-letter.pdf"
    );
  };

  const downloadDOCX = async () => {
    const text = plainText();

    if (!text.trim()) {
      alert("Document is empty.");
      return;
    }

    const paragraphs = text.split("\n").map((line) => {
      const clean = line.trim();

      const isHeading =
        clean.length > 0 &&
        clean.length < 45 &&
        clean === clean.toUpperCase() &&
        /[A-Z]/.test(clean);

      return new Paragraph({
        children: [
          new TextRun({
            text: line || " ",
            size: isHeading ? 25 : 22,
            bold: isHeading,
            color: isHeading ? "0F172A" : "374151",
          }),
        ],
        spacing: {
          after: isHeading ? 220 : 120,
        },
      });
    });

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: title || "Edited Document",
                  bold: true,
                  size: 36,
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
    <main className="min-h-screen bg-[#eef1f5] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white print:hidden">
        <div className="flex min-h-14 flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
              J
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                Pro Document Editor
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
              PDF
            </button>

            <button onClick={downloadDOCX} className="top-btn-dark">
              DOCX
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 border-t border-slate-100 bg-slate-50 px-4 py-2">
          <button onClick={() => runCommand("undo")} className="tool-btn">
            Undo
          </button>

          <button onClick={() => runCommand("redo")} className="tool-btn">
            Redo
          </button>

          <div className="tool-divider" />

          <button onClick={() => runCommand("bold")} className="tool-btn font-black">
            B
          </button>

          <button onClick={() => runCommand("italic")} className="tool-btn italic">
            I
          </button>

          <button onClick={() => runCommand("underline")} className="tool-btn underline">
            U
          </button>

          <button onClick={cleanFormatting} className="tool-btn">
            Clear format
          </button>

          <div className="tool-divider" />

          <button onClick={() => applyBlock("h1")} className="tool-btn">
            H1
          </button>

          <button onClick={() => applyBlock("h2")} className="tool-btn">
            H2
          </button>

          <button onClick={() => applyBlock("h3")} className="tool-btn">
            H3
          </button>

          <button onClick={() => applyBlock("p")} className="tool-btn">
            Body
          </button>

          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold outline-none"
          >
            <option value="13">Small</option>
            <option value="15">Normal</option>
            <option value="17">Large</option>
            <option value="19">Huge</option>
          </select>

          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold outline-none"
          >
            <option value="Arial">Arial</option>
            <option value="Calibri">Calibri</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times</option>
          </select>

          <select
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold outline-none"
          >
            <option value={80}>80%</option>
            <option value={90}>90%</option>
            <option value={100}>100%</option>
            <option value={110}>110%</option>
            <option value={125}>125%</option>
          </select>

          <div className="tool-divider" />

          <button onClick={() => applyColor("#0f172a")} className="tool-btn">
            Black
          </button>

          <button onClick={() => applyColor("#2563eb")} className="tool-btn text-blue-600">
            Blue
          </button>

          <button onClick={() => applyColor("#16a34a")} className="tool-btn text-green-600">
            Green
          </button>

          <button onClick={() => applyHighlight("#fef08a")} className="tool-btn">
            Highlight
          </button>

          <div className="tool-divider" />

          <button onClick={() => runCommand("insertUnorderedList")} className="tool-btn">
            Bullets
          </button>

          <button onClick={() => runCommand("insertOrderedList")} className="tool-btn">
            Numbers
          </button>

          <button onClick={() => runCommand("justifyLeft")} className="tool-btn">
            Left
          </button>

          <button onClick={() => runCommand("justifyCenter")} className="tool-btn">
            Center
          </button>

          <button onClick={() => runCommand("justifyRight")} className="tool-btn">
            Right
          </button>

          <div className="tool-divider" />

          <button onClick={addLink} className="tool-btn">
            Link
          </button>

          <button onClick={addTable} className="tool-btn">
            Table
          </button>

          <button onClick={addDivider} className="tool-btn">
            Divider
          </button>

          <div className="tool-divider" />

          <button
            onClick={() => improveWithAI("polish")}
            disabled={!!aiLoading}
            className="tool-btn text-blue-700"
          >
            {aiLoading === "polish" ? "Polishing..." : "AI Polish"}
          </button>

          <button
            onClick={() => improveWithAI("grammar")}
            disabled={!!aiLoading}
            className="tool-btn text-emerald-700"
          >
            {aiLoading === "grammar" ? "Fixing..." : "Grammar"}
          </button>

          <button
            onClick={() => improveWithAI("ats")}
            disabled={!!aiLoading}
            className="tool-btn text-purple-700"
          >
            {aiLoading === "ats" ? "Improving..." : "ATS"}
          </button>

          <button
            onClick={() => improveWithAI("shorten")}
            disabled={!!aiLoading}
            className="tool-btn"
          >
            {aiLoading === "shorten" ? "Shortening..." : "Shorten"}
          </button>

          <div className="ml-auto hidden text-xs font-bold text-slate-500 xl:block">
            {saveStatus} • {wordCount} words • {pageCount} page
            {pageCount > 1 ? "s" : ""}
          </div>
        </div>
      </header>

      <section className="px-3 py-6 md:px-8 md:py-10 print:p-0">
        <div className="mx-auto grid w-full max-w-7xl gap-6 xl:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-4 flex items-center justify-between print:hidden">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Editable document page
                </p>
                <p className="text-sm text-slate-500">
                  Paste your full CV or cover letter here and edit it like Word.
                </p>
              </div>

              <button
                onClick={() => setFocusMode(!focusMode)}
                className="rounded-full bg-white px-4 py-2 text-xs font-black text-slate-600 shadow-sm ring-1 ring-slate-200"
              >
                {focusMode ? "Show tools" : "Focus mode"}
              </button>
            </div>

            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
              className={`mx-auto min-h-[1550px] w-full bg-white shadow-[0_25px_80px_rgba(15,23,42,0.18)] ring-1 ring-slate-200 print:min-h-screen print:shadow-none print:ring-0 ${
                focusMode ? "max-w-[1000px]" : "max-w-[920px]"
              }`}
            >
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
              />
            </div>
          </div>

          {!focusMode && (
            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-4 shadow-xl print:hidden xl:sticky xl:top-[125px]">
              <div className="mb-4 grid grid-cols-4 gap-1 rounded-2xl bg-slate-100 p-1">
                {(["smart", "insert", "templates", "review"] as PanelTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPanelTab(tab)}
                    className={`rounded-xl px-2 py-2 text-[11px] font-black capitalize ${
                      panelTab === tab
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {panelTab === "smart" && (
                <div className="space-y-5">
                  <div>
                    <p className="panel-title">AI tools</p>

                    <div className="mt-3 grid gap-2">
                      <button onClick={() => improveWithAI("polish")} className="side-btn">
                        AI polish document
                      </button>
                      <button onClick={() => improveWithAI("grammar")} className="side-btn">
                        Fix grammar
                      </button>
                      <button onClick={() => improveWithAI("ats")} className="side-btn">
                        Improve ATS keywords
                      </button>
                      <button onClick={() => improveWithAI("shorten")} className="side-btn">
                        Shorten document
                      </button>
                      <button onClick={makeCompact} className="side-btn">
                        Make layout compact
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-sm font-black text-blue-700">Smart status</p>
                    <div className="mt-3 space-y-2 text-xs font-semibold text-blue-700/80">
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
                      <button onClick={insertContactHeader} className="side-btn">
                        Contact header
                      </button>

                      <button onClick={() => addSection("Professional Summary")} className="side-btn">
                        Summary section
                      </button>

                      <button onClick={() => addSection("Key Skills")} className="side-btn">
                        Skills section
                      </button>

                      <button onClick={addExperienceBlock} className="side-btn">
                        Experience block
                      </button>

                      <button onClick={() => addSection("Education")} className="side-btn">
                        Education section
                      </button>

                      <button onClick={addAchievementBullet} className="side-btn">
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

                      <button onClick={addCoverLetterTemplate} className="side-btn">
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
                      <CheckItem done={checklist.hasLinkedIn} label="LinkedIn added" />
                      <CheckItem done={checklist.hasSkills} label="Skills section" />
                      <CheckItem done={checklist.hasExperience} label="Experience section" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="panel-title">Document stats</p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-white p-3 text-center">
                        <p className="text-xs font-bold text-slate-400">Words</p>
                        <p className="text-xl font-black">{wordCount}</p>
                      </div>

                      <div className="rounded-xl bg-white p-3 text-center">
                        <p className="text-xs font-bold text-slate-400">Chars</p>
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

      <style jsx>{`
        .top-btn {
          border: 1px solid rgb(226 232 240);
          background: white;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 800;
          color: rgb(51 65 85);
        }

        .top-btn:hover {
          background: rgb(248 250 252);
        }

        .top-btn-primary {
          border-radius: 0.5rem;
          background: rgb(37 99 235);
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 900;
          color: white;
        }

        .top-btn-primary:hover {
          background: rgb(29 78 216);
        }

        .top-btn-dark {
          border-radius: 0.5rem;
          background: rgb(15 23 42);
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 900;
          color: white;
        }

        .tool-btn {
          border: 1px solid rgb(226 232 240);
          background: white;
          border-radius: 0.5rem;
          padding: 0.4rem 0.65rem;
          font-size: 0.75rem;
          font-weight: 800;
          color: rgb(51 65 85);
          transition: 0.15s ease;
        }

        .tool-btn:hover {
          background: rgb(241 245 249);
        }

        .tool-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tool-divider {
          height: 1.5rem;
          width: 1px;
          background: rgb(226 232 240);
          margin-left: 0.25rem;
          margin-right: 0.25rem;
        }

        .side-btn {
          width: 100%;
          border: 1px solid rgb(226 232 240);
          background: white;
          border-radius: 0.8rem;
          padding: 0.8rem;
          text-align: left;
          font-size: 0.85rem;
          font-weight: 800;
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

        @media print {
          body {
            background: white;
          }
        }
      `}</style>
    </main>
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

      if (looksLikeHeading) {
        return `<h2>${escapeHtml(clean)}</h2>`;
      }

      if (clean.startsWith("•") || clean.startsWith("-")) {
        return `<ul><li>${escapeHtml(clean.replace(/^[-•]\s*/, ""))}</li></ul>`;
      }

      return `<p>${escapeHtml(clean)}</p>`;
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