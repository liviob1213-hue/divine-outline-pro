import { useState, useEffect } from "react";
import { ArrowLeft, Download, Smartphone, CheckCircle, WifiOff, Wifi } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { isOnline, onNetworkChange, getAllCachedHinosCount } from "@/lib/offline-cache";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [online, setOnline] = useState(isOnline());
  const [cachedHinos, setCachedHinos] = useState(0);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => setInstalled(true));

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    return onNetworkChange(setOnline);
  }, []);

  useEffect(() => {
    getAllCachedHinosCount().then(setCachedHinos).catch(() => {});
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Instalar App
            </h1>
            <p className="text-xs text-muted-foreground font-body">Funciona offline no seu celular</p>
          </div>
        </div>

        {/* Status Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 border border-border shadow-card mb-4">
          <div className="flex items-center gap-3 mb-4">
            {online ? (
              <Wifi className="w-5 h-5 text-green-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-amber-400" />
            )}
            <div>
              <p className="text-sm font-body font-bold text-foreground">
                {online ? "Conectado" : "Modo Offline"}
              </p>
              <p className="text-xs text-muted-foreground font-body">
                {cachedHinos > 0 ? `${cachedHinos} hinos salvos offline` : "Busque hinos para salvá-los offline"}
              </p>
            </div>
          </div>

          {installed ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-body font-bold">App instalado!</span>
            </div>
          ) : deferredPrompt ? (
            <button
              onClick={handleInstall}
              className="w-full py-3 rounded-xl bg-gradient-gold text-primary-foreground font-body font-bold text-sm shadow-gold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Instalar PregAI
            </button>
          ) : (
            <div className="space-y-3">
              {isIOS ? (
                <div className="text-sm font-body text-foreground/90 space-y-2">
                  <p className="font-bold">📱 Para instalar no iPhone/iPad:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                    <li>Toque no botão <strong>Compartilhar</strong> (📤) no Safari</li>
                    <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></li>
                    <li>Toque em <strong>"Adicionar"</strong></li>
                  </ol>
                </div>
              ) : (
                <div className="text-sm font-body text-foreground/90 space-y-2">
                  <p className="font-bold">📱 Para instalar no Android:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                    <li>Toque no menu (⋮) do navegador</li>
                    <li>Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong></li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
          <h2 className="text-xs font-body font-bold uppercase tracking-widest text-muted-foreground">
            Funcionalidades offline
          </h2>
          {[
            { icon: "🎵", title: "Harpa Cristã", desc: "Hinos buscados ficam salvos para acesso sem internet" },
            { icon: "📖", title: "Bíblia Sagrada", desc: "Capítulos lidos são salvos automaticamente offline" },
            { icon: "⚡", title: "Acesso Rápido", desc: "App abre instantaneamente, como um app nativo" },
            { icon: "🔔", title: "Tela Inicial", desc: "Ícone na tela inicial do seu celular" },
          ].map((f) => (
            <div key={f.title} className="bg-card rounded-xl p-4 border border-border flex items-start gap-3">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <h3 className="font-display font-bold text-sm text-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground font-body">{f.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
}
