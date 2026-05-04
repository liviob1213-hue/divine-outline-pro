import { Moon, Sun, Bell, BellOff, LogOut } from "lucide-react";
import logoPregai from "@/assets/logo-palavraai-new.png";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useInAppNotifications } from "@/hooks/use-in-app-notifications";
import { useToast } from "@/hooks/use-toast";
import { promptPush, getPermission } from "@/lib/onesignal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription } from
"@/components/ui/dialog";

export default function Header() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return !document.documentElement.classList.contains("light");
    }
    return true;
  });

  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [permission, setPermission] = useState<string>(() => getPermission());
  const enabled = permission === "granted";
  const { notifications, unreadCount, markAllRead } = useInAppNotifications();
  const { toast } = useToast();

  useEffect(() => {
    const id = setInterval(() => setPermission(getPermission()), 2000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pregai_user_email");
    localStorage.removeItem("pregai_user_plan");
    localStorage.removeItem("pregai_login_time");
    localStorage.removeItem("pregai_session_token");
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

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifPanel(false);
      }
    };
    if (showNotifPanel) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifPanel]);

  const handleToggleNotification = async () => {
    if (enabled) {
      toast({ title: "Notificações já estão ativas", description: "Para desativar, use as configurações do navegador." });
      return;
    }

    if (permission === "denied") {
      setShowPermissionDialog(true);
      return;
    }

    if (!("Notification" in window)) {
      setShowPermissionDialog(true);
      return;
    }

    try {
      await promptPush();
      setTimeout(() => {
        const p = getPermission();
        setPermission(p);
        if (p === "granted") {
        toast({ title: "Notificações ativadas! 🔔", description: "Você receberá o versículo do dia às 8h." });
        } else if (p === "denied") {
          setShowPermissionDialog(true);
        }
      }, 800);
    } catch {
      setShowPermissionDialog(true);
    }
  };

  const handleBellClick = () => {
    setShowNotifPanel((prev) => {
      if (!prev) markAllRead();
      return !prev;
    });
  };

  return (
    <>
      <header className="flex items-center justify-between py-4 pt-[env(safe-area-inset-top,16px)]" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)' }}>
        <Link to="/" className="flex items-center gap-2">
          <img alt="Palavraai" className="w-20 h-20 drop-shadow-lg" src="/lovable-uploads/48d75f09-f246-4bb5-9bf9-741bbc84c175.png" />
          <span className="font-display font-bold text-xl text-foreground">
            Palavraai
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={isDark ? "Modo claro" : "Modo escuro"}>

            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notification bell with badge + dropdown */}
          <div className="relative" ref={notifRef}>
          <button
              onClick={handleBellClick}
              className={`p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors relative ${enabled ? "text-amber hover:bg-amber/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              title="Notificações">

              {enabled ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
              {unreadCount > 0 &&
              <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              }
            </button>

            {showNotifPanel &&
            <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-card border border-border rounded-xl shadow-xl z-50">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-foreground">Notificações</h3>
                  {!enabled &&
                <button
                  onClick={handleToggleNotification}
                  className="text-[10px] font-body font-semibold text-primary hover:underline">

                      Ativar Push
                    </button>
                }
                </div>
                {notifications.length === 0 ?
              <div className="p-6 text-center text-sm text-muted-foreground font-body">
                    Nenhuma notificação ainda.
                  </div> :

              notifications.map((n) =>
              <div key={n.id} className="p-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
                      <p className="text-xs font-body font-semibold text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground font-body mt-0.5 leading-relaxed">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground font-body mt-1">
                        {new Date(n.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
              )
              }
              </div>
            }
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Sair">

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
    </>);

}