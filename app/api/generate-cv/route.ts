import { NextResponse } from "next/server";

type GenerateCvRequest = {
  cvText?: string;
  fullName?: string;
  jobRole?: string;
  country?: string;
  jobDescription?: string;
  userEmail?: string;
  experienceLevel?: string;
  jobType?: string;
  educationLevel?: string;
  industry?: string;
  urgency?: string;
  mainStrength?: string;
  cvGoal?: string;
  certificates?: string;
  portfolio?: string;
  workAvailability?: string;
  toneStyle?: string;
  coverLetterNeed?: string;
  weaknessFix?: string;
  cvLength?: string;
  qualityInstructions?: string;
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
    .replace(/#{1,6}\s?/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const cleanKeyword = (value: string) => {
  return cleanAiText(value)
    .replace(/^-+/, "")
    .replace(/,+$/, "")
    .trim();
};

const parseJsonSafely = (content: string) => {
  try {
    return JSON.parse(content);
  } catch {
    const cleaned = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");

      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("AI returned invalid JSON");
      }

      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }
  }
};

const clampAtsScore = (score: unknown) => {
  const parsedScore =
    typeof score === "number" ? score : Number(String(score || "").trim());

  if (!Number.isFinite(parsedScore)) return 94;

  return Math.max(70, Math.min(98, Math.round(parsedScore)));
};

