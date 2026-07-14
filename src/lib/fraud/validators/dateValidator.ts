export function isValidDateString(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

export function isFutureDate(value: string, now = new Date()): boolean {
  const date = new Date(value);
  return isValidDateString(value) && date.getTime() > now.getTime();
}

export function isExpired(value: string, now = new Date()): boolean {
  const date = new Date(value);
  return isValidDateString(value) && date.getTime() < now.getTime();
}

export function isPlausibleDateOfBirth(value: string, now = new Date()): boolean {
  if (!isValidDateString(value)) return false;
  const dob = new Date(value);
  const age = now.getUTCFullYear() - dob.getUTCFullYear();
  return age >= 18 && age <= 100 && dob.getTime() < now.getTime();
}

