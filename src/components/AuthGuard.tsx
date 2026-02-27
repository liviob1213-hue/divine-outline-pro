import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    const checkAuth = async () => {
      const email = localStorage.getItem("pregai_user_email");
      if (!email) {
        setStatus("unauthenticated");
        return;
      }

      try {
        const { data } = await supabase
          .from("subscriptions")
          .select("status, expires_at")
          .eq("email", email)
          .maybeSingle();

        if (!data || data.status !== "active") {
          localStorage.removeItem("pregai_user_email");
          localStorage.removeItem("pregai_user_plan");
          setStatus("unauthenticated");
          return;
        }

        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          localStorage.removeItem("pregai_user_email");
          localStorage.removeItem("pregai_user_plan");
          setStatus("unauthenticated");
          return;
        }

        setStatus("authenticated");
      } catch {
        setStatus("unauthenticated");
      }
    };

    checkAuth();
  }, []);

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
