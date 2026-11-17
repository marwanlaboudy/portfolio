import HeroWithKineticSplit from "@/components/HeroWithKineticSplit";
import BelowTheFoldExperience from "@/components/BelowTheFoldExperience";

export default function Home() {
  return (
    <main
      id="top"
      className="relative min-h-screen overflow-x-hidden bg-[#07070a] text-white selection:bg-[#ec4899] selection:text-white"
    >
      {/* Background ambient cyberpunk lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-[#22d3ee]/10 blur-[150px]" />
        <div className="absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full bg-[#ec4899]/12 blur-[160px]" />
      </div>

      {/* Hero Section:
          - Centered portrait splitting the cyan/magenta "MARWAN LABOUDY" typography
          - Floating "RE SAPORI WEBSITE" and "MARIO JUICE WEBSITE" interactive smartphone cards
          - Top-left Lando Norris typographic lockup and top-right "AVAILABLE FOR WORK" status pill
          - Bottom "SCROLL DOWN TO SEE THE REST OF MY WORK" pill */}
      <HeroWithKineticSplit />

      {/* Below-The-Fold Cohesive Experience:
          1. Interactive "Signal Trace" SVG Circuit (Scroll 25% -> 75%)
          2. Horizontal "Telemetry" Project Deck (Scroll 60% -> 85%) with 300vh sticky scroll-jack
          3. Magnetic "Terminal CTA" Curtain Reveal (Scroll 85% -> 100%) with infinite marquee */}
      <BelowTheFoldExperience />
    </main>
  );
}
