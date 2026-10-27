import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("rounded-xl border-brut bg-white p-[22px] shadow-hard", className)} {...props} />;
}

type PillProps = ComponentProps<"button"> & { pressed?: boolean; bg?: string };

/** Tombol kecil membulat. `pressed` → aria-pressed + gaya aktif hitam. */
export function Pill({ pressed, bg = "bg-white", className, ...props }: PillProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cx(
        "rounded-full border-2 border-ink px-3 py-1.5 text-[13.5px] font-semibold whitespace-nowrap transition hover:-translate-px hover:shadow-hard-xs",
        pressed ? "bg-ink text-white" : bg,
        className,
      )}
      {...props}
    />
  );
}

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-md border-brut px-5 py-3 text-[15px] font-bold transition-transform duration-75 hover:-translate-px active:translate-[3px]";
const btnVariant = {
  // bayangan berlapis: mint lalu garis hitam, seperti tombol salin di prototipe
  dark: "bg-ink text-white shadow-[4px_4px_0_var(--color-mint),4px_4px_0_2.5px_#111] active:shadow-[1px_1px_0_var(--color-mint),1px_1px_0_2.5px_#111]",
  light: "bg-white text-ink shadow-hard active:shadow-hard-xs",
  yellow: "bg-yellow text-ink shadow-hard active:shadow-hard-xs",
};

type ButtonProps = { variant?: keyof typeof btnVariant; className?: string; children: ReactNode } & (
  | ({ href: string } & Omit<ComponentProps<typeof Link>, "href" | "className">)
  | ({ href?: undefined } & Omit<ComponentProps<"button">, "className">)
);

/** `href` → Link, selain itu <button>. */
export function Button({ variant = "dark", className, ...props }: ButtonProps) {
  const cls = cx(btnBase, btnVariant[variant], className);
  if (props.href !== undefined) return <Link {...props} className={cls} />;
  const { href: _ignored, ...rest } = props;
  void _ignored;
  return <button type="button" {...rest} className={cls} />;
}

type StatProps = { label: ReactNode; value: ReactNode; detail?: ReactNode; className?: string };

export function Stat({ label, value, detail, className }: StatProps) {
  return (
    <div className={cx("flex min-w-0 flex-col gap-0.5 rounded-md border-2 border-ink bg-white px-3.5 py-3", className)}>
      <span className="text-[11.5px] font-bold tracking-[.05em] uppercase">{label}</span>
      <span className="text-[22px] font-extrabold tracking-[-.02em]">{value}</span>
      {detail && <span className="text-xs text-soft">{detail}</span>}
    </div>
  );
}
