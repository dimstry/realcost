"use client";

import { useRef, useState, type MouseEvent } from "react";
import { formatRupiahShort as rp, type Projection } from "@/lib/calc";

const CW = 680, CH = 260, L = 8, R = 8, TP = 16, B = 26;

function nice(r: number) {
  const p = Math.pow(10, Math.floor(Math.log10(r)));
  const f = r / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}

/** pts[t] untuk t = 0..maxT */
export function Chart({ pts, year, onPick }: { pts: Projection[]; year: number; onPick: (t: number) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ t: number; px: number } | null>(null);
  const maxT = pts.length - 1;
  const mx = Math.max(...pts.map((v) => Math.max(v.nominal, v.paid))) || 1;
  const step = nice(mx / 3);
  const top = Math.ceil(mx / step) * step;
  const x = (t: number) => L + ((CW - L - R) * t) / maxT;
  const y = (v: number) => TP + (CH - TP - B) * (1 - v / top);
  const path = (k: keyof Projection) => pts.map((v, t) => (t ? "L" : "M") + x(t).toFixed(1) + " " + y(v[k]).toFixed(1)).join(" ");
  const grid: number[] = [];
  for (let v = step; v <= top + 1e-6; v += step) grid.push(v);

  const tAt = (e: MouseEvent<SVGSVGElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    return Math.round(((((e.clientX - b.left) / b.width) * CW - L) / (CW - L - R)) * maxT);
  };
  const onMove = (e: MouseEvent<SVGSVGElement>) => {
    const t = Math.max(0, Math.min(maxT, tAt(e)));
    const w = svgRef.current!.getBoundingClientRect().width;
    setHover({ t, px: Math.min(Math.max((x(t) / CW) * w, 64), w - 64) });
  };

  const mt = hover?.t ?? year;
  const mv = pts[mt];

  return (
    <div className="relative rounded-md border-2 border-ink bg-paper p-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CW} ${CH}`}
        className="block h-auto w-full touch-pan-y"
        role="img"
        aria-label="Grafik pertumbuhan nilai per tahun"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        onClick={(e) => {
          const t = tAt(e);
          if (t >= 1 && t <= maxT) onPick(t);
        }}
      >
        <defs>
          <linearGradient id="ga" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--color-grow)" stopOpacity=".16" />
            <stop offset="1" stopColor="var(--color-grow)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {grid.map((v) => (
          <g key={v}>
            <line x1={L} x2={CW - R} y1={y(v)} y2={y(v)} stroke="var(--color-line)" />
            <text x={L + 2} y={y(v) - 6} fontSize="11.5" fill="var(--color-muted)">{rp(v)}</text>
          </g>
        ))}
        <line x1={L} x2={CW - R} y1={y(0)} y2={y(0)} stroke="var(--color-line)" />
        {[0, 10, 20, 30].map((t, i) => (
          <text key={t} x={x(t)} y={CH - 6} textAnchor={i === 0 ? "start" : i === 3 ? "end" : "middle"} fontSize="11.5" fill="var(--color-muted)">
            {t ? `${t} th` : "Hari ini"}
          </text>
        ))}
        <path d={`${path("nominal")} L${x(maxT)} ${y(0)} L${x(0)} ${y(0)} Z`} fill="url(#ga)" />
        <path d={path("paid")} fill="none" stroke="var(--color-line)" strokeWidth="2.5" />
        <path d={path("real")} fill="none" stroke="var(--color-accent)" strokeWidth="2.6" strokeDasharray="6 5" />
        <path d={path("nominal")} fill="none" stroke="var(--color-grow)" strokeWidth="3.2" strokeLinejoin="round" />
        <line x1={x(mt)} x2={x(mt)} y1={TP} y2={CH - B} stroke="var(--color-ink)" strokeOpacity=".15" />
        <circle cx={x(mt)} cy={y(mv.real)} r="4" fill="#fff" stroke="var(--color-accent)" strokeWidth="2" />
        <circle cx={x(mt)} cy={y(mv.nominal)} r="5.5" fill="var(--color-grow)" stroke="#fff" strokeWidth="2.5" />
      </svg>
      {hover && (
        <div
          className="pointer-events-none absolute top-2 -translate-x-1/2 rounded-[10px] border-2 border-ink bg-white px-2.5 py-[7px] font-mono text-xs leading-[1.55] whitespace-nowrap shadow-hard-sm"
          style={{ left: hover.px }}
        >
          <span className="rounded-[3px] bg-yellow px-1 font-medium">Tahun {hover.t}</span>
          <br />
          Nominal {rp(mv.nominal)}
          <br />
          Riil {rp(mv.real)}
        </div>
      )}
    </div>
  );
}
