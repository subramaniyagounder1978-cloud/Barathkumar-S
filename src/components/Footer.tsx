export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="text-base font-bold tracking-tight text-slate-900">
            Valence Synthesis
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Basel Technology Park (CH) · Boston Seaport Innovation District (US) · ISO 9001:2015
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
          <a href="#capabilities" className="hover:text-slate-900 transition-colors">
            Capabilities
          </a>
          <a href="#reaction-bench" className="hover:text-slate-900 transition-colors">
            Reaction Bench
          </a>
          <a href="#reaction-library" className="hover:text-slate-900 transition-colors">
            Reaction Library
          </a>
          <a href="#analytical-qc" className="hover:text-slate-900 transition-colors">
            Analytical QC
          </a>
          <a href="#inquiry" className="hover:text-slate-900 transition-colors">
            Request Quote
          </a>
        </nav>

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Valence Synthesis AG. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
