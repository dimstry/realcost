# RealCost

**Harga di label bukan harga yang kamu bayar.**

RealCost adalah kalkulator *opportunity cost*: ia menunjukkan berapa nilai sebuah pengeluaran kalau uangnya tidak dibelanjakan, tapi diinvestasikan. Tujuannya membantu orang lebih sadar sebelum membeli, bukan membuat mereka merasa bersalah.

Gratis, tanpa daftar, dan semua hitungan berjalan di browser.

## Kenapa saya membuat ini

Jujur, saya sendiri sering tidak berpikir soal harga yang sebenarnya. Saat membeli sesuatu, yang saya lihat hanya angka di label: Rp 20 juta untuk HP, Rp 30 ribu untuk segelas kopi. Kelihatannya sederhana, bayar lalu selesai.

Tapi uang itu sebenarnya bisa tumbuh kalau tidak dibelanjakan. Rp 20 juta yang disimpan di deposito selama 20 tahun bisa jadi sekitar Rp 43,8 juta. Kopi Rp 30 ribu setiap hari, kalau disisihkan, bisa jadi sekitar Rp 327 juta dalam 20 tahun. Angka-angka itu tidak pernah tercetak di label harga, jadi wajar kalau kita tidak memikirkannya.

Saya rasa bukan cuma saya yang begitu. Kemungkinan besar banyak orang juga tidak sadar berapa harga asli yang mereka bayar. Karena itu saya membuat RealCost: supaya siapa pun bisa melihat harga sebenarnya dalam beberapa detik sebelum memutuskan membeli.

Tujuannya bukan melarang belanja atau membuat orang merasa bersalah. Uang memang untuk dipakai. RealCost hanya membantu supaya setiap pilihan dibuat dengan sadar.

## Apa itu opportunity cost?

*Opportunity cost* (biaya peluang) adalah nilai dari pilihan terbaik yang kamu lepaskan saat memilih sesuatu. Setiap keputusan punya "harga tersembunyi" berupa hal lain yang tidak jadi kamu dapatkan.

Dalam urusan uang, saat kamu membelanjakan Rp 20 juta untuk sebuah HP, yang kamu lepaskan bukan cuma Rp 20 juta itu. Kamu juga melepas semua pertumbuhan yang bisa dihasilkan uang tersebut kalau diinvestasikan. Selisih itulah opportunity cost-nya.

| Pilihan                         | Hari ini   | 20 tahun lagi\*   |
| ------------------------------- | ---------- | ----------------- |
| Beli HP                         | Rp 20 jt   | HP lama, nilainya hampir nol |
| Simpan di deposito              | Rp 20 jt   | sekitar Rp 43,8 jt |

\* Deposito 5% per tahun, pajak bunga 20%, bunga diinvestasikan lagi.

RealCost menampilkan opportunity cost dalam dua angka:

- **Nominal**: jumlah rupiah di masa depan kalau uangnya diinvestasikan.
- **Riil**: nilai nominal itu setelah dikoreksi inflasi, alias berapa daya belinya kalau diukur dengan uang hari ini. Ini angka yang paling jujur untuk dibandingkan dengan isi dompetmu sekarang.

## Fitur

- **Nominal dan riil**: nilai di masa depan, dan daya belinya dalam uang hari ini setelah inflasi.
- **Banding pilihan**: deposito, reksa dana pasar uang, SBN ritel, dan indeks saham dalam satu layar.
- **Pengeluaran rutin**: hitung per hari, per minggu, atau per bulan.
- **Dalam jam kerja**: isi gaji bulanan dan lihat berapa jam kerja yang ditukar.
- **Siap dibagikan**: salin ringkasan beserta link. Link membuka hitungan yang sama dan tampil dengan gambar preview di WhatsApp atau X.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) + TypeScript strict
- Tailwind CSS v4
- Lexend dan DM Mono via `next/font/google`
- Vitest untuk unit test
- Gambar Open Graph dengan `next/og`
- Tanpa backend dan database

## Menjalankan

Butuh Node.js 20 atau lebih baru.

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

