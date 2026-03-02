import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen, Sparkles, Music, Heart, NotebookPen, Languages,
  BookMarked, MessageCircle, FileText, FolderOpen, GraduationCap,
  CheckCircle2, XCircle, ArrowRight, Star, Shield, Clock, Zap,
  Users, Crown, ChevronDown } from
"lucide-react";
import { Button } from "@/components/ui/button";
const logoPregai = "/logo-palavraai.png";

// ─── Countdown Timer ───────────────────────────────
function useCountdown(minutes: number) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const end = Date.now() + minutes * 60 * 1000;
    return minutes * 60 * 1000;
  });

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1000;
        return next > 0 ? next : 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft > 0]);

  const h = Math.floor(timeLeft / 3600000);
  const m = Math.floor(timeLeft % 3600000 / 60000);
  const s = Math.floor(timeLeft % 60000 / 1000);
  return { h, m, s, expired: timeLeft <= 0 };
}

// ─── Data ──────────────────────────────────────────
const features = [
{ icon: BookOpen, title: "Bíblia em 13 Versões", desc: "ARC, ARA, NVI, KJV, NVT e muito mais — tudo offline e instantâneo." },
{ icon: Sparkles, title: "Criador de Esboços com IA", desc: "Gere sermões completos com +35 análises teológicas em segundos." },
{ icon: Music, title: "Harpa Cristã Completa", desc: "640 hinos com busca por número, título ou trecho da letra." },
{ icon: Heart, title: "Versículos Favoritos", desc: "Salve e organize seus versículos preferidos para acesso rápido." },
{ icon: NotebookPen, title: "Anotações Pessoais", desc: "Seus estudos organizados — nunca mais perca uma reflexão." },
{ icon: Languages, title: "Dicionário Bíblico", desc: "Significados originais em hebraico e grego com contexto histórico." },
{ icon: BookMarked, title: "Enciclopédia Judaica", desc: "Tradições, cultura e história para pregações com profundidade." },
{ icon: MessageCircle, title: "Chat Teológico com IA", desc: "Tire dúvidas teológicas com um agente especialista 24h." },
{ icon: FileText, title: "Banco de Temas", desc: "+200 temas prontos organizados para suas pregações." },
{ icon: FolderOpen, title: "Materiais do Pregador", desc: "Armazene e organize imagens, vídeos e documentos." },
{ icon: GraduationCap, title: "Curso de Teologia", desc: "31 módulos com flashcards, quiz e estudo aprofundado." }];

// ─── Social Proof Names ───────────────────────────
const socialProofNames = [
"Lucas M.", "Ana P.", "Carlos R.", "Fernanda S.", "João V.",
"Maria L.", "Pedro H.", "Juliana C.", "Rafael A.", "Beatriz F.",
"Daniel O.", "Priscila N.", "Thiago B.", "Camila D.", "André G.",
"Patricia M.", "Marcos T.", "Renata K.", "Samuel J.", "Débora E."];

const socialProofPlans = ["Mensal", "Anual", "Vitalício"];
const socialProofCities = [
"São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG",
"Salvador, BA", "Curitiba, PR", "Fortaleza, CE", "Recife, PE",
"Manaus, AM", "Goiânia, GO", "Brasília, DF"];



const comparison = [
{ feature: "Versões da Bíblia", us: "13 versões", them: "6 versões" },
{ feature: "Criador de Esboços com IA", us: true, them: false },
{ feature: "Chat Teológico com IA", us: true, them: false },
{ feature: "Dicionário Bíblico Completo", us: true, them: "Limitado" },
{ feature: "Enciclopédia Judaica", us: true, them: false },
{ feature: "Harpa Cristã (640 hinos)", us: true, them: false },
{ feature: "Curso de Teologia (31 módulos)", us: true, them: false },
{ feature: "Banco de Temas para Pregação", us: true, them: false },
{ feature: "Materiais do Pregador", us: true, them: false },
{ feature: "Anotações e Favoritos", us: true, them: "Básico" },
{ feature: "Funciona Offline", us: true, them: true },
{ feature: "Preço", us: "A partir de R$ 27,97/mês", them: "R$ 99,90/ano" }];


