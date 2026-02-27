import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthGuard from "@/components/AuthGuard";
import Login from "./pages/Login";
import Index from "./pages/Index";
import CriarEsboco from "./pages/CriarEsboco";
import Biblia from "./pages/Biblia";
import Harpa from "./pages/Harpa";
import Favoritos from "./pages/Favoritos";
import Anotacoes from "./pages/Anotacoes";
import BancoTemas from "./pages/BancoTemas";
import ChatTeologico from "./pages/ChatTeologico";
import Materiais from "./pages/Materiais";
import DicionarioBiblico from "./pages/DicionarioBiblico";
import EnciclopediaJudaica from "./pages/EnciclopediaJudaica";
import Install from "./pages/Install";
import ImportBiblia from "./pages/ImportBiblia";
import CursoTeologia from "./pages/CursoTeologia";
import WebhookTest from "./pages/WebhookTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/webhook-test" element={<WebhookTest />} />
          <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
          <Route path="/criar-esboco" element={<AuthGuard><CriarEsboco /></AuthGuard>} />
          <Route path="/biblia" element={<AuthGuard><Biblia /></AuthGuard>} />
          <Route path="/harpa" element={<AuthGuard><Harpa /></AuthGuard>} />
          <Route path="/favoritos" element={<AuthGuard><Favoritos /></AuthGuard>} />
          <Route path="/anotacoes" element={<AuthGuard><Anotacoes /></AuthGuard>} />
          <Route path="/temas" element={<AuthGuard><BancoTemas /></AuthGuard>} />
          <Route path="/chat" element={<AuthGuard><ChatTeologico /></AuthGuard>} />
          <Route path="/materiais" element={<AuthGuard><Materiais /></AuthGuard>} />
          <Route path="/dicionario" element={<AuthGuard><DicionarioBiblico /></AuthGuard>} />
          <Route path="/enciclopedia" element={<AuthGuard><EnciclopediaJudaica /></AuthGuard>} />
          <Route path="/install" element={<AuthGuard><Install /></AuthGuard>} />
          <Route path="/import-biblia" element={<AuthGuard><ImportBiblia /></AuthGuard>} />
          <Route path="/curso" element={<AuthGuard><CursoTeologia /></AuthGuard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
