export type Freq = "day" | "week" | "month";
export type Projection = { paid: number; nominal: number; real: number };

const MULT: Record<string, number> = {
  rb: 1e3, ribu: 1e3, k: 1e3,
  jt: 1e6, juta: 1e6,
  m: 1e9, miliar: 1e9, milyar: 1e9,
  t: 1e12, triliun: 1e12,
};

/** "500jt", "1,5M", "30rb", "1.500.000", "Rp 2 juta" → angka. 0 kalau tidak valid. */
export function parseRupiah(input: string): number {
  if (!input) return 0;
  let s = String(input).toLowerCase().replace(/rp|\s/g, "");
  let mult = 1;
  const m = s.match(/(rb|ribu|k|jt|juta|m|miliar|milyar|t|triliun)$/);
  if (m) {
    mult = MULT[m[1]];
    s = s.slice(0, -m[1].length).replace(/\./g, "").replace(",", ".");
  } else {
    s = s.replace(/[.,](?=\d{3}(\D|$))/g, "").replace(",", ".");
  }
  // Number() menolak sisa karakter ("12abc"), parseFloat tidak.
  const n = s === "" ? NaN : Number(s);
  return Number.isFinite(n) && n > 0 ? n * mult : 0;
}

const nf = (n: number, d: number) => n.toLocaleString("id-ID", { maximumFractionDigits: d });

/** [angka, satuan], contoh [“1,1”, “M”]. Dipakai juga untuk angka besar bergaya. */
export function rupiahParts(n: number): [string, string] {
  const a = Math.abs(n);
  const sg = n < 0 ? "−" : "";
  if (a >= 1e12) return [sg + nf(a / 1e12, 2), "T"];
  if (a >= 1e9) return [sg + nf(a / 1e9, 2), "M"];
  if (a >= 1e6) return [sg + nf(a / 1e6, a >= 1e8 ? 0 : 1), "jt"];
  if (a >= 1e3) return [sg + nf(a / 1e3, 0), "rb"];
  return [sg + nf(a, 0), ""];
}

/** "Rp 1,1 M", "Rp 572 jt", "Rp 30 rb". */
export function formatRupiahShort(n: number): string {
  return ("Rp " + rupiahParts(n).join(" ")).trim();
}

export function formatNumber(n: number, digits = 1): string {
  return nf(n, digits);
}

export function monthlyFromFrequency(amount: number, freq: Freq): number {
  if (freq === "day") return amount * 30;
  if (freq === "week") return (amount * 52) / 12;
  return amount;
}

type Common = { years: number; returnPct: number; taxPct: number; inflationPct: number };

const netRate = (returnPct: number, taxPct: number) => (returnPct / 100) * (1 - taxPct / 100);
const deflator = (inflationPct: number, years: number) => Math.pow(1 + inflationPct / 100, years);

export function projectOnce({ amount, years, returnPct, taxPct, inflationPct }: Common & { amount: number }): Projection {
  const nominal = amount * Math.pow(1 + netRate(returnPct, taxPct), years);
  return { paid: amount, nominal, real: nominal / deflator(inflationPct, years) };
}

export function projectRecurring({ monthly, years, returnPct, taxPct, inflationPct }: Common & { monthly: number }): Projection {
  const n = Math.round(years * 12);
  const rm = Math.pow(1 + netRate(returnPct, taxPct), 1 / 12) - 1;
  const nominal = rm === 0 ? monthly * n : (monthly * (Math.pow(1 + rm, n) - 1)) / rm;
  return { paid: monthly * n, nominal, real: nominal / deflator(inflationPct, years) };
}
