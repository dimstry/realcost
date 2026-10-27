import { describe, expect, it } from "vitest";
import { formatRupiahShort, monthlyFromFrequency, parseRupiah, projectOnce, projectRecurring } from "./calc";

describe("parseRupiah", () => {
  it.each([
    ["500jt", 500e6],
    ["1,5M", 1.5e9],
    ["30rb", 30e3],
    ["1.500.000", 1.5e6],
    ["Rp 2 juta", 2e6],
    ["rp1.500.000", 1.5e6],
    ["2,5 miliar", 2.5e9],
    ["150k", 150e3],
    ["1.500.000,50", 1500000.5],
    ["750000", 750000],
  ])("%s → %d", (input, expected) => {
    expect(parseRupiah(input)).toBeCloseTo(expected);
  });

  it.each(["", "abc", "-5jt", "0", "jt", "Rp", "12abc"])("tidak valid: %j → 0", (input) => {
    expect(parseRupiah(input)).toBe(0);
  });
});

describe("formatRupiahShort", () => {
  it("memakai format id-ID", () => {
    expect(formatRupiahShort(1.096e9)).toBe("Rp 1,1 M");
    expect(formatRupiahShort(572e6)).toBe("Rp 572 jt");
    expect(formatRupiahShort(30e3)).toBe("Rp 30 rb");
    expect(formatRupiahShort(25.4e6)).toBe("Rp 25,4 jt");
    expect(formatRupiahShort(500)).toBe("Rp 500");
  });
});

describe("monthlyFromFrequency", () => {
  it("hari ×30, minggu ×52/12", () => {
    expect(monthlyFromFrequency(30e3, "day")).toBe(900e3);
    expect(monthlyFromFrequency(120e3, "week")).toBeCloseTo(520e3);
    expect(monthlyFromFrequency(150e3, "month")).toBe(150e3);
  });
});

describe("proyeksi", () => {
  it("kasus acuan: 500jt, deposito, 20 tahun", () => {
    const v = projectOnce({ amount: 500e6, years: 20, returnPct: 5, taxPct: 20, inflationPct: 3.3 });
    expect(v.paid).toBe(500e6);
    expect(v.nominal / 1e9).toBeCloseTo(1.096, 2);
    expect(v.real / 1e6).toBeCloseTo(572, -1);
    expect(formatRupiahShort(v.real)).toBe("Rp 572 jt");
  });

  it("kasus rutin: 30rb/hari, deposito, 20 tahun", () => {
    const v = projectRecurring({ monthly: monthlyFromFrequency(30e3, "day"), years: 20, returnPct: 5, taxPct: 20, inflationPct: 3.3 });
    expect(v.paid).toBe(216e6);
    expect(v.nominal / 1e6).toBeCloseTo(327, -1);
  });

  it("return 0 dan inflasi 0 tidak menghasilkan NaN", () => {
    const once = projectOnce({ amount: 1e6, years: 10, returnPct: 0, taxPct: 0, inflationPct: 0 });
    expect(once).toEqual({ paid: 1e6, nominal: 1e6, real: 1e6 });
    const rec = projectRecurring({ monthly: 1e5, years: 10, returnPct: 0, taxPct: 0, inflationPct: 0 });
    expect(rec).toEqual({ paid: 12e6, nominal: 12e6, real: 12e6 });
    const zero = projectRecurring({ monthly: 0, years: 0, returnPct: 5, taxPct: 20, inflationPct: 3.3 });
    expect(Number.isNaN(zero.nominal)).toBe(false);
  });
});
