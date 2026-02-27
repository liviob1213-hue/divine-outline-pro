import { BookOpen, Moon, Sun, Bell, BellOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return !document.documentElement.classList.contains("light");
    }
    return true;
  });

  const { enabled, requestPermission, disableNotifications } = useNotifications();
  const { toast } = useToast();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setIsDark(false);
    }
  }, []);

  const handleToggleNotification = async () => {
    if (enabled) {
      disableNotifications();
      toast({ title: "Notificações desativadas", description: "Você não receberá mais o versículo diário." });
    } else {
      const result = await requestPermission();
      if (result === "granted") {
        toast({ title: "Notificações ativadas! 🔔", description: "Você receberá o versículo do dia às 8h." });
      } else if (result === "denied") {
        toast({
          title: "Permissão negada",
          description: "Ative as notificações nas configurações do navegador.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Notificações não suportadas",
          description: "Seu navegador não suporta notificações push.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <header className="flex items-center justify-between py-4">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-gold" style={{ background: "var(--gradient-gold)" }}>
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-lg text-foreground">
          PregAI
        </span>
      </Link>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title={isDark ? "Modo claro" : "Modo escuro"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={handleToggleNotification}
          className={`p-2 rounded-lg transition-colors ${enabled ? "text-amber hover:bg-amber/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
          title={enabled ? "Desativar notificações" : "Ativar notificações diárias"}
        >
          {enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
