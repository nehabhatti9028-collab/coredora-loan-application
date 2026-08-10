'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Loader2,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client';
import type { LoanApplication, LoanStatus } from '@/lib/types';
import { LOAN_STATUS_META } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/loan';

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'funded', label: 'Funded' },
];

export default function LoansPage() {
  const [apps, setApps] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .order('updated_at', { ascending: false });
      if (!error && data) setApps(data as LoanApplication[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      const matchesSearch =
        !search ||
        a.loan_type.toLowerCase().includes(search.toLowerCase()) ||
        a.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [apps, search, statusFilter]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Loan tracking</h1>
          <p className="mt-1 text-muted-foreground">Track the status of all your loan applications.</p>
        </div>
        <Button asChild>
          <Link href="/apply"><Plus className="mr-2 h-4 w-4" /> New application</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by loan type or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <FileText className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              {apps.length === 0 ? 'No applications yet' : 'No matching applications'}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {apps.length === 0
                ? 'Start your first loan application with our guided 8-step process.'
                : 'Try adjusting your search or filter.'}
            </p>
            {apps.length === 0 && (
              <Button asChild className="mt-6">
                <Link href="/apply"><Plus className="mr-2 h-4 w-4" /> Start an application</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const meta = LOAN_STATUS_META[app.status];
            return (
              <Link key={app.id} href={`/loans/${app.id}`}>
                <Card className="transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{app.loan_type} Loan</p>
                          <Badge
                            variant={meta.badge as 'default' | 'secondary' | 'destructive' | 'outline'}
                            style={meta.badge === 'default' ? { backgroundColor: meta.color } : undefined}
                          >
                            {meta.label}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {formatCurrency(Number(app.loan_amount))} · {app.loan_term_months} months · {app.interest_rate}% APR
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">Updated {formatDate(app.updated_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {app.status === 'draft' ? (
                        <div className="w-32">
                          <p className="mb-1 text-xs text-muted-foreground">Step {app.current_step}/8</p>
                          <Progress value={(app.current_step / 8) * 100} className="h-1.5" />
                        </div>
                      ) : null}
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
