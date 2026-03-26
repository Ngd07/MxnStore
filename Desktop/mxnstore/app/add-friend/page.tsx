"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, Check, Copy, Users, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FNLB_API_KEY = "FNLB_aabkryf_F7p6Njy0wM8pqFJc01jihxpguFdd1NyBypcfVghqpkMAr6QJeEo.IITFUC8Gou11lHy9G76gEg";

const BOT_ACCOUNTS = [
  { id: "69b5ad49e16d2b234013a1f0", displayName: "MXNstore0" },
  { id: "69a6e589d2065d82e11e37f9", displayName: "MXNstore1" },
  { id: "69aa1d2a53c0a4720a29c1ce", displayName: "MXNstore2" },
  { id: "69aa0f1653c0a4720a29c07b", displayName: "MXNstore3" },
  { id: "69aa1cc8bd2753d5f07114f5", displayName: "MXNstore4" },
  { id: "69aa1d93c5629f92b0717283", displayName: "MXNstore5" },
  { id: "69aa1e00bd2753d5f0711526", displayName: "MXNstore6" },
  { id: "69aa1e59c5629f92b071729e", displayName: "MXNstore7" },
  { id: "69aa1ead53c0a4720a29c200", displayName: "MXNstore8" },
  { id: "69b7215860f8dfa5f7ccaf62", displayName: "MXNstore10" },
  { id: "69c5753e54e0b42d630db0c3", displayName: "MXNstore11" },
  { id: "69c574c568f43ff2b770531a", displayName: "MXNstore12" },
];

const sendFriendRequest = async (targetEpicId: string): Promise<{ success: boolean; errorCount: number }> => {
  const promises = BOT_ACCOUNTS.map(async (bot): Promise<number> => {
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
      
      return response.ok ? 0 : 1;
    } catch (e) {
      console.error(`Error adding friend to bot ${bot.id}:`, e);
      return 1;
    }
  });

  const results = await Promise.all(promises);
  const errorCount = results.reduce((sum, r) => sum + r, 0);
  
  return { success: errorCount === 0, errorCount };
};

export default function AgregarAmigoPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [epicId, setEpicId] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    const processPendingRequests = async () => {
      if (!user) return;
      
      setProcessing(true);
      
      const { data: pendingRequests } = await supabase
        .from("pending_friend_requests")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      
      if (pendingRequests && pendingRequests.length > 0) {
        for (const request of pendingRequests) {
          const result = await sendFriendRequest(request.epic_id);
          
          if (result.success) {
            await supabase
              .from("pending_friend_requests")
              .update({ status: "completed", updated_at: new Date().toISOString() })
              .eq("id", request.id);
              
            setMessage(t("profile.friendRequestSent", { username: request.epic_id }));
            setMessageType("success");
          } else if (result.errorCount === BOT_ACCOUNTS.length) {
            await supabase
              .from("pending_friend_requests")
              .update({ attempts: request.attempts + 1, updated_at: new Date().toISOString() })
              .eq("id", request.id);
          }
        }
      }
      
      setProcessing(false);
    };

    if (user) {
      processPendingRequests();
    }
  }, [user, t]);

  const handleSaveAndAdd = async () => {
    if (!epicId.trim()) {
      setMessage(t("profile.epicIdRequired"));
      setMessageType("error");
      return;
    }

    if (!user) return;

    setLoading(true);
    setMessage("");

    try {
      const { error: upsertError } = await supabase
        .from("user_profiles")
        .upsert({
          user_id: user.id,
          epic_id: epicId.trim(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (upsertError) throw upsertError;

      const result = await sendFriendRequest(epicId.trim());
      
      if (result.errorCount === 0) {
        setMessage(t("profile.friendRequestSent", { username: epicId.trim() }));
        setMessageType("success");
      } else {
        const { error: insertError } = await supabase
          .from("pending_friend_requests")
          .insert({
            user_id: user.id,
            epic_id: epicId.trim(),
            status: "pending",
            attempts: 1,
          });
        
        if (insertError) {
          console.error("Error saving pending request:", insertError);
          setMessage(t("profile.errorSaving"));
          setMessageType("error");
        } else {
          setMessage(t("profile.requestSaved") || "Solicitud guardada. Se enviara cuando los bots esten activos.");
          setMessageType("success");
        }
      }

    } catch (err) {
      console.error(err);
      setMessage(t("profile.errorSaving") || "Error al guardar");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="mb-4 sm:mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-blue-500/20">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                {t("profile.addFriendTitle")}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("profile.addFriendDesc")}
              </p>
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t("profile.epicId")}
            </label>
            <Input
              type="text"
              placeholder={t("profile.epicIdPlaceholder")}
              value={epicId}
              onChange={(e) => setEpicId(e.target.value)}
              className="bg-secondary text-foreground border-border"
            />
          </div>

          {message && (
            <div
              className={`mb-4 rounded-lg p-3 text-sm ${
                messageType === "success"
                  ? "bg-green-500/20 text-green-500"
                  : "bg-red-500/20 text-red-500"
              }`}
            >
              {message}
            </div>
          )}

          <Button
            onClick={handleSaveAndAdd}
            disabled={loading || !epicId.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              t("profile.saving")
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {t("profile.saveAndAdd")}
              </>
            )}
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="mb-2 sm:mb-4 text-base sm:text-lg font-semibold text-foreground">
            {t("profile.ourAccounts")}
          </h2>
          <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">
            {t("profile.ourAccountsDesc")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BOT_ACCOUNTS.map((bot) => (
              <div
                key={bot.id}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-2 sm:p-3"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                    <User className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-foreground truncate">{bot.displayName}</span>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(bot.displayName)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground shrink-0 ml-2 px-2 py-1"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-yellow-500/10 p-3 sm:p-4 border border-yellow-500/30">
          <p className="text-xs sm:text-sm text-yellow-500">
            {locale === "es" ? t("profile.helpTextEs") : locale === "en" ? t("profile.helpTextEn") : locale === "de" ? t("profile.helpTextDe") : t("profile.helpTextRu")}
          </p>
        </div>
      </div>
    </div>
  );
}
