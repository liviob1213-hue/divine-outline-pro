import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Share2, Bell, BellOff, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";

interface DailyVerse {
  date: string;
  text: string;
  reference: string;
  book: string;
  chapter: number;
  verse: number;
}

const CACHE_KEY = "pregai_daily_verse";

export default function VersiculoDoDia() {
  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const { permission, enabled, requestPermission, disableNotifications, checkAndNotify } =
    useNotifications();
  const { toast } = useToast();

  const fetchVerse = async () => {
    setLoading(true);
    try {
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as DailyVerse;
        const today = new Date();
        const brt = new Date(today.getTime() - 3 * 60 * 60 * 1000);
        const todayStr = brt.toISOString().split("T")[0];
        if (parsed.date === todayStr) {
          setVerse(parsed);
          setLoading(false);
          // Trigger notification check with cached verse
          checkAndNotify(parsed.text, parsed.reference);
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke("daily-verse", {
        body: {},
      });

      if (error) throw error;

      setVerse(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));

      // Check if we should show notification
      if (data) {
        checkAndNotify(data.text, data.reference);
      }
    } catch (e) {
      console.error("Failed to load daily verse:", e);
      // Try to use cached verse even if outdated
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) setVerse(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerse();
  }, []);

  const handleShare = async () => {
    if (!verse) return;

    const shareText = `📖 Versículo do Dia\n\n"${verse.text}"\n\n— ${verse.reference}\n\nvia PregAI`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Versículo do Dia — PregAI",
          text: shareText,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copiado!",
        description: "Versículo copiado para a área de transferência.",
      });
    }
  };

  const handleToggleNotification = async () => {
    if (enabled) {
      disableNotifications();
      toast({ title: "Notificações desativadas", description: "Você não receberá mais o versículo diário." });
    } else {
      const result = await requestPermission();
      if (result === "granted") {
        toast({ title: "Notificações ativadas! 🔔", description: "Você receberá o versículo do dia às 8h da manhã." });
        if (verse) checkAndNotify(verse.text, verse.reference);
      } else if (result === "denied") {
        toast({
          title: "Permissão negada",
          description: "Ative as notificações nas configurações do navegador.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber" />
          <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] text-foreground">
            Versículo do Dia
          </h2>
        </div>
        <button
          onClick={handleToggleNotification}
          className="p-2 rounded-full transition-colors hover:bg-muted"
          title={enabled ? "Desativar notificações" : "Ativar notificações diárias"}
        >
          {enabled ? (
            <Bell className="w-4 h-4 text-amber" />
          ) : (
            <BellOff className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl bg-card border border-border p-5"
          >
            <div className="h-4 bg-muted rounded w-3/4 mb-3 animate-pulse" />
            <div className="h-4 bg-muted rounded w-full mb-2 animate-pulse" />
            <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
          </motion.div>
        ) : verse ? (
          <motion.div
            key="verse"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-xl overflow-hidden"
          >
            {/* Gradient background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{ background: "var(--gradient-card-amber)" }}
            />
            <div className="relative bg-card/80 backdrop-blur-sm border border-border rounded-xl p-5">
              {/* Quote */}
              <div className="mb-4">
                <span className="text-3xl leading-none text-amber opacity-40 font-[family-name:var(--font-display)]">
                  "
                </span>
                <p className="text-foreground/90 text-[15px] leading-relaxed -mt-4 pl-5 pr-2">
                  {verse.text}
                </p>
              </div>

              {/* Reference + Actions */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber">
                  — {verse.reference}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber/10 hover:bg-amber/20 text-amber text-xs font-medium transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Compartilhar
                  </button>
                </div>
              </div>

              {/* Meditation hint */}
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground italic">
                  🕊️ Medite neste versículo hoje. Deixe a Palavra de Deus transformar seu dia.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl bg-card border border-border p-5 text-center"
          >
            <p className="text-muted-foreground text-sm">
              Não foi possível carregar o versículo do dia.
            </p>
            <button
              onClick={fetchVerse}
              className="mt-2 text-xs text-primary flex items-center gap-1 mx-auto"
            >
              <RefreshCw className="w-3 h-3" /> Tentar novamente
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
