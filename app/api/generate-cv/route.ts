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
    .replace(/\bSpearheaded\b/g, "Managed")
    .replace(/\bspearheaded\b/g, "managed")
    .replace(/\bArchitected\b/g, "Designed")
    .replace(/\barchitected\b/g, "designed")
    .replace(/\bcutting-edge\b/gi, "modern")
    .replace(/\bdemonstrated success in\b/gi, "experience in")
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
      .replace(/```json/gi, "")
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
    typeof score === "number"
      ? score
      : Number(String(score || "").trim());

  if (!Number.isFinite(parsedScore)) {
    return 94;
  }

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
        {
          error: "CV text is required",
        },
        {
          status: 400,
        }
      );
    }

    const originalWordCount = originalCv
      .split(/\s+/)
      .filter(Boolean).length;

    if (originalWordCount < 80) {
      return NextResponse.json(
        {
          error: "Please paste at least 80 words from your CV.",
        },
        {
          status: 400,
        }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Missing OPENAI_API_KEY in Vercel environment variables",
        },
        {
          status: 500,
        }
      );
    }

    const requestedLength =
      cvLength?.trim() || "Detailed 1 to 2 page CV";

    const prompt = `
You are an elite ATS CV writer, senior recruiter, hiring manager, and professional cover letter writer.

Return ONLY one valid JSON object.

Do not return markdown.
Do not return backticks.
Do not return comments.
Do not return explanations outside the JSON.

Required JSON format:
{
  "optimizedCV": "complete CV as one plain-text string",
  "coverLetter": "complete cover letter as one plain-text string",
  "keywords": ["keyword one", "keyword two"],
  "atsScore": 94
}

MAIN OBJECTIVE

Rewrite the candidate's original CV into a detailed, polished, honest and ATS-friendly CV tailored to the target role.

The new CV must explain the candidate's genuine experience properly. It must not simply shorten, summarise or lightly reword the original CV.

The rewritten CV should normally contain approximately 700 to 1100 words when the original information supports that length.

For candidates with limited experience, produce the most complete CV possible using education, genuine projects, internships, freelance work, coursework, volunteering and transferable skills.

Never add fictional information merely to reach a word count.

The CV must be meaningfully more detailed than the original while remaining readable and suitable for approximately one to two pages.

CANDIDATE INFORMATION

Full name:
${fullName || "Use the candidate name found in the original CV"}

Email:
${userEmail || "Use the email found in the original CV if available"}

Target role:
${jobRole || "Not specified"}

Target country:
${country || "Not specified"}

Experience level:
${experienceLevel || "Not specified"}

Preferred job type:
${jobType || "Not specified"}

Education level:
${educationLevel || "Not specified"}

Target industry:
${industry || "Not specified"}

Application urgency:
${urgency || "Not specified"}

Main strengths:
${mainStrength || "Not specified"}

CV improvement goal:
${cvGoal || "Not specified"}

Certificates:
${certificates || "Not specified"}

Projects or portfolio:
${portfolio || "Not specified"}

Work availability:
${workAvailability || "Not specified"}

Preferred style:
${toneStyle || "Professional, modern and ATS-focused"}

Cover letter preference:
${coverLetterNeed || "Create a tailored professional cover letter"}

Weaknesses to improve:
${
  weaknessFix ||
  "Improve weak descriptions, missing role keywords, limited explanations, poor structure and generic wording."
}

Requested CV length:
${requestedLength}

Additional frontend quality instructions:
${
  qualityInstructions ||
  "Create a detailed premium CV with a targeted summary, grouped skills, complete work-experience bullets, stronger project explanations and natural ATS keywords."
}

STRICT HONESTY RULES

- Do not invent employers.
- Do not invent job titles.
- Do not invent employment dates.
- Do not invent qualifications.
- Do not invent universities or schools.
- Do not invent certificates.
- Do not invent software, tools or technologies.
- Do not invent projects.
- Do not invent responsibilities that would be unrealistic for the role.
- Do not invent percentages, money values, customer numbers or performance statistics.
- Do not claim that the candidate graduated when education is ongoing.
- Do not claim seniority, management or leadership unless supported by the original CV.
- Do not change genuine dates or locations.
- Do not remove useful genuine information.
- Preserve all important contact information present in the original CV.
- Preserve genuine achievements and numbers already supplied.
- You may strengthen wording, organisation, explanation and relevance.
- You may explain reasonable transferable skills demonstrated by genuine duties.
- When specific results are unknown, explain the contribution honestly without fabricating metrics.

CRITICAL CV DETAIL RULES

The CV must not feel small, empty, unfinished or under-explained.

PROFESSIONAL SUMMARY

- Write a targeted professional summary of approximately 80 to 130 words.
- Use approximately four to six clear lines.
- Mention the target role or professional direction.
- Mention the candidate's genuine experience level.
- Include their strongest relevant technical or professional capabilities.
- Mention relevant industries, projects or education.
- Explain the value the candidate could bring.
- Avoid generic phrases that could describe anyone.
- Do not use first-person pronouns.
- Do not use vague claims such as "hardworking individual" without evidence.

WORK EXPERIENCE

For every genuine job, internship, placement or freelance role:

- Keep the correct job title, organisation, location and dates when provided.
- Add four to six detailed bullet points when enough information is available.
- Use at least three bullet points even when the original description is limited.
- Each bullet should normally contain approximately 18 to 35 words.
- Explain what the candidate did.
- Explain how they performed the responsibility.
- Mention relevant tools, systems, methods or skills only when genuinely supported.
- Explain the practical purpose, contribution or honest result.
- Tailor the wording towards the target role.
- Include customer service, teamwork, communication, accuracy, operations, technical delivery or problem-solving where genuinely relevant.
- Avoid bullets containing only a few vague words.
- Avoid repeating the same action verb.
- Do not write multiple bullets that communicate the same responsibility.
- Do not invent measurable results.

Use natural action verbs such as:

Developed
Built
Created
Improved
Supported
Managed
Maintained
Tested
Analysed
Delivered
Coordinated
Resolved
Assisted
Collaborated
Processed
Monitored
Implemented
Prepared
Organised
Communicated

PROJECTS

For every genuine project:

- Include the project name.
- Explain the problem or purpose.
- Explain the candidate's responsibilities.
- Mention the genuine technology stack, tools or methods.
- Explain important features or processes.
- Explain the outcome, learning or practical value.
- Write approximately three to five strong bullet points per important project where information supports it.
- Make student, software, AI, data and academic projects useful to recruiters.
- Do not merely list project names and technologies.
- Do not invent project results or users.

EDUCATION

- Preserve the correct qualification, institution, location and dates.
- Clearly indicate when a qualification is ongoing, expected or currently being studied.
- Include a dissertation, thesis, final project, modules or grade only when supplied.
- For students and freshers, give education and relevant projects sufficient detail.
- Do not call an ongoing student a graduate.

SKILLS

- Group skills into relevant categories.
- Include only skills genuinely present in the original CV, setup or job description when reasonably supported.
- Do not create a long unstructured keyword list.
- Use category labels suitable for the candidate.

Possible categories include:

Programming Languages
Frameworks and Development
AI, Data and Machine Learning
Cloud and DevOps
Databases
Tools and Platforms
Customer Service and Retail
Administration and Operations
Professional Skills
Languages

Only include categories that are relevant.

CERTIFICATIONS

- Include only named certifications clearly supplied.
- Do not convert a general statement such as "has certificates" into invented certificate names.
- Omit this section when no genuine certification details are available.

ADDITIONAL INFORMATION

Include only useful genuine information such as:

- Languages
- Work availability
- Right to work
- Driving licence
- Portfolio
- GitHub
- LinkedIn
- Volunteering
- Professional memberships

Do not insert placeholders such as "Add LinkedIn here".

CV STRUCTURE

Use the following structure when information is available:

FULL NAME
Location | Phone | Email | LinkedIn | GitHub | Portfolio

PROFESSIONAL SUMMARY

CORE SKILLS

WORK EXPERIENCE

PROJECTS

EDUCATION

CERTIFICATIONS

ADDITIONAL INFORMATION

Do not include empty sections.

FORMATTING RULES

- Start directly with the candidate's name.
- Do not write "Optimised CV".
- Do not write "Optimized CV".
- Do not write "Resume".
- Do not write "Curriculum Vitae".
- Use uppercase section headings.
- Use plain text only.
- Use simple hyphen bullets.
- Do not use markdown symbols.
- Do not use asterisks.
- Do not use bold markers.
- Do not use tables.
- Do not use columns.
- Do not use emojis.
- Leave one blank line between sections.
- Keep contact details on one clean line where possible.
- Keep formatting consistent.
- Make the document ATS-readable.
- Do not include instructions or commentary inside the CV.

LANGUAGE STYLE

- Use clear British English when the target country is the United Kingdom.
- Use natural professional language.
- Keep wording confident but honest.
- Do not make the candidate sound robotic.
- Avoid exaggerated corporate language.
- Avoid repeatedly using the same adjective.
- Avoid unnecessarily complicated vocabulary.
- Avoid words such as spearheaded, architected and cutting-edge.
- Use concise but properly explained sentences.
- Prioritise clarity and relevance over buzzwords.

SPECIAL CANDIDATE ADAPTATION

When the candidate is a student or fresher:

- Focus on education, projects, coursework, internships, freelance work and transferable skills.
- Explain projects in enough detail to demonstrate capability.
- Do not exaggerate the amount of professional experience.
- Use "candidate", "student" or "currently pursuing" where appropriate.

When the candidate has professional experience:

- Focus on responsibilities, tools, delivery, collaboration, outcomes and business value.
- Give every relevant role sufficient explanation.
- Place the most relevant and recent experience first.

When the candidate is changing careers:

- Connect genuine past responsibilities to the target role.
- Highlight relevant transferable skills.
- Do not falsely present unrelated experience as direct industry experience.

When the target is retail, hospitality, care, warehouse or customer service:

- Emphasise reliability, communication, service, teamwork, safety, accuracy, organisation, flexibility and problem-solving where supported.

When the target is software, AI, data or technology:

- Explain genuine projects, programming languages, frameworks, APIs, databases, testing, cloud tools and development processes.
- Do not add technologies not found in the candidate's information.

COVER LETTER REQUIREMENTS

Create a professional tailored cover letter between approximately 280 and 420 words.

Start exactly with:

Dear Hiring Manager,

Write five clear paragraphs:

Paragraph 1:
State the target position and provide a confident, specific introduction.

Paragraph 2:
Explain the candidate's most relevant genuine experience.

Paragraph 3:
Explain relevant technical, professional or transferable skills.

Paragraph 4:
Explain the candidate's motivation, suitability and value to the employer.

Paragraph 5:
Provide a confident closing and mention availability when genuinely provided.

End with:

Yours sincerely,
${fullName || "Candidate Name"}

COVER LETTER RULES

- Do not add a cover letter title.
- Do not use markdown.
- Do not use bullet points.
- Do not use fake employer details.
- Do not invent the hiring manager's name.
- Do not invent company values.
- Do not repeat the CV word for word.
- Avoid generic filler.
- Match the target role, country, industry and experience level.
- Sound natural and personalised.
- Do not include placeholders except "Dear Hiring Manager".
- Do not make unsupported claims.

KEYWORD REQUIREMENTS

Return between 12 and 20 high-value ATS keywords.

Keywords must:

- Be relevant to the target role.
- Come from the original CV, candidate setup or job description.
- Include genuine tools, responsibilities, skills or industry terms.
- Be individual clean strings.
- Contain no bullets.
- Contain no explanations.
- Contain no duplicates.
- Avoid meaningless words such as motivated or passionate unless important to the role.

ATS SCORE REQUIREMENTS

Return a realistic integer between 70 and 98.

Consider:

- CV completeness
- ATS formatting
- Role relevance
- Keyword coverage
- Skills relevance
- Work-experience detail
- Project detail
- Education clarity
- Achievement evidence
- Job-description alignment

Do not always return 97 or 98.

A CV with limited information should receive a lower score than a detailed, strongly matched CV.

ORIGINAL CV

${originalCv}

TARGET JOB DESCRIPTION

${
  jobDescription?.trim()
    ? jobDescription.trim()
    : `No full job description was provided. Optimise the CV using the target role "${
        jobRole || "not specified"
      }", the candidate setup, target country and genuine information in the original CV.`
}

FINAL CHECK BEFORE RESPONDING

Before returning the JSON:

- Confirm the optimized CV is detailed rather than abbreviated.
- Confirm every genuine work role has sufficient bullet points.
- Confirm important projects are explained.
- Confirm no fake facts were introduced.
- Confirm no useful original information was accidentally removed.
- Confirm the CV begins with the candidate's name.
- Confirm the cover letter begins with "Dear Hiring Manager,".
- Confirm there is no markdown.
- Confirm the response is valid JSON.
`;

    const res = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
          temperature: 0.15,
          max_completion_tokens: 5000,
          response_format: {
            type: "json_object",
          },
          messages: [
            {
              role: "system",
              content:
                "You are an expert ATS CV and cover letter writer. Return only valid JSON. Produce a complete and properly explained CV rather than a short summary. Preserve truthful information and never invent companies, dates, qualifications, technologies, statistics or achievements.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      const message =
        data?.error?.message ||
        "AI service failed. Please try again.";

      return NextResponse.json(
        {
          error: `OpenAI error: ${message}`,
        },
        {
          status: res.status,
        }
      );
    }

    const content =
      data?.choices?.[0]?.message?.content || "{}";

    const parsed = parseJsonSafely(content);

    const optimizedCV = cleanAiText(
      parsed.optimizedCV || ""
    );

    const coverLetter = cleanAiText(
      parsed.coverLetter || ""
    );

    if (!optimizedCV || !coverLetter) {
      return NextResponse.json(
        {
          error:
            "AI returned an incomplete CV package. Please try again.",
        },
        {
          status: 500,
        }
      );
    }

    const optimizedCvWordCount = optimizedCV
      .split(/\s+/)
      .filter(Boolean).length;

    if (optimizedCvWordCount < 300) {
      console.warn(
        `Generated CV may be too short: ${optimizedCvWordCount} words`
      );
    }

    const keywords = Array.isArray(parsed.keywords)
      ? parsed.keywords
          .map((keyword: unknown) =>
            cleanKeyword(String(keyword || ""))
          )
          .filter(Boolean)
          .filter(
            (
              keyword: string,
              index: number,
              allKeywords: string[]
            ) =>
              allKeywords.findIndex(
                (item) =>
                  item.toLowerCase() ===
                  keyword.toLowerCase()
              ) === index
          )
          .slice(0, 20)
      : [];

    return NextResponse.json({
      optimizedCV,
      coverLetter,
      keywords,
      atsScore: clampAtsScore(parsed.atsScore),
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Server error";

    console.error("Generate CV API error:", err);

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}