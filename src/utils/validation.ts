export interface SynthesisRequestForm {
  projectName: string;
  targetScale: string;
  purityTier: string;
  chemicalSpec: string;
  contactName: string;
  email: string;
  organization: string;
}

export type SynthesisFormErrors = Partial<Record<keyof SynthesisRequestForm, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSynthesisRequest(form: SynthesisRequestForm): SynthesisFormErrors {
  const errors: SynthesisFormErrors = {};

  if (!form.projectName.trim() || form.projectName.trim().length < 2) {
    errors.projectName = 'Enter a compound name or internal project code (at least 2 characters).';
  }

  if (!form.chemicalSpec.trim() || form.chemicalSpec.trim().length < 5) {
    errors.chemicalSpec = 'Provide a SMILES string, CAS number, or structural route notes.';
  }

  if (!form.contactName.trim()) {
    errors.contactName = 'Enter the primary technical contact name.';
  }

  if (!form.email.trim() || !EMAIL_REGEX.test(form.email.trim())) {
    errors.email = 'Enter a valid work or institutional email address.';
  }

  if (!form.organization.trim()) {
    errors.organization = 'Enter your company or research institution.';
  }

  return errors;
}

export function generateInquiryReference(projectName: string): string {
  const clean = projectName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4)
    .padEnd(4, 'X');
  return `VS-2026-${clean}`;
}
