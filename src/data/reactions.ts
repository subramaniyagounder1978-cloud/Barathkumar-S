export type ReactionCategory =
  | 'Cross-Coupling'
  | 'Heterocycle Formation'
  | 'Chiral Reduction'
  | 'Fluorination';

export interface ReagentSpec {
  id: string;
  name: string;
  formula: string;
  role: 'Substrate' | 'Coupling Partner' | 'Catalyst' | 'Ligand' | 'Base / Additive' | 'Solvent';
  molarMass: number; // g/mol
  density?: number; // g/mL (present for liquids)
  defaultEquiv: number; // molar equivalents relative to limiting substrate (1.0)
  purityPct: number; // e.g., 98
  isLimitingDefault?: boolean;
  isSolvent?: boolean;
  solventVolumeMlPerMmol?: number; // e.g., 5.0 mL/mmol for 0.2M
}

export interface ProductSpec {
  name: string;
  formula: string;
  molarMass: number; // g/mol
  smiles: string;
}

export interface ReactionProtocol {
  id: string;
  name: string;
  category: ReactionCategory;
  summary: string;
  schemeLabel: {
    reactantA: string;
    reactantB: string;
    conditionsTop: string;
    conditionsBottom: string;
    product: string;
  };
  defaultScaleMmol: number;
  defaultTempC: number;
  minTempC: number;
  maxTempC: number;
  defaultCatalystMolPct: number;
  baseRateConstant: number; // calibrated min^-1 at reference temp
  referenceTempC: number;
  activationEnergyKJ: number; // kJ/mol for Arrhenius kinetic curve
  literatureYieldPct: number;
  reactionTimeMin: number;
  typicalTurnaroundDays: number;
  analyticalMethods: string[];
  substrateScope: string;
  safetyNote: string;
  reagents: ReagentSpec[];
  product: ProductSpec;
}

export const REACTION_CATEGORIES: Array<'All Transformations' | ReactionCategory> = [
  'All Transformations',
  'Cross-Coupling',
  'Heterocycle Formation',
  'Chiral Reduction',
  'Fluorination',
];

