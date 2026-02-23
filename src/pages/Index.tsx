import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ToolsGrid from "@/components/ToolsGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4">
        <Header />
        <HeroSection />
        <ToolsGrid />
      </div>
    </div>
  );
};

export default Index;
