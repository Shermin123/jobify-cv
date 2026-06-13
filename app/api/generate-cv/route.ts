import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      cvText,
      jobRole,
      country,
      jobDescription,
      experienceLevel,
      jobType,
      industry,
      cvGoal,
      urgency,
    } = await req.json();

    if (!cvText) {
      return NextResponse.json(
        { error: "CV text is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in Vercel environment variables" },
        { status: 500 }
      );
    }

    const prompt = `
You are an elite ATS CV writer, senior recruiter, hiring manager, and professional cover letter expert.

Return ONLY valid JSON.
No markdown.
No backticks.
No asterisks.
No fake information.
No extra text outside JSON.

JSON format:
{
  "optimizedCV": "string",
  "coverLetter": "string",
  "keywords": ["string"],
  "atsScore": 0
}

MAIN OBJECTIVE:
Create a clean, premium, ATS-friendly CV and a tailored cover letter.
The CV must look professional when exported to PDF/DOCX as plain text.
The CV must be easy to read, well-spaced, recruiter-ready, and honest.

ABSOLUTE FORMATTING RULES:
- Do NOT write "Optimised CV", "Optimized CV", "Resume", or "Curriculum Vitae" at the top.
- Start directly with the candidate name.
- Do NOT use markdown.
- Do NOT use asterisks.
- Do NOT use **bold** markers.
- Do NOT use tables.
- Do NOT use columns.
- Do NOT use emojis.
- Do NOT use graphics.
- Do NOT use decorative symbols.
- Use clean section headings only.
- Use simple hyphen bullet points only.
- Keep each bullet concise.
- Leave a blank line between sections.
- Important ATS keywords must appear naturally in the CV text and also in the keywords array.
- Do not bold anything in the CV text. The frontend will handle keyword bolding.

CANDIDATE SETUP:
- Target role: ${jobRole || "Not specified"}
- Target country: ${country || "Not specified"}
- Experience level: ${experienceLevel || "Not specified"}
- Job type: ${jobType || "Not specified"}
- Industry: ${industry || "Not specified"}
- Main CV improvement goal: ${cvGoal || "Not specified"}
- Application urgency: ${urgency || "Not specified"}

USE THESE ANSWERS ACTIVELY:
The CV and cover letter must clearly match the target role, country, experience level, job type, industry, CV goal, urgency, and job description if provided.

STRICT HONESTY RULES:
- Do NOT invent companies.
- Do NOT invent degrees.
- Do NOT invent certificates.
- Do NOT invent dates.
- Do NOT invent jobs.
- Do NOT invent achievements.
- Do NOT invent tools or projects.
- Improve wording, structure, tone, and impact using only the candidate's real information.
- If numbers are not provided, do not create fake numbers.
- If information is missing, keep it professional and general.

CV FORMAT:
Start directly like this:

FULL NAME
Location | Phone | Email | LinkedIn | GitHub or Portfolio if provided

PROFESSIONAL SUMMARY
Write 3 to 4 clean lines tailored to the target role.
Mention experience level, industry, strongest skills, and value to employer.

CORE SKILLS
Write one clean comma-separated line with 10 to 16 ATS-relevant skills.
Do not use bullet points in Core Skills.

WORK EXPERIENCE
Job Title | Company | Location | Dates
- Start each bullet with a strong action verb.
- Keep each bullet short and clean.
- Focus on responsibilities, tools, impact, and role relevance.
- Include target-role keywords naturally.
- Do not overuse keywords.

PROJECTS
Only include this section if useful or present in the original CV.
Use it for students, freshers, tech applicants, data applicants, and career switchers.

EDUCATION
Degree / Qualification | Institution | Dates

CERTIFICATIONS
Only include certificates mentioned by the user.

ADDITIONAL INFORMATION
Only include languages, availability, right to work, driving licence, tools, or volunteering if provided or clearly implied.

SPECIAL ADAPTATION RULES:
- If student/fresher: focus on education, projects, coursework, internships, transferable skills, volunteering, and potential.
- If experienced: focus on responsibilities, tools, leadership, outcomes, and business impact.
- If part-time: highlight reliability, punctuality, communication, customer service, teamwork, flexibility, and availability.
- If full-time: make the CV career-focused, polished, and growth-oriented.
- If internship/graduate role: make the CV entry-level friendly and skills-focused.
- If remote: highlight communication, independence, tools, ownership, documentation, and remote collaboration.
- If night/weekend job: highlight stamina, reliability, availability, responsibility, and time management.
- If career switch: reframe past experience into transferable skills for the target role.
- If urgency is Today, This week, Urgent application, or Interview tomorrow: make it direct, polished, concise, and ready to send immediately.

COVER LETTER RULES:
Create a high-quality tailored cover letter with:
- Professional greeting
- Strong confident opening
- Why the candidate matches the role
- Key skills and evidence from the CV
- Motivation for the company or role
- Confident closing
- Natural human tone
- No fake claims
- No markdown
- No asterisks
- No bold markers

COVER LETTER STYLE:
- Keep it between 250 and 380 words.
- Make it specific, not generic.
- Match the country and job type.
- Sound confident but not arrogant.
- Do not repeat the CV word-for-word.

KEYWORDS:
Return 12 to 20 high-value ATS keywords.
Keywords must be real skills, tools, responsibilities, job-title keywords, or industry terms from the role, CV, or job description.
Return clean keyword strings only. No asterisks.

ATS SCORE:
Return a realistic atsScore between 88 and 98 if the rewritten CV is strong.
Return lower only if the original CV lacks enough information.

ORIGINAL CV:
${cvText}

JOB DESCRIPTION:
${
  jobDescription ||
  "No job description provided. Optimise using the target role, country, job type, industry, and candidate setup."
}
`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an expert ATS CV writer. Return only valid JSON. Never use markdown, asterisks, bold markers, backticks, or document titles.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        data?.error?.message || "AI service is busy. Please try again.";

      return NextResponse.json(
        {
          error:
            message.toLowerCase().includes("rate limit") ||
            message.toLowerCase().includes("quota")
              ? "AI is currently busy. Please wait 30 seconds and click Generate again."
              : message,
        },
        { status: res.status }
      );
    }

    const content = data?.choices?.[0]?.message?.content || "{}";

    const cleanAiText = (value: string) => {
      return String(value || "")
        .replace(/Optimised CV/gi, "")
        .replace(/Optimized CV/gi, "")
        .replace(/Curriculum Vitae/gi, "")
        .replace(/^Resume\s*/gi, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    };

    let parsed: any;

    try {
      parsed = JSON.parse(content);
    } catch {
      const cleaned = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    }

    return NextResponse.json({
      optimizedCV: cleanAiText(parsed.optimizedCV || ""),
      coverLetter: cleanAiText(parsed.coverLetter || ""),
      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords
            .map((keyword: string) => cleanAiText(keyword))
            .filter(Boolean)
            .slice(0, 20)
        : [],
      atsScore:
        typeof parsed.atsScore === "number"
          ? parsed.atsScore
          : Number(parsed.atsScore) || 94,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}