'use client';

import { useEffect, useState } from 'react';

interface SalaryCalculationResult {
  netSalary: string;
  grossSalary: string;
  totalDeductions: string;
  formula: string;
}

export function useSalaryCalculation(grossSalary: string, totalDeductions: string) {
  const [calculation, setCalculation] = useState<SalaryCalculationResult>({
    netSalary: '0',
    grossSalary: '0',
    totalDeductions: '0',
    formula: ''
  });

  useEffect(() => {
    const gross = parseFloat(grossSalary) || 0;
    const deductions = parseFloat(totalDeductions) || 0;
    const net = Math.max(0, gross - deductions);
    
    const formula = gross > 0 || deductions > 0 
      ? `${gross.toFixed(2)} - ${deductions.toFixed(2)} = ${net.toFixed(2)}`
      : '';

    setCalculation({
      netSalary: net.toFixed(2),
      grossSalary: gross.toFixed(2),
      totalDeductions: deductions.toFixed(2),
      formula
    });
  }, [grossSalary, totalDeductions]);

  return calculation;
}

export function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(num);
}
