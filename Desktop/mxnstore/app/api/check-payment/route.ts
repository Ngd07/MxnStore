import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY || "";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const paymentId = searchParams.get("paymentId");

    if (!orderId && !paymentId) {
      return NextResponse.json(
        { error: "orderId or paymentId required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Find the payment in our database
    let payment = null;
    if (orderId) {
      const { data } = await supabaseAdmin
        .from("crypto_payments")
        .select("*")
        .eq("order_id", orderId)
        .single();
      payment = data;
    }

    if (!payment && paymentId) {
      const { data } = await supabaseAdmin
        .from("crypto_payments")
        .select("*")
        .eq("payment_id", paymentId)
        .single();
      payment = data;
    }

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found in database" },
        { status: 404 }
      );
    }

    // Check status with NOWPayments API
    const checkPaymentId = paymentId || payment.payment_id;
    if (checkPaymentId) {
      try {
        const response = await fetch(
          `https://api.nowpayments.io/v1/payment/${checkPaymentId}`,
          {
            headers: {
              "x-api-key": NOWPAYMENTS_API_KEY,
            },
          }
        );
        const paymentData = await response.json();
        console.log("NOWPayments payment status:", paymentData);

        if (paymentData.payment_status === "partially_paid" ||
            paymentData.payment_status === "confirmed" ||
            paymentData.payment_status === "finished") {
          
          // Credit points
          const { data: profile } = await supabaseAdmin
            .from("user_profiles")
            .select("*")
            .eq("user_id", payment.user_id)
            .single();

          const currentPoints = profile?.mxn_points || 0;

          await supabaseAdmin
            .from("user_profiles")
            .update({
              mxn_points: currentPoints + payment.mxn_amount,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", payment.user_id);

          await supabaseAdmin
            .from("crypto_payments")
            .update({
              status: "completed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", payment.id);

          await supabaseAdmin.from("transactions").insert({
            user_id: payment.user_id,
            type: "purchase",
            amount: payment.mxn_amount,
            status: "completed",
          });

          return NextResponse.json({
            success: true,
            message: "Points credited!",
            status: paymentData.payment_status,
          });
        }
      } catch (e) {
        console.error("Error checking NOWPayments:", e);
      }
    }

    return NextResponse.json({
      payment,
      message: "Payment found but not yet completed",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
