"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { INFLATION_PRESETS, INSTRUMENTS, WORK_HOURS_PER_MONTH } from "@/config/rates";
import { formatNumber as nf, formatRupiahShort as rp, parseRupiah, rupiahParts } from "@/lib/calc";
import {
  EXAMPLES,
  FREQ_SUFFIX,
  MAX_YEARS,
  inflationPresetId,
  instrumentName,
  monthlyOf,
  project,
  serializeState,
  shareText,
  type CalcState,
  type Example,
} from "@/lib/state";
import { Brand } from "@/components/Brand";
import { Button, Card, Pill, Stat } from "@/components/ui";
import { Chart } from "./Chart";

const lbl = "text-[12.5px] font-bold tracking-[.06em] uppercase";
const input =
  "w-full min-w-0 rounded-md border-brut bg-white px-[13px] py-[11px] text-base font-medium transition focus:lift focus:outline-none";
const hint = "text-[12.5px] text-muted";
const CHIP_BG = ["bg-yellow", "bg-blue", "bg-pink", "bg-orange"];
const TABLE_YEARS = [1, 3, 5, 10, 15, 20, 25, 30];

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useAnimatedNumber(target: number) {
  const [val, setVal] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = from.current;
    const t0 = performance.now();
    const dur = prefersReducedMotion() ? 0 : 600;
    let raf = 0;
    const step = (now: number) => {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1;
      const v = start + (target - start) * (1 - Math.pow(1 - k, 3));
      from.current = v;
      setVal(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return val;
}

export function Calculator({ initial }: { initial: CalcState }) {
  const [s, setS] = useState(initial);
  const [infPreset, setInfPreset] = useState(() => inflationPresetId(s.inf));
  // teks mentah untuk input angka, supaya "4," atau kolom kosong bisa diketik
  const [draft, setDraft] = useState({ ret: String(s.ret), pajak: String(s.pajak), inf: String(s.inf) });
  // nama dari link yang bukan contoh dianggap sudah diketik, jadi tidak ditimpa saat ganti mode
  const [namaTouched, setNamaTouched] = useState(() => !EXAMPLES.some((x) => x.n === initial.nama));
  const [toast, setToast] = useState("");
  const [heroVisible, setHeroVisible] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const inflRef = useRef<HTMLDivElement>(null);
  const inflInputRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<CalcState>) => setS((prev) => ({ ...prev, ...patch }));

  // URL ikut state, tanpa menambah history. history.replaceState dipakai (bukan router.replace)
  // supaya tiap ketikan tidak memicu render ulang halaman di server.
  useEffect(() => {
    const id = setTimeout(() => {
      const q = serializeState(s);
      if (q !== window.location.search.slice(1)) window.history.replaceState(null, "", `/hitung?${q}`);
    }, 400);
    return () => clearTimeout(id);
  }, [s]);

  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([en]) => setHeroVisible(en.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2000);
    return () => clearTimeout(id);
  }, [toast]);

  const once = s.mode === "once";
  const amt = parseRupiah(s.harga);
  const monthly = monthlyOf(s);
  const v = project(s);
  const instr = instrumentName(s) ?? "pilihanmu";
  const gain = v.real - v.paid;
  const net = s.ret * (1 - s.pajak / 100);
  const gaji = parseRupiah(s.gaji);
  const big = useAnimatedNumber(amt ? v.nominal : 0);
  const [bigNum, bigUnit] = rupiahParts(big);
  const pts = Array.from({ length: MAX_YEARS + 1 }, (_, t) => project(s, t));
  const rows = INSTRUMENTS.map((i) => ({ i, v: project(s, s.th, i.returnPct, i.taxPct) }));
  const rowMax = Math.max(...rows.map((r) => r.v.real)) || 1;
  const tableYears = TABLE_YEARS.includes(s.th) ? TABLE_YEARS : [...TABLE_YEARS, s.th].sort((a, b) => a - b);
  const infHint = INFLATION_PRESETS.find((p) => p.id === infPreset)!.hint;

  function applyExample(x: Example) {
    set({ nama: x.n, harga: x.h, mode: x.m, ...(x.f && { frek: x.f }) });
    setNamaTouched(false);
  }

  function setMode(m: CalcState["mode"]) {
    if (!namaTouched) applyExample(EXAMPLES.find((x) => x.m === m)!);
    else set({ mode: m });
  }

  function pickInstrument(id: string) {
    const i = INSTRUMENTS.find((x) => x.id === id)!;
    set({ inst: i.id, ret: i.returnPct, pajak: i.taxPct });
    setDraft((d) => ({ ...d, ret: String(i.returnPct), pajak: String(i.taxPct) }));
  }

  function pickInflation(id: string) {
    setInfPreset(id);
    const p = INFLATION_PRESETS.find((x) => x.id === id)!;
    if (p.pct !== null) {
      set({ inf: p.pct });
      setDraft((d) => ({ ...d, inf: String(p.pct) }));
    } else {
      requestAnimationFrame(() => inflInputRef.current?.focus());
    }
  }

  function setNumber(key: "ret" | "pajak" | "inf", raw: string, max: number) {
    setDraft((d) => ({ ...d, [key]: raw }));
    const n = Math.min(max, Math.max(0, Number(raw.replace(",", ".")) || 0));
    set(key === "inf" ? { inf: n } : { [key]: n, inst: "custom" });
  }

  function focusInflation() {
    const reduce = prefersReducedMotion();
    inflRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    const b = inflRef.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    setTimeout(() => b?.focus({ preventScroll: true }), reduce ? 0 : 350);
  }

  async function copy() {
    const txt = `${shareText(s)}\n${window.location.origin}/hitung?${serializeState(s)}`;
    try {
      await navigator.clipboard.writeText(txt);
      setToast("Tersalin ke clipboard");
    } catch {
      const a = document.createElement("textarea");
      a.value = txt;
      document.body.appendChild(a);
      a.select();
      setToast(document.execCommand("copy") ? "Tersalin ke clipboard" : "Gagal menyalin. Pilih teksnya manual.");
      a.remove();
    }
  }

  const work = (() => {
    if (!gaji) return null;
    const hourly = gaji / WORK_HOURS_PER_MONTH;
    if (once) {
      const h = amt / hourly;
      return {
        big: h >= 2 * WORK_HOURS_PER_MONTH ? `${nf(h / WORK_HOURS_PER_MONTH, 1)} bulan` : `${nf(h, 0)} jam`,
        unit: "kerja penuh",
        note: `Dengan ${rp(hourly)} per jam, ${WORK_HOURS_PER_MONTH} jam per bulan.`,
      };
    }
    const h = monthly / hourly;
    return {
      big: `${nf(h, 1)} jam`,
      unit: "tiap bulan",
      note: `Atau ${nf((h * 12 * s.th) / WORK_HOURS_PER_MONTH, 1)} bulan kerja penuh dalam ${s.th} tahun.`,
    };
  })();

  return (
    <div className="mx-auto max-w-[1140px] px-4 pt-[18px] pb-[72px]">
      <header className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-[26px]">
        <Brand />
        <span className="rotate-[1.5deg] rounded-full border-brut bg-pink px-3 py-1 text-[13px] font-semibold shadow-hard-sm">
          Kalkulator opportunity cost
        </span>
      </header>

      <div className="grid items-start gap-6 min-[941px]:grid-cols-[380px_minmax(0,1fr)]">
        <form className="flex flex-col gap-5 rounded-xl border-brut bg-white p-[22px] shadow-hard min-[941px]:sticky min-[941px]:top-[18px]" noValidate onSubmit={(e) => e.preventDefault()}>
          <div>
            <h1 className="m-0 text-[26px] leading-[1.12] font-extrabold tracking-[-.03em] text-balance after:mt-2.5 after:block after:h-2 after:w-16 after:rounded-[4px] after:border-2 after:border-ink after:bg-pink after:content-['']">
              Sebelum beli, cek harga sebenarnya.
            </h1>
            <p className="mt-2.5 text-sm text-muted">Lihat nilai uangmu kalau diinvestasikan, bukan dibelanjakan.</p>
          </div>

          <div className="flex gap-1 rounded-md border-brut bg-white p-1" role="group" aria-label="Jenis pengeluaran">
            {(["once", "recur"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={s.mode === m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-sm border-2 px-3 py-[9px] text-sm font-bold ${s.mode === m ? "border-ink bg-yellow text-ink" : "border-transparent text-muted"}`}
              >
                {m === "once" ? "Sekali bayar" : "Rutin"}
              </button>
            ))}
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <label className={lbl} htmlFor="nama">Untuk apa</label>
            <input
              id="nama"
              className={input}
              value={s.nama}
              maxLength={40}
              autoComplete="off"
              onChange={(e) => {
                setNamaTouched(true);
                set({ nama: e.target.value });
              }}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <label className={lbl} htmlFor="harga">{once ? "Harga" : "Sekali keluar"}</label>
            <div className="rounded-lg border-brut bg-mint px-3.5 pt-3 pb-2.5 transition focus-within:lift">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold">Rp</span>
                <input
                  id="harga"
                  className="w-full min-w-0 bg-transparent p-0 text-[34px] font-extrabold tracking-[-.03em] outline-none"
                  value={s.harga}
                  maxLength={30}
                  autoComplete="off"
                  inputMode="text"
                  aria-describedby="eq"
                  aria-invalid={!amt}
                  onChange={(e) => set({ harga: e.target.value })}
                />
              </div>
              <div id="eq" className={`mt-1 min-h-[1.4em] font-mono text-[12.5px] ${amt ? "" : "font-medium text-red-text"}`}>
                {amt
                  ? `Rp ${Math.round(amt).toLocaleString("id-ID")}${once ? "" : FREQ_SUFFIX[s.frek]}`
                  : s.harga
                    ? "Tulis angka, misalnya 500jt, 1,5M, atau 30rb"
                    : "Tulis angka, misalnya 500jt"}
              </div>
            </div>
          </div>

          {!once && (
            <div className="flex flex-col gap-2">
              <span className={lbl} id="frekLbl">Seberapa sering</span>
              <div className="flex flex-wrap gap-2" role="group" aria-labelledby="frekLbl">
                {(["day", "week", "month"] as const).map((f) => (
                  <Pill key={f} pressed={s.frek === f} onClick={() => set({ frek: f })}>
                    {{ day: "Per hari", week: "Per minggu", month: "Per bulan" }[f]}
                  </Pill>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className={lbl} id="contohLbl">Contoh</span>
            <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby="contohLbl">
              {EXAMPLES.map((x, i) => (
                <Pill
                  key={x.n}
                  bg={CHIP_BG[i % 4]}
                  className="px-2.5! py-1! text-[12.5px]!"
                  pressed={x.n === s.nama && x.h === s.harga && x.m === s.mode}
                  onClick={() => applyExample(x)}
                >
                  {x.n}
                </Pill>
              ))}
            </div>
          </div>

          <hr className="border-t-[2.5px] border-ink" />

          <div className="flex flex-col gap-2">
            <span className={lbl} id="instLbl">Bandingkan dengan</span>
            <div className="flex flex-col gap-2" role="group" aria-labelledby="instLbl">
              {INSTRUMENTS.map((i) => {
                const on = s.inst === i.id;
                return (
                  <button
                    key={i.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => pickInstrument(i.id)}
                    className={`flex w-full items-center gap-2.5 rounded-md border-2 border-ink px-3 py-2.5 text-left transition hover:lift ${on ? "lift bg-blue" : "bg-white"}`}
                  >
                    <span className="flex-1 text-sm font-bold">{i.name}</span>
                    <span className="font-mono text-xs">{i.note}</span>
                    <span className={`grid size-5 flex-none place-items-center rounded-[6px] border-2 border-ink ${on ? "bg-ink" : "bg-white"}`} aria-hidden="true">
                      {on && <span className="h-[5px] w-[9px] translate-x-px -translate-y-px -rotate-45 border-b-[2.5px] border-l-[2.5px] border-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-t-[2.5px] border-ink" />

          <div className="flex flex-col gap-2" ref={inflRef}>
            <span className={lbl} id="inflLbl">Inflasi per tahun</span>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="inflLbl">
              {INFLATION_PRESETS.map((p) => (
                <Pill key={p.id} pressed={infPreset === p.id} onClick={() => pickInflation(p.id)}>
                  {p.label}
                </Pill>
              ))}
            </div>
            {infPreset === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  ref={inflInputRef}
                  type="number"
                  step="0.1"
                  min="0"
                  max="30"
                  value={draft.inf}
                  onChange={(e) => setNumber("inf", e.target.value, 30)}
                  aria-label="Inflasi per tahun dalam persen"
                  className={`${input} max-w-[120px] font-mono`}
                />
                <span className={hint}>% per tahun</span>
              </div>
            )}
            <span className={hint}>{infHint} Yang dipakai adalah rata-rata selama jangka waktu yang kamu pilih.</span>
          </div>

          <hr className="border-t-[2.5px] border-ink" />

          <details className="group rounded-md border-2 border-dashed border-ink px-3.5 py-3">
            <summary className="flex items-center justify-between text-sm font-bold after:font-mono after:text-lg after:font-medium after:content-['+'] group-open:after:content-['−']">
              Return, pajak, dan gaji
            </summary>
            <div className="mt-3.5 flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex min-w-0 flex-col gap-2">
                  <label className={lbl} htmlFor="ret">Return %</label>
                  <input id="ret" type="number" step="0.1" min="0" max="50" value={draft.ret} onChange={(e) => setNumber("ret", e.target.value, 50)} className={`${input} px-2.5! py-[9px]! font-mono`} />
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <label className={lbl} htmlFor="tax">Pajak %</label>
                  <input id="tax" type="number" step="1" min="0" max="100" value={draft.pajak} onChange={(e) => setNumber("pajak", e.target.value, 100)} className={`${input} px-2.5! py-[9px]! font-mono`} />
                </div>
              </div>
              <span className={hint}>Pajak yang dihitung adalah pajak atas hasil investasi. Biaya transaksi dan biaya admin belum termasuk.</span>
              <div className="flex min-w-0 flex-col gap-2">
                <label className={lbl} htmlFor="gaji">Gaji bulanan</label>
                <input id="gaji" className={input} placeholder="8jt" autoComplete="off" maxLength={30} value={s.gaji} onChange={(e) => set({ gaji: e.target.value })} aria-describedby="gajiHint" />
                <span className={hint} id="gajiHint">Dipakai untuk menghitung jam kerja.</span>
              </div>
            </div>
          </details>
        </form>

        <section className="flex min-w-0 flex-col gap-6" aria-label="Hasil">
          <p className="sr-only" aria-live="polite">
            {amt ? `${s.nama}: ${rp(v.nominal)} nominal, setara ${rp(v.real)} uang hari ini, setelah ${s.th} tahun di ${instr}.` : ""}
          </p>

          <Card ref={heroRef} className="relative bg-yellow! px-[26px] pt-[26px] pb-[22px]">
            <span aria-hidden="true" className="absolute -top-[18px] right-[22px] grid size-[58px] place-items-center rounded-full border-brut bg-pink shadow-hard-sm">
              <span className="rotate-12 text-lg font-extrabold">Rp</span>
            </span>
            <div className="flex flex-wrap items-center gap-2.5 pr-[70px]">
              <span className="min-w-0 rounded-sm border-2 border-ink bg-white px-2.5 py-[3px] text-[13.5px] font-semibold">
                {amt ? `${s.nama} · ${instr} · ${s.th} tahun` : "Masukkan harga untuk melihat hasilnya"}
              </span>
              {amt > 0 && (
                <span className="inline-flex items-center gap-1 rounded-sm border-2 border-ink bg-mint px-2.5 py-[3px] font-mono text-[13px] font-medium">
                  <svg viewBox="0 0 24 24" className="size-[13px]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                  {nf(v.nominal / v.paid, 1)}×
                </span>
              )}
            </div>
            <div className="mt-5 mb-2.5 text-[clamp(56px,10vw,104px)] leading-[.95] font-extrabold tracking-[-.05em]">
              Rp {bigNum}
              {bigUnit && (
                <small className="ml-[.12em] inline-block rounded-[10px] border-brut bg-white px-[.2em] align-[.35em] text-[.42em] leading-[1.25] tracking-[-.02em]">
                  {bigUnit}
                </small>
              )}
            </div>
            {amt > 0 && (
              <p className="m-0 text-[15px] [&_b]:bg-[linear-gradient(transparent_55%,var(--color-pink)_55%)] [&_b]:font-extrabold">
                {once ? (
                  <>dari <b>{rp(amt)}</b> yang kamu keluarkan hari ini</>
                ) : (
                  <>dari <b>{rp(amt)}{FREQ_SUFFIX[s.frek]}</b>, total <b>{rp(v.paid)}</b> selama {s.th} tahun</>
                )}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3.5">
              <span className="min-w-[6ch] text-[15px] font-extrabold">{s.th} tahun</span>
              <input
                type="range"
                className="brut min-w-[150px] flex-1"
                min={1}
                max={MAX_YEARS}
                value={s.th}
                aria-label="Jangka waktu dalam tahun"
                style={{ "--p": `${(((s.th - 1) / (MAX_YEARS - 1)) * 100).toFixed(2)}%` } as CSSProperties}
                onChange={(e) => set({ th: +e.target.value })}
              />
              <div className="flex gap-1.5" role="group" aria-label="Pilihan cepat jangka waktu">
                {[5, 10, 20, 30].map((t) => (
                  <Pill key={t} pressed={s.th === t} onClick={() => set({ th: t })}>
                    {t} th
                  </Pill>
                ))}
              </div>
            </div>
            <div className="mt-[22px] grid gap-3 min-[561px]:grid-cols-3">
              <Stat label={once ? "Kamu bayar" : "Total dibayar"} value={rp(v.paid)} detail={once ? "sekali, hari ini" : `${rp(monthly)}/bulan`} />
              <Stat
                className="bg-blue!"
                label="Daya beli hari ini"
                value={rp(v.real)}
                detail={
                  <>
                    inflasi {nf(s.inf, 1)}%/th
                    <button type="button" onClick={focusInflation} className="ml-1 p-0 text-xs font-bold underline underline-offset-[3px]">
                      ubah
                    </button>
                  </>
                }
              />
              <Stat className="bg-pink!" label="Pertumbuhan dilepas" value={gain > 0 ? rp(gain) : "Rp 0"} detail="riil, setelah inflasi" />
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="m-0 text-[19px] font-extrabold tracking-[-.02em]">Pertumbuhan</h2>
                <p className="mt-1 mb-4 text-[13.5px] text-muted">
                  {once ? `${rp(amt)} diinvestasikan sekali di ${instr}` : `${rp(monthly)} per bulan ke ${instr}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-[12.5px] font-semibold">
                {[["bg-grow", "Nominal"], ["bg-accent", "Riil"], ["bg-line", "Dibayar"]].map(([c, t]) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <i className={`inline-block size-3 rounded-[3px] border-2 border-ink ${c}`} />
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <Chart pts={pts} year={s.th} onPick={(t) => set({ th: t })} />
          </Card>

          <div className="grid items-start gap-6 min-[1081px]:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <Card>
              <h2 className="m-0 text-[19px] font-extrabold tracking-[-.02em]">Kalau ditaruh di tempat lain</h2>
              <p className="mt-1 mb-4 text-[13.5px] text-muted">Daya beli setelah {s.th} tahun, dalam nilai uang hari ini</p>
              <div className="flex flex-col gap-2.5">
                {rows.map(({ i, v: r }) => {
                  const on = i.id === s.inst;
                  const lose = r.real < r.paid;
                  return (
                    <button
                      key={i.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => pickInstrument(i.id)}
                      className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-md border-2 border-ink px-3 py-2.5 text-left transition hover:lift ${on ? "lift bg-blue" : "bg-white"}`}
                    >
                      <span className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-bold">
                        {i.name}
                        {on && <span className="rounded-[6px] bg-ink px-[7px] py-px text-[11px] font-bold text-white">Dipilih</span>}
                      </span>
                      {/* di latar biru, merah tidak cukup kontras: pakai hitam */}
                      <span className={`text-right font-mono text-[14.5px] font-medium ${lose && !on ? "text-red-text" : ""}`}>{rp(r.real)}</span>
                      <span className="col-span-full h-3.5 overflow-hidden rounded-[6px] border-2 border-ink bg-white">
                        <span
                          className={`block h-full border-r-2 border-ink transition-[width] duration-[450ms] ease-[cubic-bezier(.2,.8,.2,1)] ${lose ? "bg-red" : "bg-mint"}`}
                          style={{ width: `${Math.max(2, (r.real / rowMax) * 100).toFixed(2)}%` }}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

            <div className="flex min-w-0 flex-col gap-6">
              <Card>
                <h2 className="m-0 text-[19px] font-extrabold tracking-[-.02em]">Ringkasan</h2>
                <p className="mt-1 mb-4 text-[13.5px] text-muted">{s.nama}</p>
                {[
                  [once ? "Harga" : "Biaya", once ? rp(amt) : rp(amt) + FREQ_SUFFIX[s.frek]],
                  ["Alternatif", instr],
                  ["Return bersih", `${nf(net, 2)}% per tahun`],
                  ["Jangka waktu", `${s.th} tahun`],
                  ["Nilai nominal", rp(v.nominal)],
                ].map(([a, b]) => (
                  <div key={a} className="flex justify-between gap-3 border-b-2 border-dashed border-line py-2 text-sm">
                    <span className="text-muted">{a}</span>
                    <span className="text-right font-bold">{b}</span>
                  </div>
                ))}
                <div className="mt-3.5 rounded-md border-2 border-ink bg-pink p-3.5">
                  <div className="text-[11.5px] font-bold tracking-[.06em] uppercase">Harga sebenarnya</div>
                  <div className="mt-0.5 text-[30px] font-extrabold tracking-[-.03em]">{rp(v.real)}</div>
                  <div className="mt-1 text-[13px]">
                    {gain > 0
                      ? `Dalam daya beli hari ini. ${rp(gain)} di antaranya pertumbuhan yang kamu lepas.`
                      : "Return bersih kalah dari inflasi, jadi daya belinya tetap turun."}
                  </div>
                </div>
                <Button className="mt-4 w-full" onClick={copy} disabled={!amt}>
                  <svg viewBox="0 0 24 24" className="size-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="9" width="11" height="11" rx="2.5" />
                    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                  </svg>
                  Salin untuk dibagikan
                </Button>
              </Card>

              <Card className="bg-orange!">
                <h2 className="m-0 text-[19px] font-extrabold tracking-[-.02em]">Dalam jam kerja</h2>
                <p className="mt-1 mb-4 text-[13.5px] text-soft">Berapa lama kamu kerja untuk membayarnya.</p>
                {work ? (
                  <>
                    <div className="flex flex-wrap items-baseline gap-2.5">
                      <b className="text-[40px] leading-none font-extrabold tracking-[-.03em]">{work.big}</b>
                      <span className="text-[12.5px] text-soft">{work.unit}</span>
                    </div>
                    <p className="mt-1.5 mb-0 text-[12.5px] text-soft">{work.note}</p>
                  </>
                ) : (
                  <p className="m-0 text-sm">Isi gaji bulanan di bagian &ldquo;Return, pajak, dan gaji&rdquo; untuk melihat hitungannya.</p>
                )}
              </Card>
            </div>
          </div>

          <details className="group rounded-xl border-brut bg-white p-[22px] shadow-hard">
            <summary className="flex items-center justify-between">
              <h2 className="m-0 text-[19px] font-extrabold tracking-[-.02em]">Rincian per tahun</h2>
              <span className="rounded-sm border-2 border-ink bg-yellow px-2.5 py-[3px] text-[13px] font-bold">
                <span className="group-open:hidden">Tampilkan</span>
                <span className="hidden group-open:inline">Sembunyikan</span>
              </span>
            </summary>
            <div className="mt-3.5 overflow-x-auto rounded-md border-2 border-ink">
              <table className="w-full border-collapse font-mono text-[13.5px] [&_td]:border-b-2 [&_td]:border-ink [&_td]:px-3 [&_td]:py-2.5 [&_td]:text-right [&_td]:whitespace-nowrap [&_td:first-child]:text-left [&_tr:last-child_td]:border-b-0">
                <thead>
                  <tr className="[&_th]:border-b-2 [&_th]:border-ink [&_th]:bg-yellow [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-right [&_th]:font-sans [&_th]:text-xs [&_th]:font-bold [&_th]:tracking-[.05em] [&_th]:uppercase [&_th:first-child]:text-left">
                    <th>Tahun</th>
                    <th>Dibayar</th>
                    <th>Nominal</th>
                    <th>Riil</th>
                  </tr>
                </thead>
                <tbody>
                  {tableYears.map((t) => {
                    const r = pts[t];
                    return (
                      <tr key={t} className={t === s.th ? "bg-mint font-medium" : ""}>
                        <td>{t}</td>
                        <td>{rp(r.paid)}</td>
                        <td>{rp(r.nominal)}</td>
                        <td>{rp(r.real)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </details>

          <p className="m-0 max-w-[80ch] px-1 text-[12.5px] text-muted">
            Simulasi dengan return tetap tiap tahun dan bunga majemuk (hasil investasi diinvestasikan lagi). Return sebenarnya naik turun, dan
            instrumen seperti saham bisa turun nilainya. Gunakan untuk menimbang keputusan, bukan sebagai saran keuangan.
          </p>
        </section>
      </div>

      <div
        aria-hidden="true"
        className={`fixed right-3 bottom-[calc(12px+env(safe-area-inset-bottom,0px))] left-3 z-30 hidden items-center justify-between gap-3 rounded-lg border-brut bg-yellow px-4 py-2.5 shadow-hard transition-transform duration-250 max-[940px]:flex ${!heroVisible && amt ? "" : "translate-y-[160%]"}`}
      >
        <span className="min-w-0 truncate text-[12.5px] font-semibold">{s.nama} · {s.th} th</span>
        <span className="text-lg font-extrabold whitespace-nowrap">{rp(v.nominal)}</span>
      </div>

      <div
        role="status"
        className={`pointer-events-none fixed top-[calc(18px+env(safe-area-inset-top,0px))] left-1/2 z-40 -translate-x-1/2 rounded-md border-brut bg-mint px-4 py-[9px] text-sm font-bold whitespace-nowrap shadow-hard-sm transition ${toast ? "opacity-100" : "-translate-y-3 opacity-0"}`}
      >
        {toast}
      </div>
    </div>
  );
}
