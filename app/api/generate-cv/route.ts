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

type GeneratedPackage = {
  optimizedCV?: unknown;
  coverLetter?: unknown;
  keywords?: unknown;
  atsScore?: unknown;
};

const cleanAiText = (value: unknown) => {
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

const cleanKeyword = (value: unknown) => {
  return cleanAiText(value)
    .replace(/^-+/, "")
    .replace(/,+$/, "")
    .trim();
};

const parseJsonSafely = (content: string): GeneratedPackage => {
  try {
    return JSON.parse(content) as GeneratedPackage;
  } catch {
    const cleaned = content
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(cleaned) as GeneratedPackage;
    } catch {
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");

      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("AI returned invalid JSON");
      }

      return JSON.parse(
        cleaned.slice(firstBrace, lastBrace + 1)
      ) as GeneratedPackage;
    }
  }
};

const clampAtsScore = (score: unknown) => {
  const parsedScore =
    typeof score === "number"
      ? score
      : Number(String(score || "").trim());

  if (!Number.isFinite(parsedScore)) {
    return 88;
  }

  return Math.max(70, Math.min(98, Math.round(parsedScore)));
};

const countWords = (value: string) => {
  return value.split(/\s+/).filter(Boolean).length;
};

const hasMeaningfulCertificateDetails = (value?: string) => {
  const cleaned = String(value || "").trim().toLowerCase();

  if (!cleaned) return false;

  const vagueAnswers = [
    "yes",
    "no",
    "currently studying",
    "planning to get one",
    "only online certificates",
    "professional certificate",
    "certificates available",
    "certificate available",
    "not specified",
  ];

  return !vagueAnswers.includes(cleaned);
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateCvRequest;

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
    } = body;

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

    const originalWordCount = countWords(originalCv);

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
      cvLength?.trim() || "Detailed one-to-two-page CV";

    const certificateInstruction = hasMeaningfulCertificateDetails(
      certificates
    )
      ? `The candidate supplied these certificate details: ${certificates}`
      : "No exact certification names were supplied. Omit the CERTIFICATIONS section entirely.";

    const prompt = `
You are a senior UK recruiter, ATS CV writer, hiring manager, software recruitment specialist and professional cover letter writer.

Return ONLY one valid JSON object.

Do not return markdown.
Do not return code fences.
Do not return comments.
Do not return explanations outside the JSON.

Use exactly this JSON structure:

{
  "optimizedCV": "complete CV as one plain-text string",
  "coverLetter": "complete cover letter as one plain-text string",
  "keywords": ["keyword one", "keyword two"],
  "atsScore": 88
}

MAIN OBJECTIVE

Rewrite the candidate's original CV into a complete, detailed, honest and ATS-friendly CV tailored specifically to the target role.

The output must look like a professionally written real CV.

It must not look like:

- a short AI summary
- a condensed biography
- a generic skills list
- an unfinished CV
- a collection of vague statements

The rewritten CV must properly explain the candidate's genuine:

- employment
- internships
- freelance experience
- academic work
- technical projects
- education
- skills
- responsibilities
- practical contributions

The CV should normally contain approximately 650 to 1000 words when the candidate has enough genuine information.

If the candidate has limited professional experience, use genuine education, projects, coursework, internships, freelance work and transferable skills to create a complete entry-level CV.

Never invent information merely to reach a word count.

CANDIDATE DETAILS

Full name:
${fullName || "Use the candidate name from the original CV"}

Email:
${userEmail || "Use the email from the original CV when available"}

Target role:
${jobRole || "Use the strongest genuine career direction shown in the CV"}

Target country:
${country || "United Kingdom"}

Experience level:
${experienceLevel || "Determine accurately from the original CV"}

Preferred job type:
${jobType || "Not specified"}

Education level:
${educationLevel || "Use the education shown in the original CV"}

Target industry:
${industry || "Use only the target role and genuine candidate background"}

Application urgency:
${urgency || "Not specified"}

Main strengths:
${mainStrength || "Identify genuine strengths from the original CV"}

CV improvement goal:
${
  cvGoal ||
  "Improve experience descriptions, project explanations, structure, keywords and professional wording"
}

Certificate instructions:
${certificateInstruction}

Projects or portfolio:
${portfolio || "Use genuine projects from the original CV"}

Work availability:
${workAvailability || "Only include when genuinely supplied"}

Preferred tone:
${toneStyle || "Professional, modern, natural and ATS-focused"}

Cover letter preference:
${coverLetterNeed || "Create a tailored professional cover letter"}

Weaknesses to improve:
${
  weaknessFix ||
  "Improve weak explanations, generic wording, poor structure, limited work bullets, missing ATS keywords and short project descriptions."
}

Requested CV length:
${requestedLength}

Additional frontend quality instructions:
${
  qualityInstructions ||
  "Create a detailed recruiter-ready CV with a specific summary, correctly grouped skills, four to six meaningful bullets per genuine role, properly explained projects, accurate education details, no unnamed certificates and no unrelated sectors."
}

STRICT HONESTY RULES

- Do not invent employers.
- Do not invent job titles.
- Do not invent employment dates.
- Do not invent locations.
- Do not invent degrees.
- Do not invent universities or schools.
- Do not invent certificates.
- Do not invent programming languages.
- Do not invent frameworks.
- Do not invent databases.
- Do not invent cloud platforms.
- Do not invent software tools.
- Do not invent projects.
- Do not invent project features.
- Do not invent responsibilities that are unrealistic for the role.
- Do not invent percentages.
- Do not invent revenue.
- Do not invent customer numbers.
- Do not invent user numbers.
- Do not invent savings.
- Do not invent performance improvements.
- Do not invent awards.
- Do not invent achievements.
- Do not claim that a qualification is complete when it is ongoing.
- Do not call an ongoing student a graduate.
- Do not claim management or leadership unless the original CV supports it.
- Do not change genuine dates.
- Do not change genuine organisations.
- Do not remove important genuine information.
- Preserve useful contact information from the original CV.
- Preserve genuine achievements and statistics already supplied.
- Improve wording, structure, explanation and relevance using truthful information only.
- When specific outcomes are unknown, explain the practical contribution without inventing a metric.
- When information is uncertain, omit it instead of guessing.

TARGET ROLE CONTROL

The target role must control the direction of the CV.

Do not insert an unrelated industry into the professional summary, skills or closing statement.

For a software engineering role:

- Focus on software development.
- Focus on mobile or web application development.
- Focus on backend integration.
- Focus on REST APIs.
- Focus on debugging.
- Focus on testing.
- Focus on Git.
- Focus on collaboration.
- Focus on genuine programming languages and frameworks.
- Use AI knowledge as a supporting technical strength when relevant.
- Do not mention warehouse, logistics, healthcare, education, retail or hospitality unless the target job or job description genuinely requires it.

For an AI, machine learning or data role:

- Focus on Python.
- Focus on data preparation.
- Focus on model development.
- Focus on model evaluation.
- Focus on natural language processing.
- Focus on genuine cloud or AI tools.
- Focus on genuine academic and technical projects.

For retail, hospitality, care, warehouse or customer-service roles:

- Focus on communication.
- Focus on reliability.
- Focus on teamwork.
- Focus on customer service.
- Focus on organisation.
- Focus on accuracy.
- Focus on safety.
- Focus on flexibility.
- Focus on genuine transferable experience.

For career changers:

- Connect genuine past responsibilities to the target role.
- Highlight genuine transferable skills.
- Do not present unrelated work as direct specialist experience.

PROFESSIONAL SUMMARY

Write a specific professional summary of approximately 90 to 140 words.

Use four to six clear sentences.

The summary must:

- accurately state the candidate's current academic or professional position
- identify the target role or career direction
- mention genuine practical experience
- mention the strongest relevant technical or professional skills
- mention important genuine projects or education
- explain the practical value the candidate could bring
- remain truthful
- sound natural
- avoid unrelated sectors
- avoid first-person pronouns

Do not use generic phrases such as:

- hardworking individual
- results-driven professional
- proven track record
- highly motivated self-starter
- dynamic professional
- passionate individual

unless the original CV provides clear evidence and the wording is genuinely useful.

SKILLS CATEGORISATION

Group skills into correct and relevant categories.

Possible categories include:

Programming Languages
Mobile and Web Development
Backend Development
Frameworks and Libraries
AI and Machine Learning
Cloud and DevOps
Databases
Development Tools
Testing and Quality
Customer Service and Retail
Administration and Operations
Professional Skills
Languages

Important classification rules:

- Node.js is not a programming language.
- Firebase is not a programming language.
- Docker is not a programming language.
- REST APIs are not a programming language.
- Git is not a programming language.
- Agile is not a programming language.
- Machine learning is not a programming language.
- Large language models are not programming languages.
- Prompt engineering is not a programming language.

Only create categories containing genuine relevant skills.

Do not repeat the same skill in multiple categories.

Do not add common industry tools merely because they appear in the job description unless the candidate genuinely has them.

WORK EXPERIENCE

For every genuine job, internship, freelance role or placement:

- Preserve the correct job title.
- Preserve the correct company.
- Preserve the correct location when provided.
- Preserve the correct dates.
- Write four to six meaningful bullet points when the original information supports them.
- Write at least three bullets when information is limited.
- Each bullet should normally contain approximately 18 to 35 words.
- Begin each bullet with a natural action verb.
- Explain what the candidate did.
- Explain how the candidate performed the work.
- Mention genuine skills, tools, systems or methods.
- Explain the practical purpose or contribution.
- Tailor the language towards the target role.
- Avoid vague one-line statements.
- Avoid repeating responsibilities.
- Avoid repeating the same action verb.
- Do not invent measurable outcomes.

Use action verbs such as:

Supported
Developed
Built
Created
Integrated
Tested
Debugged
Improved
Maintained
Collaborated
Analysed
Prepared
Implemented
Coordinated
Resolved
Documented
Assisted
Delivered
Processed
Monitored
Organised
Communicated

A strong bullet should follow this structure:

Action + responsibility + genuine skill, tool or process + practical purpose or honest contribution.

PROJECTS

For every genuine project:

- Preserve the genuine project name.
- Explain the problem or purpose.
- Explain the candidate's contribution.
- Mention only genuine technologies and methods.
- Explain important features, development work, research work or technical processes.
- Explain the practical outcome, learning or value.
- Write three to five bullet points for each important project when supported.
- Make academic projects relevant to recruiters.
- Do not merely list the project name and technologies.
- Do not invent deployment.
- Do not invent users.
- Do not invent results.
- Do not invent performance statistics.
- Do not claim a production system was built when it was only research.

For software projects, explain:

- what was built
- why it was built
- the genuine technologies used
- frontend or backend responsibilities
- important features
- API or database work
- testing or debugging
- accessibility or usability work
- practical project value

For AI projects, explain:

- the problem being addressed
- dataset preparation
- data cleaning
- feature engineering
- algorithm or model development
- training
- evaluation
- ethical considerations
- practical learning or value

For research projects:

- use researched, investigated, evaluated, examined or proposed when appropriate
- do not state that a working prototype was developed unless the original CV confirms it
- do not invent user testing unless the original CV confirms it

EDUCATION

- Preserve the qualification name.
- Preserve the institution name.
- Preserve the location when provided.
- Preserve genuine dates.
- Clearly identify ongoing education.
- Use "candidate", "student" or "currently pursuing" when appropriate.
- Do not use an expected date that has already passed unless the original CV still confirms that status.
- If completion status is unclear, keep the supplied date without claiming graduation.
- Include relevant modules only when genuinely supplied.
- Include dissertations, theses and final projects only when genuinely supplied.
- Include grades only when genuinely supplied.
- Do not invent modules.
- Do not invent dissertation topics.
- Do not invent grades.

CERTIFICATIONS

- Include a CERTIFICATIONS section only when exact certification names are supplied.
- If the candidate only selected "Yes", do not create a certifications section.
- If the input says "certificates available", do not create a certifications section.
- If certificate details are unspecified, omit the section.
- Never write "Certificates available".
- Never write "Details not specified".
- Never invent certificate names.

ADDITIONAL INFORMATION

Only include genuine useful information such as:

- languages
- work availability
- right to work
- driving licence
- LinkedIn
- GitHub
- portfolio
- volunteering
- professional memberships

Do not include generic interests.

Do not include unsupported claims.

Do not include placeholders.

CV STRUCTURE

Use this structure only when information is available:

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

CV FORMATTING

- Start directly with the candidate's name.
- Do not write "CV".
- Do not write "Resume".
- Do not write "Optimised CV".
- Do not write "Optimized CV".
- Do not write "Curriculum Vitae".
- Use uppercase section headings.
- Use plain text.
- Use simple hyphen bullet points.
- Do not use markdown.
- Do not use asterisks.
- Do not use tables.
- Do not use columns.
- Do not use emojis.
- Leave one blank line between sections.
- Keep contact details on one clean line where possible.
- Use consistent punctuation.
- Do not include commentary or writing instructions.
- Keep the document ATS-readable.

LANGUAGE STYLE

- Use British English when the target country is the United Kingdom.
- Use natural professional language.
- Keep the wording confident but honest.
- Use clear sentences.
- Avoid robotic wording.
- Avoid exaggerated corporate language.
- Avoid unnecessary buzzwords.
- Avoid repeatedly using the same adjective.
- Avoid unnecessarily complex vocabulary.
- Avoid words such as spearheaded, architected and cutting-edge.
- Prioritise clarity and relevance.

COVER LETTER

Create a tailored professional cover letter of approximately 280 to 420 words.

Start exactly with:

Dear Hiring Manager,

Write five natural paragraphs.

Paragraph 1:
State the target position and provide a clear, confident introduction.

Paragraph 2:
Explain the candidate's most relevant genuine experience.

Paragraph 3:
Explain relevant technical, professional or transferable skills.

Paragraph 4:
Explain motivation, suitability and the value the candidate could bring.

Paragraph 5:
Provide a confident closing and mention genuine availability when supplied.

End exactly with:

Yours sincerely,
${fullName || "Candidate Name"}

COVER LETTER RULES

- Do not add a cover-letter title.
- Do not use bullet points.
- Do not use markdown.
- Do not invent the employer name.
- Do not invent the hiring manager's name.
- Do not invent company values.
- Do not invent company projects.
- Do not repeat the CV word for word.
- Do not use generic filler.
- Match the target role.
- Match the target country.
- Match the genuine experience level.
- Sound natural, confident and honest.
- Do not include placeholders except "Dear Hiring Manager".

KEYWORDS

Return between 12 and 20 high-value ATS keywords.

Each keyword must:

- be relevant to the target role
- be supported by the original CV, candidate setup or genuine job-description alignment
- represent a real technology, skill, method, responsibility or industry term
- be a clean individual string
- contain no bullet
- contain no explanation
- contain no duplicate

Do not return generic personality words unless directly relevant.

ATS SCORE

Return a realistic integer between 70 and 98.

Assess:

- CV completeness
- ATS formatting
- target-role relevance
- genuine keyword coverage
- skill relevance
- work-experience quality
- project detail
- education clarity
- achievement evidence
- job-description alignment

Do not automatically return 97 or 98.

A candidate with limited information should receive a lower score than a candidate with complete, strongly matched evidence.

ORIGINAL CV WORD COUNT

${originalWordCount}

ORIGINAL CV

${originalCv}

TARGET JOB DESCRIPTION

${
  jobDescription?.trim()
    ? jobDescription.trim()
    : `No full job description was provided. Tailor the CV to the target role "${
        jobRole ||
        "the strongest genuine role based on the candidate's background"
      }" using only genuine information from the original CV and candidate setup.`
}

