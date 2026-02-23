export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="floating-particle w-32 h-32 top-[10%] left-[5%]" style={{ animationDelay: "0s" }} />
      <div className="floating-particle w-24 h-24 top-[60%] right-[10%]" style={{ animationDelay: "3s", background: "hsl(0 72% 51% / 0.08)" }} />
      <div className="floating-particle w-16 h-16 top-[30%] right-[25%]" style={{ animationDelay: "6s" }} />
      <div className="floating-particle w-20 h-20 bottom-[20%] left-[15%]" style={{ animationDelay: "9s", background: "hsl(0 72% 51% / 0.1)" }} />
      <div className="floating-particle w-12 h-12 top-[80%] left-[60%]" style={{ animationDelay: "4s" }} />
      <div className="floating-particle w-40 h-40 top-[5%] right-[5%]" style={{ animationDelay: "2s", background: "hsl(25 95% 53% / 0.05)" }} />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 800px 600px at 30% 20%, hsl(25 95% 53% / 0.04), transparent), radial-gradient(ellipse 600px 500px at 70% 80%, hsl(0 72% 51% / 0.03), transparent)",
        }}
      />
    </div>
  );
}
