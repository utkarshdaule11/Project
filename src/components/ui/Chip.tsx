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
    primary: "bg-[#FBF5EB] text-[#8C6226] border border-[#E8D5B3]",
    saffron: "bg-[#12313A] text-[#F9F7F6] font-bold border border-[#12313A]",
    green: "bg-[#EBF4F4] text-[#12313A] border border-[#C3D8D8]",
    subtle: "bg-[#F7F3EA] text-[#445A62] border border-[#E3DAC9]",
  }[variant];

  return (
    <span className={`${base} ${variantStyles} ${className}`}>
      {children}
      {label}
    </span>
  );
}
