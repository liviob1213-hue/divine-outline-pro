import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AnimatedBackground from "@/components/AnimatedBackground";
const logoPregai = "/logo-palavraai.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Digite seu email", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = email.toLowerCase().trim();

      // Check subscription status
      const { data, error } = await supabase
        .from("subscriptions")
        .select("status, plan, expires_at")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (error) {
        toast({ title: "Erro ao verificar assinatura", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      if (!data) {
        toast({
          title: "Email não encontrado",
          description: "Este email não possui uma assinatura ativa. Adquira seu acesso na Kiwify.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (data.status !== "active") {
        const statusMessages: Record<string, string> = {
          cancelled: "Sua assinatura foi cancelada. Renove para continuar acessando.",
          refunded: "Sua assinatura foi reembolsada. Adquira novamente para acessar.",
          inactive: "Sua assinatura expirou. Renove para continuar acessando.",
        };
        toast({
          title: "Assinatura inativa",
          description: statusMessages[data.status] || "Sua assinatura não está ativa.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast({
          title: "Assinatura expirada",
          description: "Sua assinatura expirou. Renove para continuar acessando.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Generate unique session token
      const sessionToken = crypto.randomUUID();

      // Upsert session — replaces any existing session for this email
      const { error: sessionError } = await supabase
        .from("user_sessions")
        .upsert(
          { email: normalizedEmail, session_token: sessionToken },
          { onConflict: "email" }
        );

      if (sessionError) {
        console.error("Session error:", sessionError);
      }

      // Save session locally
      localStorage.setItem("pregai_user_email", normalizedEmail);
      localStorage.setItem("pregai_user_plan", data.plan);
      localStorage.setItem("pregai_login_time", new Date().toISOString());
      localStorage.setItem("pregai_session_token", sessionToken);

      toast({ title: "Bem-vindo ao Palavraai! 🎉" });
      navigate("/");
    } catch {
      toast({ title: "Erro inesperado", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background animated-bg relative flex items-center justify-center px-4">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoPregai} alt="Palavraai Logo" className="w-44 h-44 md:w-52 md:h-52 mx-auto mb-4 drop-shadow-2xl" />
          <h1 className="font-display text-3xl font-bold text-foreground">Palavraai</h1>
          <p className="text-muted-foreground mt-2">Ferramentas inteligentes para pastores</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h2 className="font-display text-xl font-semibold text-foreground mb-1">Entrar</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Use o email da sua compra na Kiwify
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
                autoComplete="email"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold" style={{ background: "var(--gradient-gold)" }}>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Acessar Ferramenta
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Ainda não tem acesso?{" "}
            <a href="https://kiwify.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Adquira aqui
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
