export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="floating-particle w-32 h-32 top-[10%] left-[5%]" style={{ animationDelay: "0s", background: "hsl(25 95% 53% / 0.2)" }} />
      <div className="floating-particle w-24 h-24 top-[60%] right-[10%]" style={{ animationDelay: "3s", background: "hsl(0 72% 51% / 0.18)" }} />
      <div className="floating-particle w-16 h-16 top-[30%] right-[25%]" style={{ animationDelay: "6s", background: "hsl(25 95% 53% / 0.15)" }} />
      <div className="floating-particle w-20 h-20 bottom-[20%] left-[15%]" style={{ animationDelay: "9s", background: "hsl(0 72% 51% / 0.2)" }} />
      <div className="floating-particle w-14 h-14 top-[80%] left-[60%]" style={{ animationDelay: "4s", background: "hsl(25 95% 53% / 0.12)" }} />
      <div className="floating-particle w-40 h-40 top-[5%] right-[5%]" style={{ animationDelay: "2s", background: "hsl(25 95% 53% / 0.1)" }} />
      <div className="floating-particle w-10 h-10 top-[45%] left-[45%]" style={{ animationDelay: "7s", background: "hsl(0 72% 51% / 0.15)" }} />
      <div className="floating-particle w-28 h-28 bottom-[10%] right-[30%]" style={{ animationDelay: "5s", background: "hsl(25 85% 50% / 0.12)" }} />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 800px 600px at 30% 20%, hsl(25 95% 53% / 0.1), transparent), radial-gradient(ellipse 600px 500px at 70% 80%, hsl(0 72% 51% / 0.08), transparent)",
        }}
      />
    </div>
  );
}
