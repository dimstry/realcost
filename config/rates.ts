// Semua angka asumsi RealCost ada di sini. Perbarui `checked` setiap kali angkanya dicek ulang.

export type Instrument = {
  id: string;
  name: string;
  note: string;
  returnPct: number;
  taxPct: number;
};

export const INSTRUMENTS: Instrument[] = [
  // Uang tunai / tabungan tanpa bunga. Asumsi, bukan data pasar. Cek: 2026-10-27
  { id: "kas", name: "Disimpan saja", note: "0%", returnPct: 0, taxPct: 0 },
  // Deposito: kisaran bunga deposito 12 bulan bank umum; pajak bunga deposito 20% (PP 131/2000). Cek: 2026-10-27
  { id: "depo", name: "Deposito", note: "5% · pajak 20%", returnPct: 5, taxPct: 20 },
  // Reksa dana pasar uang: kisaran imbal hasil tahunan RDPU; hasil reksa dana bukan objek pajak bagi investor. Cek: 2026-10-27
  { id: "rdpu", name: "Reksa dana pasar uang", note: "4,5%", returnPct: 4.5, taxPct: 0 },
  // SBN ritel (ORI/SR): kupon seri terbaru Kemenkeu; pajak kupon 10% (PP 91/2021). Cek: 2026-10-27
  { id: "sbn", name: "SBN ritel", note: "6,3% · pajak 10%", returnPct: 6.3, taxPct: 10 },
  // Indeks saham: rata-rata return jangka panjang IHSG, sebelum biaya transaksi dan pajak jual. Cek: 2026-10-27
  { id: "saham", name: "Indeks saham", note: "±10% · sblm biaya", returnPct: 10, taxPct: 0 },
];

export const DEFAULT_INSTRUMENT = "depo";

export type InflationPreset = { id: string; label: string; pct: number | null; hint: string };

export const INFLATION_PRESETS: InflationPreset[] = [
  // Bank Indonesia, sasaran inflasi 2,5% ± 1%. Cek: 2026-10-27
  { id: "2.5", label: "Target BI 2,5%", pct: 2.5, hint: "Titik tengah sasaran Bank Indonesia (2,5% ± 1%)." },
  // BPS, inflasi tahunan (y-on-y) September 2026: 3,28%. Cek: 2026-10-27
  { id: "3.3", label: "Terkini 3,3%", pct: 3.3, hint: "Inflasi tahunan September 2026 menurut BPS: 3,28%." },
  // Skenario, bukan data. Cek: 2026-10-27
  { id: "5", label: "Pesimis 5%", pct: 5, hint: "Skenario kalau harga naik lebih cepat dari biasanya." },
  { id: "custom", label: "Atur sendiri", pct: null, hint: "Pakai inflasi pribadimu, misalnya lebih tinggi kalau banyak biaya pendidikan." },
];

export const DEFAULT_INFLATION = 3.3;

// Jam kerja penuh per bulan (40 jam × 52 minggu / 12).
export const WORK_HOURS_PER_MONTH = 173;
