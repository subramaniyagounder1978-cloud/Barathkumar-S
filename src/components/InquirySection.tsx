import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  generateInquiryReference,
  validateSynthesisRequest,
  type SynthesisFormErrors,
  type SynthesisRequestForm,
} from '../utils/validation';

interface InquirySectionProps {
  prefillProject?: string;
  prefillNotes?: string;
}

const SCALE_OPTIONS = ['10 mg – 500 mg', '1 g – 25 g', '50 g – 500 g', '1 kg – 25 kg', '25 kg+ cGMP'];
const PURITY_OPTIONS = ['≥ 95% (Screening)', '≥ 98% (Analytical)', '≥ 99.5% (cGMP / Reference)'];

export function InquirySection({ prefillProject, prefillNotes }: InquirySectionProps) {
  const [form, setForm] = useState<SynthesisRequestForm>({
    projectName: '',
    targetScale: '1 g – 25 g',
    purityTier: '≥ 98% (Analytical)',
    chemicalSpec: '',
    contactName: '',
    email: '',
    organization: '',
  });

  const [errors, setErrors] = useState<SynthesisFormErrors>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    if (prefillProject || prefillNotes) {
      setForm((prev) => ({
        ...prev,
        projectName: prefillProject || prev.projectName,
        chemicalSpec: prefillNotes || prev.chemicalSpec,
      }));
      setSubmittedRef(null);
    }
  }, [prefillProject, prefillNotes]);

  const handleChange = (field: keyof SynthesisRequestForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateSynthesisRequest(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmittedRef(generateInquiryReference(form.projectName));
  };

  return (
    <section id="inquiry" className="py-16 lg:py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <p className="text-xs font-mono tracking-wide text-slate-500 mb-2">
              Custom Synthesis &amp; Route Feasibility
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
              style={{ textWrap: 'balance' }}
            >
              Request a synthetic route proposal &amp; batch quote
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Submit your target structure (SMILES, CAS, or IUPAC description), desired delivery
              mass, and analytical release tier. A senior process chemist reviews every inquiry
              under mutual CDA within 24 business hours.
            </p>

            <div className="mt-8 pt-6 border-t border-slate-200 space-y-4 text-xs text-slate-600">
              <div>
                <div className="font-semibold text-slate-900">01. Retrosynthetic Assessment</div>
                <p className="mt-0.5">
                  Complimentary literature check, starting material sourcing, and step-count
                  estimate.
                </p>
              </div>
              <div>
                <div className="font-semibold text-slate-900">02. Milestone-Based Execution</div>
                <p className="mt-0.5">
                  Weekly synthetic progress updates with interim HPLC-MS and NMR spectra.
                </p>
              </div>
              <div>
                <div className="font-semibold text-slate-900">03. Verified Delivery Package</div>
                <p className="mt-0.5">
                  Temperature-controlled shipping with full CoA, raw spectra, and safety data sheet.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 sm:p-8">
            {submittedRef ? (
              <div className="py-6" role="status" aria-live="polite">
                <div className="flex items-center gap-2.5 text-emerald-700 font-semibold text-base">
                  <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>Synthesis Proposal Request Received</span>
                </div>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Reference <strong className="font-mono text-slate-900">{submittedRef}</strong> has
                  been logged for <strong className="text-slate-900">{form.projectName}</strong> (
                  {form.targetScale}, {form.purityTier}). Our Basel/Boston chemistry leads will
                  respond to <span className="font-mono text-slate-900">{form.email}</span> within 1
                  business day.
                </p>
                <div className="mt-6 p-4 bg-[#F8FAFC] border border-slate-200 rounded-md text-xs font-mono text-slate-700 space-y-1">
                  <div>Organization: {form.organization}</div>
                  <div>Specification: {form.chemicalSpec}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedRef(null);
                    setForm({
                      projectName: '',
                      targetScale: '1 g – 25 g',
                      purityTier: '≥ 98% (Analytical)',
                      chemicalSpec: '',
                      contactName: '',
                      email: '',
                      organization: '',
                    });
                  }}
                  className="mt-6 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  Submit Another Target
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="req-project-name"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Compound / Project Name
                    </label>
                    <input
                      id="req-project-name"
                      type="text"
                      value={form.projectName}
                      onChange={(e) => handleChange('projectName', e.target.value)}
                      placeholder="e.g., VS-Pyridine-04 or 4-Methoxybiphenyl"
                      aria-invalid={Boolean(errors.projectName)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {errors.projectName && (
                      <p className="mt-1 text-xs text-rose-700">{errors.projectName}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="req-organization"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Company / Institution
                    </label>
                    <input
                      id="req-organization"
                      type="text"
                      value={form.organization}
                      onChange={(e) => handleChange('organization', e.target.value)}
                      placeholder="e.g., Helios Therapeutics"
                      aria-invalid={Boolean(errors.organization)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {errors.organization && (
                      <p className="mt-1 text-xs text-rose-700">{errors.organization}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="req-target-scale"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Target Delivery Scale
                    </label>
                    <select
                      id="req-target-scale"
                      value={form.targetScale}
                      onChange={(e) => handleChange('targetScale', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      {SCALE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="req-purity-tier"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Analytical Purity Requirement
                    </label>
                    <select
                      id="req-purity-tier"
                      value={form.purityTier}
                      onChange={(e) => handleChange('purityTier', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      {PURITY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="req-chemical-spec"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    SMILES, CAS Number, or Route Requirements
                  </label>
                  <textarea
                    id="req-chemical-spec"
                    rows={3}
                    value={form.chemicalSpec}
                    onChange={(e) => handleChange('chemicalSpec', e.target.value)}
                    placeholder="Paste SMILES string, CAS registry number, isotopic labeling positions, or chiral ee targets..."
                    aria-invalid={Boolean(errors.chemicalSpec)}
                    className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-md text-slate-900 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {errors.chemicalSpec && (
                    <p className="mt-1 text-xs text-rose-700">{errors.chemicalSpec}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="req-contact-name"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Technical Contact Name
                    </label>
                    <input
                      id="req-contact-name"
                      type="text"
                      value={form.contactName}
                      onChange={(e) => handleChange('contactName', e.target.value)}
                      placeholder="Dr. Elena Rostova"
                      aria-invalid={Boolean(errors.contactName)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {errors.contactName && (
                      <p className="mt-1 text-xs text-rose-700">{errors.contactName}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="req-email"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Work Email
                    </label>
                    <input
                      id="req-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="elena.rostova@company.com"
                      aria-invalid={Boolean(errors.email)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {errors.email && <p className="mt-1 text-xs text-rose-700">{errors.email}</p>}
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-xs text-slate-500">
                    All structures are handled under strict NDA confidentiality.
                  </p>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    Submit Synthesis Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
