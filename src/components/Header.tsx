import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onRequestQuote: () => void;
}

const NAV_ITEMS = [
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Reaction Bench', href: '#reaction-bench' },
  { label: 'Reaction Library', href: '#reaction-library' },
  { label: 'Analytical QC', href: '#analytical-qc' },
  { label: 'Inquiry', href: '#inquiry' },
];

export function Header({ onRequestQuote }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
        >
          Valence Synthesis
        </a>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-slate-900 hover:underline underline-offset-4 decoration-slate-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onRequestQuote}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Request Quote
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-md text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-md"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onRequestQuote();
              }}
              className="mt-2 w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-md transition-colors cursor-pointer"
            >
              Request Quote
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
