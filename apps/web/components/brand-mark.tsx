import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        // The two strokes lean apart on hover — the "interval" the brand is
        // named for, made briefly literal.
        "group/brand ease-(--ease-spring) relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-[13px] bg-[var(--primary)] shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)] transition-transform duration-500 hover:scale-[1.06]",
        className,
      )}
    >
      <span className="ease-(--ease-out-quint) absolute h-4 w-1.5 -translate-x-1 rotate-[18deg] rounded-full bg-[var(--accent)] transition-transform duration-500 group-hover/brand:-translate-x-1.5 group-hover/brand:rotate-[26deg]" />
      <span className="ease-(--ease-out-quint) absolute h-3.5 w-1.5 translate-x-1 -rotate-[18deg] rounded-full bg-white/90 transition-transform duration-500 group-hover/brand:translate-x-1.5 group-hover/brand:-rotate-[26deg]" />
    </span>
  );
}
