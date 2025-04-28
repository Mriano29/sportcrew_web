import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/client";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  const cookieStore = await cookies();

  cookieStore.set("sb_token", data.session?.access_token || "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ message: "Login successful", user: data.user });
}
