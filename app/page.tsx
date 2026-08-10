
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ShieldCheck,
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  User,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/providers';
import { toast } from 'sonner';

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Enter your full name')
      .max(80, 'Name is too long'),

    email: z
      .string()
      .min(1, 'Email is required')
      .email('Enter a valid email'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[0-9]/, 'Include at least one number'),

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitting(true);

    try {
      const { error } = await signUp(
        values.email,
        values.password,
        values.fullName
      );

      if (error) {
        toast.error(error);
        return;
      }

      toast.success('Account created. Welcome to Credora.');

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {/* Left panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-400 shadow-lg shadow-sky-500/20">
              <ShieldCheck
                className="h-5 w-5 text-white"
                strokeWidth={2.5}
              />
            </div>

            <span className="text-xl font-bold tracking-tight text-slate-900">
              Credora
            </span>
          </div>

          <Card className="border-0 bg-white shadow-xl shadow-slate-200/60">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Create your account
              </CardTitle>

              <CardDescription>
                Start your loan application in minutes
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {/* Full Name */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>

                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <Input
                              placeholder="Alex Morgan"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>

                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <Input
                              type="email"
                              placeholder="you@example.com"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>

                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>

                        <FormDescription>
                          At least 8 characters with one uppercase letter and
                          one number.
                        </FormDescription>

                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm password</FormLabel>

                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>


                  <p className="text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link
                      href="/login"
                      className="font-semibold text-sky-600 hover:text-sky-700"
                    >
                      Sign in
                    </Link>
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>


      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 to-teal-900 p-10 text-white lg:flex lg:p-16">
        <div className="absolute inset-0 bg-hero-glow opacity-40" />
        <div className="absolute inset-0 grid-bg opacity-10" />

        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-400 shadow-lg shadow-sky-500/30">
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

        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight lg:text-4xl">
            Your path to funding starts here
          </h2>

          <p className="mt-4 max-w-md text-white/80">
            Join thousands of borrowers who found a faster, fairer way to get
            a loan.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { value: '$1.2B+', label: 'Funded' },
              { value: '48hr', label: 'Avg. decision' },
              { value: '4.9/5', label: 'Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/50">
          © {new Date().getFullYear()} Credora. All rights reserved.
        </p>
      </div>
    </div>
  );
}

