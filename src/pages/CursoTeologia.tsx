import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Flame, Trophy, ChevronDown, ChevronUp, BookOpen, Library } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import BottomNav from "@/components/BottomNav";
import AnimatedBackground from "@/components/AnimatedBackground";
import StudyMode from "@/components/curso/StudyMode";
import { MODULE_LIST } from "@/lib/theology-course-data";

// ── Grouped modules into shelf categories ────────────────────────────

interface ShelfCategory {
  title: string;
  color: string;
  bookColor: string;
  textColor: string;
  moduleIds: number[];
}

const SHELF_CATEGORIES: ShelfCategory[] = [
  {
    title: "Fundamentos Teológicos",
    color: "from-violet-700 to-purple-900",
    bookColor: "bg-violet-700",
    textColor: "text-violet-100",
    moduleIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  },
  {
    title: "Panorama do Antigo Testamento",
    color: "from-emerald-700 to-emerald-900",
    bookColor: "bg-emerald-700",
    textColor: "text-emerald-100",
    moduleIds: [14, 15, 16, 17, 18, 19],
  },
  {
    title: "Panorama do Novo Testamento",
    color: "from-sky-600 to-blue-800",
    bookColor: "bg-sky-600",
    textColor: "text-sky-100",
    moduleIds: [20, 21, 22, 23, 24, 25, 26, 27],
  },
  {
    title: "Vida e Ministério",
    color: "from-amber-600 to-orange-800",
    bookColor: "bg-amber-600",
    textColor: "text-amber-100",
    moduleIds: [28, 29, 30, 31],
  },
];

// ── Bible Encyclopedia Data ──────────────────────────────────────────

interface BibleBook {
  name: string;
  chapters: number;
  summary: string;
}

interface BibleSection {
  title: string;
  color: string;
  bookColor: string;
  textColor: string;
  books: BibleBook[];
}

