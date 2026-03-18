import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

const ADMIN_EMAILS = ['nleonelli0@gmail.com', 'juancruzgc10@gmail.com']

async function verifyAuth(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return { user: null }
  
  const token = authHeader.replace('Bearer ', '')
  
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return { user: null }
  
  return { user }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)

    const user = auth.user

    const formData = await request.formData();
    const email = formData.get("email") as string;
    const receipt = formData.get("receipt") as File;
    const packageId = formData.get("packageId") as string;
    const mxnStr = formData.get("mxn") as string;
    const priceStr = formData.get("price") as string;
    const userIdFromForm = formData.get("userId") as string;
    const fortniteUsername = formData.get("fortniteUsername") as string;
    const isAccount = formData.get("isAccount") === "true";

    if (!email || !receipt) {
      return NextResponse.json(
        { error: "Email and receipt are required" },
        { status: 400 }
      );
    }

    const mxn = mxnStr ? parseInt(mxnStr) : 0;
    const price = priceStr ? parseFloat(priceStr) : 0;

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

    // If userId is provided, use it directly; otherwise find by email
    let userId = userIdFromForm;
    
    if (!userId && email) {
      try {
        const { data: users } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", email.toLowerCase())
          .limit(1);

        userId = users && users.length > 0 ? users[0].id : null;
      } catch (e) {
        console.log("Profile lookup failed, continuing without userId");
      }
    }

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
        fortnite_username: isAccount ? fortniteUsername : null,
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

    // Send Telegram notification
    try {
      const telegramMessage = `*Nuevo comprobante de pago!*\n\n👤 Email: ${email}\n💰 Monto: ${mxn.toLocaleString()} MxN\n💵 USD: $${price}\n🎮 Fortnite: ${fortniteUsername || 'No proporcionado'}\n\n🔗 https://mxnstore.vercel.app/admin/chats`;

      await fetch(process.env.NEXT_PUBLIC_APP_URL + '/api/telegram-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: telegramMessage,
          type: 'recarga'
        })
      })
    } catch (telegramError) {
      console.error('Telegram notification failed:', telegramError)
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
