export function normalizeNif(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidPortugueseNif(value: string): boolean {
  const nif = normalizeNif(value);
  if (!/^\d{9}$/.test(nif)) return false;
  const firstDigit = Number(nif[0]);
  if (![1, 2, 3, 5, 6, 8, 9].includes(firstDigit)) return false;

  const sum = nif
    .slice(0, 8)
    .split("")
    .reduce((acc, digit, index) => acc + Number(digit) * (9 - index), 0);
  const check = 11 - (sum % 11);
  const expected = check >= 10 ? 0 : check;
  return expected === Number(nif[8]);
}

