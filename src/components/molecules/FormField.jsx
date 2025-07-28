import React from "react";
import { cn } from "@/utils/cn";
import Input from "@/components/atoms/Input";
import TextArea from "@/components/atoms/TextArea";

const FormField = ({
  label,
  type = "text",
  error,
  helperText,
  required,
  className,
  ...props
}) => {
  const Component = type === "textarea" ? TextArea : Input;
  const id = props.id || props.name;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <Component
        id={id}
        type={type}
        error={error}
        {...props}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default FormField;