const testimonials = [
{ name: "Pr. Marcos Oliveira", city: "São Paulo, SP", text: "Revolucionou minha preparação de sermões. O criador de esboços com IA me economiza horas toda semana. Não consigo mais pregar sem essa ferramenta!", stars: 5, avatar: "MO" },
{ name: "Pr. Daniel Santos", city: "Belo Horizonte, MG", text: "A enciclopédia judaica e o dicionário bíblico trouxeram uma profundidade que eu não encontro em nenhum outro app. Minhas pregações ficaram muito mais ricas.", stars: 5, avatar: "DS" },
{ name: "Pra. Ana Beatriz", city: "Rio de Janeiro, RJ", text: "O chat teológico é incrível! Consigo tirar dúvidas em tempo real enquanto estudo. E os 640 hinos da Harpa Cristã são um bônus maravilhoso.", stars: 5, avatar: "AB" },
{ name: "Pr. João Paulo", city: "Curitiba, PR", text: "Testei o mBiblia, o YouVersion e vários outros. Nenhum chega perto do Palavraai. É feito pensando no pregador, não só no leitor casual.", stars: 5, avatar: "JP" },
{ name: "Ev. Fernanda Lima", city: "Salvador, BA", text: "O curso de teologia com flashcards e quiz me ajudou a fixar conteúdo que eu estava estudando há meses. A metodologia é simplesmente genial.", stars: 5, avatar: "FL" },
{ name: "Pr. Ricardo Almeida", city: "Fortaleza, CE", text: "Assinei o plano vitalício e foi o melhor investimento que fiz. Uso todos os dias e a cada atualização fica melhor ainda.", stars: 5, avatar: "RA" }];


const faqs = [
{ q: "Posso acessar de qualquer dispositivo?", a: "Sim! O Palavraai funciona em celular, tablet e computador — basta abrir no navegador." },
{ q: "Funciona sem internet?", a: "Sim! Os textos bíblicos, hinos e anotações ficam salvos para acesso offline." },
{ q: "O que acontece se eu cancelar?", a: "Você continua com acesso até o final do período pago. Sem pegadinhas, sem multas." },
{ q: "O plano vitalício é realmente para sempre?", a: "Sim! Pague uma vez e tenha acesso permanente, incluindo todas as futuras atualizações." },
{ q: "Como funciona o criador de esboços?", a: "Você digita o tema ou versículo e a IA gera um esboço completo com introdução, desenvolvimento, conclusão e +35 análises teológicas." }];