const BIBLE_AT_SECTIONS: BibleSection[] = [
  {
    title: "Pentateuco",
    color: "from-emerald-800 to-emerald-950",
    bookColor: "bg-emerald-700",
    textColor: "text-emerald-100",
    books: [
      { name: "Gênesis", chapters: 50, summary: "Criação do mundo, queda do homem, dilúvio, patriarcas (Abraão, Isaque, Jacó, José). Fundamento de toda a história bíblica." },
      { name: "Êxodo", chapters: 40, summary: "Libertação de Israel do Egito, Moisés, as 10 pragas, travessia do Mar Vermelho, os Dez Mandamentos e o Tabernáculo." },
      { name: "Levítico", chapters: 27, summary: "Leis cerimoniais, sistema de sacrifícios, santidade, festas do Senhor e o papel dos sacerdotes levitas." },
      { name: "Números", chapters: 36, summary: "Censos de Israel, 40 anos no deserto, rebelião do povo, fidelidade de Deus e preparação para Canaã." },
      { name: "Deuteronômio", chapters: 34, summary: "Segundo discurso da Lei por Moisés, renovação da aliança, bênçãos e maldições, morte de Moisés." },
    ],
  },
  {
    title: "Históricos",
    color: "from-orange-600 to-orange-800",
    bookColor: "bg-orange-600",
    textColor: "text-orange-100",
    books: [
      { name: "Josué", chapters: 24, summary: "Conquista de Canaã sob a liderança de Josué, divisão da terra entre as 12 tribos de Israel." },
      { name: "Juízes", chapters: 21, summary: "Ciclos de pecado, opressão, clamor e libertação. Juízes como Gideão, Sansão e Débora." },
      { name: "Rute", chapters: 4, summary: "História de lealdade e redenção. Rute, a moabita, ancestral do rei Davi e de Jesus Cristo." },
      { name: "1 Samuel", chapters: 31, summary: "Último juiz (Samuel), primeiro rei (Saul) e a unção de Davi. Transição para a monarquia." },
      { name: "2 Samuel", chapters: 24, summary: "Reinado de Davi, suas conquistas, pecado com Bate-Seba e a aliança davídica." },
      { name: "1 Reis", chapters: 22, summary: "Salomão e o Templo, divisão do reino (Israel/Judá), profeta Elias." },
      { name: "2 Reis", chapters: 25, summary: "Eliseu, queda de Israel (722 a.C.) e Judá (586 a.C.), exílio babilônico." },
      { name: "1 Crônicas", chapters: 29, summary: "Genealogias de Adão a Davi, reinado de Davi com foco na adoração e no templo." },
      { name: "2 Crônicas", chapters: 36, summary: "De Salomão ao exílio, com foco nos reis de Judá e reformas espirituais." },
      { name: "Esdras", chapters: 10, summary: "Retorno do exílio, reconstrução do Templo e reformas espirituais sob Esdras." },
      { name: "Neemias", chapters: 13, summary: "Reconstrução dos muros de Jerusalém e renovação da aliança." },
      { name: "Ester", chapters: 10, summary: "Providência de Deus na preservação do povo judeu no império persa." },
    ],
  },
  {
    title: "Poéticos",
    color: "from-sky-500 to-sky-700",
    bookColor: "bg-sky-500",
    textColor: "text-sky-100",
    books: [
      { name: "Jó", chapters: 42, summary: "O problema do sofrimento do justo, soberania de Deus e fé inabalável." },
      { name: "Salmos", chapters: 150, summary: "Hinário de Israel: louvores, lamentos, profecias messiânicas e sabedoria para a vida." },
      { name: "Provérbios", chapters: 31, summary: "Sabedoria prática para o dia a dia: finanças, relacionamentos, trabalho e temor ao Senhor." },
      { name: "Eclesiastes", chapters: 12, summary: "Reflexão sobre o sentido da vida. 'Vaidade de vaidades' — só Deus dá propósito." },
      { name: "Cantares", chapters: 8, summary: "Poema de amor entre o amado e a sulamita, tipologia de Cristo e a Igreja." },
    ],
  },
  {
    title: "Profetas Maiores",
    color: "from-purple-700 to-purple-900",
    bookColor: "bg-purple-700",
    textColor: "text-purple-100",
    books: [
      { name: "Isaías", chapters: 66, summary: "O 'Evangelho do AT': profecias messiânicas, servo sofredor, juízo e restauração." },
      { name: "Jeremias", chapters: 52, summary: "O profeta chorão: chamado à santidade, juízo sobre Judá e a Nova Aliança (cap. 31)." },
      { name: "Lamentações", chapters: 5, summary: "Lamento pela destruição de Jerusalém. Poesia de dor e esperança na fidelidade de Deus." },
      { name: "Ezequiel", chapters: 48, summary: "Visões de Deus, juízo e restauração, vale dos ossos secos, futuro templo." },
      { name: "Daniel", chapters: 12, summary: "Fidelidade no exílio, interpretação de sonhos, profecias apocalípticas dos reinos mundiais." },
    ],
  },
  {
    title: "Profetas Menores",
    color: "from-teal-600 to-teal-800",
    bookColor: "bg-teal-600",
    textColor: "text-teal-100",
    books: [
      { name: "Oséias", chapters: 14, summary: "Amor fiel de Deus por Israel infiel, retratado no casamento de Oséias com Gômer." },
      { name: "Joel", chapters: 3, summary: "Praga de gafanhotos como juízo, arrependimento e derramamento do Espírito Santo." },
      { name: "Amós", chapters: 9, summary: "Justiça social, juízo contra nações e Israel, o 'Dia do Senhor'." },
      { name: "Obadias", chapters: 1, summary: "Juízo contra Edom por orgulho e violência contra Judá." },
      { name: "Jonas", chapters: 4, summary: "Fuga do profeta, o grande peixe, arrependimento de Nínive, misericórdia de Deus." },
      { name: "Miquéias", chapters: 7, summary: "Juízo e esperança. Profecia de Belém como local de nascimento do Messias (5:2)." },
      { name: "Naum", chapters: 3, summary: "Destruição de Nínive — juízo de Deus sobre a Assíria." },
      { name: "Habacuque", chapters: 3, summary: "'O justo viverá pela fé' — diálogo do profeta com Deus sobre a injustiça." },
      { name: "Sofonias", chapters: 3, summary: "O grande Dia do Senhor, juízo universal e restauração do remanescente." },
      { name: "Ageu", chapters: 2, summary: "Chamado para reconstruir o Templo após o exílio, prioridades espirituais." },
      { name: "Zacarias", chapters: 14, summary: "Visões apocalípticas, profecias messiânicas detalhadas, futuro de Jerusalém." },
      { name: "Malaquias", chapters: 4, summary: "Último profeta do AT: dízimos, aliança conjugal, promessa de Elias antes do Messias." },
    ],
  },
];

