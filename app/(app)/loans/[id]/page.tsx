'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Loader2,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  Calendar,
  User,
  Briefcase,
  Users,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase/client';
import type { LoanApplication, DocumentRecord } from '@/lib/types';
import { LOAN_STATUS_META } from '@/lib/constants';
import { calculateEmi, formatCurrency, formatCurrencyPrecise, formatDate, formatDateTime, formatBytes } from '@/lib/loan';
import { toast } from 'sonner';

const TIMELINE_ORDER: { status: string; label: string; icon: typeof CheckCircle2 }[] = [
  { status: 'draft', label: 'Application started', icon: FileText },
  { status: 'submitted', label: 'Application submitted', icon: ShieldCheck },
  { status: 'under_review', label: 'Under review', icon: Clock },
  { status: 'approved', label: 'Approved', icon: CheckCircle2 },
  { status: 'funded', label: 'Funded', icon: DollarSign },
];

export default function LoanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [app, setApp] = useState<LoanApplication | null>(null);
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const [appRes, docsRes] = await Promise.all([
        supabase.from('loan_applications').select('*').eq('id', id).maybeSingle(),
        supabase.from('documents').select('*').eq('application_id', id).order('created_at', { ascending: false }),
      ]);
      if (appRes.data) setApp(appRes.data as LoanApplication);
      if (docsRes.data) setDocs(docsRes.data as DocumentRecord[]);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from('loan_applications').delete().eq('id', id);
    setDeleting(false);
    if (error) {
      toast.error('Could not delete the application');
      return;
    }
    toast.success('Application deleted');
    router.push('/loans');
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="text-2xl font-bold">Application not found</h1>
        <p className="mt-2 text-muted-foreground">This application may have been deleted or you don&apos;t have access to it.</p>
        <Button asChild className="mt-6">
          <Link href="/loans"><ArrowLeft className="mr-2 h-4 w-4" /> Back to loans</Link>
        </Button>
      </div>
    );
  }

  const meta = LOAN_STATUS_META[app.status];
  const emi = calculateEmi(Number(app.loan_amount), Number(app.interest_rate), app.loan_term_months);
  const isRejected = app.status === 'rejected';

  const currentTimelineIndex = TIMELINE_ORDER.findIndex((t) => t.status === app.status);
  const timeline = isRejected
    ? TIMELINE_ORDER.slice(0, 2)
    : TIMELINE_ORDER.slice(0, currentTimelineIndex + 1);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/loans"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{app.loan_type} Loan</h1>
              <Badge
                variant={meta.badge as 'default' | 'secondary' | 'destructive' | 'outline'}
                style={meta.badge === 'default' ? { backgroundColor: meta.color } : undefined}
              >
                {meta.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Application #{app.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {app.status === 'draft' && (
            <Button asChild variant="outline">
              <Link href={`/apply?edit=${app.id}`}><Pencil className="mr-2 h-4 w-4" /> Continue</Link>
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => setDeleteOpen(true)} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application timeline</CardTitle>
          <CardDescription>Track your application through each stage</CardDescription>
        </CardHeader>
        <CardContent>
          {isRejected ? (
            <div className="flex items-center gap-3 rounded-xl bg-destructive/5 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-destructive">Application rejected</p>
                <p className="text-sm text-muted-foreground">
                  {app.decisioned_at ? `Decided on ${formatDate(app.decisioned_at)}` : 'Unfortunately this application was not approved.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 h-full w-0.5 bg-border" />
              <div className="space-y-6">
                {TIMELINE_ORDER.map((t, i) => {
                  const reached = i <= currentTimelineIndex;
                  const isCurrent = i === currentTimelineIndex;
                  const Icon = t.icon;
                  return (
                    <div key={t.status} className="relative flex items-center gap-4">
                      <div
                        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                          reached ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                        } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={`font-medium ${reached ? 'text-foreground' : 'text-muted-foreground'}`}>{t.label}</p>
                        {reached && i === 0 && <p className="text-sm text-muted-foreground">Started {formatDate(app.created_at)}</p>}
                        {reached && i === 1 && <p className="text-sm text-muted-foreground">Submitted {formatDate(app.updated_at)}</p>}
                        {isCurrent && i > 1 && <p className="text-sm text-muted-foreground">In progress</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loan summary */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Loan summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <SummaryRow icon={DollarSign} label="Loan amount" value={formatCurrency(Number(app.loan_amount))} />
              <SummaryRow icon={Calendar} label="Term" value={`${app.loan_term_months} months`} />
              <SummaryRow icon={DollarSign} label="Interest rate" value={`${app.interest_rate}% APR`} />
              <SummaryRow icon={DollarSign} label="Monthly payment" value={formatCurrencyPrecise(emi.monthlyPayment)} />
              <SummaryRow icon={DollarSign} label="Total interest" value={formatCurrency(emi.totalInterest)} />
              <SummaryRow icon={DollarSign} label="Total repayment" value={formatCurrency(emi.totalPayment)} />
            </div>
            {app.loan_purpose && (
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-sm font-medium text-muted-foreground">Purpose</p>
                <p className="mt-1 text-sm">{app.loan_purpose}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(app.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last updated</p>
              <p className="font-medium">{formatDateTime(app.updated_at)}</p>
            </div>
            {app.status === 'draft' && (
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Wizard progress</p>
                <Progress value={(app.current_step / 8) * 100} className="h-2" />
                <p className="mt-1 text-xs text-muted-foreground">Step {app.current_step} of 8</p>
              </div>
            )}
            {app.decisioned_at && (
              <div>
                <p className="text-sm text-muted-foreground">Decision date</p>
                <p className="font-medium">{formatDate(app.decisioned_at)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Applicant details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Applicant details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailRow icon={User} label="Name" value={`${app.applicant_first_name ?? ''} ${app.applicant_last_name ?? ''}`.trim() || '—'} />
            <DetailRow icon={Mail} label="Email" value={app.applicant_email ?? '—'} />
            <DetailRow icon={Phone} label="Phone" value={app.applicant_phone ?? '—'} />
            <DetailRow icon={Calendar} label="Date of birth" value={app.applicant_dob ? formatDate(app.applicant_dob) : '—'} />
            <DetailRow icon={MapPin} label="Address" value={[app.applicant_address, app.applicant_city, app.applicant_state, app.applicant_zip].filter(Boolean).join(', ') || '—'} />
            <DetailRow icon={Briefcase} label="Employer" value={app.employer_name ?? '—'} />
            <DetailRow icon={Briefcase} label="Employment" value={app.employment_status ?? '—'} />
            <DetailRow icon={DollarSign} label="Monthly income" value={app.monthly_income ? formatCurrency(Number(app.monthly_income)) : '—'} />
          </div>
        </CardContent>
      </Card>

      {/* Co-applicant */}
      {app.co_applicant && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" /> Co-applicant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <DetailRow icon={User} label="Name" value={app.co_applicant_name ?? '—'} />
              <DetailRow icon={Users} label="Relationship" value={app.co_applicant_relationship ?? '—'} />
              <DetailRow icon={DollarSign} label="Monthly income" value={app.co_applicant_income ? formatCurrency(Number(app.co_applicant_income)) : '—'} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* References */}
      {app.references_json && app.references_json.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">References</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(app.references_json as { name: string; relationship: string; phone: string; email: string }[]).map((r, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm text-muted-foreground">{r.relationship}</p>
                  <p className="mt-2 text-sm">{r.phone}</p>
                  <p className="text-sm text-muted-foreground">{r.email}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Documents</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/documents">Manage documents <ArrowLeft className="ml-1 h-4 w-4 rotate-180" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {docs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents uploaded for this application yet.</p>
          ) : (
            <div className="space-y-2">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{d.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.document_type.replace(/_/g, ' ')} · {d.file_size ? formatBytes(d.file_size) : ''} · {formatDate(d.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">{d.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this application?</DialogTitle>
            <DialogDescription>
              This will permanently delete your {app.loan_type} loan application and all associated documents. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {deleting ? 'Deleting…' : 'Delete application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed pb-2">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium break-words">{value}</p>
      </div>
    </div>
  );
}
