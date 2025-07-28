import React from "react";
import { cn } from "@/utils/cn";

const TextArea = React.forwardRef(({
  className,
  error,
  ...props
}, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-colors",
        "placeholder:text-gray-500",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-none",
        error && "border-error focus:ring-error",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

TextArea.displayName = "TextArea";

export default TextArea;