import { useMemo, useState } from 'react';
import { Check, Copy, Download, RotateCcw } from 'lucide-react';
import type { ReactionProtocol } from '../data/reactions';
import {
  calculateStoichiometry,
  formatCsvExport,
  formatMassDisplay,
  generateKineticsSeries,
  type KineticsPoint,
} from '../utils/stoichiometry';

interface ReactionBenchProps {
  protocols: ReactionProtocol[];
  selectedProtocolId: string;
  onSelectProtocol: (id: string) => void;
  onRequestRouteQuote: (protocolName: string, scaleSummary: string) => void;
}

const PRESET_SCALES_MMOL = [5, 10, 50, 250];

export function ReactionBench({
  protocols,
  selectedProtocolId,
  onSelectProtocol,
  onRequestRouteQuote,
}: ReactionBenchProps) {
  const protocol = useMemo(
    () => protocols.find((p) => p.id === selectedProtocolId) ?? protocols[0],
    [protocols, selectedProtocolId]
  );

  // Per-protocol parameters stored keyed by protocol id so switching preserves or resets cleanly
  const [scaleMmol, setScaleMmol] = useState<number>(protocol.defaultScaleMmol);
  const [temperatureC, setTemperatureC] = useState<number>(protocol.defaultTempC);
  const [catalystMolPct, setCatalystMolPct] = useState<number>(protocol.defaultCatalystMolPct);
  const [customEquivalents, setCustomEquivalents] = useState<Record<string, number>>({});
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Sync defaults when protocol changes via external trigger (e.g., Library "Load in Bench")
  const [lastProtocolId, setLastProtocolId] = useState<string>(protocol.id);
  if (protocol.id !== lastProtocolId) {
    setLastProtocolId(protocol.id);
    setScaleMmol(protocol.defaultScaleMmol);
    setTemperatureC(protocol.defaultTempC);
    setCatalystMolPct(protocol.defaultCatalystMolPct);
    setCustomEquivalents({});
    setHoveredPointIdx(null);
  }

  const stoichiometry = useMemo(
    () =>
      calculateStoichiometry(protocol, {
        targetScaleMmol: scaleMmol,
        equivalentsByReagentId: customEquivalents,
        temperatureC,
        catalystMolPct,
      }),
    [protocol, scaleMmol, customEquivalents, temperatureC, catalystMolPct]
  );

  const kineticsSeries = useMemo(
    () => generateKineticsSeries(protocol, temperatureC, catalystMolPct),
    [protocol, temperatureC, catalystMolPct]
  );

  const activePoint: KineticsPoint =
    hoveredPointIdx !== null && kineticsSeries[hoveredPointIdx]
      ? kineticsSeries[hoveredPointIdx]
      : kineticsSeries[kineticsSeries.length - 1];

  const handleReset = () => {
    setScaleMmol(protocol.defaultScaleMmol);
    setTemperatureC(protocol.defaultTempC);
    setCatalystMolPct(protocol.defaultCatalystMolPct);
    setCustomEquivalents({});
  };

  const handleDownloadCsv = () => {
    const csv = formatCsvExport(
      protocol,
      {
        targetScaleMmol: scaleMmol,
        equivalentsByReagentId: customEquivalents,
        temperatureC,
        catalystMolPct,
      },
      stoichiometry
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${protocol.id}-${scaleMmol}mmol-batch.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopySheet = async () => {
    const lines = [
      `Protocol: ${protocol.name}`,
      `Target Product: ${protocol.product.name} (${protocol.product.formula})`,
      `Scale: ${scaleMmol} mmol · Temp: ${temperatureC} °C · Catalyst: ${catalystMolPct} mol%`,
      `Expected Yield: ${stoichiometry.expectedYieldG.toFixed(3)} g (${protocol.literatureYieldPct}%)`,
      '',
      'Reagent Charges:',
      ...stoichiometry.rows.map(
        (r) =>
          `- ${r.name} [${r.role}]: ${formatMassDisplay(r.massG)}${
            r.volumeMl !== null ? ` (${r.volumeMl.toFixed(2)} mL)` : ''
          } · ${r.mmol.toFixed(2)} mmol`
      ),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(lines);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2000);
    } catch {
      setCopiedNotice(false);
    }
  };

  // Build SVG polylines for Kinetics chart
  const chartW = 520;
  const chartH = 210;
  const padL = 44;
  const padR = 16;
  const padT = 18;
  const padB = 30;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const toX = (idx: number) => padL + (idx / (kineticsSeries.length - 1)) * innerW;
  const toY = (pct: number) => padT + innerH - (pct / 100) * innerH;

  const conversionPath = kineticsSeries
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(pt.conversionPct).toFixed(1)}`)
    .join(' ');

  const yieldPath = kineticsSeries
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(pt.productYieldPct).toFixed(1)}`)
    .join(' ');

  const yieldAreaPath = `${yieldPath} L ${toX(kineticsSeries.length - 1).toFixed(1)} ${(
    padT + innerH
  ).toFixed(1)} L ${padL} ${(padT + innerH).toFixed(1)} Z`;

  return (
    <section id="reaction-bench" className="py-16 lg:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <p className="text-xs font-mono tracking-wide text-slate-500 mb-2">
              Interactive Process Workbench
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
              style={{ textWrap: 'balance' }}
            >
              Stoichiometry &amp; reaction kinetics bench
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Select a transformation, adjust batch scale, equivalents, temperature, and catalyst
              loading to calculate exact reagent charges, PMI, and time-conversion kinetics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleCopySheet}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                  <span>Copied Procedure</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copy Procedure</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Protocol selector tabs */}
        <div
          role="tablist"
          aria-label="Synthesis protocol selector"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-1.5 p-1.5 bg-slate-100 border border-slate-200 rounded-lg mb-6"
        >
          {protocols.map((item) => {
            const active = item.id === protocol.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={item.name}
                onClick={() => onSelectProtocol(item.id)}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors truncate cursor-pointer ${
                  active
                    ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Asymmetric Split Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Control Column */}
          <div className="lg:col-span-4 bg-[#F8FAFC] border border-slate-200 rounded-lg p-5 space-y-6">
            <div>
              <label
                htmlFor="bench-scale-input"
                className="block text-xs font-semibold text-slate-700 mb-2"
              >
                Target Substrate Scale (mmol)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="bench-scale-input"
                  type="number"
                  min={0.1}
                  max={5000}
                  step={0.5}
                  value={scaleMmol}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setScaleMmol(Number.isFinite(val) && val > 0 ? val : 0.1);
                  }}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <span className="text-xs font-mono text-slate-500 shrink-0">mmol</span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {PRESET_SCALES_MMOL.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setScaleMmol(preset)}
                    className={`px-2.5 py-1 text-xs font-mono tabular-nums rounded border transition-colors whitespace-nowrap cursor-pointer ${
                      scaleMmol === preset
                        ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {preset} mmol
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="bench-temp-slider"
                  className="text-xs font-semibold text-slate-700"
                >
                  Reaction Temperature
                </label>
                <span className="text-sm font-mono font-semibold tabular-nums text-slate-900">
                  {temperatureC} °C
                </span>
              </div>
              <input
                id="bench-temp-slider"
                type="range"
                min={protocol.minTempC}
                max={protocol.maxTempC}
                step={1}
                value={temperatureC}
                onChange={(e) => setTemperatureC(Number(e.target.value))}
                className="w-full accent-[#1D4ED8] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-500 mt-1">
                <span>{protocol.minTempC} °C</span>
                <span>Optimal: {protocol.defaultTempC} °C</span>
                <span>{protocol.maxTempC} °C</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="bench-catalyst-slider"
                  className="text-xs font-semibold text-slate-700"
                >
                  Catalyst / Promotor Loading
                </label>
                <span className="text-sm font-mono font-semibold tabular-nums text-slate-900">
                  {catalystMolPct.toFixed(1)} mol%
                </span>
              </div>
              <input
                id="bench-catalyst-slider"
                type="range"
                min={0.2}
                max={Math.max(5, protocol.defaultCatalystMolPct * 2)}
                step={0.1}
                value={catalystMolPct}
                onChange={(e) => setCatalystMolPct(Number(e.target.value))}
                className="w-full accent-[#1D4ED8] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-500 mt-1">
                <span>0.2 mol%</span>
                <span>Std: {protocol.defaultCatalystMolPct} mol%</span>
                <span>{Math.max(5, protocol.defaultCatalystMolPct * 2).toFixed(1)} mol%</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Limiting Reagent</span>
                <span className="font-medium text-slate-900 text-right">
                  {stoichiometry.limitingReagentName}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Theoretical Yield (100%)</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900">
                  {formatMassDisplay(stoichiometry.theoreticalYieldG)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Expected Isolated ({stoichiometry.literatureYieldPct}%)
                </span>
                <span className="font-mono font-semibold tabular-nums text-[#1D4ED8]">
                  {formatMassDisplay(stoichiometry.expectedYieldG)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Atom Economy / PMI</span>
                <span className="font-mono tabular-nums text-slate-800">
                  {stoichiometry.atomEconomyPct.toFixed(1)}% · PMI{' '}
                  {stoichiometry.processMassIntensity.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Reactor Volume</span>
                <span className="font-mono tabular-nums text-slate-800">
                  {stoichiometry.totalReactionVolumeMl.toFixed(1)} mL
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong className="font-semibold text-slate-800">Process Safety:</strong>{' '}
                {protocol.safetyNote}
              </p>
              <button
                type="button"
                onClick={() =>
                  onRequestRouteQuote(
                    protocol.name,
                    `${formatMassDisplay(stoichiometry.expectedYieldG)} target (${scaleMmol} mmol scale)`
                  )
                }
                className="mt-4 w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              >
                Request Batch Quote for This Route
              </button>
            </div>
          </div>

          {/* Right Viewport Stage: Scheme + Kinetics + Stoichiometry Table */}
          <div className="lg:col-span-8 space-y-6">
            {/* Reaction Scheme Bar */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <span className="text-xs font-mono text-slate-500">
                    {protocol.category} · {protocol.typicalTurnaroundDays}d turnaround
                  </span>
                  <h3 className="text-base font-semibold text-slate-900 mt-0.5">{protocol.name}</h3>
                </div>
                <span className="text-xs font-mono text-slate-600 bg-white px-2.5 py-1 border border-slate-200 rounded">
                  SMILES: {protocol.product.smiles}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center bg-white border border-slate-200 rounded-md p-4">
                <div className="md:col-span-3 text-center md:text-left">
                  <div className="text-xs font-mono text-slate-500">Reactant A</div>
                  <div className="text-sm font-semibold text-slate-900 mt-0.5">
                    {protocol.schemeLabel.reactantA}
                  </div>
                </div>

                <div className="md:col-span-1 text-center text-slate-400 font-mono text-sm">+</div>

                <div className="md:col-span-2 text-center md:text-left">
                  <div className="text-xs font-mono text-slate-500">Partner B</div>
                  <div className="text-sm font-semibold text-slate-900 mt-0.5">
                    {protocol.schemeLabel.reactantB}
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col items-center justify-center py-1">
                  <span className="text-[11px] font-mono text-[#1D4ED8] text-center leading-tight">
                    {protocol.schemeLabel.conditionsTop}
                  </span>
                  <svg
                    viewBox="0 0 120 14"
                    className="w-28 h-3.5 my-1 text-slate-700"
                    aria-hidden="true"
                  >
                    <line x1="2" y1="7" x2="112" y2="7" stroke="currentColor" strokeWidth="1.5" />
                    <polygon points="118,7 109,3 109,11" fill="currentColor" />
                  </svg>
                  <span className="text-[11px] font-mono text-slate-500 text-center leading-tight">
                    {protocol.schemeLabel.conditionsBottom}
                  </span>
                </div>

                <div className="md:col-span-3 text-center md:text-right">
                  <div className="text-xs font-mono text-slate-500">
                    Product ({protocol.product.formula})
                  </div>
                  <div className="text-sm font-semibold text-slate-900 mt-0.5">
                    {protocol.schemeLabel.product}
                  </div>
                </div>
              </div>
            </div>

            {/* Stoichiometric Charge Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">
                  Stoichiometric Charge Sheet
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  Adjust equivalents inline to recalculate limiting reagent
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-mono text-slate-500">
                      <th className="py-2.5 px-4 font-medium">Reagent</th>
                      <th className="py-2.5 px-3 font-medium">Role</th>
                      <th className="py-2.5 px-3 font-medium text-right">MW (g/mol)</th>
                      <th className="py-2.5 px-3 font-medium text-right">Equiv.</th>
                      <th className="py-2.5 px-3 font-medium text-right">mmol</th>
                      <th className="py-2.5 px-3 font-medium text-right">Mass</th>
                      <th className="py-2.5 px-4 font-medium text-right">Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {stoichiometry.rows.map((row) => {
                      const canEditEquiv =
                        !row.isSolvent && row.role !== 'Catalyst';

                      return (
                        <tr
                          key={row.id}
                          className={row.isLimiting ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'}
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">{row.name}</div>
                            <div className="text-xs font-mono text-slate-500">
                              {row.formula} · {row.purityPct}% purity
                              {row.isLimiting ? ' · Limiting' : ''}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-600 whitespace-nowrap">
                            {row.role}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-slate-700">
                            {row.molarMass.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-xs tabular-nums">
                            {canEditEquiv ? (
                              <input
                                type="number"
                                aria-label={`Equivalents for ${row.name}`}
                                min={0.1}
                                max={20}
                                step={0.05}
                                value={Number(row.equivalents.toFixed(2))}
                                onChange={(e) => {
                                  const next = parseFloat(e.target.value);
                                  if (Number.isFinite(next) && next > 0) {
                                    setCustomEquivalents((prev) => ({ ...prev, [row.id]: next }));
                                  }
                                }}
                                className="w-16 px-1.5 py-1 text-right font-mono tabular-nums bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                              />
                            ) : (
                              <span className="text-slate-500">
                                {row.isSolvent ? 'Solvent' : `${(row.equivalents * 100).toFixed(1)}%`}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-slate-700">
                            {row.mmol.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-xs font-semibold tabular-nums text-slate-900">
                            {formatMassDisplay(row.massG)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-xs tabular-nums text-slate-700">
                            {row.volumeMl !== null ? `${row.volumeMl.toFixed(2)} mL` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interactive Kinetics SVG Chart */}
            <div className="border border-slate-200 rounded-lg p-5 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Simulated Reaction Conversion &amp; Selectivity Profile
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Solid: Product Yield (%) · Dashed: Total Substrate Conversion (%) · Hover points to inspect
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono tabular-nums bg-[#F8FAFC] border border-slate-200 rounded px-3 py-1.5">
                  <span className="text-slate-600">t = {activePoint.timeMin} min</span>
                  <span className="text-[#1D4ED8] font-semibold">
                    Yield: {activePoint.productYieldPct.toFixed(1)}%
                  </span>
                  <span className="text-slate-700">
                    Conv: {activePoint.conversionPct.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartW} ${chartH}`}
                  className="w-full h-56 select-none"
                  role="img"
                  aria-label={`Reaction kinetics plot showing conversion and yield over ${protocol.reactionTimeMin} minutes`}
                >
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((tick) => {
                    const y = toY(tick);
                    return (
                      <g key={tick}>
                        <line
                          x1={padL}
                          y1={y}
                          x2={chartW - padR}
                          y2={y}
                          stroke="#E2E8F0"
                          strokeWidth="1"
                        />
                        <text
                          x={padL - 8}
                          y={y + 3.5}
                          textAnchor="end"
                          className="fill-slate-400 text-[10px] font-mono"
                        >
                          {tick}%
                        </text>
                      </g>
                    );
                  })}

                  {/* X-axis ticks */}
                  {[0, 3, 6, 9, 12].map((idx) => {
                    const pt = kineticsSeries[idx];
                    if (!pt) return null;
                    const x = toX(idx);
                    return (
                      <text
                        key={idx}
                        x={x}
                        y={chartH - 8}
                        textAnchor="middle"
                        className="fill-slate-400 text-[10px] font-mono"
                      >
                        {pt.timeMin}m
                      </text>
                    );
                  })}

                  {/* Subtle area fill under yield */}
                  <path d={yieldAreaPath} fill="#1D4ED8" fillOpacity="0.08" />

                  {/* Conversion dashed line */}
                  <path
                    d={conversionPath}
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="1.75"
                    strokeDasharray="4 4"
                  />

                  {/* Product yield solid line */}
                  <path d={yieldPath} fill="none" stroke="#1D4ED8" strokeWidth="2.25" />

                  {/* Interactive hover points */}
                  {kineticsSeries.map((pt, i) => {
                    const cx = toX(i);
                    const cy = toY(pt.productYieldPct);
                    const isHovered = hoveredPointIdx === i;

                    return (
                      <g
                        key={pt.timeMin}
                        onMouseEnter={() => setHoveredPointIdx(i)}
                        onMouseLeave={() => setHoveredPointIdx(null)}
                        className="cursor-crosshair"
                      >
                        <rect
                          x={cx - innerW / kineticsSeries.length / 2}
                          y={padT}
                          width={innerW / kineticsSeries.length}
                          height={innerH}
                          fill="transparent"
                        />
                        {isHovered && (
                          <line
                            x1={cx}
                            y1={padT}
                            x2={cx}
                            y2={padT + innerH}
                            stroke="#94A3B8"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                          />
                        )}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isHovered ? 4.5 : 2.5}
                          fill={isHovered ? '#1E3A8A' : '#1D4ED8'}
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
