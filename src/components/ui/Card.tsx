import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function Card({
  children,
  className = "",
  hoverEffect = false,
}: CardProps) {
  const hoverClass = hoverEffect
    ? "transition-all duration-300 hover:-translate-y-1 hover:border-[#E9A15C] hover:shadow-2xl"
    : "";

  return (
    <div
      className={`rounded-2xl border border-[#D9B88F]/20 bg-[#101F2E] p-6 shadow-xl ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
}
