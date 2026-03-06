import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      payment_id,
      order_id,
      payment_status,
      price_amount,
      user_id,
      mxn,
    } = body;

    console.log("NOWPayments webhook received:", {
      payment_id,
      order_id,
      payment_status,
      price_amount,
    });

    if (!order_id || !payment_status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: payment } = await supabase
      .from("crypto_payments")
      .select("*")
      .eq("order_id", order_id)
      .single();

    if (!payment) {
      console.error("Payment not found:", order_id);
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    if (payment.status === "completed") {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    let newStatus = payment_status;
    
    if (payment_status === "finished" || payment_status === "confirmed") {
      newStatus = "completed";
      
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", payment.user_id)
        .single();

      const currentPoints = profile?.mxn_points || 0;
      
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ 
          mxn_points: currentPoints + payment.mxn_amount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", payment.user_id);

      if (updateError) {
        console.error("Error updating points:", updateError);
      }

      await supabase.from("transactions").insert({
        user_id: payment.user_id,
        type: "purchase",
        amount: payment.mxn_amount,
        status: "completed",
      });
    } else if (payment_status === "failed" || payment_status === "expired") {
      newStatus = "failed";
    }

    const { error: updatePaymentError } = await supabase
      .from("crypto_payments")
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", order_id);

    if (updatePaymentError) {
      console.error("Error updating payment status:", updatePaymentError);
      return NextResponse.json(
        { error: "Failed to update payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
