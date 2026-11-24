import type { ReactionProtocol, ReagentSpec } from '../data/reactions';

export interface StoichiometryParams {
  targetScaleMmol: number; // scale of limiting substrate in mmol
  equivalentsByReagentId: Record<string, number>;
  temperatureC: number;
  catalystMolPct: number;
}

export interface CalculatedReagentRow {
  id: string;
  name: string;
  formula: string;
  role: ReagentSpec['role'];
  molarMass: number;
  equivalents: number;
  purityPct: number;
  mmol: number;
  massG: number;
  volumeMl: number | null;
  isLimiting: boolean;
  isSolvent: boolean;
}

export interface StoichiometryResult {
  rows: CalculatedReagentRow[];
  limitingReagentName: string;
  limitingMmol: number;
  theoreticalYieldG: number;
  expectedYieldG: number;
  literatureYieldPct: number;
  atomEconomyPct: number;
  processMassIntensity: number;
  totalReactionVolumeMl: number;
}

export interface KineticsPoint {
  timeMin: number;
  conversionPct: number;
  productYieldPct: number;
  byproductPct: number;
}

const GAS_CONSTANT_KJ = 0.0083145;

export function calculateStoichiometry(
  protocol: ReactionProtocol,
  params: StoichiometryParams
): StoichiometryResult {
  const safeScale = Math.max(0.01, Number.isFinite(params.targetScaleMmol) ? params.targetScaleMmol : protocol.defaultScaleMmol);

  // Identify limiting reagent among non-solvent substrate / coupling partner reagents
  const stoichiometricCandidates = protocol.reagents.filter(
    (r) => !r.isSolvent && (r.role === 'Substrate' || r.role === 'Coupling Partner')
  );

  let limitingReagent =
    stoichiometricCandidates.find((r) => r.isLimitingDefault) ?? stoichiometricCandidates[0];
  let minMmol = Infinity;

  for (const cand of stoichiometricCandidates) {
    const eq = Math.max(0.01, params.equivalentsByReagentId[cand.id] ?? cand.defaultEquiv);
    const mmol = safeScale * eq;
    if (mmol < minMmol) {
      minMmol = mmol;
      limitingReagent = cand;
    }
  }

  const limitingMmol = Number.isFinite(minMmol) ? minMmol : safeScale;

  let totalInputMassG = 0;
  let totalReactionVolumeMl = 0;
  let stoichiometricReactantMassSum = 0;

  const rows: CalculatedReagentRow[] = protocol.reagents.map((reagent) => {
    let eq = params.equivalentsByReagentId[reagent.id] ?? reagent.defaultEquiv;

    if (reagent.role === 'Catalyst') {
      eq = Math.max(0.0001, params.catalystMolPct / 100);
    } else if (reagent.isSolvent) {
      eq = 1.0;
    } else {
      eq = Math.max(0.001, eq);
    }

    if (reagent.isSolvent) {
      const volMl = safeScale * (reagent.solventVolumeMlPerMmol ?? 3.5);
      const massG = volMl * (reagent.density ?? 1.0);
      totalInputMassG += massG;
      totalReactionVolumeMl += volMl;

      return {
        id: reagent.id,
        name: reagent.name,
        formula: reagent.formula,
        role: reagent.role,
        molarMass: reagent.molarMass,
        equivalents: eq,
        purityPct: reagent.purityPct,
        mmol: (massG / reagent.molarMass) * 1000,
        massG,
        volumeMl: volMl,
        isLimiting: false,
        isSolvent: true,
      };
    }

    const mmol = safeScale * eq;
    const purityFactor = Math.max(0.1, reagent.purityPct / 100);
    const pureMassG = (mmol / 1000) * reagent.molarMass;
    const actualChargeMassG = pureMassG / purityFactor;
    const volumeMl = reagent.density ? actualChargeMassG / reagent.density : null;

    totalInputMassG += actualChargeMassG;
    if (volumeMl !== null) {
      totalReactionVolumeMl += volumeMl;
    }

    if (reagent.role === 'Substrate' || reagent.role === 'Coupling Partner') {
      stoichiometricReactantMassSum += reagent.molarMass * (reagent.isLimitingDefault ? 1 : 1);
    }

    return {
      id: reagent.id,
      name: reagent.name,
      formula: reagent.formula,
      role: reagent.role,
      molarMass: reagent.molarMass,
      equivalents: eq,
      purityPct: reagent.purityPct,
      mmol,
      massG: actualChargeMassG,
      volumeMl,
      isLimiting: reagent.id === limitingReagent?.id,
      isSolvent: false,
    };
  });

  const theoreticalYieldG = (limitingMmol / 1000) * protocol.product.molarMass;
  const expectedYieldG = theoreticalYieldG * (protocol.literatureYieldPct / 100);

  const atomEconomyPct =
    stoichiometricReactantMassSum > 0
      ? Math.min(100, (protocol.product.molarMass / stoichiometricReactantMassSum) * 100)
      : 0;

  const processMassIntensity = expectedYieldG > 0 ? totalInputMassG / expectedYieldG : 0;

  return {
    rows,
    limitingReagentName: limitingReagent?.name ?? 'Primary Substrate',
    limitingMmol,
    theoreticalYieldG,
    expectedYieldG,
    literatureYieldPct: protocol.literatureYieldPct,
    atomEconomyPct,
    processMassIntensity,
    totalReactionVolumeMl,
  };
}

