"use client";

import Link from "next/link";
import { useState } from "react";
import { formatNumber as nf, formatRupiahShort as rp, parseRupiah } from "@/lib/calc";
import { DEFAULT_STATE, FREQ_SUFFIX, instrumentName, project, serializeState, type CalcState } from "@/lib/state";
import { Pill, Stat } from "@/components/ui";

const DEMOS: { label: string; bg: string; s: Partial<CalcState> }[] = [
  { label: "Biaya nikah", bg: "bg-yellow", s: { nama: "Biaya nikah", harga: "500jt", mode: "once" } },
  { label: "HP flagship", bg: "bg-blue", s: { nama: "HP flagship", harga: "20jt", mode: "once" } },
  { label: "Kopi 30rb/hari", bg: "bg-pink", s: { nama: "Kopi kekinian", harga: "30rb", mode: "recur", frek: "day" } },
  { label: "Rokok 35rb/hari", bg: "bg-orange", s: { nama: "Rokok", harga: "35rb", mode: "recur", frek: "day" } },
];

export function HeroDemo() {
  const [i, setI] = useState(0);
  const s: CalcState = { ...DEFAULT_STATE, ...DEMOS[i].s };
  const v = project(s);
  const once = s.mode === "once";

  return (
    <div className="relative rounded-xl border-brut bg-white p-5 shadow-hard sm:p-6">
      <span className="absolute -top-4 -right-3 rotate-6 rounded-full border-brut bg-mint px-3 py-1 text-xs font-bold shadow-hard-xs">Demo</span>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Contoh pengeluaran">
        {DEMOS.map((d, k) => (
          <Pill key={d.label} bg={d.bg} pressed={k === i} onClick={() => setI(k)} className="px-2.5! py-1! text-[12.5px]!">
            {d.label}
          </Pill>
        ))}
      </div>

      <div className="mt-5 rounded-md border-2 border-ink bg-yellow p-4" aria-live="polite">
        <p className="m-0 text-[13.5px] font-semibold">
          {s.nama} · {instrumentName(s)} · {s.th} tahun
        </p>
        <p className="mt-2 mb-1 text-[clamp(40px,6vw,56px)] leading-none font-extrabold tracking-[-.04em]">{rp(v.nominal)}</p>
        <p className="m-0 text-sm">
          {once ? <>dari {rp(parseRupiah(s.harga))} hari ini</> : <>dari {rp(parseRupiah(s.harga))}{FREQ_SUFFIX[s.frek]}</>} ·{" "}
          <span className="font-mono">{nf(v.nominal / v.paid, 1)}×</span>
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat label={once ? "Kamu bayar" : "Total dibayar"} value={rp(v.paid)} />
        <Stat className="bg-blue!" label="Daya beli hari ini" value={rp(v.real)} />
      </div>

      <Link href={`/hitung?${serializeState(s)}`} className="mt-4 inline-block text-sm font-bold underline underline-offset-4">
        Buka hitungan ini di kalkulator →
      </Link>
    </div>
  );
}