| Perintah        | Fungsi                       |
| --------------- | ---------------------------- |
| `npm run dev`   | Server development           |
| `npm run build` | Build produksi               |
| `npm start`     | Menjalankan hasil build      |
| `npm run lint`  | ESLint                       |
| `npm test`      | Unit test (Vitest)           |

## Struktur

```
app/
  page.tsx             landing page
  hitung/page.tsx      kalkulator, metadata dan og:image dari query string
  api/og/route.tsx     gambar Open Graph dinamis
  sitemap.ts, robots.ts
components/
  ui.tsx               Card, Pill, Button, Stat
  calculator/          Calculator, Chart
  landing/HeroDemo.tsx demo mini di hero
lib/
  calc.ts              fungsi murni: parseRupiah, format, proyeksi
  state.ts             parse/validasi query string, teks share
config/
  rates.ts             semua angka asumsi beserta sumbernya
assets/                font Lexend untuk gambar OG
```

## Rumus

```
return bersih = return × (1 − pajak)

sekali bayar:  nominal = jumlah × (1 + r_bersih)^tahun
rutin:         r_bulan = (1 + r_bersih)^(1/12) − 1,  n = tahun × 12
               nominal = per_bulan × ((1 + r_bulan)^n − 1) / r_bulan
               (kalau r_bulan = 0: per_bulan × n)

riil = nominal / (1 + inflasi)^tahun
```

Pengeluaran rutin dikonversi ke per bulan: per hari ×30, per minggu ×52/12.

## Asumsi

Semua angka asumsi ada di [`config/rates.ts`](config/rates.ts), masing-masing dengan sumber dan tanggal cek terakhir. Perbarui file itu saja kalau angkanya berubah.

| Pembanding            | Return | Pajak |
| --------------------- | ------ | ----- |
| Disimpan saja         | 0%     | 0%    |
| Deposito              | 5%     | 20%   |
| Reksa dana pasar uang | 4,5%   | 0%    |
| SBN ritel             | 6,3%   | 10%   |
| Indeks saham          | 10%    | 0% (sebelum biaya) |

Preset inflasi: Target BI 2,5%, Terkini 3,3% (default, BPS September 2026: 3,28%), Pesimis 5%, atau atur sendiri.

## Parameter URL

State kalkulator disimpan di query string supaya bisa dibagikan, contohnya:

```
/hitung?nama=Biaya+nikah&harga=500jt&mode=once&inst=depo&th=20&inf=3.3
```

| Parameter | Nilai                                          | Default       |
| --------- | ---------------------------------------------- | ------------- |
| `nama`    | teks, maks. 40 karakter                         | `Biaya nikah` |
| `harga`   | `500jt`, `1,5M`, `30rb`, `1.500.000`, …        | `500jt`       |
| `mode`    | `once` atau `recur`                            | `once`        |
| `frek`    | `day`, `week`, `month` (hanya untuk `recur`)   | `month`       |
| `inst`    | `kas`, `depo`, `rdpu`, `sbn`, `saham`, `custom` | `depo`        |
| `ret`     | 0–50, hanya untuk `inst=custom`                | 5             |
| `pajak`   | 0–100, hanya untuk `inst=custom`               | 20            |
| `th`      | bilangan bulat 1–30                            | 20            |
| `inf`     | 0–30                                           | 3.3           |
| `gaji`    | format sama dengan `harga`                     | kosong        |

Nilai yang tidak valid jatuh ke default.

## Deploy

Siap di-deploy ke [Vercel](https://vercel.com) tanpa konfigurasi tambahan. Opsional:

| Variabel               | Fungsi                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | URL utama untuk metadata, sitemap, dan gambar OG. Tanpa ini, dipakai domain produksi Vercel otomatis.   |

## Catatan

RealCost adalah simulasi dengan return tetap tiap tahun dan bunga majemuk. Return sebenarnya naik turun, dan instrumen seperti saham bisa turun nilainya. Gunakan untuk menimbang keputusan, **bukan sebagai saran keuangan**.