export function generateKineticsSeries(
  protocol: ReactionProtocol,
  temperatureC: number,
  catalystMolPct: number
): KineticsPoint[] {
  const tempK = temperatureC + 273.15;
  const refK = protocol.referenceTempC + 273.15;

  // Arrhenius temperature scaling
  const arrheniusFactor = Math.exp(
    (-protocol.activationEnergyKJ / GAS_CONSTANT_KJ) * (1 / tempK - 1 / refK)
  );

  const catRatio = Math.max(
    0.15,
    catalystMolPct / Math.max(0.05, protocol.defaultCatalystMolPct)
  );

  // Effective pseudo-first-order rate constant (min^-1)
  const kEff = protocol.baseRateConstant * arrheniusFactor * Math.pow(catRatio, 0.72);

  // Overheating slightly increases side-reaction pathway
  const overheatDelta = Math.max(0, temperatureC - protocol.referenceTempC);
  const selectivityMax = Math.max(
    0.72,
    (protocol.literatureYieldPct / 100) - overheatDelta * 0.0022
  );

  const steps = 12;
  const maxTime = protocol.reactionTimeMin;
  const points: KineticsPoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const timeMin = Math.round((maxTime * i) / steps);
    const conversion = 100 * (1 - Math.exp(-kEff * timeMin));
    const productYield = conversion * selectivityMax;
    const byproduct = Math.max(0, conversion - productYield);

    points.push({
      timeMin,
      conversionPct: Number(conversion.toFixed(1)),
      productYieldPct: Number(productYield.toFixed(1)),
      byproductPct: Number(byproduct.toFixed(1)),
    });
  }

  return points;
}

export function formatMassDisplay(massG: number): string {
  if (massG < 0.1) {
    return `${(massG * 1000).toFixed(1)} mg`;
  }
  return `${massG.toFixed(3)} g`;
}

export function formatCsvExport(
  protocol: ReactionProtocol,
  params: StoichiometryParams,
  result: StoichiometryResult
): string {
  const header = [
    'Reagent Name',
    'Formula',
    'Role',
    'Molar Mass (g/mol)',
    'Equivalents',
    'Purity (%)',
    'Quantity (mmol)',
    'Mass Charge (g)',
    'Volume (mL)',
    'Limiting',
  ].join(',');

  const body = result.rows.map((row) =>
    [
      `"${row.name}"`,
      `"${row.formula}"`,
      `"${row.role}"`,
      row.molarMass.toFixed(2),
      row.isSolvent ? '-' : row.equivalents.toFixed(3),
      row.purityPct.toFixed(1),
      row.mmol.toFixed(2),
      row.massG.toFixed(4),
      row.volumeMl !== null ? row.volumeMl.toFixed(2) : '-',
      row.isLimiting ? 'YES' : 'NO',
    ].join(',')
  );

  const footer = [
    '',
    `Protocol,"${protocol.name}"`,
    `Target Product,"${protocol.product.name}"`,
    `Reaction Temperature (C),${params.temperatureC}`,
    `Catalyst Loading (mol%),${params.catalystMolPct}`,
    `Theoretical Yield (g),${result.theoreticalYieldG.toFixed(3)}`,
    `Expected Isolated Yield (g),${result.expectedYieldG.toFixed(3)}`,
    `Process Mass Intensity (PMI),${result.processMassIntensity.toFixed(1)}`,
  ];

  return [header, ...body, ...footer].join('\n');
}
