import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { promptPush, getPermission, getSubscriptionId } from "@/lib/onesignal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function OneSignalButton() {
  const [permission, setPermission] = useState<string>(() => getPermission());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => setPermission(getPermission()), 2000);
    return () => clearInterval(interval);
  }, []);

  const isActive = permission === "granted";

  const handleClick = async () => {
    setLoading(true);
    try {
      await promptPush();
      const subscriptionId = await getSubscriptionId();
      const p = getPermission();
      setPermission(p);
      if (p === "granted" && subscriptionId) {
        try {
          await supabase.functions.invoke("send-welcome-push", { body: { subscriptionId } });
        } catch (e) {
          console.error("[welcome-push] invoke error", e);
        }
        toast({ title: "Notificações ativadas! 🔔", description: "Enviamos um push de confirmação." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading || isActive}
      size="lg"
      className={`gap-2 font-display font-semibold shadow-lg transition-all ${
        isActive
          ? "bg-emerald-600 hover:bg-emerald-600 text-white"
          : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:scale-[1.02]"
      }`}
    >
      {isActive ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5 animate-pulse" />}
      {isActive ? "Notificações Ativas" : "Ativar Notificações Diárias"}
    </Button>
  );
}