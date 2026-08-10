"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShieldCheck,
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useAuth } from "@/components/providers";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F7FC]">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-[#7C65C1]" />
        Loading...
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);

    try {
      const { error } = await signIn(
        values.email.trim(),
        values.password
      );

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Welcome back to Credora");

      const redirect =
        searchParams.get("redirect") || "/dashboard";

      router.push(redirect);
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);

      toast.error(
        "Unable to sign in. Please check your credentials and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* LEFT BRAND PANEL */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-[#24183D] to-slate-950 lg:flex lg:w-1/2">
        {/* Decorative purple glow */}
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#7C65C1]/20 blur-3xl" />

        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-purple-900/30 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C65C1]/10 blur-3xl" />

        <div className="relative flex w-full flex-col justify-between p-12 xl:p-16">
          {/* LOGO */}
          <Link
            href="/"
            className="flex w-fit items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg shadow-purple-950/30 backdrop-blur-sm">
              <ShieldCheck
                className="h-6 w-6 text-[#C8B8F2]"
                strokeWidth={2.5}
              />
            </div>

            <div>
              <span className="block text-2xl font-bold tracking-tight text-white">
                Credora
              </span>

              <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-400">
                Digital lending
              </span>
            </div>
          </Link>

          {/* HERO CONTENT */}
          <div className="relative max-w-xl">
            <div className="mb-5 inline-flex items-center rounded-full border border-[#8D79C7]/20 bg-[#8D79C7]/10 px-3 py-1.5">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-[#A996E5]" />

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8B8F2]">
                Simple. Secure. Smarter.
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
              Welcome back to smarter borrowing
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              Sign in to track your applications, manage
              your documents, and pick up right where you
              left off.
            </p>

            {/* FEATURES */}
            <div className="mt-8 space-y-4">
              {[
                "8-step guided application",
                "Real-time loan tracking",
                "Secure document management",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#8D79C7]/20 bg-[#8D79C7]/15">
                    <ShieldCheck
                      className="h-4 w-4 text-[#C8B8F2]"
                      strokeWidth={2.5}
                    />
                  </div>

                  <span className="text-sm font-medium text-slate-200">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Credora. All rights
            reserved.
          </p>
        </div>
      </div>

      {/* RIGHT LOGIN AREA */}
      <div className="flex flex-1 items-center justify-center bg-[#F8F7FC] p-6 lg:p-10">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* MOBILE LOGO */}
          <div className="mb-8 lg:hidden">
            <Link
              href="/"
              className="flex items-center gap-2.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8D79C7] to-[#6E5BA8] shadow-md shadow-[#8D79C7]/20">
                <ShieldCheck
                  className="h-5 w-5 text-white"
                  strokeWidth={2.5}
                />
              </div>

              <span className="text-xl font-bold tracking-tight">
                Credora
              </span>
            </Link>
          </div>

          {/* LOGIN CARD */}
          <Card className="rounded-3xl border border-[#17213A]/10 bg-white shadow-xl shadow-slate-900/5">
            <CardHeader className="space-y-1.5 p-6 pb-3 sm:p-8 sm:pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight text-[#17213A]">
                Sign in
              </CardTitle>

              <CardDescription className="text-sm leading-6">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-3 sm:p-8 sm:pt-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {/* EMAIL */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-[#17213A]">
                          Email
                        </FormLabel>

                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <Input
                              type="email"
                              placeholder="you@example.com"
                              autoComplete="email"
                              className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-9 transition focus-visible:border-[#8D79C7] focus-visible:ring-[#8D79C7]/20"
                              {...field}
                            />
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* PASSWORD */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm font-medium text-[#17213A]">
                            Password
                          </FormLabel>

                          <Link
                            href="/forgot-password"
                            className="text-xs font-medium text-[#7C65C1] transition hover:text-[#6650A8] hover:underline"
                          >
                            Forgot password?
                          </Link>
                        </div>

                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <Input
                              type={
                                showPassword
                                  ? "text"
                                  : "password"
                              }
                              placeholder="••••••••"
                              autoComplete="current-password"
                              className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-10 transition focus-visible:border-[#8D79C7] focus-visible:ring-[#8D79C7]/20"
                              {...field}
                            />

                            <button
                              type="button"
                              aria-label={
                                showPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                              onClick={() =>
                                setShowPassword(
                                  (previous) => !previous
                                )
                              }
                              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-[#EEE8FF] hover:text-[#7C65C1]"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* SIGN IN BUTTON */}
                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-[#7C65C1] text-white shadow-lg shadow-[#7C65C1]/20 transition-all hover:bg-[#6E57B0] hover:shadow-[#7C65C1]/30"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>



              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-[#7C65C1] transition hover:text-[#6650A8] hover:underline"
                >
                  Create one
                </Link>
              </p>
            </CardContent>
          </Card>


          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-[#7C65C1]" />

            <span>
              Your account is protected with secure
              authentication.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}