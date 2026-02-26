import {
  BookOpen, Search, Crown, Users, Skull, Heart, Cross,
  Wind, Feather, Church, Clock, ShieldAlert, Scale, History,
  Map, ScrollText, BookMarked, Music2, Megaphone, Eye,
  Pen, Flame, Mail, FileText, BookText, Star, Swords,
  Globe, Home, Sparkles, Mic
} from "lucide-react";

export interface StudyCard {
  id: string;
  front: string;
  back: string;
  type: "concept" | "verse" | "question";
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CourseModule {
  id: number;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  cards: StudyCard[];
  quiz: QuizQuestion[];
}

export const MODULE_LIST: { id: number; title: string; icon: React.ComponentType<any>; color: string; description: string }[] = [
  { id: 1, title: "Bibliologia", icon: BookOpen, color: "from-violet-600 to-purple-700", description: "Estudo sobre a Bíblia" },
  { id: 2, title: "Hermenêutica", icon: Search, color: "from-blue-600 to-indigo-700", description: "Interpretação bíblica" },
  { id: 3, title: "Teontologia", icon: Crown, color: "from-amber-500 to-yellow-600", description: "Doutrina de Deus" },
  { id: 4, title: "Antropologia", icon: Users, color: "from-emerald-600 to-green-700", description: "Doutrina do homem" },
  { id: 5, title: "Harmateologia", icon: Skull, color: "from-red-600 to-rose-700", description: "Doutrina do pecado" },
  { id: 6, title: "Soteriologia", icon: Heart, color: "from-pink-500 to-rose-600", description: "Doutrina da salvação" },
  { id: 7, title: "Cristologia", icon: Cross, color: "from-sky-500 to-blue-600", description: "Doutrina de Cristo" },
  { id: 8, title: "Pneumatologia", icon: Wind, color: "from-cyan-500 to-teal-600", description: "Doutrina do Espírito Santo" },
  { id: 9, title: "Angelologia", icon: Feather, color: "from-indigo-400 to-violet-500", description: "Estudo dos anjos" },
  { id: 10, title: "Eclesiologia", icon: Church, color: "from-orange-500 to-amber-600", description: "Doutrina da Igreja" },
  { id: 11, title: "Escatologia Bíblica", icon: Clock, color: "from-purple-600 to-fuchsia-700", description: "Últimas coisas" },
  { id: 12, title: "Heresiologia", icon: ShieldAlert, color: "from-red-700 to-red-800", description: "Estudo das heresias" },
  { id: 13, title: "Ética Cristã", icon: Scale, color: "from-teal-500 to-emerald-600", description: "Moral e conduta" },
  { id: 14, title: "História Bíblica", icon: History, color: "from-stone-500 to-stone-700", description: "Panorama histórico" },
  { id: 15, title: "Geografia Bíblica", icon: Map, color: "from-lime-600 to-green-700", description: "Terras bíblicas" },
  { id: 16, title: "Pentateuco", icon: ScrollText, color: "from-amber-600 to-orange-700", description: "Os 5 livros de Moisés" },
  { id: 17, title: "Livros Históricos", icon: BookMarked, color: "from-cyan-600 to-blue-700", description: "Josué a Ester" },
  { id: 18, title: "Livros Poéticos", icon: Music2, color: "from-rose-400 to-pink-500", description: "Jó a Cantares" },
  { id: 19, title: "Livros Proféticos", icon: Megaphone, color: "from-orange-600 to-red-600", description: "Isaías a Malaquias" },
  { id: 20, title: "Evangelhos Sinóticos", icon: Eye, color: "from-blue-500 to-indigo-600", description: "Mateus, Marcos e Lucas" },
  { id: 21, title: "Evangelho de João", icon: Pen, color: "from-violet-500 to-purple-600", description: "O evangelho teológico" },
  { id: 22, title: "Atos dos Apóstolos", icon: Flame, color: "from-orange-500 to-red-500", description: "A Igreja primitiva" },
  { id: 23, title: "Epístolas Paulinas", icon: Mail, color: "from-indigo-600 to-blue-700", description: "Cartas de Paulo" },
  { id: 24, title: "Estudo de Romanos", icon: FileText, color: "from-emerald-500 to-teal-600", description: "A epístola magna" },
  { id: 25, title: "Epístolas Gerais", icon: BookText, color: "from-sky-600 to-cyan-700", description: "Tiago a Judas" },
  { id: 26, title: "Estudo de Hebreus", icon: Star, color: "from-amber-500 to-orange-600", description: "Cristo superior a tudo" },
  { id: 27, title: "Estudo de Apocalipse", icon: Swords, color: "from-purple-700 to-indigo-800", description: "Revelação de Cristo" },
  { id: 28, title: "Missiologia", icon: Globe, color: "from-green-500 to-emerald-600", description: "Missões cristãs" },
  { id: 29, title: "Família Cristã", icon: Home, color: "from-pink-500 to-rose-500", description: "Lar segundo a Bíblia" },
  { id: 30, title: "Dons e Ministérios", icon: Sparkles, color: "from-yellow-500 to-amber-600", description: "Dons espirituais" },
  { id: 31, title: "Homilética", icon: Mic, color: "from-fuchsia-500 to-purple-600", description: "Arte de pregar" },
];

// Mock data for Module 1 — Bibliologia
export const BIBLIOLOGIA_CARDS: StudyCard[] = [
  {
    id: "bib-1",
    front: "O que é Bibliologia?",
    back: "Bibliologia é o estudo sistemático da Bíblia como Palavra de Deus. Abrange temas como inspiração, inerrância, canonicidade e suficiência das Escrituras. A palavra vem do grego 'biblion' (livro) + 'logos' (estudo).",
    type: "concept",
  },
  {
    id: "bib-2",
    front: "📖 2 Timóteo 3:16\n\n\"Toda Escritura é divinamente inspirada...\" — Complete o versículo e explique.",
    back: "\"Toda Escritura é divinamente inspirada e proveitosa para ensinar, para redarguir, para corrigir, para instruir em justiça.\" — A palavra 'inspirada' (theopneustos) significa literalmente 'soprada por Deus', indicando que Deus é a fonte última de toda a Escritura.",
    type: "verse",
  },
  {
    id: "bib-3",
    front: "Qual a diferença entre Revelação, Inspiração e Iluminação?",
    back: "• **Revelação**: Deus se dá a conhecer ao homem (geral e especial).\n• **Inspiração**: O processo pelo qual Deus guiou os autores bíblicos a escreverem Sua Palavra sem erro.\n• **Iluminação**: A obra do Espírito Santo que capacita o crente a compreender as Escrituras.",
    type: "concept",
  },
  {
    id: "bib-4",
    front: "Quantos livros compõem o cânon bíblico protestante e como estão divididos?",
    back: "66 livros: 39 no Antigo Testamento e 27 no Novo Testamento. O AT divide-se em: Pentateuco (5), Históricos (12), Poéticos (5) e Proféticos (17). O NT em: Evangelhos (4), Histórico (1), Epístolas (21) e Profético (1).",
    type: "question",
  },
  {
    id: "bib-5",
    front: "📖 2 Pedro 1:21\n\nO que este versículo ensina sobre a autoria da Bíblia?",
    back: "\"Porque a profecia nunca foi produzida por vontade de homem algum, mas os homens santos de Deus falaram inspirados pelo Espírito Santo.\" — Ensina a dupla autoria: humana e divina. Os escritores foram instrumentos guiados pelo Espírito, mantendo seus estilos mas transmitindo verdade infalível.",
    type: "verse",
  },
  {
    id: "bib-6",
    front: "O que significa 'Inerrância' das Escrituras?",
    back: "Inerrância é a doutrina que afirma que a Bíblia, em seus manuscritos originais (autógrafos), é totalmente livre de erro em tudo que afirma — seja em questões teológicas, históricas, científicas ou morais. Isso não significa que não haja variantes nos manuscritos copiados, mas que o texto original foi perfeito.",
    type: "concept",
  },
];

export const BIBLIOLOGIA_QUIZ: QuizQuestion[] = [
  {
    id: "quiz-bib-1",
    question: "Quantos livros possui a Bíblia protestante?",
    options: ["73 livros", "66 livros", "39 livros", "27 livros"],
    correctIndex: 1,
    explanation: "A Bíblia protestante possui 66 livros: 39 no Antigo Testamento e 27 no Novo Testamento.",
  },
  {
    id: "quiz-bib-2",
    question: "O que significa a palavra grega 'theopneustos' usada em 2 Timóteo 3:16?",
    options: ["Escrita por homens", "Soprada por Deus", "Revelada aos profetas", "Iluminada pelo Espírito"],
    correctIndex: 1,
    explanation: "'Theopneustos' vem de 'theos' (Deus) + 'pneo' (soprar), significando literalmente 'soprada por Deus'.",
  },
  {
    id: "quiz-bib-3",
    question: "Qual a diferença principal entre Inspiração e Iluminação?",
    options: [
      "Não há diferença",
      "Inspiração é para todos; Iluminação é só para pastores",
      "Inspiração é o processo de escrita guiada por Deus; Iluminação é a compreensão pelo Espírito Santo",
      "Inspiração acontece hoje; Iluminação já cessou",
    ],
    correctIndex: 2,
    explanation: "Inspiração refere-se ao processo único pelo qual Deus guiou os autores bíblicos. Iluminação é a obra contínua do Espírito que ajuda os crentes a entenderem a Palavra.",
  },
  {
    id: "quiz-bib-4",
    question: "Quem afirmou que 'os homens santos de Deus falaram inspirados pelo Espírito Santo'?",
    options: ["Paulo", "Pedro", "João", "Tiago"],
    correctIndex: 1,
    explanation: "Essa declaração está em 2 Pedro 1:21, escrita pelo apóstolo Pedro.",
  },
];
