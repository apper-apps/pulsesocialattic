import React from "react";
import { cn } from "@/utils/cn";

const Avatar = React.forwardRef(({
  className,
  src,
  alt,
  fallback,
  size = "md",
  ...props
}, ref) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
    "2xl": "w-20 h-20 text-xl"
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary to-secondary",
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {src ? (
        <img
          className="aspect-square h-full w-full object-cover"
          src={src}
          alt={alt || "Avatar"}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-white font-medium">
          {fallback || getInitials(alt)}
        </div>
      )}
    </div>
  );
});

Avatar.displayName = "Avatar";

export default Avatar;