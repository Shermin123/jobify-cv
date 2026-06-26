import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function GET(req: Request) {
  try {
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("job_applications")
      .select("*")
      .eq("user_email", token.email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load applications error:", error.message);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      applications: data ?? [],
    });
  } catch (error) {
    console.error("GET applications error:", error);

    return NextResponse.json(
      { error: "Failed to load applications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.job_title || !body.company) {
      return NextResponse.json(
        { error: "Job title and company are required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("job_applications")
      .insert({
        user_email: token.email,
        job_title: body.job_title,
        company: body.company,
        location: body.location || "",
        salary: body.salary || "",
        job_type: body.job_type || "",
        status: body.status || "Applied",
      })
      .select()
      .single();

    if (error) {
      console.error("Save application error:", error.message);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      application: data,
    });
  } catch (error) {
    console.error("POST application error:", error);

    return NextResponse.json(
      { error: "Failed to save application" },
      { status: 500 }
    );
  }
}