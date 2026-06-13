"use client";

import { useCallback, useEffect, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { preRegistrationApi } from "@/lib/api/pre-registration";
import { preRegistrationSchema, type PreRegistrationFormData } from "@/lib/validation/pre-registration";
import { cn } from "@/lib/utils";

import type { Branch } from "@/types/pre-registration";
import type { ApiError } from "@/types/auth";

const GRADE_LEVELS = [
  "Nursery",
  "Kinder 1",
  "Kinder 2",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

const SCHOOL_MONTHS = [
  { value: "june", label: "June" },
  { value: "july", label: "July" },
  { value: "august", label: "August" },
  { value: "september", label: "September" },
  { value: "october", label: "October" },
  { value: "november", label: "November" },
  { value: "december", label: "December" },
  { value: "january", label: "January" },
  { value: "february", label: "February" },
  { value: "march", label: "March" },
];

const RELATIONSHIPS = ["Mother", "Father", "Guardian", "Grandparent", "Sibling", "Other"];

const CURRENT_YEAR = new Date().getFullYear();
const SCHOOL_YEARS = [CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2];

type ContactField = {
  full_name: string;
  relationship: string;
  phone: string;
  address: string;
  email: string;
  is_primary: boolean;
};

type FormValues = {
  branch_id: number | null;
  first_name: string;
  last_name: string;
  student_number: string;
  grade_level: string;
  section: string;
  birthday: string;
  enrollment_type: "subscription" | "non_subscription";
  allergies: string;
  notes: string;
  subscription_start_month: string;
  subscription_start_year: number | null;
  subscription_end_month: string;
  subscription_end_year: number | null;
  signatory_name: string;
  permissions_checked: boolean;
  contacts: ContactField[];
};

const DEFAULT_CONTACT: ContactField = {
  full_name: "",
  relationship: "",
  phone: "",
  address: "",
  email: "",
  is_primary: false,
};

const INITIAL_VALUES: FormValues = {
  branch_id: null,
  first_name: "",
  last_name: "",
  student_number: "",
  grade_level: "",
  section: "",
  birthday: "",
  enrollment_type: "non_subscription",
  allergies: "",
  notes: "",
  subscription_start_month: "",
  subscription_start_year: null,
  subscription_end_month: "",
  subscription_end_year: null,
  signatory_name: "",
  permissions_checked: false,
  contacts: [{ ...DEFAULT_CONTACT, is_primary: true }],
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h2 className="text-xs font-extrabold uppercase tracking-wider text-primary border-b border-border pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 flex items-center gap-1 text-xs text-destructive">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

function FormField({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

const SELECT_CLASSES =
  "flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const TEXTAREA_CLASSES =
  "flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function PreRegistrationForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);

  // Honeypot — filled by bots, must stay empty
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    preRegistrationApi
      .branches()
      .then((res) => setBranches(res.data))
      .catch(() => setBranches([]))
      .finally(() => setBranchesLoading(false));
  }, []);

  function setContact(index: number, field: keyof ContactField, value: string | boolean) {
    setValues((v) => {
      const contacts = [...v.contacts];
      contacts[index] = { ...contacts[index], [field]: value };
      return { ...v, contacts };
    });
  }

  function addContact() {
    setValues((v) => ({
      ...v,
      contacts: [...v.contacts, { ...DEFAULT_CONTACT }],
    }));
  }

  function removeContact(index: number) {
    setValues((v) => ({
      ...v,
      contacts: v.contacts.filter((_, i) => i !== index),
    }));
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setServerError(null);
      setFieldErrors({});

      if (!executeRecaptcha) {
        setServerError("reCAPTCHA not ready. Please wait and try again.");
        return;
      }

      const schemaData: Partial<PreRegistrationFormData> = {
        branch_id: values.branch_id ?? 0,
        first_name: values.first_name,
        last_name: values.last_name,
        student_number: values.student_number || undefined,
        grade_level: values.grade_level,
        section: values.section || undefined,
        birthday: values.birthday,
        enrollment_type: values.enrollment_type,
        allergies: values.allergies || undefined,
        notes: values.notes || undefined,
        signatory_name: values.signatory_name,
        acknowledged_at: new Date().toISOString(),
        contacts: values.contacts.map((c) => ({
          full_name: c.full_name,
          relationship: c.relationship,
          phone: c.phone,
          address: c.address,
          email: c.email || undefined,
          is_primary: c.is_primary,
        })),
      };

      if (values.enrollment_type === "subscription") {
        schemaData.subscription_start_month = values.subscription_start_month as typeof schemaData.subscription_start_month;
        schemaData.subscription_start_year = values.subscription_start_year ?? undefined;
        schemaData.subscription_end_month = values.subscription_end_month as typeof schemaData.subscription_end_month;
        schemaData.subscription_end_year = values.subscription_end_year ?? undefined;
      }

      const result = preRegistrationSchema.safeParse(schemaData);
      if (!result.success) {
        const flat = result.error.flatten();
        const errors: Record<string, string[]> = { ...flat.fieldErrors } as Record<string, string[]>;
        result.error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          if (path && !errors[path]) {
            errors[path] = [issue.message];
          }
        });
        setFieldErrors(errors);
        return;
      }

      if (!values.permissions_checked) {
        setFieldErrors({ permissions_checked: ["You must accept the terms before submitting."] });
        return;
      }

      setSubmitting(true);
      try {
        const token = await executeRecaptcha("pre_registration");

        await preRegistrationApi.submit({
          ...result.data,
          recaptcha_token: token,
          website: honeypot,
          student_number: result.data.student_number || undefined,
          section: result.data.section || undefined,
          allergies: result.data.allergies || undefined,
          notes: result.data.notes || undefined,
        });

        setSubmitted(true);
      } catch (err) {
        const apiError = err as ApiError;
        setServerError(apiError.message ?? "Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [executeRecaptcha, values, honeypot],
  );

  // ---------------------------------------------------------------------------
  // Success state
  // ---------------------------------------------------------------------------

  if (submitted) {
    return (
      <div className="border border-green-300 bg-green-50 rounded-xl p-8 text-center space-y-4">
        <CheckCircle2
          className="mx-auto text-green-500"
          size={48}
          aria-hidden="true"
        />
        <h2 className="text-xl font-bold text-green-800">Pre-Registration Received!</h2>
        <p className="text-green-700 text-sm">
          We&apos;ve received your pre-registration. Our canteen staff will review it and reach out to you soon. Check
          your email for a confirmation message.
        </p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => {
            setSubmitted(false);
            setValues(INITIAL_VALUES);
          }}
        >
          Submit another pre-registration
        </Button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Honeypot — must stay visually hidden, NOT display:none */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {serverError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}

      {/* Section 1: Branch */}
      <SectionCard title="Branch">
        {branchesLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {branches.map((branch) => (
              <button
                key={branch.id}
                type="button"
                onClick={() => setValues((v) => ({ ...v, branch_id: branch.id }))}
                className={cn(
                  "rounded-lg border p-3 text-left text-sm transition-colors",
                  values.branch_id === branch.id
                    ? "border-primary bg-primary/5 font-semibold text-primary"
                    : "border-border hover:bg-muted/40",
                )}
              >
                {branch.name}
              </button>
            ))}
          </div>
        )}
        <FieldError message={fieldErrors.branch_id?.[0]} />
      </SectionCard>

      {/* Section 2: Enrollment Type */}
      <SectionCard title="Enrollment Type">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            {
              value: "non_subscription" as const,
              label: "Non-Subscription",
              desc: "Wallet-only purchases",
            },
            {
              value: "subscription" as const,
              label: "Subscription",
              desc: "Monthly fee-based enrollment",
            },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValues((v) => ({ ...v, enrollment_type: opt.value }))}
              className={cn(
                "rounded-lg border p-4 text-left transition-colors",
                values.enrollment_type === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/40",
              )}
            >
              <p
                className={cn(
                  "text-sm font-semibold",
                  values.enrollment_type === opt.value ? "text-primary" : "text-foreground",
                )}
              >
                {opt.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{opt.desc}</p>
            </button>
          ))}
        </div>
        <FieldError message={fieldErrors.enrollment_type?.[0]} />
      </SectionCard>

      {/* Section 3: Student Information */}
      <SectionCard title="Student Information">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="First Name" htmlFor="first_name" required error={fieldErrors.first_name?.[0]}>
            <Input
              id="first_name"
              value={values.first_name}
              onChange={(e) => setValues((v) => ({ ...v, first_name: e.target.value }))}
              aria-invalid={!!fieldErrors.first_name}
              className={cn(fieldErrors.first_name && "border-destructive")}
            />
          </FormField>

          <FormField label="Last Name" htmlFor="last_name" required error={fieldErrors.last_name?.[0]}>
            <Input
              id="last_name"
              value={values.last_name}
              onChange={(e) => setValues((v) => ({ ...v, last_name: e.target.value }))}
              aria-invalid={!!fieldErrors.last_name}
              className={cn(fieldErrors.last_name && "border-destructive")}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Grade Level" htmlFor="grade_level" required error={fieldErrors.grade_level?.[0]}>
            <select
              id="grade_level"
              value={values.grade_level}
              onChange={(e) => setValues((v) => ({ ...v, grade_level: e.target.value }))}
              className={cn(SELECT_CLASSES, fieldErrors.grade_level && "border-destructive")}
            >
              <option value="">Select grade…</option>
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Section (optional)" htmlFor="section" error={undefined}>
            <Input
              id="section"
              value={values.section}
              onChange={(e) => setValues((v) => ({ ...v, section: e.target.value }))}
              placeholder="e.g. Sampaguita"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Birthday" htmlFor="birthday" required error={fieldErrors.birthday?.[0]}>
            <Input
              id="birthday"
              type="date"
              value={values.birthday}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setValues((v) => ({ ...v, birthday: e.target.value }))}
              aria-invalid={!!fieldErrors.birthday}
              className={cn(fieldErrors.birthday && "border-destructive")}
            />
          </FormField>

          <FormField label="Student No. (optional)" htmlFor="student_number" error={undefined}>
            <Input
              id="student_number"
              value={values.student_number}
              onChange={(e) => setValues((v) => ({ ...v, student_number: e.target.value }))}
              placeholder="e.g. SB-2024-001"
            />
          </FormField>
        </div>

        <FormField label="Allergies / Dietary Restrictions (optional)" htmlFor="allergies" error={undefined}>
          <textarea
            id="allergies"
            value={values.allergies}
            onChange={(e) => setValues((v) => ({ ...v, allergies: e.target.value }))}
            rows={2}
            placeholder="List any known allergies or dietary restrictions"
            className={TEXTAREA_CLASSES}
          />
        </FormField>

        <FormField label="Notes (optional)" htmlFor="notes" error={undefined}>
          <textarea
            id="notes"
            value={values.notes}
            onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
            rows={2}
            placeholder="Any additional information for the canteen staff"
            className={TEXTAREA_CLASSES}
          />
        </FormField>
      </SectionCard>

      {/* Section 4: Subscription Period (conditional) */}
      {values.enrollment_type === "subscription" && (
        <SectionCard title="Subscription Period">
          <p className="text-xs text-muted-foreground">
            Select the range of school months to create payment records for this student.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Start Month"
              htmlFor="sub_start_month"
              required
              error={fieldErrors.subscription_start_month?.[0]}
            >
              <select
                id="sub_start_month"
                value={values.subscription_start_month}
                onChange={(e) => setValues((v) => ({ ...v, subscription_start_month: e.target.value }))}
                className={cn(
                  SELECT_CLASSES,
                  fieldErrors.subscription_start_month && "border-destructive",
                )}
              >
                <option value="">Select month…</option>
                {SCHOOL_MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Start Year"
              htmlFor="sub_start_year"
              required
              error={fieldErrors.subscription_start_year?.[0]}
            >
              <select
                id="sub_start_year"
                value={values.subscription_start_year ?? ""}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    subscription_start_year: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className={cn(
                  SELECT_CLASSES,
                  fieldErrors.subscription_start_year && "border-destructive",
                )}
              >
                <option value="">Select year…</option>
                {SCHOOL_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="End Month"
              htmlFor="sub_end_month"
              required
              error={fieldErrors.subscription_end_month?.[0]}
            >
              <select
                id="sub_end_month"
                value={values.subscription_end_month}
                onChange={(e) => setValues((v) => ({ ...v, subscription_end_month: e.target.value }))}
                className={cn(
                  SELECT_CLASSES,
                  fieldErrors.subscription_end_month && "border-destructive",
                )}
              >
                <option value="">Select month…</option>
                {SCHOOL_MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="End Year"
              htmlFor="sub_end_year"
              required
              error={fieldErrors.subscription_end_year?.[0]}
            >
              <select
                id="sub_end_year"
                value={values.subscription_end_year ?? ""}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    subscription_end_year: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className={cn(
                  SELECT_CLASSES,
                  fieldErrors.subscription_end_year && "border-destructive",
                )}
              >
                <option value="">Select year…</option>
                {SCHOOL_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </SectionCard>
      )}

      {/* Section 5: Parent/Guardian Contacts */}
      <SectionCard title="Parent / Guardian Contacts">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">At least one contact required (up to 3).</p>
          {values.contacts.length < 3 && (
            <Button type="button" variant="outline" size="sm" onClick={addContact}>
              + Add Contact
            </Button>
          )}
        </div>
        <FieldError message={fieldErrors.contacts?.[0]} />

        <div className="space-y-4">
          {values.contacts.map((contact, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Contact {idx + 1}
                  {idx === 0 && " — Primary"}
                </p>
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => removeContact(idx)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  label="Full Name"
                  htmlFor={`contact_${idx}_full_name`}
                  required
                  error={fieldErrors[`contacts.${idx}.full_name`]?.[0]}
                >
                  <Input
                    id={`contact_${idx}_full_name`}
                    value={contact.full_name}
                    onChange={(e) => setContact(idx, "full_name", e.target.value)}
                    aria-invalid={!!fieldErrors[`contacts.${idx}.full_name`]}
                    className={cn(fieldErrors[`contacts.${idx}.full_name`] && "border-destructive")}
                  />
                </FormField>

                <FormField
                  label="Relationship"
                  htmlFor={`contact_${idx}_relationship`}
                  required
                  error={fieldErrors[`contacts.${idx}.relationship`]?.[0]}
                >
                  <select
                    id={`contact_${idx}_relationship`}
                    value={contact.relationship}
                    onChange={(e) => setContact(idx, "relationship", e.target.value)}
                    className={cn(
                      SELECT_CLASSES,
                      fieldErrors[`contacts.${idx}.relationship`] && "border-destructive",
                    )}
                  >
                    <option value="">Select relationship…</option>
                    {RELATIONSHIPS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  label="Phone"
                  htmlFor={`contact_${idx}_phone`}
                  required
                  error={fieldErrors[`contacts.${idx}.phone`]?.[0]}
                >
                  <Input
                    id={`contact_${idx}_phone`}
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact(idx, "phone", e.target.value)}
                    placeholder="09171234567"
                    aria-invalid={!!fieldErrors[`contacts.${idx}.phone`]}
                    className={cn(fieldErrors[`contacts.${idx}.phone`] && "border-destructive")}
                  />
                </FormField>

                <FormField label="Email (optional)" htmlFor={`contact_${idx}_email`} error={undefined}>
                  <Input
                    id={`contact_${idx}_email`}
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact(idx, "email", e.target.value)}
                    placeholder="parent@example.com"
                  />
                </FormField>
              </div>

              <FormField
                label="Address"
                htmlFor={`contact_${idx}_address`}
                required
                error={fieldErrors[`contacts.${idx}.address`]?.[0]}
              >
                <Input
                  id={`contact_${idx}_address`}
                  value={contact.address}
                  onChange={(e) => setContact(idx, "address", e.target.value)}
                  placeholder="Full home address"
                  aria-invalid={!!fieldErrors[`contacts.${idx}.address`]}
                  className={cn(fieldErrors[`contacts.${idx}.address`] && "border-destructive")}
                />
              </FormField>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Section 6: Permissions & Acknowledgement */}
      <SectionCard title="Permissions & Acknowledgement">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={values.permissions_checked}
            onChange={(e) => setValues((v) => ({ ...v, permissions_checked: e.target.checked }))}
            className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-sm text-foreground">
            I confirm that the information provided is accurate and I authorize Sunbites canteen to process this
            pre-registration. I understand that approval is subject to review.
          </span>
        </label>
        <FieldError message={fieldErrors.permissions_checked?.[0]} />

        <FormField
          label="Parent/Guardian Signature (Full Name)"
          htmlFor="signatory_name"
          required
          error={fieldErrors.signatory_name?.[0]}
        >
          <Input
            id="signatory_name"
            value={values.signatory_name}
            onChange={(e) => setValues((v) => ({ ...v, signatory_name: e.target.value }))}
            placeholder="Type your full name as signature"
            aria-invalid={!!fieldErrors.signatory_name}
            className={cn(fieldErrors.signatory_name && "border-destructive")}
          />
        </FormField>

        <p className="text-xs text-muted-foreground">
          Date:{" "}
          {new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </SectionCard>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit Pre-Registration"}
      </Button>
    </form>
  );
}
