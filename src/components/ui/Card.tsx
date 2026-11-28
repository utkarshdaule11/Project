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
    ? "transition-all duration-300 hover:-translate-y-1 hover:border-[#D6A15D] hover:shadow-lg"
    : "";

  return (
    <div
      className={`rounded-2xl border border-[#E3DAC9] bg-white p-6 shadow-sm ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
}