// ─── Component ─────────────────────────────────────
export default function Vendas() {
  const countdown = useCountdown(30);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [proofIndex, setProofIndex] = useState(0);

  // Social proof ticker — rotate every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setProofIndex((prev) => (prev + 1) % socialProofNames.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentProof = useMemo(() => ({
    name: socialProofNames[proofIndex],
    plan: socialProofPlans[proofIndex % socialProofPlans.length],
    city: socialProofCities[proofIndex % socialProofCities.length],
    minutesAgo: proofIndex % 12 + 1
  }), [proofIndex]);

  const scrollToPrice = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Sticky Top Bar ── */}
      <div className="sticky top-0 z-50 bg-destructive/95 backdrop-blur-sm text-center py-2.5 px-4">
        <p className="text-sm font-body font-bold text-destructive-foreground">
          🔥 OFERTA EXPIRA EM:{" "}
          <span className="font-mono">
            {String(countdown.h).padStart(2, "0")}:{String(countdown.m).padStart(2, "0")}:{String(countdown.s).padStart(2, "0")}
          </span>
          {" "}— Preço vai subir!
        </p>
      </div>

      {/* ── Já sou cliente ── */}
      <div className="bg-muted/50 border-b border-border py-3 px-4 text-center">
        <Link to="/login">
          <Button variant="outline" size="lg" className="font-body font-semibold text-base px-8">
            Já sou cliente → Acessar
          </Button>
        </Link>
      </div>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary/20 to-background" />
        <div className="absolute inset-0 opacity-20" style={{
          background: "radial-gradient(ellipse 600px 400px at 30% 40%, hsl(45 100% 55% / 0.3), transparent)"
        }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="text-center">
            <motion.img
              src={logoPregai}
              alt="Palavraai Logo"
              className="w-32 h-32 md:w-44 md:h-44 mx-auto mb-6 drop-shadow-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }} />


            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}>

              <span className="inline-flex items-center gap-1.5 bg-primary/20 backdrop-blur-sm text-primary-foreground px-4 py-1.5 rounded-full text-xs font-body font-bold uppercase tracking-wider mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                A Ferramenta #1 do Pregador
              </span>
            </motion.div>

            <motion.h1
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}>

              Prepare Sermões{" "}
              <span className="text-gradient-gold">Impactantes</span>
              <br />em Minutos, Estude e Aplique com Graça e Poder
            </motion.h1>

            <motion.p
              className="text-base md:text-xl text-muted-foreground font-body max-w-2xl mx-auto mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}>
              Conheça a Palavraai um App completo do pregador, tenha acesso a: Bíblia em 13 versões, Criador de esboço com IA, dicionário bíblico, enciclopédia Judaica, Curso completo de Teologia com mais de 31 disciplinas e muito mais —{" "}
              <strong className="text-foreground">tudo numa única ferramenta feita para pregadores.</strong>
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}>

              <Button
                onClick={scrollToPrice}
                size="lg"
                className="h-14 px-8 text-base font-bold rounded-xl shadow-gold hover:scale-105 transition-transform"
                style={{ background: "var(--gradient-gold)" }}>

                <Crown className="w-5 h-5 mr-2" />
                QUERO ACESSO AGORA
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-xs text-muted-foreground font-body">
                <Shield className="w-3.5 h-3.5 inline mr-1" />
                7 dias de garantia incondicional
              </p>
            </motion.div>

            {/* Social proof */}
            <motion.div
              className="mt-10 flex items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}>

              <div className="flex -space-x-2">
                {["MO", "DS", "AB", "JP"].map((initials, i) =>
                <div key={i} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground border-2 border-background">
                    {initials}
                  </div>
                )}
              </div>
              <div className="text-left">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />)}
                </div>
                <p className="text-xs text-muted-foreground font-body">+2.400 pregadores já usam</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Pain Points ── */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-4xl font-bold text-center mb-8 md:mb-10">
            Você se identifica com <span className="text-gradient-gold">algum destes problemas?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {[
            "Passa horas preparando sermões e nunca consegue ter revelações profundas do texto",
            "Sente que suas pregações estão repetitivas e sem profundidade",
            "Não encontra um app bíblico completo — Não tem materiais disponiveis para lhe auxiliar",
            "Quer estudar teologia mas não tem tempo nem dinheiro para seminário",
            "Precisa de um dicionário bíblico confiável e não acha",
            "Gostaria de ter um assistente teológico 24h para tirar dúvidas"].
            map((pain, i) =>
            <motion.div
              key={i}
              className="flex items-start gap-3 bg-card rounded-xl p-4 border border-border"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}>

                <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <XCircle className="w-4 h-4 text-destructive" />
                </div>
                <p className="font-body text-sm text-foreground">{pain}</p>
              </motion.div>
            )}
          </div>
          <div className="text-center mt-8">
            <p className="text-lg font-display font-bold text-foreground">
              O Palavraai resolve <span className="text-gradient-gold">todos esses problemas</span> numa única ferramenta.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-12 md:py-16 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <span className="inline-flex items-center gap-1.5 bg-primary/20 text-primary-foreground px-3 py-1 rounded-full text-xs font-body font-bold uppercase tracking-wider mb-4">
              <Zap className="w-3.5 h-3.5" />
              11 Ferramentas em 1
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold mb-3">
              Tudo que Você Precisa, <span className="text-gradient-gold">num Só Lugar</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {features.map((f, i) =>
            <motion.div
              key={i}
              className="bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-colors group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}>

                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style={{ background: "var(--gradient-gold)" }}>
                  <f.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-display font-bold text-sm text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">{f.desc}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-4xl font-bold text-center mb-3">
            Palavraai vs <span className="text-gradient-gold">mBíblia</span>
          </h2>
          <p className="text-center text-muted-foreground font-body mb-8">Veja por que pregadores estão migrando</p>

          <div className="rounded-2xl border border-border overflow-hidden overflow-x-auto">
            <div className="grid grid-cols-3 bg-primary/10 font-body font-bold text-xs uppercase tracking-wider min-w-[400px]">
              <div className="p-3 text-muted-foreground">Recurso</div>
              <div className="p-3 text-center text-foreground">Palavraai</div>
              <div className="p-3 text-center text-muted-foreground">OUTROS APPS</div>
            </div>
            {comparison.map((row, i) => <div key={i} className={`grid grid-cols-3 text-sm font-body min-w-[400px] ${i % 2 === 0 ? "bg-card" : "bg-card/50"} border-t border-border`}>
                <div className="p-3 text-foreground font-medium text-xs md:text-sm">{row.feature}</div>
                <div className="p-3 text-center">
                  {row.us === true ?
                  <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> :
                  typeof row.us === "string" ?
                  <span className="text-green-400 font-semibold text-xs md:text-sm">{row.us}</span> :

                  <XCircle className="w-5 h-5 text-destructive mx-auto" />
                  }
                </div>
                <div className="p-3 text-center">
                  {row.them === true ?
                  <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> :
                  row.them === false ?
                  <XCircle className="w-5 h-5 text-destructive/60 mx-auto" /> :

                  <span className="text-muted-foreground text-xs">{row.them}</span>
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-12 md:py-16 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl md:text-4xl font-bold text-center mb-3">
            O que Pregadores Dizem <span className="text-gradient-gold">Sobre o Palavraai</span>
          </h2>
          <p className="text-center text-muted-foreground font-body mb-8 md:mb-10">Depoimentos reais de quem usa todos os dias</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {testimonials.map((t, i) =>
            <motion.div
              key={i}
              className="bg-card rounded-2xl p-5 border border-border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}>

                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) =>
                <Star key={j} className="w-4 h-4 fill-gold text-gold" />
                )}
                </div>
                <p className="text-sm font-body text-foreground mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-body font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{t.city}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>

            <h2 className="font-display text-2xl md:text-4xl font-bold mb-3">
              Escolha Seu <span className="text-gradient-gold">Plano</span>
            </h2>
            <p className="text-muted-foreground font-body mb-4">Preço promocional por tempo limitado</p>

            {/* Countdown */}
            <div className="inline-flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-xl px-5 py-3 mb-10">
              <Clock className="w-5 h-5 text-destructive" />
              <span className="font-body font-bold text-destructive">
                Oferta expira em {String(countdown.h).padStart(2, "0")}:{String(countdown.m).padStart(2, "0")}:{String(countdown.s).padStart(2, "0")}
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto">
            {/* Monthly Plan */}
            <motion.div
              className="bg-card rounded-2xl p-6 border border-border relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}>
              <h3 className="font-display text-xl font-bold mb-1">Plano Mensal</h3>
              <p className="text-xs text-muted-foreground font-body mb-4">Acesso por 30 dias</p>
              <div className="mb-4">
                <span className="text-sm text-muted-foreground font-body line-through">R$ 49,99</span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-display text-4xl font-bold text-foreground">R$ 27,97</span>
                  <span className="text-sm text-muted-foreground font-body">/mês</span>
                </div>
                <p className="text-xs text-green-400 font-body font-semibold mt-1">Economia de 44%</p>
              </div>
              <div className="space-y-2 text-left mb-6">
                {["Todas as 11 ferramentas", "Criador de Esboços com IA", "Chat Teológico ilimitado", "Atualizações mensais", "Suporte por e-mail"].map((item, i) =>
                <div key={i} className="flex items-center gap-2 text-sm font-body text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </div>
                )}
              </div>
              <a
                href="https://pay.kiwify.com.br/rHFCXHm"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center font-body font-bold text-sm py-3.5 rounded-xl border-2 border-border text-foreground hover:bg-muted transition-colors">
                ASSINAR PLANO MENSAL
              </a>
            </motion.div>

            {/* Annual Plan */}
            <motion.div
              className="bg-card rounded-2xl p-6 border border-border relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}>
              <h3 className="font-display text-xl font-bold mb-1">Plano Anual</h3>
              <p className="text-xs text-muted-foreground font-body mb-4">Acesso por 12 meses</p>
              <div className="mb-4">
                <span className="text-sm text-muted-foreground font-body line-through">R$ 149,99</span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-display text-4xl font-bold text-foreground">R$ 67,97</span>
                  <span className="text-sm text-muted-foreground font-body">/ano</span>
                </div>
                <p className="text-xs text-green-400 font-body font-semibold mt-1">Economia de 55%</p>
              </div>
              <div className="space-y-2 text-left mb-6">
                {["Todas as 11 ferramentas", "Criador de Esboços com IA", "Chat Teológico ilimitado", "Atualizações por 12 meses", "Suporte prioritário"].map((item, i) =>
                <div key={i} className="flex items-center gap-2 text-sm font-body text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </div>
                )}
              </div>
              <a
                href="https://pay.kiwify.com.br/PpkLzCk"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center font-body font-bold text-sm py-3.5 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                ASSINAR PLANO ANUAL
              </a>
            </motion.div>

            {/* Lifetime Plan */}
            <motion.div
              className="bg-card rounded-2xl p-6 border-2 border-gold relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}>
              <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-xs font-body font-bold text-primary-foreground" style={{ background: "var(--gradient-gold)" }}>
                MAIS POPULAR
              </div>
              <h3 className="font-display text-xl font-bold mb-1">Plano Vitalício</h3>
              <p className="text-xs text-muted-foreground font-body mb-4">Acesso para sempre</p>
              <div className="mb-4">
                <span className="text-sm text-muted-foreground font-body line-through">R$ 199,99</span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-display text-4xl font-bold text-gradient-gold">R$ 99,97</span>
                </div>
                <p className="text-xs text-green-400 font-body font-semibold mt-1">Pagamento único — sem mensalidades</p>
              </div>
              <div className="space-y-2 text-left mb-6">
                {["Todas as 11 ferramentas", "Criador de Esboços com IA", "Chat Teológico ilimitado", "Atualizações vitalícias", "Suporte VIP prioritário", "Acesso antecipado a novidades"].map((item, i) =>
                <div key={i} className="flex items-center gap-2 text-sm font-body text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </div>
                )}
              </div>
              <a
                href="https://pay.kiwify.com.br/z0HBQo6"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center font-body font-bold text-sm py-3.5 rounded-xl shadow-gold hover:scale-105 transition-transform text-primary-foreground"
                style={{ background: "var(--gradient-gold)" }}>
                <Crown className="w-4 h-4 inline mr-1" />
                QUERO ACESSO VITALÍCIO
              </a>
            </motion.div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground font-body">
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> 7 dias de garantia</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Acesso imediato</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> +2.400 pregadores</span>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-12 md:py-16 px-4 bg-card/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">
            Perguntas <span className="text-gradient-gold">Frequentes</span>
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) =>
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left">

                  <span className="font-body font-semibold text-sm text-foreground">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i &&
              <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground font-body">{faq.a}</p>
                  </div>
              }
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 md:py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary/20 to-background" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <img src={logoPregai} alt="Palavraai" className="w-28 h-28 md:w-36 md:h-36 mx-auto mb-6 drop-shadow-2xl" />
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Comece a Pregar com <span className="text-gradient-gold">Mais Poder</span> Hoje
          </h2>
          <p className="text-muted-foreground font-body text-base md:text-lg mb-8 max-w-xl mx-auto">
            Junte-se a mais de 2.400 pregadores que já transformaram sua preparação ministerial com o Palavraai.
          </p>
          <Button
            onClick={scrollToPrice}
            size="lg"
            className="h-14 px-10 text-base font-bold rounded-xl shadow-gold hover:scale-105 transition-transform"
            style={{ background: "var(--gradient-gold)" }}>

            <Crown className="w-5 h-5 mr-2" />
            GARANTIR MEU ACESSO AGORA
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-xs text-muted-foreground font-body mt-4">
            <Shield className="w-3.5 h-3.5 inline mr-1" />
            7 dias de garantia incondicional — sem risco algum
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <img src={logoPregai} alt="Palavraai" className="w-14 h-14 mx-auto mb-3" />
          <p className="text-xs text-muted-foreground font-body">
            © {new Date().getFullYear()} Palavraai — Ferramentas inteligentes para pregadores.
          </p>
        </div>
      </footer>

      {/* ── Social Proof Toast ── */}
      <div className="fixed bottom-4 left-4 z-50 max-w-xs">
        <AnimatePresence mode="wait">
          <motion.div
            key={proofIndex}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="bg-card border border-border rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">

            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground flex-shrink-0">
              {currentProof.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <p className="text-xs font-body font-semibold text-foreground">
                {currentProof.name} <span className="text-muted-foreground font-normal">adquiriu o</span>{" "}
                <span className="text-gradient-gold font-bold">Plano {currentProof.plan}</span>
              </p>
              <p className="text-[10px] text-muted-foreground font-body">
                {currentProof.city} · há {currentProof.minutesAgo} min
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>);

}