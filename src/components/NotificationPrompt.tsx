import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PROMPT_KEY = "pregai_notif_prompt_dismissed";

export default function NotificationPrompt() {
  const [open, setOpen] = useState(false);
  const { permission, enabled, requestPermission } = useNotifications();
  const { toast } = useToast();

  useEffect(() => {
    // Don't show if already enabled, already denied permanently, or already dismissed
    if (enabled) return;
    if (permission === "denied") return;
    if (localStorage.getItem(PROMPT_KEY)) return;

    // On iOS, push only works in installed PWA (iOS 16.4+)
    // Check if PushManager is available
    if (!("PushManager" in window) || !("Notification" in window)) {
      // Don't show the prompt if push isn't supported
      return;
    }

    // Small delay so the page loads first
    const timer = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(timer);
  }, [enabled, permission]);

  const handleAllow = async () => {
    // Always mark as dismissed so it doesn't keep reappearing
    localStorage.setItem(PROMPT_KEY, "1");
    
    try {
      const result = await requestPermission();
      if (result === "granted") {
        toast({
          title: "Notificações ativadas! 🔔",
          description: "Você receberá o versículo do dia às 8h.",
        });
      } else if (result === "denied") {
        toast({
          title: "Notificações bloqueadas",
          description: "Você pode ativar depois nas configurações do navegador.",
          variant: "destructive",
        });
      }
    } catch {
      // silently fail
    }
    setOpen(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(PROMPT_KEY, "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-6 h-6 text-amber" />
            Receba o Versículo do Dia
          </DialogTitle>
          <DialogDescription className="text-left space-y-3 pt-2">
            <p>
              Ative as notificações para receber um versículo bíblico inspirador
              todos os dias às <strong>8h da manhã</strong>. 🙏
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-2">
          <Button onClick={handleAllow} className="w-full">
            Ativar Notificações 🔔
          </Button>
          <Button variant="ghost" onClick={handleDismiss} className="w-full text-muted-foreground">
            Agora não
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