export const REACTION_PROTOCOLS: ReactionProtocol[] = [
  {
    id: 'suzuki-miyaura',
    name: 'Suzuki-Miyaura Biaryl Coupling',
    category: 'Cross-Coupling',
    summary:
      'Palladium-catalyzed C(sp2)-C(sp2) cross-coupling of aryl bromides with arylboronic acids under mild aqueous biphasic conditions.',
    schemeLabel: {
      reactantA: '4-Bromoanisole',
      reactantB: 'Phenylboronic acid',
      conditionsTop: 'Pd(dppf)Cl2 (2 mol%), K2CO3',
      conditionsBottom: '1,4-Dioxane / H2O (4:1), 85 °C',
      product: '4-Methoxybiphenyl',
    },
    defaultScaleMmol: 10,
    defaultTempC: 85,
    minTempC: 45,
    maxTempC: 110,
    defaultCatalystMolPct: 2.0,
    baseRateConstant: 0.022,
    referenceTempC: 85,
    activationEnergyKJ: 54,
    literatureYieldPct: 94,
    reactionTimeMin: 180,
    typicalTurnaroundDays: 10,
    analyticalMethods: ['HPLC-UV (254 nm)', '1H / 13C NMR', 'ICP-MS (Residual Pd < 5 ppm)'],
    substrateScope: 'Heteroaryl halides, sterically hindered ortho-substituted boronates, base-sensitive esters.',
    safetyNote: 'Degassed inert atmosphere (N2) required to prevent homocoupling and Pd black precipitation.',
    reagents: [
      {
        id: 'aryl-bromide',
        name: '4-Bromoanisole',
        formula: 'C7H7BrO',
        role: 'Substrate',
        molarMass: 187.03,
        density: 1.494,
        defaultEquiv: 1.0,
        purityPct: 99,
        isLimitingDefault: true,
      },
      {
        id: 'boronic-acid',
        name: 'Phenylboronic acid',
        formula: 'C6H7BO2',
        role: 'Coupling Partner',
        molarMass: 121.93,
        defaultEquiv: 1.2,
        purityPct: 97,
      },
      {
        id: 'pd-dppf',
        name: 'Pd(dppf)Cl2·CH2Cl2',
        formula: 'C35H30Cl4FeP2Pd',
        role: 'Catalyst',
        molarMass: 816.64,
        defaultEquiv: 0.02,
        purityPct: 98,
      },
      {
        id: 'k2co3',
        name: 'Potassium carbonate',
        formula: 'K2CO3',
        role: 'Base / Additive',
        molarMass: 138.21,
        defaultEquiv: 2.5,
        purityPct: 99,
      },
      {
        id: 'dioxane',
        name: '1,4-Dioxane (degassed)',
        formula: 'C4H8O2',
        role: 'Solvent',
        molarMass: 88.11,
        density: 1.033,
        defaultEquiv: 1.0,
        purityPct: 99.8,
        isSolvent: true,
        solventVolumeMlPerMmol: 4.0,
      },
    ],
    product: {
      name: '4-Methoxybiphenyl',
      formula: 'C13H12O',
      molarMass: 184.24,
      smiles: 'COc1ccc(-c2ccccc2)cc1',
    },
  },
  {
    id: 'buchwald-hartwig',
    name: 'Buchwald-Hartwig C-N Amination',
    category: 'Cross-Coupling',
    summary:
      'Palladium-BrettPhos catalyzed cross-coupling of aryl chlorides with primary or secondary amines to access pharmaceutical aniline motifs.',
    schemeLabel: {
      reactantA: '4-Chlorotoluene',
      reactantB: 'Morpholine',
      conditionsTop: 'Pd2(dba)3 (1.5 mol%), RuPhos',
      conditionsBottom: 'NaOtBu, Toluene, 95 °C',
      product: '4-(p-Tolyl)morpholine',
    },
    defaultScaleMmol: 15,
    defaultTempC: 95,
    minTempC: 60,
    maxTempC: 115,
    defaultCatalystMolPct: 1.5,
    baseRateConstant: 0.018,
    referenceTempC: 95,
    activationEnergyKJ: 62,
    literatureYieldPct: 91,
    reactionTimeMin: 240,
    typicalTurnaroundDays: 12,
    analyticalMethods: ['HPLC-MS', '1H NMR', 'Karl Fischer (< 0.1% H2O)'],
    substrateScope: 'Electron-rich and electron-deficient aryl chlorides, cyclic secondary amines, heteroaryl amines.',
    safetyNote: 'Moisture-sensitive NaOtBu; maintain anhydrous conditions under argon (< 200 ppm H2O).',
    reagents: [
      {
        id: 'aryl-chloride',
        name: '4-Chlorotoluene',
        formula: 'C7H7Cl',
        role: 'Substrate',
        molarMass: 126.58,
        density: 1.07,
        defaultEquiv: 1.0,
        purityPct: 99,
        isLimitingDefault: true,
      },
      {
        id: 'morpholine',
        name: 'Morpholine',
        formula: 'C4H9NO',
        role: 'Coupling Partner',
        molarMass: 87.12,
        density: 1.0,
        defaultEquiv: 1.25,
        purityPct: 99,
      },
      {
        id: 'pd2dba3',
        name: 'Pd2(dba)3',
        formula: 'C51H42O3Pd2',
        role: 'Catalyst',
        molarMass: 915.72,
        defaultEquiv: 0.015,
        purityPct: 97,
      },
      {
        id: 'ruphos',
        name: 'RuPhos Ligand',
        formula: 'C30H43O2P',
        role: 'Ligand',
        molarMass: 466.64,
        defaultEquiv: 0.03,
        purityPct: 98,
      },
      {
        id: 'naotbu',
        name: 'Sodium tert-butoxide',
        formula: 'C4H9NaO',
        role: 'Base / Additive',
        molarMass: 96.1,
        defaultEquiv: 1.4,
        purityPct: 97,
      },
      {
        id: 'toluene',
        name: 'Anhydrous Toluene',
        formula: 'C7H8',
        role: 'Solvent',
        molarMass: 92.14,
        density: 0.867,
        defaultEquiv: 1.0,
        purityPct: 99.8,
        isSolvent: true,
        solventVolumeMlPerMmol: 3.5,
      },
    ],
    product: {
      name: '4-(p-Tolyl)morpholine',
      formula: 'C11H15NO',
      molarMass: 177.25,
      smiles: 'Cc1ccc(N2CCOCC2)cc1',
    },
  },
  {
    id: 'hatu-amide',
    name: 'HATU Peptidic Amide Coupling',
    category: 'Heterocycle Formation',
    summary:
      'Low-epimerization uronium-mediated condensation of carboxylic acids with hindered amines at ambient temperature.',
    schemeLabel: {
      reactantA: '4-Fluorobenzoic acid',
      reactantB: 'Piperidine',
      conditionsTop: 'HATU (1.1 equiv), DIPEA',
      conditionsBottom: 'Anhydrous DMF, 25 °C',
      product: '(4-Fluorophenyl)(piperidin-1-yl)methanone',
    },
    defaultScaleMmol: 20,
    defaultTempC: 25,
    minTempC: 0,
    maxTempC: 45,
    defaultCatalystMolPct: 10.0,
    baseRateConstant: 0.038,
    referenceTempC: 25,
    activationEnergyKJ: 38,
    literatureYieldPct: 96,
    reactionTimeMin: 120,
    typicalTurnaroundDays: 7,
    analyticalMethods: ['LC-MS (ESI+)', '1H / 19F NMR', 'Chiral HPLC (> 99.5% ee)'],
    substrateScope: 'Racemization-prone alpha-amino acids, electron-poor anilines, macrocyclic lactamizations.',
    safetyNote: 'Avoid heating HATU solutions above 45 °C; quench excess reagent carefully with saturated aqueous NaHCO3.',
    reagents: [
      {
        id: 'carboxylic-acid',
        name: '4-Fluorobenzoic acid',
        formula: 'C7H5FO2',
        role: 'Substrate',
        molarMass: 140.11,
        defaultEquiv: 1.0,
        purityPct: 99,
        isLimitingDefault: true,
      },
      {
        id: 'piperidine',
        name: 'Piperidine',
        formula: 'C5H11N',
        role: 'Coupling Partner',
        molarMass: 85.15,
        density: 0.862,
        defaultEquiv: 1.15,
        purityPct: 99,
      },
      {
        id: 'hatu',
        name: 'HATU Coupling Agent',
        formula: 'C10H15F6N6OP',
        role: 'Catalyst',
        molarMass: 380.23,
        defaultEquiv: 1.1,
        purityPct: 98,
      },
      {
        id: 'dipea',
        name: 'N,N-Diisopropylethylamine',
        formula: 'C8H19N',
        role: 'Base / Additive',
        molarMass: 129.24,
        density: 0.742,
        defaultEquiv: 2.2,
        purityPct: 99,
      },
      {
        id: 'dmf',
        name: 'Anhydrous DMF',
        formula: 'C3H7NO',
        role: 'Solvent',
        molarMass: 73.09,
        density: 0.944,
        defaultEquiv: 1.0,
        purityPct: 99.8,
        isSolvent: true,
        solventVolumeMlPerMmol: 3.0,
      },
    ],
    product: {
      name: '(4-Fluorophenyl)(piperidin-1-yl)methanone',
      formula: 'C12H14FNO',
      molarMass: 207.25,
      smiles: 'O=C(c1ccc(F)cc1)N1CCCCC1',
    },
  },
  {
    id: 'noyori-hydrogenation',
    name: 'Noyori Asymmetric Ketone Reduction',
    category: 'Chiral Reduction',
    summary:
      'Enantioselective Ru-BINAP/DPEN catalyzed transfer hydrogenation delivering optically pure secondary alcohols (> 99% ee).',
    schemeLabel: {
      reactantA: 'Acetophenone',
      reactantB: 'HCOOH / Et3N (5:2)',
      conditionsTop: 'RuCl(p-cymene)[(R,R)-TsDPEN] (0.5 mol%)',
      conditionsBottom: 'CH2Cl2 / EtOAc, 40 °C',
      product: '(R)-1-Phenylethanol',
    },
    defaultScaleMmol: 25,
    defaultTempC: 40,
    minTempC: 20,
    maxTempC: 60,
    defaultCatalystMolPct: 0.5,
    baseRateConstant: 0.015,
    referenceTempC: 40,
    activationEnergyKJ: 48,
    literatureYieldPct: 97,
    reactionTimeMin: 300,
    typicalTurnaroundDays: 14,
    analyticalMethods: ['Chiral SFC (99.4% ee)', '1H NMR', 'Optical Rotation [α]D'],
    substrateScope: 'Aryl-alkyl ketones, alpha-halo ketones, beta-keto esters, cyclic imines.',
    safetyNote: 'CO2 off-gassing occurs continuously during formic acid reduction; maintain vented pressure relief manifold.',
    reagents: [
      {
        id: 'acetophenone',
        name: 'Acetophenone',
        formula: 'C8H8O',
        role: 'Substrate',
        molarMass: 120.15,
        density: 1.028,
        defaultEquiv: 1.0,
        purityPct: 99,
        isLimitingDefault: true,
      },
      {
        id: 'formic-acid',
        name: 'Formic acid (reductant)',
        formula: 'CH2O2',
        role: 'Coupling Partner',
        molarMass: 46.03,
        density: 1.22,
        defaultEquiv: 3.0,
        purityPct: 98,
      },
      {
        id: 'ru-tsdpen',
        name: 'RuCl(p-cymene)[(R,R)-TsDPEN]',
        formula: 'C31H35ClN2O2RuS',
        role: 'Catalyst',
        molarMass: 636.21,
        defaultEquiv: 0.005,
        purityPct: 97,
      },
      {
        id: 'et3n',
        name: 'Triethylamine',
        formula: 'C6H15N',
        role: 'Base / Additive',
        molarMass: 101.19,
        density: 0.726,
        defaultEquiv: 1.2,
        purityPct: 99,
      },
      {
        id: 'etoac',
        name: 'Ethyl acetate',
        formula: 'C4H8O2',
        role: 'Solvent',
        molarMass: 88.11,
        density: 0.902,
        defaultEquiv: 1.0,
        purityPct: 99.5,
        isSolvent: true,
        solventVolumeMlPerMmol: 2.5,
      },
    ],
    product: {
      name: '(R)-1-Phenylethanol',
      formula: 'C8H10O',
      molarMass: 122.17,
      smiles: 'C[C@@H](O)c1ccccc1',
    },
  },
  {
    id: 'cu-click-triazole',
    name: 'CuAAC 1,4-Triazole Cycloaddition',
    category: 'Heterocycle Formation',
    summary:
      'Regioselective copper(I)-catalyzed Huisgen cycloaddition of organic azides with terminal alkynes in biocompatible media.',
    schemeLabel: {
      reactantA: 'Benzyl azide',
      reactantB: 'Phenylacetylene',
      conditionsTop: 'CuSO4·5H2O (1 mol%), Na-Ascorbate',
      conditionsBottom: 't-BuOH / H2O (1:1), 35 °C',
      product: '1-Benzyl-4-phenyl-1H-1,2,3-triazole',
    },
    defaultScaleMmol: 10,
    defaultTempC: 35,
    minTempC: 20,
    maxTempC: 65,
    defaultCatalystMolPct: 1.0,
    baseRateConstant: 0.029,
    referenceTempC: 35,
    activationEnergyKJ: 42,
    literatureYieldPct: 98,
    reactionTimeMin: 150,
    typicalTurnaroundDays: 8,
    analyticalMethods: ['HPLC-UV', '1H NMR (Triazole δ 7.8 ppm)', 'LC-MS'],
    substrateScope: 'PROTAC linkers, PEGylated payloads, nucleoside conjugates, peptidomimetic scaffolds.',
    safetyNote: 'Organic azides with C/N ratio < 3 require dilute solution handling behind polycarbonate blast shields.',
    reagents: [
      {
        id: 'benzyl-azide',
        name: 'Benzyl azide',
        formula: 'C7H7N3',
        role: 'Substrate',
        molarMass: 133.15,
        density: 1.065,
        defaultEquiv: 1.0,
        purityPct: 98,
        isLimitingDefault: true,
      },
      {
        id: 'phenylacetylene',
        name: 'Phenylacetylene',
        formula: 'C8H6',
        role: 'Coupling Partner',
        molarMass: 102.13,
        density: 0.93,
        defaultEquiv: 1.05,
        purityPct: 98,
      },
      {
        id: 'cuso4',
        name: 'CuSO4·5H2O',
        formula: 'CuH10O9S',
        role: 'Catalyst',
        molarMass: 249.68,
        defaultEquiv: 0.01,
        purityPct: 99,
      },
      {
        id: 'na-ascorbate',
        name: 'Sodium L-ascorbate',
        formula: 'C6H7NaO6',
        role: 'Base / Additive',
        molarMass: 198.11,
        defaultEquiv: 0.1,
        purityPct: 99,
      },
      {
        id: 'tbuoh-h2o',
        name: 't-BuOH / H2O (1:1 v/v)',
        formula: 'C4H10O / H2O',
        role: 'Solvent',
        molarMass: 74.12,
        density: 0.89,
        defaultEquiv: 1.0,
        purityPct: 99.5,
        isSolvent: true,
        solventVolumeMlPerMmol: 3.0,
      },
    ],
    product: {
      name: '1-Benzyl-4-phenyl-1H-1,2,3-triazole',
      formula: 'C15H13N3',
      molarMass: 235.29,
      smiles: 'c1ccc(Cn2cc(-c3ccccc3)nn2)cc1',
    },
  },
  {
    id: 'deoxyfluorination',
    name: 'Continuous-Flow Deoxyfluorination',
    category: 'Fluorination',
    summary:
      'Safe continuous-flow DAST/PyFluor mediated conversion of secondary alcohols and carboxylic acids into fluorinated building blocks.',
    schemeLabel: {
      reactantA: '4-Nitrobenzyl alcohol',
      reactantB: 'DAST (Fluorinating reagent)',
      conditionsTop: 'PFA Coil Reactor (τ = 12 min)',
      conditionsBottom: 'CH2Cl2, 45 °C, 4 bar BPR',
      product: '1-(Fluoromethyl)-4-nitrobenzene',
    },
    defaultScaleMmol: 12,
    defaultTempC: 45,
    minTempC: 15,
    maxTempC: 70,
    defaultCatalystMolPct: 5.0,
    baseRateConstant: 0.055,
    referenceTempC: 45,
    activationEnergyKJ: 45,
    literatureYieldPct: 89,
    reactionTimeMin: 90,
    typicalTurnaroundDays: 14,
    analyticalMethods: ['19F NMR (qNMR)', 'GC-MS', 'HPLC-UV'],
    substrateScope: 'Benzylic alcohols, cyclic amino-alcohols, alpha-hydroxy esters, gem-difluorination of ketones.',
    safetyNote: 'DAST undergoes exothermic decomposition above 90 °C; continuous-flow residence control limits thermal inventory to < 2 mL.',
    reagents: [
      {
        id: 'alcohol',
        name: '4-Nitrobenzyl alcohol',
        formula: 'C7H7NO3',
        role: 'Substrate',
        molarMass: 153.14,
        defaultEquiv: 1.0,
        purityPct: 99,
        isLimitingDefault: true,
      },
      {
        id: 'dast',
        name: 'DAST (Diethylaminosulfur trifluoride)',
        formula: 'C4H10F3NS',
        role: 'Coupling Partner',
        molarMass: 161.19,
        density: 1.22,
        defaultEquiv: 1.3,
        purityPct: 95,
      },
      {
        id: 'py-hf',
        name: 'Triethylamine trihydrofluoride',
        formula: 'C6H18F3N',
        role: 'Catalyst',
        molarMass: 161.21,
        density: 0.989,
        defaultEquiv: 0.05,
        purityPct: 98,
      },
      {
        id: 'dcm',
        name: 'Anhydrous Dichloromethane',
        formula: 'CH2Cl2',
        role: 'Solvent',
        molarMass: 84.93,
        density: 1.326,
        defaultEquiv: 1.0,
        purityPct: 99.8,
        isSolvent: true,
        solventVolumeMlPerMmol: 4.5,
      },
    ],
    product: {
      name: '1-(Fluoromethyl)-4-nitrobenzene',
      formula: 'C7H6FNO2',
      molarMass: 155.13,
      smiles: 'O=[N+]([O-])c1ccc(CF)cc1',
    },
  },
];
