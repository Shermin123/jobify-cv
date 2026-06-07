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
You are a senior ATS CV writer, recruiter, and cover letter expert.

Return ONLY valid JSON. No markdown. No backticks.

JSON format:
{
  "optimizedCV": "string",
  "coverLetter": "string",
  "keywords": ["string"],
  "atsScore": 0
}

Candidate setup:
- Target role: ${jobRole || "Not specified"}
- Target country: ${country || "Not specified"}
- Experience level: ${experienceLevel || "Not specified"}
- Job type: ${jobType || "Not specified"}
- Industry: ${industry || "Not specified"}
- Main CV improvement goal: ${cvGoal || "Not specified"}
- Application urgency: ${urgency || "Not specified"}

VERY IMPORTANT:
Use the candidate setup answers actively. Do not ignore them.
The optimized CV must clearly match:
1. The target role
2. The target country
3. The experience level
4. The job type
5. The industry
6. The CV improvement goal
7. The urgency/timeline

Rules:
- Make the CV ATS-friendly, recruiter-friendly, and easy to scan.
- Tailor the CV strongly for the target role, industry, job type, and country.
- Use local CV expectations for the target country where appropriate.
- Adapt the tone and content to the candidate's experience level.
- If the user is a student/fresher, focus on education, projects, internships, transferable skills, volunteering, coursework, and potential.
- If the user has experience, focus on measurable achievements, responsibilities, tools, leadership, and impact.
- If job type is part-time, make the CV suitable for flexible work, reliability, communication, punctuality, customer service, teamwork, and availability.
- If job type is full-time, make the CV sound career-focused and professional.
- If job type is internship or graduate role, make the CV suitable for entry-level applications.
- If job type is remote, highlight communication, independence, tools, ownership, and remote collaboration.
- If job type is night shift or weekend job, highlight reliability, stamina, availability, time management, and responsibility.
- If job type is career switch, reframe previous experience into transferable skills for the target role.
- Prioritise the main CV improvement goal: ${cvGoal || "overall CV quality"}.
- If urgency is Today, This week, Urgent application, or Interview tomorrow, make the CV direct, concise, polished, and ready to apply immediately.
- Use strong action verbs.
- Improve grammar, clarity, structure, and professional impact.
- Convert weak responsibilities into achievement-focused bullet points.
- Add ATS keywords naturally without keyword stuffing.
- Keep the CV honest. Do not invent fake degrees, companies, certifications, dates, projects, or experience.
- You may improve wording, structure, and presentation based only on the information provided.
- Generate a professional cover letter tailored to the same role, country, industry, and job type.
- Extract 8 to 15 ATS keywords.
- Give atsScore between 70 and 98.
- If job description is provided, match the CV and cover letter closely to it.

Optimized CV structure:
- Professional Summary
- Key Skills
- Work Experience
- Projects if relevant
- Education
- Certifications if mentioned
- Additional Information if useful

Cover letter structure:
- Professional greeting
- Strong opening paragraph
- Why the candidate fits the role
- Relevant skills/experience
- Confident closing paragraph

Original CV:
${cvText}

Job Description:
${jobDescription || "No job description provided"}
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
            temperature: 0.4,
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