export async function POST(req: Request) {
  try {
    const {
      cvText,
      fullName,
      jobRole,
      country,
      jobDescription,
      userEmail,
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
      weaknessFix,
      cvLength,
      qualityInstructions,
    }: GenerateCvRequest = await req.json();

    const originalCv = String(cvText || "").trim();

    if (!originalCv) {
      return NextResponse.json(
        { error: "CV text is required" },
        { status: 400 }
      );
    }

    if (originalCv.split(/\s+/).filter(Boolean).length < 80) {
      return NextResponse.json(
        { error: "Please paste at least 80 words from your CV." },
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
No extra text outside JSON.

JSON format:
{
  "optimizedCV": "string",
  "coverLetter": "string",
  "keywords": ["string"],
  "atsScore": 0
}

MAIN OBJECTIVE:
Create a premium, honest, ATS-friendly CV and a tailored cover letter.
The output must be stronger than the original CV, but must not invent fake jobs, fake degrees, fake companies, fake certificates, fake dates, fake tools, or fake achievements.

ABSOLUTE FORMATTING RULES:
- Do NOT write "Optimised CV", "Optimized CV", "Resume", or "Curriculum Vitae" at the top.
- Do NOT write "Cover Letter" at the top of the cover letter.
- Start the CV directly with the candidate name.
- Start the cover letter directly with "Dear Hiring Manager,".
- Do NOT use markdown.
- Do NOT use asterisks.
- Do NOT use bold markers.
- Do NOT use tables.
- Do NOT use columns.
- Do NOT use emojis.
- Do NOT use decorative symbols.
- Use clean uppercase section headings only.
- Use simple hyphen bullet points only in the CV.
- Do NOT use bullet points in the cover letter.
- Leave one blank line between sections.
- Use plain text only.

CANDIDATE SETUP:
- Full name: ${fullName || "Use the name from the CV if available"}
- User email: ${userEmail || "Not provided"}
- Target role: ${jobRole || "Not specified"}
- Target country: ${country || "Not specified"}
- Experience level: ${experienceLevel || "Not specified"}
- Job type: ${jobType || "Not specified"}
- Education level: ${educationLevel || "Not specified"}
- Industry: ${industry || "Not specified"}
- Application urgency: ${urgency || "Not specified"}
- Main strengths: ${mainStrength || "Not specified"}
- CV improvement goal: ${cvGoal || "Not specified"}
- Certificates: ${certificates || "Not specified"}
- Portfolio/projects: ${portfolio || "Not specified"}
- Availability: ${workAvailability || "Not specified"}
- Preferred CV tone/style: ${toneStyle || "Professional, modern, ATS-focused"}
- Cover letter need: ${coverLetterNeed || "Yes, tailored to the role"}
- Weaknesses to fix: ${weaknessFix || "Improve weak wording, missing keywords, poor structure, and lack of measurable impact"}
- Preferred CV length: ${cvLength || "1 to 2 pages"}

QUALITY INSTRUCTIONS FROM FRONTEND:
${qualityInstructions || "Create a premium ATS-ready CV with grouped skills, stronger work bullets, project details, and a less generic summary."}

STRICT HONESTY RULES:
- Do NOT invent companies.
- Do NOT invent degrees.
- Do NOT invent certificates.
- Do NOT invent dates.
- Do NOT invent jobs.
- Do NOT invent fake numbers.
- Do NOT invent tools unless clearly present in the CV or setup.
- You may improve wording, structure, clarity, tone, and impact using only real information.
- If numbers already exist in the CV, keep and use them.
- If numbers are missing, describe impact honestly without making up percentages.
- If the candidate is currently studying or the education date is ongoing/future, use "candidate", "student", or "currently pursuing", not "graduate".
- If graduation is clearly completed, then "graduate" is allowed.

CV QUALITY RULES:
- The CV must feel premium and recruiter-ready.
- The professional summary must be specific, not generic.
- The summary must be 3 to 4 lines.
- Group the skills section into categories instead of one messy list.
- Add 3 to 5 strong bullet points for each work experience where possible.
- Each bullet must start with a strong action verb.
- Each bullet must be short, clear, and relevant.
- Improve weak job descriptions into stronger recruiter language.
- For technical roles, include tools, programming languages, frameworks, cloud, databases, APIs, and projects only when present or clearly implied.
- For non-technical roles, focus on reliability, customer service, operations, teamwork, communication, problem-solving, and results.
- For projects, include purpose, tech stack, actions taken, and outcome.
- Keep the CV concise and ATS-readable.
- Avoid repetitive phrases.
- Avoid vague claims like "hardworking" unless backed by evidence.
- Avoid saying "proven ability" unless the CV gives proof.
- Avoid overclaiming experience.

CV FORMAT:
Use this structure when information is available:

FULL NAME
Location | Phone | Email | LinkedIn | GitHub or Portfolio

PROFESSIONAL SUMMARY
3 to 4 clean lines tailored to the target role, country, experience level, industry, and candidate strengths.

CORE SKILLS
Programming: relevant languages only
AI, Data & Machine Learning: relevant AI/data skills only
Cloud, Tools & Platforms: relevant cloud/tools only
Software & Development: relevant development methods only
Professional Skills: relevant soft skills only

WORK EXPERIENCE
Job Title | Company | Location | Dates
- Strong action verb + responsibility + relevant tool/skill + impact.
- Strong action verb + responsibility + relevant tool/skill + impact.
- Strong action verb + responsibility + relevant tool/skill + impact.

PROJECTS
Project Name
- Explain what the project did, the tools used, and the outcome.
- Make projects strong for students, freshers, tech applicants, AI applicants, and career switchers.

EDUCATION
Degree / Qualification | Institution | Location | Dates
Relevant dissertation, final project, coursework, or grade if provided.

CERTIFICATIONS
Only include named certificates clearly provided by the candidate.

ADDITIONAL INFORMATION
Only include languages, right to work, availability, driving licence, volunteering, or portfolio if provided or clearly implied.

COVER LETTER FORMAT:
Start directly with:

Dear Hiring Manager,

Then write 4 clean paragraphs:
Paragraph 1: Confident opening and target role.
Paragraph 2: Why the candidate is suitable, using real experience from the CV.
Paragraph 3: Relevant skills, motivation, and value to the employer.
Paragraph 4: Confident closing and availability or interest.

End with:

Yours sincerely,
Candidate Name

COVER LETTER RULES:
- No title.
- No markdown.
- No asterisks.
- No bullet points.
- No fake claims.
- Natural human tone.
- Do not repeat the CV word-for-word.
- Keep it between 250 and 380 words.
- Make it specific, not generic.
- Match the country, job type, industry, and target role.
- Sound confident but not arrogant.

SPECIAL ADAPTATION RULES:
- If student/fresher: focus on education, projects, coursework, internships, transferable skills, volunteering, and potential.
- If experienced: focus on responsibilities, tools, leadership, outcomes, and business impact.
- If part-time: highlight reliability, punctuality, communication, customer service, teamwork, flexibility, and availability.
- If full-time: make the CV career-focused, polished, and growth-oriented.
- If internship/graduate role: make the CV entry-level friendly and skills-focused.
- If remote: highlight communication, independence, tools, ownership, documentation, and remote collaboration.
- If night/weekend job: highlight stamina, reliability, availability, responsibility, and time management.
- If career switch: reframe past experience into transferable skills for the target role.
- If urgency is urgent, today, this week, or interview tomorrow: make it direct, polished, concise, and ready to send immediately.

KEYWORDS:
Return 12 to 20 high-value ATS keywords.
Keywords must be real skills, tools, responsibilities, job-title keywords, or industry terms from the role, CV, setup, or job description.
Return clean keyword strings only.

ATS SCORE:
Return a realistic atsScore between 88 and 98 if the rewritten CV is strong.
Return lower only if the original CV lacks enough information.
Do not always return 97.
The score must reflect CV completeness, keyword match, structure, role relevance, achievements, and clarity.

ORIGINAL CV:
${originalCv}

JOB DESCRIPTION:
${
  jobDescription?.trim()
    ? jobDescription.trim()
    : "No job description provided. Optimise using the target role, country, job type, industry, and candidate setup."
}
`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        temperature: 0.12,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an expert ATS CV and cover letter writer. Return only valid JSON. Never use markdown, asterisks, bold markers, backticks, CV titles, cover letter titles, fake claims, fake dates, fake numbers, or fake companies.",
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
        data?.error?.message || "AI service failed. Please try again.";

      return NextResponse.json(
        {
          error: `OpenAI error: ${message}`,
        },
        { status: res.status }
      );
    }

    const content = data?.choices?.[0]?.message?.content || "{}";
    const parsed = parseJsonSafely(content);

    const optimizedCV = cleanAiText(parsed.optimizedCV || "");
    const coverLetter = cleanAiText(parsed.coverLetter || "");

    if (!optimizedCV || !coverLetter) {
      return NextResponse.json(
        { error: "AI returned an incomplete CV package. Please try again." },
        { status: 500 }
      );
    }

    const keywords = Array.isArray(parsed.keywords)
      ? parsed.keywords
          .map((keyword: string) => cleanKeyword(keyword))
          .filter(Boolean)
          .filter((keyword: string, index: number, arr: string[]) => {
            return (
              arr.findIndex(
                (item) => item.toLowerCase() === keyword.toLowerCase()
              ) === index
            );
          })
          .slice(0, 20)
      : [];

    return NextResponse.json({
      optimizedCV,
      coverLetter,
      keywords,
      atsScore: clampAtsScore(parsed.atsScore),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}