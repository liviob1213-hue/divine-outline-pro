import { useState } from "react";
import { Download, Smartphone, Monitor, Share, MoreVertical, Plus, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type Platform = "ios" | "android" | null;

const iosSteps = [
  {
    browser: "Safari",
    icon: "🧭",
    steps: [
      { text: 'Abra o site no Safari', detail: 'O Safari é o único navegador que suporta instalação no iOS.' },
      { text: 'Toque no botão de Compartilhar', detail: 'É o ícone 📤 (quadrado com seta para cima) na barra inferior do Safari.' },
      { text: 'Role para baixo no menu', detail: 'Procure a opção "Adicionar à Tela de Início".' },
      { text: 'Toque em "Adicionar à Tela de Início"', detail: 'O ícone com o símbolo ➕ ao lado.' },
      { text: 'Toque em "Adicionar"', detail: 'O app será instalado na sua tela inicial como um ícone.' },
    ],
  },
  {
    browser: "Chrome (iOS)",
    icon: "🌐",
    steps: [
      { text: 'Abra o site no Chrome', detail: 'No Chrome do iOS, o processo é um pouco diferente.' },
      { text: 'Toque nos 3 pontinhos ⋯', detail: 'No canto inferior direito da tela.' },
      { text: 'Toque em "Compartilhar..."', detail: 'Vai abrir o menu de compartilhamento do sistema.' },
      { text: 'Toque em "Adicionar à Tela de Início"', detail: 'Role as opções até encontrar esta opção.' },
      { text: 'Toque em "Adicionar"', detail: 'Pronto! O app aparecerá na sua tela inicial.' },
    ],
  },
];

const androidSteps = [
  {
    browser: "Chrome (Android)",
    icon: "🌐",
    steps: [
      { text: 'Abra o site no Chrome', detail: 'O Google Chrome é o navegador recomendado.' },
      { text: 'Toque nos 3 pontinhos ⋮', detail: 'No canto superior direito da tela.' },
      { text: 'Toque em "Instalar aplicativo"', detail: 'Ou "Adicionar à tela inicial", dependendo da versão.' },
      { text: 'Confirme tocando em "Instalar"', detail: 'O app será baixado e instalado automaticamente.' },
    ],
  },
  {
    browser: "Samsung Internet",
    icon: "🔵",
    steps: [
      { text: 'Abra o site no Samsung Internet', detail: 'Navegador padrão dos celulares Samsung.' },
      { text: 'Toque no menu ☰', detail: 'Na barra inferior do navegador (3 linhas horizontais).' },
      { text: 'Toque em "Adicionar à tela inicial"', detail: 'Ou "+ Adicionar página a".' },
      { text: 'Selecione "Tela inicial"', detail: 'Confirme e o ícone aparecerá na sua tela.' },
    ],
  },
  {
    browser: "Firefox (Android)",
    icon: "🦊",
    steps: [
      { text: 'Abra o site no Firefox', detail: 'O Firefox também suporta PWAs no Android.' },
      { text: 'Toque nos 3 pontinhos ⋮', detail: 'No canto superior ou inferior direito.' },
      { text: 'Toque em "Instalar"', detail: 'Ou "Adicionar à tela inicial".' },
      { text: 'Confirme a instalação', detail: 'O app será adicionado à sua tela inicial.' },
    ],
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InstallGuideDialog({ open, onOpenChange }: Props) {
  const [platform, setPlatform] = useState<Platform>(null);
  const [selectedBrowser, setSelectedBrowser] = useState<number | null>(null);

  const handleClose = (val: boolean) => {
    if (!val) {
      setPlatform(null);
      setSelectedBrowser(null);
    }
    onOpenChange(val);
  };

  const steps = platform === "ios" ? iosSteps : platform === "android" ? androidSteps : [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Download className="w-5 h-5 text-primary" />
            Como instalar no celular
          </DialogTitle>
          <DialogDescription>
            Instale o app e acesse offline, direto da tela inicial.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!platform ? (
            <motion.div
              key="platform-select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3 pt-2"
            >
              <p className="text-sm font-body font-semibold text-foreground">Qual é o seu aparelho?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPlatform("ios")}
                  className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all"
                >
                  <span className="text-4xl">🍎</span>
                  <div className="text-center">
                    <p className="font-display font-bold text-sm text-foreground">iPhone / iPad</p>
                    <p className="text-[11px] text-muted-foreground font-body">iOS</p>
                  </div>
                </button>
                <button
                  onClick={() => setPlatform("android")}
                  className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all"
                >
                  <span className="text-4xl">🤖</span>
                  <div className="text-center">
                    <p className="font-display font-bold text-sm text-foreground">Android</p>
                    <p className="text-[11px] text-muted-foreground font-body">Samsung, Motorola...</p>
                  </div>
                </button>
              </div>
            </motion.div>
          ) : selectedBrowser === null ? (
            <motion.div
              key="browser-select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3 pt-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-body font-semibold text-foreground">
                  Qual navegador você usa?
                </p>
                <button
                  onClick={() => setPlatform(null)}
                  className="text-xs text-primary font-body font-semibold hover:underline"
                >
                  ← Voltar
                </button>
              </div>
              <div className="space-y-2">
                {steps.map((s, i) => (
                  <button
                    key={s.browser}
                    onClick={() => setSelectedBrowser(i)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary bg-card hover:bg-primary/5 transition-all text-left"
                  >
                    <span className="text-2xl">{s.icon}</span>
                    <span className="font-body font-semibold text-sm text-foreground flex-1">{s.browser}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="steps"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 pt-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-body font-semibold text-foreground flex items-center gap-2">
                  <span className="text-lg">{steps[selectedBrowser].icon}</span>
                  {steps[selectedBrowser].browser}
                </p>
                <button
                  onClick={() => setSelectedBrowser(null)}
                  className="text-xs text-primary font-body font-semibold hover:underline"
                >
                  ← Voltar
                </button>
              </div>

              <div className="space-y-3">
                {steps[selectedBrowser].steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-sm font-body font-semibold text-foreground">{step.text}</p>
                      <p className="text-xs text-muted-foreground font-body mt-0.5">{step.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-muted rounded-xl p-3 mt-2">
                <p className="text-xs text-muted-foreground font-body">
                  💡 <strong>Dica:</strong> Após instalar, o app abrirá em tela cheia, como um app nativo, e funcionará mesmo sem internet!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
