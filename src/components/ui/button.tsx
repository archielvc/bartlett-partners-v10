import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs uppercase tracking-[0.2em] font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer font-['Figtree']",
  {
    variants: {
      variant: {
        default: "bg-[#1A2551] text-white border border-[#1A2551] rounded-md shadow-sm hover:bg-[#1A2551]/90",
        destructive:
          "bg-destructive text-white rounded-md focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-[#1A2551] bg-white text-[#1A2551] rounded-md hover:bg-slate-50 transition-colors",
        secondary:
          "bg-[#F5F5F5] text-[#1A2551] rounded-md hover:bg-[#EAEAEA]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground rounded-md",
        link: "text-primary underline-offset-4 hover:underline",
        nav: "bg-transparent text-[#1A2551] rounded-md hover:bg-[#F5F5F5]",
        "nav-dropdown": "bg-white border border-[#1A2551]/10 text-[#1A2551] rounded-md relative overflow-hidden group hover:bg-slate-50", // Block style
        hero: "bg-white/10 border border-white/20 text-white backdrop-blur-md rounded-md hover:bg-white/20",
        favorite: "bg-[#DC2626] text-white border border-[#DC2626] rounded-md hover:bg-[#DC2626]/90",
      },
      size: {
        default: "h-10 px-4 py-2 w-48", // Standardized to w-48 (192px)
        sm: "h-9 px-3 w-auto min-w-[120px]", // Smaller but adaptable
        lg: "h-11 px-8 w-56", // Larger width
        nav: "h-10 px-4", // Sleek nav button
        "nav-dropdown": "h-12 w-full justify-center", // Block style dropdown
        icon: "size-10 rounded-md w-10", // Explicit width for icons to override default
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);


function Button(
  {
    className,
    variant,
    size,
    asChild = false,
    children,
    showCircle = false,
    premium = false,
    ...props
  }: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
      showCircle?: boolean;
      premium?: boolean;
    },
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  const Comp = asChild ? Slot : "button";

  // When asChild is true, we must pass children directly - Slot expects a single child
  if (asChild) {
    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        style={{ fontFamily: "'Figtree', sans-serif" }}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      style={{ fontFamily: "'Figtree', sans-serif" }}
      {...props}
    >
      {premium ? (
        <span className="premium-hover !inline-flex items-center justify-center gap-2">
          {children}
        </span>
      ) : (
        children
      )}
      {showCircle && (variant === "default" || variant === "nav") && (
        <span className={cn(
          "ml-1 w-2 h-2 rounded-none inline-block",
          variant === "nav" ? "bg-black" : "bg-white"
        )} />
      )}
    </Comp>
  );
}

const ButtonWithRef = React.forwardRef(Button);

export { ButtonWithRef as Button, buttonVariants };