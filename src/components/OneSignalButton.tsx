import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { promptPush, getPermission } from "@/lib/onesignal";
import { useToast } from "@/hooks/use-toast";

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
      setTimeout(() => {
        const p = getPermission();
        setPermission(p);
        if (p === "granted") {
          toast({ title: "Notificações ativadas! 🔔", description: "Você receberá o versículo do dia." });
        }
      }, 800);
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