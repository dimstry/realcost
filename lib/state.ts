import { DEFAULT_INFLATION, DEFAULT_INSTRUMENT, INFLATION_PRESETS, INSTRUMENTS } from "../config/rates";
import { formatRupiahShort as rp, monthlyFromFrequency, parseRupiah, projectOnce, projectRecurring, type Freq, type Projection } from "./calc";

export type Mode = "once" | "recur";

export type CalcState = {
  nama: string;
  harga: string;
  mode: Mode;
  frek: Freq;
  /** id instrumen, atau "custom" kalau return/pajak diubah manual */
  inst: string;
  ret: number;
  pajak: number;
  th: number;
  inf: number;
  gaji: string;
};

export const MAX_YEARS = 30;
export const FREQ_SUFFIX: Record<Freq, string> = { day: "/hari", week: "/minggu", month: "/bulan" };

export type Example = { n: string; h: string; m: Mode; f?: Freq };

export const EXAMPLES: Example[] = [
  { n: "Biaya nikah", h: "500jt", m: "once" },
  { n: "HP flagship", h: "20jt", m: "once" },
  { n: "Mobil baru", h: "350jt", m: "once" },
  { n: "Liburan", h: "25jt", m: "once" },
  { n: "Kopi kekinian", h: "30rb", m: "recur", f: "day" },
  { n: "Rokok", h: "35rb", m: "recur", f: "day" },
  { n: "Makan di luar", h: "150rb", m: "recur", f: "week" },
  { n: "Langganan streaming", h: "150rb", m: "recur", f: "month" },
];

const depo =INSTRUMENTS.find((i) => i.id === DEFAULT_INSTRUMENT)!;

export const DEFAULT_STATE: CalcState = {
  nama: "Biaya nikah",
  harga: "500jt",
  mode: "once",
  frek: "month",
  inst: depo.id,
  ret: depo.returnPct,
  pajak: depo.taxPct,
  th: 20,
  inf: DEFAULT_INFLATION,
  gaji: "",
};

type Params = { get(key: string): string | null };

/** searchParams dari page props → bentuk yang dibaca parseState. */
export function paramsFromRecord(r: Record<string, string | string[] | undefined>): Params {
  return { get: (k) => [r[k]].flat()[0] ?? null };
}

function num(raw: string | null, min: number, max: number, fallback: number, integer = false): number {
  if (raw === null || raw.trim() === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) return fallback;
  return n;
}

/** Query string → state. Nilai tidak valid jatuh ke default. */
export function parseState(p: Params): CalcState {
  const d = DEFAULT_STATE;
  const mode: Mode = p.get("mode") === "recur" ? "recur" : "once";
  const frekRaw = p.get("frek");
  const frek: Freq = frekRaw === "day" || frekRaw === "week" || frekRaw === "month" ? frekRaw : d.frek;
  const harga = (p.get("harga") ?? "").slice(0, 30);
  const gaji = (p.get("gaji") ?? "").slice(0, 30);
  const instRaw = p.get("inst") ?? "";
  const preset = INSTRUMENTS.find((i) => i.id === instRaw);
  const custom = instRaw === "custom";

  return {
    nama: (p.get("nama") ?? "").trim().slice(0, 40) || d.nama,
    harga: parseRupiah(harga) > 0 ? harga : d.harga,
    mode,
    frek,
    inst: preset ? preset.id : custom ? "custom" : d.inst,
    ret: preset ? preset.returnPct : custom ? num(p.get("ret"), 0, 50, d.ret) : d.ret,
    pajak: preset ? preset.taxPct : custom ? num(p.get("pajak"), 0, 100, d.pajak) : d.pajak,
    th: num(p.get("th"), 1, MAX_YEARS, d.th, true),
    inf: num(p.get("inf"), 0, 30, d.inf),
    gaji: parseRupiah(gaji) > 0 ? gaji : "",
  };
}

export function serializeState(s: CalcState): string {
  const q = new URLSearchParams({ nama: s.nama, harga: s.harga, mode: s.mode });
  if (s.mode === "recur") q.set("frek", s.frek);
  q.set("inst", s.inst);
  if (s.inst === "custom") {
    q.set("ret", String(s.ret));
    q.set("pajak", String(s.pajak));
  }
  q.set("th", String(s.th));
  q.set("inf", String(s.inf));
  if (s.gaji) q.set("gaji", s.gaji);
  return q.toString();
}

export function inflationPresetId(inf: number): string {
  return INFLATION_PRESETS.find((p) => p.pct === inf)?.id ?? "custom";
}

export const instrumentName = (s: CalcState) => INSTRUMENTS.find((i) => i.id === s.inst)?.name;

export function monthlyOf(s: CalcState): number {
  return s.mode === "recur" ? monthlyFromFrequency(parseRupiah(s.harga), s.frek) : 0;
}

export function project(s: CalcState, years = s.th, returnPct = s.ret, taxPct = s.pajak): Projection {
  const common = { years, returnPct, taxPct, inflationPct: s.inf };
  return s.mode === "once"
    ? projectOnce({ amount: parseRupiah(s.harga), ...common })
    : projectRecurring({ monthly: monthlyOf(s), ...common });
}

export function shareText(s: CalcState): string {
  const v = project(s);
  const amt = parseRupiah(s.harga);
  const where = instrumentName(s) ?? "investasi";
  return s.mode === "once"
    ? `${s.nama} ${rp(amt)}, kalau ditaruh di ${where} selama ${s.th} tahun bisa jadi ${rp(v.nominal)} (setara ${rp(v.real)} uang hari ini). Itu harga sebenarnya. Cek punyamu di RealCost.`
    : `${s.nama} ${rp(amt)}${FREQ_SUFFIX[s.frek]} = ${rp(v.paid)} dalam ${s.th} tahun. Kalau disisihkan ke ${where}, bisa jadi ${rp(v.nominal)} (setara ${rp(v.real)} uang hari ini).`;
}
