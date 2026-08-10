'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User, Mail, Save, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/components/providers';
import { supabase } from '@/lib/supabase/client';
import { US_STATES } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/loan';
import type { LoanApplication } from '@/lib/types';
import { toast } from 'sonner';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Enter your full name').max(80),
  phone: z.string().max(20).optional().or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
  address: z.string().max(120).optional().or(z.literal('')),
  city: z.string().max(60).optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  postal_code: z.string().max(10).optional().or(z.literal('')),
  employer_name: z.string().max(80).optional().or(z.literal('')),
  annual_income: z.coerce.number().min(0).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apps, setApps] = useState<LoanApplication[]>([]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      date_of_birth: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      employer_name: '',
      annual_income: 0,
    },
  });

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (profileData) {
        form.reset({
          full_name: profileData.full_name ?? '',
          phone: profileData.phone ?? '',
          date_of_birth: profileData.date_of_birth ?? '',
          address: profileData.address ?? '',
          city: profileData.city ?? '',
          state: profileData.state ?? '',
          postal_code: profileData.postal_code ?? '',
          employer_name: profileData.employer_name ?? '',
          annual_income: Number(profileData.annual_income ?? 0),
        });
      }
      const { data: appsData } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (appsData) setApps(appsData as LoanApplication[]);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    setSaving(true);
    const payload = {
      full_name: values.full_name,
      phone: values.phone || null,
      date_of_birth: values.date_of_birth || null,
      address: values.address || null,
      city: values.city || null,
      state: values.state || null,
      postal_code: values.postal_code || null,
      employer_name: values.employer_name || null,
      annual_income: values.annual_income || null,
    };
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...payload })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      toast.error('Could not save your profile');
      return;
    }
    await refreshProfile();
    toast.success('Profile updated successfully');
  };

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const totalBorrowed = apps.filter((a) => a.status === 'funded').reduce((s, a) => s + Number(a.loan_amount), 0);
  const memberSince = user?.created_at ? formatDate(user.created_at) : '—';

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your personal information and account details.</p>
      </div>

      {/* Account summary */}
      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-br from-sky-500 to-teal-400 text-lg font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-bold">{profile?.full_name || 'Your name'}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <p className="mt-1 text-xs text-muted-foreground">Member since {memberSince}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-xl font-bold">{apps.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total borrowed</p>
                <p className="text-xl font-bold">{formatCurrency(totalBorrowed)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5" /> Personal information</CardTitle>
          <CardDescription>Update your details. This information pre-fills future loan applications.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField control={form.control} name="full_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl><Input placeholder="Alex Morgan" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input type="tel" placeholder="(555) 123-4567" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField control={form.control} name="date_of_birth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of birth</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="annual_income" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual income</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input type="number" className="pl-7" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>Gross annual income before taxes.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Street address</FormLabel>
                  <FormControl><Input placeholder="123 Main St, Apt 4" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid gap-5 sm:grid-cols-3">
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input placeholder="Springfield" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger></FormControl>
                      <SelectContent className="max-h-72">
                        {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="postal_code" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP code</FormLabel>
                    <FormControl><Input placeholder="62704" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="employer_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Employer name</FormLabel>
                  <FormControl><Input placeholder="Acme Corporation" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Account security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Account & security</CardTitle>
          <CardDescription>Your account authentication details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Email address</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <span className="text-xs font-medium text-success">Verified</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Authentication</p>
                <p className="text-sm text-muted-foreground">Email & password</p>
              </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground">Active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
