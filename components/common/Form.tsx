"use client";

import { useForm, FormProvider, UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface FormProps<T extends z.ZodType> {
  schema: T;
  onSubmit: (data: z.infer<T>) => void | Promise<void>;
  children: React.ReactNode;
  defaultValues?: UseFormProps<z.infer<T>>["defaultValues"];
  className?: string;
}

export default function Form<T extends z.ZodType>({
  schema,
  onSubmit,
  children,
  defaultValues,
  className,
}: FormProps<T>) {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={className}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  className?: string;
}

export function FormField({
  name,
  label,
  type = "text",
  placeholder,
  className,
}: FormFieldProps) {
  const {
    register,
    formState: { errors },
  } = useForm();

  const error = errors[name];

  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        {...register(name)}
        type={type}
        id={name}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error.message?.toString() || "This field is required"}
        </p>
      )}
    </div>
  );
}
