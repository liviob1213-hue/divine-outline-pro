export const BIBLE_BOOKS = [
  "Gênesis","Êxodo","Levítico","Números","Deuteronômio","Josué","Juízes","Rute",
  "1 Samuel","2 Samuel","1 Reis","2 Reis","1 Crônicas","2 Crônicas","Esdras","Neemias",
  "Ester","Jó","Salmos","Provérbios","Eclesiastes","Cânticos","Isaías","Jeremias",
  "Lamentações","Ezequiel","Daniel","Oséias","Joel","Amós","Obadias","Jonas","Miquéias",
  "Naum","Habacuque","Sofonias","Ageu","Zacarias","Malaquias",
  "Mateus","Marcos","Lucas","João","Atos","Romanos","1 Coríntios","2 Coríntios",
  "Gálatas","Efésios","Filipenses","Colossenses","1 Tessalonicenses","2 Tessalonicenses",
  "1 Timóteo","2 Timóteo","Tito","Filemom","Hebreus","Tiago","1 Pedro","2 Pedro",
  "1 João","2 João","3 João","Judas","Apocalipse",
];

export const STUDY_TYPES = [
  "Expositório (Verso por Verso)",
  "Textual (Análise de Palavras)",
  "Temático (Por Tópicos)",
  "Narrativo (Histórico)",
  "Verso a Verso (Estudo Intensivo)",
  "Devocional (Reflexivo)",
  "Apologético (Defesa da Fé)",
  "Biográfico (Personagens Bíblicos)",
];

export const BIBLE_VERSIONS = [
  "Almeida Corrigida e Fiel (ACF)",
  "Almeida Revisada e Atualizada (ARA)",
  "Almeida Revisada e Corrigida (ARC)",
  "Almeida Século XXI (AS21)",
  "Almeida Atualizada (JFAA)",
  "King James Atualizada (KJA)",
  "King James Fiel (KJF)",
  "Nova Almeida Atualizada (NAA)",
  "Nova Bíblia Viva (NBV)",
  "Nova Tradução na Linguagem de Hoje (NTLH)",
  "Nova Versão Internacional (NVI)",
  "Nova Versão Transformadora (NVT)",
  "Tradução Brasileira (TB)",
];

export interface AnalysisOption {
  id: string;
  label: string;
  category: string;
}

