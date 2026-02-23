import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ContinueReading from "@/components/ContinueReading";
import ToolsGrid from "@/components/ToolsGrid";
import BottomNav from "@/components/BottomNav";
import AnimatedBackground from "@/components/AnimatedBackground";

const Index = () => {
  return (
    <div className="min-h-screen bg-background animated-bg relative">
      <AnimatedBackground />
      <div className="relative z-10 max-w-2xl mx-auto px-4">
        <Header />
        <HeroSection />
        <ContinueReading />
        <ToolsGrid />
      </div>
      <BottomNav />
    </div>
  );
};

export default Index;
