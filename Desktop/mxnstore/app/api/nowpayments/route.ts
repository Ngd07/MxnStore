import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY || "";
const NOWPAYMENTS_IPN_URL = process.env.NOWPAYMENTS_IPN_URL || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mxnstore.com";

interface PackageInfo {
  mxn: number;
  price: number;
}

const PACKAGES: PackageInfo[] = [
  { mxn: 1000, price: 8.99 },
  { mxn: 2800, price: 22.99 },
  { mxn: 5000, price: 37.99 },
  { mxn: 10000, price: 69.99 },
];

export async function POST(request: NextRequest) {
  try {
    if (!NOWPAYMENTS_API_KEY) {
      return NextResponse.json(
        { error: "NOWPayments API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { mxn, userId } = body;

    const selectedPackage = PACKAGES.find((p) => p.mxn === mxn);
    if (!selectedPackage) {
      return NextResponse.json(
        { error: "Invalid package" },
        { status: 400 }
      );
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orderId = `MXN-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    const paymentData = {
      price_amount: selectedPackage.price,
      price_currency: "usd",
      order_id: orderId,
      order_description: `${selectedPackage.mxn} MxN Points`,
      ipn_callback_url: NOWPAYMENTS_IPN_URL 
        ? `${NOWPAYMENTS_IPN_URL}?user_id=${user.id}&mxn=${selectedPackage.mxn}`
        : `${APP_URL}/api/nowpayments-webhook?user_id=${user.id}&mxn=${selectedPackage.mxn}`,
      success_url: `${APP_URL}/buy-vbucks?payment=success&order=${orderId}`,
      cancel_url: `${APP_URL}/buy-vbucks?payment=cancelled`,
    };

    const response = await fetch("https://api.nowpayments.io/v1/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": NOWPAYMENTS_API_KEY,
      },
      body: JSON.stringify(paymentData),
    });

    const paymentResponse = await response.json();

    if (!response.ok || paymentResponse.error) {
      console.error("NOWPayments API error:", paymentResponse);
      return NextResponse.json(
        { error: paymentResponse.error || "Failed to create payment" },
        { status: response.status }
      );
    }

    const { data: insertError } = await supabase
      .from("crypto_payments")
      .insert({
        user_id: user.id,
        order_id: orderId,
        payment_id: paymentResponse.payment_id,
        mxn_amount: selectedPackage.mxn,
        usd_amount: selectedPackage.price,
        status: "pending",
      });

    if (insertError) {
      console.error("Error saving payment:", insertError);
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paymentResponse.payment_url,
      paymentId: paymentResponse.payment_id,
      orderId: orderId,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    packages: PACKAGES,
  });
}
