import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Plus, FileText, Image, Video, Trash2, Upload, Loader2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";

type Material = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  content: string | null;
  file_url: string | null;
  created_at: string;
};

const TYPE_ICONS = { note: FileText, image: Image, video: Video };
const TYPE_LABELS = { note: "Anotação", image: "Imagem", video: "Vídeo" };

export default function Materiais() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"note" | "image" | "video">("note");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchMaterials = async () => {
    const { data } = await supabase
      .from("pastor_materials")
      .select("*")
      .order("created_at", { ascending: false });
    setMaterials((data as Material[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchMaterials(); }, []);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("pastor-files").upload(path, file);
    if (error) { setUploading(false); return null; }
    const { data } = supabase.storage.from("pastor-files").getPublicUrl(path);
    setUploading(false);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    let fileUrl: string | null = null;

    if ((formType === "image" || formType === "video") && fileRef.current?.files?.[0]) {
      fileUrl = await handleFileUpload(fileRef.current.files[0]);
      if (!fileUrl) return;
    }

    await supabase.from("pastor_materials").insert({
      title: title.trim(),
      description: null,
      type: formType,
      content: formType === "note" ? content : null,
      file_url: fileUrl,
    });

    setTitle("");
    setContent("");
    setShowForm(false);
    fetchMaterials();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("pastor_materials").delete().eq("id", id);
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">Materiais do Pregador</h1>
              <p className="text-xs text-muted-foreground font-body">Anotações, imagens e vídeos</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="p-2 rounded-xl bg-gradient-to-br from-secondary to-destructive text-primary-foreground hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-foreground">Novo Material</h3>
                  <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-muted">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Type selector */}
                <div className="flex gap-2 mb-4">
                  {(["note", "image", "video"] as const).map((t) => {
                    const Icon = TYPE_ICONS[t];
                    return (
                      <button
                        key={t}
                        onClick={() => setFormType(t)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-body font-semibold transition-all border ${
                          formType === t
                            ? "bg-secondary text-secondary-foreground border-secondary"
                            : "bg-card border-border text-muted-foreground hover:border-secondary"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {TYPE_LABELS[t]}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título do material"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring mb-3"
                />

                {formType === "note" && (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Conteúdo da anotação..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring mb-3 resize-none"
                  />
                )}

                {(formType === "image" || formType === "video") && (
                  <div className="mb-3">
                    <label className="flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-input hover:border-secondary cursor-pointer transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-body text-muted-foreground">
                        {uploading ? "Enviando..." : `Selecionar ${formType === "image" ? "imagem" : "vídeo"}`}
                      </span>
                      <input
                        ref={fileRef}
                        type="file"
                        accept={formType === "image" ? "image/*" : "video/*"}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!title.trim() || uploading}
                  className="w-full py-2.5 rounded-xl bg-gradient-gold text-primary text-sm font-body font-bold shadow-gold disabled:opacity-50 hover:scale-[1.02] transition-transform"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Salvar Material"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-body text-sm">Nenhum material salvo ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {materials.map((mat, i) => {
              const Icon = TYPE_ICONS[mat.type as keyof typeof TYPE_ICONS] || FileText;
              return (
                <motion.div
                  key={mat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card rounded-2xl p-5 border border-border shadow-card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-secondary" />
                      <span className="text-xs font-body font-bold text-secondary uppercase">
                        {TYPE_LABELS[mat.type as keyof typeof TYPE_LABELS]}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(mat.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="font-display font-bold text-foreground text-sm mb-1">{mat.title}</h3>
                  {mat.content && (
                    <p className="text-xs font-body text-foreground/70 leading-relaxed line-clamp-3">{mat.content}</p>
                  )}
                  {mat.file_url && mat.type === "image" && (
                    <img src={mat.file_url} alt={mat.title} className="mt-2 rounded-lg max-h-48 object-cover w-full" />
                  )}
                  {mat.file_url && mat.type === "video" && (
                    <video src={mat.file_url} controls className="mt-2 rounded-lg max-h-48 w-full" />
                  )}
                  <p className="text-[10px] text-muted-foreground font-body mt-2">
                    {new Date(mat.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
