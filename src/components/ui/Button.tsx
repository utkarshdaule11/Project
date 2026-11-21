import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "saffron";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-sans font-semibold rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs tracking-wide",
    md: "px-5 py-2.5 text-sm tracking-wide",
    lg: "px-7 py-3 text-base tracking-wide",
  }[size];

  const variantStyles = {
    primary:
      "bg-primary-dark text-white hover:bg-primary shadow-xs hover:shadow-sm",
    secondary:
      "bg-surface text-text hover:bg-surface-subtle border border-border shadow-xs",
    outline:
      "border border-primary-dark text-primary-dark hover:bg-primary-dark hover:text-white",
    saffron:
      "bg-accent-saffron text-text font-bold hover:bg-accent-saffron/90 shadow-xs hover:shadow-sm",
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