export const ANALYSIS_OPTIONS: AnalysisOption[] = [
  // Análise Textual
  { id: "contexto_livro", label: "Contexto do Livro (autor, época, propósito)", category: "Análise Textual" },
  { id: "contexto_capitulo", label: "Contexto do Capítulo e do Livro", category: "Análise Textual" },
  { id: "contexto_historico", label: "Contexto Histórico e Cultural", category: "Análise Textual" },
  { id: "geografia", label: "Geografia e Locais mencionados", category: "Análise Textual" },
  { id: "estrutura_gramatical", label: "Estrutura gramatical e sintaxe", category: "Análise Textual" },
  { id: "estilo_literario", label: "Estilo Literário (poesia, prosa, parábola)", category: "Análise Textual" },
  { id: "abordagem_devocional", label: "Abordagem Devocional e Espiritual", category: "Análise Textual" },
  { id: "personagens", label: "Personagens e seus papéis na narrativa", category: "Análise Textual" },
  // Análise Linguística
  { id: "palavras_original", label: "Palavras do Original (Hebraico/Grego)", category: "Análise Linguística" },
  { id: "significado_etimologico", label: "Significado etimológico", category: "Análise Linguística" },
  { id: "palavras_chave", label: "Palavras-chave e seus significados", category: "Análise Linguística" },
  { id: "analise_teologica", label: "Análise Teológica Profunda", category: "Análise Linguística" },
  { id: "figuras_linguagem", label: "Figuras de linguagem e metáforas", category: "Análise Linguística" },
  // Conexões Bíblicas
  { id: "referencias_cruzadas", label: "Referências Cruzadas", category: "Conexões Bíblicas" },
  { id: "ligacao_lei", label: "Ligação com a Lei (Pentateuco)", category: "Conexões Bíblicas" },
  { id: "ligacao_profetas", label: "Ligação com os Profetas", category: "Conexões Bíblicas" },
  { id: "ligacao_evangelhos", label: "Ligação com os Evangelhos", category: "Conexões Bíblicas" },
  { id: "ligacao_epistolas", label: "Ligação com as Epístolas", category: "Conexões Bíblicas" },
  { id: "contexto_hist_profetico", label: "Contexto Histórico Profético", category: "Conexões Bíblicas" },
  { id: "conexao_escatologica", label: "Conexão Escatológica", category: "Conexões Bíblicas" },
  { id: "paralelos_at_nt", label: "Paralelos no Antigo/Novo Testamento", category: "Conexões Bíblicas" },
  { id: "conexoes_tradicao", label: "Conexões com a tradição da época", category: "Conexões Bíblicas" },
  // Análise Contextual Profunda
  { id: "perspectiva_judaica", label: "Perspectiva Judaica (Talmud, Midrash, Mishná)", category: "Análise Contextual Profunda" },
  { id: "contexto_escatologico", label: "Contexto Escatológico (últimos dias, apocalíptico)", category: "Análise Contextual Profunda" },
  { id: "provas_arqueologicas", label: "Provas Arqueológicas e Achados", category: "Análise Contextual Profunda" },
  { id: "periodo_historico", label: "Período Histórico do Acontecimento", category: "Análise Contextual Profunda" },
  { id: "costumes_sociais", label: "Costumes sociais e religiosos da época", category: "Análise Contextual Profunda" },
  { id: "influencias_culturais", label: "Influências culturais (grega, romana, egípcia)", category: "Análise Contextual Profunda" },
  // Aplicação Prática
  { id: "aplicacao_moderna", label: "Aplicação ao contexto moderno", category: "Aplicação Prática" },
  { id: "paralelo_novo_antigo", label: "Paralelo no Novo e no Antigo Testamento", category: "Aplicação Prática" },
  { id: "verdades_eternas", label: "Verdades eternas do texto", category: "Aplicação Prática" },
  { id: "desafios_praticos", label: "Desafios práticos e comportamentais", category: "Aplicação Prática" },
  { id: "aplicacao_familiar", label: "Aplicação para vida familiar e conjugal", category: "Aplicação Prática" },
  { id: "aplicacao_lideranca", label: "Aplicação para liderança pastoral", category: "Aplicação Prática" },
  // Extras Exclusivos
  { id: "ilustracoes", label: "Sugestões de Ilustrações e Histórias", category: "Extras Exclusivos ✨" },
  { id: "perguntas_reflexao", label: "Perguntas de Reflexão para a Igreja", category: "Extras Exclusivos ✨" },
  { id: "plano_slides", label: "Sugestão de Estrutura para Slides", category: "Extras Exclusivos ✨" },
  { id: "oracoes", label: "Orações Sugeridas (abertura e encerramento)", category: "Extras Exclusivos ✨" },
  { id: "dinamicas_grupo", label: "Dinâmicas de grupo para estudo bíblico", category: "Extras Exclusivos ✨" },
  { id: "mapa_mental", label: "Mapa mental do texto", category: "Extras Exclusivos ✨" },
  { id: "resumo_podcast", label: "Resumo para podcast ou redes sociais", category: "Extras Exclusivos ✨" },
  { id: "devocional_semanal", label: "Devocional semanal baseado no texto", category: "Extras Exclusivos ✨" },
];

export const CATEGORY_ICONS: Record<string, string> = {
  "Análise Textual": "📄",
  "Análise Linguística": "🔤",
  "Conexões Bíblicas": "🔗",
  "Análise Contextual Profunda": "💎",
  "Aplicação Prática": "💡",
  "Extras Exclusivos ✨": "🚀",
};
