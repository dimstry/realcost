import type { Metadata } from "next";
import { INSTRUMENTS } from "@/config/rates";
import { formatRupiahShort as rp, parseRupiah } from "@/lib/calc";
import { DEFAULT_STATE, FREQ_SUFFIX, project, type CalcState } from "@/lib/state";
import { Brand } from "@/components/Brand";
import { Button, Card } from "@/components/ui";
import { HeroDemo } from "@/components/landing/HeroDemo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const calc = (patch: Partial<CalcState>) => {
  const s = { ...DEFAULT_STATE, ...patch };
  return { s, v: project(s), amt: parseRupiah(s.harga) };
};

const STRIP = [
  calc({ nama: "HP flagship", harga: "20jt" }),
  calc({ nama: "Kopi", harga: "30rb", mode: "recur", frek: "day" }),
  calc({ nama: "Liburan", harga: "25jt" }),
  calc({ nama: "Streaming", harga: "150rb", mode: "recur", frek: "month" }),
];

const PHONE = calc({ nama: "HP flagship", harga: "20jt" });

const STEPS = [
  { t: "Tulis pengeluarannya", d: "Sekali bayar seperti HP atau biaya nikah, atau rutin seperti kopi harian. Tulis sesukamu: 20jt, 1,5M, 30rb.", bg: "bg-yellow" },
  { t: "Pilih pembandingnya", d: "Deposito, reksa dana pasar uang, SBN ritel, atau indeks saham. Atur juga jangka waktu dan inflasinya.", bg: "bg-pink" },
  { t: "Lihat harga sebenarnya", d: "Nilai uang itu di masa depan, dan berapa daya belinya kalau diukur dengan uang hari ini.", bg: "bg-mint" },
];

const FEATURES = [
  { t: "Nominal dan riil", d: "Angka di masa depan, dan nilainya dalam daya beli hari ini setelah inflasi.", bg: "bg-yellow" },
  { t: "Banding pilihan", d: "Deposito, RDPU, SBN ritel, dan indeks saham berdampingan dalam satu layar.", bg: "bg-pink" },
  { t: "Dalam jam kerja", d: "Isi gajimu dan lihat berapa jam kerja yang kamu tukar untuk barang itu.", bg: "bg-mint" },
  { t: "Pengeluaran rutin", d: "Kopi, rokok, langganan. Hitung per hari, per minggu, atau per bulan.", bg: "bg-blue" },
  { t: "Siap dibagikan", d: "Salin ringkasan beserta link yang membuka hitungan yang sama, lengkap dengan gambar preview.", bg: "bg-orange" },
  { t: "Tanpa daftar", d: "Tanpa akun, tanpa database. Semua dihitung langsung di browsermu.", bg: "bg-white" },
];

const FAQ = [
  {
    q: "Apakah ini saran keuangan?",
    a: (
      <p>
        Bukan. RealCost adalah simulasi untuk membantu kamu menimbang keputusan belanja. Hasilnya memakai asumsi return tetap, padahal
        kenyataannya naik turun. Untuk keputusan investasi, bicarakan dengan perencana keuangan berlisensi.
      </p>
    ),
  },
  {
    q: "Dari mana angka return-nya?",
    a: (
      <>
        <p>Angka bawaan adalah asumsi rata-rata yang kami cek terakhir 27 Oktober 2026:</p>
        <ul className="my-2 list-disc pl-5">
          {INSTRUMENTS.map((i) => (
            <li key={i.id}>
              {i.name}: <span className="font-mono">{i.note}</span>
            </li>
          ))}
        </ul>
        <p>Kamu bisa mengubah return dan pajaknya sendiri di bagian &ldquo;Return, pajak, dan gaji&rdquo; di kalkulator.</p>
      </>
    ),
  },
  {
    q: "Kenapa ada nilai nominal dan riil?",
    a: (
      <p>
        Nilai nominal adalah jumlah rupiah di masa depan. Tapi harga barang juga naik, jadi Rp 1 M dua puluh tahun lagi tidak sama dengan
        Rp 1 M hari ini. Nilai riil mengoreksi inflasi supaya kamu bisa membandingkannya dengan uang di dompetmu sekarang.
      </p>
    ),
  },
  {
    q: "Apakah data saya disimpan?",
    a: (
      <p>
        Tidak. Semua hitungan berjalan di browsermu dan kami tidak punya database. Isianmu hanya ada di alamat halaman supaya bisa
        dibagikan. Saat link dibagikan, isian di link itu dipakai untuk membuat gambar preview, tapi tidak disimpan.
      </p>
    ),
  },
];

