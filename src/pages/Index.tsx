import { useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import VersiculoDoDia from "@/components/VersiculoDoDia";
import ContinueReading from "@/components/ContinueReading";
import ToolsGrid from "@/components/ToolsGrid";
import BottomNav from "@/components/BottomNav";
import AnimatedBackground from "@/components/AnimatedBackground";
import { getAllCachedHinosCount, cacheHinos } from "@/lib/offline-cache";

const ALL_HINOS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-all-hinos`;

const Index = () => {
  // Preload all 640 hymns for offline use on first visit
  useEffect(() => {
    const preloadHinos = async () => {
      try {
        const count = await getAllCachedHinosCount();
        if (count >= 600) return; // Already cached

        const resp = await fetch(ALL_HINOS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({}),
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data.hinos?.length > 0) {
            await cacheHinos(data.hinos);
            console.log(`[PregAI] ${data.hinos.length} hinos cached for offline use`);
          }
        }
      } catch {
        // Silently fail - will try again next visit
      }
    };

    preloadHinos();
  }, []);

  return (
    <div className="min-h-screen bg-background animated-bg relative">
      <AnimatedBackground />
      <div className="relative z-10 max-w-2xl mx-auto px-4">
        <Header />
        <HeroSection />
        <VersiculoDoDia />
        <ContinueReading />
        <ToolsGrid />
      </div>
      <BottomNav />
    </div>
  );
};

export default Index;
