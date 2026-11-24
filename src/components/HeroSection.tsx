import { useState } from 'react';
import { ArrowRight, FlaskConical } from 'lucide-react';

interface HeroSectionProps {
  onExploreBench: () => void;
  onRequestQuote: () => void;
}

const KPI_METRICS = [
  {
    label: 'Analytical Purity Standard',
    value: '≥ 99.4 %',
    note: 'Verified by HPLC-UV, qNMR & Chiral SFC',
  },
  {
    label: 'Route Scouting Turnaround',
    value: '14 Days',
    note: 'Feasibility & stoichiometric route report',
  },
  {
    label: 'Batch Synthesis Capacity',
    value: '10 mg – 250 kg',
    note: 'Discovery libraries to kilo-lab GMP suites',
  },
  {
    label: 'Compliance & Documentation',
    value: 'ISO 9001 & cGMP',
    note: 'Full CoA, residual solvent & ICP-MS',
  },
];

export function HeroSection({ onExploreBench, onRequestQuote }: HeroSectionProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <section id="top" className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono tracking-wide text-slate-500 mb-4">
                Basel &amp; Boston Synthesis Facilities · Custom Route Development
              </p>

              <h1
                className="font-bold tracking-tight text-slate-900 leading-[1.08]"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', textWrap: 'balance' }}
              >
                Precision custom chemical synthesis from discovery to kilo-lab scale.
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                We design, optimize, and manufacture complex organic molecules, heterocycles, and
                chiral intermediates with full analytical release and transparent process economics.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onExploreBench}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                <span>Open Reaction Bench</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onRequestQuote}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                Request Custom Synthesis
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[260px] lg:min-h-[380px] rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
              {!imgError ? (
                <img
                  src="/src/assets/images/hero_synthesis_lab_1795525527655.jpg"
                  alt="Valence Synthesis organic chemistry laboratory showing borosilicate Schlenk manifolds, rotary evaporator, and continuous-flow reactor"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full lg:h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600">
                  <FlaskConical className="w-10 h-10 mb-3 text-[#1D4ED8]" aria-hidden="true" />
                  <p className="text-sm font-medium text-slate-800">
                    Continuous-Flow &amp; Schlenk Synthesis Suite
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {KPI_METRICS.map((kpi) => (
            <div key={kpi.label} className="flex flex-col">
              <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
              <span className="mt-1 text-2xl font-semibold font-mono tabular-nums text-slate-900">
                {kpi.value}
              </span>
              <span className="mt-1 text-xs text-slate-500">{kpi.note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
