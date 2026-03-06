import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FNLB_API_KEY = process.env.FNLB_API_KEY || "FNLB_aabkryf_F7p6Njy0wM8pqFJc01jihxpguFdd1NyBypcfVghqpkMAr6QJeEo.IITFUC8Gou11lHy9G76gEg";

const BOT_ACCOUNTS = [
  { id: "69a6e589d2065d82e11e37f9", displayName: "MXNstore1" },
  { id: "69aa1d2a53c0a4720a29c1ce", displayName: "MXNstore2" },
  { id: "69aa0f1653c0a4720a29c07b", displayName: "MXNstore3" },
  { id: "69aa1cc8bd2753d5f07114f5", displayName: "MXNstore4" },
  { id: "69aa1d93c5629f92b0717283", displayName: "MXNstore5" },
  { id: "69aa1e00bd2753d5f0711526", displayName: "MXNstore6" },
  { id: "69aa1e59c5629f92b071729e", displayName: "MXNstore7" },
  { id: "69aa1ead53c0a4720a29c200", displayName: "MXNstore8" },
];

const sendFriendRequest = async (targetEpicId: string): Promise<{ success: boolean; errorCount: number }> => {
  let errorCount = 0;
  
  for (const bot of BOT_ACCOUNTS) {
    try {
      const response = await fetch(`https://api.fnlb.net/v1/bots/${bot.id}/commands/run/`, {
        method: "POST",
        headers: {
          "Authorization": FNLB_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command: "add-friend",
          args: targetEpicId,
        }),
      });
      
      if (!response.ok) {
        errorCount++;
      }
    } catch (e) {
      console.error(`Error adding friend to bot ${bot.id}:`, e);
      errorCount++;
    }
  }
  
  return { success: errorCount === 0, errorCount };
};

export async function POST() {
  return processRequests();
}

export async function GET() {
  return processRequests();
}

async function processRequests() {
  try {
    const pendingRequests = await supabase
      .from("pending_friend_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (!pendingRequests.data || pendingRequests.data.length === 0) {
      return NextResponse.json({ message: "No pending requests", processed: 0 });
    }

    let processed = 0;

    for (const req of pendingRequests.data) {
      const result = await sendFriendRequest(req.epic_id);
      
      if (result.success) {
        await supabase
          .from("pending_friend_requests")
          .update({ status: "completed", updated_at: new Date().toISOString() })
          .eq("id", req.id);
        
        processed++;
      } else if (result.errorCount === BOT_ACCOUNTS.length) {
        await supabase
          .from("pending_friend_requests")
          .update({ 
            attempts: req.attempts + 1, 
            updated_at: new Date().toISOString() 
          })
          .eq("id", req.id);
      }
    }

    return NextResponse.json({ 
      message: "Processed pending requests", 
      processed,
      total: pendingRequests.data.length 
    });

  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