const BIBLE_NT_SECTIONS: BibleSection[] = [
  {
    title: "Evangelhos",
    color: "from-red-600 to-red-800",
    bookColor: "bg-red-600",
    textColor: "text-red-100",
    books: [
      { name: "Mateus", chapters: 28, summary: "Jesus como Rei dos Judeus. Genealogia, Sermão do Monte, parábolas, Grande Comissão." },
      { name: "Marcos", chapters: 16, summary: "Jesus como Servo. Evangelho mais curto e dinâmico, ênfase nos milagres e ação." },
      { name: "Lucas", chapters: 24, summary: "Jesus como Filho do Homem. Relato detalhado, parábolas exclusivas, compaixão pelos marginalizados." },
      { name: "João", chapters: 21, summary: "Jesus como Filho de Deus. Evangelho teológico, 7 sinais, 7 'Eu Sou', vida eterna." },
    ],
  },
  {
    title: "Histórico",
    color: "from-amber-600 to-amber-800",
    bookColor: "bg-amber-600",
    textColor: "text-amber-100",
    books: [
      { name: "Atos", chapters: 28, summary: "Nascimento da Igreja, Pentecostes, viagens missionárias de Paulo, expansão do Evangelho." },
    ],
  },
  {
    title: "Epístolas Paulinas",
    color: "from-indigo-600 to-indigo-800",
    bookColor: "bg-indigo-600",
    textColor: "text-indigo-100",
    books: [
      { name: "Romanos", chapters: 16, summary: "A epístola magna: justificação pela fé, graça, santificação e vida no Espírito." },
      { name: "1 Coríntios", chapters: 16, summary: "Correção de problemas na igreja: divisões, imoralidade, dons espirituais, ressurreição." },
      { name: "2 Coríntios", chapters: 13, summary: "Defesa do apostolado de Paulo, consolo no sofrimento, generosidade." },
      { name: "Gálatas", chapters: 6, summary: "Liberdade em Cristo contra o legalismo. 'O justo viverá pela fé.'" },
      { name: "Efésios", chapters: 6, summary: "A Igreja como Corpo de Cristo, bênçãos espirituais, armadura de Deus." },
      { name: "Filipenses", chapters: 4, summary: "Alegria em Cristo, humildade de Jesus (kenosis), contentamento." },
      { name: "Colossenses", chapters: 4, summary: "Supremacia de Cristo sobre tudo, completude nEle." },
      { name: "1 Tessalonicenses", chapters: 5, summary: "Volta de Cristo, consolo na esperança, santificação." },
      { name: "2 Tessalonicenses", chapters: 3, summary: "Esclarecimentos sobre o Dia do Senhor e o homem da iniquidade." },
      { name: "1 Timóteo", chapters: 6, summary: "Instruções pastorais: liderança, sã doutrina, conduta na igreja." },
      { name: "2 Timóteo", chapters: 4, summary: "Última carta de Paulo: perseverança, fidelidade, inspiração das Escrituras." },
      { name: "Tito", chapters: 3, summary: "Organização da igreja em Creta, qualificações de líderes, boas obras." },
      { name: "Filemom", chapters: 1, summary: "Carta pessoal: perdão e reconciliação entre Filemom e o escravo Onésimo." },
    ],
  },
  {
    title: "Epístolas Gerais",
    color: "from-cyan-600 to-cyan-800",
    bookColor: "bg-cyan-600",
    textColor: "text-cyan-100",
    books: [
      { name: "Hebreus", chapters: 13, summary: "Superioridade de Cristo sobre tudo: anjos, Moisés, sacerdócio, sacrifícios." },
      { name: "Tiago", chapters: 5, summary: "Fé prática: obras, controle da língua, sabedoria, paciência." },
      { name: "1 Pedro", chapters: 5, summary: "Esperança no sofrimento, santidade, submissão, sacerdócio real dos crentes." },
      { name: "2 Pedro", chapters: 3, summary: "Alerta contra falsos mestres, crescimento na graça, volta de Cristo." },
      { name: "1 João", chapters: 5, summary: "Comunhão com Deus, amor fraternal, segurança da salvação." },
      { name: "2 João", chapters: 1, summary: "Andar na verdade e cuidado com falsos ensinadores." },
      { name: "3 João", chapters: 1, summary: "Hospitalidade cristã e fidelidade à verdade." },
      { name: "Judas", chapters: 1, summary: "Contender pela fé contra apostasia e falsos mestres." },
    ],
  },
  {
    title: "Profético",
    color: "from-fuchsia-700 to-fuchsia-900",
    bookColor: "bg-fuchsia-700",
    textColor: "text-fuchsia-100",
    books: [
      { name: "Apocalipse", chapters: 22, summary: "Revelação de Jesus Cristo: juízo final, nova Jerusalém, vitória eterna de Deus." },
    ],
  },
];

