"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  TrendingUp,
  DollarSign,
  FileText,
  Plus,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers";

import type { LoanApplication } from "@/lib/types";
import { LOAN_STATUS_META } from "@/lib/constants";

import {
  formatCurrency,
  formatDate,
} from "@/lib/loan";

interface DashboardData {
  applications: LoanApplication[];
  documentCount: number;
}

export default function DashboardPage() {
  const { user, profile } = useAuth();

  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [appsRes, docsRes] = await Promise.all([
          supabase
            .from("loan_applications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("documents")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq("user_id", user.id),
        ]);

        if (appsRes.error) {
          console.error(
            "Applications load error:",
            appsRes.error
          );
        }

        if (docsRes.error) {
          console.error(
            "Documents load error:",
            docsRes.error
          );
        }

        setData({
          applications:
            (appsRes.data as LoanApplication[]) ?? [],
          documentCount: docsRes.count ?? 0,
        });
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );

        setData({
          applications: [],
          documentCount: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  const apps = data?.applications ?? [];

  const activeApps = apps.filter(
    (application) =>
      !["rejected", "funded"].includes(
        application.status
      )
  );

  const fundedApps = apps.filter(
    (application) =>
      application.status === "funded"
  );

  const totalBorrowed = fundedApps.reduce(
    (sum, application) =>
      sum + Number(application.loan_amount || 0),
    0
  );

  const totalRequested = apps.reduce(
    (sum, application) =>
      sum + Number(application.loan_amount || 0),
    0
  );

  const statusCounts = apps.reduce<
    Record<string, number>
  >((accumulator, application) => {
    accumulator[application.status] =
      (accumulator[application.status] ?? 0) + 1;

    return accumulator;
  }, {});

  const pieData = Object.entries(statusCounts).map(
    ([status, count]) => ({
      name:
        LOAN_STATUS_META[
          status as keyof typeof LOAN_STATUS_META
        ]?.label ?? status,

      value: count,

      color:
        LOAN_STATUS_META[
          status as keyof typeof LOAN_STATUS_META
        ]?.color ?? "#94a3b8",
    })
  );

  const now = new Date();

  const months: {
    label: string;
    count: number;
    amount: number;
  }[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );

    const label = date.toLocaleString("en-US", {
      month: "short",
    });

    const monthApplications = apps.filter(
      (application) => {
        const createdDate = new Date(
          application.created_at
        );

        return (
          createdDate.getFullYear() ===
            date.getFullYear() &&
          createdDate.getMonth() ===
            date.getMonth()
        );
      }
    );

    months.push({
      label,
      count: monthApplications.length,
      amount: monthApplications.reduce(
        (sum, application) =>
          sum +
          Number(application.loan_amount || 0),
        0
      ),
    });
  }

  const firstName = (
    profile?.full_name ||
    user?.email?.split("@")[0] ||
    "there"
  ).split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">



      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#8D79C7]" />

            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Your overview
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back, {firstName}
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Keep track of your applications, loan
            progress and documents from one place.
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="h-11 rounded-xl bg-[#8D79C7] px-5 text-white shadow-lg shadow-[#8D79C7]/20 hover:bg-[#7D69B8]"
        >
          <Link href="/apply">
            <Plus className="mr-2 h-4 w-4" />
            New application
          </Link>
        </Button>
      </div>



      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={FileText}
              label="Applications"
              value={String(apps.length)}
              hint={`${activeApps.length} currently active`}
              tint="purple"
            />

            <StatCard
              icon={DollarSign}
              label="Total requested"
              value={formatCurrency(totalRequested)}
              hint={`${fundedApps.length} funded`}
              tint="teal"
            />

            <StatCard
              icon={TrendingUp}
              label="Total borrowed"
              value={formatCurrency(totalBorrowed)}
              hint="Across funded loans"
              tint="blue"
            />

            <StatCard
              icon={ShieldCheck}
              label="Documents"
              value={String(
                data?.documentCount ?? 0
              )}
              hint="Documents on file"
              tint="amber"
            />
          </>
        )}
      </div>



      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden rounded-3xl border-border/60 bg-card shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">
                  Application activity
                </CardTitle>

                <CardDescription className="mt-1">
                  Your loan activity over the last
                  six months
                </CardDescription>
              </div>

              <div className="rounded-xl bg-[#EEE8FF] px-3 py-2">
                <TrendingUp className="h-4 w-4 text-[#8D79C7]" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <Skeleton className="h-[280px] w-full rounded-2xl" />
            ) : (
              <ResponsiveContainer
                width="100%"
                height={280}
              >
                <AreaChart
                  data={months}
                  margin={{
                    left: -20,
                    right: 8,
                    top: 15,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="dashboardAmountGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#8D79C7"
                        stopOpacity={0.28}
                      />

                      <stop
                        offset="95%"
                        stopColor="#8D79C7"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      value >= 1000
                        ? `${Math.round(
                            value / 1000
                          )}k`
                        : value
                    }
                  />

                  <RechartsTooltip
                    formatter={(
                      value: number
                    ) => [
                      formatCurrency(value),
                      "Amount",
                    ]}
                    contentStyle={{
                      borderRadius: "14px",
                      border:
                        "1px solid hsl(var(--border))",
                      background:
                        "hsl(var(--card))",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#8D79C7"
                    strokeWidth={3}
                    fill="url(#dashboardAmountGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>


        <Card className="overflow-hidden rounded-3xl border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">
              Application status
            </CardTitle>

            <CardDescription>
              Breakdown of your applications
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <Skeleton className="h-[260px] rounded-2xl" />
            ) : pieData.length === 0 ? (
              <div className="flex h-[260px] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEE8FF]">
                  <FileText className="h-6 w-6 text-[#8D79C7]" />
                </div>

                <p className="font-medium">
                  No applications yet
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Your application status will
                  appear here.
                </p>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={260}
              >
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={82}
                    paddingAngle={3}
                  >
                    {pieData.map(
                      (entry, index) => (
                        <Cell
                          key={`${entry.name}-${index}`}
                          fill={entry.color}
                        />
                      )
                    )}
                  </Pie>

                  <Legend
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "12px",
                    }}
                  />

                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>



      <Card className="rounded-3xl border-border/60 bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">
                Recent applications
              </CardTitle>

              <CardDescription className="mt-1">
                Track your latest loan requests
              </CardDescription>
            </div>

            {apps.length > 0 && (
              <Button
                asChild
                variant="ghost"
                className="hidden sm:flex"
              >
                <Link href="/loans">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <ApplicationSkeleton />
              <ApplicationSkeleton />
              <ApplicationSkeleton />
            </div>
          ) : apps.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {apps.slice(0, 5).map((application) => {
                const meta =
                  LOAN_STATUS_META[
                    application.status as keyof typeof LOAN_STATUS_META
                  ];

                return (
                  <Link
                    key={application.id}
                    href={`/loans/${application.id}`}
                    className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/60 p-4 transition hover:border-[#8D79C7]/40 hover:bg-[#FAF9FF] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEE8FF] text-[#8D79C7]">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {application.loan_type ||
                            "Loan Application"}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Applied{" "}
                          {formatDate(
                            application.created_at
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="font-semibold">
                          {formatCurrency(
                            Number(
                              application.loan_amount ||
                                0
                            )
                          )}
                        </p>

                        <Badge
                          variant="secondary"
                          className="mt-1"
                        >
                          {meta?.label ??
                            application.status}
                        </Badge>
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-[#8D79C7]" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile view all */}
      {!loading && apps.length > 0 && (
        <div className="sm:hidden">
          <Button
            asChild
            variant="outline"
            className="w-full rounded-xl"
          >
            <Link href="/loans">
              View all applications
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}



function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tint,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
  hint: string;
  tint: "purple" | "teal" | "blue" | "amber";
}) {
  const tints = {
    purple:
      "bg-[#EEE8FF] text-[#8D79C7]",
    teal:
      "bg-emerald-50 text-emerald-600",
    blue:
      "bg-blue-50 text-blue-600",
    amber:
      "bg-amber-50 text-amber-600",
  };

  return (
    <Card className="rounded-3xl border-border/60 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {label}
          </p>

          <h3 className="mt-2 truncate text-2xl font-bold tracking-tight">
            {value}
          </h3>

          <p className="mt-2 text-xs text-muted-foreground">
            {hint}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tints[tint]}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}



function StatSkeleton() {
  return (
    <Card className="rounded-3xl border-border/60">
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>

        <Skeleton className="h-12 w-12 rounded-2xl" />
      </CardContent>
    </Card>
  );
}

function ApplicationSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/60 p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-11 w-11 rounded-xl" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}



function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEE8FF]">
        <FileText className="h-7 w-7 text-[#8D79C7]" />
      </div>

      <h3 className="text-xl font-semibold">
        No applications yet
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Start your first loan application. Our
        guided process will take you through each
        step.
      </p>

      <Button
        asChild
        className="mt-6 rounded-xl bg-[#8D79C7] text-white hover:bg-[#7D69B8]"
      >
        <Link href="/apply">
          <Plus className="mr-2 h-4 w-4" />
          Start an application
        </Link>
      </Button>
    </div>
  );
}