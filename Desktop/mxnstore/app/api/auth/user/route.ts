import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
