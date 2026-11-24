export type SpectrumId = 'hplc' | 'nmr' | 'sfc';

export interface PeakRow {
  label: string;
  position: string;
  areaOrIntegral: string;
  assignment: string;
}

export interface AnalyticalTrace {
  id: SpectrumId;
  title: string;
  instrument: string;
  sampleCode: string;
  metricLabel: string;
  metricValue: string;
  xAxisLabel: string;
  yAxisLabel: string;
  xTicks: string[];
  points: Array<{ x: number; y: number }>; // normalized 0..100 x and 0..100 y
  annotations: Array<{ x: number; y: number; text: string }>;
  peaks: PeakRow[];
}

export const ANALYTICAL_TRACES: Record<SpectrumId, AnalyticalTrace> = {
  hplc: {
    id: 'hplc',
    title: 'Reversed-Phase HPLC-UV Chromatogram',
    instrument: 'Agilent 1290 Infinity II · C18 (2.1 × 100 mm, 1.8 µm) · 254 nm',
    sampleCode: 'LOT VS-2026-0418A',
    metricLabel: 'Chromatographic Purity',
    metricValue: '99.42 %',
    xAxisLabel: 'Retention Time (min)',
    yAxisLabel: 'Absorbance (mAU)',
    xTicks: ['0.0', '2.5', '5.0', '7.5', '10.0', '12.5'],
    points: [
      { x: 0, y: 2 },
      { x: 6, y: 2.5 },
      { x: 8, y: 6 },
      { x: 9.5, y: 2.2 },
      { x: 18, y: 2 },
      { x: 24, y: 2 },
      { x: 25.2, y: 4.5 },
      { x: 26.5, y: 2 },
      { x: 42, y: 2 },
      { x: 54, y: 2.1 },
      { x: 57, y: 3.5 },
      { x: 58.2, y: 28 },
      { x: 59.3, y: 94 },
      { x: 60.4, y: 31 },
      { x: 62, y: 3.2 },
      { x: 65, y: 2 },
      { x: 78, y: 2 },
      { x: 80, y: 3.8 },
      { x: 82, y: 2 },
      { x: 100, y: 2 },
    ],
    annotations: [
      { x: 8, y: 12, text: 'Solvent Front' },
      { x: 59.3, y: 97, text: 'Target Product (tR 7.41 min)' },
    ],
    peaks: [
      { label: 'Peak 1', position: '1.02 min', areaOrIntegral: '0.18 %', assignment: 'Void / DMSO residual' },
      { label: 'Peak 2', position: '3.15 min', areaOrIntegral: '0.26 %', assignment: 'Unreacted boronic acid' },
      { label: 'Peak 3 (Main)', position: '7.41 min', areaOrIntegral: '99.42 %', assignment: '4-Methoxybiphenyl (Target)' },
      { label: 'Peak 4', position: '10.02 min', areaOrIntegral: '0.14 %', assignment: 'Trace biaryl homocouple' },
    ],
  },
  nmr: {
    id: 'nmr',
    title: '1H NMR Spectrum (500 MHz, CDCl3)',
    instrument: 'Bruker Avance NEO 500 MHz · CryoProbe Prodigy · 298 K',
    sampleCode: 'LOT VS-2026-0418A',
    metricLabel: 'qNMR Assay Potency',
    metricValue: '99.18 wt%',
    xAxisLabel: 'Chemical Shift δ (ppm)',
    yAxisLabel: 'Normalized Intensity',
    xTicks: ['10.0', '8.0', '6.0', '4.0', '2.0', '0.0'],
    points: [
      { x: 0, y: 2 },
      { x: 18, y: 2 },
      { x: 22, y: 2 },
      { x: 24, y: 58 },
      { x: 24.7, y: 62 },
      { x: 25.5, y: 18 },
      { x: 26.8, y: 45 },
      { x: 27.6, y: 52 },
      { x: 28.5, y: 39 },
      { x: 29.4, y: 12 },
      { x: 30.8, y: 54 },
      { x: 31.6, y: 51 },
      { x: 33, y: 2.5 },
      { x: 61, y: 2 },
      { x: 62, y: 92 },
      { x: 63, y: 2.5 },
      { x: 86, y: 2 },
      { x: 96, y: 2 },
      { x: 97, y: 34 },
      { x: 98, y: 2 },
      { x: 100, y: 2 },
    ],
    annotations: [
      { x: 26.5, y: 69, text: 'Ar-H (9H, m)' },
      { x: 62, y: 96, text: '-OCH3 (3H, s)' },
      { x: 97, y: 41, text: 'TMS (0.00 ppm)' },
    ],
    peaks: [
      { label: 'm (2H)', position: '7.56 – 7.51 ppm', areaOrIntegral: '2.01 H', assignment: 'Biphenyl ortho-ArH' },
      { label: 'm (5H)', position: '7.46 – 7.31 ppm', areaOrIntegral: '5.04 H', assignment: 'Phenyl ring + CDCl3' },
      { label: 'd (2H)', position: '6.98 ppm (J = 8.8 Hz)', areaOrIntegral: '1.99 H', assignment: 'Anisole ortho-OCH3 ArH' },
      { label: 's (3H)', position: '3.85 ppm', areaOrIntegral: '3.00 H', assignment: 'Methoxy (-OCH3)' },
    ],
  },
  sfc: {
    id: 'sfc',
    title: 'Chiral SFC Enantiomeric Excess Trace',
    instrument: 'Waters ACQUITY UPC2 · Chiralpak IG-3 (4.6 × 150 mm) · CO2/MeOH',
    sampleCode: 'LOT VS-2026-0392R',
    metricLabel: 'Enantiomeric Excess',
    metricValue: '99.48 % ee',
    xAxisLabel: 'Elution Time (min)',
    yAxisLabel: 'PDA Response (220 nm)',
    xTicks: ['0.0', '1.5', '3.0', '4.5', '6.0', '7.5'],
    points: [
      { x: 0, y: 2 },
      { x: 25, y: 2 },
      { x: 35, y: 2 },
      { x: 36.2, y: 5.5 },
      { x: 37.4, y: 2.2 },
      { x: 48, y: 2 },
      { x: 50.5, y: 4 },
      { x: 52, y: 95 },
      { x: 53.5, y: 4.5 },
      { x: 56, y: 2 },
      { x: 100, y: 2 },
    ],
    annotations: [
      { x: 36.2, y: 13, text: '(S)-Enantiomer (0.26%)' },
      { x: 52, y: 97, text: '(R)-Enantiomer (99.74%)' },
    ],
    peaks: [
      { label: 'Minor Peak', position: '2.71 min', areaOrIntegral: '0.26 %', assignment: '(S)-1-Phenylethanol' },
      { label: 'Major Peak', position: '3.90 min', areaOrIntegral: '99.74 %', assignment: '(R)-1-Phenylethanol' },
      { label: 'Resolution (Rs)', position: '4.18', areaOrIntegral: 'Baseline', assignment: 'USP > 2.0 criteria passed' },
    ],
  },
};