FINAL VALIDATION

Before returning the JSON, confirm:

- The CV starts with the candidate's name.
- The CV is detailed rather than abbreviated.
- The professional summary is specific to the target role.
- No unrelated sector was inserted.
- Skills are correctly categorised.
- Node.js is not listed as a programming language.
- Firebase is not listed as a programming language.
- Docker is not listed as a programming language.
- Every genuine work role has meaningful bullet points.
- Important projects are properly explained.
- Research is not falsely described as a completed working product.
- Ongoing education is described accurately.
- Unnamed certificates are omitted.
- No fake facts were introduced.
- No important original information was removed.
- The cover letter starts with "Dear Hiring Manager,".
- The response contains no markdown.
- The response is valid JSON.
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
          temperature: 0.1,
          max_completion_tokens: 5000,
          response_format: {
            type: "json_object",
          },
          messages: [
            {
              role: "system",
              content:
                "You are a senior UK recruiter and ATS CV writer. Return only valid JSON. Produce a complete, detailed and accurately targeted CV. Correctly categorise skills, fully explain genuine employment and projects, omit unnamed certificates, avoid unrelated sectors and never invent facts.",
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

    const optimizedCV = cleanAiText(parsed.optimizedCV);
    const coverLetter = cleanAiText(parsed.coverLetter);

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

    const optimizedCvWordCount = countWords(optimizedCV);
    const coverLetterWordCount = countWords(coverLetter);

    if (optimizedCvWordCount < 350) {
      console.warn(
        `Generated CV may be too short: ${optimizedCvWordCount} words`
      );
    }

    if (coverLetterWordCount < 220) {
      console.warn(
        `Generated cover letter may be too short: ${coverLetterWordCount} words`
      );
    }

    const rawKeywords = Array.isArray(parsed.keywords)
      ? parsed.keywords
      : [];

    const keywords = rawKeywords
      .map((keyword) => cleanKeyword(keyword))
      .filter(Boolean)
      .filter(
        (
          keyword: string,
          index: number,
          allKeywords: string[]
        ) =>
          allKeywords.findIndex(
            (item) =>
              item.toLowerCase() === keyword.toLowerCase()
          ) === index
      )
      .slice(0, 20);

    return NextResponse.json({
      optimizedCV,
      coverLetter,
      keywords,
      atsScore: clampAtsScore(parsed.atsScore),
      metadata: {
        originalCvWordCount: originalWordCount,
        optimizedCvWordCount,
        coverLetterWordCount,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected server error";

    console.error("Generate CV API error:", error);

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