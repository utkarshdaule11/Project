import React, { forwardRef } from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "saffron";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    className = "",
    children,
    ...props
  },
  ref
) {
  const baseStyles =
    "inline-flex items-center justify-center font-sans font-semibold rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D6A15D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F9F7F6] disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs tracking-wide",
    md: "px-5 py-2.5 text-sm tracking-wide",
    lg: "px-7 py-3.5 text-base tracking-wide font-bold",
  }[size];

  const variantStyles = {
    primary:
      "bg-[#D6A15D] text-[#12313A] font-bold hover:bg-[#C48C46] shadow-md hover:shadow-lg",
    secondary:
      "bg-[#12313A] text-[#F9F7F6] hover:bg-[#0D252C] border border-[#12313A] shadow-sm",
    outline:
      "border border-[#12313A] text-[#12313A] hover:bg-[#12313A] hover:text-[#F9F7F6]",
    saffron:
      "bg-[#D6A15D] text-[#12313A] font-bold hover:bg-[#C48C46] shadow-md hover:shadow-lg",
  }[variant];

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
