import { Moon, Sun, Bell, BellOff, LogOut } from "lucide-react";
import logoPregai from "@/assets/logo-pregai.png";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Header() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return !document.documentElement.classList.contains("light");
    }
    return true;
  });

  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const { permission, enabled, requestPermission, disableNotifications } = useNotifications();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("pregai_user_email");
    localStorage.removeItem("pregai_user_plan");
    localStorage.removeItem("pregai_login_time");
    navigate("/login");
  };

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
      return;
    }

    // If already denied, show instructions dialog
    if (permission === "denied") {
      setShowPermissionDialog(true);
      return;
    }

    // Check if Notification API exists
    if (!("Notification" in window)) {
      setShowPermissionDialog(true);
      return;
    }

    try {
      const result = await requestPermission();
      if (result === "granted") {
        toast({ title: "Notificações ativadas! 🔔", description: "Você receberá o versículo do dia às 8h." });
      } else if (result === "denied") {
        setShowPermissionDialog(true);
      } else {
        setShowPermissionDialog(true);
      }
    } catch {
      setShowPermissionDialog(true);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoPregai} alt="PregAI" className="w-9 h-9 drop-shadow-lg" />
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
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber" />
              Ativar Notificações
            </DialogTitle>
            <DialogDescription className="text-left space-y-3 pt-2">
              <p>Para receber o versículo do dia às 8h, você precisa permitir as notificações no navegador.</p>
              
              <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
                <p className="font-medium text-foreground">📱 No celular:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Abra o app publicado (não o preview)</li>
                  <li>Toque no ícone do sino 🔔</li>
                  <li>Permita as notificações no popup</li>
                </ol>
              </div>

              <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
                <p className="font-medium text-foreground">💻 No desktop:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Clique no cadeado 🔒 na barra de endereço</li>
                  <li>Encontre "Notificações"</li>
                  <li>Altere para "Permitir"</li>
                  <li>Recarregue a página</li>
                </ol>
              </div>

              <p className="text-xs text-muted-foreground italic">
                ⚠️ Notificações não funcionam dentro do modo preview do Lovable. Use a versão publicada do app.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
