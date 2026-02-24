import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/criar-esboco" element={<CriarEsboco />} />
          <Route path="/biblia" element={<Biblia />} />
          <Route path="/harpa" element={<Harpa />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/anotacoes" element={<Anotacoes />} />
          <Route path="/temas" element={<BancoTemas />} />
          <Route path="/chat" element={<ChatTeologico />} />
          <Route path="/materiais" element={<Materiais />} />
          <Route path="/dicionario" element={<DicionarioBiblico />} />
          <Route path="/enciclopedia" element={<EnciclopediaJudaica />} />
          <Route path="/install" element={<Install />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
