import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "group/button relative inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-sm font-semibold leading-none",
    "transition-[background-color,color,border-color,box-shadow,transform,opacity] duration-200 ease-(--ease-out-quint)",
    "outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
    "disabled:pointer-events-none disabled:opacity-50",
    // The press is what makes a button feel physical: a short, deep dip that
    // resolves faster than the hover it interrupts.
    "hover:-translate-y-px active:translate-y-px active:duration-75 active:ease-out",
    "[&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default:
          "surface-primary shadow-[var(--shadow-primary)] hover:bg-[var(--primary-strong)] hover:shadow-[var(--shadow-primary-strong)] active:shadow-[var(--shadow-xs)]",
        secondary:
          "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-xs)] hover:border-[var(--border-strong)] hover:bg-[var(--muted)] hover:shadow-[var(--shadow-sm)]",
        ghost:
          "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
        quiet:
          "bg-[var(--accent-soft)] text-[var(--accent-foreground)] hover:bg-[var(--accent-soft-strong)] hover:shadow-[var(--shadow-sm)]",
        destructive:
          "surface-destructive shadow-[var(--shadow-sm)] hover:bg-[var(--destructive-strong)] hover:shadow-[var(--shadow-md)]",
        /**
         * Para botões que assentam numa superfície forte — dentro de um cartão
         * `.surface-primary`, por exemplo. Pega nas cores da superfície onde
         * está em vez de trazer as suas, que é como um botão verde acabava
         * invisível dentro de um cartão verde. Substituiu um condicional que
         * escolhia a variante consoante a cor do pai.
         */
        onSurface:
          "border border-[var(--border)] bg-[var(--surface-bg,var(--surface))] text-[var(--foreground)] hover:opacity-90",
      },
      size: {
        default: "h-11",
        sm: "h-9 min-h-9 gap-1.5 px-4 text-xs",
        lg: "h-13 min-h-13 px-7 text-[0.95rem]",
        icon: "size-11 min-h-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
