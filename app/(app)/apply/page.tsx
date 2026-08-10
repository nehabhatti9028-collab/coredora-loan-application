"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Loader2,
  LogOut,
  ShieldCheck,
  Upload,
} from "lucide-react";

import { RouteGuard } from "@/components/route-guard";
import { useAuth } from "@/components/providers";
import { supabase } from "@/lib/supabase/client";

import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
  step8Schema,
} from "@/lib/wizard-schema";

const TOTAL_STEPS = 8;

const stepTitles = [
  "Loan Type",
  "Loan Details",
  "Personal Details",
  "Employment",
  "Co-applicant",
  "References",
  "Documents",
  "Review & Submit",
];

const initialForm = {
  loan_type: "",
  loan_amount: "",
  interest_rate: "12",
  loan_term_months: "12",
  loan_purpose: "",

  applicant_first_name: "",
  applicant_last_name: "",
  applicant_email: "",
  applicant_phone: "",
  applicant_dob: "",
  applicant_address: "",
  applicant_city: "",
  applicant_state: "",
  applicant_zip: "",

  employer_name: "",
  employment_status: "",
  monthly_income: "",

  co_applicant: false,
  co_applicant_name: "",
  co_applicant_relationship: "",
  co_applicant_income: "",

  references: [
    {
      name: "",
      relationship: "",
      phone: "",
      email: "",
    },
    {
      name: "",
      relationship: "",
      phone: "",
      email: "",
    },
  ],

  documents: {} as Record<string, string>,

  agree_terms: false,
  agree_credit_check: false,
};

type FormState = typeof initialForm;

type Reference = {
  name: string;
  relationship: string;
  phone: string;
  email: string;
};

type FormField = keyof FormState;

/* =========================================================
   INR FORMATTER
========================================================= */

function formatINR(
  value: string | number | null | undefined
) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/* =========================================================
   STEP INDICATOR
========================================================= */

