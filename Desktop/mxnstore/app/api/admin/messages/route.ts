import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "purchases") {
      const { data: purchasesData } = await supabaseAdmin
        .from("purchases")
        .select("*")
        .order("created_at", { ascending: false });

      if (!purchasesData) {
        return NextResponse.json({ purchases: [] });
      }

      const userIds = [...new Set(purchasesData.map((p: any) => p.user_id))];
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p: any) => [p.id, p.email]) || []);

      const purchaseIds = purchasesData.map((p: any) => p.id);
      const { data: lastMessages } = await supabaseAdmin
        .from("purchase_messages")
        .select("purchase_id, content")
        .in("purchase_id", purchaseIds)
        .order("created_at", { ascending: false });

      const lastMsgMap = new Map();
      lastMessages?.forEach((msg: any) => {
        if (!lastMsgMap.has(msg.purchase_id)) {
          lastMsgMap.set(msg.purchase_id, msg.content);
        }
      });

      const purchasesWithEmail = purchasesData.map((purchase: any) => ({
        ...purchase,
        user_email: profileMap.get(purchase.user_id) || "Unknown",
        last_message: lastMsgMap.get(purchase.id) || "",
      }));

      return NextResponse.json({ purchases: purchasesWithEmail });
    }

    if (type === "payments") {
      const { data: paymentsData } = await supabaseAdmin
        .from("manual_payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (!paymentsData) {
        return NextResponse.json({ payments: [] });
      }

      const paymentIds = paymentsData.map((p: any) => p.id);
      const { data: lastMessages } = await supabaseAdmin
        .from("payment_messages")
        .select("payment_id, content")
        .in("payment_id", paymentIds)
        .order("created_at", { ascending: false });

      const lastMsgMap = new Map();
      lastMessages?.forEach((msg: any) => {
        if (!lastMsgMap.has(msg.payment_id)) {
          lastMsgMap.set(msg.payment_id, msg.content);
        }
      });

      const paymentsWithLastMsg = paymentsData.map((payment: any) => ({
        ...payment,
        last_message: lastMsgMap.get(payment.id) || "",
      }));

      return NextResponse.json({ payments: paymentsWithLastMsg });
    }

    // Get messages for a purchase
    if (type === "purchase_messages") {
      const purchaseId = searchParams.get("purchaseId");
      if (!purchaseId) {
        return NextResponse.json({ messages: [] });
      }
      const { data } = await supabaseAdmin
        .from("purchase_messages")
        .select("*")
        .eq("purchase_id", purchaseId)
        .order("created_at", { ascending: true });
      return NextResponse.json({ messages: data || [] });
    }

    // Get messages for a payment
    if (type === "payment_messages") {
      const paymentId = searchParams.get("paymentId");
      if (!paymentId) {
        return NextResponse.json({ messages: [] });
      }
      const { data } = await supabaseAdmin
        .from("payment_messages")
        .select("*")
        .eq("payment_id", paymentId)
        .order("created_at", { ascending: true });
      return NextResponse.json({ messages: data || [] });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, purchaseId, paymentId, content } = body;

    const senderId = "admin";

    if (type === "purchase_message" && purchaseId) {
      const { data, error } = await supabaseAdmin
        .from("purchase_messages")
        .insert({
          purchase_id: purchaseId,
          sender_id: senderId,
          content: content,
        })
        .select()
        .single();

      if (error) {
        console.error("Insert error purchase:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    if (type === "payment_message" && paymentId) {
      const { data, error } = await supabaseAdmin
        .from("payment_messages")
        .insert({
          payment_id: paymentId,
          sender_id: senderId,
          content: content,
        })
        .select()
        .single();

      if (error) {
        console.error("Insert error payment:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal error", err: String(error) }, { status: 500 });
  }
}
