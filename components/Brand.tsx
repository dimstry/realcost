import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-[19px] font-extrabold tracking-[-.02em]">
      <span className="grid size-9 -rotate-6 place-items-center rounded-[10px] border-brut bg-yellow shadow-hard-sm">
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="#111" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 16l5-5 4 4 7-8" />
        </svg>
      </span>
      RealCost
    </Link>
  );
}
