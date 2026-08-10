import type { AmortizationEntry, EmiResult } from './types';

export function calculateEmi(
  principal: number,
  annualRatePercent: number,
  termMonths: number
): EmiResult {
  const monthlyRate = annualRatePercent / 100 / 12;
  if (principal <= 0 || termMonths <= 0) {
    return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0, schedule: [] };
  }
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = principal / termMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, termMonths);
    monthlyPayment = (principal * monthlyRate * factor) / (factor - 1);
  }
  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = totalPayment - principal;

  const schedule: AmortizationEntry[] = [];
  let balance = principal;
  for (let month = 1; month <= termMonths; month++) {
    const interest = balance * monthlyRate;
    const principalPart = monthlyPayment - interest;
    balance = Math.max(0, balance - principalPart);
    schedule.push({
      month,
      principal: round2(principalPart),
      interest: round2(interest),
      balance: round2(balance),
    });
  }

  return {
    monthlyPayment: round2(monthlyPayment),
    totalPayment: round2(totalPayment),
    totalInterest: round2(totalInterest),
    schedule,
  };
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatCurrencyPrecise(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
     maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
