import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, points, orderId } = body;

    if (!userId || !points) {
      return NextResponse.json(
        { error: "userId and points required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get current profile
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    const currentPoints = profile?.mxn_points || 0;

    // Update points
    const { error: updateError } = await supabaseAdmin
      .from("user_profiles")
      .update({
        mxn_points: currentPoints + points,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Update payment status if orderId provided
    if (orderId) {
      await supabaseAdmin
        .from("crypto_payments")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);

      await supabaseAdmin.from("transactions").insert({
        user_id: userId,
        type: "purchase",
        amount: points,
        status: "completed",
      });
    }

    return NextResponse.json({
      success: true,
      newBalance: currentPoints + points,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
