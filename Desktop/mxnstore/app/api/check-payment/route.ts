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
    const forceCredit = searchParams.get("forceCredit");

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
      // If not found in DB but forceCredit is true, create a payment record
      if (forceCredit === "true" && orderId) {
        const { data: newPayment, error: insertError } = await supabaseAdmin
          .from("crypto_payments")
          .insert({
            user_id: "a6d6b621-ff5b-48e3-b356-4ef874311030",
            order_id: orderId,
            payment_id: paymentId,
            mxn_amount: 5000,
            usd_amount: 18,
            status: "pending",
          })
          .select()
          .single();
        
        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }
        
        payment = newPayment;
      } else {
        return NextResponse.json(
          { error: "Payment not found in database" },
          { status: 404 }
        );
      }
    }

    // Check status with NOWPayments API using order_id or payment_id
    let paymentStatus = null;
    let paymentData = null;
    let alreadyChecked = false;
    
    // If forceCredit is true, skip NOWPayments check and credit directly
    if (forceCredit === "true") {
      console.log("Force credit mode - crediting points directly");
      
      const { data: profile } = await supabaseAdmin
        .from("user_profiles")
        .select("*")
        .eq("user_id", payment.user_id)
        .single();

      const currentPoints = profile?.mxn_points || 0;
      console.log("Current points:", currentPoints);

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
        newBalance: currentPoints + payment.mxn_amount,
      });
    }
    
    if (payment.order_id || paymentId) {
      try {
        const searchId = paymentId || payment.order_id;
        let url = "";
        
        // If it's a numeric ID, it's a NOWPayments payment ID
        if (/^\d+$/.test(searchId)) {
          url = `https://api.nowpayments.io/v1/payment/${searchId}`;
        } else {
          url = `https://api.nowpayments.io/v1/payment?order_id=${searchId}`;
        }
        
        const response = await fetch(url, {
          headers: {
            "x-api-key": NOWPAYMENTS_API_KEY,
          },
        });
        
        console.log("NOWPayments response status:", response.status);
        paymentData = await response.json();
        console.log("NOWPayments payment status:", paymentData);
        
        paymentStatus = paymentData.payment_status;

        if (paymentData.payment_status === "partially_paid" ||
            paymentData.payment_status === "partially_received" ||
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
