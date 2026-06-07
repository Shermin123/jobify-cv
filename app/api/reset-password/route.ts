import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Reset token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const { data: user, error: findError } = await supabase
      .from("users")
      .select("id, reset_token_expires")
      .eq("reset_token", token)
      .maybeSingle();

    if (findError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    if (
      !user.reset_token_expires ||
      new Date(user.reset_token_expires).getTime() < Date.now()
    ) {
      return NextResponse.json(
        { error: "Reset link has expired" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}