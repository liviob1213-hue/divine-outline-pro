import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const email = localStorage.getItem("pregai_user_email");
      const sessionToken = localStorage.getItem("pregai_session_token");

      if (!email || !sessionToken) {
        setStatus("unauthenticated");
        return;
      }

      try {
        // Check subscription
        const { data } = await supabase
          .from("subscriptions")
          .select("status, expires_at")
          .eq("email", email)
          .maybeSingle();

        if (!data || data.status !== "active") {
          clearSession();
          setStatus("unauthenticated");
          return;
        }

        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          clearSession();
          setStatus("unauthenticated");
          return;
        }

        // Check if session is still the active one (single-session enforcement)
        const { data: session } = await supabase
          .from("user_sessions")
          .select("session_token")
          .eq("email", email)
          .maybeSingle();

        if (!session || session.session_token !== sessionToken) {
          clearSession();
          toast({
            title: "Sessão encerrada",
            description: "Seu acesso foi iniciado em outro dispositivo. Apenas um acesso por vez é permitido.",
            variant: "destructive",
          });
          setStatus("unauthenticated");
          return;
        }

        setStatus("authenticated");
      } catch {
        setStatus("unauthenticated");
      }
    };

    checkAuth();

    // Re-check session every 30 seconds
    const interval = setInterval(checkAuth, 30000);
    return () => clearInterval(interval);
  }, [toast]);

  const clearSession = () => {
    localStorage.removeItem("pregai_user_email");
    localStorage.removeItem("pregai_user_plan");
    localStorage.removeItem("pregai_session_token");
    localStorage.removeItem("pregai_login_time");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Verificando acesso...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
