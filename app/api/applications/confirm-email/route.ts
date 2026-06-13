import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Resend } from "resend";

const EMAIL_FROM = "Jobifycv.co <no-reply@jobifycv.co>";

export async function POST(req: Request) {
  try {
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY" },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const body = await req.json();

    const jobTitle = body.job_title || "the job";
    const company = body.company || "the company";
    const location = body.location || "Not specified";

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: token.email,
      subject: "Jobifycv.co application recorded",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
          <h2>Your application has been recorded ✅</h2>
          <p>Hi,</p>
          <p>Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been recorded successfully.</p>
          <p><strong>Location:</strong> ${location}</p>
          <p>Your uploaded CV and cover letter are ready to be used for this application.</p>
          <p>You can track this application from your Jobifycv.co dashboard.</p>
          <br />
          <p>Good luck,<br />Jobifycv.co</p>
          <p style="display:none;">EMAIL_VERSION_FIXED_NO_REPLY_JOBIFYCV</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          fromUsed: EMAIL_FROM,
          toUsed: token.email,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailId: data?.id,
      fromUsed: EMAIL_FROM,
      toUsed: token.email,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Failed to send confirmation email",
        fromUsed: EMAIL_FROM,
      },
      { status: 500 }
    );
  }
}