import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase server env variables");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_");
}

export async function POST(req: Request) {
  try {
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const cvFile = formData.get("cv") as File | null;
    const coverFile = formData.get("coverLetter") as File | null;

    if (!cvFile && !coverFile) {
      return NextResponse.json(
        { error: "No files uploaded" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const userFolder = token.email.toLowerCase().trim();

    let cvPath: string | null = null;
    let cvName: string | null = null;
    let coverLetterPath: string | null = null;
    let coverLetterName: string | null = null;

    if (cvFile) {
      cvName = safeFileName(cvFile.name);
      cvPath = `${userFolder}/cv-${Date.now()}-${cvName}`;

      const { error } = await supabaseAdmin.storage
        .from("job-files")
        .upload(cvPath, cvFile, {
          contentType: cvFile.type || "application/octet-stream",
          upsert: true,
        });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    if (coverFile) {
      coverLetterName = safeFileName(coverFile.name);
      coverLetterPath = `${userFolder}/cover-${Date.now()}-${coverLetterName}`;

      const { error } = await supabaseAdmin.storage
        .from("job-files")
        .upload(coverLetterPath, coverFile, {
          contentType: coverFile.type || "application/octet-stream",
          upsert: true,
        });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const { data: existingProfile } = await supabaseAdmin
      .from("job_profiles")
      .select("id, cv_path, cv_name, cover_letter_path, cover_letter_name")
      .eq("user_email", token.email)
      .maybeSingle();

    if (existingProfile) {
      const { error } = await supabaseAdmin
        .from("job_profiles")
        .update({
          cv_path: cvPath || existingProfile.cv_path,
          cv_name: cvName || existingProfile.cv_name,
          cover_letter_path:
            coverLetterPath || existingProfile.cover_letter_path,
          cover_letter_name:
            coverLetterName || existingProfile.cover_letter_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingProfile.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await supabaseAdmin.from("job_profiles").insert({
        user_email: token.email,
        cv_path: cvPath,
        cv_name: cvName,
        cover_letter_path: coverLetterPath,
        cover_letter_name: coverLetterName,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      cv_name: cvName,
      cover_letter_name: coverLetterName,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to upload job profile files" },
      { status: 500 }
    );
  }
}