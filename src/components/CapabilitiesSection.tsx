import { useState } from 'react';
import { Atom, ArrowUpRight, Microscope, Scale } from 'lucide-react';

interface CapabilityCard {
  index: string;
  title: string;
  subtitle: string;
  description: string;
  specs: string;
  imageSrc?: string;
  imageAlt?: string;
  spanClass: string;
  fallbackIcon: 'flow' | 'analytical' | 'kilolab' | 'route';
}

const CAPABILITIES: CapabilityCard[] = [
  {
    index: '01.',
    title: 'Continuous-Flow & Photoredox Catalysis',
    subtitle: 'Residence-time control · 4 bar – 18 bar back-pressure',
    description:
      'Microfluidic coil and packed-bed reactors safely execute hazardous diazotizations, deoxyfluorinations, and visible-light photoredox couplings with reproducible heat transfer.',
    specs: 'Throughput: 50 g/hr to 12 kg/day · Thermal deviation < ±0.5 °C',
    imageSrc: '/src/assets/images/cap_flow_chemistry_1795525527455.jpg',
    imageAlt: 'Continuous-flow chemical synthesis reactor with coiled fluoropolymer tubing and stainless steel pumps',
    spanClass: 'lg:col-span-2',
    fallbackIcon: 'flow',
  },
  {
    index: '02.',
    title: 'Route Scouting & Retrosynthesis',
    subtitle: 'Parallel ligand screening · 96-well HTE',
    description:
      'Rapid identification of high-yielding, low-PMI synthetic routes for multi-step heterocyclic targets, deuterated standards, and PROTAC linkers.',
    specs: '24–96 micro-scale catalyst screens per 48-hour cycle',
    spanClass: 'lg:col-span-1',
    fallbackIcon: 'route',
  },
  {
    index: '03.',
    title: 'Analytical QC & Structural Elucidation',
    subtitle: '500 MHz CryoProbe NMR · LC-MS · Chiral SFC',
    description:
      'Every intermediate and final deliverable ships with quantitative purity verification, residual palladium analysis by ICP-MS, and Karl Fischer moisture assay.',
    specs: 'Detection limit < 1 ppm residual metal · USP/ICH Q3D ready',
    imageSrc: '/src/assets/images/cap_analytical_nmr_1795525528018.jpg',
    imageAlt: 'Automated HPLC-MS autosampler tray with glass chromatography vials in aluminum racks',
    spanClass: 'lg:col-span-1',
    fallbackIcon: 'analytical',
  },
  {
    index: '04.',
    title: 'Kilo-Lab & Non-GMP / cGMP Scale-Up',
    subtitle: '20 L to 250 L jacketed glass-lined reactors',
    description:
      'Seamless scale transition from medicinal chemistry milligram hits to multi-kilogram clinical precursors with full calorimetric safety screening (DSC / RC1).',
    specs: 'Operating envelope: −78 °C cryogenic to +180 °C pressurized',
    imageSrc: '/src/assets/images/cap_kilolab_reactor_1795525528522.jpg',
    imageAlt: 'Pharmaceutical kilo-lab suite with 50-liter jacketed glass chemical reactors and overhead stirrers',
    spanClass: 'lg:col-span-2',
    fallbackIcon: 'kilolab',
  },
];

interface CapabilitiesSectionProps {
  onSelectBench: () => void;
}

export function CapabilitiesSection({ onSelectBench }: CapabilitiesSectionProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <section id="capabilities" className="py-16 lg:py-20 bg-[#F8FAFC] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-mono tracking-wide text-slate-500 mb-2">
              Synthesis Infrastructure
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
              style={{ textWrap: 'balance' }}
            >
              End-to-end synthetic execution built for complex molecular targets
            </h2>
          </div>

          <button
            type="button"
            onClick={onSelectBench}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:text-[#1E3A8A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Simulate a reaction stoichiometry</span>
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {CAPABILITIES.map((cap) => {
            const hasImage = Boolean(cap.imageSrc) && !failedImages[cap.index];

            return (
              <article
                key={cap.index}
                className={`${cap.spanClass} bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col`}
              >
                {cap.imageSrc && (
                  <div className="h-52 sm:h-60 w-full bg-slate-100 border-b border-slate-200 overflow-hidden">
                    {hasImage ? (
                      <img
                        src={cap.imageSrc}
                        alt={cap.imageAlt}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [cap.index]: true }))
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500 p-6">
                        {cap.fallbackIcon === 'flow' && <Atom className="w-8 h-8 mb-2 text-[#1D4ED8]" />}
                        {cap.fallbackIcon === 'analytical' && (
                          <Microscope className="w-8 h-8 mb-2 text-[#1D4ED8]" />
                        )}
                        {cap.fallbackIcon === 'kilolab' && <Scale className="w-8 h-8 mb-2 text-[#1D4ED8]" />}
                        <span className="text-xs font-medium">{cap.title}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-mono text-slate-500">{cap.subtitle}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">
                      <span className="font-mono text-[#1D4ED8]">{cap.index} </span>
                      {cap.title}
                    </h3>
                    <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                      {cap.description}
                    </p>

                    {cap.fallbackIcon === 'route' && (
                      <dl className="mt-5 pt-4 border-t border-slate-100 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <dt className="text-slate-500">Ligand &amp; Catalyst Array</dt>
                          <dd className="font-mono tabular-nums text-slate-900">Pd, Ni, Ru, Ir-photoredox</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <dt className="text-slate-500">Reaction Scale / Well</dt>
                          <dd className="font-mono tabular-nums text-slate-900">0.01 – 0.25 mmol</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <dt className="text-slate-500">Solvent Matrix</dt>
                          <dd className="font-mono tabular-nums text-slate-900">12 anhydrous &amp; biphasic</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <dt className="text-slate-500">Readout Assay</dt>
                          <dd className="font-mono tabular-nums text-slate-900">UPLC-MS + qNMR</dd>
                        </div>
                      </dl>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 text-xs font-mono tabular-nums text-slate-700">
                    {cap.specs}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
