import FaceLooker from "@/components/FaceLooker";
import { ArrowUpRight, Mail, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B1220] text-[#FAF7F0] flex flex-col justify-between selection:bg-[#C49A6C]/30 selection:text-white">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#152132] rounded-full blur-[128px] opacity-60" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#C49A6C]/10 rounded-full blur-[140px]" />
      </div>

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between border-b border-[#22334A]/40">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#C49A6C] animate-pulse" />
          <span className="font-semibold tracking-wider text-sm uppercase text-[#DECDB7]">
            Portfolio
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[#8A9BB3]">
          <span className="px-2.5 py-1 rounded-full bg-[#152132] border border-[#22334A]/80 text-[#DECDB7]">
            Available for Projects
          </span>
        </div>
      </header>

      {/* Hero Section with Interactive Avatar */}
      <section className="w-full max-w-6xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Bio & Introduction */}
        <div className="lg:col-span-7 flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#152132] border border-[#22334A] text-xs font-mono text-[#C49A6C]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Cursor Tracking Enabled</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF7F0] leading-[1.1]">
            Engineering exceptional web experiences.
          </h1>

          <p className="text-base sm:text-lg text-[#8A9BB3] max-w-xl leading-relaxed">
            Full-stack developer crafting high-performance digital products, responsive web applications, and interactive user interfaces.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#contact"
              className="px-6 py-3 rounded-xl bg-[#C49A6C] hover:bg-[#D4AF85] text-[#0B1220] font-semibold text-sm transition-all duration-200 shadow-[0_4px_20px_rgba(196,154,108,0.25)] flex items-center gap-2"
            >
              Get in Touch
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <div className="flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-[#152132] hover:bg-[#182436] border border-[#22334A] text-[#DECDB7] hover:text-white transition-all duration-200"
                aria-label="GitHub"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-[#152132] hover:bg-[#182436] border border-[#22334A] text-[#DECDB7] hover:text-white transition-all duration-200"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
              <a
                href="mailto:contact@example.com"
                className="p-3 rounded-xl bg-[#152132] hover:bg-[#182436] border border-[#22334A] text-[#DECDB7] hover:text-white transition-all duration-200"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive FaceLooker Component */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <FaceLooker
            src="/avatar_square.jpg"
            size={320}
            className="cursor-pointer"
          />
          <p className="mt-4 text-xs font-mono text-[#8A9BB3] text-center">
            Move your cursor across the screen to direct gaze
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 border-t border-[#22334A]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8A9BB3]">
        <p>© {new Date().getFullYear()} Portfolio. All rights reserved.</p>
        <p className="flex items-center gap-2 text-[#DECDB7]">
          Built with Next.js 16, React 19 & Tailwind CSS
        </p>
      </footer>
    </main>
  );
}
