import React from "react";
import { cn } from "@/utils/cn";

const Badge = React.forwardRef(({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variants = {
    default: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
    outline: "border border-gray-200 text-gray-700"
  };
  
  const sizes = {
    sm: "px-2 py-1 text-xs rounded-md",
    md: "px-2.5 py-1 text-sm rounded-md",
    lg: "px-3 py-1.5 text-sm rounded-lg"
  };

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

Badge.displayName = "Badge";

export default Badge;