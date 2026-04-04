import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, CheckCircle, XCircle, Gift, Crown } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { supabase } from "@/integrations/supabase/client";

const WEBHOOK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kiwify-webhook`;

type TestEvent = "paid" | "refunded" | "cancelled" | "expired";

export default function WebhookTest() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Array<{ event: string; plan: string; success: boolean; response: string }>>([]);
  const { toast } = useToast();

  const sendWebhook = async (event: TestEvent, plan: "monthly" | "annual") => {
    if (!email.trim()) {
      toast({ title: "Digite um email", variant: "destructive" });
      return;
    }

    const key = `${event}-${plan}`;
    setLoading(key);

    const payload = {
      order_status: event,
      Customer: { email: email.trim().toLowerCase() },
      Product: { name: plan === "annual" ? "Palavraai Anual" : "Palavraai Mensal" },
      order_id: `test-${Date.now()}`,
      subscription_id: `sub-test-${Date.now()}`,
    };

    try {
      const resp = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      const success = resp.ok;

      setResults((prev) => [
        { event, plan, success, response: JSON.stringify(data) },
        ...prev,
      ]);

      toast({
        title: success ? "Webhook enviado ✅" : "Erro no webhook ❌",
        description: `${event} - ${plan}: ${data.status || data.error}`,
      });
    } catch (err) {
      setResults((prev) => [
        { event, plan, success: false, response: String(err) },
        ...prev,
      ]);
    } finally {
      setLoading(null);
    }
  };

  const grantAccess = async (type: "free-month" | "lifetime") => {
    if (!email.trim()) {
      toast({ title: "Digite um email", variant: "destructive" });
      return;
    }

    const key = `grant-${type}`;
    setLoading(key);

    try {
      const now = new Date();
      const expiresAt = type === "lifetime"
        ? "2099-12-31T23:59:59Z"
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const plan = type === "lifetime" ? "lifetime" : "monthly";

      const { error } = await supabase
        .from("subscriptions")
        .upsert(
          {
            email: email.trim().toLowerCase(),
            status: "active",
            plan,
            started_at: now.toISOString(),
            expires_at: expiresAt,
            updated_at: now.toISOString(),
            cancelled_at: null,
          },
          { onConflict: "email" }
        );

      if (error) throw error;

      const label = type === "lifetime" ? "Acesso Vitalício" : "1 Mês Grátis";
      setResults((prev) => [
        { event: label, plan, success: true, response: `Acesso concedido até ${new Date(expiresAt).toLocaleDateString("pt-BR")}` },
        ...prev,
      ]);

      toast({
        title: "Acesso concedido ✅",
        description: `${label} ativado para ${email.trim().toLowerCase()}`,
      });
    } catch (err: any) {
      setResults((prev) => [
        { event: `grant-${type}`, plan: type, success: false, response: err.message || String(err) },
        ...prev,
      ]);
      toast({ title: "Erro ao conceder acesso", description: String(err.message), variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const events: { event: TestEvent; label: string; color: string }[] = [
    { event: "paid", label: "Pagamento Aprovado", color: "bg-green-600 hover:bg-green-700" },
    { event: "refunded", label: "Reembolso", color: "bg-destructive hover:bg-destructive/90" },
    { event: "cancelled", label: "Cancelamento", color: "bg-orange-600 hover:bg-orange-700" },
    { event: "expired", label: "Expirado", color: "bg-muted-foreground hover:bg-muted-foreground/80" },
  ];

  return (
    <div className="min-h-screen bg-background animated-bg relative">
      <AnimatedBackground />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">🧪 Teste de Webhook Kiwify</h1>
        <p className="text-muted-foreground mb-6">Simule eventos da Kiwify para testar o controle de assinaturas.</p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Email do Cliente</CardTitle>
            <CardDescription>Email que receberá o evento simulado</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="email"
              placeholder="cliente@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Plano Mensal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📅 Plano Mensal</CardTitle>
              <CardDescription>Simular eventos para assinatura mensal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {events.map(({ event, label, color }) => (
                <Button
                  key={`monthly-${event}`}
                  onClick={() => sendWebhook(event, "monthly")}
                  disabled={loading !== null}
                  className={`w-full justify-start ${color} text-white`}
                >
                  {loading === `${event}-monthly` ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Plano Anual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📆 Plano Anual</CardTitle>
              <CardDescription>Simular eventos para assinatura anual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {events.map(({ event, label, color }) => (
                <Button
                  key={`annual-${event}`}
                  onClick={() => sendWebhook(event, "annual")}
                  disabled={loading !== null}
                  className={`w-full justify-start ${color} text-white`}
                >
                  {loading === `${event}-annual` ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Conceder Acesso */}
        <Card className="mb-6 border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">🎁 Conceder Acesso</CardTitle>
            <CardDescription>Conceda acesso gratuito diretamente no banco de dados</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => grantAccess("free-month")}
              disabled={loading !== null}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading === "grant-free-month" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Gift className="w-4 h-4 mr-2" />
              )}
              1 Mês Grátis
            </Button>
            <Button
              onClick={() => grantAccess("lifetime")}
              disabled={loading !== null}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {loading === "grant-lifetime" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Crown className="w-4 h-4 mr-2" />
              )}
              Acesso Vitalício
            </Button>
          </CardContent>
        </Card>


        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📋 Log de Resultados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 p-2 rounded-lg text-sm ${
                    r.success ? "bg-green-500/10" : "bg-destructive/10"
                  }`}
                >
                  {r.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  )}
                  <div>
                    <span className="font-medium text-foreground">
                      {r.event} ({r.plan})
                    </span>
                    <p className="text-muted-foreground text-xs break-all">{r.response}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
