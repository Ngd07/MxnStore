import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const mxnAmount = formData.get("mxnAmount") as string;
    const usdAmount = formData.get("usdAmount") as string;
    const receipt = formData.get("receipt") as File;
    const userId = formData.get("userId") as string;

    if (!userId || !mxnAmount || !usdAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    let receiptUrl = null;

    // Upload receipt if provided
    if (receipt && receipt.size > 0) {
      const fileName = `${userId}/${Date.now()}-${receipt.name}`;
      
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

      receiptUrl = urlData.publicUrl;
    }

    // Create manual payment record
    const { data: payment, error: insertError } = await supabaseAdmin
      .from("manual_payments")
      .insert({
        user_id: userId,
        mxn_amount: parseInt(mxnAmount),
        usd_amount: parseFloat(usdAmount),
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
