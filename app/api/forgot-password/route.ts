import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const { data: user } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", cleanEmail)
      .maybeSingle();

    // For security, do not reveal whether email exists
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30).toISOString();

    const { error } = await supabase
      .from("users")
      .update({
        reset_token: token,
        reset_token_expires: expires,
      })
      .eq("email", cleanEmail);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    await resend.emails.send({
      from: "Jobify <onboarding@resend.dev>",
      to: cleanEmail,
      subject: "Reset your Jobify password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #111827;">
          <h2>Reset your password</h2>
          <p>Click the button below to reset your Jobify password.</p>

          <a href="${resetLink}" style="display:inline-block;background:#111827;color:white;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:bold;">
            Reset Password
          </a>

          <p style="margin-top:16px;color:#666;font-size:13px;">
            This link expires in 30 minutes.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}