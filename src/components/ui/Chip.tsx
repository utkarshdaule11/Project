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
    primary: "bg-[#E9A15C]/15 text-[#E9A15C] border border-[#E9A15C]/30",
    saffron: "bg-[#E9A15C] text-[#091522] font-bold border border-[#E9A15C]",
    green: "bg-[#294A3B]/50 text-[#D9B88F] border border-[#294A3B]",
    subtle: "bg-[#142638] text-[#A2B3C4] border border-[#D9B88F]/15",
  }[variant];

  return (
    <span className={`${base} ${variantStyles} ${className}`}>
      {children}
      {label}
    </span>
  );
}
