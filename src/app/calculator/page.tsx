"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calculator,
  IndianRupee,
  Percent,
  CalendarDays,
  TrendingUp,
  Wallet,
  RotateCcw,
} from "lucide-react";

export default function CalculatorPage() {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [tenure, setTenure] = useState(24);

  const calculation = useMemo(() => {
    const principal = Number(loanAmount);
    const monthlyRate = Number(interestRate) / 12 / 100;
    const months = Number(tenure);

    if (!principal || !months) {
      return {
        emi: 0,
        totalInterest: 0,
        totalPayment: 0,
      };
    }

    let emi = 0;

    if (monthlyRate === 0) {
      emi = principal / months;
    } else {
      emi =
        (principal *
          monthlyRate *
          Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    return {
      emi,
      totalInterest,
      totalPayment,
    };
  }, [loanAmount, interestRate, tenure]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const resetCalculator = () => {
    setLoanAmount(500000);
    setInterestRate(10.5);
    setTenure(24);
  };

  const interestPercentage =
    calculation.totalPayment > 0
      ? (calculation.totalInterest / calculation.totalPayment) * 100
      : 0;

  return (
    <main className="min-h-screen bg-[#FAF8F3] text-[#10182F]">
      {/* Header */}
      <header className="border-b border-[#10182F]/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#10182F]/10 bg-white transition hover:bg-[#10182F] hover:text-white"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#687086]">
                Financial tools
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-tight">
                EMI Calculator
              </h1>
            </div>
          </div>

          <button
            onClick={resetCalculator}
            className="flex items-center gap-2 rounded-full border border-[#10182F]/10 bg-white px-4 py-2.5 text-sm font-medium transition hover:border-[#D6B77A] hover:bg-[#FAF8F3]"
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        {/* Intro */}
        <div className="mb-10 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D6B77A]/40 bg-[#D6B77A]/10 px-4 py-2 text-sm font-medium text-[#10182F]">
            <Calculator size={16} />
            Plan your monthly payment
          </div>

          <h2 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Know your EMI
            <span className="text-[#A89BCB]"> before you apply.</span>
          </h2>

          <p className="mt-4 max-w-xl text-base leading-7 text-[#687086]">
            Adjust the loan amount, interest rate and tenure to understand
            your estimated monthly payment and overall borrowing cost.
          </p>
        </div>

        {/* Calculator */}
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Inputs */}
          <div className="rounded-[28px] border border-[#10182F]/10 bg-white p-6 shadow-[0_20px_60px_rgba(16,24,47,0.06)] sm:p-8">
            <div className="mb-8">
              <h3 className="text-xl font-semibold">Loan details</h3>
              <p className="mt-1 text-sm text-[#687086]">
                Change the values to see your EMI instantly.
              </p>
            </div>

            {/* Loan Amount */}
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-medium">
                  Loan amount
                </label>

                <div className="relative">
                  <IndianRupee
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#687086]"
                  />

                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) =>
                      setLoanAmount(
                        Math.max(0, Number(e.target.value))
                      )
                    }
                    className="w-36 rounded-xl border border-[#10182F]/10 bg-[#FAF8F3] py-2.5 pl-8 pr-3 text-right text-sm font-semibold outline-none transition focus:border-[#A89BCB] focus:ring-4 focus:ring-[#A89BCB]/10"
                  />
                </div>
              </div>

              <input
                type="range"
                min="50000"
                max="5000000"
                step="10000"
                value={loanAmount}
                onChange={(e) =>
                  setLoanAmount(Number(e.target.value))
                }
                className="w-full accent-[#10182F]"
              />

              <div className="mt-2 flex justify-between text-xs text-[#687086]">
                <span>₹50K</span>
                <span>₹50L</span>
              </div>
            </div>

            {/* Interest */}
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-medium">
                  Interest rate
                </label>

                <div className="relative">
                  <Percent
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#687086]"
                  />

                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) =>
                      setInterestRate(
                        Math.max(0, Number(e.target.value))
                      )
                    }
                    className="w-28 rounded-xl border border-[#10182F]/10 bg-[#FAF8F3] py-2.5 pl-8 pr-3 text-right text-sm font-semibold outline-none transition focus:border-[#A89BCB] focus:ring-4 focus:ring-[#A89BCB]/10"
                  />
                </div>
              </div>

              <input
                type="range"
                min="1"
                max="30"
                step="0.1"
                value={interestRate}
                onChange={(e) =>
                  setInterestRate(Number(e.target.value))
                }
                className="w-full accent-[#10182F]"
              />

              <div className="mt-2 flex justify-between text-xs text-[#687086]">
                <span>1%</span>
                <span>30%</span>
              </div>
            </div>

            {/* Tenure */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-medium">
                  Loan tenure
                </label>

                <div className="relative">
                  <CalendarDays
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#687086]"
                  />

                  <input
                    type="number"
                    min="1"
                    max="84"
                    value={tenure}
                    onChange={(e) =>
                      setTenure(
                        Math.max(1, Number(e.target.value))
                      )
                    }
                    className="w-28 rounded-xl border border-[#10182F]/10 bg-[#FAF8F3] py-2.5 pl-8 pr-3 text-right text-sm font-semibold outline-none transition focus:border-[#A89BCB] focus:ring-4 focus:ring-[#A89BCB]/10"
                  />
                </div>
              </div>

              <input
                type="range"
                min="6"
                max="84"
                step="6"
                value={tenure}
                onChange={(e) =>
                  setTenure(Number(e.target.value))
                }
                className="w-full accent-[#10182F]"
              />

              <div className="mt-2 flex justify-between text-xs text-[#687086]">
                <span>6 months</span>
                <span>84 months</span>
              </div>
            </div>

             <div className="mt-8 border-t border-[#10182F]/10 pt-7">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-[#687086]">
                Quick tenure
              </p>

              <div className="flex flex-wrap gap-2">
                {[12, 24, 36, 48, 60].map((months) => (
                  <button
                    key={months}
                    onClick={() => setTenure(months)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      tenure === months
                        ? "border-[#10182F] bg-[#10182F] text-white"
                        : "border-[#10182F]/10 bg-white hover:border-[#D6B77A] hover:bg-[#FAF8F3]"
                    }`}
                  >
                    {months} mo
                  </button>
                ))}
              </div>
            </div>
          </div>

           <div className="relative overflow-hidden rounded-[28px] bg-[#10182F] p-6 text-white shadow-[0_24px_70px_rgba(16,24,47,0.18)] sm:p-8">
 
             <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#A89BCB]/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#D6B77A]/10 blur-3xl" />

            <div className="relative">
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/60">
                    Estimated monthly EMI
                  </p>

                  <div className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                    {formatCurrency(calculation.emi)}
                  </div>

                  <p className="mt-2 text-sm text-white/50">
                    for {tenure} months
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Wallet size={21} />
                </div>
              </div>


              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-4">
                  <span className="text-sm text-white/60">
                    Principal amount
                  </span>

                  <span className="font-medium">
                    {formatCurrency(loanAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-4">
                  <span className="text-sm text-white/60">
                    Total interest
                  </span>

                  <span className="font-medium text-[#D6B77A]">
                    {formatCurrency(calculation.totalInterest)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-4">
                  <span className="text-sm text-white/60">
                    Total payment
                  </span>

                  <span className="font-medium">
                    {formatCurrency(calculation.totalPayment)}
                  </span>
                </div>
              </div>

               <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-white/60">
                    Payment breakdown
                  </span>

                  <TrendingUp
                    size={17}
                    className="text-[#D6B77A]"
                  />
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#D6B77A] transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, 100 - interestPercentage)
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-3 flex justify-between text-xs">
                  <span className="text-white/50">
                    Principal
                  </span>

                  <span className="text-white/50">
                    Interest
                  </span>
                </div>
              </div>

               <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs leading-5 text-white/40">
                  This calculator provides an estimate for planning
                  purposes only. Actual loan terms, interest rates and
                  eligibility may vary based on your application and
                  lender assessment.
                </p>
              </div>
            </div>
          </div>
        </div>

         <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#10182F]/10 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-[#687086]">
              Loan amount
            </p>
            <p className="mt-2 text-lg font-semibold">
              {formatCurrency(loanAmount)}
            </p>
          </div>

          <div className="rounded-2xl border border-[#10182F]/10 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-[#687086]">
              Interest rate
            </p>
            <p className="mt-2 text-lg font-semibold">
              {interestRate}% p.a.
            </p>
          </div>

          <div className="rounded-2xl border border-[#10182F]/10 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-[#687086]">
              Tenure
            </p>
            <p className="mt-2 text-lg font-semibold">
              {tenure} months
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}