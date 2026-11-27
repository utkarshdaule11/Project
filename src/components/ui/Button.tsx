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
    "inline-flex items-center justify-center font-sans font-semibold rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9A15C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#091522] disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs tracking-wide",
    md: "px-5 py-2.5 text-sm tracking-wide",
    lg: "px-7 py-3.5 text-base tracking-wide font-bold",
  }[size];

  const variantStyles = {
    primary:
      "bg-[#E9A15C] text-[#091522] font-bold hover:bg-[#F2BC85] shadow-md hover:shadow-lg",
    secondary:
      "bg-[#101F2E] text-[#F2EBDD] hover:bg-[#142638] border border-[#D9B88F]/30 shadow-md",
    outline:
      "border border-[#D9B88F] text-[#D9B88F] hover:bg-[#D9B88F] hover:text-[#091522]",
    saffron:
      "bg-[#E9A15C] text-[#091522] font-bold hover:bg-[#F2BC85] shadow-md hover:shadow-lg",
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
