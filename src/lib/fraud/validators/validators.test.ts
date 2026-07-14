import { describe, expect, it } from "vitest";
import { isPlausibleDateOfBirth, isFutureDate } from "./dateValidator";
import { salaryArithmeticIsPlausible } from "./financialValidator";
import { isValidIban } from "./ibanValidator";
import { isValidPortugueseNif } from "./nifValidator";

describe("deterministic validators", () => {
  it("validates Portuguese NIF checksum", () => {
    expect(isValidPortugueseNif("123456789")).toBe(true);
    expect(isValidPortugueseNif("123456788")).toBe(false);
  });

  it("validates IBAN MOD-97", () => {
    expect(isValidIban("GB82 WEST 1234 5698 7654 32")).toBe(true);
    expect(isValidIban("GB82 TEST 1234 5698 7654 32")).toBe(false);
  });

  it("validates dates and salary arithmetic", () => {
    expect(isFutureDate("2999-01-01", new Date("2026-07-14"))).toBe(true);
    expect(isPlausibleDateOfBirth("1988-05-02", new Date("2026-07-14"))).toBe(true);
    expect(salaryArithmeticIsPlausible(3200, 4500)).toBe(false);
  });
});

