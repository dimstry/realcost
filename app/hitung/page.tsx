import type { Metadata } from "next";
import { Suspense } from "react";
import { Calculator } from "@/components/calculator/Calculator";
import { formatRupiahShort as rp } from "@/lib/calc";
import { paramsFromRecord, parseState, project, serializeState, shareText } from "@/lib/state";

type Props = PageProps<"/hitung">;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const s = parseState(paramsFromRecord(await searchParams));
  const q = serializeState(s);
  const title = `${s.nama}: harga sebenarnya ${rp(project(s).real)}`;
  const description = shareText(s);
  const images = [{ url: `/api/og?${q}`, width: 1200, height: 630, alt: title }];
  return {
    title,
    description,
    alternates: { canonical: "/hitung" },
    openGraph: { title, description, url: `/hitung?${q}`, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

async function CalculatorFromParams({ searchParams }: Pick<Props, "searchParams">) {
  return <Calculator initial={parseState(paramsFromRecord(await searchParams))} />;
}

export default function Page({ searchParams }: Props) {
  return (
    <Suspense>
      <CalculatorFromParams searchParams={searchParams} />
    </Suspense>
  );
}
