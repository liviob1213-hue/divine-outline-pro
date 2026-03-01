import { useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import VersiculoDoDia from "@/components/VersiculoDoDia";
import ContinueReading from "@/components/ContinueReading";
import ToolsGrid from "@/components/ToolsGrid";
import BottomNav from "@/components/BottomNav";
import AnimatedBackground from "@/components/AnimatedBackground";
import NotificationPrompt from "@/components/NotificationPrompt";
import { getAllCachedHinosCount, cacheHinos } from "@/lib/offline-cache";

const ALL_HINOS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-all-hinos`;

const Index = () => {
  useEffect(() => {
    const preloadHinos = async () => {
      try {
        const count = await getAllCachedHinosCount();
        if (count >= 600) return;

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
        // Silently fail
      }
    };

    preloadHinos();
  }, []);

  return (
    <div className="min-h-screen bg-background animated-bg relative pb-20">
      <AnimatedBackground />
      <div className="relative z-10 max-w-5xl mx-auto px-4 lg:px-8">
        <Header />
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <HeroSection />
            <ToolsGrid />
          </div>
          {/* Sidebar on desktop */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4">
              <VersiculoDoDia />
              <ContinueReading />
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
      <NotificationPrompt />
    </div>
  );
};

export default Index;
