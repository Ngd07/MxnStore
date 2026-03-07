import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const receipt = formData.get("receipt") as File;
    const packageId = formData.get("packageId") as string;
    const mxnStr = formData.get("mxn") as string;
    const priceStr = formData.get("price") as string;

    if (!email || !receipt) {
      return NextResponse.json(
        { error: "Email and receipt are required" },
        { status: 400 }
      );
    }

    const mxn = mxnStr ? parseInt(mxnStr) : 0;
    const price = priceStr ? parseFloat(priceStr) : 0;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Upload receipt
    const fileName = `receipts/${Date.now()}-${receipt.name}`;
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from("payment-receipts")
      .upload(fileName, receipt);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload receipt" },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin
      .storage
      .from("payment-receipts")
      .getPublicUrl(fileName);

    const receiptUrl = urlData.publicUrl;

    // Find user by email
    const { data: users } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("email", email.toLowerCase())
      .limit(1);

    let userId = users && users.length > 0 ? users[0].user_id : null;

    // Create payment record
    const { data: payment, error: insertError } = await supabaseAdmin
      .from("manual_payments")
      .insert({
        user_id: userId,
        email: email.toLowerCase(),
        mxn_amount: mxn,
        usd_amount: price,
        package_id: packageId,
        receipt_url: receiptUrl,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
