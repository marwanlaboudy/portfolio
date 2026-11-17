import HeroWithKineticSplit from "@/components/HeroWithKineticSplit";
import ExperienceSection from "@/components/ExperienceSection";

export default function Home() {
  return (
    <main
      id="top"
      className="relative min-h-screen overflow-x-hidden bg-black text-white selection:bg-[#ff2fb9] selection:text-white"
    >
      {/* Background ambient cyberpunk lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-[#7ee8ff]/10 blur-[150px]" />
        <div className="absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full bg-[#ff2fb9]/12 blur-[160px]" />
      </div>

      {/* Hero Section: Frameless Portrait, Kinetic Typography Split ("MARWAN" left, "LABOUDY" right),
          and Middle-Left/Right Glowing Phone Buttons for resapori.com and mariojuice.com */}
      <HeroWithKineticSplit />

      {/* Experience & Leadership Section:
          Lando Norris style kinetic reveals showcasing:
          - AI Engineer
          - Co-Founder & Creative Director of Cheri Band
          - Full-Stack Creative Developer (Re Sapori & Mario Juice) */}
      <ExperienceSection />

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/10 px-6 py-10 text-center text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">
        <p>© {new Date().getFullYear()} Marwan Laboudy. All rights reserved.</p>
      </footer>
    </main>
  );
}
