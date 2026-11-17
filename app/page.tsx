import SplitFocusHero from "@/components/SplitFocusHero";
import FeaturedWorkSection from "@/components/FeaturedWorkSection";

export default function Home() {
  return (
    <main id="top" className="relative min-h-screen overflow-x-hidden bg-black text-white selection:bg-[#ff2fb9] selection:text-white">
      {/* 1. The "Split-Focus" Pinned Hero Unveil (Scroll 0% -> 25%) */}
      <SplitFocusHero />

      {/* 2. Continued Architecture & Engineering Deep-Dive Showcase */}
      <FeaturedWorkSection />

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/10 px-6 py-10 text-center text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">
        <p>© {new Date().getFullYear()} Marwan Laboudy. All rights reserved.</p>
      </footer>
    </main>
  );
}
