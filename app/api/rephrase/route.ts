import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      content,
      type,
      jobRole,
      country,
      jobDescription,
    } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    const prompt = `
You are a professional ATS CV writer.

Return ONLY valid JSON. No markdown. No backticks.

JSON format:
{
  "rephrased": "string"
}

Task:
Rephrase this ${type === "cv" ? "CV" : "cover letter"} to sound more professional, clear, confident, ATS-friendly, and job-ready.

Rules:
- Keep the meaning accurate.
- Improve grammar and wording.
- Use stronger professional language.
- Make it suitable for role: ${jobRole || "Not specified"}.
- Target country: ${country || "Not specified"}.
- If job description is provided, align the wording with it.
- Do not make it fake or exaggerated.
- Keep the format clean and readable.

Job Description:
${jobDescription || "No job description provided"}

Original Content:
${content}
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
            temperature: 0.35,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "AI rephrase failed" },
        { status: res.status }
      );
    }

    const contentText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsed;

    try {
      parsed = JSON.parse(contentText);
    } catch {
      const cleaned = contentText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    }

    return NextResponse.json({
      rephrased: parsed.rephrased || content,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}