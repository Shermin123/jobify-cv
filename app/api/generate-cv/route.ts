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

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const prompt = `
You are an elite ATS CV writer, senior recruiter, hiring manager, and professional cover letter expert.

Return ONLY valid JSON. No markdown. No backticks. No extra text.

JSON format:
{
  "optimizedCV": "string",
  "coverLetter": "string",
  "keywords": ["string"],
  "atsScore": 0
}

MAIN OBJECTIVE:
Create the strongest possible ATS-friendly CV and cover letter for this candidate.
The CV must look professional, clean, well-aligned, keyword-rich, and recruiter-ready.
The CV should give the candidate a very high chance of being shortlisted, while staying 100% honest.

CANDIDATE SETUP:
- Target role: ${jobRole || "Not specified"}
- Target country: ${country || "Not specified"}
- Experience level: ${experienceLevel || "Not specified"}
- Job type: ${jobType || "Not specified"}
- Industry: ${industry || "Not specified"}
- Main CV improvement goal: ${cvGoal || "Not specified"}
- Application urgency: ${urgency || "Not specified"}

USE THESE ANSWERS ACTIVELY:
The CV and cover letter must clearly match:
1. Target role
2. Target country
3. Experience level
4. Job type
5. Industry
6. CV improvement goal
7. Urgency/timeline
8. Job description, if provided

STRICT CV RULES:
- Create a clean, premium, ATS-safe layout.
- Use strong alignment and readable spacing.
- Do NOT use tables.
- Do NOT use emojis.
- Do NOT use graphics.
- Do NOT use columns.
- Do NOT use fake information.
- Do NOT invent companies, degrees, certificates, dates, jobs, achievements, tools, or projects.
- Improve wording, structure, tone, and impact using only the candidate's real information.
- If exact numbers are not provided, do not invent numbers.
- If achievements are weak, rewrite them with stronger action verbs and clearer business value.
- Make the CV easy for recruiters to scan in 6 seconds.
- Use professional UK/international wording depending on the target country.

VERY IMPORTANT KEYWORD RULE:
Bold important ATS keywords using double asterisks like **Python**, **customer service**, **data analysis**, **stakeholder communication**.
Use bold only for important skills, tools, responsibilities, achievements, role keywords, and industry terms.
Do not bold every sentence.

CV FORMAT:
Use this exact structure when relevant:

FULL NAME
Phone | Email | LinkedIn | Location

PROFESSIONAL SUMMARY
Write 3-4 powerful lines tailored to the target role.
Mention experience level, industry, strongest skills, and value to employer.

CORE SKILLS
Use 10-16 ATS keywords in a clean comma-separated list.
Bold the most important keywords.

WORK EXPERIENCE
Job Title | Company | Location | Dates
- Start each bullet with a strong action verb.
- Focus on achievements, responsibilities, tools, impact, and role relevance.
- Make each bullet concise and professional.
- Include target-role keywords naturally.

PROJECTS
Only include if useful or present in the original CV.
Use this for students, freshers, tech applicants, data applicants, and career switchers.

EDUCATION
Degree / Qualification | Institution | Dates
Include relevant modules/coursework only if useful.

CERTIFICATIONS
Only include certificates mentioned by the user.

ADDITIONAL INFORMATION
Include languages, availability, right to work, driving licence, tools, or volunteering only if provided or clearly implied.

SPECIAL ADAPTATION RULES:
- If student/fresher: focus on education, projects, coursework, internships, transferable skills, volunteering, and potential.
- If experienced: focus on measurable achievements, responsibilities, tools, leadership, outcomes, and business impact.
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
- Motivation for the company/role
- Confident closing
- Natural human tone
- No fake claims
- Bold important keywords using **keyword** format

COVER LETTER STYLE:
- Keep it between 250 and 380 words.
- Make it specific, not generic.
- Match the country and job type.
- Sound confident but not arrogant.
- Do not repeat the CV word-for-word.

KEYWORDS:
Return 12 to 20 high-value ATS keywords.
Keywords must be real skills, tools, responsibilities, job-title keywords, or industry terms from the role/CV/job description.

ATS SCORE:
Return a realistic atsScore between 88 and 98 if the rewritten CV is strong.
Return lower only if the original CV lacks enough information.

ORIGINAL CV:
${cvText}

JOB DESCRIPTION:
${jobDescription || "No job description provided. Optimise using the target role, country, job type, industry, and candidate setup."}
`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.25,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      const message =
        data?.error?.message || "AI service is busy. Please try again.";

      if (
        message.toLowerCase().includes("high demand") ||
        message.toLowerCase().includes("busy") ||
        message.toLowerCase().includes("overloaded")
      ) {
        return NextResponse.json(
          {
            error:
              "AI is currently busy. Please wait 30 seconds and click Generate again.",
          },
          { status: 503 }
        );
      }

      return NextResponse.json({ error: message }, { status: res.status });
    }

    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsed;

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
      optimizedCV: parsed.optimizedCV || "",
      coverLetter: parsed.coverLetter || "",
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
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