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
  { mxn: 2000, price: 8.00 },
  { mxn: 5000, price: 18.00 },
  { mxn: 10000, price: 35.00 },
  { mxn: 13500, price: 45.00 },
];

export async function POST(request: NextRequest) {
  try {
    console.log("NOWPayments API Key loaded:", NOWPAYMENTS_API_KEY ? "YES (length: " + NOWPAYMENTS_API_KEY.length + ")" : "NO");
    console.log("NOWPayments IPN URL:", NOWPAYMENTS_IPN_URL);
    console.log("APP URL:", APP_URL);
    
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

    // Get user from the request - try both header approaches
    const authHeader = request.headers.get('authorization');
    let user = null;
    
    if (authHeader) {
      const { data: { user: authUser } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      user = authUser;
    }
    
    // Fallback: try to get user without token (for cookie-based auth)
    if (!user) {
      const { data: { user: anonymousUser } } = await supabase.auth.getUser();
      user = anonymousUser;
    }

    console.log("User found:", user ? user.id : "NO");

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - please log in" },
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

    console.log("NOWPayments response status:", response.status);
    const paymentResponse = await response.json();
    console.log("NOWPayments response:", paymentResponse);

    if (!response.ok || paymentResponse.error) {
      console.error("NOWPayments API error:", paymentResponse);
      return NextResponse.json(
        { error: paymentResponse.message || paymentResponse.error || "Failed to create payment", details: paymentResponse },
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
