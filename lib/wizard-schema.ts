
import { z } from "zod";




export const step1Schema = z.object({
  loan_type: z.enum(
    [
      "Personal",
      "Home",
      "Auto",
      "Business",
      "Education",
      "Debt Consolidation",
    ],
    {
      errorMap: () => ({
        message: "Select a loan type",
      }),
    }
  ),
});

export type Step1Values = z.infer<typeof step1Schema>;





export const step2Schema = z.object({
  loan_amount: z.coerce
    .number({
      invalid_type_error: "Enter a loan amount",
    })
    .min(1000, "Minimum loan amount is ₹1,000")
    .max(20000000, "Maximum loan amount is ₹2,00,00,000"),

  interest_rate: z.coerce
    .number({
      invalid_type_error: "Enter an interest rate",
    })
    .min(0.1, "Rate must be at least 0.1%")
    .max(35, "Rate cannot exceed 35%"),

  loan_term_months: z.coerce
    .number({
      invalid_type_error: "Select a loan term",
    })
    .int("Loan term must be a whole number")
    .min(6, "Minimum term is 6 months")
    .max(360, "Maximum term is 360 months"),

  loan_purpose: z
    .string()
    .max(500, "Keep it under 500 characters")
    .optional()
    .default(""),
});

export type Step2Values = z.infer<typeof step2Schema>;




export const step3Schema = z.object({
  applicant_first_name: z
    .string()
    .min(2, "Enter your first name")
    .max(60, "First name is too long"),

  applicant_last_name: z
    .string()
    .min(2, "Enter your last name")
    .max(60, "Last name is too long"),

  applicant_email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  applicant_phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15, "Enter a valid phone number"),

  applicant_dob: z
    .string()
    .min(1, "Enter your date of birth")
    .refine((value) => {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      const age =
        (Date.now() - date.getTime()) /
        (1000 * 60 * 60 * 24 * 365.25);

      return age >= 18 && age < 120;
    }, "You must be at least 18 years old"),

  applicant_address: z
    .string()
    .min(5, "Enter your address")
    .max(120, "Address is too long"),

  applicant_city: z
    .string()
    .min(2, "Enter your city")
    .max(60, "City name is too long"),

  applicant_state: z
    .string()
    .min(2, "Select your state"),

  applicant_zip: z
    .string()
    .min(5, "Enter a valid PIN code")
    .max(10, "Enter a valid PIN code"),
});

export type Step3Values = z.infer<typeof step3Schema>;





export const step4Schema = z.object({
  employer_name: z
    .string()
    .min(2, "Enter your employer name")
    .max(80, "Employer name is too long"),

  employment_status: z.enum(
    [
      "Full-time",
      "Part-time",
      "Self-employed",
      "Retired",
      "Unemployed",
    ],
    {
      errorMap: () => ({
        message: "Select your employment status",
      }),
    }
  ),

  monthly_income: z.coerce
    .number({
      invalid_type_error: "Enter your monthly income",
    })
    .min(0, "Income cannot be negative")
    .max(10000000, "Please enter a valid income"),
});

export type Step4Values = z.infer<typeof step4Schema>;





export const step5Schema = z
  .object({
    co_applicant: z.boolean().default(false),

    co_applicant_name: z
      .string()
      .optional()
      .default(""),

    co_applicant_relationship: z
      .string()
      .optional()
      .default(""),

    co_applicant_income: z.coerce
      .number()
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Co-applicant is optional.
    if (!data.co_applicant) {
      return;
    }

    if (
      !data.co_applicant_name ||
      data.co_applicant_name.trim().length < 2
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["co_applicant_name"],
        message: "Enter the co-applicant name",
      });
    }

    if (
      !data.co_applicant_relationship ||
      data.co_applicant_relationship.trim().length < 2
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["co_applicant_relationship"],
        message: "Enter the relationship",
      });
    }

    if (
      data.co_applicant_income === undefined ||
      Number.isNaN(data.co_applicant_income) ||
      data.co_applicant_income < 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["co_applicant_income"],
        message: "Enter the co-applicant income",
      });
    }
  });

export type Step5Values = z.infer<typeof step5Schema>;




const referenceSchema = z.object({
  name: z
    .string()
    .min(2, "Name is required"),

  relationship: z
    .string()
    .min(2, "Relationship is required"),

  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15, "Enter a valid phone number"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export const step6Schema = z.object({
  references: z
    .array(referenceSchema)
    .min(2, "Add at least 2 references")
    .max(5, "Maximum 5 references"),
});

export type Step6Values = z.infer<typeof step6Schema>;




export const step7Schema = z.object({
  documents: z
    .record(z.string(), z.string())
    .refine(
      (documents) => Object.keys(documents).length >= 4,
      "Please upload all required documents"
    ),
});

export type Step7Values = z.infer<typeof step7Schema>;




export const step8Schema = z.object({
  agree_terms: z
    .boolean()
    .refine(
      (value) => value === true,
      "You must agree to the terms and conditions"
    ),

  agree_credit_check: z
    .boolean()
    .refine(
      (value) => value === true,
      "You must authorize the credit check"
    ),
});

export type Step8Values = z.infer<typeof step8Schema>;



export const wizardSchemas = [
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
  step8Schema,
] as const;
