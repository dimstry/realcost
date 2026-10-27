import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { formatRupiahShort as rp, parseRupiah } from "@/lib/calc";
import { FREQ_SUFFIX, instrumentName, parseState, project } from "@/lib/state";

const [semibold, extrabold] = await Promise.all([
  readFile(join(process.cwd(), "assets/Lexend-600.ttf")),
  readFile(join(process.cwd(), "assets/Lexend-800.ttf")),
]);

const INK = "#111";
const border = `5px solid ${INK}`;

export function GET(req: NextRequest) {
  const s = parseState(req.nextUrl.searchParams);
  const v = project(s);
  const amt = parseRupiah(s.harga);
  const from = s.mode === "once" ? `dari ${rp(amt)} hari ini` : `dari ${rp(amt)}${FREQ_SUFFIX[s.frek]}, total ${rp(v.paid)}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "48px 64px",
          backgroundColor: "#fff6dc",
          backgroundImage: "radial-gradient(#e7dcbc 2.4px, transparent 2.4px)",
          backgroundSize: "44px 44px",
          fontFamily: "Lexend",
          color: INK,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 38, fontWeight: 800 }}>
          <div
            style={{
              display: "flex",
              width: 60,
              height: 60,
              borderRadius: 16,
              border,
              background: "#ffd23f",
              boxShadow: `5px 5px 0 ${INK}`,
              transform: "rotate(-6deg)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 16l5-5 4 4 7-8" />
            </svg>
          </div>
          RealCost
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 36,
            padding: "36px 44px",
            background: "#ffd23f",
            border,
            borderRadius: 28,
            boxShadow: `10px 10px 0 ${INK}`,
          }}
        >
          <div style={{ display: "flex" }}>
            <div style={{ display: "flex", fontSize: 28, fontWeight: 600, background: "#fff", border: `3px solid ${INK}`, borderRadius: 12, padding: "4px 16px" }}>
              {`${s.nama} · ${instrumentName(s) ?? "pilihanmu"} · ${s.th} tahun`}
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 150, fontWeight: 800, letterSpacing: -6, lineHeight: 1, marginTop: 22 }}>{rp(v.nominal)}</div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600, marginTop: 14 }}>{from}</div>
        </div>

        <div style={{ display: "flex", gap: 24, marginTop: 30 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 600, background: "#ff8fd6", border, borderRadius: 18, padding: "10px 22px", boxShadow: `5px 5px 0 ${INK}` }}>
            Daya beli hari ini
            <span style={{ fontWeight: 800 }}>{rp(v.real)}</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Lexend", data: semibold, weight: 600, style: "normal" },
        { name: "Lexend", data: extrabold, weight: 800, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=86400" },
    },
  );
}
