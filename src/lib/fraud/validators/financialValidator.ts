export function salaryArithmeticIsPlausible(grossSalary?: number, netSalary?: number): boolean {
  if (grossSalary === undefined || netSalary === undefined) return true;
  if (grossSalary <= 0 || netSalary <= 0) return false;
  return netSalary <= grossSalary && netSalary >= grossSalary * 0.35;
}