function StepIndicator({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#8D79C7]">
            Loan Application
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#17213A]">
            {stepTitles[currentStep - 1]}
          </h1>
        </div>

        <div className="text-right">
          <p className="text-sm font-semibold text-[#17213A]">
            Step {currentStep} of {TOTAL_STEPS}
          </p>

          <p className="text-xs text-[#7B8498]">
            {Math.round(
              (currentStep / TOTAL_STEPS) * 100
            )}
            % complete
          </p>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#ECEEF3]">
        <div
          className="h-full rounded-full bg-[#8D79C7] transition-all duration-500"
          style={{
            width: `${
              (currentStep / TOTAL_STEPS) * 100
            }%`,
          }}
        />
      </div>

      <div className="mt-5 hidden grid-cols-8 gap-2 md:grid">
        {stepTitles.map((title, index) => {
          const step = index + 1;
          const active = step === currentStep;
          const complete = step < currentStep;

          return (
            <div key={title}>
              <div
                className={`h-1.5 rounded-full ${
                  complete || active
                    ? "bg-[#8D79C7]"
                    : "bg-[#E6E8ED]"
                }`}
              />

              <p
                className={`mt-2 text-[10px] font-semibold ${
                  active
                    ? "text-[#8D79C7]"
                    : "text-[#8A93A5]"
                }`}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   INPUT
========================================================= */

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#17213A]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#17213A]/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#8D79C7] focus:ring-4 focus:ring-[#8D79C7]/10"
      />
    </label>
  );
}

/* =========================================================
   SELECT
========================================================= */

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#17213A]">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-2xl border border-[#17213A]/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#8D79C7] focus:ring-4 focus:ring-[#8D79C7]/10"
      >
        <option value="">Select...</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function ApplyPage() {
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] =
    useState<FormState>(initialForm);

  const [applicationId, setApplicationId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] =
    useState(false);

  const [uploadingDocument, setUploadingDocument] =
    useState<string | null>(null);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /* =======================================================
     UPDATE FIELD
  ======================================================= */

  const updateField = <K extends FormField>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =======================================================
     REFERENCES
  ======================================================= */

  const updateReference = (
    index: number,
    field: keyof Reference,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      references: previous.references.map(
        (reference, i) =>
          i === index
            ? {
                ...reference,
                [field]: value,
              }
            : reference
      ),
    }));
  };

  const addReference = () => {
    if (form.references.length >= 5) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      references: [
        ...previous.references,
        {
          name: "",
          relationship: "",
          phone: "",
          email: "",
        },
      ],
    }));
  };

  const removeReference = (index: number) => {
    if (form.references.length <= 2) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      references: previous.references.filter(
        (_, referenceIndex) =>
          referenceIndex !== index
      ),
    }));
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    setLoggingOut(true);
    setError("");

    try {
      const { error: logoutError } =
        await supabase.auth.signOut();

      if (logoutError) {
        throw logoutError;
      }

      window.location.href = "/login";
    } catch (logoutError) {
      console.error(
        "Logout error:",
        logoutError
      );

      setError(
        logoutError instanceof Error
          ? logoutError.message
          : "Unable to logout. Please try again."
      );

      setLoggingOut(false);
    }
  };

  /* =======================================================
     LOAD APPLICATION DRAFT
  ======================================================= */

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadDraft = async () => {
      setLoading(true);
      setError("");

      try {
        const { data, error: loadError } =
          await supabase
            .from("loan_applications")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", {
              ascending: false,
            })
            .limit(1)
            .maybeSingle();

        if (loadError) {
          throw loadError;
        }

        if (data) {
          setApplicationId(data.id);

          const loadedReferences =
            Array.isArray(data.references_json)
              ? (data.references_json as Reference[])
              : initialForm.references;

          const loadedDocuments =
            data.documents_json &&
            typeof data.documents_json ===
              "object" &&
            !Array.isArray(data.documents_json)
              ? (data.documents_json as Record<
                  string,
                  string
                >)
              : {};

          setForm({
            loan_type:
              data.loan_type ?? "",

            loan_amount:
              data.loan_amount == null
                ? ""
                : String(data.loan_amount),

            interest_rate:
              data.interest_rate == null
                ? "12"
                : String(data.interest_rate),

            loan_term_months:
              data.loan_term_months == null
                ? "12"
                : String(data.loan_term_months),

            loan_purpose:
              data.loan_purpose ?? "",

            applicant_first_name:
              data.applicant_first_name ?? "",

            applicant_last_name:
              data.applicant_last_name ?? "",

            applicant_email:
              data.applicant_email ??
              user.email ??
              "",

            applicant_phone:
              data.applicant_phone ?? "",

            applicant_dob:
              data.applicant_dob ?? "",

            applicant_address:
              data.applicant_address ?? "",

            applicant_city:
              data.applicant_city ?? "",

            applicant_state:
              data.applicant_state ?? "",

            applicant_zip:
              data.applicant_zip ?? "",

            employer_name:
              data.employer_name ?? "",

            employment_status:
              data.employment_status ?? "",

            monthly_income:
              data.monthly_income == null
                ? ""
                : String(data.monthly_income),

            co_applicant:
              Boolean(data.co_applicant),

            co_applicant_name:
              data.co_applicant_name ?? "",

            co_applicant_relationship:
              data.co_applicant_relationship ??
              "",

            co_applicant_income:
              data.co_applicant_income == null
                ? ""
                : String(data.co_applicant_income),

            references: loadedReferences,

            documents: loadedDocuments,

            agree_terms: false,
            agree_credit_check: false,
          });

          if (
            typeof data.current_step ===
              "number" &&
            data.current_step >= 1 &&
            data.current_step <= TOTAL_STEPS
          ) {
            setCurrentStep(
              data.current_step
            );
          }
        } else {
          setForm((previous) => ({
            ...previous,
            applicant_email:
              user.email ?? "",
          }));
        }
      } catch (loadError) {
        console.error(
          "Unable to load application:",
          loadError
        );

        setError(
          "Unable to load your application. Please refresh and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadDraft();
  }, [user]);

  /* =======================================================
     APPLICATION PAYLOAD
  ======================================================= */

  const applicationPayload = useMemo(
    () => ({
      loan_type:
        form.loan_type || null,

      loan_amount:
        form.loan_amount === ""
          ? null
          : Number(form.loan_amount),

      interest_rate:
        form.interest_rate === ""
          ? null
          : Number(form.interest_rate),

      loan_term_months:
        form.loan_term_months === ""
          ? null
          : Number(form.loan_term_months),

      loan_purpose:
        form.loan_purpose || null,

      applicant_first_name:
        form.applicant_first_name || null,

      applicant_last_name:
        form.applicant_last_name || null,

      applicant_email:
        form.applicant_email || null,

      applicant_phone:
        form.applicant_phone || null,

      applicant_dob:
        form.applicant_dob || null,

      applicant_address:
        form.applicant_address || null,

      applicant_city:
        form.applicant_city || null,

      applicant_state:
        form.applicant_state || null,

      applicant_zip:
        form.applicant_zip || null,

      employer_name:
        form.employer_name || null,

      employment_status:
        form.employment_status || null,

      monthly_income:
        form.monthly_income === ""
          ? null
          : Number(form.monthly_income),

      co_applicant:
        form.co_applicant,

      co_applicant_name:
        form.co_applicant_name || null,

      co_applicant_relationship:
        form.co_applicant_relationship ||
        null,

      co_applicant_income:
        form.co_applicant_income === ""
          ? null
          : Number(
              form.co_applicant_income
            ),

      references_json:
        form.references,

      documents_json:
        form.documents,
    }),
    [form]
  );

  /* =======================================================
     SAVE APPLICATION
  ======================================================= */

  const saveApplication = async (
    step: number,
    status = "draft"
  ) => {
    if (!user) {
      throw new Error(
        "Please login before applying."
      );
    }

    setSaving(true);

    try {
      const payload = {
        ...applicationPayload,
        current_step: step,
        status,
      };

      if (applicationId) {
        const { error: updateError } =
          await supabase
            .from("loan_applications")
            .update(payload)
            .eq("id", applicationId)
            .eq("user_id", user.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { data, error: insertError } =
          await supabase
            .from("loan_applications")
            .insert({
              ...payload,
              user_id: user.id,
            })
            .select("id")
            .single();

        if (insertError) {
          throw insertError;
        }

        if (data?.id) {
          setApplicationId(data.id);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     SCHEMAS
  ======================================================= */

  const schemas = [
    step1Schema,
    step2Schema,
    step3Schema,
    step4Schema,
    step5Schema,
    step6Schema,
    step7Schema,
    step8Schema,
  ] as const;

  /* =======================================================
     VALIDATE CURRENT STEP
  ======================================================= */

  const validateCurrentStep = () => {
    const schema =
      schemas[currentStep - 1];

    const result = schema.safeParse(form);

    if (!result.success) {
      setError(
        result.error.issues[0]?.message ||
          "Please complete this step."
      );

      return false;
    }

    setError("");
    return true;
  };

  /* =======================================================
     VALIDATE ALL
  ======================================================= */

  const validateAllSteps = () => {
    for (const schema of schemas) {
      const result = schema.safeParse(form);

      if (!result.success) {
        setError(
          result.error.issues[0]?.message ||
            "Please complete all required information."
        );

        return false;
      }
    }

    setError("");
    return true;
  };

  /* =======================================================
     NEXT STEP
  ======================================================= */

  const nextStep = async () => {
    setError("");

    if (!validateCurrentStep()) {
      return;
    }

    try {
      const next = Math.min(
        currentStep + 1,
        TOTAL_STEPS
      );

      await saveApplication(next);

      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(next);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    } catch (saveError) {
      console.error(
        "Save application error:",
        saveError
      );

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save your application."
      );
    }
  };

  /* =======================================================
     PREVIOUS STEP
  ======================================================= */

  const previousStep = () => {
    setError("");

    if (currentStep > 1) {
      setCurrentStep(
        (step) => step - 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /* =======================================================
     DOCUMENT UPLOAD
  ======================================================= */

  const handleFileUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    documentType: string
  ) => {
    const file =
      event.target.files?.[0];

    if (!file || !user) {
      return;
    }

    setError("");
    setUploadingDocument(documentType);

    try {
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          "Only PDF, JPG and PNG files are allowed."
        );
      }

      const maxSize =
        10 * 1024 * 1024;

      if (file.size > maxSize) {
        throw new Error(
          "File size must be 10 MB or less."
        );
      }

      const safeName = file.name
        .replace(
          /[^a-zA-Z0-9.-]/g,
          "-"
        )
        .toLowerCase();

      const filePath =
        `${user.id}/${
          applicationId ?? "draft"
        }/` +
        `${documentType}-${Date.now()}-${safeName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("documents")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      setForm((previous) => ({
        ...previous,
        documents: {
          ...previous.documents,
          [documentType]:
            filePath,
        },
      }));
    } catch (uploadError) {
      console.error(
        "Document upload error:",
        uploadError
      );

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload document."
      );
    } finally {
      setUploadingDocument(null);
      event.target.value = "";
    }
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const submitApplication = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!user) {
      setError(
        "Please login before submitting."
      );
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      if (!validateAllSteps()) {
        return;
      }

      await saveApplication(
        TOTAL_STEPS,
        "submitted"
      );

      setSuccess(true);
    } catch (submitError) {
      console.error(
        "Submit application error:",
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <RouteGuard>
        <main className="min-h-screen bg-[#FAF9F6] px-4 py-10">
          <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
            <div className="flex items-center gap-3">
              <Loader2
                size={20}
                className="animate-spin text-[#8D79C7]"
              />

              <span className="text-sm font-semibold text-[#17213A]">
                Loading your application...
              </span>
            </div>
          </div>
        </main>
      </RouteGuard>
    );
  }

  /* =======================================================
     SUCCESS
  ======================================================= */

  if (success) {
    return (
      <RouteGuard>
        <main className="min-h-screen bg-[#FAF9F6] px-4 py-10">
          <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
            <div className="w-full max-w-xl rounded-[32px] border border-[#17213A]/10 bg-white p-10 text-center shadow-[0_20px_70px_rgba(23,33,58,0.08)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F1EDFF] text-[#8D79C7]">
                <Check size={30} />
              </div>

              <h1 className="mt-6 text-3xl font-bold text-[#17213A]">
                Application submitted
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#68738A]">
                Your loan application has
                been submitted successfully.
                You can track its status from
                your dashboard.
              </p>

              <a
                href="/dashboard"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#17213A] px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Go to dashboard
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </main>
      </RouteGuard>
    );
  }

  /* =======================================================
     APPLICATION PAGE
  ======================================================= */

  return (
    <RouteGuard>
      <main className="min-h-screen bg-[#FAF9F6] px-4 py-6 sm:py-10">
        <div className="mx-auto max-w-6xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#17213A]/10 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-lg font-bold text-[#17213A]">
                Credora
              </p>

              <p className="text-xs text-[#7B8498]">
                Secure loan application
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">

              <div className="hidden items-center gap-2 text-xs text-[#7B8498] md:flex">
                <ShieldCheck size={15} />
                Secure & encrypted
              </div>

              {user?.email && (
                <div className="rounded-xl bg-[#F6F3FC] px-3 py-2 text-xs font-medium text-[#68738A]">
                  {user.email}
                </div>
              )}

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 rounded-xl border border-[#17213A]/10 px-4 py-2.5 text-xs font-semibold text-[#17213A] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loggingOut ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut size={15} />
                    Logout
                  </>
                )}
              </button>

            </div>
          </div>

          {/* =================================================
              CARD
          ================================================= */}

          <div className="rounded-[32px] border border-[#17213A]/10 bg-white p-6 shadow-[0_20px_70px_rgba(23,33,58,0.08)] sm:p-8 lg:p-10">

            <StepIndicator
              currentStep={currentStep}
            />

            {/* ERROR */}

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={submitApplication}
              className="mt-8"
            >


              {currentStep === 1 && (
                <section>
                  <p className="mb-6 text-sm leading-6 text-[#68738A]">
                    Choose the type of financing
                    you are looking for.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      "Personal",
                      "Home",
                      "Auto",
                      "Business",
                      "Education",
                      "Debt Consolidation",
                    ].map((type) => {
                      const selected =
                        form.loan_type === type;

                      return (
                        <button
                          type="button"
                          key={type}
                          onClick={() =>
                            updateField(
                              "loan_type",
                              type
                            )
                          }
                          className={`rounded-[24px] border p-6 text-left transition ${
                            selected
                              ? "border-[#8D79C7] bg-[#F1EDFF] shadow-md"
                              : "border-[#17213A]/10 bg-white hover:border-[#8D79C7]/50"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              selected
                                ? "bg-[#8D79C7] text-white"
                                : "bg-[#F0ECFF] text-[#8D79C7]"
                            }`}
                          >
                            {selected ? (
                              <Check size={18} />
                            ) : (
                              <span className="text-sm font-bold">
                                {type.charAt(0)}
                              </span>
                            )}
                          </div>

                          <h2 className="mt-5 font-bold text-[#17213A]">
                            {type} Loan
                          </h2>

                          <p className="mt-2 text-sm leading-6 text-[#7B8498]">
                            Financing designed
                            around your needs.
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              

              {currentStep === 2 && (
                <section>
                  <div className="grid gap-5 sm:grid-cols-2">

                    <Input
                      label="Loan amount (₹)"
                      type="number"
                      placeholder="500000"
                      value={
                        form.loan_amount
                      }
                      onChange={(value) =>
                        updateField(
                          "loan_amount",
                          value
                        )
                      }
                    />

                    <Input
                      label="Interest rate (%)"
                      type="number"
                      placeholder="12"
                      value={
                        form.interest_rate
                      }
                      onChange={(value) =>
                        updateField(
                          "interest_rate",
                          value
                        )
                      }
                    />

                    <Select
                      label="Loan term"
                      value={
                        form.loan_term_months
                      }
                      onChange={(value) =>
                        updateField(
                          "loan_term_months",
                          value
                        )
                      }
                      options={[
                        "6",
                        "12",
                        "24",
                        "36",
                        "48",
                        "60",
                        "84",
                        "120",
                        "180",
                        "240",
                        "360",
                      ]}
                    />

                    <div className="sm:col-span-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[#17213A]">
                          Loan purpose
                        </span>

                        <textarea
                          value={
                            form.loan_purpose
                          }
                          onChange={(event) =>
                            updateField(
                              "loan_purpose",
                              event.target.value
                            )
                          }
                          placeholder="Tell us briefly what you need the loan for..."
                          rows={5}
                          className="w-full resize-none rounded-2xl border border-[#17213A]/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#8D79C7] focus:ring-4 focus:ring-[#8D79C7]/10"
                        />
                      </label>
                    </div>

                  </div>
                </section>
              )}

             
             

              {currentStep === 3 && (
                <section>
                  <div className="grid gap-5 sm:grid-cols-2">

                    <Input
                      label="First name"
                      value={
                        form.applicant_first_name
                      }
                      onChange={(value) =>
                        updateField(
                          "applicant_first_name",
                          value
                        )
                      }
                    />

                    <Input
                      label="Last name"
                      value={
                        form.applicant_last_name
                      }
                      onChange={(value) =>
                        updateField(
                          "applicant_last_name",
                          value
                        )
                      }
                    />

                    <Input
                      label="Email"
                      type="email"
                      value={
                        form.applicant_email
                      }
                      onChange={(value) =>
                        updateField(
                          "applicant_email",
                          value
                        )
                      }
                    />

                    <Input
                      label="Phone"
                      type="tel"
                      value={
                        form.applicant_phone
                      }
                      onChange={(value) =>
                        updateField(
                          "applicant_phone",
                          value
                        )
                      }
                    />

                    <Input
                      label="Date of birth"
                      type="date"
                      value={
                        form.applicant_dob
                      }
                      onChange={(value) =>
                        updateField(
                          "applicant_dob",
                          value
                        )
                      }
                    />

                    <Input
                      label="PIN code"
                      type="text"
                      placeholder="110001"
                      value={
                        form.applicant_zip
                      }
                      onChange={(value) =>
                        updateField(
                          "applicant_zip",
                          value
                        )
                      }
                    />

                    <div className="sm:col-span-2">
                      <Input
                        label="Address"
                        value={
                          form.applicant_address
                        }
                        onChange={(value) =>
                          updateField(
                            "applicant_address",
                            value
                          )
                        }
                      />
                    </div>

                    <Input
                      label="City"
                      value={
                        form.applicant_city
                      }
                      onChange={(value) =>
                        updateField(
                          "applicant_city",
                          value
                        )
                      }
                    />

                    <Input
                      label="State"
                      value={
                        form.applicant_state
                      }
                      onChange={(value) =>
                        updateField(
                          "applicant_state",
                          value
                        )
                      }
                    />

                  </div>
                </section>
              )}




              {currentStep === 4 && (
                <section>
                  <div className="grid gap-5 sm:grid-cols-2">

                    <Input
                      label="Employer name"
                      value={
                        form.employer_name
                      }
                      onChange={(value) =>
                        updateField(
                          "employer_name",
                          value
                        )
                      }
                    />

                    <Select
                      label="Employment status"
                      value={
                        form.employment_status
                      }
                      onChange={(value) =>
                        updateField(
                          "employment_status",
                          value
                        )
                      }
                      options={[
                        "Full-time",
                        "Part-time",
                        "Self-employed",
                        "Retired",
                        "Unemployed",
                      ]}
                    />

                    <Input
                      label="Monthly income (₹)"
                      type="number"
                      placeholder="50000"
                      value={
                        form.monthly_income
                      }
                      onChange={(value) =>
                        updateField(
                          "monthly_income",
                          value
                        )
                      }
                    />

                  </div>
                </section>
              )}

             
             

              {currentStep === 5 && (
                <section>

                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        "co_applicant",
                        !form.co_applicant
                      )
                    }
                    className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${
                      form.co_applicant
                        ? "border-[#8D79C7] bg-[#F1EDFF]"
                        : "border-[#17213A]/10"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-[#17213A]">
                        Add a co-applicant
                      </p>

                      <p className="mt-1 text-sm text-[#7B8498]">
                        A co-applicant can
                        strengthen your
                        application.
                      </p>
                    </div>

                    <div
                      className={`flex h-7 w-12 items-center rounded-full p-1 ${
                        form.co_applicant
                          ? "bg-[#8D79C7]"
                          : "bg-[#D9DCE3]"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full bg-white transition ${
                          form.co_applicant
                            ? "translate-x-5"
                            : ""
                        }`}
                      />
                    </div>
                  </button>

                  {form.co_applicant && (
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">

                      <Input
                        label="Co-applicant name"
                        value={
                          form.co_applicant_name
                        }
                        onChange={(value) =>
                          updateField(
                            "co_applicant_name",
                            value
                          )
                        }
                      />

                      <Input
                        label="Relationship"
                        value={
                          form.co_applicant_relationship
                        }
                        onChange={(value) =>
                          updateField(
                            "co_applicant_relationship",
                            value
                          )
                        }
                      />

                      <Input
                        label="Co-applicant income (₹)"
                        type="number"
                        value={
                          form.co_applicant_income
                        }
                        onChange={(value) =>
                          updateField(
                            "co_applicant_income",
                            value
                          )
                        }
                      />

                    </div>
                  )}

                </section>
              )}

            
              {currentStep === 6 && (
                <section>

                  <div className="space-y-5">
                    {form.references.map(
                      (
                        reference,
                        index
                      ) => (
                        <div
                          key={`reference-${index}`}
                          className="rounded-2xl border border-[#17213A]/10 p-5"
                        >

                          <div className="mb-5 flex items-center justify-between">
                            <h3 className="font-bold text-[#17213A]">
                              Reference{" "}
                              {index + 1}
                            </h3>

                            {index >= 2 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeReference(
                                    index
                                  )
                                }
                                className="text-xs font-semibold text-red-500"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid gap-5 sm:grid-cols-2">

                            <Input
                              label="Name"
                              value={
                                reference.name
                              }
                              onChange={(
                                value
                              ) =>
                                updateReference(
                                  index,
                                  "name",
                                  value
                                )
                              }
                            />

                            <Input
                              label="Relationship"
                              value={
                                reference.relationship
                              }
                              onChange={(
                                value
                              ) =>
                                updateReference(
                                  index,
                                  "relationship",
                                  value
                                )
                              }
                            />

                            <Input
                              label="Phone"
                              type="tel"
                              value={
                                reference.phone
                              }
                              onChange={(
                                value
                              ) =>
                                updateReference(
                                  index,
                                  "phone",
                                  value
                                )
                              }
                            />

                            <Input
                              label="Email"
                              type="email"
                              value={
                                reference.email
                              }
                              onChange={(
                                value
                              ) =>
                                updateReference(
                                  index,
                                  "email",
                                  value
                                )
                              }
                            />

                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {form.references.length <
                    5 && (
                    <button
                      type="button"
                      onClick={
                        addReference
                      }
                      className="mt-5 rounded-xl border border-[#8D79C7]/30 px-4 py-3 text-sm font-semibold text-[#8D79C7]"
                    >
                      + Add another
                      reference
                    </button>
                  )}

                </section>
              )}

              
              
              {currentStep === 7 && (
                <section>

                  <div className="mb-6">
                    <p className="text-sm leading-6 text-[#68738A]">
                      Upload the documents
                      required for
                      verification.
                      Maximum file size is
                      10 MB.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">

                    {[
                      {
                        key: "identity",
                        title:
                          "Identity document",
                      },
                      {
                        key: "address",
                        title:
                          "Address proof",
                      },
                      {
                        key: "income",
                        title:
                          "Income proof",
                      },
                      {
                        key: "bank_statement",
                        title:
                          "Bank statement",
                      },
                    ].map(
                      (document) => {
                        const uploaded =
                          Boolean(
                            form
                              .documents[
                              document.key
                            ]
                          );

                        const uploading =
                          uploadingDocument ===
                          document.key;

                        return (
                          <label
                            key={
                              document.key
                            }
                            className={`cursor-pointer rounded-[24px] border border-dashed p-6 transition ${
                              uploaded
                                ? "border-[#8D79C7] bg-[#F8F5FF]"
                                : "border-[#17213A]/20 bg-[#FAF9F6] hover:border-[#8D79C7]"
                            }`}
                          >
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              disabled={
                                uploading
                              }
                              onChange={(
                                event
                              ) =>
                                handleFileUpload(
                                  event,
                                  document.key
                                )
                              }
                            />

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEE8FF] text-[#8D79C7]">

                              {uploading ? (
                                <Loader2
                                  size={
                                    20
                                  }
                                  className="animate-spin"
                                />
                              ) : uploaded ? (
                                <FileText
                                  size={
                                    20
                                  }
                                />
                              ) : (
                                <Upload
                                  size={
                                    20
                                  }
                                />
                              )}

                            </div>

                            <h3 className="mt-5 font-bold text-[#17213A]">
                              {
                                document.title
                              }
                            </h3>

                            <p className="mt-2 truncate text-xs text-[#7B8498]">
                              {uploading
                                ? "Uploading..."
                                : uploaded
                                ? "Document uploaded"
                                : "PDF, JPG or PNG"}
                            </p>
                          </label>
                        );
                      }
                    )}

                  </div>
                </section>
              )}

             

              {currentStep === 8 && (
                <section>

                  <div className="rounded-2xl bg-[#FAF9F6] p-6">

                    <h2 className="text-lg font-bold text-[#17213A]">
                      Application summary
                    </h2>

                    <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">

                      <div>
                        <p className="text-[#8A93A5]">
                          Loan type
                        </p>

                        <p className="mt-1 font-semibold text-[#17213A]">
                          {form.loan_type ||
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[#8A93A5]">
                          Loan amount
                        </p>

                        <p className="mt-1 font-semibold text-[#17213A]">
                          {formatINR(
                            form.loan_amount
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[#8A93A5]">
                          Interest rate
                        </p>

                        <p className="mt-1 font-semibold text-[#17213A]">
                          {form.interest_rate ||
                            "0"}
                          %
                        </p>
                      </div>

                      <div>
                        <p className="text-[#8A93A5]">
                          Applicant
                        </p>

                        <p className="mt-1 font-semibold text-[#17213A]">
                          {
                            form.applicant_first_name
                          }{" "}
                          {
                            form.applicant_last_name
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-[#8A93A5]">
                          Employment
                        </p>

                        <p className="mt-1 font-semibold text-[#17213A]">
                          {form.employment_status ||
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[#8A93A5]">
                          Monthly income
                        </p>

                        <p className="mt-1 font-semibold text-[#17213A]">
                          {formatINR(
                            form.monthly_income
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[#8A93A5]">
                          Loan term
                        </p>

                        <p className="mt-1 font-semibold text-[#17213A]">
                          {
                            form.loan_term_months
                          }{" "}
                          months
                        </p>
                      </div>

                      <div>
                        <p className="text-[#8A93A5]">
                          Documents
                        </p>

                        <p className="mt-1 font-semibold text-[#17213A]">
                          {
                            Object.keys(
                              form.documents
                            ).length
                          }{" "}
                          uploaded
                        </p>
                      </div>

                    </div>
                  </div>

                  <div className="mt-6 space-y-4">

                    <label className="flex cursor-pointer gap-3 rounded-2xl border border-[#17213A]/10 p-5">

                      <input
                        type="checkbox"
                        checked={
                          form.agree_terms
                        }
                        onChange={(event) =>
                          updateField(
                            "agree_terms",
                            event.target
                              .checked
                          )
                        }
                        className="mt-1 h-4 w-4 accent-[#8D79C7]"
                      />

                      <span className="text-sm leading-6 text-[#68738A]">
                        I agree to the terms
                        and conditions and
                        confirm that the
                        information provided
                        is accurate.
                      </span>

                    </label>

                    <label className="flex cursor-pointer gap-3 rounded-2xl border border-[#17213A]/10 p-5">

                      <input
                        type="checkbox"
                        checked={
                          form.agree_credit_check
                        }
                        onChange={(event) =>
                          updateField(
                            "agree_credit_check",
                            event.target
                              .checked
                          )
                        }
                        className="mt-1 h-4 w-4 accent-[#8D79C7]"
                      />

                      <span className="text-sm leading-6 text-[#68738A]">
                        I authorize Credora
                        to perform the
                        necessary credit and
                        verification checks
                        for this application.
                      </span>

                    </label>

                  </div>

                </section>
              )}

              

              <div className="mt-10 flex flex-col-reverse gap-3 border-t border-[#17213A]/10 pt-6 sm:flex-row sm:items-center sm:justify-between">

                <button
                  type="button"
                  onClick={
                    previousStep
                  }
                  disabled={
                    currentStep === 1 ||
                    saving ||
                    submitting
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#17213A]/10 px-5 py-3.5 text-sm font-semibold text-[#17213A] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <div className="flex items-center gap-3">

                  {saving && (
                    <span className="flex items-center gap-2 text-xs text-[#7B8498]">
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                      Saving...
                    </span>
                  )}

                  {currentStep <
                  TOTAL_STEPS ? (
                    <button
                      type="button"
                      onClick={
                        nextStep
                      }
                      disabled={
                        saving ||
                        uploadingDocument !==
                          null
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#17213A] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      Continue
                      <ArrowRight
                        size={16}
                      />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        saving ||
                        uploadingDocument !==
                          null
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#17213A] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit
                          Application
                          <Check
                            size={16}
                          />
                        </>
                      )}
                    </button>
                  )}

                </div>
              </div>

            </form>
          </div>

          
          

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#8A93A5]">
            <ShieldCheck size={14} />
            Your application is protected by
            secure authentication.
          </div>

        </div>
      </main>
    </RouteGuard>
  );
}