import React from "react";

export interface ChipProps {
  label: string;
  variant?: "primary" | "saffron" | "green" | "subtle";
  className?: string;
  children?: React.ReactNode;
}

export function Chip({
  label,
  variant = "primary",
  className = "",
  children,
}: ChipProps) {
  const base =
    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase select-none";

  const variantStyles = {
    primary: "bg-primary/10 text-primary-dark border border-primary/25",
    saffron: "bg-accent-saffron/20 text-accent-saffron-dark border border-accent-saffron/30",
    green: "bg-accent-green/15 text-accent-green border border-accent-green/25",
    subtle: "bg-surface-subtle text-text-muted border border-border",
  }[variant];

  return (
    <span className={`${base} ${variantStyles} ${className}`}>
      {children}
      {label}
    </span>
  );
}