const h2 = "m-0 text-[clamp(28px,4.5vw,44px)] leading-[1.08] font-extrabold tracking-[-.035em] text-balance";

export default function Home() {
  return (
    <>
      <div className="mx-auto max-w-[1140px] px-4">
        <nav className="flex items-center justify-between gap-4 py-5" aria-label="Utama">
          <Brand />
          <div className="flex items-center gap-6">
            <ul className="hidden gap-6 text-sm font-semibold md:flex">
              <li><a className="underline-offset-4 hover:underline" href="#cara-kerja">Cara kerja</a></li>
              <li><a className="underline-offset-4 hover:underline" href="#fitur">Fitur</a></li>
              <li><a className="underline-offset-4 hover:underline" href="#faq">FAQ</a></li>
            </ul>
            <Button href="/hitung" variant="yellow" className="px-4! py-2! text-sm!">Coba gratis</Button>
          </div>
        </nav>

        <header className="grid items-center gap-10 pt-8 pb-16 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:pt-14 md:pb-24">
          <div>
            <h1 className="m-0 text-[clamp(40px,7vw,72px)] leading-[1.02] font-extrabold tracking-[-.045em] text-balance">
              Harga di label{" "}
              <strong className="inline-block -rotate-2 rounded-md border-brut bg-pink px-2 font-extrabold shadow-hard-sm">bukan</strong>{" "}
              harga yang kamu bayar.
            </h1>
            <p className="mt-6 max-w-[48ch] text-[17px] text-soft">
              Setiap rupiah yang dibelanjakan juga melepas pertumbuhannya. RealCost menunjukkan berapa nilai uang itu kalau diinvestasikan,
              supaya kamu memutuskan dengan sadar.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button href="/hitung" className="text-base">Hitung harga sebenarnya →</Button>
            </div>
            <p className="mt-4 text-[13px] font-semibold text-muted">Gratis · tanpa daftar · semua dihitung di browsermu</p>
          </div>
          <HeroDemo />
        </header>
      </div>

      <section aria-label="Contoh hitungan" className="border-y-[2.5px] border-ink bg-ink py-5 text-white">
        <ul className="mx-auto flex max-w-[1140px] flex-wrap justify-center gap-x-10 gap-y-3 px-4 text-[15px]">
          {STRIP.map(({ s, v, amt }) => (
            <li key={s.nama} className="whitespace-nowrap">
              {s.nama} {rp(amt)}{s.mode === "recur" ? FREQ_SUFFIX[s.frek] : ""} →{" "}
              <b className="font-extrabold text-yellow">{rp(v.nominal)}</b>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-center text-xs text-white/80">kalau ditaruh di deposito selama 20 tahun</p>
      </section>

      <main className="mx-auto flex max-w-[1140px] flex-col gap-24 px-4 py-20">
        <section className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className={h2}>Kita jago lihat harga. Tapi jarang lihat apa yang dilepas.</h2>
            <p className="mt-5 max-w-[52ch] text-base text-soft">
              Kita bisa membandingkan harga dua toko sampai ke ribuan rupiah. Tapi jarang ada yang bertanya: kalau uang ini tidak dipakai,
              jadi berapa nanti? Itu yang ekonom sebut opportunity cost, dan biasanya tidak tercetak di label harga.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="rotate-[-1.5deg]">
              <p className="m-0 text-xs font-bold tracking-[.06em] uppercase">Yang kita lihat</p>
              <p className="mt-2 mb-1 text-[clamp(26px,4vw,36px)] font-extrabold tracking-[-.03em]">{rp(PHONE.amt)}</p>
              <p className="m-0 text-sm text-muted">{PHONE.s.nama}</p>
            </Card>
            <Card className="rotate-[1.5deg] bg-mint!">
              <p className="m-0 text-xs font-bold tracking-[.06em] uppercase">Yang dilepas</p>
              <p className="mt-2 mb-1 text-[clamp(26px,4vw,36px)] font-extrabold tracking-[-.03em]">{rp(PHONE.v.nominal)}</p>
              <p className="m-0 text-sm text-soft">di deposito, {PHONE.s.th} tahun</p>
            </Card>
          </div>
        </section>

        <section id="cara-kerja" className="scroll-mt-6">
          <h2 className={h2}>Cara kerja</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((st, k) => (
              <li key={st.t}>
                <Card className="h-full">
                  <span className={`grid size-11 place-items-center rounded-md border-brut text-lg font-extrabold shadow-hard-xs ${st.bg}`}>{k + 1}</span>
                  <h3 className="mt-4 mb-2 text-xl font-extrabold tracking-[-.02em]">{st.t}</h3>
                  <p className="m-0 text-[14.5px] text-soft">{st.d}</p>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <section id="fitur" className="scroll-mt-6">
          <h2 className={h2}>Fitur</h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.t} className={`rounded-xl border-brut p-[22px] shadow-hard ${f.bg}`}>
                <h3 className="m-0 mb-2 text-lg font-extrabold tracking-[-.02em]">{f.t}</h3>
                <p className="m-0 text-[14.5px] text-soft">{f.d}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <Card className="bg-pink! p-8! md:p-12!">
            <p className="m-0 text-xs font-bold tracking-[.08em] uppercase">Catatan penting</p>
            <h2 className={`${h2} mt-3`}>Bukan untuk bikin kamu merasa bersalah.</h2>
            <p className="mt-5 max-w-[62ch] text-base text-soft">
              Uang memang untuk dipakai. Nikah, liburan, HP baru, atau kopi pagi bisa jadi keputusan yang tepat. RealCost hanya
              menunjukkan apa yang kamu tukar, supaya pilihanmu disengaja, bukan kebetulan. Kalau setelah melihat angkanya kamu tetap
              mau beli, itu juga jawaban yang sah.
            </p>
          </Card>
        </section>

        <section id="faq" className="scroll-mt-6">
          <h2 className={h2}>FAQ</h2>
          <div className="mt-8 flex flex-col gap-4">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-lg border-brut bg-white px-5 py-4 shadow-hard-sm">
                <summary className="flex items-center justify-between gap-4 text-base font-bold after:font-mono after:text-xl after:font-medium after:content-['+'] group-open:after:content-['−']">
                  {f.q}
                </summary>
                <div className="mt-3 text-[14.5px] text-soft [&_p]:m-0">{f.a}</div>
              </details>
            ))}
          </div>
        </section>

        <section>
          <div className="rounded-xl border-brut bg-blue px-6 py-12 text-center shadow-hard md:py-16">
            <h2 className={`${h2} mx-auto max-w-[20ch]`}>Sebelum checkout, cek dulu harga sebenarnya.</h2>
            <Button href="/hitung" className="mt-8 text-base">Hitung harga sebenarnya →</Button>
          </div>
        </section>
      </main>

      <footer className="border-t-[2.5px] border-ink bg-white">
        <div className="mx-auto flex max-w-[1140px] flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm">
          <Brand />
          <p className="m-0 text-muted">RealCost — Harga sebenarnya dari setiap belanja. Simulasi, bukan saran keuangan.</p>
        </div>
      </footer>
    </>
  );
}
