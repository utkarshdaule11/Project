import React from "react";

export interface SectionHeadingProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  alignment?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  kicker,
  title,
  subtitle,
  alignment = "center",
  className = "",
}: SectionHeadingProps) {
  const alignClass = alignment === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <div className={`flex flex-col ${alignClass} ${className}`}>
      {kicker && (
        <span className="font-sans text-xs font-bold uppercase tracking-widest text-primary">
          {kicker}
        </span>
      )}
      <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-text sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-text-muted sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
