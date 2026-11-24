import test from 'node:test';
import assert from 'node:assert/strict';
import { REACTION_PROTOCOLS } from '../data/reactions';
import {
  calculateStoichiometry,
  generateKineticsSeries,
  formatCsvExport,
} from './stoichiometry';
import { validateSynthesisRequest, generateInquiryReference } from './validation';

test('calculateStoichiometry computes exact masses, volumes, and theoretical yield for Suzuki coupling', () => {
  const suzuki = REACTION_PROTOCOLS.find((p) => p.id === 'suzuki-miyaura')!;
  const result = calculateStoichiometry(suzuki, {
    targetScaleMmol: 10,
    equivalentsByReagentId: {},
    temperatureC: 85,
    catalystMolPct: 2.0,
  });

  // 10 mmol of 4-Methoxybiphenyl (MW 184.24) = 1.8424 g
  assert.ok(Math.abs(result.theoreticalYieldG - 1.8424) < 0.001);
  // Expected yield at 94% = 1.731856 g
  assert.ok(Math.abs(result.expectedYieldG - 1.8424 * 0.94) < 0.001);
  assert.equal(result.limitingReagentName, '4-Bromoanisole');

  const substrateRow = result.rows.find((r) => r.id === 'aryl-bromide')!;
  assert.equal(substrateRow.isLimiting, true);
  // 10 mmol * 187.03 / 0.99 = 1.88919 g
  assert.ok(Math.abs(substrateRow.massG - (1.8703 / 0.99)) < 0.001);
  assert.ok(substrateRow.volumeMl !== null && substrateRow.volumeMl > 1.2);
});

test('calculateStoichiometry dynamically detects limiting reagent when coupling partner equivalents < 1.0', () => {
  const suzuki = REACTION_PROTOCOLS.find((p) => p.id === 'suzuki-miyaura')!;
  const result = calculateStoichiometry(suzuki, {
    targetScaleMmol: 10,
    equivalentsByReagentId: { 'boronic-acid': 0.5 },
    temperatureC: 85,
    catalystMolPct: 2.0,
  });

  assert.equal(result.limitingReagentName, 'Phenylboronic acid');
  assert.equal(result.limitingMmol, 5);
  assert.ok(Math.abs(result.theoreticalYieldG - 0.9212) < 0.001);
});

test('generateKineticsSeries increases initial rate at higher temperature and higher catalyst loading', () => {
  const protocol = REACTION_PROTOCOLS[0];
  const baseline = generateKineticsSeries(protocol, 65, 1.0);
  const accelerated = generateKineticsSeries(protocol, 100, 4.0);

  // At midpoint index 6, higher temperature + catalyst achieves higher conversion
  assert.ok(accelerated[4].conversionPct > baseline[4].conversionPct);
  assert.equal(baseline[0].timeMin, 0);
  assert.equal(baseline[0].conversionPct, 0);
  assert.equal(baseline[baseline.length - 1].timeMin, protocol.reactionTimeMin);
});

test('formatCsvExport includes protocol title and reagent rows', () => {
  const protocol = REACTION_PROTOCOLS[0];
  const params = {
    targetScaleMmol: 10,
    equivalentsByReagentId: {},
    temperatureC: 85,
    catalystMolPct: 2.0,
  };
  const result = calculateStoichiometry(protocol, params);
  const csv = formatCsvExport(protocol, params, result);

  assert.ok(csv.includes('Reagent Name,Formula,Role'));
  assert.ok(csv.includes('4-Bromoanisole'));
  assert.ok(csv.includes('Suzuki-Miyaura Biaryl Coupling'));
});

test('validateSynthesisRequest rejects invalid email and empty fields, accepts complete payload', () => {
  const invalidErrors = validateSynthesisRequest({
    projectName: '',
    targetScale: '10 g',
    purityTier: '≥98% (Analytical)',
    chemicalSpec: 'abc',
    contactName: '',
    email: 'not-an-email',
    organization: '',
  });

  assert.ok(invalidErrors.projectName);
  assert.ok(invalidErrors.chemicalSpec);
  assert.ok(invalidErrors.contactName);
  assert.ok(invalidErrors.email);
  assert.ok(invalidErrors.organization);

  const validErrors = validateSynthesisRequest({
    projectName: 'VS-Pyridine-04',
    targetScale: '100 g',
    purityTier: '≥99.5% (cGMP)',
    chemicalSpec: 'COc1ccc(-c2ccccc2)cc1',
    contactName: 'Dr. Elena Rostova',
    email: 'elena.rostova@heliosbio.org',
    organization: 'Helios Therapeutics',
  });

  assert.equal(Object.keys(validErrors).length, 0);
  assert.equal(generateInquiryReference('VS-Pyridine-04'), 'VS-2026-VSPY');
});
