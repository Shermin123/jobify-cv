import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { cvText, jobRole, country, jobDescription } = await req.json();

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
You are a professional ATS CV writer and cover letter expert.

Return ONLY valid JSON. No markdown. No backticks.

JSON format:
{
  "optimizedCV": "string",
  "coverLetter": "string",
  "keywords": ["string"],
  "atsScore": 0
}

Rules:
- Make the CV ATS-friendly.
- Tailor the CV for role: ${jobRole || "Not specified"}.
- Target country: ${country || "Not specified"}.
- Use strong action verbs.
- Improve grammar, clarity, structure and impact.
- Convert weak responsibilities into achievement-focused bullet points.
- Generate a professional cover letter.
- Extract 8 to 15 ATS keywords.
- Give atsScore between 70 and 98.
- If job description is provided, match the CV and cover letter to it.

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

  return NextResponse.json(
    { error: message },
    { status: res.status }
  );
}

    const content =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

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