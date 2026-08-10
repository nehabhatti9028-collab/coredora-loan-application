'use client';

import { useMemo, useState } from 'react';

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
} from 'recharts';

import {
  Calculator,
  DollarSign,
  Percent,
  Calendar,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Button } from '@/components/ui/button';

import {
  calculateEmi,
  formatCurrency,
  formatCurrencyPrecise,
} from '@/lib/loan';

import { toast } from 'sonner';

export default function CalculatorPage() {
  const [amount, setAmount] = useState(25000);
  const [rate, setRate] = useState(8.5);
  const [term, setTerm] = useState(60);

  const result = useMemo(
    () => calculateEmi(amount, rate, term),
    [amount, rate, term]
  );

  const chartData = useMemo(() => {
    let cumPrincipal = 0;
    let cumInterest = 0;

    return result.schedule.map((entry) => {
      cumPrincipal += entry.principal;
      cumInterest += entry.interest;

      return {
        month: entry.month,
        principal: Math.round(cumPrincipal),
        interest: Math.round(cumInterest),
        balance: Math.round(entry.balance),
      };
    });
  }, [result]);

  const pieData = [
    {
      name: 'Principal',
      value: Math.round(result.totalPayment - result.totalInterest),
      color: 'hsl(199 89% 48%)',
    },
    {
      name: 'Interest',
      value: Math.round(result.totalInterest),
      color: 'hsl(174 72% 42%)',
    },
  ];

  const handleReset = () => {
    setAmount(25000);
    setRate(8.5);
    setTerm(60);

    toast.success('Calculator reset to defaults');
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* Inputs */}
      <Card className="rounded-3xl border-white/40 bg-white/70 shadow-xl backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calculator className="h-5 w-5" />
            Loan Calculator
          </CardTitle>
          <CardDescription>
            Adjust the inputs to estimate your monthly payment.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Loan Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Interest Rate (p.a.)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="rate"
                  type="number"
                  min={0}
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="term">Loan Term</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Select
                  value={String(term)}
                  onValueChange={(v) => setTerm(Number(v))}
                >
                  <SelectTrigger id="term" className="pl-9">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {[12, 24, 36, 48, 60].map((t) => (
                      <SelectItem key={t} value={String(t)}>
                        {t} months
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button variant="outline" onClick={handleReset} className="mt-6">
            Reset
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">

          <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white shadow-2xl">
            <CardContent className="pt-8">
              <p className="text-sm font-medium text-white/80">
                Estimated Monthly Payment
              </p>

              <h2 className="mt-2 text-5xl font-bold">
                {formatCurrencyPrecise(result.monthlyPayment)}
              </h2>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm text-white/70">Principal</p>
                  <p className="mt-2 text-xl font-bold">
                    {formatCurrency(amount)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm text-white/70">Total Interest</p>
                  <p className="mt-2 text-xl font-bold">
                    {formatCurrency(result.totalInterest)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm text-white/70">Total Payment</p>
                  <p className="mt-2 text-xl font-bold">
                    {formatCurrency(result.totalPayment)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="rounded-3xl border-white/40 bg-white/70 shadow-lg backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-base">
                  Principal vs Interest
                </CardTitle>
                <CardDescription>Payment breakdown</CardDescription>
              </CardHeader>

              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>

                    <RechartsTooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/40 bg-white/70 shadow-lg backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-base">
                  Balance Over Time
                </CardTitle>
                <CardDescription>
                  Remaining balance each month
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart
                    data={chartData}
                    margin={{ left: -10, right: 8, top: 8 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorBal"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(199 89% 48%)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(199 89% 48%)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} />

                    <XAxis
                      dataKey="month"
                      tickFormatter={(v) => `M${v}`}
                    />

                    <YAxis
                      tickFormatter={(v) =>
                        v >= 1000 ? `${Math.round(v / 1000)}k` : v
                      }
                    />

                    <RechartsTooltip
                      formatter={(value: number) => [
                        formatCurrency(value),
                        'Balance',
                      ]}
                    />

                    <Area
                      type="monotone"
                      dataKey="balance"
                      stroke="hsl(199 89% 48%)"
                      strokeWidth={2}
                      fill="url(#colorBal)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Amortization Schedule */}
      <Card className="mt-8 rounded-3xl border-white/40 bg-white/70 shadow-xl backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl">Amortization Schedule</CardTitle>
          <CardDescription>
            Month-by-month breakdown of your loan repayment.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3">Month</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Principal</th>
                  <th className="pb-3">Interest</th>
                  <th className="pb-3">Balance</th>
                </tr>
              </thead>

              <tbody>
                {result.schedule.map((entry) => (
                  <tr
                    key={entry.month}
                    className="border-b last:border-none hover:bg-slate-50"
                  >
                    <td className="py-3">{entry.month}</td>
                    <td className="py-3">
                      {formatCurrencyPrecise(result.monthlyPayment)}
                    </td>
                    <td className="py-3 text-green-600">
                      {formatCurrencyPrecise(entry.principal)}
                    </td>
                    <td className="py-3 text-orange-600">
                      {formatCurrencyPrecise(entry.interest)}
                    </td>
                    <td className="py-3">
                      {formatCurrencyPrecise(entry.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
