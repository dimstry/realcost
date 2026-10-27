import { describe, expect, it } from "vitest";
import { DEFAULT_STATE, parseState, serializeState } from "./state";

const parse = (q: string) => parseState(new URLSearchParams(q));

describe("parseState", () => {
  it("membaca contoh link", () => {
    const s = parse("nama=Biaya+nikah&harga=500jt&mode=once&inst=depo&th=20&inf=3.3");
    expect(s).toEqual(DEFAULT_STATE);
  });

  it("nilai tidak valid jatuh ke default", () => {
    const s = parse("harga=abc&mode=x&frek=year&inst=crypto&th=99&inf=-1&gaji=nol&ret=500");
    expect(s).toEqual(DEFAULT_STATE);
    expect(parse("th=2.5").th).toBe(20);
    expect(parse("inf=NaN").inf).toBe(3.3);
  });

  it("return/pajak custom hanya dipakai kalau inst=custom", () => {
    expect(parse("inst=custom&ret=8&pajak=15")).toMatchObject({ inst: "custom", ret: 8, pajak: 15 });
    expect(parse("inst=sbn&ret=8")).toMatchObject({ inst: "sbn", ret: 6.3, pajak: 10 });
  });

  it("serialize → parse kembali sama", () => {
    const s = { ...DEFAULT_STATE, mode: "recur" as const, frek: "day" as const, harga: "30rb", nama: "Kopi & teh", inst: "custom", ret: 7, pajak: 0, gaji: "8jt" };
    expect(parse(serializeState(s))).toEqual(s);
  });
});
