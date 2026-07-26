import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid size-9 shrink-0 place-items-center rounded-[13px] bg-[var(--primary)] shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)]",
        className,
      )}
    >
      <span className="absolute h-4 w-1.5 -translate-x-1 rotate-[18deg] rounded-full bg-[var(--accent)]" />
      <span className="absolute h-3.5 w-1.5 translate-x-1 -rotate-[18deg] rounded-full bg-white/90" />
    </span>
  );
}
