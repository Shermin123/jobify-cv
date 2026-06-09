import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const jobTitle = body.job_title || "the job";
    const company = body.company || "the company";
    const location = body.location || "Not specified";

    const { error } = await resend.emails.send({
      from: "Jobify.cv <no-reply@jobify.cv>",
      to: token.email,
      subject: "Your job application has been recorded",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
          <h2>Your application has been recorded ✅</h2>
          <p>Hi,</p>
          <p>Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been recorded successfully.</p>
          <p><strong>Location:</strong> ${location}</p>
          <p>Your uploaded CV and cover letter are ready to be used for this application.</p>
          <p>You can track this application from your Jobify.cv dashboard.</p>
          <br />
          <p>Good luck,<br />Jobify.cv</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send confirmation email" },
      { status: 500 }
    );
  }
}