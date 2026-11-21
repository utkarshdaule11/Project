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
    ? "transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    : "";

  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-6 shadow-sm ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
}