// ── Persisted progress ───────────────────────────────────────────────

function getProgress(): Record<number, number> {
  try {
    return JSON.parse(localStorage.getItem("curso-progress") || "{}");
  } catch {
    return {};
  }
}
function saveProgress(p: Record<number, number>) {
  localStorage.setItem("curso-progress", JSON.stringify(p));
}

// ── Module Book Spine ────────────────────────────────────────────────

function ModuleBookSpine({
  mod,
  progress,
  index,
  bookColor,
  textColor,
  isSelected,
  onSelect,
}: {
  mod: (typeof MODULE_LIST)[0];
  progress: number;
  index: number;
  bookColor: string;
  textColor: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isComplete = progress >= 100;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ y: -8, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      className={`w-10 sm:w-12 h-full ${bookColor} rounded-sm flex items-center justify-center relative cursor-pointer transition-shadow ${
        isSelected
          ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/30 -translate-y-2"
          : "hover:shadow-md"
      }`}
      style={{ minWidth: "2.5rem" }}
    >
      <div className="absolute top-1 left-1 right-1 h-px bg-white/20 rounded" />
      <div className="absolute bottom-1 left-1 right-1 h-px bg-white/20 rounded" />

      {progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 rounded-b-sm overflow-hidden">
          <div
            className={`h-full ${isComplete ? "bg-emerald-400" : "bg-yellow-400"} transition-all`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {isComplete && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center z-10 shadow">
          <BookOpen className="w-2.5 h-2.5 text-white" />
        </div>
      )}

      <span
        className={`${textColor} text-[8px] sm:text-[9px] font-bold tracking-tight whitespace-nowrap`}
        style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
      >
        {mod.title.toUpperCase()}
      </span>
    </motion.button>
  );
}

// ── Bible Book Spine ─────────────────────────────────────────────────

function BibleBookSpine({
  book,
  bookColor,
  textColor,
  index,
  isSelected,
  onSelect,
}: {
  book: BibleBook;
  bookColor: string;
  textColor: string;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const widthClass = book.chapters > 40 ? "w-12 sm:w-14" : book.chapters > 20 ? "w-10 sm:w-12" : "w-8 sm:w-10";

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileHover={{ y: -6, scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onSelect}
      className={`${widthClass} h-full ${bookColor} rounded-sm flex items-center justify-center relative cursor-pointer transition-shadow ${
        isSelected ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/30 -translate-y-1" : "hover:shadow-md"
      }`}
      style={{ minWidth: "2rem" }}
    >
      <div className="absolute top-1 left-1 right-1 h-px bg-white/20 rounded" />
      <div className="absolute bottom-1 left-1 right-1 h-px bg-white/20 rounded" />
      <span
        className={`${textColor} text-[9px] sm:text-[10px] font-bold tracking-tight whitespace-nowrap`}
        style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
      >
        {book.name.toUpperCase()}
      </span>
    </motion.button>
  );
}

// ── Module Shelf ─────────────────────────────────────────────────────

function ModuleShelf({
  category,
  progress,
  selectedModuleId,
  onSelectModule,
  onStartStudy,
}: {
  category: ShelfCategory;
  progress: Record<number, number>;
  selectedModuleId: number | null;
  onSelectModule: (id: number | null) => void;
  onStartStudy: (id: number) => void;
}) {
  const modules = category.moduleIds.map((id) => MODULE_LIST.find((m) => m.id === id)!).filter(Boolean);
  const selectedMod = modules.find((m) => m.id === selectedModuleId) || null;
  const categoryProgress = Math.round(
    category.moduleIds.reduce((sum, id) => sum + (progress[id] || 0), 0) / category.moduleIds.length
  );

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${category.color}`} />
        <h3 className="text-xs sm:text-sm font-bold font-display text-foreground uppercase tracking-wider flex-1">
          {category.title}
        </h3>
        <span className="text-[10px] font-bold text-muted-foreground">{categoryProgress}%</span>
      </div>

      <div className="relative">
        <div className="bg-gradient-to-b from-amber-900/30 to-amber-950/50 rounded-xl border border-amber-800/30 p-2 sm:p-3">
          <div className="flex gap-1 overflow-x-auto pb-1 items-end scrollbar-thin" style={{ height: "110px" }}>
            {modules.map((mod, i) => (
              <ModuleBookSpine
                key={mod.id}
                mod={mod}
                progress={progress[mod.id] || 0}
                index={i}
                bookColor={category.bookColor}
                textColor={category.textColor}
                isSelected={selectedModuleId === mod.id}
                onSelect={() => onSelectModule(selectedModuleId === mod.id ? null : mod.id)}
              />
            ))}
          </div>
          <div className="h-2 bg-gradient-to-r from-amber-800/60 via-amber-700/80 to-amber-800/60 rounded-b-lg mt-1" />
        </div>
      </div>

      <AnimatePresence>
        {selectedMod && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={`mt-2 p-4 rounded-xl bg-gradient-to-br ${category.color} text-white`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <selectedMod.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-base sm:text-lg leading-tight">{selectedMod.title}</h4>
                  <p className="text-[11px] opacity-80 font-body">{selectedMod.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/80 rounded-full transition-all" style={{ width: `${progress[selectedMod.id] || 0}%` }} />
                </div>
                <span className="text-[10px] font-bold">{progress[selectedMod.id] || 0}%</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onStartStudy(selectedMod.id)}
                  className="flex-1 py-2.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-sm font-display transition-colors"
                >
                  {(progress[selectedMod.id] || 0) > 0 ? "Continuar Estudo" : "Iniciar Estudo"}
                </motion.button>
                <button onClick={() => onSelectModule(null)} className="text-[10px] font-body underline opacity-70 hover:opacity-100 transition px-2">
                  Fechar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Bible Shelf ──────────────────────────────────────────────────────

function BibleShelf({
  section,
  selectedBook,
  onSelectBook,
}: {
  section: BibleSection;
  selectedBook: string | null;
  onSelectBook: (name: string | null) => void;
}) {
  const selected = section.books.find((b) => b.name === selectedBook) || null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${section.color}`} />
        <h3 className="text-xs sm:text-sm font-bold font-display text-foreground uppercase tracking-wider">
          {section.title}
        </h3>
        <span className="text-[10px] text-muted-foreground font-body">({section.books.length} livros)</span>
      </div>

      <div className="relative">
        <div className="bg-gradient-to-b from-amber-900/30 to-amber-950/50 rounded-xl border border-amber-800/30 p-2 sm:p-3">
          <div className="flex gap-1 overflow-x-auto pb-1 items-end" style={{ height: "100px" }}>
            {section.books.map((book, i) => (
              <BibleBookSpine
                key={book.name}
                book={book}
                bookColor={section.bookColor}
                textColor={section.textColor}
                index={i}
                isSelected={selectedBook === book.name}
                onSelect={() => onSelectBook(selectedBook === book.name ? null : book.name)}
              />
            ))}
          </div>
          <div className="h-2 bg-gradient-to-r from-amber-800/60 via-amber-700/80 to-amber-800/60 rounded-b-lg mt-1" />
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={`mt-2 p-4 rounded-xl bg-gradient-to-br ${section.color} text-white`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-display font-bold text-base sm:text-lg">{selected.name}</h4>
                <span className="text-[10px] bg-white/20 rounded-full px-2 py-0.5 font-body">{selected.chapters} capítulos</span>
              </div>
              <p className="text-xs sm:text-sm font-body leading-relaxed opacity-90">{selected.summary}</p>
              <button onClick={() => onSelectBook(null)} className="mt-3 text-[10px] font-body underline opacity-70 hover:opacity-100 transition">
                Fechar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────

export default function CursoTeologia() {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [studyingModule, setStudyingModule] = useState<number | null>(null);
  const [progress, setProgress] = useState<Record<number, number>>(getProgress);
  const [streak] = useState(() => {
    const saved = localStorage.getItem("curso-streak");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem("curso-xp");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [expandedSection, setExpandedSection] = useState<string | null>("Fundamentos Teológicos");
  const [activeTab, setActiveTab] = useState<"disciplinas" | "enciclopedia">("disciplinas");
  const [selectedBibleBook, setSelectedBibleBook] = useState<string | null>(null);
  const [expandedTestament, setExpandedTestament] = useState<string>("Antigo Testamento");

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    localStorage.setItem("curso-xp", String(xp));
  }, [xp]);

  const updateModuleProgress = (moduleId: number, value: number) => {
    setProgress((prev) => ({ ...prev, [moduleId]: Math.max(prev[moduleId] || 0, value) }));
  };

  const addXp = (amount: number) => setXp((prev) => prev + amount);

  if (studyingModule !== null) {
    return (
      <StudyMode
        moduleId={studyingModule}
        streak={streak}
        xp={xp}
        onAddXp={addXp}
        onUpdateProgress={(v) => updateModuleProgress(studyingModule, v)}
        onBack={() => setStudyingModule(null)}
      />
    );
  }

  const totalProgress = MODULE_LIST.reduce((sum, m) => sum + (progress[m.id] || 0), 0);
  const overallPercent = Math.round(totalProgress / MODULE_LIST.length);
  const completedModules = MODULE_LIST.filter((m) => (progress[m.id] || 0) >= 100).length;

  const totalAT = BIBLE_AT_SECTIONS.reduce((a, s) => a + s.books.length, 0);
  const totalNT = BIBLE_NT_SECTIONS.reduce((a, s) => a + s.books.length, 0);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <AnimatedBackground />

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-base sm:text-lg font-display font-bold">Curso de Teologia</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-body">
              31 módulos • 66 livros • {completedModules} concluídos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-card/60 backdrop-blur border border-border/50 rounded-full px-2.5 py-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[10px] font-bold text-foreground">{streak}</span>
            </div>
            <div className="flex items-center gap-1 bg-card/60 backdrop-blur border border-border/50 rounded-full px-2.5 py-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-bold text-foreground">{xp} XP</span>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 mt-3 bg-muted/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("disciplinas")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold font-display transition-all ${
              activeTab === "disciplinas"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Disciplinas
          </button>
          <button
            onClick={() => setActiveTab("enciclopedia")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold font-display transition-all ${
              activeTab === "enciclopedia"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            Enciclopédia Bíblica
          </button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-160px)]">
        <div className="relative z-10 px-4 py-4 max-w-2xl mx-auto">
          {activeTab === "disciplinas" ? (
            <>
              {/* Stats banner */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-2 mb-5"
              >
                <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold font-display text-foreground">{overallPercent}%</p>
                  <p className="text-[9px] text-muted-foreground font-body">Progresso</p>
                </div>
                <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold font-display text-foreground">{completedModules}</p>
                  <p className="text-[9px] text-muted-foreground font-body">Concluídos</p>
                </div>
                <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold font-display text-primary">{xp}</p>
                  <p className="text-[9px] text-muted-foreground font-body">XP Total</p>
                </div>
              </motion.div>

              {/* Overall progress bar */}
              <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-3 mb-5">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-foreground font-body">Progresso Geral</span>
                  <span className="text-xs font-bold text-primary">{overallPercent}%</span>
                </div>
                <Progress value={overallPercent} className="h-2 bg-muted" />
              </div>

              {/* Shelves by category */}
              {SHELF_CATEGORIES.map((cat) => {
                const isExpanded = expandedSection === cat.title;
                return (
                  <div key={cat.title} className="mb-2">
                    <button
                      onClick={() => setExpandedSection(isExpanded ? null : cat.title)}
                      className="w-full flex items-center justify-between bg-card/40 backdrop-blur border border-border/30 rounded-xl px-4 py-3 mb-2 transition-colors hover:bg-card/60"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${cat.color}`} />
                        <span className="text-sm font-bold font-display text-foreground">{cat.title}</span>
                        <span className="text-[10px] text-muted-foreground font-body">({cat.moduleIds.length})</span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <ModuleShelf
                            category={cat}
                            progress={progress}
                            selectedModuleId={selectedModule}
                            onSelectModule={setSelectedModule}
                            onStartStudy={(id) => {
                              setSelectedModule(null);
                              setStudyingModule(id);
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              {/* Encyclopedia stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-3 mb-5"
              >
                <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-xl p-3 text-center">
                  <p className="text-2xl font-display font-bold text-emerald-400">{totalAT}</p>
                  <p className="text-[10px] text-muted-foreground font-body">Antigo Testamento</p>
                </div>
                <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-3 text-center">
                  <p className="text-2xl font-display font-bold text-red-400">{totalNT}</p>
                  <p className="text-[10px] text-muted-foreground font-body">Novo Testamento</p>
                </div>
              </motion.div>

              {/* AT */}
              <div className="mb-4">
                <button
                  onClick={() => setExpandedTestament(expandedTestament === "Antigo Testamento" ? "" : "Antigo Testamento")}
                  className="w-full flex items-center justify-between bg-card/50 border border-border rounded-xl px-4 py-3 mb-3 hover:bg-card transition"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span className="font-display font-bold text-sm sm:text-base">Antigo Testamento</span>
                  </div>
                  {expandedTestament === "Antigo Testamento" ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {expandedTestament === "Antigo Testamento" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      {BIBLE_AT_SECTIONS.map((section) => (
                        <BibleShelf key={section.title} section={section} selectedBook={selectedBibleBook} onSelectBook={setSelectedBibleBook} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* NT */}
              <div className="mb-4">
                <button
                  onClick={() => setExpandedTestament(expandedTestament === "Novo Testamento" ? "" : "Novo Testamento")}
                  className="w-full flex items-center justify-between bg-card/50 border border-border rounded-xl px-4 py-3 mb-3 hover:bg-card transition"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span className="font-display font-bold text-sm sm:text-base">Novo Testamento</span>
                  </div>
                  {expandedTestament === "Novo Testamento" ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {expandedTestament === "Novo Testamento" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      {BIBLE_NT_SECTIONS.map((section) => (
                        <BibleShelf key={section.title} section={section} selectedBook={selectedBibleBook} onSelectBook={setSelectedBibleBook} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
      <BottomNav />
    </div>
  );
}
