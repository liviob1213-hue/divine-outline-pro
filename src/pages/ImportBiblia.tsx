import { useState, useRef } from "react";
import { ArrowLeft, Upload, Loader2, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const SEED_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seed-biblia`;

export default function ImportBiblia() {
  const [status, setStatus] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setStatus((s) => [...s, `📄 Lendo ${file.name}...`]);
    const text = await file.text();
    const verses = JSON.parse(text) as any[];
    setStatus((s) => [...s, `✅ ${verses.length.toLocaleString()} versículos encontrados`]);

    const CHUNK = 5000;
    for (let i = 0; i < verses.length; i += CHUNK) {
      const chunk = verses.slice(i, i + CHUNK);
      setStatus((s) => [...s, `⬆️ Enviando lote ${Math.floor(i / CHUNK) + 1}/${Math.ceil(verses.length / CHUNK)}...`]);
      try {
        const resp = await fetch(SEED_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ verses: chunk }),
        });
        const data = await resp.json();
        if (data.success) {
          setStatus((s) => [...s, `✅ Lote inserido: ${data.inserted} versículos`]);
        } else {
          setStatus((s) => [...s, `⚠️ Erro no lote: ${data.error}`]);
        }
      } catch (err: any) {
        setStatus((s) => [...s, `❌ Erro: ${err.message}`]);
      }
    }
  };

  const handleFiles = async (files: FileList) => {
    setLoading(true);
    setDone(false);
    setStatus([]);
    for (let i = 0; i < files.length; i++) {
      await processFile(files[i]);
    }
    setStatus((s) => [...s, "🎉 Importação concluída!"]);
    setLoading(false);
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="font-display text-xl font-bold text-foreground">Importar Bíblia</h1>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 mb-4">
          <p className="text-sm font-body text-muted-foreground mb-4">
            Selecione os 6 arquivos JSON da Bíblia para importar no banco de dados.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".json"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-body font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
            style={{ background: "var(--gradient-card-purple)" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : done ? <CheckCircle className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            {loading ? "Importando..." : done ? "Concluído!" : "Selecionar Arquivos JSON"}
          </button>
        </div>

        {status.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-4 max-h-80 overflow-y-auto">
            {status.map((s, i) => (
              <p key={i} className="text-xs font-body text-foreground/80 py-0.5">{s}</p>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
