import { z } from "zod";

const SCHOOL_MONTHS = [
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
  "january",
  "february",
  "march",
] as const;

export const contactSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(150),
  relationship: z.string().min(1, "Relationship is required").max(100),
  phone: z.string().min(1, "Phone number is required").max(30),
  address: z.string().min(1, "Address is required").max(255),
  email: z
    .union([z.string().email("Invalid email").max(150), z.literal("")])
    .optional(),
  is_primary: z.boolean().default(false),
});

export const preRegistrationSchema = z
  .object({
    branch_id: z
      .number({ error: "Please select a branch" })
      .min(1, "Please select a branch"),
    first_name: z.string().min(1, "First name is required").max(100),
    last_name: z.string().min(1, "Last name is required").max(100),
    student_number: z.union([z.string().max(50), z.literal("")]).optional(),
    grade_level: z.string().min(1, "Grade level is required"),
    section: z.union([z.string().max(100), z.literal("")]).optional(),
    birthday: z.string().min(1, "Birthday is required"),
    enrollment_type: z.enum(["subscription", "non_subscription"]),
    allergies: z.union([z.string().max(1000), z.literal("")]).optional(),
    notes: z.union([z.string().max(1000), z.literal("")]).optional(),
    subscription_start_month: z.enum(SCHOOL_MONTHS).optional(),
    subscription_start_year: z.number().optional(),
    subscription_end_month: z.enum(SCHOOL_MONTHS).optional(),
    subscription_end_year: z.number().optional(),
    signatory_name: z.string().min(1, "Signatory name is required").max(255),
    acknowledged_at: z.string(),
    contacts: z
      .array(contactSchema)
      .min(1, "At least one contact is required")
      .max(3),
  })
  .superRefine((data, ctx) => {
    if (data.enrollment_type === "subscription") {
      if (!data.subscription_start_month) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start month is required for subscription",
          path: ["subscription_start_month"],
        });
      }
      if (!data.subscription_start_year) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start year is required for subscription",
          path: ["subscription_start_year"],
        });
      }
      if (!data.subscription_end_month) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End month is required for subscription",
          path: ["subscription_end_month"],
        });
      }
      if (!data.subscription_end_year) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End year is required for subscription",
          path: ["subscription_end_year"],
        });
      }
    }
  });

export type PreRegistrationFormData = z.infer<typeof preRegistrationSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
